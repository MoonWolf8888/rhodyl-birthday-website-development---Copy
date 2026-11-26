import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { PHOTOS, type PhotoEntry } from "../config";
import { audio } from "../audio";
import { useReducedMotion } from "../hooks";

const N = PHOTOS.length;
const pad = (n: number) => String(n).padStart(2, "0");
const STAT_NAMES = ["CHAOS", "STYLE", "STEALTH", "FRIENDSHIP"];

function Portrait({ p, stage = false }: { p: PhotoEntry; stage?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`fighter-photo ${stage ? "fighter-photo-stage" : ""}`}>
      {failed ? (
        <div className="fighter-missing">
          <svg viewBox="0 0 120 160" aria-hidden>
            <circle cx="60" cy="43" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M17 145c3-45 20-65 43-65s40 20 43 65" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M18 22l84 116M102 22L18 138" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </svg>
          <strong>{pad(p.n)}</strong>
          <span>NO SIGNAL</span>
          <small>insert {pad(p.n)}.jpg</small>
        </div>
      ) : (
        <img
          src={p.src} alt={p.alt} draggable={false} loading={stage ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
          className={loaded ? "is-loaded" : ""}
          style={{ objectFit: p.fit, objectPosition: p.fit === "cover" ? "50% 28%" : "center" }}
        />
      )}
      <div className="portrait-scan" aria-hidden />
    </div>
  );
}

export function Archives({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [run, setRun] = useState(0);
  const [locked, setLocked] = useState<number | null>(null);
  const [showLock, setShowLock] = useState(false);
  const [lockRun, setLockRun] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const calm = useReducedMotion();
  const p = PHOTOS[index];

  const choose = (next: number, focus = false) => {
    const i = (next + N) % N;
    if (i === index) return;
    setDirection(i > index || (index === N - 1 && i === 0) ? 1 : -1);
    setIndex(i); setRun((r) => r + 1);
    setLocked(null); setShowLock(false);
    audio.sfx("move");
    if (focus) requestAnimationFrame(() => cards.current[i]?.focus({ preventScroll: true }));
  };
  const lockIn = () => {
    setLocked(index); setShowLock(true); setLockRun((r) => r + 1);
    audio.sfx("unlock");
  };
  const pickCard = (i: number) => {
    if (i === index) lockIn();
    else choose(i);
  };
  const random = () => {
    let i = index;
    while (i === index && N > 1) i = Math.floor(Math.random() * N);
    choose(i, true);
  };

  useEffect(() => { if (active) rootRef.current?.focus({ preventScroll: true }); }, [active]);
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape" && showLock) { e.preventDefault(); e.stopPropagation(); setShowLock(false); return; }
      if (showLock) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); choose(index + 1, true); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); choose(index - 1, true); }
      if (e.key === "Enter" && tag !== "BUTTON") { e.preventDefault(); lockIn(); }
      if (e.key.toLowerCase() === "r") { e.preventDefault(); random(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (calm || e.pointerType !== "mouse" || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    stageRef.current.style.setProperty("--tilt-x", `${((e.clientY - r.top) / r.height - 0.5) * -4}deg`);
    stageRef.current.style.setProperty("--tilt-y", `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
  };
  const untilt = () => {
    stageRef.current?.style.setProperty("--tilt-x", "0deg");
    stageRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  const accentStyle = { "--accent": p.accent, "--from": `${direction * 70}px` } as CSSProperties;

  return (
    <div
      ref={rootRef} tabIndex={0} className="fighter-select flex-1 min-h-0 flex flex-col outline-none"
      style={accentStyle}
      aria-label="Choose your fighter"
    >
      <div className="fighter-topbar shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p1-tag shrink-0">P1</span>
          <div className="min-w-0">
            <h2 className="fighter-heading">CHOOSE YOUR FIGHTER</h2>
            <div className="font-crt text-[8px] tracking-[0.28em] text-steeldim mt-0.5">MEMORY_ARCHIVES // SIX PLAYABLE MEMORIES</div>
          </div>
        </div>
        <span className="fighter-online shrink-0"><i /> ONLINE</span>
      </div>

      <div className="fighter-main flex-1 min-h-0">
        {/* animated character stage */}
        <div
          ref={stageRef} className="fighter-stage"
          onPointerMove={tilt} onPointerLeave={untilt}
          onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            if (!touch.current) return;
            const dx = e.changedTouches[0].clientX - touch.current.x;
            const dy = e.changedTouches[0].clientY - touch.current.y;
            touch.current = null;
            if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.35) choose(index + (dx < 0 ? 1 : -1));
          }}
        >
          <div className="stage-grid" aria-hidden />
          <div className="stage-sun" aria-hidden />
          <div className="stage-number" aria-hidden>{pad(p.n)}</div>
          <svg className="stage-reticle" viewBox="0 0 300 300" aria-hidden>
            <circle cx="150" cy="150" r="125" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 12" />
            <circle cx="150" cy="150" r="105" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="70 24" />
            <path d="M150 8v28M150 264v28M8 150h28M264 150h28" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div key={`${p.n}-${run}`} className="fighter-entrant">
            <div className="fighter-idle">
              <Portrait p={p} stage />
            </div>
          </div>
          <div className="stage-scanbeam" aria-hidden />
          <div className="stage-nameplate">
            <span>PLAYER 01</span>
            <strong>{p.title}</strong>
            <small>{p.role}</small>
          </div>
          <div className="stage-record">MEMORY FILE {pad(index + 1)} / {pad(N)}</div>
        </div>

        {/* fighter stats and roster */}
        <div className="fighter-console">
          <div key={`info-${p.n}-${run}`} className="fighter-info">
            <div className="font-crt text-[9px] tracking-[0.3em]" style={{ color: p.accent }}>CLASS // {p.role}</div>
            <h3 className="fighter-name">{p.title}</h3>
            <p className="font-crt text-[11px] leading-relaxed text-steel mt-1">{p.caption}</p>
            <p className="font-crt text-[12px] acid-text mt-2 leading-relaxed">&gt; “{p.quote}”</p>
            <div className="fighter-stats">
              {p.stats.map((value, i) => (
                <div className="fighter-stat" key={STAT_NAMES[i]}>
                  <div className="flex justify-between font-crt text-[9px] tracking-widest">
                    <span>{STAT_NAMES[i]}</span><span style={{ color: p.accent }}>{value}</span>
                  </div>
                  <div className="stat-track"><span style={{ width: `${value}%`, background: p.accent, animationDelay: `${i * 80}ms` }} /></div>
                </div>
              ))}
            </div>
            <div className="fighter-moves">
              {p.moves.map((move, i) => (
                <div key={move}><kbd>{i === 0 ? "A" : "B"}</kbd><span>{move}</span></div>
              ))}
            </div>
          </div>

          <div className="fighter-roster" role="group" aria-label="Fighter roster">
            {PHOTOS.map((fighter, i) => (
              <button
                key={fighter.n}
                ref={(el) => { cards.current[i] = el; }}
                className={`fighter-card ${i === index ? "selected" : ""} ${locked === i ? "locked" : ""}`}
                style={{ "--card-accent": fighter.accent } as CSSProperties}
                onClick={() => pickCard(i)}
                aria-label={`Select fighter ${fighter.title}`}
                aria-pressed={i === index}
              >
                <Portrait p={fighter} />
                <span className="fighter-card-label"><b>{pad(fighter.n)}</b>{fighter.title}</span>
                {i === index && <span className="card-cursor" aria-hidden>▼</span>}
                {locked === i && <span className="card-ready" aria-hidden>READY</span>}
              </button>
            ))}
          </div>

          <div className="fighter-actions">
            <button className="btn !px-3" onClick={random} aria-label="Random fighter">RANDOM <span className="hidden sm:inline">[R]</span></button>
            <button className="btn btn-gold fighter-confirm" onClick={lockIn}>LOCK IN <span aria-hidden>►</span></button>
          </div>
          <div className="font-crt text-[8.5px] text-steeldim text-center pb-2 tracking-wider">ARROWS / SWIPE TO SELECT · ENTER OR TAP SELECTED PORTRAIT TO LOCK IN</div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">{showLock ? `${p.title} locked in. Player one ready.` : `${p.title}, ${p.role}.`}</div>

      {showLock && locked !== null && (
        <div key={lockRun} className="fighter-lockin" role="dialog" aria-label={`${PHOTOS[locked].title} selected`} style={{ "--accent": PHOTOS[locked].accent } as CSSProperties}>
          <div className="lock-flash" aria-hidden />
          <div className="lock-lines" aria-hidden />
          <div className="lock-portrait"><Portrait p={PHOTOS[locked]} stage /></div>
          <div className="lock-copy">
            <div className="lock-challenger">CHALLENGER APPROACHING</div>
            <div className="lock-name">{PHOTOS[locked].title}</div>
            <div className="lock-ready">PLAYER 1 <strong>READY!</strong></div>
            <div className="lock-quote">“{PHOTOS[locked].quote}”</div>
            <div className="lock-actions">
              <button className="btn btn-gold" autoFocus onClick={() => setShowLock(false)}>CONTINUE</button>
              <button className="btn" onClick={() => { setLocked(null); setShowLock(false); audio.sfx("click"); }}>CHANGE FIGHTER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
