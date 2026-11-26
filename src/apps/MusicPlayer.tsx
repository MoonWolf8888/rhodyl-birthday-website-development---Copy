import { useEffect, useState } from "react";
import { audio, useAudio } from "../audio";
import { Icon } from "../art";
import { fmtTime } from "../hooks";
import { MUSIC } from "../config";

export function MusicPlayer() {
  const st = useAudio();
  const [pos, setPos] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setPos(audio.position()), 250);
    return () => clearInterval(t);
  }, []);

  const dur = st.duration || 1;
  const shown = drag ?? Math.min(pos, dur);
  const commit = () => { if (drag !== null) { audio.seek(drag); setDrag(null); } };
  const live = st.playing && !st.muted;
  const hasMp3 = st.playlist.some((p) => p.kind === "mp3");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-panel p-3">
      <div className="bev-in p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-crt text-[9px] tracking-[0.3em] text-neon" style={{ textShadow: "0 0 8px rgba(255,180,54,.5)" }}>RHODYL·AMP v21</span>
          <span className={`font-crt text-[8.5px] px-1.5 py-0.5 border ${st.mode === "file" ? "border-cyber text-cyber" : "border-neon text-neonbright"}`}>
            {st.mode === "file" ? "MP3" : st.mode === "synth" ? "BUILT-IN SYNTH" : "STANDBY"}
          </span>
        </div>
        <div className="marquee-wrap font-crt text-[12px] text-neonbright">
          <span className={st.playing ? "marquee" : ""}>♪ {st.title} — {st.playing ? "now playing" : "paused"} ♪ {st.mood}</span>
        </div>
        <div className="flex items-end gap-[3px] h-12 mt-2" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="viz-bar flex-1 bg-gradient-to-t from-cyber via-neon to-magenta"
              style={{
                height: `${30 + ((i * 37) % 60)}%`,
                animationDelay: `${(i % 6) * 0.11}s`,
                animationDuration: `${0.6 + (i % 4) * 0.14}s`,
                animationPlayState: live ? "running" : "paused",
                opacity: live ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-crt text-[10px] text-neonbright w-9">{fmtTime(shown)}</span>
          <input
            type="range" min={0} max={dur} step={0.1} value={shown}
            aria-label="Seek position" className="flex-1"
            onChange={(e) => setDrag(parseFloat(e.target.value))}
            onPointerUp={commit} onKeyUp={commit} onBlur={commit}
          />
          <span className="font-crt text-[10px] text-steeldim w-9 text-right">{fmtTime(dur)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button className="btn !px-2.5" onClick={() => audio.skip(-1)} aria-label="Previous track">◄◄</button>
        <button className="btn btn-gold !text-[15px] !px-5" onClick={() => audio.playPause()} aria-label={st.playing ? "Pause music" : "Play music"}>
          {st.playing ? "❚❚" : "►"}
        </button>
        <button className="btn !px-2.5" onClick={() => audio.skip(1)} aria-label="Next track">►►</button>
        <button className="btn !px-2.5" onClick={() => audio.toggleMute()} aria-label={st.muted ? "Unmute all sound" : "Mute all sound"} aria-pressed={st.muted}>
          <Icon id={st.muted ? "muted" : "speaker"} size={20} />
        </button>
        <input
          type="range" min={0} max={100} value={Math.round(st.volume * 100)}
          aria-label="Music volume" className="flex-1 min-w-0"
          onChange={(e) => audio.setVolume(parseInt(e.target.value, 10) / 100)}
        />
        <span className="font-crt text-[10px] w-8 text-right text-steel">{Math.round(st.volume * 100)}%</span>
      </div>

      <div className="bev-out mt-3 p-3">
        <div className="font-crt text-[9px] font-bold tracking-[0.3em] text-neondim mb-2">PLAYLIST · {st.playlist.length} TRACKS</div>
        {st.playlist.map((p, i) => {
          const on = p.id === st.trackId;
          return (
            <button
              key={p.id}
              className={`w-full flex items-center gap-2 font-crt text-[11px] py-2 px-2 mb-1 text-left cursor-pointer border ${on ? "bg-neon/10 border-neon/50 text-neonbright" : "border-transparent text-steel hover:border-neon/30 hover:text-neonbright"}`}
              onClick={() => audio.select(p.id)}
              aria-label={`Play track ${p.title}`} aria-current={on ? "true" : undefined}
            >
              <span className={on ? "acid-text w-4" : "text-steeldim w-4"}>{on ? (st.playing ? "▸" : "❚") : i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block truncate font-bold">{p.title}</span>
                <span className="block truncate text-[9px] text-steeldim">{p.mood}{p.finale ? " · plays with the fireworks" : ""}</span>
              </span>
              <span className={`text-[8px] px-1 border ${p.kind === "mp3" ? "border-cyber text-cyber" : "border-neondim text-neondim"}`}>{p.kind === "mp3" ? "MP3" : "SYNTH"}</span>
            </button>
          );
        })}
        <p className="font-crt text-[10px] leading-relaxed text-steeldim mt-2">
          {hasMp3
            ? "Your own MP3 is in the playlist and plays first. The built-in tracks stay available."
            : `The built-in tracks are original music made live by the synthesizer. Drop your own ${MUSIC.file.split("/").pop()} into assets/music/ and it joins the playlist and plays first.`}
        </p>
      </div>
    </div>
  );
}
