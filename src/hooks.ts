import { useEffect, useState, useSyncExternalStore } from "react";
import { MOTION } from "./config";

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setMatch(mq.matches);
    mq.addEventListener("change", fn);
    fn();
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return match;
}
export const useIsMobile = () => useMedia("(max-width: 767px)");

/* Motion is an in-app choice (MOTION in config.ts), not a silent guess.
   FULL plays every animation. CALM swaps the fireworks film for still beats
   and switches CSS animation off. The switch lives on the START screen and
   in the Start menu. */
const systemReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let calm = MOTION.default === "calm" || (MOTION.default === "system" && systemReduced());
const subs = new Set<() => void>();
const apply = () => document.documentElement.classList.toggle("calm", calm);
apply();

export const motion = {
  isCalm: () => calm,
  systemReduced,
  setCalm(v: boolean) { calm = v; apply(); subs.forEach((f) => f()); },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};
/** true when calm mode is on */
export const useReducedMotion = () => useSyncExternalStore(motion.subscribe, motion.isCalm);

export const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
