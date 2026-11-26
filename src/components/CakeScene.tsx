import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CAKE } from "../config";
import { CakeArt, Icon } from "../art";
import { audio, useAudio } from "../audio";

type MicState = "off" | "requesting" | "calibrating" | "listening" | "denied" | "unsupported";

export function CakeScene({ onExit, onComplete }: { onExit: () => void; onComplete: () => void }) {
  const count = Math.max(1, CAKE.candles);
  const [lit, setLit] = useState<boolean[]>(() => Array(count).fill(true));
  const [mic, setMic] = useState<MicState>("off");
  const [sens, setSens] = useState(CAKE.micSensitivity);
  const [done, setDone] = useState(false);
  const st = useAudio();

  const litRef = useRef(lit);
  const sensRef = useRef(sens);
  const completed = useRef(false);
  const manualBusy = useRef(false);
  const stream = useRef<MediaStream | null>(null);
  const micCtx = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const manualTimer = useRef(0);
  const doneTimer = useRef(0);
  const meterRef = useRef<HTMLDivElement>(null);
  const leanWrap = useRef<HTMLDivElement>(null);

  litRef.current = lit;
  sensRef.current = sens;

  const motes = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
    left: `${(i * 61) % 100}%`, size: 2 + (i % 3) * 1.6, dur: 9 + (i % 5) * 3, delay: -(i * 1.7), op: 0.25 + (i % 4) * 0.12, mx: (i % 2 ? 1 : -1) * (14 + i * 3),
  })), []);

  const extinguishOne = () => {
    const cur = litRef.current;
    const litIdx = cur.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (!litIdx.length) return;
    const pick = litIdx[Math.floor(Math.random() * litIdx.length)];
    const next = cur.slice(); next[pick] = false;
    litRef.current = next;
    setLit(next);
    audio.sfx("puff");
    if (!next.some(Boolean)) finish();
  };

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    setDone(true);
    stopMic();
    audio.duck(1);
    doneTimer.current = window.setTimeout(onComplete, 1000);
  };

  const blowManual = () => {
    if (manualBusy.current || completed.current) return;
    manualBusy.current = true;
    stopMic();
    manualTimer.current = window.setInterval(() => {
      if (!litRef.current.some(Boolean)) { clearInterval(manualTimer.current); manualBusy.current = false; return; }
      extinguishOne();
    }, 75);
  };

  const stopMic = () => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (micCtx.current) { void micCtx.current.close().catch(() => undefined); micCtx.current = null; }
    leanWrap.current?.style.setProperty("--lean", "0deg");
    if (meterRef.current) meterRef.current.style.width = "0%";
    setMic((m) => (m === "denied" || m === "unsupported" ? m : "off"));
    audio.duck(1);
  };

  const startMic = async () => {
    if (completed.current) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) { setMic("unsupported"); return; }
    setMic("requesting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      stream.current = s;
      const ctx = new AudioContext();
      micCtx.current = ctx;
      const src = ctx.createMediaStreamSource(s);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const data = new Uint8Array(an.fftSize);
      audio.duck(0.22);
      setMic("calibrating");
      let frames = 0, baseSum = 0, baseline = 0.012, smoothed = 0, accum = 0, last = performance.now(), calibrated = false;
      const loop = (now: number) => {
        raf.current = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / data.length);
        if (!calibrated) {
          baseSum += rms; frames++;
          if (frames >= 70) { baseline = Math.max(0.008, baseSum / frames); calibrated = true; setMic("listening"); }
          return;
        }
        const intensity = Math.max(0, rms - baseline * 1.4) * 20 * sensRef.current;
        smoothed = smoothed * 0.72 + intensity * 0.28;
        if (meterRef.current) meterRef.current.style.width = `${Math.min(100, smoothed * 110)}%`;
        leanWrap.current?.style.setProperty("--lean", `${Math.min(26, smoothed * 42)}deg`);
        if (smoothed > 0.3 && !completed.current) {
          accum += (smoothed - 0.22) * dt * 13;
          while (accum >= 1) { accum -= 1; extinguishOne(); }
        } else accum = Math.max(0, accum - dt * 2);
      };
      raf.current = requestAnimationFrame(loop);
    } catch {
      setMic("denied");
      audio.duck(1);
    }
  };

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    clearInterval(manualTimer.current);
    clearTimeout(doneTimer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    if (micCtx.current) void micCtx.current.close().catch(() => undefined);
    audio.duck(1);
  }, []);

  /* belt-and-braces: completion is also derived from state, so the finale
     fires even if an in-tick check is ever missed (mic, manual, or race) */
  useEffect(() => {
    if (!lit.some(Boolean)) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lit]);

  const remaining = lit.filter(Boolean).length;
  const listening = mic === "calibrating" || mic === "listening";

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden dark-zone" style={{ background: "radial-gradient(ellipse at 50% 68%, #3a3630 0%, #2b2c33 42%, #0E1513 78%, #0A0F0E 100%)" }}>
      {motes.map((m, i) => (
        <span key={i} className="mote" style={{ left: m.left, bottom: "-4vh", width: m.size, height: m.size, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`, "--mo": m.op, "--mx": `${m.mx}px` } as CSSProperties} />
      ))}

      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
        <button className="btn btn-dark text-[11px]" onClick={onExit} disabled={done}>← Desktop</button>
        <button className="btn btn-dark !px-2.5" onClick={() => audio.toggleMute()} aria-label={st.muted ? "Unmute all sound" : "Mute all sound"}>
          <Icon id={st.muted ? "muted" : "speaker"} size={18} />
        </button>
      </div>

      <div className="h-full flex flex-col items-center px-4 pt-14 pb-4">
        <h1 className="font-editorial gold-text text-[clamp(24px,5vw,42px)] text-center fade-in-slow">{CAKE.wishLine}</h1>
        <div className="font-crt text-[10px] tracking-[0.3em] text-sage/70 mt-1">{remaining} / {count} CANDLES {remaining > 0 ? "LIT" : "OUT — WISH RELEASED"}</div>

        <div ref={leanWrap} className="flex-1 min-h-0 w-full max-w-[720px] grid place-items-center">
          <CakeArt lit={lit} />
        </div>

        <div className="w-full max-w-xl shrink-0">
          {done ? (
            <p className="text-center font-editorial italic text-goldbright text-lg fade-in">the smoke carries it upward…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button className="btn btn-gold !text-[13px] !px-6" onClick={blowManual}>Blow Out Candles</button>
                {listening ? (
                  <button className="btn !text-[12px]" onClick={stopMic}>Stop listening</button>
                ) : (
                  <button className="btn !text-[12px]" onClick={() => void startMic()} disabled={mic === "requesting"}>
                    {mic === "requesting" ? "Asking permission…" : "Use mic & blow"}
                  </button>
                )}
              </div>
              {listening && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-crt text-[9px] tracking-widest text-sage/80 shrink-0">{mic === "calibrating" ? "LEARNING THE ROOM…" : "BLOW STEADILY"}</span>
                  <div className="flex-1 h-3.5 border border-gold/60 bg-middeep p-[2px]">
                    <div ref={meterRef} className="meter-fill h-full bg-gradient-to-r from-sage via-gold to-rose" style={{ width: "0%" }} />
                  </div>
                  <label className="flex items-center gap-1.5 font-crt text-[9px] text-sage/80 shrink-0">
                    SENS
                    <input type="range" min={0.4} max={2.4} step={0.1} value={sens} onChange={(e) => setSens(parseFloat(e.target.value))} className="w-20" aria-label="Microphone sensitivity" />
                  </label>
                </div>
              )}
              {mic === "denied" && (
                <p className="text-center font-crt text-[11px] text-goldbright mt-3 fade-in" role="alert">
                  Microphone permission was denied — no worries. The manual button works just as magically.
                </p>
              )}
              {mic === "unsupported" && (
                <p className="text-center font-crt text-[11px] text-goldbright mt-3 fade-in" role="alert">
                  This browser can't share a microphone here (it needs HTTPS or localhost). The manual button has you covered.
                </p>
              )}
              <p className="text-center font-crt text-[9px] text-sage/50 mt-3">
                mic audio is analyzed live on your device — never recorded, saved, or uploaded
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}