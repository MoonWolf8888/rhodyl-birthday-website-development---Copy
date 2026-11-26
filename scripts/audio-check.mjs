// Renders every built-in track offline in headless Chrome and prints mix measurements.
import puppeteer from "puppeteer";
import http from "http";
import fs from "fs";
import path from "path";

const DIST = path.resolve("dist");
const server = http.createServer((req, res) => {
  let p = path.join(DIST, decodeURIComponent(req.url.split("?")[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(DIST, "index.html");
  res.writeHead(200, { "Content-Type": p.endsWith(".html") ? "text/html" : "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(4174, r));
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--mute-audio"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4174", { waitUntil: "load" });
const ids = await page.evaluate(() => window.__rhodylAudio.tracks);
let failed = 0;
for (const id of ids) {
  const s = await page.evaluate((i) => window.__rhodylAudio.renderStats(i, 40), id);
  const ok = s.bad === 0 && s.peak < 1.25 && s.rms > 0.05 && s.rms < 0.4 && s.longestSilence < 0.6;
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "BAD "} ${id.padEnd(10)} peak ${s.peak.toFixed(2)}  rms ${s.rms.toFixed(3)}  low ${s.low.toFixed(2)}  high ${s.high.toFixed(2)}  silence ${s.longestSilence.toFixed(2)}s  loop ${s.loop.toFixed(1)}s`);
}
console.log("page errors:", errors.length ? errors : "none");
await browser.close();
server.close();
process.exit(failed || errors.length ? 1 : 0);
