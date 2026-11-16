"use client";

import Link from "next/link";
import { useState } from "react";
import { fireConfetti } from "@/components/fx/confetti";

const DISPLAY = "font-[family-name:var(--font-display)]";
const MONO = "font-[family-name:var(--font-mono)]";

const QUESTION = "Which planet is closest to the Sun?";
const OPTIONS = ["Venus", "Mercury", "Mars", "Earth"];
const ANSWER = 1;
const LETTERS = ["A", "B", "C", "D"];
const SLAB = [
  "bg-[#FFE94A] text-[#0F3D2E] rounded-tl-[90px] pt-10",
  "bg-[#FFFDF5] text-[#0F3D2E] rounded-tr-[90px] pt-10",
  "bg-[#1F9D6B] text-[#FFFDF5] rounded-bl-[90px] pb-10",
  "bg-[#0F3D2E] text-[#FFFDF5] rounded-br-[90px] pb-10",
];

export function WarmUp() {
  const [picked, setPicked] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const solved = picked === ANSWER;

  function choose(i: number, e: React.MouseEvent) {
    if (solved) return;
    setPicked(i);
    if (i === ANSWER) {
      fireConfetti(e.clientX, e.clientY, 70);
    } else {
      setMisses((m) => m + 1);
    }
  }

  return (
    <section className="bg-[#FFFDF5] px-4 py-24 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <p data-fx="text" className={`${MONO} mb-3 text-sm font-bold text-[#0F3D2E]`}>Q4. Warm-up</p>
        <h2
          data-fx="title"
          data-reveal
          className={`${DISPLAY} mb-3 font-extrabold leading-[0.92] tracking-tight text-[#0F3D2E]`}
          style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
        >
          try one <span data-fx="mark" className="bg-[linear-gradient(transparent_58%,#FFE94A_58%)]">right now.</span>
        </h2>
        <p data-fx="text" className="mb-10 max-w-md text-lg font-medium text-[#0F3D2E]/80">No login needed. Just pick an answer.</p>

        <div data-fx="media" className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 shadow-[9px_9px_0_#0F3D2E] sm:p-8">
          <h3 className={`${DISPLAY} mb-6 text-3xl font-extrabold leading-tight text-[#0F3D2E] sm:text-5xl`}>{QUESTION}</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {OPTIONS.map((option, i) => {
              const isWrongPick = picked === i && !solved;
              const isRight = solved && i === ANSWER;
              return (
                <button
                  key={`${option}-${isWrongPick ? misses : 0}`}
                  type="button"
                  disabled={solved}
                  onClick={(e) => choose(i, e)}
                  data-magnetic
                  className={`flex min-h-[110px] items-center gap-4 border-[3px] border-[#0F3D2E] px-6 text-left shadow-[5px_5px_0_#0F3D2E] transition-opacity disabled:cursor-default ${SLAB[i]} ${
                    isWrongPick ? "qz-shake opacity-50" : ""
                  } ${solved && !isRight ? "opacity-40" : ""}`}
                >
                  <span className={`${DISPLAY} text-5xl font-extrabold leading-none`}>{LETTERS[i]}</span>
                  <span className={`${DISPLAY} text-2xl font-extrabold`}>{option}</span>
                  {isRight && <span className={`${MONO} ml-auto text-xs font-bold`}>CORRECT</span>}
                </button>
              );
            })}
          </div>

          <div role="status" aria-live="polite" className="mt-6 min-h-[44px]">
            {solved && (
              <div className="flex flex-wrap items-center gap-4">
                <span className={`qz-rise rounded-full border-[3px] border-[#0F3D2E] bg-[#FFE94A] px-4 py-1 ${MONO} text-sm font-bold text-[#0F3D2E]`}>
                  +10 points!
                </span>
                <Link
                  href="/quizzes"
                  className={`${DISPLAY} rounded-full border-[3px] border-[#0F3D2E] bg-[#0F3D2E] px-6 py-2 text-xl font-extrabold text-[#FFE94A]`}
                >
                  play the real thing →
                </Link>
              </div>
            )}
            {picked !== null && !solved && (
              <p className={`${MONO} text-sm font-bold text-[#0F3D2E]`}>Not quite. Try another one.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}