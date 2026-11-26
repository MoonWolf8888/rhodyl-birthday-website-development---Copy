/* ═══════════════════════════════════════════════════════════════════
   RHODYL.EXE — CONTROL PANEL
   Everything personal lives here. Edit the text, save, done.
   Photos:  drop files into  public/assets/photos/  named 01.jpg … 21.jpg
   Music:   drop files into  public/assets/music/   named birthday.mp3, finale.mp3
   Missing media is handled gracefully — the site never shows broken files.
   ═══════════════════════════════════════════════════════════════════ */

// ── 1. THE PERSON ──────────────────────────────────────────────────
export const PERSON = {
  name: "Rhodyl",
  age: 21,
  from: "your favourite person", // signs the closing letter
};

// ── 2. TITLES & TAGLINES ───────────────────────────────────────────
export const BRAND = {
  title: "RHODYL.EXE",
  chapter: "Chapter 21",
  version: "Version 21.0",
  tagline: "21 years of memories, chaos, and questionable decisions.",
  subtitle: "A completely legitimate birthday program.",
};

// ── 3. BOOT SEQUENCE (status: ok | fail | error | plain) ───────────
export const BOOT_LINES: { text: string; status: "ok" | "fail" | "error" | "plain" }[] = [
  { text: "Initializing RHODYL.EXE...", status: "plain" },
  { text: "Loading 21 years of memories...", status: "ok" },
  { text: "Analyzing questionable life decisions...", status: "ok" },
  { text: "Checking emotional stability... FAILED.", status: "fail" },
  { text: "Installing adult responsibilities... ERROR.", status: "error" },
  { text: "Detecting birthday privileges...", status: "ok" },
  { text: "Preparing classified birthday files...", status: "plain" },
  { text: "Birthday surprise successfully loaded.", status: "ok" },
];

// ── 4. BIRTHDAY SECURITY (the math gate — a joke, not real security) ─
export const GATE = {
  heading: "Are you qualified to turn 21?",
  body: "Before accessing the classified birthday files, you must demonstrate the minimum mathematical requirements necessary to become a 21-year-old.",
  problemAlt: "(7 squared minus the square root of 49) divided by 2",
  answer: 21,
  errors: [
    "Incorrect. Your birthday privileges are under review.",
    "Rhodyl, please. You're supposed to be 21.",
    "Even the calculator is disappointed.",
    "Unfortunately, adulthood cannot proceed.",
    "Intelligence verification failed successfully.",
    "Have you considered repeating elementary school?",
  ],
  hints: [
    "Hint: 7² means 7 × 7. You've got this. Probably.",
    "Hint: √49 is the number that multiplies by itself to make 49.",
    "Hint: (49 − 7) ÷ 2. We are SO close.",
    "Hint: The answer might have something to do with your age.",
  ],
  exitJokes: [
    "Exit denied. Adulthood is mandatory.",
    "The ✕ is decorative. Like most adult responsibilities.",
    "You cannot close growing up. Trust me, I tried.",
    "Nice try. The only way out is arithmetic.",
  ],
  successTitle: "ACCESS GRANTED!",
  successBody:
    "Congratulations. You have demonstrated the minimum mathematical requirements to turn 21.",
};

// ── 5. DESKTOP APPS (ids are stable; rename freely) ────────────────
export type AppId = "archives" | "classified" | "chaos" | "music" | "cake" | "bin";
export const APPS: { id: AppId; name: string; icon: string; blurb: string }[] = [
  { id: "archives", name: "Memory Archives", icon: "folder", blurb: "The Rhodyl Edition — a life in moments" },
  { id: "classified", name: "Classified Files", icon: "classified", blurb: "Sealed documents. Handle with drama." },
  { id: "chaos", name: "21 Years of Chaos", icon: "chaos", blurb: "Official statistics & achievements" },
  { id: "music", name: "Music Player", icon: "music", blurb: "The soundtrack of the day" },
  { id: "cake", name: "Cake.exe", icon: "cake", blurb: "Make a wish" },
  { id: "bin", name: "Recycle Bin", icon: "bin", blurb: "The past, gently discarded" },
];
// Opening each of these once unlocks Cake.exe:
export const REQUIRED_APPS: AppId[] = ["archives", "classified", "chaos"];

export const CAKE_LOCK = {
  title: "ERROR 021: CAKE ACCESS DENIED",
  body: "You cannot eat your cake before appreciating your memories.",
  progressLabel: "Required folders opened",
};
export const UNLOCK_TOAST = {
  title: "ACHIEVEMENT UNLOCKED! — Emotionally Prepared for Cake",
  body: "Cake.exe is now available.",
};

// ── 6. MEMORY ARCHIVES: CHOOSE YOUR FIGHTER ───────────────────────
// Six photographs become six playable versions of Rhodyl.
// Save your photos as public/assets/photos/01.jpg … 06.jpg.
// stats order: CHAOS · STYLE · STEALTH · FRIENDSHIP (0–100).
// fit "contain" is best for square/already-cut-out images; "cover" fills the stage.
export interface PhotoEntry {
  n: number; src: string; alt: string; title: string; role: string;
  caption: string; quote: string; accent: string; fit: "cover" | "contain";
  stats: [number, number, number, number]; moves: [string, string];
}
const F = (
  n: number, title: string, role: string, alt: string, caption: string, quote: string,
  accent: string, stats: [number, number, number, number], moves: [string, string], fit: "cover" | "contain" = "cover",
): PhotoEntry => ({ n, src: `assets/photos/${String(n).padStart(2, "0")}.jpg`, alt, title, role, caption, quote, accent, stats, moves, fit });

export const PHOTOS: PhotoEntry[] = [
  F(1, "FIRESTARTER", "ORANGE-HAIR ENGINEER", "Rhodyl smiling with orange hair and a white engineering shirt",
    "Main character, patch 21.0. Unlimited ideas; instruction manual sold separately.",
    "Growing older is mandatory. Growing up is negotiable.", "#FF8A1F", [92, 88, 64, 97], ["ENGINEERING OVERDRIVE", "SIGNATURE HAIR FLIP"]),
  F(2, "SLEEP MODE", "LO-FI LEGEND", "Rhodyl wearing large headphones with his eyes closed",
    "Low power. Maximum chill. Do not disturb the final boss.",
    "Happiness often hides in ordinary afternoons.", "#2CF5B4", [38, 74, 100, 91], ["HEADPHONE FORCEFIELD", "INSTANT POWER NAP"], "contain"),
  F(3, "BLANKET BOSS", "COMFORT CLASS", "Rhodyl wrapped in a white blanket beside a friend",
    "A formidable opponent in the ancient art of staying five more minutes.",
    "Somehow, the ridiculous moments become the favorites.", "#7FD8FF", [67, 86, 96, 98], ["DUVET DOME", "COZY COUNTER"]),
  F(4, "RIVER LEGEND", "ADVENTURE CLASS", "Rhodyl taking a selfie at a rocky river",
    "Selfie angle locked. Destination optional. Good company equipped.",
    "Not every adventure needs a destination.", "#FFB436", [82, 94, 45, 96], ["TRAILBLAZER", "PERFECT ANGLE"]),
  F(5, "GLAM GLITCH", "SPECIAL EFFECT", "Rhodyl having makeup applied with a brush",
    "One unexpected power-up later: still completely camera ready.",
    "Proof that chaos can be photogenic.", "#FF5A2A", [89, 99, 58, 95], ["SPARKLE SURGE", "CAMERA READY"]),
  F(6, "FINAL FORM", "COUCH CHAMPION", "Rhodyl reclining on a sofa in a dark RAD shirt",
    "RAD shirt activated. A legendary friend in his natural habitat.",
    "Never become too old to be wonderfully ridiculous.", "#39FF14", [76, 90, 93, 100], ["COUCH LOCK", "LEGENDARY LOYALTY"]),
];

// ── 7. CLASSIFIED FILES ────────────────────────────────────────────
export interface ClassifiedDoc { id: string; name: string; type: "txt" | "pdf" | "jpg"; stamp: string; lines: string[]; }
export const CLASSIFIED: ClassifiedDoc[] = [
  {
    id: "confidential", name: "CONFIDENTIAL.txt", type: "txt", stamp: "TOP SECRET",
    lines: [
      "SUBJECT: RHODYL — EYES ONLY",
      "",
      "This file confirms that the subject is officially, verifiably, and irreversibly 21.",
      "Field agents report high levels of charisma, an unlicensed supply of main-character energy, and a laugh that violates several noise ordinances.",
      "Surveillance will continue. Someone has to document the icon behaviour.",
      "",
      "— Bureau of Birthday Affairs",
    ],
  },
  {
    id: "evidence", name: "Evidence_of_Chaos.txt", type: "txt", stamp: "EXHIBIT A",
    lines: [
      "CASE FILE: 21 YEARS OF CERTIFIED SHENANIGANS",
      "",
      "Evidence log (abridged):",
      "• Laughing at the exact moment silence was required. Repeatedly.",
      "• Saying 'one more episode' with documented zero credibility.",
      "• Turning a five-minute errand into a feature-length production.",
      "",
      "Verdict: guilty of making life more entertaining. Sentence: another year of being celebrated.",
    ],
  },
  {
    id: "intelligence", name: "Intelligence_Report.pdf", type: "pdf", stamp: "CLASSIFIED",
    lines: [
      "OPERATION: BIRTHDAY SURPRISE — FINAL ASSESSMENT",
      "",
      "Subject demonstrates advanced abilities in [[REDACTED]], with expert-level command of [[REDACTED]].",
      "Threat level: EXTREMELY LIKELY TO STEAL THE LAST SLICE OF CAKE.",
      "Analysts attempted to quantify the subject's impact on the people around them. Instruments exceeded maximum reading.",
      "Recommendation: promote immediately to Twenty-One. Grant full birthday privileges.",
      "",
      "Signed, The Analyst Who Definitely Isn't Your Friend",
    ],
  },
  {
    id: "adulting", name: "Adulting_Manual.txt", type: "txt", stamp: "UNREAD",
    lines: [
      "ADULTING MANUAL v21.0 (still in beta)",
      "",
      "Chapter 1: Taxes. LOL. Next chapter.",
      "Chapter 2: Drink water. Yes, right now. We'll wait.",
      "Chapter 3: 'I'll do it tomorrow' is a legally binding contract with a very rude collection agency.",
      "Chapter 4: Nobody actually knows what they're doing. The confident ones are just louder.",
      "Chapter 5: Call the people who love you. This is the whole manual, really.",
      "",
      "Status: download 23% complete. Estimated time remaining: lifetime.",
    ],
  },
  {
    id: "reasons", name: "Reasons_You_Are_Awesome.txt", type: "txt", stamp: "PERSONAL",
    lines: [
      "AN INCOMPLETE LIST (updating forever)",
      "",
      "1. You make ordinary days feel like they're worth photographing.",
      "2. Your laugh is a public service.",
      "3. You show up — for the fun parts and the heavy ones.",
      "4. Life around you is measurably less boring.",
      "5. You are, against all odds and quite wonderfully, you.",
      "",
      "P.S. This page has room for a longer, more personal note. Whoever made this for you already knows all the reasons; this file is just the paperwork.",
    ],
  },
  {
    id: "embarrassing", name: "Definitely_Not_Embarrassing.jpg", type: "jpg", stamp: "SEALED",
    lines: [
      "This image has been sealed by the Bureau of Birthday Affairs for everyone's protection.",
      "Rest assured: it is definitely not embarrassing. The filename says so, and filenames never lie.",
    ],
  },
];

// ── 8. STATS & ACHIEVEMENTS ────────────────────────────────────────
export const STATS: { label: string; value: string; bar?: number }[] = [
  { label: "Age", value: "21", bar: 100 },
  { label: "Experience", value: "21 years" },
  { label: "Adulting skills", value: "Still downloading…", bar: 23 },
  { label: "Common sense", value: "Occasionally available", bar: 54 },
  { label: "Questionable decisions", value: "Classified" },
  { label: "Lifetime achievements", value: "Too many to count" },
  { label: "Birthday privileges", value: "ACTIVATED", bar: 100 },
  { label: "Ability to grow up", value: "Optional", bar: 12 },
];
export const ACHIEVEMENTS: { icon: string; name: string; desc: string }[] = [
  { icon: "laurel", name: "Survived 21 Years", desc: "Completed 7,665 days on hard mode. No respawns needed." },
  { icon: "brain", name: "Professional Overthinker", desc: "Turned a two-line text into a three-act screenplay." },
  { icon: "tornado", name: "Certified Chaos Generator", desc: "Entropy follows you like a loyal pet." },
  { icon: "battery", name: "Somehow Still Functioning", desc: "Running on 4% battery and pure audacity since forever." },
  { icon: "heart", name: "Legendary Friend", desc: "Rarity: mythic. Drop rate: once in a lifetime." },
  { icon: "crown", name: "Birthday Main Character", desc: "Today's plot revolves around you. As it should." },
];

// ── 9. RECYCLE BIN & SECRETS ───────────────────────────────────────
export const RECYCLE: { name: string; icon: string; response: string }[] = [
  { name: "Being_20.exe", icon: "doc", response: "Restore failed: version 20 is no longer supported. You have been upgraded to 21." },
  { name: "Childhood_Free_Trial.txt", icon: "doc", response: "Trial expired years ago. Strangely, the nostalgia subscription renews for free." },
  { name: "Responsibilities.zip", icon: "zip", response: "Cannot restore. File keeps re-zipping itself out of self-preservation." },
  { name: "Bad_Decisions.log", icon: "doc", response: "Log restored. Entries instantly reclassified as 'character development'." },
];
export const BIN_EMPTY_JOKE = "The past cannot be deleted. It builds character.";
export const SECRET_NOTE = "Psst… whoever built this thinks you're the best thing that happened to this timeline. Happy birthday. — me";
export const SHUTDOWN_JOKE = "Nice try. It's your birthday — this party does not shut down.";

export const SURPRISE_POPUP = {
  title: "One more thing…",
  question: "Open your birthday surprise?",
  yes: "YES",
  no: "NO",
  noAfter: "Wow. Okay.",
  decline: "Playing hard to get. The cake will wait for you.",
};

// ── 10. MUSIC & SOUND ──────────────────────────────────────────────
export const MUSIC = {
  file: "assets/music/birthday.mp3",       // optional — synth music-box plays if missing
  finaleFile: "assets/music/finale.mp3",   // optional — ambient synth plays if missing
  fileTitle: "Our Birthday Song",
  finaleFileTitle: "Our Finale Song",
  // Built-in synthesized tracks (used when no MP3 is found, and always in the playlist):
  //   "musicbox" MUSIC BOX · "nightsky" NIGHT SKY   ← the original Option A tunes
  //   "neon" NEON DISTRICT · "market" NIGHT MARKET · "arcade" ARCADE BIRTHDAY · "afterglow" AFTERGLOW
  startTrack: "musicbox",    // which built-in track plays from START (Option A)
  finaleTrack: "nightsky",   // which built-in track scores the fireworks (Option A)
  volume: 0.55,   // 0–1
  sfx: true,      // interface sounds on/off
};

// ── 11. CAKE & MICROPHONE ──────────────────────────────────────────
// ── MOTION ─────────────────────────────────────────────────────────
// "full"   — always play every animation (fireworks, fades, flames). Default.
// "system" — follow the device: if it asks for reduced motion, start in calm mode.
// "calm"   — always start in calm mode (still fireworks, no CSS animation).
// Whatever you pick, the visitor can flip it on the START screen or in the Start menu.
export const MOTION: { default: "full" | "system" | "calm" } = { default: "full" };

export const CAKE = {
  candles: 21,               // exactly this many individual candles are drawn
  wishLine: "Make a wish, Rhodyl.",
  micSensitivity: 1.0,       // default multiplier; adjustable live in the scene
  cakeWriting: "happy 21st", // script lettering on the cake
};

// ── 12. FINALE ─────────────────────────────────────────────────────
export const FINALE = {
  wish: "Your wish has been sent to the universe.",
  greeting: "HAPPY 21ST BIRTHDAY, RHODYL!",
  line1: "Twenty-one years written. An entire lifetime left to tell.",
  line2: "May the years ahead be worth remembering.",
  // duration of each shot, in milliseconds (the greeting then stays forever)
  timings: { wish: 3000, celebration: 5000, closeup: 3000, ascent: 4000, explosion: 5000 },
};