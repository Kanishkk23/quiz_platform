import type { CSSProperties } from "react";

const BUBBLE =
  "M30 6H66A22 22 0 0 1 88 28V56A22 22 0 0 1 66 78H42L16 94L22 78H30A22 22 0 0 1 8 56V28A22 22 0 0 1 30 6Z";

/** The Quizora logo drawing itself: bubble, Q, then the checkmark. */
export function QLoader({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" aria-hidden="true">
      <path d={BUBBLE} transform="translate(4 4)" fill="#0F3D2E" className="qz-fillpop" />
      <path d={BUBBLE} fill="#FFE94A" className="qz-fillpop" />
      <path d={BUBBLE} pathLength={1} stroke="#0F3D2E" strokeWidth="3.5" strokeLinejoin="round" className="qz-draw" />
      <circle cx="46" cy="40" r="17" pathLength={1} stroke="#0F3D2E" strokeWidth="8" className="qz-draw qz-draw-2" />
      <path
        d="M50 46L60 56L78 32"
        pathLength={1}
        stroke="#0F3D2E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="qz-draw qz-draw-3"
      />
    </svg>
  );
}

const CHIPS = [
  { letter: "A", tone: "bg-[#FFE94A] text-[#0F3D2E]" },
  { letter: "B", tone: "bg-[#0F3D2E] text-[#FFFDF5]" },
  { letter: "C", tone: "bg-[#FFFDF5] text-[#0F3D2E]" },
  { letter: "D", tone: "bg-[#1F9D6B] text-[#FFFDF5]" },
];

/** Four answer chips that squash and bounce with little shadows. */
export function ChipsLoader() {
  return (
    <div role="status" className="flex items-end gap-3">
      {CHIPS.map((chip, i) => (
        <div key={chip.letter} className="flex flex-col items-center" aria-hidden="true">
          <span
            className={`qz-chip flex h-14 w-14 items-center justify-center rounded-[12px] border-[3px] border-[#0F3D2E] font-[family-name:var(--font-display)] text-2xl font-extrabold shadow-[4px_4px_0_#0F3D2E] ${chip.tone}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {chip.letter}
          </span>
          <span
            className="qz-chip-shadow mt-2 h-1.5 w-10 rounded-full bg-[#0F3D2E]"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

const EQ_TONES = ["bg-[#FFE94A]", "bg-[#0F3D2E]", "bg-[#1F9D6B]", "bg-[#0F3D2E]", "bg-[#FFE94A]"];

/** Five bars dancing like an audio equalizer. */
export function EqualizerLoader({ height = 48 }: { height?: number }) {
  return (
    <div role="status" className="flex items-end gap-1.5" style={{ height }}>
      {EQ_TONES.map((tone, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`qz-eq w-3.5 rounded-t-full border-2 border-[#0F3D2E] ${tone}`}
          style={{ height, animationDelay: `${i * 0.12}s` } as CSSProperties}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Two dots orbiting a center point. Good for small inline spots. */
export function OrbitLoader({ size = 64 }: { size?: number }) {
  return (
    <div role="status" className="relative" style={{ width: size, height: size }}>
      <span aria-hidden="true" className="absolute inset-[38%] rounded-full bg-[#0F3D2E]" />
      <span aria-hidden="true" className="qz-orbit absolute inset-0">
        <i className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#0F3D2E] bg-[#FFE94A]" />
      </span>
      <span aria-hidden="true" className="qz-orbit absolute inset-0" style={{ animationDelay: "-0.7s" }}>
        <i className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#0F3D2E] bg-[#1F9D6B]" />
      </span>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Up to four messages that fade in and out one after another (pure CSS). */
export function StatusMessages({ messages }: { messages: string[] }) {
  const list = messages.slice(0, 4);
  return (
    <div
      aria-hidden="true"
      className="relative h-10 w-72 text-center font-[family-name:var(--font-hand)] text-3xl text-[#0F3D2E]"
    >
      {list.map((message, i) => (
        <span key={message} className="qz-msg" style={{ animationDelay: `${i * 2.5}s` }}>
          {message}
        </span>
      ))}
    </div>
  );
}

/** A shimmering placeholder block. Add your own size and rounding via className. */
export function Shimmer({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`qz-shimmer ${className}`} />;
}