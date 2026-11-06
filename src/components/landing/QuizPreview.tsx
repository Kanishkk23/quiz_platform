"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Check, Clock, Cross, Hourglass, Reset, Sparkle, Trophy } from "./Icons";
import s from "./landing.module.css";

const TOTAL = 14; // seconds on the clock
const CORRECT = "B";
const OPTIONS = [
  { key: "A", text: '"null"' },
  { key: "B", text: '"object"' },
  { key: "C", text: '"undefined"' },
  { key: "D", text: '"boolean"' },
];

export default function QuizPreview() {
  const [left, setLeft] = useState(TOTAL);
  const [picked, setPicked] = useState<string | null>(null);

  const timedOut = left === 0 && picked === null;
  const done = picked !== null || timedOut;
  const status = picked === CORRECT ? "correct" : picked ? "wrong" : timedOut ? "timeout" : "idle";

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [done]);

  const reset = () => {
    setPicked(null);
    setLeft(TOTAL);
  };

  const optState = (key: string) =>
    !done ? "idle" : key === CORRECT ? "correct" : key === picked ? "wrong" : "dim";

  const message =
    status === "correct"
      ? "Great job! Correct answer (+100 XP)"
      : status === "wrong"
        ? 'Not quite. typeof null is "object", a JavaScript quirk.'
        : status === "timeout"
          ? "Time's up! The answer was B."
          : "Pick an answer before the clock runs out.";

  return (
    <div className={s.previewWrap}>
      <span className={s.floatA} aria-hidden="true" />
      <span className={s.floatB} aria-hidden="true" />

      <section
        className={s.preview}
        data-state={status}
        data-urgent={!done && left <= 5 ? "" : undefined}
        aria-label="Interactive quiz preview"
      >
        <div className={s.pvTop}>
          <span className={s.pvTopic}>JavaScript Basics</span>
          <span className={s.pvTimer} aria-label={`${left} seconds left`}>
            <Clock width={16} height={16} />
            <span>00:{String(left).padStart(2, "0")}</span>
          </span>
        </div>
        <div className={s.pvBar} aria-hidden="true">
          <i style={{ transform: `scaleX(${left / TOTAL})` } as CSSProperties} />
        </div>

        <div className={s.pvBody}>
          <p className={s.pvKicker}>
            <Sparkle width={15} height={15} /> Interactive preview
          </p>
          <h2 className={s.pvQuestion}>
            What does <code className={s.code}>typeof null</code> return in JavaScript?
          </h2>

          <div className={s.opts} role="group" aria-label="Answers">
            {OPTIONS.map((o) => {
              const st = optState(o.key);
              return (
                <button
                  key={o.key}
                  type="button"
                  className={s.opt}
                  data-state={st}
                  disabled={done}
                  onClick={() => setPicked(o.key)}
                >
                  <span className={s.optKey}>{o.key}</span>
                  <span className={s.optText}>{o.text}</span>
                  <span className={s.optIcon} aria-hidden="true">
                    {st === "correct" ? <Check width={18} height={18} /> : st === "wrong" ? <Cross width={16} height={16} /> : null}
                  </span>
                  {o.key === CORRECT && (
                    <span className={s.burst} aria-hidden="true">
                      {Array.from({ length: 8 }, (_, i) => (
                        <span key={i} style={{ "--a": `${i * 45}deg` } as CSSProperties} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={s.pvFoot} role="status" aria-live="polite">
            <span className={s.pvFootIcon} aria-hidden="true">
              {status === "idle" ? <Hourglass width={20} height={20} /> : <Trophy width={20} height={20} />}
            </span>
            <span className={s.pvFootMsg}>{message}</span>
            {done && (
              <button type="button" className={s.pvReset} onClick={reset}>
                <Reset width={15} height={15} /> Reset
              </button>
            )}
          </div>
        </div>

        <span className={s.xp} aria-hidden="true">
          +100 XP
        </span>
      </section>
    </div>
  );
}
