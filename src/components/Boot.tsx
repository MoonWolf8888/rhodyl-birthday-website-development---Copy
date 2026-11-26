import wall from "../assets/wall.jpg";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BOOT_LINES, BRAND, GATE } from "../config";
import { CRT } from "../art";
import { audio } from "../audio";
import { motion, useReducedMotion } from "../hooks";

type Phase = "boot" | "title" | "verify" | "granted";
const ROOM_BG = "linear-gradient(rgba(8,6,5,.74), rgba(8,6,5,.9)), url(" + wall + ") center / cover no-repeat";

export function Boot({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [shown, setShown] = useState(0);
  const calm = useReducedMotion();

  useEffect(() => {
    if (phase !== "boot") return;
    if (shown >= BOOT_LINES.length) {
      const t = setTimeout(() => setPhase("title"), 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 600 : 460);
    return () => clearTimeout(t);
  }, [phase, shown]);

  useEffect(() => {
    if (phase !== "granted") return;
    const t = setTimeout(onDone, 2100);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  const start = () => {
    void audio.start(); // the one gesture that unlocks sound
    setPhase("verify");
  };

  if (phase === "verify" || phase === "granted") {
    return <Verify granted={phase === "granted"} onGrant={() => setPhase("granted")} />;
  }

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden" style={{ background: ROOM_BG }}>
      <div className="relative" style={{ width: "min(97vw, calc(94vh * 1.282))", aspectRatio: "1000 / 780" }}>
        <CRT />
        {/* screen content, aligned to the SVG's screen rectangle */}
        <div
          className="absolute rounded-xl overflow-hidden scanlines crt-vignette cursor-pointer"
          style={{ left: "20.5%", top: "12.18%", width: "59%", height: "52.56%" }}
          onClick={() => { if (phase === "boot") setShown(BOOT_LINES.length); }}
        >
          <div className="w-full h-full flex flex-col justify-between p-[4%] font-crt crt-screen-text" style={{ fontSize: "clamp(9px, 1.85vmin, 15px)" }}>
            {phase === "boot" ? (
              <>
                <div className="leading-relaxed">
                  {BOOT_LINES.slice(0, shown).map((l, i) => (
                    <div key={i} className="boot-line">
                      <span className="opacity-60">&gt; </span>
                      <span className={l.status === "fail" ? "text-danger" : l.status === "error" ? "text-amber" : ""}>{l.text}</span>
                    </div>
                  ))}
                  <span className="cursor-blink">▊</span>
                </div>
                <div>
                  <div className="h-[10px] border border-neon/70 p-[2px]">
                    <div className="h-full bg-neon transition-all duration-300" style={{ width: `${(shown / BOOT_LINES.length) * 100}%`, boxShadow: "0 0 10px rgba(255,180,54,.9)" }} />
                  </div>
                  <div className="opacity-50 mt-1 text-[0.8em]">click screen to fast-forward</div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-[4%] fade-in">
                <div>
                  <div className="font-bold tracking-[0.2em] text-neonbright" style={{ fontSize: "clamp(17px, 4.6vmin, 40px)", textShadow: "0 0 20px rgba(255,180,54,.95), 0 0 5px rgba(255,233,168,.8)" }}>{BRAND.title}</div>
                  <div className="mt-1 text-neon/90">{BRAND.version}</div>
                  <div className="mt-1 text-[0.85em] px-2 text-neon/60">{BRAND.subtitle}</div>
                </div>
                <button
                  autoFocus
                  onClick={(e) => { e.stopPropagation(); start(); }}
                  className="font-crt font-bold tracking-[0.25em] border-2 border-neon text-neonbright px-8 hover:bg-neon hover:text-void transition-colors cursor-pointer"
                  style={{ fontSize: "clamp(12px, 2.4vmin, 20px)", minHeight: 44, boxShadow: "0 0 18px rgba(255,180,54,.5), inset 0 0 12px rgba(255,180,54,.15)" }}
                >
                  [ START ]
                </button>
                <div className="flex flex-wrap items-center justify-center gap-x-2 text-[0.8em]">
                  <span className="text-neon/50 cursor-blink">▸ sound on · press Enter</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); motion.setCalm(!calm); }}
                    aria-pressed={calm} aria-label={"Motion: " + (calm ? "calm" : "full") + ". Switch"}
                    className="font-crt px-2 py-1 text-neon/80 hover:text-neonbright cursor-pointer"
                  >
                    [ MOTION: {calm ? "CALM" : "FULL"} ]
                  </button>
                </div>
                {motion.systemReduced() && !calm && (
                  <div className="text-[0.7em] text-neon/45 px-3 hidden sm:block">this device asks for less motion — switch to CALM if you prefer</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Verify({ granted, onGrant }: { granted: boolean; onGrant: () => void }) {
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [exitTries, setExitTries] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (granted) return;
    const n = parseInt(value.trim(), 10);
    if (n === GATE.answer) {
      audio.sfx("success");
      onGrant();
    } else {
      audio.sfx("error");
      setAttempts((a) => a + 1);
      setWrong(true);
      setValue("");
      setTimeout(() => setWrong(false), 450);
      inputRef.current?.focus();
    }
  };

  const denyExit = () => {
    audio.sfx("error");
    setExitTries((n) => n + 1);
    setWrong(true);
    setTimeout(() => setWrong(false), 450);
  };

  const errMsg = attempts > 0 ? GATE.errors[(attempts - 1) % GATE.errors.length] : null;
  const hint = attempts >= 3 ? GATE.hints[Math.min(attempts - 3, GATE.hints.length - 1)] : null;
  const exitMsg = exitTries > 0 ? GATE.exitJokes[(exitTries - 1) % GATE.exitJokes.length] : null;

  return (
    <div className="fixed inset-0 grid place-items-center p-3 scanlines overflow-y-auto" style={{ background: ROOM_BG }}>
      <div className={`bev-out window-shadow w-full max-w-xl fade-in ${wrong ? "shake" : ""}`}>
        <div className="titlebar flex items-center px-2 h-8 gap-2">
          <span className="font-crt text-[12px] font-bold tracking-wide flex-1 truncate">Birthday Security Verification</span>
          <button className="tb-btn bev-out" aria-label="Close verification (you cannot escape adulthood)" onClick={denyExit}>✕</button>
        </div>

        {granted ? (
          <div className="p-8 flex flex-col items-center text-center gap-5 bg-panel">
            <div className="granted-stamp font-crt font-bold text-3xl sm:text-4xl px-6 py-3 tracking-widest">{GATE.successTitle}</div>
            <p className="font-crt text-[13px] leading-relaxed max-w-md text-steel">{GATE.successBody}</p>
            <div className="font-crt text-[11px] text-neon/70 cursor-blink">loading desktop…</div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 sm:p-7 bg-panel">
            <h1 className="font-crt font-bold text-lg sm:text-xl mb-2 text-neonbright" style={{ textShadow: "0 0 12px rgba(255,180,54,.4)" }}>{GATE.heading}</h1>
            <p className="font-crt text-[12px] leading-relaxed text-steel mb-5">{GATE.body}</p>

            <div className="bev-in p-5 mb-5 flex flex-col items-center gap-2">
              <span className="sr-only">{GATE.problemAlt}</span>
              <div aria-hidden className="font-editorial text-3xl sm:text-4xl text-neonbright flex items-center gap-3" style={{ textShadow: "0 0 14px rgba(255,180,54,.45)" }}>
                <span className="frac">
                  <span className="num">7<sup className="text-[0.55em]">2</sup> − √<span className="sqrt-bar">49</span></span>
                  <span className="den">2</span>
                </span>
                <span>= ?</span>
              </div>
              <div className="font-crt text-[10px] text-neondim tracking-wider">MINIMUM MATHEMATICAL REQUIREMENT · FORM 21-B</div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 font-crt text-[12px] font-bold text-neon">
                Your answer
                <input
                  ref={inputRef} autoFocus value={value} inputMode="numeric" autoComplete="off"
                  onChange={(e) => setValue(e.target.value.replace(/[^0-9-]/g, ""))}
                  className="bev-in font-crt text-lg px-3 py-2 w-28 outline-none text-neonbright caret-neon"
                  aria-label="Your answer to the verification problem"
                />
              </label>
              <button type="submit" className="btn btn-gold text-[13px]">Verify Intelligence</button>
              <span className="font-crt text-[11px] text-steeldim ml-auto">Attempt #{attempts + 1}</span>
            </div>

            <div aria-live="polite" className="min-h-[3.4rem] mt-4">
              {exitMsg && <p className="font-crt text-[12px] text-amber font-bold">⚠ {exitMsg}</p>}
              {errMsg && <p className="font-crt text-[12px] text-danger font-bold">✗ {errMsg}</p>}
              {hint && <p className="font-crt text-[12px] text-cyber mt-1">{hint}</p>}
              {!errMsg && !exitMsg && <p className="font-crt text-[11px] text-steeldim">Press Enter to submit. The fate of your birthday rests on arithmetic.</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}