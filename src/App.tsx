import { useCallback, useEffect, useRef, useState } from "react";
import { REQUIRED_APPS, type AppId } from "./config";
import { audio } from "./audio";
import { Boot } from "./components/Boot";
import { Desktop } from "./components/Desktop";
import { CakeScene } from "./components/CakeScene";
import { Finale } from "./components/Finale";

type Scene = "boot" | "desktop" | "cake" | "finale";

export default function App() {
  const [scene, setScene] = useState<Scene>("boot");
  const [opened, setOpened] = useState<Set<AppId>>(() => new Set());
  const [unlocked, setUnlocked] = useState(false);
  const [cakeKey, setCakeKey] = useState(0);
  const [finaleKey, setFinaleKey] = useState(0);
  const [veil, setVeil] = useState(false);
  const veilTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(veilTimer.current), []);

  /* smooth fade-through-black between scenes */
  const go = useCallback((next: Scene, prep?: () => void) => {
    setVeil(true);
    window.clearTimeout(veilTimer.current);
    veilTimer.current = window.setTimeout(() => {
      prep?.();
      setScene(next);
      requestAnimationFrame(() => requestAnimationFrame(() => setVeil(false)));
    }, 460);
  }, []);

  const markOpened = useCallback((id: AppId) => {
    setOpened((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!unlocked && REQUIRED_APPS.every((r) => opened.has(r))) setUnlocked(true);
  }, [opened, unlocked]);

  const bootDone = useCallback(() => go("desktop"), [go]);
  const enterCake = useCallback(() => go("cake", () => setCakeKey((k) => k + 1)), [go]);
  const cakeDone = useCallback(() => go("finale", () => setFinaleKey((k) => k + 1)), [go]);
  const backToDesktop = useCallback(() => { void audio.toDesktop(); go("desktop"); }, [go]);

  return (
    <>
      {scene === "boot" ? (
        <Boot onDone={bootDone} />
      ) : (
        <>
          <Desktop
            opened={opened} unlocked={unlocked} overlay={scene !== "desktop" || veil}
            onOpened={markOpened} onCake={enterCake}
          />
          {scene === "cake" && <CakeScene key={cakeKey} onExit={backToDesktop} onComplete={cakeDone} />}
          {scene === "finale" && <Finale key={finaleKey} onReturn={backToDesktop} />}
        </>
      )}
      {/* transition veil */}
      <div
        aria-hidden
        className="fixed inset-0 z-[300] transition-opacity duration-500 ease-in-out"
        style={{
          opacity: veil ? 1 : 0,
          pointerEvents: veil ? "auto" : "none",
          background: "radial-gradient(ellipse at 50% 50%, #15100C 0%, #080605 70%)",
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,180,54,.7), rgba(44,245,180,.5), transparent)", boxShadow: "0 0 24px rgba(255,180,54,.5)", opacity: veil ? 1 : 0, transition: "opacity .4s" }} />
      </div>
    </>
  );
}