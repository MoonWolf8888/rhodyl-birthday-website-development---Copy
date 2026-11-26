import { useEffect, useRef, type ReactNode, type PointerEvent } from "react";
import { Icon } from "../art";

export interface WinState { id: string; x: number; y: number; w: number; h: number; min: boolean; max: boolean; z: number; }

interface Props {
  win: WinState; title: string; icon: string; active: boolean; mobile: boolean;
  onFocus: () => void; onClose: () => void; onMin: () => void; onMax: () => void;
  onDrag: (x: number, y: number) => void; children: ReactNode;
}

export function Window({ win, title, icon, active, mobile, onFocus, onClose, onMin, onMax, onDrag, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    onFocus();
    if (mobile || win.max) return;
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const nx = Math.min(Math.max(e.clientX - drag.current.dx, 90 - win.w), window.innerWidth - 90);
    const ny = Math.min(Math.max(e.clientY - drag.current.dy, 0), window.innerHeight - 96);
    onDrag(nx, ny);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) {
      const nx = Math.min(Math.max(e.clientX - drag.current.dx, 90 - win.w), window.innerWidth - 90);
      const ny = Math.min(Math.max(e.clientY - drag.current.dy, 0), window.innerHeight - 96);
      onDrag(nx, ny);
    }
    drag.current = null;
  };

  const style = mobile
    ? { zIndex: win.z, display: win.min ? "none" : undefined, left: 4, right: 4, top: 4, bottom: 4 }
    : win.max
      ? { zIndex: win.z, display: win.min ? "none" : undefined, left: 0, top: 0, width: "100%", height: "100%" }
      : { zIndex: win.z, display: win.min ? "none" : undefined, left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <div
      ref={ref} role="dialog" aria-label={title} tabIndex={-1}
      className="absolute flex flex-col bev-out window-shadow outline-none win-in"
      style={style}
      onPointerDown={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          const t = e.target as HTMLElement;
          if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
          e.stopPropagation(); onClose();
        }
      }}
    >
      <div
        className={`titlebar flex items-center gap-2 px-2 h-8 shrink-0 select-none ${active ? "" : "titlebar-inactive"} ${mobile || win.max ? "" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { drag.current = null; }}
        onDoubleClick={() => { if (!mobile) onMax(); }}
      >
        <span className="w-5 h-5 grid place-items-center shrink-0"><Icon id={icon} size={18} /></span>
        <span className="font-crt text-[12px] font-bold tracking-wide truncate flex-1">{title}</span>
        <button className="tb-btn bev-out" aria-label={`Minimize ${title}`} onPointerDown={(e) => e.stopPropagation()} onClick={onMin}>▁</button>
        {!mobile && (
          <button className="tb-btn bev-out" aria-label={win.max ? `Restore ${title}` : `Maximize ${title}`} onPointerDown={(e) => e.stopPropagation()} onClick={onMax}>
            {win.max ? "❐" : "□"}
          </button>
        )}
        <button className="tb-btn bev-out" aria-label={`Close ${title}`} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={onClose}>✕</button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}