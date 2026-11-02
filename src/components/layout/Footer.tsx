"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">QuizPlatform</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Challenge yourself, learn something new, and compete with others
              on our interactive quiz platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
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
                Leaderboard
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Link>
            </nav>
          </div>

          {/* About */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Tailwind CSS, and shadcn/ui as part of the GDG
              On Campus quiz platform project.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 QuizPlatform. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ by the team
          </p>
        </div>
      </div>
    </footer>
  );
}
