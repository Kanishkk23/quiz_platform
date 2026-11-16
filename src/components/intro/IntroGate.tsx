"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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

type Phase = "idle" | "play" | "exit" | "done";

const PLAY_MS: Record<IntroVariant, number> = { deck: 4300, cube: 3900 };
const EXIT_MS = 900;

declare global {
  interface Window {
    __QUIZORA_INTRO_PLAYED__?: boolean;
  }
}

export default function IntroGate({
  variant = "deck",
  once = true,
  logoSrc,
  children,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    // If intro has already played in this SPA session (e.g. user clicked Logo, Home, or navigated back), skip it!
    if (typeof window !== "undefined" && window.__QUIZORA_INTRO_PLAYED__) {
      setPhase("done");
      return;
    }

    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (typeof window !== "undefined") {
          window.__QUIZORA_INTRO_PLAYED__ = true;
        }
        setPhase("done");
        return;
      }
    } catch {}

    setPhase("play");
  }, [once]);

  // play -> exit -> done
  useEffect(() => {
    if (phase === "play") {
      const t = setTimeout(() => setPhase("exit"), PLAY_MS[variant]);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.__QUIZORA_INTRO_PLAYED__ = true;
        }
        setPhase("done");
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [phase, variant]);

  // Lock page scroll ONLY while the intro animation is actively visible on screen
  const active = phase === "play" || phase === "exit";
  useEffect(() => {
    if (!active) {
      document.documentElement.style.overflow = "";
      return;
    }
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [active]);

  const skip = useCallback(() => {
    if (typeof window !== "undefined") {
      window.__QUIZORA_INTRO_PLAYED__ = true;
    }
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
      {active && (
        <div
          className={`${styles.overlay} ${phase === "exit" ? styles.exit : ""}`}
          role="presentation"
          aria-hidden={phase !== "play"}
        >
          {variant === "deck" ? (
            <AnswerDeckIntro logoSrc={logoSrc} />
          ) : (
            <QuizCubeIntro logoSrc={logoSrc} />
          )}

          <button
            type="button"
            className={styles.skip}
            onClick={skip}
            aria-label="Skip introduction"
          >
            Skip <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </>
  );
}
