// One-shot patcher: motion switch wiring, calm-mode CSS, mix balance, test updates.
import fs from "fs";
const read = (f) => fs.readFileSync(f, "utf8");
function swap(f, from, to) {
  const s = read(f);
  if (!s.includes(from)) throw new Error("string not found in " + f + ": " + from);
  fs.writeFileSync(f, s.split(from).join(to));
}
function lines(f, key, count, text) {
  const a = read(f).split("\n");
  const i = a.findIndex((l) => l.includes(key));
  if (i < 0) throw new Error("key not found in " + f + ": " + key);
  a.splice(i, count, text);
  fs.writeFileSync(f, a.join("\n"));
}

/* ── config: motion is an explicit setting ── */
swap("src/config.ts", `export const CAKE = {`, `// ── MOTION ─────────────────────────────────────────────────────────
// "full"   — always play every animation (fireworks, fades, flames). Default.
// "system" — follow the device: if it asks for reduced motion, start in calm mode.
// "calm"   — always start in calm mode (still fireworks, no CSS animation).
// Whatever you pick, the visitor can flip it on the START screen or in the Start menu.
export const MOTION: { default: "full" | "system" | "calm" } = { default: "full" };

export const CAKE = {`);

/* ── calm mode is a class on <html>, not an automatic media query ── */
const C = "src/index.css";
swap(C, `/* ── reduced motion: everything still works, calmly ── */`, `/* ── calm mode (html.calm): everything still works, without movement ── */`);
swap(C, `@media (prefers-reduced-motion: reduce) {`, `@media all {`);
swap(C, `  *, *::before, *::after {`, `  html.calm *, html.calm *::before, html.calm *::after {`);
swap(C, `  .flame { transform: rotate(0deg); }`, `  html.calm .flame { transform: rotate(0deg); }`);
swap(C, `  .smoke-wisp { opacity: 0.4; }`, `  html.calm .smoke-wisp { opacity: 0.4; }`);

/* ── START screen: motion switch beside the sound hint ── */
const B = "src/components/Boot.tsx";
swap(B, `import { audio } from "../audio";`, `import { audio } from "../audio";\nimport { motion, useReducedMotion } from "../hooks";`);
swap(B, `  const [shown, setShown] = useState(0);`, `  const [shown, setShown] = useState(0);\n  const calm = useReducedMotion();`);
swap(B, `<div className="text-neon/50 text-[0.8em] cursor-blink">▸ sound on · press Enter</div>`, `<div className="flex flex-wrap items-center justify-center gap-x-2 text-[0.8em]">
                  <span className="text-neon/50 cursor-blink">▸ sound on · press Enter</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); motion.setCalm(!calm); }}
                    aria-pressed={calm} aria-label={"Motion: " + (calm ? "calm" : "full") + ". Switch"}
                    className="font-crt px-2 py-1 text-neon/80 hover:text-neonbright cursor-pointer"
                  >
                    [ MOTION: {calm ? "CALM" : "FULL"} ]
                  </button>
                </div>
                {motion.systemReduced() && !calm && (
                  <div className="text-[0.7em] text-neon/45 px-3 hidden sm:block">this device asks for less motion — switch to CALM if you prefer</div>
                )}`);

/* ── Start menu: Motion item ── */
const D = "src/components/Desktop.tsx";
swap(D, `import { useIsMobile } from "../hooks";`, `import { motion, useIsMobile, useReducedMotion } from "../hooks";`);
swap(D, `  const st = useAudio();`, `  const st = useAudio();\n  const calm = useReducedMotion();`);
swap(D, `<div className="border-t border-neon/20 my-1" />`, `<div className="border-t border-neon/20 my-1" />
              <button role="menuitem" aria-pressed={calm} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neon/10 font-crt text-[12px] text-left cursor-pointer text-steel hover:text-neonbright" onClick={() => { audio.sfx("click"); motion.setCalm(!calm); }}>
                <Icon id="chaos" size={24} />
                <span className="flex-1">Motion</span>
                <span className={calm ? "text-cyber" : "acid-text"}>{calm ? "CALM" : "FULL"}</span>
              </button>`);

/* ── mix: the offline render measured bass-heavy, so pull the lows back and lift the melody ── */
const M = "src/music.ts";
swap(M, `this.lv("kick") * 0.95`, `this.lv("kick") * 0.8`);
swap(M, `(kind === "sub" ? 0.5 : 0.3)`, `(kind === "sub" ? 0.36 : 0.26)`);
swap(M, `this.lv("arp") * 0.14`, `this.lv("arp") * 0.17`);
swap(M, `this.lv("lead") * 0.16`, `this.lv("lead") * 0.19`);
swap(M, `(this.track.pad ?? 0) * 0.045`, `(this.track.pad ?? 0) * 0.055`);
swap(M, `this.lv("stab") * 0.085`, `this.lv("stab") * 0.1`);

/* ── tests ── */
const T = "scripts/test.mjs";
swap(T, `"--use-fake-device-for-media-stream", "--mute-audio"]`, `"--use-fake-device-for-media-stream", "--mute-audio", "--autoplay-policy=no-user-gesture-required"]`);
swap(T, `const server = http.createServer((req, res) => {`, `// a three-second test tone, served as the visitor's own birthday.mp3 only when serveSong is on
let serveSong = false;
const wav = (() => {
  const sr = 8000, n = sr * 3, b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i * 0.3) * 8000), 44 + i * 2);
  return b;
})();
const server = http.createServer((req, res) => {
  if (serveSong && req.url.includes("birthday.mp3")) { res.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": wav.length }); return res.end(wav); }`);
swap(T, `  await waitText("SYNTH DEMO");`, `  await waitText("BUILT-IN SYNTH");`);
swap(T, `ok("honest synth demo state in player");`, `ok("player shows the built-in synth soundtrack");`);
swap(T, `  if (playing) ok("music survived all scene changes"); else fail("music playing", "not playing");`, `  if (playing) ok("music survived all scene changes"); else fail("music playing", "not playing");
  await waitText("NEON DISTRICT — now playing");
  ok("new default track: NEON DISTRICT");
  await clickBtn("Play track NIGHT MARKET");
  await waitText("NIGHT MARKET — now playing");
  await clickBtn("Next track");
  await waitText("ARCADE BIRTHDAY — now playing");
  ok("playlist: pick a track and skip to the next");
  const mix = await page.evaluate(async () => { const out = []; for (const id of window.__rhodylAudio.tracks) out.push(await window.__rhodylAudio.renderStats(id, 24)); return out; });
  const badMix = mix.filter((s) => s.bad || s.peak > 1.25 || s.rms < 0.05 || s.longestSilence > 0.6);
  if (mix.length === 4 && !badMix.length) ok("all 4 tracks render: no clipping, no silence"); else fail("track render", JSON.stringify(badMix));`);
lines(T, `ok("reduced motion: wish beat still plays");`, 5, `  ok("device asks for reduced motion: wish beat plays");
  await waitText("one last firework", 14000);
  ok("device asks for reduced motion: FULL animated fireworks still play by default");
  await clickBtn("Skip to greeting");
  await waitText("Replay finale", 6000);
  await clickBtn("Return to desktop");
  await sleep(1500);
  await clickBtn("Start menu");
  await clickBtn("Motion");
  const calmOn = await page.evaluate(() => document.documentElement.classList.contains("calm"));
  if (calmOn) ok("Start menu Motion switch turns calm mode on"); else fail("calm switch", "class missing");
  await clickBtn("Cake.exe");
  await waitText("Make a wish, Rhodyl.", 8000);
  await clickBtn("Blow Out Candles");
  await waitText("Your wish has been sent to the universe.", 10000);
  await waitText("HAPPY 21ST BIRTHDAY, RHODYL!", 9000);
  ok("calm mode: still cutscene reaches the greeting");
  await shot("15-reduced-greeting");
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);

  // ── the visitor's own birthday.mp3 takes over when it exists ──
  serveSong = true;
  await page.reload({ waitUntil: "load" });
  await sleep(800);
  await page.mouse.click(640, 300);
  await waitText("[ START ]");
  await realClick("[ START ]");
  await waitText("Are you qualified");
  await page.type("input", "21");
  await clickBtn("Verify Intelligence");
  await waitText("Start", 8000);
  await sleep(600);
  await clickBtn("Music Player");
  await waitText("Our Birthday Song — now playing", 6000);
  const mp3Playing = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") || "") === "Play track Our Birthday Song"); return !!b && b.getAttribute("aria-current") === "true"; });
  if (mp3Playing) ok("own birthday.mp3 joins the playlist and plays first"); else fail("mp3 takeover", "not current");
  serveSong = false;`);
/* fireworks must be moving: compare canvas pixels a moment apart during the celebration */
swap(T, `  await shot("08b-celebration");`, `  await shot("08b-celebration");
  const moving = await page.evaluate(async () => {
    const c = document.querySelector("canvas"), g = c.getContext("2d");
    const grab = () => { const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 97) s += d[i]; return s; };
    const a = grab(); await new Promise((r) => setTimeout(r, 300)); const b = grab(); await new Promise((r) => setTimeout(r, 300));
    return a !== b && b !== grab();
  });
  if (moving) ok("fireworks canvas changes frame to frame (animating)"); else fail("fireworks animation", "canvas is static");`);
console.log("patch2 applied");
