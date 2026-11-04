"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
              <QuizoraLogo className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time competitive quiz platform. Challenge yourself with timed questions,
              review granular solutions, and claim top ranks on per-quiz live leaderboards.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Arena Navigation</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/quizzes"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Browse Quizzes
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Quiz Leaderboards
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Up
              </Link>
            </nav>
          </div>

          {/* About */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Tournament Rules</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every quiz awards +10 points per verified answer with zero negative penalty.
              Tiebreakers are calculated using exact seconds to finish.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Quizora -B. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Competitive Quiz & Knowledge Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
