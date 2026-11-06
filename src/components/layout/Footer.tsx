"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

export function Footer() {
  return (
    <footer className="border-t-[3px] border-[#0F3D2E] bg-[#FFFDF5] text-[#0F3D2E]">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center transition-transform hover:scale-[1.02]">
              <QuizoraLogo className="h-10 sm:h-12 w-auto" />
            </Link>
            <p className="text-sm text-[#0F3D2E]/80 leading-relaxed font-medium">
              Study Lab competitive quiz platform. Challenge yourself with timed questions,
              review granular solutions, and claim top ranks on per-quiz live leaderboards.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-[family-name:var(--font-display)] font-extrabold uppercase tracking-wider text-[#0F3D2E]">
              Arena Navigation
            </h3>
            <nav className="flex flex-col gap-2 font-semibold">
              <Link
                href="/quizzes"
                className="text-sm text-[#0F3D2E]/80 transition-all hover:text-[#0F3D2E] hover:bg-[linear-gradient(transparent_58%,#FFE94A_58%)] w-fit"
              >
                Browse Quizzes
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-[#0F3D2E]/80 transition-all hover:text-[#0F3D2E] hover:bg-[linear-gradient(transparent_58%,#FFE94A_58%)] w-fit"
              >
                Quiz Leaderboards
              </Link>
              <Link
                href="/login"
                className="text-sm text-[#0F3D2E]/80 transition-all hover:text-[#0F3D2E] hover:bg-[linear-gradient(transparent_58%,#FFE94A_58%)] w-fit"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm text-[#0F3D2E]/80 transition-all hover:text-[#0F3D2E] hover:bg-[linear-gradient(transparent_58%,#FFE94A_58%)] w-fit"
              >
                Sign Up
              </Link>
            </nav>
          </div>

          {/* About */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-[family-name:var(--font-display)] font-extrabold uppercase tracking-wider text-[#0F3D2E]">
              Tournament Rules
            </h3>
            <div className="bg-[#E3F9EE] border-2 border-[#0F3D2E] rounded-[12px] p-4 shadow-[4px_4px_0_#0F3D2E]">
              <p className="text-xs text-[#0F3D2E] leading-relaxed font-bold">
                Every quiz awards <span className="bg-[#FFE94A] px-1.5 py-0.5 rounded border border-[#0F3D2E]">+10 points</span> per verified answer with zero negative penalty.
                Tiebreakers are calculated using exact seconds to finish.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-[#0F3D2E]/20" />

        <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row">
          <p className="text-xs font-semibold text-[#0F3D2E]/70">
            &copy; {new Date().getFullYear()} Quizora -B · Option 4 Study Lab.
          </p>
          <p className="text-xs font-bold text-[#0F3D2E]/80 font-mono">
            Competitive Quiz &amp; Knowledge Arena
          </p>
        </div>
      </div>
    </footer>
  );
}
