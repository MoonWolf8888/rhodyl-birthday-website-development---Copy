// One-shot patcher: firework launches, workshop palette, wallpaper wiring, test updates.
import fs from "fs";
import path from "path";

const read = (f) => fs.readFileSync(f, "utf8");
const write = (f, s) => fs.writeFileSync(f, s);
/** replace `count` lines starting at the first line containing `key` */
function lines(f, key, count, text) {
  const a = read(f).split("\n");
  const i = a.findIndex((l) => l.includes(key));
  if (i < 0) throw new Error("key not found in " + f + ": " + key);
  a.splice(i, count, text);
  write(f, a.join("\n"));
}
function swap(f, from, to) {
  const s = read(f);
  if (!s.includes(from)) throw new Error("string not found in " + f + ": " + from);
  write(f, s.split(from).join(to));
}

/* ── 1. FINALE: every firework launches, climbs, and explodes ── */
const F = "src/components/Finale.tsx";
lines(F, "interface Rocket {", 1, `interface Rocket { x: number; y: number; vy: number; ty: number; col: string; kind: number; q?: boolean; }`);
lines(F, `if (!quiet) audio.sfx("pop");`, 2, `      if (!quiet) audio.sfx("pop");
    };
    /* a rocket leaves the ground with a spray of sparks, then climbs to its apex */
    const launch = (x: number, ty: number, fromY: number, q = false) => {
      rockets.push({ x, y: fromY, vy: 0, ty, col: MIX[Math.floor(Math.random() * MIX.length)], kind: Math.floor(Math.random() * 3), q });
      for (let i = 0; i < 12; i++) push({ x, y: fromY, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3, life: 0, max: 30, size: 1.3, col: "#FFB436", grav: 0.07, drag: 0.97, tw: false });
      if (!q) audio.sfx("launch");
    };`);
lines(F, "const kind = Math.floor(Math.random() * 3);", 3, `          launch(w * (0.14 + Math.random() * 0.72), h * (0.14 + Math.random() * 0.3), h * 0.9);`);
lines(F, "const r = rockets[i];", 10, `        const r = rockets[i];
        r.vy = -((r.y - r.ty) * 0.032 + 1.3); // fast off the ground, slowing toward the apex
        r.y += r.vy; r.x += Math.sin(r.y * 0.045 + r.ty) * 0.5;
        ctx.globalAlpha = 0.3; ctx.fillStyle = r.col;
        ctx.beginPath(); ctx.arc(r.x, r.y, 8, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = "#FFF3C9";
        ctx.beginPath(); ctx.arc(r.x, r.y, 2.8, 0, 6.283); ctx.fill();
        for (let k = 0; k < 2; k++) push({ x: r.x + (Math.random() - 0.5) * 3, y: r.y + 6, vx: (Math.random() - 0.5) * 0.9, vy: 1 + Math.random() * 1.6, life: 0, max: 30 + Math.random() * 16, size: 1.2, col: k ? r.col : "#FFB436", grav: 0.03, drag: 0.98, tw: true });
        if (r.y <= r.ty + 3) {
          rockets.splice(i, 1);
          const n = Math.round((small ? 60 : 105) * (r.q ? 0.6 : 1)), sp = Math.min(w, h) * (0.0055 + Math.random() * 0.004);
          push({ x: r.x, y: r.y, vx: 0, vy: 0, life: 0, max: 9, size: 26, col: "#FFF3C9", grav: 0, drag: 1, tw: false });
          burst(r.x, r.y, n, sp, r.kind === 2 ? GOLD : [r.col, "#FFF9EF", r.col, "#FFE2A6"], r.kind, r.q);
          burst(r.x, r.y, Math.round(n / 3), sp * 0.45, ["#FFF9EF"], 1, true);
        }`);
lines(F, "if (!bloom1 && pt > 800)", 2, `        if (!bloom1 && pt > 500) { bloom1 = true; launch(w * 0.3, h * 0.24, h + 6); launch(w * 0.74, h * 0.3, h + 6, true); }
        if (!bloom2 && pt > 1500) { bloom2 = true; launch(w * 0.62, h * 0.42, h + 6); launch(w * 0.2, h * 0.5, h + 6, true); }`);
lines(F, "nextDistant = now + 3600", 2, `        nextDistant = now + 2400 + Math.random() * 1600;
        launch(w * (0.1 + Math.random() * 0.8), h * (0.08 + Math.random() * 0.3), h + 6, true);`);
lines(F, "if (p === 3 && !launched3)", 1, `      if (p === 3 && !launched3) {
        launched3 = true; audio.sfx("launch");
        for (let i = 0; i < 44; i++) push({ x: w / 2, y: h * 0.6 + heroH * 0.42, vx: (Math.random() - 0.5) * 9, vy: Math.random() * 3, life: 0, max: 40, size: 1.6, col: GOLD[i % 4], grav: 0.05, drag: 0.96, tw: true });
      }`);
swap(F, `<HeroRocket fuse={phase === 2} />`, `<HeroRocket fuse={phase === 2} thrust={phase === 3} />`);
swap(F, `import { CakeArt, HeroRocket, Icon, Landscape } from "../art";`, `import { CakeArt, HeroRocket, Icon, Skyline } from "../art";`);
swap(F, `<Landscape />`, `<Skyline />`);

/* ── 2. ART: thrust flame, neon skyline, machine label ── */
const A = "src/art.tsx";
swap(A, `export function HeroRocket({ fuse = true }: { fuse?: boolean }) {`, `export function HeroRocket({ fuse = true, thrust = false }: { fuse?: boolean; thrust?: boolean }) {`);
swap(A, `<svg viewBox="0 0 200 330" className="w-full h-full" aria-hidden>`, `<svg viewBox="0 0 200 330" className="w-full h-full" style={{ overflow: "visible" }} aria-hidden>`);
swap(A, `<path d="M84 246h32l-6 16H90z" fill="#705C4D" stroke={INK} strokeWidth="2.2" />`, `<path d="M84 246h32l-6 16H90z" fill="#705C4D" stroke={INK} strokeWidth="2.2" />
      {thrust && (
        <g className="thrust" style={{ transformOrigin: "100px 262px" }}>
          <path d="M84 262c-8 40 6 70 16 98 10-28 24-58 16-98z" fill="#FF8A1F" opacity="0.9" />
          <path d="M91 262c-4 26 3 46 9 64 6-18 13-38 9-64z" fill="#FFE2A6" />
        </g>
      )}`);
swap(A, `fill="#F0C75E">RHODYL SYSTEMS · model 21`, `fill="#1A0D06" fontWeight="bold">KIBO·RHODYL SYSTEM · 21`);
fs.appendFileSync(A, `
/* ── Neon city skyline for the night sky ── */
export function Skyline() {
  const B = [[0, 70, 90], [80, 110, 70], [150, 60, 110], [250, 130, 60], [310, 90, 100], [400, 50, 80], [470, 120, 90], [560, 80, 70], [630, 140, 100], [720, 70, 90], [800, 100, 80], [880, 56, 110], [980, 124, 70], [1040, 84, 100], [1140, 110, 90], [1220, 64, 80], [1300, 96, 140]];
  const LIGHTS = ["#2CF5B4", "#FFB436", "#FF5A2A"];
  return (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden>
      {B.map(([x, hgt, wd], i) => (
        <g key={i}>
          <rect x={x} y={200 - hgt} width={wd} height={hgt} fill={i % 2 ? "#0B100E" : "#070A09"} />
          {Array.from({ length: Math.floor(hgt / 22) }).map((_, r) => (
            <rect key={r} x={x + 8 + ((r * 17 + i * 5) % (wd - 22))} y={200 - hgt + 10 + r * 20} width="7" height="5" fill={LIGHTS[(r + i) % 3]} opacity="0.85" className="window-glow" style={{ animationDelay: (i + r) * 0.7 + "s" }} />
          ))}
          {i % 4 === 1 && <rect x={x + wd / 2 - 1} y={200 - hgt - 26} width="2" height="26" fill="#0B100E" />}
          {i % 4 === 1 && <circle cx={x + wd / 2} cy={200 - hgt - 28} r="2.4" fill="#FF3B30" className="crt-led" />}
        </g>
      ))}
    </svg>
  );
}
`);

/* ── 3. WALLPAPER wiring ── */
const D = "src/components/Desktop.tsx";
lines(D, `<div className="grid-floor" aria-hidden />`, 3, `      <div className="absolute inset-0" aria-hidden style={{ backgroundImage: "url(" + wall + ")", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" aria-hidden style={{ background: "linear-gradient(90deg, rgba(8,6,5,.84) 0%, rgba(8,6,5,.4) 26%, rgba(8,6,5,.22) 70%, rgba(8,6,5,.55) 100%), linear-gradient(180deg, rgba(8,6,5,.3), rgba(8,6,5,.08) 45%, rgba(8,6,5,.72))" }} />
      <div className="desktop-scan z-[1]" aria-hidden />`);
write(D, `import wall from "../assets/wall.jpg";\n` + read(D));
const Bt = "src/components/Boot.tsx";
lines(Bt, "const ROOM_BG =", 1, `const ROOM_BG = "linear-gradient(rgba(8,6,5,.74), rgba(8,6,5,.9)), url(" + wall + ") center / cover no-repeat";`);
write(Bt, `import wall from "../assets/wall.jpg";\n` + read(Bt));

/* ── 4. PALETTE: cold blue-black + cyan/magenta → warm workshop rust, amber, teal ── */
const MAP = {
  "#0A0D13": "#0D0A08", "#12161F": "#17110D", "#1A2029": "#221811", "#2A3140": "#4A3222", "#0C1017": "#100C09",
  "#05070B": "#070504", "#07090E": "#080605", "#10141D": "#15100C", "#171D2A": "#1F1711", "#0E1219": "#120D0A",
  "#161C28": "#1C140E", "#222A3A": "#2A1D14", "#2C3650": "#3A2819", "#1B2333": "#24190F", "#3A4254": "#5A3D28",
  "#303948": "#4A3222", "#161C26": "#1A130E", "#1B2130": "#2A1A10", "#0E121B": "#140E0A",
  "#3E4557": "#E86A3A", "#262C3A": "#C2421F", "#14181F": "#7E2613", "#1B202B": "#8E2D16",
  "#9AA3B5": "#C9B79C", "#5C6577": "#8A7660",
  "#F0C75E": "#FFB436", "#FFE9A8": "#FFE2A6", "#97783A": "#A8642A", "#6b5a2e": "#7A4A22", "#C89B3C": "#D9822B", "#FFAA33": "#FF8A1F",
  "240, 199, 94": "255, 180, 54", "240,199,94": "255,180,54",
  "#3EE8FF": "#2CF5B4", "62, 232, 255": "44, 245, 180", "62,232,255": "44,245,180",
  "#FF4FD8": "#FF5A2A", "255, 79, 216": "255, 90, 42", "255,79,216": "255,90,42", "#FF3860": "#FF3B30",
  "#141926": "#0A0F0E", "20,25,38": "10,15,14", "#1A2030": "#0E1513", "#10141f": "#060908",
  "#CFF8FF": "#D6FFF1", "#FFD6F4": "#FFE0D0",
};
const ART = { "#A4B3A3": "#3FD1B0", "#8C9C8B": "#22A98A", "#B9807B": "#E2572F", "#C99a95": "#FF8A5C", "#9C6660": "#B93A1E", "#C8A36D": "#FFB436", "#D9B984": "#FFC766", "#4a4438": "#1A120C" };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const f of walk("src").filter((x) => /\.(tsx?|css)$/.test(x))) {
  let s = read(f);
  for (const [a, b] of Object.entries(MAP)) s = s.split(a).join(b);
  if (f.endsWith("art.tsx")) for (const [a, b] of Object.entries(ART)) s = s.split(a).join(b);
  write(f, s);
}

/* ── 5. WORKSHOP CHROME (appended so it overrides the earlier deck styles) ── */
fs.appendFileSync("src/index.css", `
/* ═══ KIBO WORKSHOP THEME ═══ */
.acid-text { color: #39FF14; text-shadow: 0 0 6px rgba(57, 255, 20, 0.75), 0 0 18px rgba(57, 255, 20, 0.35); }
.bev-out {
  background: linear-gradient(180deg, #2A1D14 0%, #17110D 100%); border: 1px solid #6B4226;
  box-shadow: inset 0 1px 0 rgba(255, 180, 54, 0.22), inset 0 0 0 1px rgba(7, 5, 4, 0.7);
}
.bev-in {
  background: #0B0806; border: 1px solid #4A3222;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.75), inset 0 0 18px rgba(44, 245, 180, 0.06);
}
.titlebar {
  background: repeating-linear-gradient(-45deg, rgba(7, 5, 4, 0.2) 0 8px, transparent 8px 16px), linear-gradient(90deg, #B93A1E 0%, #E2572F 50%, #FF8A1F 100%);
  border-bottom: 2px solid #070504; color: #1A0D06; text-shadow: 0 1px 0 rgba(255, 226, 166, 0.35);
}
.titlebar-inactive { background: linear-gradient(90deg, #4A2A1C, #6B3A22); color: #C9B79C; text-shadow: none; }
.tb-btn { background: #17110D !important; color: #FFB436; border: 1px solid #070504 !important; }
.window-shadow {
  box-shadow: 0 0 0 2px #070504, 0 0 0 3px #7A4A22, 0 0 34px rgba(44, 245, 180, 0.16), 0 0 60px rgba(255, 138, 31, 0.12), 12px 14px 0 rgba(0, 0, 0, 0.55);
}
.btn { background: linear-gradient(180deg, #3A2819, #1F1711); border: 1px solid #7A4A22; color: #FFE2A6; }
.btn:hover:not(:disabled) { background: linear-gradient(180deg, #4E351F, #2A1D14); color: #FFF3C9; }
.btn-gold {
  background: linear-gradient(180deg, #FFC766 0%, #FF8A1F 55%, #D9482B 100%); color: #1A0D06; border-color: #FFE2A6;
  filter: drop-shadow(0 0 8px rgba(255, 138, 31, 0.55));
}
.btn-gold:hover:not(:disabled) { background: linear-gradient(180deg, #FFE2A6, #FFA23F 55%, #E2572F); color: #070504; }
.btn-dark { background: rgba(13, 10, 8, 0.78); color: #FFB436; border: 1px solid #A8642A; }
.wallpaper { background: #0D0A08; }
.desktop-scan {
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.16) 0 1px, transparent 1px 4px), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(7, 5, 4, 0.6) 100%);
}
/* memory archive terminal */
.archive-screen { background: radial-gradient(ellipse at 50% 0%, rgba(57, 255, 20, 0.08), transparent 60%), #070A07; }
.tile {
  display: block; background: #0B0806; border: 1px solid #4A3222; cursor: pointer; padding: 0;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.tile:hover, .tile:focus-visible { border-color: #39FF14; box-shadow: 0 0 18px rgba(57, 255, 20, 0.3); transform: translateY(-2px); }
.crt-tile { background: #050806; }
.crt-tile-scan {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.22) 0 1px, transparent 1px 3px), radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
  box-shadow: inset 0 0 22px rgba(57, 255, 20, 0.12);
}
.no-signal {
  background: repeating-linear-gradient(90deg, rgba(57, 255, 20, 0.05) 0 2px, transparent 2px 7px), radial-gradient(ellipse at center, rgba(57, 255, 20, 0.12), transparent 70%), #050806;
}
.monitor {
  padding: 10px; border-radius: 14px; border: 2px solid #070504;
  background: linear-gradient(180deg, #E86A3A, #B93A1E);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.25), 0 0 34px rgba(44, 245, 180, 0.2), 0 10px 0 rgba(0, 0, 0, 0.4);
}
.monitor .crt-tile { border-radius: 7px; border: 2px solid #070504; }
/* rocket exhaust */
.thrust { animation: thrust 0.11s ease-in-out infinite alternate; }
@keyframes thrust { from { transform: scaleY(0.78); opacity: 0.85; } to { transform: scaleY(1.25); opacity: 1; } }
`);

/* ── 6. TESTS follow the new archive screen ── */
const T = "scripts/test.mjs";
lines(T, `await waitText("THE RHODYL EDITION");`, 17, `  await waitText("MEMORY_ARCHIVE");
  const tiles = await page.evaluate(() => document.querySelectorAll(".tile").length);
  if (tiles === 21) ok("archive terminal lays out 21 photo tiles"); else fail("tile count", tiles);
  const noLetter = await page.evaluate(() => !document.body.innerText.includes("A Note Before Chapter 22"));
  if (noLetter) ok("birthday letter removed from archives"); else fail("letter", "still present");
  const acid = await page.evaluate(() => getComputedStyle(document.querySelector(".tile .acid-text")).color);
  if (acid === "rgb(57, 255, 20)") ok("quotes render in neon green"); else fail("quote colour", acid);
  await shot("03-cover");
  await clickBtn("Open memory 01");
  await waitText("FILE 01 / 21");
  await clickBtn("Next file");
  await waitText("FILE 02 / 21");
  await page.keyboard.press("ArrowRight");
  await waitText("FILE 03 / 21");
  ok("viewer: next button + arrow key");
  await shot("04-scrapbook");`);
lines(T, `await waitText("Page 1 of 23");`, 1, `  await waitText("MEMORY_ARCHIVE");`);
lines(T, `await clickBtn("Next");`, 1, `  await clickBtn("Open memory 01"); await waitText("FILE 01 / 21"); await clickBtn("Next file");`);
lines(T, `await waitText("Page 2 of 23");`, 1, `  await waitText("FILE 02 / 21");`);
swap(T, `ok("mobile page turn works");`, `ok("mobile archive viewer works");`);
console.log("patch applied");
