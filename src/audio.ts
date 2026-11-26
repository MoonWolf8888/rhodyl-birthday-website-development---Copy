/* One persistent audio controller for the whole experience.
   Music starts from the START gesture and never restarts because a window
   opens or a scene changes. The soundtrack is original synthesized music
   (see music.ts); your own MP3s join the playlist automatically if present. */
import { useEffect, useState } from "react";
import { MUSIC } from "./config";
import { makeKit, Session, TRACKS, type Kit, type Track } from "./music";

export type SfxName = "click" | "move" | "error" | "success" | "unlock" | "startup" | "page" | "launch" | "pop" | "puff";
export interface PlaylistItem { id: string; title: string; mood: string; kind: "synth" | "mp3"; finale?: boolean }
export interface AudioState {
  playing: boolean; muted: boolean; volume: number; title: string; mood: string;
  mode: "idle" | "synth" | "file"; duration: number; finale: boolean; trackId: string; playlist: PlaylistItem[];
}

const FILE = "file", FILE_FINALE = "file-finale";
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const loopLen = (t: Track) => (t.chords.length * t.steps * 60) / t.bpm / 4;
const synthTrack = (id: string) => TRACKS.find((t) => t.id === id) ?? TRACKS[0];

class Engine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private kit: Kit | null = null;
  private el: HTMLAudioElement | null = null;
  private have: Record<string, boolean> = {};   // which optional MP3s were found

  private trackId = synthTrack(MUSIC.startTrack).id;
  private desktopId = this.trackId;              // what to come back to after the finale
  private desktopOffset = 0;
  private inFinale = false;
  private started = false;
  private wantPlay = false;                      // the listener's intent (play vs. pause)
  private muted = false;
  private volume = MUSIC.volume;
  private duckVal = 1;
  private fadeK = 1;

  private session: Session | null = null;
  private timer: number | null = null;
  private stepIdx = 0;
  private nextT = 0;
  private anchor = 0;   // audio time at which loop position 0 fell
  private offset = 0;   // paused position, seconds
  private gen = 0;
  private lastPop = 0;
  private listeners = new Set<() => void>();

  private ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const c = (this.ctx = new AC());
      this.master = c.createGain(); this.master.connect(c.destination);
      this.musicBus = c.createGain(); this.musicBus.connect(this.master);
      this.sfxBus = c.createGain(); this.sfxBus.gain.value = 0.9; this.sfxBus.connect(this.master);
      this.kit = makeKit(c);
      this.applyGains();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }
  private applyGains(fast = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, k = fast ? 0.04 : 0.18;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, k);
    this.musicBus.gain.setTargetAtTime(this.volume * this.duckVal * this.fadeK, t, k);
  }
  /* fade the whole music bus (used to move between desktop and finale without stacking songs) */
  private busTo(k: number, secs: number) {
    if (!this.ctx) return;
    this.fadeK = k;
    const g = this.musicBus.gain, t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(this.volume * this.duckVal * k, t, secs / 4);
  }
  private notify() { this.listeners.forEach((l) => l()); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }

  private isFile(id: string) { return id === FILE || id === FILE_FINALE; }
  private fileSrc(id: string) { return id === FILE ? MUSIC.file : MUSIC.finaleFile; }

  playlist(): PlaylistItem[] {
    const out: PlaylistItem[] = [];
    if (this.have[FILE]) out.push({ id: FILE, title: MUSIC.fileTitle, mood: "your mp3", kind: "mp3" });
    for (const t of TRACKS) out.push({ id: t.id, title: t.title, mood: t.mood, kind: "synth", finale: t.finale });
    if (this.have[FILE_FINALE]) out.push({ id: FILE_FINALE, title: MUSIC.finaleFileTitle, mood: "your finale mp3", kind: "mp3", finale: true });
    return out;
  }
  getState(): AudioState {
    const list = this.playlist();
    const cur = list.find((p) => p.id === this.trackId) ?? list[0];
    const file = this.isFile(this.trackId);
    return {
      playing: this.started && this.wantPlay, muted: this.muted, volume: this.volume,
      title: cur.title, mood: cur.mood, trackId: cur.id, playlist: list, finale: this.inFinale,
      mode: !this.started ? "idle" : file ? "file" : "synth",
      duration: file ? (this.el?.duration || 0) : loopLen(synthTrack(this.trackId)),
    };
  }
  position(): number {
    if (this.isFile(this.trackId)) return this.el?.currentTime || 0;
    const s = this.session;
    if (s && this.ctx) { const d = s.loopDur; return (((this.ctx.currentTime - this.anchor) % d) + d) % d; }
    return this.offset;
  }

  /* Called from the START click. If birthday.mp3 exists it plays; otherwise the built-in soundtrack does. */
  start() {
    this.ensure();
    if (this.started) return;
    this.started = true; this.wantPlay = true;
    this.sfx("startup");
    const c = this.ctx!, el = (this.el = new Audio());
    el.loop = true; el.preload = "auto";
    try { c.createMediaElementSource(el).connect(this.musicBus); } catch { /* the element plays directly instead */ }
    let settled = false;
    const useSynth = () => {
      if (settled) return;
      settled = true;
      el.pause(); el.removeAttribute("src"); el.load();
      this.have[FILE] = false;
      if (this.wantPlay) this.begin(0, 0.9);
      this.notify();
    };
    el.src = MUSIC.file;
    el.play().then(() => {
      if (settled) { el.pause(); return; }
      settled = true;
      this.have[FILE] = true; this.trackId = this.desktopId = FILE;
      this.notify();
    }).catch(useSynth);
    window.setTimeout(useSynth, 1500);
    void this.probe(MUSIC.finaleFile).then((ok) => { this.have[FILE_FINALE] = ok; this.notify(); });
    this.notify();
  }
  private probe(src: string): Promise<boolean> {
    return new Promise((res) => {
      const a = new Audio(); a.preload = "auto"; a.src = src;
      const to = window.setTimeout(() => res(false), 2500);
      a.addEventListener("canplaythrough", () => { clearTimeout(to); res(true); }, { once: true });
      a.addEventListener("error", () => { clearTimeout(to); res(false); }, { once: true });
    });
  }

  /* start the current track from `from` seconds */
  private begin(from = 0, fadeIn = 0.4) {
    if (!this.ctx || !this.kit) return;
    this.halt(0.2);
    const id = this.trackId;
    if (this.isFile(id)) {
      const el = this.el;
      if (!el) return;
      const src = this.fileSrc(id);
      if (!el.src.endsWith(src)) el.src = src;
      try { el.currentTime = from; } catch { /* not seekable yet */ }
      void el.play().catch(() => { this.wantPlay = false; this.notify(); }); // blocked: the Play button still works
      return;
    }
    const s = (this.session = new Session(this.ctx, synthTrack(id), this.musicBus, this.kit));
    const n = Math.floor(from / s.stepDur) % s.loopSteps;
    this.stepIdx = n;
    this.nextT = this.ctx.currentTime + 0.08;
    this.anchor = this.nextT - n * s.stepDur;
    s.fade(1, fadeIn);
    this.timer = window.setInterval(() => this.pumpSteps(), 50);
    this.pumpSteps();
  }
  /* stop whatever is sounding and remember where it was */
  private halt(fade = 0.2) {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
    const s = this.session;
    if (s) { this.offset = this.position(); s.fade(0, fade); s.dispose(fade + 0.5); this.session = null; }
    const el = this.el;
    if (el && !el.paused && this.isFile(this.trackId)) { this.offset = el.currentTime; el.pause(); }
  }
  private pumpSteps() {
    const s = this.session;
    if (!s || !this.ctx) return;
    const now = this.ctx.currentTime, ahead = document.hidden ? 1.6 : 0.4;
    if (this.nextT < now - 0.2) { // the timer was starved (hidden tab, sleep): rejoin the beat instead of catching up
      const missed = Math.ceil((now + 0.05 - this.nextT) / s.stepDur);
      this.stepIdx += missed; this.nextT += missed * s.stepDur;
    }
    while (this.nextT < now + ahead) { s.step(this.stepIdx, this.nextT); this.stepIdx++; this.nextT += s.stepDur; }
  }

  playPause() {
    this.ensure();
    if (!this.started) { this.start(); return; }
    if (this.wantPlay) { this.wantPlay = false; this.halt(0.12); }
    else { this.wantPlay = true; this.begin(this.offset, 0.15); }
    this.notify();
  }
  seek(t: number) {
    if (this.isFile(this.trackId)) { if (this.el) { try { this.el.currentTime = t; } catch { /* not seekable yet */ } } }
    else if (this.session) this.begin(t, 0.08);
    else this.offset = t;
    this.notify();
  }
  /* choose a playlist entry and play it */
  select(id: string) {
    this.ensure();
    if (!this.playlist().some((p) => p.id === id)) return;
    this.halt(0.25);
    this.started = true; this.wantPlay = true;
    this.trackId = id; this.offset = 0;
    if (!this.inFinale) { this.desktopId = id; this.desktopOffset = 0; }
    this.begin(0, 0.3);
    this.notify();
  }
  skip(dir: 1 | -1) {
    const list = this.playlist();
    const i = list.findIndex((p) => p.id === this.trackId);
    this.select(list[(i + dir + list.length) % list.length].id);
  }
  setVolume(v: number) { this.volume = Math.min(1, Math.max(0, v)); this.applyGains(); this.notify(); }
  toggleMute() { this.ensure(); this.muted = !this.muted; this.applyGains(true); this.notify(); }
  duck(x: number) { this.duckVal = x; this.applyGains(); }

  /* Fade out, swap to the fireworks theme, fade in. One song at a time. */
  async toFinale() {
    this.ensure();
    if (this.inFinale) return;
    this.inFinale = true;
    const my = ++this.gen;
    this.busTo(0, 0.9);
    await wait(900);
    if (my !== this.gen) return;
    this.halt(0.05);
    this.desktopOffset = this.offset;
    this.trackId = this.have[FILE_FINALE] ? FILE_FINALE : synthTrack(MUSIC.finaleTrack).id;
    this.offset = 0;
    if (this.wantPlay) this.begin(0, 0.1);
    this.busTo(1, 1.6);
    this.notify();
  }
  async toDesktop() {
    if (!this.inFinale) return;
    this.inFinale = false;
    const my = ++this.gen;
    this.busTo(0, 0.7);
    await wait(700);
    if (my !== this.gen) return;
    const switched = this.trackId !== this.desktopId;
    this.halt(0.05);
    if (switched) { this.trackId = this.desktopId; this.offset = this.desktopOffset; }
    if (this.wantPlay) this.begin(this.offset, 0.1);
    this.busTo(1, 1.2);
    this.notify();
  }

  /* ── interface sounds: all synthesized, all obey mute and MUSIC.sfx ── */
  sfx(name: SfxName) {
    if (!this.ctx || !this.kit || this.muted || !MUSIC.sfx) return;
    const c = this.ctx, t = c.currentTime, noiseBuf = this.kit.noise;
    const env = (peak: number, a: number, d: number, at = t) => {
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(peak, at + a);
      g.gain.exponentialRampToValueAtTime(0.0004, at + a + d);
      g.connect(this.sfxBus); return g;
    };
    const tone = (type: OscillatorType, f0: number, f1: number, peak: number, a: number, d: number, at = t) => {
      const o = c.createOscillator(); o.type = type;
      o.frequency.setValueAtTime(f0, at);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + a + d);
      o.connect(env(peak, a, d, at)); o.start(at); o.stop(at + a + d + 0.05);
    };
    const noise = (peak: number, d: number, f: number, type: BiquadFilterType = "lowpass", at = t) => {
      const s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.value = f;
      s.connect(flt); flt.connect(env(peak, 0.012, d, at));
      s.start(at); s.stop(at + d + 0.1);
    };
    switch (name) {
      case "click": tone("square", 900, 640, 0.05, 0.005, 0.05); break;
      case "move": tone("square", 520, 780, 0.045, 0.006, 0.055); tone("sine", 1040, 900, 0.025, 0.004, 0.045, t + 0.025); break;
      case "error": tone("square", 220, 130, 0.09, 0.01, 0.22); tone("square", 180, 100, 0.08, 0.01, 0.26, t + 0.16); break;
      case "success": [67, 71, 74, 79].forEach((m, i) => tone("triangle", hz(m), hz(m), 0.09, 0.01, 0.3, t + i * 0.09)); break;
      case "unlock": [72, 76, 79, 84].forEach((m, i) => tone("sine", hz(m), hz(m), 0.1, 0.01, 0.55, t + i * 0.11)); break;
      case "startup": [57, 64, 69, 76].forEach((m, i) => tone("sawtooth", hz(m), hz(m), 0.035, 0.02, 0.6, t + i * 0.1)); break;
      case "page": noise(0.09, 0.16, 1600, "bandpass"); break;
      case "launch": noise(0.06, 0.65, 2200, "bandpass"); tone("sine", 220, 880, 0.05, 0.05, 0.6); break;
      case "pop": {
        if (t - this.lastPop < 0.09) return;
        this.lastPop = t;
        noise(0.22, 0.3, 900); tone("sine", 110, 45, 0.18, 0.005, 0.3);
        break;
      }
      case "puff": noise(0.07, 0.2, 650); break;
    }
  }
}

export const audio = new Engine();

export function useAudio(): AudioState {
  const [s, setS] = useState<AudioState>(() => audio.getState());
  useEffect(() => audio.subscribe(() => setS(audio.getState())), []);
  return s;
}

/* Renders a built-in track offline and measures it — used by scripts/test.mjs to check the mix. */
export async function renderStats(id: string, seconds = 12) {
  const OAC = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const sr = 44100, ctx = new OAC(2, Math.floor(sr * seconds), sr);
  const s = new Session(ctx, synthTrack(id), ctx.destination, makeKit(ctx));
  s.out.gain.value = 1;
  for (let n = 0, t = 0.05; t < seconds; n++, t += s.stepDur) s.step(n, t);
  const buf = await ctx.startRendering();
  const x = buf.getChannelData(0);
  let peak = 0, sum = 0, lowSum = 0, highSum = 0, lp = 0, hpPrev = 0, hp = 0, quiet = 0, quietRun = 0, bad = 0;
  const aL = 1 - Math.exp((-2 * Math.PI * 200) / sr), aH = Math.exp((-2 * Math.PI * 4000) / sr);
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    if (!Number.isFinite(v)) { bad++; continue; }
    const a = Math.abs(v);
    if (a > peak) peak = a;
    sum += v * v;
    lp += aL * (v - lp); lowSum += lp * lp;
    hp = aH * (hp + v - hpPrev); hpPrev = v; highSum += hp * hp;
    if (a < 0.002) { quietRun++; if (quietRun > quiet) quiet = quietRun; } else quietRun = 0;
  }
  const rms = Math.sqrt(sum / x.length);
  return { id, peak, rms, low: Math.sqrt(lowSum / x.length) / rms, high: Math.sqrt(highSum / x.length) / rms, longestSilence: quiet / sr, bad, loop: s.loopDur };
}
(window as unknown as { __rhodylAudio: unknown }).__rhodylAudio = { renderStats, tracks: TRACKS.map((t) => t.id) };
