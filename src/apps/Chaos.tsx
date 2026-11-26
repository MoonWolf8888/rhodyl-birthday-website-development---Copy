import { ACHIEVEMENTS, PERSON, STATS } from "../config";
import { Badge } from "../art";

export function Chaos() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-panel">
      <div className="px-4 py-3 bg-void border-b border-neon/30">
        <div className="font-crt text-[11px] font-bold tracking-[0.25em] text-neon" style={{ textShadow: "0 0 10px rgba(255,180,54,.5)" }}>SYSTEM DIAGNOSTICS — SUBJECT: {PERSON.name.toUpperCase()}</div>
        <div className="font-crt text-[9px] text-neondim tracking-widest mt-0.5">RUNNING CONTINUOUSLY FOR 21 YEARS · NO CRASHES THAT MATTERED</div>
      </div>

      <div className="p-4">
        <div className="bev-out p-4">
          <div className="font-crt text-[10px] font-bold tracking-[0.3em] text-neondim mb-3">▚ VITAL STATISTICS</div>
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 border-b border-neon/15 last:border-0">
              <span className="font-crt text-[12px] w-44 shrink-0 text-steel">{s.label}</span>
              <span className={`font-crt text-[12px] font-bold ${s.value === "ACTIVATED" ? "text-cyber" : "text-neonbright"}`}>{s.value}</span>
              {s.bar !== undefined && (
                <span className="bev-in h-4 flex-1 min-w-24 max-w-44 ml-auto p-[2px]">
                  <span
                    className={`block h-full ${s.bar < 50 ? "progress-stripes" : "bg-gradient-to-r from-neondim to-neon"}`}
                    style={{ width: `${s.bar}%`, boxShadow: s.bar >= 50 ? "0 0 8px rgba(255,180,54,.5)" : undefined }}
                  />
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="font-crt text-[10px] font-bold tracking-[0.3em] text-neondim mt-5 mb-2 px-1">▚ ACHIEVEMENTS · 6 / 6 UNLOCKED</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.name} className="bev-out p-3 flex gap-3 items-start hover:border-neon/50 transition-colors">
              <div className="shrink-0"><Badge kind={a.icon} size={56} /></div>
              <div className="min-w-0">
                <div className="font-crt text-[12px] font-bold text-neonbright">{a.name}</div>
                <div className="font-editorial italic text-[12px] text-steel leading-snug mt-1">{a.desc}</div>
                <div className="font-crt text-[8.5px] text-neon font-bold tracking-[0.25em] mt-1.5">★ UNLOCKED</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bev-in mt-5 p-3 flex items-center gap-3">
          <span className="font-crt text-[10px] font-bold tracking-widest shrink-0 text-steel">CHAOS LEVEL</span>
          <span className="bev-in flex-1 h-5 p-[2px]"><span className="block h-full bg-gradient-to-r from-cyber via-neon to-danger" style={{ width: "100%", boxShadow: "0 0 10px rgba(255,93,115,.4)" }} /></span>
          <span className="font-crt text-[11px] font-bold text-danger shrink-0" style={{ textShadow: "0 0 8px rgba(255,93,115,.6)" }}>LEGENDARY</span>
        </div>
      </div>
    </div>
  );
}