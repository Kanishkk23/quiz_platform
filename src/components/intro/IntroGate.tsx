"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import AnswerDeckIntro from "./AnswerDeckIntro";
import QuizCubeIntro from "./QuizCubeIntro";
import styles from "./IntroGate.module.css";

export type IntroVariant = "deck" | "cube";

type Props = {
  /** "deck" = Answer Deck (Option 1) · "cube" = Quiz Cube (Option 2) */
  variant?: IntroVariant;
  /** Play only once per browser tab session (default true). */
  once?: boolean;
  /** Optional path to your real logo file, e.g. "/logo.svg". */
  logoSrc?: string;
  children: ReactNode;
};

type Phase = "check" | "play" | "exit" | "done";

const STORAGE_KEY = "quizora-intro-seen";
const PLAY_MS: Record<IntroVariant, number> = { deck: 4300, cube: 3900 };
const EXIT_MS = 900;

// In-memory session tracker to prevent intro from replaying on client-side navigation back to Home
let hasIntroPlayed = false;
const emptySubscribe = () => () => {};

export default function IntroGate({
  variant = "deck",
  once = true,
  logoSrc,
  children,
}: Props) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [phase, setPhase] = useState<Phase>("check");

  useEffect(() => {
    if (!once) {
      setPhase("play");
      return;
    }

    try {
      if (hasIntroPlayed || sessionStorage.getItem(STORAGE_KEY) === "1") {
        hasIntroPlayed = true;
        setPhase("done");
        return;
      }
    } catch {}

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setPhase("done");
      return;
    }

    hasIntroPlayed = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setPhase("play");
  }, [once]);

  // play -> exit -> done
  useEffect(() => {
    if (phase === "play") {
      hasIntroPlayed = true;
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      const t = setTimeout(() => setPhase("exit"), PLAY_MS[variant]);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(() => {
        hasIntroPlayed = true;
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        setPhase("done");
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [phase, variant]);

  // Lock page scroll while the intro is on screen
  const active = mounted && (phase === "play" || phase === "exit");
  useEffect(() => {
    if (!active) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [active]);

  const skip = useCallback(() => {
    setPhase((p) => (p === "play" ? "exit" : p));
  }, []);

  // Esc / Enter also skips
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  return (
    <>
      {children}
      {mounted && phase !== "done" && (
        <div
          className={`${styles.overlay} ${phase === "exit" ? styles.exit : ""}`}
          role="presentation"
        >
          {phase !== "check" &&
            (variant === "cube" ? (
              <QuizCubeIntro logoSrc={logoSrc} />
            ) : (
              <AnswerDeckIntro logoSrc={logoSrc} />
            ))}
          {phase === "play" && (
            <button type="button" className={styles.skip} onClick={skip}>
              Skip intro
            </button>
          )}
        </div>
      )}
    </>
  );
}
