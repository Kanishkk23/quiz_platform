import Link from "next/link";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

const links = [
  { href: "/quizzes", label: "Browse Quizzes" },
  { href: "/leaderboard", label: "Quiz Leaderboards" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Sign Up" },
];

const ticker = [
  "Answer fast",
  "Beat the clock",
  "Climb the ranks",
  "Retakes allowed",
  "Ties go to the faster time",
];
// Repeated so each half of the scrolling strip is wider than any screen.
const half = [...ticker, ...ticker, ...ticker];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 overflow-hidden bg-[#0F3D2E] pt-6 text-[#FFFDF5]">
      {/* Tilted scrolling ticker (pauses on hover) */}
      <div
        aria-hidden="true"
        className="-mx-4 -rotate-1 overflow-hidden border-y-[3px] border-[#0F3D2E] bg-[#FFE94A] py-3 text-[#0F3D2E]"
      >
        <div className="qz-marquee flex w-max hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {half.map((text, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="flex items-center gap-6 px-3 font-[family-name:var(--font-display)] text-xl font-extrabold uppercase tracking-wide"
                >
                  <span>{text}</span>
                  <span>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto grid max-w-6xl gap-12 px-4 pb-12 pt-16 sm:px-6 md:grid-cols-[1.1fr_1fr_1fr]">
        {/* Brand sticker */}
        <div data-reveal="left" className="flex flex-col gap-5">
          <Link
            href="/"
            aria-label="Quizora home"
            data-magnetic
            className="w-fit -rotate-2 rounded-[14px] border-[3px] border-[#FFFDF5] bg-[#FFFDF5] p-4 shadow-[6px_6px_0_#FFE94A] hover:rotate-0"
          >
            <QuizoraLogo className="h-11 w-auto" />
          </Link>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-[#FFFDF5]/80">
            Study Lab competitive quiz platform. Challenge yourself with timed questions, review
            granular solutions, and claim top ranks on per-quiz live leaderboards.
          </p>
          <span className="qz-bob block w-fit font-[family-name:var(--font-hand)] text-2xl text-[#FFE94A]">
            see you on the board →
          </span>
        </div>

        {/* Navigation */}
        <div data-reveal className="flex flex-col gap-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#BDF2D5]">
            Arena Navigation
          </h3>
          <ul className="flex flex-col gap-2">
            {links.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-baseline gap-3 font-[family-name:var(--font-display)] text-2xl font-extrabold"
                >
                  <span className="font-mono text-xs font-medium text-[#BDF2D5]">0{i + 1}</span>
                  <span className="-mx-1 rounded px-1 transition-colors group-hover:bg-[#FFE94A] group-hover:text-[#0F3D2E]">
                    {link.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="-translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Rules sticky note */}
        <div data-reveal="right" className="h-fit">
          <div
            data-tilt="7"
            className="relative rotate-1 rounded-[14px] border-[3px] border-[#FFFDF5] bg-[#FFE94A] p-6 pt-8 text-[#0F3D2E] shadow-[6px_6px_0_#BDF2D5]"
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 border border-[#0F3D2E]/30 bg-[#FFFDF5]/90"
            />
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              Tournament Rules
            </h3>
            <p className="mt-2 text-sm font-bold leading-relaxed">
              Every quiz awards{" "}
              <span className="rounded border border-[#0F3D2E] bg-[#FFFDF5] px-1.5 py-0.5">
                +10 points
              </span>{" "}
              per verified answer with zero negative penalty. Tiebreakers are calculated using exact
              seconds to finish.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#FFFDF5]/20">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:px-6 md:flex-row">
          <p className="font-mono text-xs font-semibold text-[#FFFDF5]/70">
            &copy; {year} Quizora-B. All rights reserved.
          </p>
          <p className="font-mono text-xs font-bold text-[#FFFDF5]/80">
            Competitive Quiz &amp; Knowledge Arena
          </p>
        </div>
      </div>

      {/* Giant outlined wordmark. Click it for confetti. */}
      <div
        aria-hidden="true"
        data-confetti
        className="cursor-pointer select-none overflow-hidden text-center"
        style={{ fontSize: "clamp(4.5rem, 19vw, 16rem)", height: "0.62em" }}
      >
        <p className="font-[family-name:var(--font-display)] font-extrabold leading-[0.8] tracking-tighter text-transparent transition-colors duration-300 [-webkit-text-stroke:2px_#BDF2D5] hover:text-[#FFE94A]/90">
          quizora-B
        </p>
      </div>
    </footer>
  );
}