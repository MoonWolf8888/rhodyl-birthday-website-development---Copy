import wall from "../assets/wall.jpg";
import { useCallback, useEffect, useRef, useState } from "react";
import { APPS, BRAND, CAKE_LOCK, PERSON, REQUIRED_APPS, SECRET_NOTE, SHUTDOWN_JOKE, SURPRISE_POPUP, UNLOCK_TOAST, type AppId } from "../config";
import { Icon } from "../art";
import { audio, useAudio } from "../audio";
import { motion, useIsMobile, useReducedMotion } from "../hooks";
import { Window, type WinState } from "./Window";
import { Archives } from "../apps/Archives";
import { Classified } from "../apps/Classified";
import { Chaos } from "../apps/Chaos";
import { RecycleBin } from "../apps/RecycleBin";
import { MusicPlayer } from "../apps/MusicPlayer";

interface Toast { id: number; title: string; body: string; gold?: boolean; }
const SIZES: Record<string, [number, number]> = {
  archives: [1040, 700], classified: [700, 540], chaos: [680, 560], music: [440, 520],
  bin: [640, 470], cakelock: [460, 280], about: [440, 380],
};
const TITLES: Record<string, { name: string; icon: string }> = {
  cakelock: { name: "Cake.exe — Access Denied", icon: "lock" },
  about: { name: "About RHODYL.EXE", icon: "star" },
};

interface Props {
  opened: Set<AppId>; unlocked: boolean; overlay: boolean;
  onOpened: (id: AppId) => void; onCake: () => void;
}

export function Desktop({ opened, unlocked, overlay, onOpened, onCake }: Props) {
  const mobile = useIsMobile();
  const st = useAudio();
  const calm = useReducedMotion();
  const [wins, setWins] = useState<WinState[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [menu, setMenu] = useState(false);
  const [surprise, setSurprise] = useState(false);
  const [note, setNote] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const zRef = useRef(10);
  const cascade = useRef(0);
  const idRef = useRef(1);
  const timers = useRef<number[]>([]);
  const fired = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => setClock(new Date()), 20000);
    const timersAtCleanup = timers.current;
    return () => { clearInterval(t); timersAtCleanup.forEach(clearTimeout); };
  }, []);

  const pushToast = useCallback((title: string, body: string, gold = false) => {
    const id = idRef.current++;
    setToasts((ts) => [...ts.slice(-2), { id, title, body, gold }]);
    timers.current.push(window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), gold ? 9000 : 5500));
  }, []);

  /* unlock achievement — fires exactly once */
  useEffect(() => {
    if (unlocked && !fired.current) {
      fired.current = true;
      audio.sfx("unlock");
      pushToast(UNLOCK_TOAST.title, UNLOCK_TOAST.body, true);
      timers.current.push(window.setTimeout(() => setSurprise(true), 1100));
    }
  }, [unlocked, pushToast]);

  const focus = (id: string) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zRef.current, min: false } : w)));
  const close = (id: string) => { audio.sfx("click"); setWins((ws) => ws.filter((w) => w.id !== id)); };

  const openApp = (id: string) => {
    audio.sfx("click");
    setMenu(false);
    if (id === "cake") {
      if (unlocked) { onCake(); return; }
      audio.sfx("error");
      id = "cakelock";
    }
    if (REQUIRED_APPS.includes(id as AppId)) onOpened(id as AppId);
    setWins((ws) => {
      const ex = ws.find((w) => w.id === id);
      if (ex) return ws.map((w) => (w.id === id ? { ...w, min: false, z: ++zRef.current } : w));
      const [dw, dh] = SIZES[id] || [560, 440];
      const w = Math.min(dw, window.innerWidth - 16);
      const h = Math.min(dh, window.innerHeight - 76);
      const c = cascade.current++ % 6;
      const x = Math.max(4, Math.min(30 + c * 30 + (id === "archives" ? 60 : 0), window.innerWidth - w - 8));
      const y = Math.max(4, Math.min(14 + c * 24, window.innerHeight - h - 60));
      return [...ws, { id, x, y, w, h, min: false, max: false, z: ++zRef.current }];
    });
  };

  const visible = wins.filter((w) => !w.min);
  const activeId = visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : null;
  const explored = REQUIRED_APPS.filter((r) => opened.has(r)).length;

  const content = (id: string) => {
    switch (id) {
      case "archives": return <Archives active={activeId === "archives" && !overlay} />;
      case "classified": return <Classified pushToast={pushToast} />;
      case "chaos": return <Chaos />;
      case "music": return <MusicPlayer />;
      case "bin": return <RecycleBin pushToast={pushToast} />;
      case "cakelock": return (
        <div className="flex-1 bg-panel p-5 flex flex-col items-center text-center gap-3 justify-center">
          <div className="flex items-center gap-3">
            <Icon id="lock" size={40} />
            <div className="font-crt font-bold text-[14px] text-danger" style={{ textShadow: "0 0 10px rgba(255,93,115,.5)" }}>{CAKE_LOCK.title}</div>
          </div>
          <p className="font-crt text-[12px] text-steel">{CAKE_LOCK.body}</p>
          <p className="font-crt text-[12px] font-bold bev-in px-3 py-1.5 text-neonbright">{CAKE_LOCK.progressLabel}: {explored}/{REQUIRED_APPS.length}</p>
          <p className="font-crt text-[10px] text-steeldim">Open the memory folders on the desktop. The cake believes in you.</p>
          <button className="btn btn-gold !px-8" onClick={() => close("cakelock")}>OK</button>
        </div>);
      case "about": return (
        <div className="flex-1 bg-panel p-5 flex flex-col items-center text-center gap-2 justify-center">
          <Icon id="star" size={40} />
          <div className="font-crt font-bold text-lg tracking-widest text-neonbright" style={{ textShadow: "0 0 12px rgba(255,180,54,.5)" }}>{BRAND.title}</div>
          <div className="font-crt text-[11px] text-steeldim">{BRAND.version} · {BRAND.chapter}</div>
          <p className="font-editorial italic text-[13px] text-goldbright max-w-xs">“{BRAND.tagline}”</p>
          <p className="font-crt text-[10px] text-steeldim">Built with love, SVG, and zero backend for {PERSON.name}.</p>
          <button className="btn !px-8 mt-2" onClick={() => close("about")}>OK</button>
        </div>);
      default: return null;
    }
  };

  const meta = (id: string) => TITLES[id] || APPS.find((a) => a.id === id) || { name: id, icon: "doc" };

  return (
    <div className="fixed inset-0 wallpaper overflow-hidden" inert={overlay || undefined}>
      <div className="absolute inset-0" aria-hidden style={{ backgroundImage: "url(" + wall + ")", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" aria-hidden style={{ background: "linear-gradient(90deg, rgba(8,6,5,.84) 0%, rgba(8,6,5,.4) 26%, rgba(8,6,5,.22) 70%, rgba(8,6,5,.55) 100%), linear-gradient(180deg, rgba(8,6,5,.3), rgba(8,6,5,.08) 45%, rgba(8,6,5,.72))" }} />
      <div className="desktop-scan z-[1]" aria-hidden />

      {/* neon district signage */}
      <div className="absolute top-4 right-6 z-[4] text-right pointer-events-none select-none hidden md:block" aria-hidden>
        <div className="font-crt text-[13px] font-bold tracking-[0.35em] neon-sign-cyan">BIRTHDAY://ONLINE</div>
        <div className="font-crt text-[9px] tracking-[0.3em] neon-sign-pink mt-1.5">SYS.21 · NEON DISTRICT · SECTOR 7</div>
      </div>

      {/* desktop icons */}
      <div className={mobile ? "absolute inset-x-1 top-2 grid grid-cols-3 gap-1 z-[5]" : "absolute left-2 top-2 bottom-14 flex flex-col flex-wrap content-start gap-1 z-[5]"}>
        {APPS.map((a, i) => {
          const done = REQUIRED_APPS.includes(a.id) && opened.has(a.id);
          const locked = a.id === "cake" && !unlocked;
          return (
            <button
              key={a.id} onClick={() => openApp(a.id)} title={a.blurb}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group w-[92px] py-2 px-1 flex flex-col items-center gap-1 border border-transparent hover:border-cyber/60 hover:bg-neon/10 cursor-pointer rise-in"
            >
              <span className={`relative ${a.id === "cake" && unlocked ? "icon-glow" : ""}`}>
                <Icon id={a.icon} size={46} />
                {done && <span className="absolute -right-1.5 -top-1 w-[18px] h-[18px] rounded-full bg-neon border border-void text-void text-[10px] font-bold grid place-items-center">✓</span>}
                {locked && <span className="absolute -right-2 -bottom-1"><Icon id="lock" size={22} /></span>}
              </span>
              <span className="font-crt text-[10.5px] leading-tight text-neonbright text-center" style={{ textShadow: "0 0 6px rgba(255,180,54,.45), 1px 1px 2px rgba(0,0,0,.9)" }}>
                {a.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* suspicious sticker easter egg */}
      <button
        className="absolute right-3 bottom-16 md:left-4 md:right-auto -rotate-12 hover:rotate-0 transition-transform cursor-pointer z-[5]"
        onClick={() => { audio.sfx("click"); setNote(true); }}
        aria-label="A suspicious sticker" title="a suspicious sticker…"
      >
        <Icon id="star" size={38} />
      </button>

      {/* windows */}
      <div className="absolute inset-x-0 top-0 bottom-12">
        {wins.map((w) => (
          <Window
            key={w.id} win={w} title={meta(w.id).name} icon={meta(w.id).icon}
            active={activeId === w.id} mobile={mobile}
            onFocus={() => { if (activeId !== w.id || w.min) focus(w.id); }}
            onClose={() => close(w.id)}
            onMin={() => setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, min: true } : x)))}
            onMax={() => setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, max: !x.max, z: ++zRef.current } : x)))}
            onDrag={(x, y) => setWins((ws) => ws.map((w2) => (w2.id === w.id ? { ...w2, x, y } : w2)))}
          >
            {content(w.id)}
          </Window>
        ))}
      </div>

      {/* toasts */}
      <div className="absolute right-2 bottom-14 z-[90] w-[min(320px,90vw)] space-y-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-in bev-out p-3 border-l-4 ${t.gold ? "!border-l-neon" : "!border-l-cyber"}`} style={t.gold ? { boxShadow: "0 0 18px rgba(255,180,54,.25)" } : undefined}>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <div className={`font-crt text-[11px] font-bold ${t.gold ? "text-neonbright" : "text-cyber"}`}>{t.gold && "★ "}{t.title}</div>
                <div className="font-crt text-[10.5px] text-steel mt-1 leading-relaxed">{t.body}</div>
              </div>
              <button className="font-crt text-[11px] text-steeldim hover:text-neonbright shrink-0 cursor-pointer" aria-label="Dismiss notification" onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* taskbar */}
      <div className="absolute inset-x-0 bottom-0 h-12 bev-out border-x-0 border-b-0 flex items-center gap-1.5 px-1.5 z-[85]">
        <button className={`btn flex items-center gap-1.5 !px-2.5 font-bold ${menu ? "pressed" : ""}`} onClick={() => { audio.sfx("click"); setMenu((m) => !m); }} aria-expanded={menu} aria-label="Start menu">
          <Icon id="star" size={18} /> Start
        </button>
        <span className="w-px h-7 bg-neon/25 mx-0.5" aria-hidden />
        <div className="flex-1 min-w-0 flex gap-1 overflow-hidden">
          {wins.map((w) => (
            <button
              key={w.id}
              className={`btn !px-2 !min-h-[30px] flex items-center gap-1.5 max-w-36 min-w-0 ${activeId === w.id && !w.min ? "pressed" : ""}`}
              onClick={() => { if (activeId === w.id && !w.min) setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, min: true } : x))); else focus(w.id); }}
              title={meta(w.id).name}
            >
              <Icon id={meta(w.id).icon} size={15} />
              <span className="truncate text-[10.5px] hidden sm:inline">{meta(w.id).name}</span>
            </button>
          ))}
        </div>
        <div className="bev-in px-2 py-1 flex items-center gap-1.5 shrink-0" title="Opening each required folder once unlocks Cake.exe">
          <span className="font-crt text-[10px] hidden md:inline text-steel">Memories explored:</span>
          <span className="font-crt text-[10px] font-bold text-neonbright">{explored}/{REQUIRED_APPS.length}</span>
          <span className="w-10 h-2.5 bev-in p-[1px] hidden sm:block"><span className="block h-full bg-neon transition-all duration-500" style={{ width: `${(explored / REQUIRED_APPS.length) * 100}%`, boxShadow: "0 0 6px rgba(255,180,54,.8)" }} /></span>
        </div>
        <button className="btn !px-1.5 !min-h-[30px] shrink-0" onClick={() => audio.toggleMute()} aria-label={st.muted ? "Unmute all sound" : "Mute all sound"} aria-pressed={st.muted}>
          <Icon id={st.muted ? "muted" : "speaker"} size={17} />
        </button>
        <div className="bev-in px-2 py-1.5 font-crt text-[11px] shrink-0 text-cyber" style={{ textShadow: "0 0 8px rgba(44,245,180,.55)" }} aria-label="Clock">
          {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* start menu */}
      {menu && (
        <>
          <div className="fixed inset-0 z-[86]" onClick={() => setMenu(false)} />
          <div className="absolute bottom-12 left-1 w-72 bev-out z-[87] pop-in flex" role="menu" onKeyDown={(e) => { if (e.key === "Escape") setMenu(false); }}>
            <div className="w-8 shrink-0 bg-gradient-to-t from-magenta/45 via-neondim/60 to-void grid place-items-center border-r border-neon/40">
              <span className="font-crt font-bold text-neonbright text-[11px] tracking-[0.3em]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", textShadow: "0 0 8px rgba(255,180,54,.6)" }}>RHODYL·EXE 21</span>
            </div>
            <div className="flex-1 py-1">
              {APPS.map((a) => (
                <button key={a.id} role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neon/10 font-crt text-[12px] text-left cursor-pointer text-steel hover:text-neonbright" onClick={() => openApp(a.id)}>
                  <Icon id={a.icon} size={24} />
                  <span className="flex-1">{a.name}</span>
                  {a.id === "cake" && !unlocked && <Icon id="lock" size={16} />}
                  {REQUIRED_APPS.includes(a.id) && opened.has(a.id) && <span className="text-neon font-bold">✓</span>}
                </button>
              ))}
              <div className="border-t border-neon/20 my-1" />
              <button role="menuitem" aria-pressed={calm} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neon/10 font-crt text-[12px] text-left cursor-pointer text-steel hover:text-neonbright" onClick={() => { audio.sfx("click"); motion.setCalm(!calm); }}>
                <Icon id="chaos" size={24} />
                <span className="flex-1">Motion</span>
                <span className={calm ? "text-cyber" : "acid-text"}>{calm ? "CALM" : "FULL"}</span>
              </button>
              <button role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neon/10 font-crt text-[12px] text-left cursor-pointer text-steel hover:text-neonbright" onClick={() => openApp("about")}>
                <Icon id="star" size={24} /> About RHODYL.EXE
              </button>
              <button role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neon/10 font-crt text-[12px] text-left cursor-pointer text-steel hover:text-danger" onClick={() => { setMenu(false); audio.sfx("error"); pushToast("Shut down?", SHUTDOWN_JOKE); }}>
                <Icon id="bin" size={24} /> Shut Down…
              </button>
            </div>
          </div>
        </>
      )}

      {/* secret note — a warm paper artifact inside the machine */}
      {note && (
        <div className="fixed inset-0 z-[96] grid place-items-center p-4" style={{ background: "rgba(4,6,10,0.6)" }} onClick={() => setNote(false)} onKeyDown={(e) => { if (e.key === "Escape") setNote(false); }}>
          <div className="paper-ivory grain relative max-w-xs w-full p-6 pt-8 -rotate-2 pop-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-2" />
            <p className="font-hand text-[17px] leading-relaxed text-ink relative z-[2]">{SECRET_NOTE}</p>
            <button className="btn mt-4 w-full relative z-[2]" autoFocus onClick={() => setNote(false)}>keep this forever</button>
          </div>
        </div>
      )}

      {surprise && <SurprisePopup onClose={() => setSurprise(false)} onYes={() => { setSurprise(false); onCake(); }} onNo={() => { setSurprise(false); pushToast(SURPRISE_POPUP.noAfter, SURPRISE_POPUP.decline); }} />}
    </div>
  );
}

function SurprisePopup({ onClose, onYes, onNo }: { onClose: () => void; onYes: () => void; onNo: () => void }) {
  const [dodges, setDodges] = useState(0);
  const spots = [{ x: 196, y: 10 }, { x: 150, y: 58 }, { x: 210, y: 50 }];
  const pos = dodges === 0 ? { x: 180, y: 24 } : spots[Math.min(dodges - 1, spots.length - 1)];
  const dodge = () => setDodges((d) => Math.min(d + 1, 2));
  return (
    <div
      className="fixed inset-0 z-[97] grid place-items-center p-4" style={{ background: "rgba(4,6,10,0.6)" }}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div className="bev-out window-shadow w-[340px] max-w-full pop-in" role="dialog" aria-label={SURPRISE_POPUP.question}>
        <div className="titlebar flex items-center px-2 h-8">
          <span className="font-crt text-[12px] font-bold flex-1">surprise.exe</span>
          <button className="tb-btn bev-out" aria-label="Close popup" onPointerDown={(e) => e.stopPropagation()} onClick={onClose}>✕</button>
        </div>
        <div className="bg-panel p-5">
          <p className="font-crt text-[14px] font-bold text-center text-neonbright">{SURPRISE_POPUP.question}</p>
          <p className="font-crt text-[10px] text-steeldim text-center mt-1">(the cake has been very patient)</p>
          <div className="relative h-[104px] mt-3">
            <button className="btn btn-gold !px-8 absolute left-4 top-7" autoFocus onClick={onYes}>{SURPRISE_POPUP.yes}</button>
            <button
              className="btn absolute transition-all duration-200 !px-6"
              style={{ left: pos.x, top: pos.y }}
              onPointerEnter={(e) => { if (e.pointerType === "mouse" && dodges < 2) dodge(); }}
              onPointerDown={(e) => { if (e.pointerType !== "mouse" && dodges < 2) { e.preventDefault(); dodge(); } }}
              onClick={(e) => { if (dodges >= 2 || e.detail === 0) onNo(); }}
            >
              {dodges >= 2 ? SURPRISE_POPUP.noAfter : SURPRISE_POPUP.no}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}