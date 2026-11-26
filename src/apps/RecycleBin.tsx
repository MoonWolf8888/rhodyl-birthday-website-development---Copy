import { useState } from "react";
import { BIN_EMPTY_JOKE, RECYCLE } from "../config";
import { Icon } from "../art";
import { audio } from "../audio";

type Status = "idle" | "restored" | "deleted";
const OPEN_NOTES: Record<string, string[]> = {
  "Being_20.exe": ["> run Being_20.exe", "FATAL: this version has been deprecated.", "See release notes: RHODYL 21.0 — now with birthday privileges."],
  "Childhood_Free_Trial.txt": ["Thank you for your trial!", "Included: naps you didn't appreciate, snacks of unmatched quality,", "and the belief that Friday nights were infinite. They were."],
  "Responsibilities.zip": ["Extracting… 1 of 4,812 items…", "Extraction paused. The remaining items have agreed to wait until tomorrow.", "They always agree to wait until tomorrow."],
  "Bad_Decisions.log": ["[00:01] decision logged — outcome: hilarious", "[00:02] decision logged — outcome: character development", "[00:03] ████████ — outcome: CLASSIFIED (see Classified Files)", "[21:00] log sealed. No further entries can embarrass you today."],
};

export function RecycleBin({ pushToast }: { pushToast: (t: string, b: string) => void }) {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-panel">
      <div className="flex items-center gap-2 px-3 py-2 bev-out border-x-0 border-t-0 shrink-0">
        <span className="font-crt text-[11px] font-bold flex-1 text-neonbright">The past, gently discarded</span>
        <button className="btn" onClick={() => { audio.sfx("error"); pushToast("Empty Recycle Bin?", BIN_EMPTY_JOKE); }}>Empty Bin</button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {RECYCLE.map((r) => {
          const st = status[r.name] || "idle";
          return (
            <div key={r.name} className={`bev-out mb-2 ${st === "deleted" ? "opacity-45" : ""}`}>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <Icon id={r.icon} size={32} />
                <button
                  className={`flex-1 min-w-0 text-left font-crt text-[12px] font-bold truncate text-neonbright hover:text-neon cursor-pointer ${st === "restored" ? "line-through" : ""}`}
                  onClick={() => { audio.sfx("click"); setOpen(open === r.name ? null : r.name); }}
                  aria-expanded={open === r.name}
                >
                  {r.name}
                  <span className="block font-normal text-[9px] text-steeldim">{st === "restored" ? "RESTORED (it insisted)" : st === "deleted" ? "shredded · will respawn as a memory" : "click to peek inside"}</span>
                </button>
                <button className="btn !px-2.5" disabled={st !== "idle"} onClick={() => { audio.sfx("success"); setStatus((s) => ({ ...s, [r.name]: "restored" })); pushToast(`Restoring ${r.name}…`, r.response); }}>Restore</button>
                <button className="btn !px-2.5" disabled={st === "deleted"} onClick={() => { audio.sfx("puff"); setStatus((s) => ({ ...s, [r.name]: "deleted" })); pushToast(`${r.name} deleted.`, "It will respawn as a memory anyway. That's how archives work."); }}>Delete</button>
              </div>
              {open === r.name && (
                <div className="bev-in mx-3 mb-3 p-3">
                  {(OPEN_NOTES[r.name] || []).map((l, i) => (
                    <div key={i} className="font-crt text-[11px] text-cyber leading-relaxed" style={{ textShadow: "0 0 6px rgba(79,227,193,.35)" }}>{l}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <p className="font-crt text-[10px] text-steeldim text-center py-2">Nothing here is truly gone. That's the point of friends.</p>
      </div>
    </div>
  );
}