import Link from "next/link";
import { ArrowRight } from "lucide-react";

const DISPLAY = "font-[family-name:var(--font-display)]";
const MONO = "font-[family-name:var(--font-mono)]";

export function FinalCta() {
  return (
    <section className="overflow-hidden bg-[#FFE94A] text-[#0F3D2E]">
      <div className="container mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <p data-fx="text" className={`${MONO} mb-4 text-sm font-bold`}>Q5.</p>
        <h2
          data-fx="title"
          data-reveal="zoom"
          className={`${DISPLAY} font-extrabold leading-[0.9] tracking-tight`}
          style={{ fontSize: "clamp(3.5rem, 12vw, 10rem)" }}
        >
          ready
          <br />
          player one?
        </h2>

        <Link
          href="/quizzes"
          aria-label="Start a quiz"
          data-magnetic
          data-confetti
          className="group relative mx-auto mt-12 flex h-56 w-56 items-center justify-center rounded-full border-[3px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[8px_8px_0_#0F3D2E] transition-transform hover:scale-105 sm:h-64 sm:w-64"
        >
          <svg viewBox="0 0 200 200" aria-hidden="true" className="qz-spin-slow absolute inset-0 h-full w-full">
            <defs>
              <path id="cta-ring" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
            </defs>
            <text
              fill="#0F3D2E" fontSize="14" fontWeight="700" letterSpacing="2.5"
              fontFamily="var(--font-mono), ui-monospace, monospace"
            >
              <textPath href="#cta-ring">START A QUIZ ✦ START A QUIZ ✦ START A QUIZ ✦ </textPath>
            </text>
          </svg>
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0F3D2E] text-[#FFE94A] transition-transform duration-300 group-hover:rotate-45">
            <ArrowRight className="h-10 w-10" />
          </span>
        </Link>
      </div>
    </section>
  );
}