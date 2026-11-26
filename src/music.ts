/* ─────────────────────────────────────────────────────────────────────
   RHODYL.EXE soundtrack — original music, synthesized live in the browser.
   A track is plain data (tempo, chords, patterns). The Session turns every
   sixteenth-note step into drum hits and synth voices. No audio files.
   ───────────────────────────────────────────────────────────────────── */

export type ChordKind = "M" | "m" | "M7" | "m7" | "7";
const IV: Record<ChordKind, number[]> = { M: [0, 4, 7], m: [0, 3, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], "7": [0, 4, 7, 10] };
type MixKey = "kick" | "snare" | "hat" | "bass" | "arp" | "lead" | "stab" | "delay";

export interface Track {
  id: string; title: string; mood: string; finale?: boolean;
  bpm: number;
  steps: number;                      // sixteenth-notes per bar: 16 = 4/4, 12 = 3/4
  swing?: number;                     // how late the off-sixteenths land (0–0.3 of a step)
  chords: [number, ChordKind][];      // one chord per bar: [bass note (midi), quality]
  kick?: string[]; snare?: string[]; hat?: string[]; stab?: string[]; // "x" hit, "." rest (see step())
  bass?: (number | null)[][];         // semitones above the chord root, per step
  arp?: number[][];                   // rung of the chord ladder per step, -1 = rest
  lead?: [number, number, number, number][]; // [bar, step, midi note, length in steps]
  pad?: number;                       // pad level, 0 = no pad
  sound: { bass: "saw" | "sub" | "chip"; arp: "pluck" | "chip" | "bell"; lead: "saw" | "chip" | "soft" };
  mix?: Partial<Record<MixKey, number>>;
}

const BASS_NOTE: Record<string, number> = { "0": 0, "2": 2, "3": 3, "4": 4, "5": 5, "7": 7, a: 10, c: 12 };
const bs = (s: string) => [...s].map((ch) => (ch === "." ? null : BASS_NOTE[ch]));
const ar = (s: string) => [...s].map((ch) => (ch === "." ? -1 : Number(ch)));
const rep = <X>(n: number, x: X): X[] => Array.from({ length: n }, () => x);

/* 1 ─ NEON DISTRICT: driving synthwave in A minor. Eight bars of arps, eight with a lead. */
const NEON: Track = {
  id: "neon", title: "NEON DISTRICT", mood: "synthwave · 104 bpm", bpm: 104, steps: 16,
  chords: [[45, "m"], [41, "M"], [48, "M"], [43, "M"], [45, "m"], [41, "M"], [48, "M"], [43, "M"],
           [41, "M"], [43, "M"], [45, "m"], [45, "m"], [41, "M"], [43, "M"], [40, "m"], [40, "M"]],
  kick: ["x.......x.......", "x.......x.x....."],
  snare: ["....x.......x...", "....x.......x...", "....x.......x...", "....x.......x.xx"],
  hat: ["x-x-x-x-x-x-x-o-"],
  bass: [bs("0.0.0.0.0.0.0.c.")],
  arp: [...rep(8, ar("0232432302325432")), ...rep(8, ar("3242524232426543"))],
  lead: [
    [8, 0, 69, 3], [8, 3, 72, 3], [8, 6, 76, 4], [8, 10, 74, 2], [8, 12, 72, 4],
    [9, 0, 71, 4], [9, 4, 74, 4], [9, 8, 79, 6], [9, 14, 76, 2],
    [10, 0, 76, 6], [10, 6, 74, 2], [10, 8, 72, 4], [10, 12, 69, 4],
    [11, 0, 69, 8], [11, 8, 72, 2], [11, 10, 74, 2], [11, 12, 76, 4],
    [12, 0, 77, 6], [12, 6, 76, 2], [12, 8, 72, 4], [12, 12, 69, 4],
    [13, 0, 79, 4], [13, 4, 76, 4], [13, 8, 74, 4], [13, 12, 71, 4],
    [14, 0, 76, 6], [14, 6, 79, 2], [14, 8, 83, 8],
    [15, 0, 83, 4], [15, 4, 80, 4], [15, 8, 76, 8],
  ],
  pad: 1,
  sound: { bass: "saw", arp: "pluck", lead: "saw" },
};

/* 2 ─ NIGHT MARKET: slow, swung lo-fi. Electric-piano chords, soft sub bass, a lazy melody. */
const MARKET: Track = {
  id: "market", title: "NIGHT MARKET", mood: "lo-fi · 80 bpm", bpm: 80, steps: 16, swing: 0.2,
  chords: [[38, "m7"], [43, "7"], [48, "M7"], [45, "m7"], [38, "m7"], [43, "7"], [40, "m7"], [45, "m7"]],
  kick: ["x.....x...x.....", "x.....x....x...."],
  snare: ["....x.......x...", "....x.......x..o"],
  hat: ["x.x-x.x.x.x-x.x."],
  stab: ["x.....x.........", "x.........x....."],
  bass: [bs("0.....0...7....."), bs("0.....0.....c...")],
  lead: [
    [0, 0, 69, 6], [0, 6, 72, 4], [0, 10, 74, 6],
    [1, 0, 71, 6], [1, 8, 74, 8],
    [2, 0, 76, 8], [2, 8, 79, 4], [2, 12, 76, 4],
    [3, 0, 72, 10], [3, 12, 69, 4],
    [4, 0, 77, 6], [4, 6, 76, 2], [4, 8, 74, 8],
    [5, 0, 74, 4], [5, 4, 71, 4], [5, 8, 67, 8],
    [6, 0, 71, 6], [6, 6, 74, 4], [6, 10, 76, 6],
    [7, 0, 72, 6], [7, 8, 69, 8],
  ],
  pad: 0.6,
  sound: { bass: "sub", arp: "bell", lead: "soft" },
  mix: { kick: 0.75, bass: 0.8, snare: 0.7, hat: 0.9, stab: 1.25, lead: 1.15, delay: 0.25 },
};

/* 3 ─ ARCADE BIRTHDAY: "Happy Birthday" as a chiptune waltz. Eight-bar break, then the tune. */
const ARCADE: Track = {
  id: "arcade", title: "ARCADE BIRTHDAY", mood: "chiptune · happy birthday remix", bpm: 138, steps: 12,
  chords: [[43, "M"], [40, "m"], [48, "M"], [38, "M"], [43, "M"], [40, "m"], [48, "M"], [38, "M"],
           [43, "M"], [38, "M"], [38, "M"], [43, "M"], [43, "M"], [48, "M"], [43, "M"], [43, "M"]],
  kick: ["x.....x.....", "x..........."],
  snare: ["....x...x..."],
  hat: ["x.x.x.x.x.x."],
  bass: [bs("0...7...7...")],
  arp: [...rep(8, ar("012321012321")), ...rep(8, ar("0.2.3.2.3.2."))],
  lead: [
    [3, 0, 81, 4], [3, 4, 78, 4], [3, 8, 74, 4],
    [7, 0, 78, 4], [7, 4, 81, 4], [7, 8, 74, 2], [7, 10, 74, 2],
    [8, 0, 76, 4], [8, 4, 74, 4], [8, 8, 79, 4],
    [9, 0, 78, 8], [9, 8, 74, 2], [9, 10, 74, 2],
    [10, 0, 76, 4], [10, 4, 74, 4], [10, 8, 81, 4],
    [11, 0, 79, 8], [11, 8, 74, 2], [11, 10, 74, 2],
    [12, 0, 86, 4], [12, 4, 83, 4], [12, 8, 79, 4],
    [13, 0, 78, 4], [13, 4, 76, 4], [13, 8, 84, 2], [13, 10, 84, 2],
    [14, 0, 83, 4], [14, 4, 79, 4], [14, 8, 81, 4],
    [15, 0, 79, 12],
  ],
  sound: { bass: "chip", arp: "chip", lead: "chip" },
  mix: { kick: 0.8, snare: 0.6, hat: 0.6, arp: 0.8, lead: 0.9, delay: 0.2 },
};

/* 4 ─ AFTERGLOW: the fireworks theme. Wide pads, bell arps, a slow rising melody that lands on C major. */
const AFTERGLOW: Track = {
  id: "afterglow", title: "AFTERGLOW", mood: "finale · 92 bpm", finale: true, bpm: 92, steps: 16,
  chords: [[41, "M"], [43, "M"], [45, "m"], [40, "m"], [41, "M"], [43, "M"], [48, "M"], [48, "M"]],
  kick: ["x.......x......."],
  snare: ["....x.......x..."],
  hat: ["..x...x...x...x."],
  bass: [bs("0.......0.....7.")],
  arp: [ar("0.2.3.4.2.3.5.3."), ar("0.2.3.4.2.3.6.5.")],
  lead: [
    [0, 0, 72, 8], [0, 8, 69, 4], [0, 12, 72, 4],
    [1, 0, 74, 8], [1, 8, 71, 4], [1, 12, 74, 4],
    [2, 0, 76, 12], [2, 12, 74, 2], [2, 14, 72, 2],
    [3, 0, 71, 8], [3, 8, 67, 4], [3, 12, 71, 4],
    [4, 0, 72, 6], [4, 6, 77, 6], [4, 12, 76, 4],
    [5, 0, 74, 6], [5, 6, 79, 6], [5, 12, 74, 4],
    [6, 0, 76, 8], [6, 8, 79, 8],
    [7, 0, 79, 4], [7, 4, 76, 4], [7, 8, 72, 8],
  ],
  pad: 1.4,
  sound: { bass: "saw", arp: "bell", lead: "saw" },
  mix: { kick: 0.8, snare: 0.6, hat: 0.6, arp: 1.2, bass: 0.85, delay: 0.4 },
};

/* 5 ─ MUSIC BOX: the original Option A tune. "Happy Birthday" as a music-box waltz,
   with a pause every second bar, just as the first version of the gift played it.
   A NULL step (or "." in the bass/arp patterns) leaves the note to ring. */
const MUSIC_BOX: Track = {
  id: "musicbox", title: "MUSIC BOX", mood: "option A · happy birthday music box", bpm: 108, steps: 12,
  chords: [[43, "M"], [38, "M"], [43, "M"], [48, "M"], [48, "M"], [40, "m"], [43, "M"], [38, "M"]],
  bass: [bs("0...7...0..."), bs("0...7...7...")],
  arp: [ar("1.3.5.3.1.3."), ar("1.3.5.3.1.2.")],
  // melody is written at the octave it should ring: [bar, step, midi, steps]
  lead: [
    [0, 0, 62, 3], [0, 3, 62, 1], [0, 4, 64, 4], [0, 8, 62, 4],
    [1, 0, 67, 4], [1, 4, 66, 8],
    [2, 0, 62, 3], [2, 3, 62, 1], [2, 4, 64, 4], [2, 8, 62, 4],
    [3, 0, 69, 4], [3, 4, 67, 8],
    [4, 0, 62, 3], [4, 3, 62, 1], [4, 4, 74, 4], [4, 8, 71, 4],
    [5, 0, 67, 4], [5, 4, 66, 4], [5, 8, 64, 4],
    [6, 0, 72, 3], [6, 3, 72, 1], [6, 4, 71, 4], [6, 8, 67, 4],
    [7, 0, 69, 4], [7, 4, 67, 8],
  ],
  sound: { bass: "sub", arp: "bell", lead: "soft" },
  mix: { kick: 0, snare: 0, hat: 0, bass: 0.7, arp: 0.8, lead: 0.95, delay: 0.28 },
};

/* 6 ─ NIGHT SKY: the original Option A finale — a slow rising night-sky theme. */
const NIGHT_SKY: Track = {
  id: "nightsky", title: "NIGHT SKY", mood: "option A · quiet finale", finale: true, bpm: 76, steps: 16,
  chords: [[45, "m"], [41, "M"], [43, "M"], [40, "m"]],
  kick: [], snare: [], hat: [],
  bass: [bs("0.......0.......")],
  arp: [ar("0.2.3.4.3.2.1.2."), ar("0.2.3.5.3.2.1.3.")],
  lead: [
    [0, 0, 69, 12], [1, 0, 72, 12], [2, 0, 74, 8], [2, 8, 71, 8], [3, 0, 76, 16],
  ],
  pad: 1,
  sound: { bass: "sub", arp: "bell", lead: "soft" },
  mix: { kick: 0, snare: 0, hat: 0, bass: 0.6, arp: 0.8, lead: 0.7, delay: 0.4 },
};

/* Option A's two tunes come first; the Option B tracks stay in the playlist. */
export const TRACKS: Track[] = [MUSIC_BOX, NIGHT_SKY, NEON, MARKET, ARCADE, AFTERGLOW];

/* ── shared sample material: one second of noise + a decaying-noise room ── */
export interface Kit { noise: AudioBuffer; ir: AudioBuffer }
export function makeKit(ctx: BaseAudioContext): Kit {
  const sr = ctx.sampleRate;
  const noise = ctx.createBuffer(1, sr, sr);
  const d = noise.getChannelData(0);
  for (let i = 0; i < sr; i++) d[i] = Math.random() * 2 - 1;
  const len = Math.floor(sr * 1.9);
  const ir = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const x = ir.getChannelData(c);
    for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  return { noise, ir };
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
/* chord tones stacked upward from one octave above the bass note */
const ladder = (root: number, kind: ChordKind) => {
  const b = root + 12, iv = IV[kind];
  return [...iv.map((i) => b + i), ...iv.map((i) => b + 12 + i), b + 24, b + 24 + iv[1]];
};

export class Session {
  readonly out: GainNode;
  readonly stepDur: number;
  readonly loopSteps: number;
  readonly loopDur: number;
  private drum: GainNode; private pump: GainNode; private rev: GainNode;
  private snF: BiquadFilterNode; private hatF: BiquadFilterNode;
  private bassF: BiquadFilterNode; private arpF: BiquadFilterNode; private padF: BiquadFilterNode; private leadF: BiquadFilterNode;
  private lfo: OscillatorNode;
  private leadAt = new Map<number, [number, number][]>();

  constructor(private ctx: BaseAudioContext, readonly track: Track, dest: AudioNode, private kit: Kit) {
    const T = track, c = ctx;
    this.stepDur = 60 / T.bpm / 4;
    this.loopSteps = T.chords.length * T.steps;
    this.loopDur = this.loopSteps * this.stepDur;
    const g = (v: number) => this.gain(v);
    const filt = (type: BiquadFilterType, f: number, q = 0.7) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; };

    // everything meets in a gentle bus compressor, then the session fader
    this.out = g(0);
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 14; comp.ratio.value = 3.2; comp.attack.value = 0.006; comp.release.value = 0.22;
    const trim = g(0.8);
    comp.connect(trim); trim.connect(this.out); this.out.connect(dest);

    this.drum = g(1); this.drum.connect(comp);
    this.pump = g(1); this.pump.connect(comp);        // bass + pads breathe with the kick
    const mix = g(1); mix.connect(comp);

    // tempo-synced echo (dotted eighth)
    const send = g(T.mix?.delay ?? 0.3);
    const dl = c.createDelay(1.5); dl.delayTime.value = this.stepDur * 3;
    const fb = g(0.36), tone = filt("lowpass", 2600);
    send.connect(dl); dl.connect(tone); tone.connect(fb); fb.connect(dl); tone.connect(comp);

    // a small room
    this.rev = g(1);
    const cv = c.createConvolver(); cv.buffer = kit.ir;
    const wet = g(0.4);
    this.rev.connect(cv); cv.connect(wet); wet.connect(comp);

    this.snF = filt("bandpass", 2100, 0.7); this.snF.connect(this.drum);
    const snSend = g(0.28); this.snF.connect(snSend); snSend.connect(this.rev);
    this.hatF = filt("highpass", 7600); this.hatF.connect(this.drum);

    const bk = T.sound.bass;
    this.bassF = filt("lowpass", bk === "saw" ? 600 : bk === "sub" ? 480 : 2200, bk === "saw" ? 4 : 0.7);
    this.bassF.connect(this.pump);
    this.arpF = filt("lowpass", T.sound.arp === "chip" ? 5200 : 2800, 1);
    this.arpF.connect(mix); this.arpF.connect(send);
    this.padF = filt("lowpass", 1150, 0.6);
    this.padF.connect(this.pump);
    const padRev = g(0.5); this.padF.connect(padRev); padRev.connect(this.rev);
    this.leadF = filt("lowpass", T.sound.lead === "chip" ? 6000 : 3400, 0.8);
    this.leadF.connect(mix);
    const ls = g(0.5); this.leadF.connect(ls); ls.connect(send);
    const lr = g(0.35); this.leadF.connect(lr); lr.connect(this.rev);

    // slow filter drift keeps the pad alive
    this.lfo = c.createOscillator(); this.lfo.frequency.value = 0.07;
    const depth = g(380); this.lfo.connect(depth); depth.connect(this.padF.frequency); this.lfo.start();

    for (const [bar, s, m, len] of T.lead ?? []) {
      const k = bar * T.steps + s;
      const list = this.leadAt.get(k) ?? [];
      list.push([m, len]); this.leadAt.set(k, list);
    }
  }

  fade(to: number, secs: number) {
    const p = this.out.gain, t = this.ctx.currentTime;
    p.cancelScheduledValues(t);
    p.setTargetAtTime(to, t, Math.max(0.01, secs / 4));
  }
  dispose(afterSecs = 0.5) {
    setTimeout(() => {
      try { this.lfo.stop(); } catch { /* already stopped */ }
      try { this.out.disconnect(); } catch { /* already disconnected */ }
    }, afterSecs * 1000);
  }

  /** Play step `n` of the loop (wraps) at audio time `time`. */
  step(n: number, time: number) {
    const T = this.track, S = T.steps, L = this.loopSteps, sd = this.stepDur;
    const gI = ((n % L) + L) % L, bar = Math.floor(gI / S), s = gI % S;
    const t = T.swing && s % 2 === 1 ? time + sd * T.swing : time;
    const [root, kind] = T.chords[bar];
    const at = <X>(a?: X[]) => (a && a.length ? a[bar % a.length] : undefined);
    const k = at(T.kick), sn = at(T.snare), h = at(T.hat), st = at(T.stab), b = at(T.bass), a = at(T.arp);
    if (k && k[s] === "x") this.kick(t);
    if (sn && sn[s] === "x") this.snare(t, 1); else if (sn && sn[s] === "o") this.snare(t, 0.35);
    if (h && h[s] && h[s] !== ".") this.hat(t, h[s] === "-" ? 0.45 : 1, h[s] === "o");
    if (b && b[s] != null) {
      let len = 1;
      while (s + len < S && b[s + len] == null && len < 6) len++;
      this.bass(t, root + (b[s] as number), len * sd * 0.92);
    }
    if (a && a[s] >= 0) { const m = ladder(root, kind)[a[s]]; if (m !== undefined) this.arp(t, m); }
    if (st && st[s] === "x") this.stab(t, root, kind);
    if (T.pad && s === 0) this.pad(t, IV[kind].map((i) => root + 12 + i), S * sd);
    const ev = this.leadAt.get(gI);
    if (ev) for (const [m, len] of ev) this.lead(t, m, len * sd);
  }

  /* ── building blocks ── */
  private lv(k: MixKey) { return this.track.mix?.[k] ?? 1; }
  private gain(v: number) { const n = this.ctx.createGain(); n.gain.value = v; return n; }
  private o(type: OscillatorType, m: number, t: number, stop: number, cents = 0) {
    const x = this.ctx.createOscillator();
    x.type = type; x.frequency.value = hz(m); if (cents) x.detune.value = cents;
    x.start(t); x.stop(stop);
    return x;
  }
  private pluck(t: number, peak: number, decay: number) {
    const n = this.ctx.createGain(), p = n.gain;
    p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(peak, t + 0.005); p.exponentialRampToValueAtTime(0.0001, t + decay);
    return n;
  }
  private hold(t: number, a: number, peak: number, sustain: number, r: number) {
    const n = this.ctx.createGain(), p = n.gain;
    p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(peak, t + a);
    p.setValueAtTime(peak, t + a + sustain); p.exponentialRampToValueAtTime(0.0001, t + a + sustain + r);
    return n;
  }
  private noise(t: number, peak: number, decay: number, into: AudioNode) {
    const s = this.ctx.createBufferSource(); s.buffer = this.kit.noise;
    const e = this.ctx.createGain();
    e.gain.setValueAtTime(peak, t); e.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    s.connect(e); e.connect(into);
    s.start(t, Math.random() * 0.6, decay + 0.03);
  }

  /* ── drums ── */
  private kick(t: number) {
    const v = this.lv("kick") * 0.8, c = this.ctx;
    const x = c.createOscillator();
    x.frequency.setValueAtTime(170, t); x.frequency.exponentialRampToValueAtTime(46, t + 0.12);
    const e = c.createGain();
    e.gain.setValueAtTime(v, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    x.connect(e); e.connect(this.drum); x.start(t); x.stop(t + 0.36);
    const p = this.pump.gain; // sidechain: duck the bass and pads under each kick
    p.setValueAtTime(1, t); p.linearRampToValueAtTime(0.5, t + 0.012); p.linearRampToValueAtTime(1, t + 0.21);
  }
  private snare(t: number, lvl: number) {
    const v = this.lv("snare") * 0.5 * lvl;
    this.noise(t, v, 0.2, this.snF);
    const e = this.ctx.createGain();
    e.gain.setValueAtTime(v * 0.7, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    this.o("triangle", 55, t, t + 0.12).connect(e); e.connect(this.drum);
  }
  private hat(t: number, lvl: number, open: boolean) {
    this.noise(t, this.lv("hat") * 0.15 * lvl, open ? 0.26 : 0.05, this.hatF);
  }

  /* ── pitched voices ── */
  private bass(t: number, m: number, dur: number) {
    const kind = this.track.sound.bass, end = t + dur + 0.1;
    const e = this.hold(t, 0.008, this.lv("bass") * (kind === "sub" ? 0.36 : 0.26), Math.max(0.02, dur - 0.04), 0.08);
    if (kind === "saw") {
      this.o("sawtooth", m, t, end).connect(e);
      const sub = this.gain(0.6); this.o("square", m - 12, t, end).connect(sub); sub.connect(e);
      const f = this.bassF.frequency; // each note opens the filter, then it closes again
      f.setValueAtTime(260, t); f.exponentialRampToValueAtTime(1150, t + 0.02); f.exponentialRampToValueAtTime(340, t + Math.min(dur, 0.32));
    } else if (kind === "sub") {
      this.o("sine", m, t, end).connect(e);
      const up = this.gain(0.22); this.o("triangle", m + 12, t, end).connect(up); up.connect(e);
    } else {
      this.o("triangle", m, t, end).connect(e);
      const sq = this.gain(0.16); this.o("square", m, t, end).connect(sq); sq.connect(e);
    }
    e.connect(this.bassF);
  }
  private arp(t: number, m: number) {
    const kind = this.track.sound.arp, v = this.lv("arp") * 0.17;
    if (kind === "pluck") {
      const e = this.pluck(t, v, 0.3);
      this.o("sawtooth", m, t, t + 0.32, -6).connect(e);
      const q = this.gain(0.5); this.o("square", m, t, t + 0.32, 6).connect(q); q.connect(e);
      e.connect(this.arpF);
    } else if (kind === "chip") {
      const e = this.pluck(t, v * 0.75, 0.12);
      this.o("square", m, t, t + 0.14).connect(e); e.connect(this.arpF);
    } else {
      const e = this.pluck(t, v * 1.5, 0.9);
      this.o("sine", m, t, t + 0.95).connect(e);
      const q = this.gain(0.3); this.o("sine", m + 12, t, t + 0.95).connect(q); q.connect(e);
      const r = this.gain(0.12); this.o("sine", m + 19, t, t + 0.4).connect(r); r.connect(e);
      e.connect(this.arpF);
    }
  }
  private stab(t: number, root: number, kind: ChordKind) { // electric-piano chord, lightly strummed
    let b = root + 24; if (b > 66) b -= 12;
    const v = this.lv("stab") * 0.1;
    IV[kind].forEach((i, n) => {
      const at = t + n * 0.012, e = this.pluck(at, v, 1.5);
      this.o("sine", b + i, at, at + 1.55).connect(e);
      const q = this.gain(0.35); this.o("triangle", b + i + 12, at, at + 1.55).connect(q); q.connect(e);
      e.connect(this.arpF);
    });
  }
  private pad(t: number, notes: number[], dur: number) {
    const v = (this.track.pad ?? 0) * 0.055, e = this.ctx.createGain(), p = e.gain;
    p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(v, t + 0.5);
    p.setValueAtTime(v, t + dur); p.linearRampToValueAtTime(0.0001, t + dur + 0.8);
    for (const m of notes) for (const cents of [-9, 9]) this.o("sawtooth", m, t, t + dur + 0.85, cents).connect(e);
    e.connect(this.padF);
  }
  private lead(t: number, m: number, dur: number) {
    const kind = this.track.sound.lead, stop = t + dur + 0.4;
    const e = this.hold(t, kind === "chip" ? 0.004 : 0.03, this.lv("lead") * 0.19, Math.max(0.02, dur - 0.07), kind === "soft" ? 0.3 : 0.14);
    const voices: OscillatorNode[] = [];
    if (kind === "saw") voices.push(this.o("sawtooth", m, t, stop, -7), this.o("sawtooth", m, t, stop, 7));
    else if (kind === "chip") voices.push(this.o("square", m, t, stop));
    else {
      voices.push(this.o("triangle", m, t, stop));
      const q = this.gain(0.3); this.o("sine", m + 12, t, stop).connect(q); q.connect(e);
    }
    for (const x of voices) x.connect(e);
    if (dur > 0.3) { // vibrato blooms in on held notes
      const l = this.ctx.createOscillator(); l.frequency.value = 5.4;
      const d = this.ctx.createGain();
      d.gain.setValueAtTime(0, t); d.gain.linearRampToValueAtTime(kind === "chip" ? 14 : 9, t + Math.min(dur, 0.5));
      l.connect(d); for (const x of voices) d.connect(x.detune);
      l.start(t); l.stop(stop);
    }
    e.connect(this.leadF);
  }
}
