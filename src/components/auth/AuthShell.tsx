import type { CSSProperties, ReactNode } from "react";
import QuizoraMark from "@/components/intro/QuizoraMark";
import { SplitText } from "@/components/fx/SplitText";

type Variant = "login" | "register";

const content = {
  login: {
    tag: "Q1. Who are you?",
    lines: ["welcome", "back."],
    note: "your seat’s still warm",
    perks: ["Pick up where you left off", "Retake any quiz while it’s open", "Ties go to the faster time"],
  },
  register: {
    tag: "Q1. Who are you?",
    lines: ["join the", "arena."],
    note: "first question is on us",
    perks: ["Timed quizzes, one answer each", "Your own attempt history", "A spot on every leaderboard"],
  },
} as const;

type StickerProps = {
  letter: string;
  className: string;
  tone: string;
  rotate: string;
  delay: string;
};

function Sticker({ letter, className, tone, rotate, delay }: StickerProps) {
  return (
    <span
      aria-hidden="true"
      className={`qz-bob absolute flex h-16 w-16 items-center justify-center rounded-[14px] border-[3px] border-[#0F3D2E] font-[family-name:var(--font-display)] text-3xl font-extrabold shadow-[4px_4px_0_#0F3D2E] ${tone} ${className}`}
      style={{ "--r": rotate, animationDelay: delay } as CSSProperties}
    >
      {letter}
    </span>
  );
}

export function AuthShell({ variant, children }: { variant: Variant; children: ReactNode }) {
  const c = content[variant];

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] bg-[#BDF2D5] px-4 py-10 sm:px-6 sm:py-14"
      style={{
        backgroundImage: `
          linear-gradient(rgba(15, 61, 46, 0.18) 1.5px, transparent 1.5px),
          linear-gradient(90deg, rgba(15, 61, 46, 0.18) 1.5px, transparent 1.5px),
          linear-gradient(rgba(15, 61, 46, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15, 61, 46, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "160px 160px, 160px 160px, 32px 32px, 32px 32px",
        backgroundPosition: "-1px -1px",
      }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* Creative side panel (large screens only) */}
        <aside
          data-tilt="3"
          className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden rounded-[24px] border-[3px] border-[#0F3D2E] bg-[#0F3D2E] p-10 text-[#FFFDF5] shadow-[9px_9px_0_#FFE94A] lg:flex"
        >
          <div className="flex items-center gap-3">
            <QuizoraMark size={48} />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#BDF2D5]">
              {c.tag}
            </span>
          </div>

          <Sticker letter="A" tone="bg-[#FFE94A] text-[#0F3D2E]" className="right-10 top-12" rotate="8deg" delay="0s" />
          <Sticker letter="B" tone="bg-[#BDF2D5] text-[#0F3D2E]" className="right-32 top-32" rotate="-7deg" delay="0.6s" />
          <Sticker letter="C" tone="bg-[#FFFDF5] text-[#0F3D2E]" className="right-12 top-52" rotate="5deg" delay="1.2s" />
          <Sticker letter="D" tone="bg-[#1F9D6B] text-[#FFFDF5]" className="right-36 top-72" rotate="-9deg" delay="1.8s" />

          <div>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(3.5rem, 6vw, 6rem)" }}
            >
              <span className="block">
                <SplitText text={c.lines[0]} />
              </span>
              <span className="mt-2 inline-block -rotate-2 rounded-[12px] bg-[#FFE94A] px-4 pb-1 text-[#0F3D2E]">
                <SplitText text={c.lines[1]} delay={300} />
              </span>
            </h2>
            <p className="mt-4 -rotate-2 font-[family-name:var(--font-hand)] text-2xl text-[#FFE94A]">
              {c.note}
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {c.perks.map((perk, i) => (
              <li
                key={perk}
                className={`flex w-fit items-center gap-2 rounded-[10px] border-2 border-[#FFFDF5] bg-[#0F3D2E] px-4 py-2 text-sm font-bold ${
                  i % 2 === 0 ? "-rotate-1" : "rotate-1"
                }`}
              >
                <span aria-hidden="true" className="text-[#FFE94A]">✓</span>
                {perk}
              </li>
            ))}
          </ul>
        </aside>

        {/* Form side */}
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}