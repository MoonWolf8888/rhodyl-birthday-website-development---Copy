/* The original SVG family: one outline voice across every illustration. */
import type { CSSProperties } from "react";
import { CAKE, PERSON } from "./config";

const INK = "#1A120C";
const S = { stroke: INK, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ── App & file icons (64×64) ─────────────────────────────────────── */
export function Icon({ id, size = 44 }: { id: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 64 64", fill: "none", "aria-hidden": true as const };
  switch (id) {
    case "folder": return (
      <svg {...p}>
        <path d="M8 18h16l6 6h26v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V18z" fill="#22A98A" {...S} />
        <rect x="20" y="12" width="26" height="20" rx="2" fill="#FFF9EF" {...S} transform="rotate(6 33 22)" />
        <path d="M24 26l6-6 5 5 4-3 5 5" {...S} strokeWidth={2} transform="rotate(6 33 22)" />
        <circle cx="28" cy="18" r="2.4" fill="#FFB436" stroke={INK} strokeWidth={1.6} transform="rotate(6 33 22)" />
        <path d="M8 30h48v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V30z" fill="#3FD1B0" {...S} />
        <path d="M14 36h20" {...S} strokeWidth={2} opacity={0.5} />
      </svg>);
    case "classified": return (
      <svg {...p}>
        <path d="M8 18h16l6 6h26v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V18z" fill="#E2572F" {...S} />
        <path d="M8 30h48v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V30z" fill="#FF8A5C" {...S} />
        <rect x="12" y="34" width="40" height="12" rx="2" fill="#F5EDDB" {...S} strokeWidth={2} transform="rotate(-6 32 40)" />
        <text x="32" y="43" textAnchor="middle" fontSize="7.5" fontFamily="Courier New, monospace" fontWeight="bold" fill="#B93A1E" transform="rotate(-6 32 40)">TOP SECRET</text>
      </svg>);
    case "chaos": return (
      <svg {...p}>
        <rect x="8" y="12" width="48" height="40" rx="4" fill="#F5EDDB" {...S} />
        <rect x="15" y="34" width="7" height="12" fill="#3FD1B0" stroke={INK} strokeWidth={2} />
        <rect x="26" y="26" width="7" height="20" fill="#FFB436" stroke={INK} strokeWidth={2} />
        <rect x="37" y="30" width="7" height="16" fill="#E2572F" stroke={INK} strokeWidth={2} />
        <path d="M48 8l1.8 4.6L54 14l-4.2 1.4L48 20l-1.8-4.6L42 14l4.2-1.4z" fill="#FFB436" stroke={INK} strokeWidth={1.8} />
      </svg>);
    case "music": return (
      <svg {...p}>
        <rect x="6" y="16" width="52" height="34" rx="4" fill="#E2572F" {...S} />
        <rect x="12" y="22" width="40" height="14" rx="7" fill="#F5EDDB" {...S} strokeWidth={2} />
        <circle cx="21" cy="29" r="4" fill="#FFF9EF" stroke={INK} strokeWidth={2} />
        <circle cx="43" cy="29" r="4" fill="#FFF9EF" stroke={INK} strokeWidth={2} />
        <path d="M21 29h22" stroke={INK} strokeWidth={2} />
        <path d="M16 44h32" stroke={INK} strokeWidth={2} opacity={0.55} />
        <circle cx="13" cy="45" r="1.4" fill={INK} /><circle cx="51" cy="45" r="1.4" fill={INK} />
      </svg>);
    case "cake": return (
      <svg {...p}>
        <ellipse cx="32" cy="54" rx="24" ry="4" fill="#FFB436" opacity={0.5} />
        <path d="M12 38h40v14H12z" fill="#FFF9EF" {...S} />
        <path d="M12 38c3 4 7 4 10 0 3 4 7 4 10 0 3 4 7 4 10 0 3 4 7 4 10 0" fill="#F5EDDB" {...S} strokeWidth={2} />
        <path d="M20 26h24v12H20z" fill="#F5EDDB" {...S} />
        <path d="M20 26c2.5 3 5.5 3 8 0 2.5 3 5.5 3 8 0 2.5 3 5.5 3 8 0" fill="#FFF9EF" {...S} strokeWidth={2} />
        <rect x="24" y="16" width="3" height="10" fill="#E2572F" stroke={INK} strokeWidth={1.6} />
        <rect x="31" y="14" width="3" height="12" fill="#3FD1B0" stroke={INK} strokeWidth={1.6} />
        <rect x="38" y="16" width="3" height="10" fill="#FFB436" stroke={INK} strokeWidth={1.6} />
        <path d="M25.5 12c1.5 1.6 1.5 3 .0 3.6-1.5-.6-1.5-2 0-3.6zM32.5 10c1.5 1.6 1.5 3 0 3.6-1.5-.6-1.5-2 0-3.6zM39.5 12c1.5 1.6 1.5 3 0 3.6-1.5-.6-1.5-2 0-3.6z" fill="#FFB436" stroke={INK} strokeWidth={1.2} />
      </svg>);
    case "bin": return (
      <svg {...p}>
        <path d="M16 22h32l-3 32a4 4 0 0 1-4 3.6H23A4 4 0 0 1 19 54z" fill="#3FD1B0" {...S} />
        <path d="M12 22h40" {...S} />
        <path d="M26 22v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" {...S} />
        <path d="M25 30l1.6 20M32 30v20M39 30l-1.6 20" stroke={INK} strokeWidth={2} opacity={0.6} />
        <path d="M40 10l6 4-8 3z" fill="#F5EDDB" stroke={INK} strokeWidth={1.8} />
      </svg>);
    case "doc": case "pdf": case "jpg": case "zip": return (
      <svg {...p}>
        <path d="M16 8h22l10 10v38H16z" fill="#FFF9EF" {...S} />
        <path d="M38 8v10h10" {...S} />
        {id === "doc" && <path d="M22 28h20M22 35h20M22 42h14" stroke={INK} strokeWidth={2} opacity={0.6} />}
        {id === "pdf" && <><rect x="20" y="30" width="24" height="12" rx="2" fill="#E2572F" stroke={INK} strokeWidth={2} /><text x="32" y="39" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="Courier New, monospace" fill="#FFF9EF">PDF</text></>}
        {id === "jpg" && <><rect x="21" y="27" width="22" height="17" fill="#3FD1B0" stroke={INK} strokeWidth={2} /><circle cx="28" cy="33" r="2.2" fill="#FFB436" stroke={INK} strokeWidth={1.4} /><path d="M22 42l6-6 4 4 4-3 6 5" stroke={INK} strokeWidth={1.8} fill="none" /></>}
        {id === "zip" && <path d="M30 10v4m0 4v4m0 4v4m0 4v4" stroke={INK} strokeWidth={3} strokeDasharray="3 3" />}
      </svg>);
    case "lock": return (
      <svg {...p}>
        <path d="M22 30v-8a10 10 0 0 1 20 0v8" fill="none" stroke={INK} strokeWidth={4} />
        <rect x="16" y="30" width="32" height="24" rx="4" fill="#FFB436" {...S} />
        <circle cx="32" cy="40" r="3.4" fill={INK} /><path d="M32 42v6" stroke={INK} strokeWidth={3} />
      </svg>);
    case "speaker": case "muted": return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#F5EDDB" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        {id === "speaker"
          ? <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
          : <path d="M16 9.5l5 5m0-5l-5 5" stroke="#B93A1E" strokeWidth={2} strokeLinecap="round" />}
      </svg>);
    case "star": return (
      <svg {...p}><path d="M32 8l6.5 16.5L56 26l-13 11 4 17-15-9.5L17 54l4-17L8 26l17.5-1.5z" fill="#FFB436" {...S} /></svg>);
    default: return <svg {...p}><rect x="12" y="12" width="40" height="40" fill="#F5EDDB" {...S} /></svg>;
  }
}

/* ── Achievement badges ───────────────────────────────────────────── */
export function Badge({ kind, size = 64 }: { kind: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden>
      <circle cx="36" cy="34" r="27" fill="#F5EDDB" stroke="#FFB436" strokeWidth="3" />
      <circle cx="36" cy="34" r="22" fill="#FFF9EF" stroke={INK} strokeWidth="1.6" />
      <path d="M14 52l-5 12 10-3 4 8 6-13M58 52l5 12-10-3-4 8-6-13" fill="#E2572F" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      {kind === "laurel" && <>
        <text x="36" y="41" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="20" fill="#705C4D">21</text>
        <path d="M20 40c-3-8 0-15 5-19M52 40c3-8 0-15-5-19" stroke="#22A98A" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M21 34l-4-1m5-5l-4-2m6-4l-3-3M51 34l4-1m-5-5l4-2m-6-4l3-3" stroke="#22A98A" strokeWidth="2" strokeLinecap="round" />
      </>}
      {kind === "brain" && <>
        <path d="M30 22c-6 0-9 4-9 8-3 2-3 7 0 9-1 5 3 8 8 8h14c5 0 9-3 8-8 3-2 3-7 0-9 0-4-3-8-9-8-2-2-10-2-12 0z" fill="#FF8A5C" stroke={INK} strokeWidth="1.8" />
        <path d="M36 22v25M28 30c3 1 5 3 4 6M44 30c-3 1-5 3-4 6" stroke={INK} strokeWidth="1.6" fill="none" />
      </>}
      {kind === "tornado" && <>
        <path d="M22 24h28M25 31h22M29 38h15M33 45h8M36 51h3" stroke="#22A98A" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M50 24c4 1 4 5-1 7M43 38c3 1 2 5-2 6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </>}
      {kind === "battery" && <>
        <rect x="22" y="27" width="26" height="14" rx="3" fill="#FFF9EF" stroke={INK} strokeWidth="2" />
        <rect x="48" y="31" width="4" height="6" rx="1" fill={INK} />
        <rect x="25" y="30" width="4" height="8" fill="#E2572F" />
        <path d="M38 24l-4 8h5l-4 9" stroke="#FFB436" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>}
      {kind === "heart" && <path d="M36 48c-9-6-14-11-14-17 0-4 3-7 7-7 3 0 5 1.6 7 4 2-2.4 4-4 7-4 4 0 7 3 7 7 0 6-5 11-14 17z" fill="#E2572F" stroke={INK} strokeWidth="1.8" />}
      {kind === "crown" && <>
        <path d="M22 42l-2-16 9 7 7-11 7 11 9-7-2 16z" fill="#FFB436" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M22 46h28" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="36" cy="36" r="2.2" fill="#E2572F" stroke={INK} strokeWidth="1.2" />
      </>}
    </svg>
  );
}

/* ── The vintage CRT computer ─────────────────────────────────────── */
export function CRT() {
  const K = "#070504";
  return (
    <svg viewBox="0 0 1000 780" className="w-full h-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="crtBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E86A3A" /><stop offset="0.5" stopColor="#C2421F" /><stop offset="1" stopColor="#7E2613" />
        </linearGradient>
        <radialGradient id="crtScreen" cx="0.5" cy="0.42" r="0.85">
          <stop offset="0" stopColor="#3A2210" /><stop offset="0.65" stopColor="#1A0F08" /><stop offset="1" stopColor="#080605" />
        </radialGradient>
      </defs>
      <ellipse cx="500" cy="742" rx="360" ry="24" fill="#000" opacity="0.55" />
      <ellipse cx="500" cy="740" rx="300" ry="14" fill="#FFB436" opacity="0.07" />
      {/* stand + base */}
      <path d="M420 580h160l22 46H398z" fill="#8E2D16" stroke={K} strokeWidth={2.4} strokeLinejoin="round" />
      <rect x="330" y="624" width="340" height="26" rx="10" fill="url(#crtBody)" stroke={K} strokeWidth={2.4} />
      <rect x="340" y="629" width="320" height="3" rx="1.5" fill="#FFB436" opacity="0.35" />
      {/* monitor body */}
      <rect x="150" y="38" width="700" height="548" rx="30" fill="url(#crtBody)" stroke={K} strokeWidth={3} />
      <rect x="146" y="70" width="4" height="480" rx="2" fill="#2CF5B4" opacity="0.4" />
      <rect x="850" y="70" width="4" height="480" rx="2" fill="#FF5A2A" opacity="0.4" />
      <rect x="158" y="46" width="684" height="6" rx="3" fill="#FFB436" opacity="0.22" />
      <rect x="176" y="64" width="648" height="472" rx="22" fill="#120D0A" stroke={K} strokeWidth={2.4} />
      <rect x="205" y="95" width="590" height="410" rx="16" fill="url(#crtScreen)" stroke="#FFB436" strokeOpacity="0.35" strokeWidth={2} />
      {/* glass reflection */}
      <path d="M235 110c90-14 200-14 260 0-110 10-190 36-236 92-20-32-26-62-24-92z" fill="#FFE2A6" opacity="0.05" />
      {/* front panel details */}
      <rect x="205" y="540" width="150" height="10" rx="4" fill="#100C09" stroke={K} strokeWidth={1.6} />
      <rect x="209" y="543" width="60" height="4" rx="2" fill="#FFB436" opacity="0.5" />
      <text x="380" y="551" fontFamily="Courier New, monospace" fontSize="17" letterSpacing="3" fill="#1A0D06" fontWeight="bold">KIBO·RHODYL SYSTEM · 21</text>
      <circle cx="742" cy="546" r="7" fill="#FFB436" stroke={K} strokeWidth={2} className="crt-led" />
      <circle cx="775" cy="546" r="9" fill="#221811" stroke={K} strokeWidth={2} /><path d="M775 540v6" stroke="#FFB436" strokeWidth={2} />
      {/* keyboard */}
      <rect x="252" y="668" width="496" height="66" rx="12" fill="url(#crtBody)" stroke={K} strokeWidth={2.4} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={272 + i * 38} y={680} width={30} height={16} rx={3} fill="#15100C" stroke={K} strokeWidth={1.4} />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} x={286 + i * 38} y={702} width={30} height={16} rx={3} fill="#15100C" stroke={K} strokeWidth={1.4} />
      ))}
      <rect x="272" y="681" width="452" height="2" fill="#FFB436" opacity="0.25" />
      <rect x="380" y="722" width="240" height="8" rx="3" fill="#15100C" stroke={K} strokeWidth={1.2} />
      {/* mouse + cable */}
      <path d="M748 700c60-6 60-40 20-44" fill="none" stroke="#FFB436" strokeWidth={2} opacity={0.4} />
      <ellipse cx="792" cy="704" rx="26" ry="32" fill="url(#crtBody)" stroke={K} strokeWidth={2.4} />
      <path d="M792 676v22" stroke="#FFB436" strokeWidth={2} opacity={0.6} />
    </svg>
  );
}

/* ── Editorial placeholder plates for missing photos ─────────────── */
export function PlaceholderPlate({ n, compact = false }: { n: number; compact?: boolean }) {
  const v = n % 3;
  return (
    <div className={`plate w-full h-full ${compact ? "plate-compact" : ""}`}>
      <svg viewBox="0 0 300 360" className="w-full h-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <rect width="300" height="360" fill="#F5EDDB" />
        <rect x="12" y="12" width="276" height="336" fill="none" stroke="#FFB436" strokeWidth="2" />
        <rect x="18" y="18" width="264" height="324" fill="none" stroke="#FFB436" strokeWidth="0.8" />
        <text x="150" y="205" textAnchor="middle" fontFamily="Georgia, serif" fontSize="150" fill="#E2572F" opacity="0.28">{String(n).padStart(2, "0")}</text>
        {v === 0 && <g stroke="#22A98A" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M150 300V190M150 250c-22-6-34-22-36-44 22 4 34 18 36 44zM150 226c22-6 34-22 36-44-22 4-34 18-36 44z" />
          <circle cx="150" cy="176" r="12" fill="#E2572F" stroke="#1A120C" strokeWidth="1.8" />
        </g>}
        {v === 1 && <g>
          <path d="M90 290a60 60 0 0 1 120 0" fill="#3FD1B0" stroke="#1A120C" strokeWidth="2" />
          <circle cx="150" cy="196" r="26" fill="#FFB436" stroke="#1A120C" strokeWidth="2" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={150 + Math.cos(a) * 34} y1={196 + Math.sin(a) * 34} x2={150 + Math.cos(a) * 44} y2={196 + Math.sin(a) * 44} stroke="#FFB436" strokeWidth="2.4" strokeLinecap="round" />;
          })}
        </g>}
        {v === 2 && <g>
          <path d="M150 300v-80" stroke="#22A98A" strokeWidth="2.4" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return <ellipse key={i} cx={150 + Math.cos(a) * 22} cy={200 + Math.sin(a) * 22} rx="13" ry="8" fill="#FF8A5C" stroke="#1A120C" strokeWidth="1.6" transform={`rotate(${(a * 180) / Math.PI} ${150 + Math.cos(a) * 22} ${200 + Math.sin(a) * 22})`} />;
          })}
          <circle cx="150" cy="200" r="9" fill="#FFB436" stroke="#1A120C" strokeWidth="1.6" />
        </g>}
        <text x="150" y="326" textAnchor="middle" fontFamily="Courier New, monospace" fontSize="11" letterSpacing="2" fill="#705C4D">PHOTOGRAPH № {String(n).padStart(2, "0")}</text>
        <text x="150" y="342" textAnchor="middle" fontFamily="Courier New, monospace" fontSize="8.5" fill="#705C4D" opacity="0.7">add {String(n).padStart(2, "0")}.jpg to assets/photos</text>
      </svg>
    </div>
  );
}

/* ── Small paper decorations ──────────────────────────────────────── */
export function PressedFlower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" className={className} aria-hidden>
      <path d="M40 104V44M40 78c-14-4-20-14-21-27 13 3 20 12 21 27zM40 64c14-4 20-14 21-27-13 3-20 12-21 27z" stroke="#22A98A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <ellipse key={i} cx={40 + Math.cos(a) * 13} cy={32 + Math.sin(a) * 13} rx="10" ry="6.5" fill="#FF8A5C" opacity="0.8" stroke="#B93A1E" strokeWidth="1" transform={`rotate(${(a * 180) / Math.PI} ${40 + Math.cos(a) * 13} ${32 + Math.sin(a) * 13})`} />;
      })}
      <circle cx="40" cy="32" r="5.5" fill="#FFB436" stroke="#B93A1E" strokeWidth="1" />
    </svg>
  );
}
export function Doodle({ kind, className = "" }: { kind: "star" | "heart" | "arrow" | "swirl"; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="#B93A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === "star" && <path d="M24 6l4 12 13 1-10 8 3 13-10-7-10 7 3-13L7 19l13-1z" />}
      {kind === "heart" && <path d="M24 40c-10-7-16-12-16-19 0-4 3-8 8-8 3.4 0 6 2 8 4.6C26 15 28.6 13 32 13c5 0 8 4 8 8 0 7-6 12-16 19z" />}
      {kind === "arrow" && <path d="M8 36c10 2 22-2 28-16m0 0l-8 2m8-2l-1 9" />}
      {kind === "swirl" && <path d="M10 28c0-10 12-16 20-10s6 18-3 19-13-8-7-13 12-1 9 5" />}
    </svg>
  );
}

/* ── The cake (21 individually generated candles) ─────────────────── */
function scallops(x0: number, x1: number, y: number, r: number) {
  let d = `M ${x0} ${y}`;
  for (let x = x0; x < x1 - 0.5; x += r * 2) d += ` a ${r} ${r} 0 0 0 ${Math.min(r * 2, x1 - x)} 0`;
  return d;
}
export function CakeArt({ lit, lean = 0, dim = false }: { lit: boolean[]; lean?: number; dim?: boolean }) {
  const count = lit.length;
  const back = Math.ceil(count / 2), front = count - back;
  const candle = (i: number, x: number, y: number, scale: number, key: string) => {
    const h = [40, 50, 45][i % 3];
    const pat = ["stripeRose", "stripeSage", "stripeGold"][i % 3];
    const on = lit[i];
    return (
      <g key={key} transform={`translate(${x} ${y}) scale(${scale})`}>
        <rect x="-3.6" y={-h} width="7.2" height={h} rx="2" fill={`url(#${pat})`} stroke={INK} strokeWidth="1.4" />
        <line x1="0" y1={-h} x2="0" y2={-h - 5} stroke={INK} strokeWidth="1.6" />
        {on ? (
          <g className="flame" style={{ animationDelay: `${(i % 7) * 0.13}s`, animationDuration: `${0.85 + (i % 5) * 0.11}s`, transformOrigin: `0px ${-h - 5}px`, rotate: lean ? `${lean}deg` : undefined } as CSSProperties}>
            <circle cx="0" cy={-h - 13} r="11" fill="#FFB436" opacity="0.22" />
            <path d={`M0 ${-h - 24} C 5 ${-h - 16}, 5 ${-h - 9}, 0 ${-h - 6} C -5 ${-h - 9}, -5 ${-h - 16}, 0 ${-h - 24}z`} fill="url(#flameGrad)" />
            <ellipse cx="0" cy={-h - 10.5} rx="2" ry="3.6" fill="#FFF9EF" opacity="0.95" />
          </g>
        ) : (
          <g className="smoke-wisp">
            <path d={`M0 ${-h - 6} c 4 -8 -5 -12 -1 -20 c 3 -6 -2 -9 1 -14`} fill="none" stroke="#3FD1B0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </g>
        )}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 900 640" className="w-full h-full" style={dim ? { filter: "brightness(0.55) saturate(0.8)", transition: "filter 2.5s ease" } : undefined} aria-label={`Birthday cake with ${count} candles, ${lit.filter(Boolean).length} still lit`}>
      <defs>
        <radialGradient id="flameGrad" cx="0.5" cy="0.75" r="0.8">
          <stop offset="0" stopColor="#FFF3C9" /><stop offset="0.45" stopColor="#E8C98A" /><stop offset="1" stopColor="#C88636" />
        </radialGradient>
        <linearGradient id="tierShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF9EF" /><stop offset="1" stopColor="#EFE0C8" />
        </linearGradient>
        {[["stripeRose", "#FF8A5C"], ["stripeSage", "#3FD1B0"], ["stripeGold", "#FFC766"]].map(([id, col]) => (
          <pattern key={id} id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#FFF9EF" /><rect width="4" height="8" fill={col} />
          </pattern>
        ))}
      </defs>
      <ellipse cx="450" cy="588" rx="340" ry="30" fill="#000" opacity="0.35" />
      <ellipse cx="450" cy="576" rx="330" ry="28" fill="#D9CCAD" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="450" cy="570" rx="300" ry="22" fill="#F5EDDB" stroke={INK} strokeWidth="1.6" />
      {/* bottom tier */}
      <rect x="200" y="430" width="500" height="140" rx="14" fill="url(#tierShade)" stroke={INK} strokeWidth="2.6" />
      <path d={scallops(200, 700, 438, 25)} fill="#F5EDDB" stroke={INK} strokeWidth="2.2" />
      <rect x="200" y="516" width="500" height="18" fill="#E2572F" opacity="0.85" />
      {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={230 + i * 49} cy={550} r="4" fill="#FFB436" stroke={INK} strokeWidth="1.2" />)}
      {/* middle tier */}
      <rect x="255" y="318" width="390" height="118" rx="12" fill="url(#tierShade)" stroke={INK} strokeWidth="2.6" />
      <path d={scallops(255, 645, 325, 19.5)} fill="#F5EDDB" stroke={INK} strokeWidth="2.2" />
      <text x="450" y="402" textAnchor="middle" fontFamily="'Segoe Script','Bradley Hand',cursive" fontSize="40" fill="#B93A1E">{CAKE.cakeWriting}</text>
      <text x="450" y="426" textAnchor="middle" fontFamily="Georgia, serif" fontSize="19" letterSpacing="6" fill="#705C4D">{PERSON.name.toUpperCase()}</text>
      {/* top tier */}
      <rect x="305" y="228" width="290" height="96" rx="10" fill="url(#tierShade)" stroke={INK} strokeWidth="2.6" />
      <path d={scallops(305, 595, 234, 14.5)} fill="#F5EDDB" stroke={INK} strokeWidth="2.2" />
      {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={330 + i * 48} cy={290} r="3.4" fill="#E2572F" stroke={INK} strokeWidth="1.1" />)}
      <ellipse cx="450" cy="228" rx="145" ry="14" fill="#F5EDDB" stroke={INK} strokeWidth="2" />
      {/* candles: back row then front row */}
      {Array.from({ length: back }).map((_, i) => candle(i, back === 1 ? 450 : 330 + (i * 240) / (back - 1), 224, 0.92, `b${i}`))}
      {Array.from({ length: front }).map((_, i) => candle(back + i, front === 1 ? 450 : 322 + (i * 256) / (front - 1), 238, 1, `f${i}`))}
      {/* tiny sugar flowers on plate */}
      {[168, 732].map((x) => (
        <g key={x} transform={`translate(${x} 560)`}>
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI * 2;
            return <ellipse key={i} cx={Math.cos(a) * 9} cy={Math.sin(a) * 9} rx="7" ry="4.5" fill="#FF8A5C" stroke={INK} strokeWidth="1.2" transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 9} ${Math.sin(a) * 9})`} />;
          })}
          <circle r="4" fill="#FFB436" stroke={INK} strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}

/* ── Hero firework rocket (paper-crafted, decorative) ─────────────── */
export function HeroRocket({ fuse = true, thrust = false }: { fuse?: boolean; thrust?: boolean }) {
  return (
    <svg viewBox="0 0 200 330" className="w-full h-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#EFE0C8" /><stop offset="0.5" stopColor="#FFF9EF" /><stop offset="1" stopColor="#D9CCAD" />
        </linearGradient>
      </defs>
      {/* fins */}
      <path d="M68 210l-26 44 30-10zM132 210l26 44-30-10z" fill="#3FD1B0" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      {/* body */}
      <rect x="66" y="86" width="68" height="160" rx="26" fill="url(#rocketBody)" stroke={INK} strokeWidth="2.6" />
      {/* nose cone */}
      <path d="M66 96c0-40 20-64 34-74 14 10 34 34 34 74-20-10-48-10-68 0z" fill="#E2572F" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M100 34l3.4 8.6 9 1-6.8 5.8 2.2 8.8-7.8-5-7.8 5 2.2-8.8-6.8-5.8 9-1z" fill="#E8C98A" stroke={INK} strokeWidth="1.4" />
      {/* filigree */}
      <path d="M74 120h52M74 216h52" stroke="#FFB436" strokeWidth="2" />
      <path d="M78 128c8 6 36 6 44 0M78 208c8-6 36-6 44 0" stroke="#FFB436" strokeWidth="1.4" fill="none" />
      <circle cx="100" cy="168" r="26" fill="#252C3B" stroke="#FFB436" strokeWidth="3" />
      <text x="100" y="178" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="27" fill="#E8C98A">21</text>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <circle key={i} cx={100 + Math.cos(a) * 33} cy={168 + Math.sin(a) * 33} r="1.8" fill="#FFB436" />;
      })}
      {/* nozzle + fuse */}
      <path d="M84 246h32l-6 16H90z" fill="#705C4D" stroke={INK} strokeWidth="2.2" />
      {thrust && (
        <g className="thrust" style={{ transformOrigin: "100px 262px" }}>
          <path d="M84 262c-8 40 6 70 16 98 10-28 24-58 16-98z" fill="#FF8A1F" opacity="0.9" />
          <path d="M91 262c-4 26 3 46 9 64 6-18 13-38 9-64z" fill="#FFE2A6" />
        </g>
      )}
      {fuse && <>
        <path d="M100 262c-4 12 8 16 4 30" fill="none" stroke="#705C4D" strokeWidth="3" strokeLinecap="round" />
        <g className="fuse-spark">
          <circle cx="104" cy="294" r="6" fill="#E8C98A" />
          <circle cx="104" cy="294" r="12" fill="#FFB436" opacity="0.4" />
          <path d="M104 282v-6M104 306v6M92 294h-6M116 294h6M96 286l-4-4M112 302l4 4M112 286l4-4M96 302l-4 4" stroke="#E8C98A" strokeWidth="2" strokeLinecap="round" />
        </g>
      </>}
    </svg>
  );
}

/* ── Distant landscape for the night sky ──────────────────────────── */
export function Landscape() {
  return (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden>
      <path d="M0 120c120-30 260-44 420-30s300 44 480 34 340-46 540-20v96H0z" fill="#0E1513" />
      <path d="M0 156c180-24 380-30 560-18s360 30 540 22 240-18 340-10v50H0z" fill="#0A0F0E" />
      {/* pines */}
      {[90, 150, 620, 680, 1180, 1250, 1310].map((x, i) => (
        <path key={i} d={`M${x} ${152 - (i % 3) * 6}l11 26h-22z M${x} ${140 - (i % 3) * 6}l9 20h-18z`} fill="#060908" />
      ))}
      {/* warm windows */}
      {[300, 336, 860, 896, 1060].map((x, i) => (
        <rect key={i} x={x} y={158 + (i % 2) * 8} width="6" height="7" fill="#FFB436" opacity="0.85" className="window-glow" style={{ animationDelay: `${i * 1.3}s` }} />
      ))}
    </svg>
  );
}
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
