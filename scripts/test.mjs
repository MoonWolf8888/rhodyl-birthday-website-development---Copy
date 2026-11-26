import puppeteer from "puppeteer";
import http from "http";
import fs from "fs";
import path from "path";

const DIST = path.resolve("dist");
const MIME = { ".html": "text/html", ".txt": "text/plain", ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".js": "text/javascript", ".css": "text/css" };
// a three-second test tone, served as the visitor's own birthday.mp3 only when serveSong is on
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
  if (serveSong && req.url.includes("birthday.mp3")) { res.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": wav.length }); return res.end(wav); }
  let p = path.join(DIST, decodeURIComponent(req.url.split("?")[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(DIST, "index.html");
  const ext = path.extname(p);
  res.writeHead(fs.existsSync(p) ? 200 : 404, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(4173, r));

const results = [];
const ok = (name) => { results.push(["PASS", name]); console.log("PASS:", name); };
const fail = (name, e) => { results.push(["FAIL", name]); console.log("FAIL:", name, String(e).slice(0, 300)); };

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--mute-audio", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push("console: " + m.text()); });

const clickBtn = (text) => page.evaluate((t) => {
  const el = [...document.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").includes(t) || b.textContent.trim().includes(t));
  if (!el) throw new Error("button not found: " + t);
  el.click();
}, text);
const realClick = async (text) => {
  const box = await page.evaluate((t) => {
    const el = [...document.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").includes(t) || b.textContent.trim().includes(t));
    if (!el) throw new Error("button not found: " + t);
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text);
  await page.mouse.click(box.x, box.y);
};
const waitText = (t, timeout = 8000) => page.waitForFunction((x) => document.body.innerText.includes(x), { timeout }, t);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (n) => { await sleep(1200); return page.screenshot({ path: `shots/${n}.png` }); };
fs.mkdirSync("shots", { recursive: true });

try {
  await page.goto("http://localhost:4173", { waitUntil: "load", timeout: 20000 });
  await waitText("Initializing RHODYL.EXE");
  ok("boot sequence renders");
  await sleep(700);
  await page.mouse.click(640, 300); // fast-forward
  await waitText("[ START ]");
  ok("START screen appears");
  await shot("01-boot");
  await clickBtn("[ START ]");
  await waitText("Are you qualified to turn 21?");
  ok("verification window opens");

  await page.type("input", "12");
  await page.keyboard.press("Enter");
  await waitText("birthday privileges are under review");
  ok("wrong answer joke + Enter submit");
  await page.type("input", "5");
  await page.keyboard.press("Enter");
  await page.type("input", "7");
  await page.keyboard.press("Enter");
  await waitText("Hint: 7² means 7 × 7");
  ok("escalating hint after 3 misses");
  await shot("02-verify");
  await realClick("Close verification");
  await waitText("Exit denied. Adulthood is mandatory.");
  ok("gate ✕ gives visible joke feedback");
  await page.type("input", "21");
  await clickBtn("Verify Intelligence");
  await waitText("ACCESS GRANTED!");
  ok("correct answer grants access");
  await waitText("Start", 6000);
  await sleep(400);
  ok("desktop appears");

  await clickBtn("Cake.exe");
  await waitText("ERROR 021: CAKE ACCESS DENIED");
  await waitText("Required folders opened: 0/3");
  ok("locked cake error with progress");
  await clickBtn("OK");
  await sleep(200);

  await clickBtn("Memory Archives");
  await waitText("MEMORY_ARCHIVE");
  await waitText("CHOOSE YOUR FIGHTER");
  const tiles = await page.evaluate(() => document.querySelectorAll(".fighter-card").length);
  if (tiles === 6) ok("character select shows exactly six fighters"); else fail("fighter count", tiles);
  const acid = await page.evaluate(() => getComputedStyle(document.querySelector(".fighter-info .acid-text")).color);
  if (acid === "rgb(57, 255, 20)") ok("fighter quotes render in neon green"); else fail("quote colour", acid);
  await shot("03-cover");
  await clickBtn("Select fighter SLEEP MODE");
  await page.waitForFunction(() => document.querySelector(".stage-nameplate")?.textContent.includes("SLEEP MODE"));
  await waitText("HEADPHONE FORCEFIELD");
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.querySelector(".stage-nameplate")?.textContent.includes("BLANKET BOSS"));
  ok("fighter stage, stats and arrow-key navigation");
  await shot("04-scrapbook");
  await clickBtn("LOCK IN");
  await waitText("CHALLENGER APPROACHING");
  await waitText("READY!");
  ok("lock-in plays the PLAYER 1 READY sequence");
  await clickBtn("CONTINUE");
  await page.waitForFunction(() => !document.querySelector(".fighter-lockin"));
  ok("continue returns to the character select");
  // drag by title bar with real pointer events
  const tb = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role="dialog"]')].find((d) => d.getAttribute("aria-label") === "Memory Archives");
    const r = el.getBoundingClientRect();
    return { x: r.x + 160, y: r.y + 14, left: r.x };
  });
  await page.mouse.move(tb.x, tb.y); await page.mouse.down();
  await page.mouse.move(tb.x + 90, tb.y + 50, { steps: 6 }); await page.mouse.up();
  const movedX = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].find((d) => d.getAttribute("aria-label") === "Memory Archives").getBoundingClientRect().x);
  if (Math.abs(movedX - tb.left - 90) < 10) ok("title-bar drag moves window"); else fail("window drag", movedX);
  await realClick("Close Memory Archives");
  await sleep(300);
  const archivesGone = await page.evaluate(() => ![...document.querySelectorAll('[role="dialog"]')].some((d) => d.getAttribute("aria-label") === "Memory Archives"));
  if (archivesGone) ok("✕ closes window (real pointer click)"); else fail("✕ close", "window still open");
  await sleep(200);

  await clickBtn("Classified Files");
  await waitText("BUREAU OF BIRTHDAY AFFAIRS");
  await clickBtn("CONFIDENTIAL.txt");
  await waitText("Bureau of Birthday Affairs");
  ok("classified txt viewer");
  await clickBtn("Back");
  await clickBtn("Intelligence_Report.pdf");
  await waitText("OPERATION: BIRTHDAY SURPRISE");
  const redacted = await page.evaluate(() => document.querySelectorAll(".redacted").length);
  if (redacted >= 2) ok("pdf viewer with clickable redactions"); else fail("pdf redactions", redacted);
  await clickBtn("Back");
  await clickBtn("Definitely_Not_Embarrassing.jpg");
  await waitText("CENSORED");
  ok("intentional censored jpg viewer");
  await shot("05-classified");
  await realClick("Close Classified Files");
  await sleep(200);

  await clickBtn("21 Years of Chaos");
  await waitText("Professional Overthinker");
  ok("chaos stats + achievements");
  await waitText("ACHIEVEMENT UNLOCKED!");
  await waitText("Memories explored:");
  ok("unlock achievement fires");
  await waitText("Open your birthday surprise?", 5000);
  ok("surprise popup appears");
  await shot("06-desktop-unlock");
  await clickBtn("YES");
  await waitText("Make a wish, Rhodyl.");
  const flames = await page.evaluate(() => document.querySelectorAll(".flame").length);
  if (flames === 21) ok("exactly 21 individual flames"); else fail("flame count", flames);
  await shot("07-cake");

  // denied mic path (headless: fake UI grants; instead verify manual + meter presence)
  await clickBtn("Blow Out Candles");
  await sleep(2600);
  await waitText("Your wish has been sent to the universe.", 8000);
  ok("manual blow → finale shot 1 (the wish)");
  await shot("08-wish");
  await page.waitForFunction(() => { const c = document.querySelector("canvas"); return c && getComputedStyle(c).opacity === "1"; }, { timeout: 9000 });
  ok("celebration canvas actually fades in and renders");
  await shot("08b-celebration");
  const moving = await page.evaluate(async () => {
    const c = document.querySelector("canvas"), g = c.getContext("2d");
    const grab = () => { const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 97) s += d[i]; return s; };
    const a = grab(); await new Promise((r) => setTimeout(r, 300)); const b = grab(); await new Promise((r) => setTimeout(r, 300));
    return a !== b && b !== grab();
  });
  if (moving) ok("fireworks canvas changes frame to frame (animating)"); else fail("fireworks animation", "canvas is static");
  await waitText("one last firework", 12000);
  ok("celebration → close-up cut reached");
  await shot("09-closeup");
  await sleep(2400);
  await shot("09b-ascent");
  await waitText("HAPPY 21ST BIRTHDAY, RHODYL!", 16000);
  ok("grand explosion reveals greeting");
  await sleep(2500);
  await shot("10-greeting");
  await waitText("Replay finale");
  ok("greeting buttons appear");

  await clickBtn("Replay finale");
  await waitText("Your wish has been sent to the universe.", 4000);
  ok("replay restarts cleanly");
  await clickBtn("Skip to greeting");
  await waitText("Replay finale", 4000);
  ok("skip jumps to greeting");
  await clickBtn("Return to desktop");
  await waitText("Memories explored:");
  await sleep(600);
  const progress = await page.evaluate(() => document.body.innerText.includes("3/3"));
  if (progress) ok("desktop preserved, progress 3/3"); else fail("progress after return", "not 3/3");
  const glow = await page.evaluate(() => !!document.querySelector(".icon-glow"));
  if (glow) ok("cake icon glows after unlock"); else fail("cake glow", "missing");
  await shot("11-desktop-after");

  // music player state
  await clickBtn("Music Player");
  await waitText("RHODYL·AMP");
  await waitText("BUILT-IN SYNTH");
  ok("player shows the built-in synth soundtrack");
  const playing = await page.evaluate(() => document.body.innerText.includes("now playing"));
  if (playing) ok("music survived all scene changes"); else fail("music playing", "not playing");
  await waitText("MUSIC BOX — now playing");
  ok("default track is MUSIC BOX (option A)");
  const currentTitle = () => page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-current") === "true"); return b ? b.textContent : ""; });
  await clickBtn("Play track NIGHT MARKET");
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((x) => x.getAttribute("aria-current") === "true" && x.textContent.includes("NIGHT MARKET")), { timeout: 8000 });
  await realClick("Next track");
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((x) => x.getAttribute("aria-current") === "true" && x.textContent.includes("ARCADE BIRTHDAY")), { timeout: 8000 });
  const stateOk = await page.evaluate(() => [...document.querySelectorAll(".marquee-wrap")].some((d) => d.textContent.includes("now playing")));
  if (stateOk) ok("playlist: pick a track and skip to the next"); else fail("playlist state", "not playing");
  const mix = await page.evaluate(async () => { const out = []; for (const id of window.__rhodylAudio.tracks) out.push(await window.__rhodylAudio.renderStats(id, 24)); return out; });
  const badMix = mix.filter((s) => s.bad || s.peak > 1.25 || s.rms < 0.05 || s.longestSilence > 0.6);
  if (mix.length === 6 && !badMix.length) ok("all 6 tracks render: no clipping, no silence"); else fail("track render", JSON.stringify(badMix));
  await realClick("Close Music Player");

  // ── mobile pass ──
  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: "load" });
  await sleep(800);
  await page.mouse.click(195, 300);
  await waitText("[ START ]");
  await clickBtn("[ START ]");
  await waitText("Are you qualified");
  await page.type("input", "21");
  await clickBtn("Verify Intelligence");
  await waitText("Start", 7000);
  await sleep(300);
  await clickBtn("Memory Archives");
  await waitText("MEMORY_ARCHIVE");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow <= 0) ok("mobile: no horizontal overflow"); else fail("mobile overflow", overflow);
  await clickBtn("Select fighter SLEEP MODE");
  await page.waitForFunction(() => document.querySelector(".stage-nameplate")?.textContent.includes("SLEEP MODE"));
  await clickBtn("LOCK IN");
  await waitText("CHALLENGER APPROACHING");
  await clickBtn("CONTINUE");
  ok("mobile character select and lock-in work");
  await shot("12-mobile-scrapbook");
  await clickBtn("Close Memory Archives");
  await sleep(300);
  await shot("13-mobile-desktop");

  // ── mobile: unlock, then the MICROPHONE path with a fake audio device ──
  await clickBtn("Classified Files");
  await waitText("BUREAU OF BIRTHDAY AFFAIRS");
  await realClick("Close Classified Files");
  await clickBtn("21 Years of Chaos");
  await waitText("ACHIEVEMENT UNLOCKED!");
  await waitText("Open your birthday surprise?", 5000);
  await clickBtn("YES");
  await waitText("Make a wish, Rhodyl.", 8000);
  await clickBtn("Use mic & blow");
  await waitText("LEARNING THE ROOM", 6000);
  ok("mic permission + calibration engages");
  await waitText("BLOW STEADILY", 6000);
  ok("live blow meter listening");
  await shot("14-mobile-cake-mic");
  const blewByMic = await page.waitForFunction(() => document.body.innerText.includes("CANDLES OUT"), { timeout: 9000 }).then(() => true).catch(() => false);
  if (!blewByMic) await clickBtn("Blow Out Candles"); // fake device may be too polite; manual must still finish
  await waitText("Your wish has been sent to the universe.", 10000);
  ok(blewByMic ? "mic blowing extinguished all candles → finale" : "mic denied-free fallback → manual finishes → finale");
  await clickBtn("Skip to greeting");
  await waitText("Replay finale", 5000);
  await clickBtn("Return to desktop");
  await waitText("1/3", 6000).catch(() => {});
  await sleep(700);
  const mobileProgress = await page.evaluate(() => document.body.innerText.includes("3/3"));
  if (mobileProgress) ok("mobile return preserves 3/3 progress"); else fail("mobile progress", "not 3/3");

  // ── reduced motion: the cutscene must still happen, gently ──
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setViewport({ width: 1280, height: 800 });
  await page.reload({ waitUntil: "load" });
  await sleep(800);
  await page.mouse.click(640, 300);
  await waitText("[ START ]");
  await clickBtn("[ START ]");
  await waitText("Are you qualified");
  await page.type("input", "21");
  await clickBtn("Verify Intelligence");
  await waitText("Start", 8000);
  await sleep(400);
  for (const app of ["Memory Archives", "Classified Files", "21 Years of Chaos"]) {
    await clickBtn(app); await sleep(350); await realClick("Close " + app); await sleep(200);
  }
  await waitText("Open your birthday surprise?", 6000);
  await clickBtn("YES");
  await waitText("Make a wish, Rhodyl.", 8000);
  await clickBtn("Blow Out Candles");
  await waitText("Your wish has been sent to the universe.", 10000);
  ok("device asks for reduced motion: wish beat plays");
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
  serveSong = false;
} catch (e) {
  fail("flow interrupted", e);
  await shot("99-failure").catch(() => {});
}

console.log("\nRuntime errors:", errors.length ? errors : "none");
const fails = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - fails}/${results.length} checks passed`);
await browser.close();
server.close();
process.exit(fails || errors.length ? 1 : 0);