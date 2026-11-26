import { useState } from "react";
import { CLASSIFIED, type ClassifiedDoc } from "../config";
import { Icon } from "../art";
import { audio } from "../audio";

const iconFor = (t: string) => (t === "pdf" ? "pdf" : t === "jpg" ? "jpg" : "doc");

function RichLine({ line, onRedacted }: { line: string; onRedacted: () => void }) {
  const parts = line.split("[[REDACTED]]");
  return (
    <p className="mb-3">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <button className="redacted font-crt text-[12px]" onClick={onRedacted} aria-label="Redacted text" title="Redacted">REDACTED██</button>
          )}
        </span>
      ))}
    </p>
  );
}

function Viewer({ doc, onBack, pushToast }: { doc: ClassifiedDoc; onBack: () => void; pushToast: (t: string, b: string) => void }) {
  const redactedJoke = () => { audio.sfx("error"); pushToast("Nice try.", "That information stays classified. Even from the birthday person."); };
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 bev-out border-x-0 border-t-0 shrink-0">
        <button className="btn !px-3" onClick={onBack}>◄ Back</button>
        <span className="font-crt text-[11px] font-bold truncate text-neonbright">{doc.name}</span>
        <span className="ml-auto font-crt text-[9px] text-steeldim hidden sm:block">READ-ONLY · NO TAKEBACKS</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-void/70">
        {doc.type === "jpg" ? (
          <div className="max-w-md mx-auto">
            <div className="bev-in p-3">
              <div className="relative bg-[#080605] aspect-[4/3] grid place-items-center overflow-hidden">
                <svg viewBox="0 0 300 220" className="w-full h-full" aria-label="A sealed photograph, censored for everyone's protection">
                  <rect width="300" height="220" fill="#0D0A08" />
                  <circle cx="150" cy="92" r="38" fill="#4A3222" />
                  <path d="M85 220c8-52 38-74 65-74s57 22 65 74z" fill="#4A3222" />
                  <circle cx="150" cy="92" r="38" fill="#0D0A08" opacity="0.4" />
                  <rect x="40" y="72" width="220" height="38" fill="#070504" stroke="#FFB436" strokeWidth="2" />
                  <text x="150" y="98" textAnchor="middle" fontFamily="Courier New" fontWeight="bold" fontSize="22" letterSpacing="8" fill="#FFB436">CENSORED</text>
                  <text x="150" y="200" textAnchor="middle" fontFamily="Courier New" fontSize="10" letterSpacing="3" fill="#FF5D73">IMAGE PREVIEW SEALED · CASE 021</text>
                </svg>
              </div>
              <div className="flex justify-between font-crt text-[9px] text-neondim mt-2 px-1">
                <span>1998 × 1080 px</span><span>ISO: CHAOS</span><span>f/21</span>
              </div>
            </div>
            <div className="paper bev-out mt-3 p-4 relative">
              <span className="stamp stamp-on-paper absolute -top-3 right-4 text-[11px]">{doc.stamp}</span>
              {doc.lines.map((l, i) => <p key={i} className="font-crt text-[12px] leading-relaxed mb-2">{l}</p>)}
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {doc.type === "pdf" && (
              <div className="bev-out flex items-center gap-2 px-3 py-1.5 font-crt text-[10px]">
                <span className="font-bold text-neonbright">{doc.name}</span>
                <span className="text-steeldim">· page 1 / 1</span>
                <span className="ml-auto text-steeldim">zoom 100%</span>
                <button className="btn !py-1 !px-2 !min-h-0 text-[10px]" onClick={() => pushToast("Printer offline.", "The Bureau of Birthday Affairs went paperless in spirit.")}>Print</button>
              </div>
            )}
            {doc.type === "pdf" ? (
              <div className="paper-ivory grain relative p-6 sm:p-8 shadow-lg border border-neon/30 border-t-0">
                <span className="stamp stamp-on-paper absolute top-4 right-4 text-[11px]">{doc.stamp}</span>
                <div className="relative z-[2] mt-6 font-editorial text-[13.5px] leading-relaxed">
                  {doc.lines.map((l, i) =>
                    l === "" ? <div key={i} className="h-3" /> :
                    i === 0 ? <p key={i} className="font-bold tracking-wider mb-4 text-midnight">{l}</p> :
                    <RichLine key={i} line={l} onRedacted={redactedJoke} />
                  )}
                </div>
              </div>
            ) : (
              <div className="relative p-6 sm:p-8 bg-[#100C09] border border-neon/30" style={{ boxShadow: "0 0 24px rgba(255,180,54,.1), inset 0 0 60px rgba(0,0,0,.5)" }}>
                <span className="stamp absolute top-4 right-4 text-[11px]">{doc.stamp}</span>
                <div className="relative z-[2] mt-6 font-crt text-[12px] leading-relaxed text-[#F5D67E]" style={{ textShadow: "0 0 6px rgba(255,180,54,.35)" }}>
                  {doc.lines.map((l, i) =>
                    l === "" ? <div key={i} className="h-3" /> :
                    i === 0 ? <p key={i} className="font-bold tracking-wider mb-4 text-neonbright">{l}</p> :
                    <RichLine key={i} line={l} onRedacted={redactedJoke} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Classified({ pushToast }: { pushToast: (t: string, b: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const doc = CLASSIFIED.find((d) => d.id === sel);
  if (doc) return <Viewer doc={doc} onBack={() => setSel(null)} pushToast={pushToast} />;
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 bg-void border-b border-neon/30 shrink-0">
        <div className="font-crt text-[11px] font-bold tracking-[0.25em] text-neon" style={{ textShadow: "0 0 10px rgba(255,180,54,.5)" }}>BUREAU OF BIRTHDAY AFFAIRS</div>
        <div className="font-crt text-[9px] text-neondim tracking-widest mt-0.5">SECURE ARCHIVE · CLEARANCE LEVEL: BIRTHDAY</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-panel">
        {CLASSIFIED.map((d) => (
          <button
            key={d.id}
            className="w-full flex items-center gap-3 px-3 py-2.5 bev-out mb-2 text-left hover:border-neon/60 transition-colors cursor-pointer"
            onClick={() => { audio.sfx("click"); setSel(d.id); }}
          >
            <Icon id={iconFor(d.type)} size={34} />
            <span className="flex-1 min-w-0">
              <span className="font-crt text-[12px] font-bold block truncate text-neonbright">{d.name}</span>
              <span className="font-crt text-[9px] text-steeldim">{d.type.toUpperCase()} document · sealed {d.lines.length} lines ago</span>
            </span>
            <span className="stamp text-[8px] !px-1.5 !py-0.5 shrink-0 hidden sm:inline-block">{d.stamp}</span>
            <span className="font-crt text-[11px] text-neon font-bold shrink-0">OPEN ▸</span>
          </button>
        ))}
        <p className="font-crt text-[10px] text-steeldim text-center py-2">6 files · 0 regrets declassified</p>
      </div>
    </div>
  );
}