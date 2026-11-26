import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CAKE, FINALE, PERSON } from "../config";
import { CakeArt, HeroRocket, Icon, Skyline } from "../art";
import { audio, useAudio } from "../audio";
import { useReducedMotion } from "../hooks";

const BG = "#0A0F0E";
const GOLD = ["#FFE2A6", "#FFB436", "#FFF3C9", "#FFC766"];
const HUES = ["#FF5A2A", "#2CF5B4", "#FFB436", "#39FF14", "#FF3B30", "#FFE2A6", "#7FD8FF"];
type Shell = "peony" | "ring" | "willow" | "chrys" | "cross" | "palm";
const SHELLS: Shell[] = ["peony", "ring", "willow", "chrys", "cross", "palm"];

interface Spark {
  x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; max: number;
  size: number; col: string; grav: number; drag: number; tw: boolean;
  trail?: boolean;    // sheds a tail of embers
  split?: number;     // breaks into a small star at this age
  crackle?: boolean;  // pops into a white twinkle when it dies
}
type NewSpark = Omit<Spark, "px" | "py" | "life">;
interface Rocket { x: number; y: number; ty: number; col: string; shell: Shell; scale: number; quiet: boolean }
interface Glow { x: number; y: number; r: number; life: number; max: number; col: string }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <X,>(a: X[]) => a[Math.floor(Math.random() * a.length)];

export function Finale({ onReturn }: { onReturn: () => void }) {
  const reduced = useReducedMotion();
  const st = useAudio();
  const [runId, setRunId] = useState(0);
  const [phase, setPhase] = useState(0);
  const [reveal, setReveal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const landRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const audioStarted = useRef(false);
  const skipFn = useRef<(() => void) | null>(null);

  const allOut = useMemo(() => Array(Math.max(1, CAKE.candles)).fill(false) as boolean[], []);
  const motes = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    left: `${(i * 71) % 100}%`, size: 1.6 + (i % 3) * 1.4, dur: 11 + (i % 5) * 4, delay: -(i * 2.3), op: 0.2 + (i % 4) * 0.1, mx: (i % 2 ? 1 : -1) * (10 + i * 4),
  })), []);

  useEffect(() => {
    if (!audioStarted.current) { audioStarted.current = true; void audio.toFinale(); }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (landRef.current) landRef.current.style.transform = "";
    if (cloudRef.current) cloudRef.current.style.transform = "";

    let w = 0, h = 0, small = false, unit = 8;
    let stars: { x: number; y: number; r: number; tw: number; ts: number; depth: number }[] = [];
    const sparks: Spark[] = [], rockets: Rocket[] = [], glows: Glow[] = [];
    const later: { at: number; fn: () => void }[] = [];

    const drawStars = (now: number, parallax: number, still = false) => {
      for (const s of stars) {
        const a = still ? 0.75 : 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.ts + s.tw));
        ctx.globalAlpha = a * (0.4 + s.depth * 0.6);
        ctx.fillStyle = s.depth === 1 ? "#FFF9EF" : "#cfd6e4";
        const y = (s.y + parallax * s.depth) % (h * 0.95);
        ctx.beginPath(); ctx.arc(s.x, y < 0 ? y + h : y, s.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight; small = w < 768; unit = Math.min(w, h) / 100;
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: small ? 90 : 170 }).map(() => ({
        x: Math.random() * w, y: Math.random() * h * 0.85, r: 0.4 + Math.random() * 1.3,
        tw: Math.random() * 6.28, ts: 0.4 + Math.random() * 1.4, depth: [0.35, 0.6, 1][Math.floor(Math.random() * 3)],
      }));
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
      if (reduced) drawStars(performance.now(), 0, true);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── CALM MODE: three still beats, no movement ── */
    if (reduced) {
      setPhase(0); setReveal(false);
      const paintBloom = (x: number, y: number, r: number, col: string) => {
        for (let i = 0; i < 52; i++) {
          const a = Math.random() * 6.283, d = r * (0.2 + Math.random() * 0.8);
          ctx.globalAlpha = 0.8 * (1 - d / r) + 0.12; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.5, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      };
      const timers: number[] = [];
      timers.push(window.setTimeout(() => {
        setPhase(1);
        paintBloom(w * 0.3, h * 0.3, Math.min(w, h) * 0.17, "#FFB436");
        paintBloom(w * 0.72, h * 0.22, Math.min(w, h) * 0.12, "#2CF5B4");
        paintBloom(w * 0.55, h * 0.44, Math.min(w, h) * 0.1, "#FF5A2A");
      }, 2600));
      timers.push(window.setTimeout(() => { setPhase(5); setReveal(true); }, 5600));
      skipFn.current = () => { timers.forEach(clearTimeout); setPhase(5); setReveal(true); };
      return () => { timers.forEach(clearTimeout); window.removeEventListener("resize", resize); skipFn.current = null; };
    }

    /* ── FULL MOTION: the directed film ── */
    const T = FINALE.timings;
    const b1 = T.wish, b2 = b1 + T.celebration, b3 = b2 + T.closeup, b4 = b3 + T.ascent, b5 = b4 + T.explosion;
    const t0 = performance.now();
    let phaseL = 0, phaseStart = t0, nowL = t0, skipped = false, ascended = false;
    let nextLaunch = 0, barrage = false, revealed = false, heldParallax = 0, heroH = 260;

    const cap = () => (small ? 650 : 1500);
    const add = (p: NewSpark) => { if (sparks.length < cap()) sparks.push({ ...p, px: p.x, py: p.y, life: 0 }); };
    const glow = (x: number, y: number, r: number, col: string, max = 16) => { glows.push({ x, y, r, col, life: 0, max }); };
    const after = (ms: number, fn: () => void) => { later.push({ at: nowL + ms, fn }); };

    /* one shell bursting: six kinds, each with its own shape and fall */
    const burst = (x: number, y: number, shell: Shell, col: string, scale = 1, quiet = false) => {
      const n = Math.round((small ? 54 : 96) * scale), sp = unit * rnd(0.6, 0.8) * Math.sqrt(scale);
      const ray = (a: number, v: number, o: Partial<NewSpark> = {}) =>
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, max: rnd(85, 135), size: rnd(1.1, 2.1), col, grav: 0.022, drag: 0.982, tw: Math.random() < 0.3, ...o });
      if (shell === "peony") {
        for (let i = 0; i < n; i++) ray(rnd(0, 6.283), sp * (0.3 + 0.7 * Math.sqrt(Math.random())), { col: i % 5 === 0 ? "#FFF9EF" : col });
      } else if (shell === "ring") {
        const m = Math.round(n * 0.7);
        for (let i = 0; i < m; i++) ray((i / m) * 6.283, sp, { tw: false, size: 1.8 });
        for (let i = 0; i < n / 4; i++) ray(rnd(0, 6.283), sp * rnd(0.15, 0.42), { col: "#FFF9EF", max: rnd(50, 80) });
      } else if (shell === "willow") {
        for (let i = 0; i < n * 0.8; i++) ray(rnd(0, 6.283), sp * rnd(0.45, 1), { col: pick(GOLD), grav: 0.055, drag: 0.972, max: rnd(150, 210), size: 1.4, tw: false, trail: true });
      } else if (shell === "chrys") {
        for (let i = 0; i < n; i++) ray(rnd(0, 6.283), sp * rnd(0.55, 1), { max: rnd(95, 125), trail: i % 2 === 0, crackle: true, tw: false });
      } else if (shell === "cross") {
        for (let i = 0; i < 12; i++) ray((i / 12) * 6.283 + 0.2, sp * 0.85, { size: 2.6, max: 60, split: 30, tw: false });
      } else {
        for (let i = 0; i < 9; i++) ray((i / 9) * 6.283 + rnd(-0.12, 0.12), sp * 1.05, { size: 2.8, grav: 0.05, drag: 0.976, max: rnd(110, 140), tw: false, trail: true });
      }
      glow(x, y, unit * 30 * Math.sqrt(scale), col);
      glow(x, y, unit * 11 * Math.sqrt(scale), "#FFF3C9", 10);
      if (!quiet) audio.sfx("pop");
    };
    /* a rocket leaves the ground in a spray of sparks and climbs to its apex */
    const launch = (x: number, ty: number, o: { shell?: Shell; col?: string; scale?: number; quiet?: boolean } = {}) => {
      const y0 = ascended ? h + 6 : h * 0.9;
      rockets.push({ x, y: y0, ty, col: o.col ?? pick(HUES), shell: o.shell ?? pick(SHELLS), scale: o.scale ?? rnd(0.85, 1.25), quiet: !!o.quiet });
      for (let i = 0; i < 12; i++) add({ x, y: y0, vx: rnd(-2, 2), vy: -rnd(0, 3), max: 30, size: 1.3, col: "#FFB436", grav: 0.07, drag: 0.97, tw: false });
      if (!o.quiet) audio.sfx("launch");
    };

    const enterPhase = (p: number, now: number) => {
      phaseL = p; phaseStart = now; setPhase(p);
      if (p === 1) {
        nextLaunch = now + 900;
        [0.3, 0.68, 0.5].forEach((x, i) => after(i * 260, () => launch(w * x, h * rnd(0.16, 0.34))));
      }
      if (p === 2) { // the cinematic cut: clear the sky
        rockets.length = 0; sparks.length = 0; glows.length = 0; later.length = 0;
        ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
        heroH = heroRef.current?.offsetHeight || 260;
      }
      if (p === 3) {
        ascended = true; audio.sfx("launch");
        for (let i = 0; i < 44; i++) add({ x: w / 2, y: h * 0.6 + heroH * 0.42, vx: rnd(-4.5, 4.5), vy: rnd(0, 3), max: 40, size: 1.6, col: GOLD[i % 4], grav: 0.05, drag: 0.96, tw: true });
      }
      if (p === 4) { // the grand explosion: three layers from the hero, then answering shells
        const cx = w / 2, cy = h * 0.32;
        ctx.fillStyle = "rgba(10,15,14,0.5)"; ctx.fillRect(0, 0, w, h);
        burst(cx, cy, "chrys", "#FFB436", 2.6);
        after(150, () => burst(cx, cy, "ring", "#FF5A2A", 1.7, true));
        after(380, () => burst(cx, cy, "willow", "#FFE2A6", 2.2, true));
        after(520, () => { launch(w * 0.26, h * 0.26); launch(w * 0.76, h * 0.3, { quiet: true }); });
        after(1400, () => { launch(w * 0.62, h * 0.46); launch(w * 0.16, h * 0.5, { quiet: true }); });
        after(2500, () => { launch(w * 0.86, h * 0.2); launch(w * 0.4, h * 0.56, { quiet: true }); });
      }
      if (p === 5) nextLaunch = now + 700;
    };

    /* one 60 Hz tick: timeline, then simulate and draw */
    const frame = (now: number) => {
      nowL = now;
      const t = now - t0;
      const p = skipped ? 5 : t < b1 ? 0 : t < b2 ? 1 : t < b3 ? 2 : t < b4 ? 3 : t < b5 ? 4 : 5;
      if (p !== phaseL) enterPhase(p, now);
      const pt = now - phaseStart;
      for (let i = later.length - 1; i >= 0; i--) if (now >= later[i].at) later.splice(i, 1)[0].fn();
      if (p < 1) return;

      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      ctx.fillStyle = p === 4 ? "rgba(10,15,14,0.14)" : "rgba(10,15,14,0.2)"; // lower = longer trails
      ctx.fillRect(0, 0, w, h);

      let parallax = p >= 4 ? heldParallax : 0;
      if (p === 1 && pt < T.celebration - 1500) {
        if (now > nextLaunch) { nextLaunch = now + rnd(380, 640); launch(w * rnd(0.1, 0.9), h * rnd(0.12, 0.44)); }
        if (!barrage && pt > T.celebration * 0.5) {
          barrage = true;
          [0.16, 0.38, 0.62, 0.84].forEach((x, i) => after(i * 130, () => launch(w * x, h * rnd(0.14, 0.26), { shell: i % 2 ? "ring" : "chrys", quiet: i > 1 })));
        }
      }
      if (p === 2) {
        const pr = Math.min(1, pt / T.closeup);
        if (heroRef.current) heroRef.current.style.transform = `translate(-50%, ${h * 0.56 - heroH / 2}px) scale(${1 + pr * 0.08})`;
        if (Math.random() < 0.4) add({ x: w / 2 + rnd(-5, 5), y: h * 0.56 + heroH * 0.42, vx: rnd(-0.7, 0.7), vy: rnd(0.6, 1.6), max: 34, size: 1.2, col: GOLD[0], grav: 0.03, drag: 0.98, tw: false });
      }
      if (p === 3) {
        const pr = Math.min(1, pt / T.ascent);
        const ease = pr < 0.82 ? Math.pow(pr / 0.82, 2.1) * 0.9 : 0.9 + 0.1 * (1 - Math.pow(1 - (pr - 0.82) / 0.18, 2));
        parallax = ease * h * 1.15; heldParallax = parallax;
        const ry = h * (0.6 - 0.28 * ease);
        if (heroRef.current) heroRef.current.style.transform = `translate(-50%, ${ry - heroH / 2}px) scale(0.92)`;
        if (cloudRef.current) cloudRef.current.style.transform = `translateY(${ease * 60}vh)`;
        if (landRef.current) landRef.current.style.transform = `translateY(${ease * 130}%)`;
        for (let i = 0; i < (small ? 2 : 4); i++) add({ x: w / 2 + rnd(-7, 7), y: ry + heroH * 0.4, vx: rnd(-0.8, 0.8), vy: rnd(2.4, 5.8), max: rnd(46, 86), size: rnd(1.3, 2.7), col: pick(GOLD), grav: 0.02, drag: 0.99, tw: true });
      }
      if (p === 4 && !revealed && pt > 1900) { // gold sparks gather toward the lettering
        revealed = true; setReveal(true);
        const cx = w / 2, cy = h * 0.42, R = Math.min(w, h) * 0.46;
        for (let i = 0; i < (small ? 40 : 70); i++) {
          const a = rnd(0, 6.283);
          add({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, vx: -Math.cos(a) * 2.4, vy: -Math.sin(a) * 2.4, max: 120, size: 1.5, col: GOLD[i % 4], grav: 0, drag: 0.992, tw: true });
        }
      }
      if (p === 5 && now > nextLaunch) { // the show goes on around the greeting, kept to the edges
        nextLaunch = now + rnd(650, 1250);
        const top = Math.random() < 0.25;
        const x = top ? rnd(0.35, 0.65) : Math.random() < 0.5 ? rnd(0.05, 0.3) : rnd(0.7, 0.95);
        launch(w * x, h * (top ? rnd(0.06, 0.13) : rnd(0.12, 0.5)), { scale: rnd(0.7, 1.05), quiet: Math.random() < 0.6 });
      }

      drawStars(now, parallax);
      ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";

      for (let i = glows.length - 1; i >= 0; i--) { // soft light bloom at each burst
        const g = glows[i];
        g.life++;
        if (g.life >= g.max) { glows.splice(i, 1); continue; }
        const k = g.life / g.max, r = g.r * (0.6 + 0.4 * k);
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
        grad.addColorStop(0, g.col); grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = (1 - k) * 0.22; ctx.fillStyle = grad;
        ctx.fillRect(g.x - r, g.y - r, r * 2, r * 2);
      }

      for (let i = rockets.length - 1; i >= 0; i--) { // rising comets: fast off the ground, slowing to the apex
        const r = rockets[i];
        r.y -= (r.y - r.ty) * 0.032 + 1.3;
        r.x += Math.sin(r.y * 0.045 + r.ty) * 0.5;
        ctx.globalAlpha = 0.3; ctx.fillStyle = r.col;
        ctx.beginPath(); ctx.arc(r.x, r.y, 8, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = "#FFF3C9";
        ctx.beginPath(); ctx.arc(r.x, r.y, 2.8, 0, 6.283); ctx.fill();
        for (let k = 0; k < 2; k++) add({ x: r.x + rnd(-1.5, 1.5), y: r.y + 6, vx: rnd(-0.45, 0.45), vy: rnd(1, 2.6), max: rnd(30, 46), size: 1.2, col: k ? r.col : "#FFB436", grav: 0.03, drag: 0.98, tw: true });
        if (r.y <= r.ty + 3) { rockets.splice(i, 1); burst(r.x, r.y, r.shell, r.col, r.scale, r.quiet); }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const q = sparks[i];
        q.life++;
        if (q.life >= q.max) {
          if (q.crackle && Math.random() < 0.35) add({ x: q.x, y: q.y, vx: rnd(-0.6, 0.6), vy: rnd(-0.6, 0.6), max: rnd(10, 22), size: 1.5, col: "#FFF9EF", grav: 0.01, drag: 0.95, tw: true });
          sparks.splice(i, 1); continue;
        }
        if (q.split && q.life === q.split) { // crossette: the star breaks into a smaller star
          for (let k = 0; k < 5; k++) {
            const a = (k / 5) * 6.283 + i;
            add({ x: q.x, y: q.y, vx: Math.cos(a) * unit * 0.34, vy: Math.sin(a) * unit * 0.34, max: rnd(50, 75), size: 1.5, col: q.col, grav: 0.03, drag: 0.975, tw: true });
          }
          glow(q.x, q.y, unit * 9, q.col, 10);
          sparks.splice(i, 1); continue;
        }
        q.px = q.x; q.py = q.y;
        q.vx *= q.drag; q.vy = q.vy * q.drag + q.grav;
        q.x += q.vx; q.y += q.vy;
        if (q.trail && (q.life & 1) === 0 && sparks.length < cap() * 0.8) add({ x: q.x, y: q.y, vx: rnd(-0.15, 0.15), vy: rnd(0, 0.3), max: rnd(14, 26), size: q.size * 0.55, col: q.col, grav: 0.015, drag: 0.96, tw: true });
        const lf = 1 - q.life / q.max;
        ctx.globalAlpha = Math.min(1, lf * 1.6) * (q.tw ? 0.55 + 0.45 * Math.sin(q.life * 0.5 + i) : 1);
        const dx = q.x - q.px, dy = q.y - q.py, wd = q.size * (0.55 + lf * 0.7);
        if (dx * dx + dy * dy > 0.6) { // a streak along the direction of travel
          ctx.strokeStyle = q.col; ctx.lineWidth = wd;
          ctx.beginPath(); ctx.moveTo(q.px, q.py); ctx.lineTo(q.x, q.y); ctx.stroke();
        } else {
          ctx.fillStyle = q.col;
          ctx.beginPath(); ctx.arc(q.x, q.y, wd * 0.6, 0, 6.283); ctx.fill();
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    };

    /* run the simulation at a steady 60 ticks a second on any display */
    let raf = 0, acc = 0, last = t0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      acc += Math.min(100, now - last); last = now;
      let n = 0;
      while (acc >= 15 && n < 4) { acc -= 16.667; n++; frame(now); }
      if (n === 4) acc = 0;
    };
    raf = requestAnimationFrame(loop);

    /* watchdog: the greeting must appear even if the animation loop is starved */
    const watchdog = window.setTimeout(() => {
      if (phaseL < 5) { skipped = true; setPhase(5); setReveal(true); }
    }, b5 + 4000);

    skipFn.current = () => { skipped = true; sparks.length = 0; rockets.length = 0; glows.length = 0; later.length = 0; setReveal(true); };

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(watchdog);
      window.removeEventListener("resize", resize);
      skipFn.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, reduced]);

  const replay = () => {
    setPhase(0);
    setReveal(false);
    setRunId((r) => r + 1);
  };

  const showGreeting = reveal || phase === 5;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden dark-zone bg-middeep">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transition-opacity duration-1000" style={{ opacity: phase >= 1 ? 1 : 0 }} aria-hidden />

      {/* clouds (parallax layer) */}
      <div ref={cloudRef} className="absolute inset-x-0 top-[8vh] h-[40vh] pointer-events-none transition-opacity duration-700" style={{ opacity: phase === 1 || phase === 2 || phase === 3 ? 1 : 0 }}>
        <svg viewBox="0 0 1200 400" className="w-full h-full cloud-drift" preserveAspectRatio="none" aria-hidden>
          <g fill="#F5EDDB" opacity="0.05">
            <ellipse cx="220" cy="110" rx="200" ry="34" /><ellipse cx="340" cy="90" rx="130" ry="26" />
            <ellipse cx="880" cy="200" rx="240" ry="38" /><ellipse cx="1020" cy="180" rx="140" ry="26" />
            <ellipse cx="560" cy="320" rx="180" ry="28" />
          </g>
        </svg>
      </div>

      {/* city skyline */}
      <div ref={landRef} className="absolute inset-x-0 bottom-0 h-[16vh] transition-opacity duration-1000" style={{ opacity: phase >= 1 ? 1 : 0 }}>
        <Skyline />
      </div>

      {/* SHOT 1 — the wish, on the darkening cake (crossfades into the sky) */}
      {phase <= 1 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none" style={{ opacity: phase === 0 ? 1 : 0, transition: "opacity 1.2s ease" }}>
          <div className="w-[min(92vw,640px)] flex-1 min-h-0 grid place-items-center">
            <CakeArt lit={allOut} dim />
          </div>
          <p className="font-editorial italic gold-text text-[clamp(17px,3.4vw,27px)] text-center pb-[8vh] fade-in-slow">{FINALE.wish}</p>
        </div>
      )}

      {/* SHOTS 3–4 — the hero firework */}
      <div
        ref={heroRef}
        className="absolute left-1/2 top-0 w-[min(44vw,210px)] z-[8] pointer-events-none transition-opacity duration-300"
        style={{ opacity: phase === 2 || phase === 3 ? 1 : 0, filter: "drop-shadow(0 0 24px rgba(255,180,54,0.45))" }}
      >
        <HeroRocket fuse={phase === 2} thrust={phase === 3} />
      </div>
      {phase === 2 && (
        <p className="absolute bottom-[9vh] inset-x-0 text-center font-hand text-goldbright/90 text-lg z-20 fade-in-slow">one last firework…</p>
      )}

      {/* SHOT 5 — soft flash */}
      {phase === 4 && <div key={runId} className="absolute inset-0 flash z-[15] pointer-events-none" />}

      {/* floating gold motes in the greeting */}
      {phase === 5 && motes.map((m, i) => (
        <span key={i} className="mote z-[16]" style={{ left: m.left, bottom: "-4vh", width: m.size, height: m.size, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`, "--mo": m.op, "--mx": `${m.mx}px` } as CSSProperties} />
      ))}

      {/* SHOTS 5–6 — the greeting */}
      {showGreeting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-5">
          <div className="relative">
            <svg viewBox="0 0 300 120" className="absolute -inset-x-16 top-1/2 -translate-y-1/2 w-[calc(100%+128px)] h-auto opacity-70" aria-hidden>
              <path d="M10 60c40-26 70-26 96 0M194 60c26-26 56-26 96 0" stroke="#C8A36D" strokeWidth="1.6" fill="none" />
              <path d="M30 74c30-16 52-16 74 0M196 74c22-16 44-16 74 0" stroke="#C8A36D" strokeWidth="0.9" fill="none" opacity="0.7" />
              <path d="M150 6l3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#E8C98A" />
            </svg>
            <div className="big21 greeting-reveal relative text-[clamp(96px,24vh,210px)] font-bold">{PERSON.age}</div>
          </div>
          <h1 className="greeting-reveal font-editorial font-bold gold-text tracking-[0.08em] text-[clamp(19px,4.4vw,42px)] mt-2" style={{ animationDelay: "0.35s" }}>
            {FINALE.greeting}
          </h1>
          <p className="fade-in-slow font-editorial italic text-ivory/90 text-[clamp(14px,2.3vw,21px)] mt-4 max-w-xl" style={{ animationDelay: "1s" }}>
            {FINALE.line1}
          </p>
          <p className="fade-in-slow font-hand text-goldbright/90 text-[clamp(15px,2.4vw,22px)] mt-2" style={{ animationDelay: "1.6s" }}>
            {FINALE.line2}
          </p>
          {phase === 5 && (
            <div className="flex flex-wrap justify-center gap-3 mt-8 fade-in" style={{ animationDelay: "2.2s" }}>
              <button className="btn btn-dark text-[12px]" onClick={replay}>↻ Replay finale</button>
              <button className="btn btn-dark text-[12px]" onClick={onReturn}>Return to desktop</button>
            </div>
          )}
        </div>
      )}

      {/* discreet controls during the sequence */}
      {phase < 5 && (
        <button className="absolute bottom-4 right-4 z-30 btn btn-dark text-[10.5px] !py-2" onClick={() => skipFn.current?.()}>
          Skip to greeting →
        </button>
      )}
      <button className="absolute top-3 right-3 z-30 btn btn-dark !px-2.5" onClick={() => audio.toggleMute()} aria-label={st.muted ? "Unmute all sound" : "Mute all sound"}>
        <Icon id={st.muted ? "muted" : "speaker"} size={18} />
      </button>
    </div>
  );
}
