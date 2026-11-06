"use client";

import { useState, useMemo } from "react";
import { mockQuizzes } from "@/data/mock";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Sparkles,
  Filter,
  X,
  Trophy,
  Clock,
  Flame,
} from "lucide-react";

const difficulties = ["All", "easy", "medium", "hard"];

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredQuizzes = useMemo(() => {
    return mockQuizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, selectedDifficulty]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
  };

  const hasActiveFilters = searchQuery !== "" || selectedDifficulty !== "All";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 bg-[#BDF2D5]"
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
      <div className="container mx-auto max-w-7xl">
        {/* Header section with Study Lab Micro-copy */}
        <div className="mb-10 space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[#0F3D2E] bg-[#FFFDF5] text-[#0F3D2E] px-4 py-1.5 text-xs font-bold -rotate-1 shadow-[2px_2px_0_#0F3D2E]">
            <Sparkles className="h-3.5 w-3.5 text-[#0F3D2E]" />
            Competitive Quiz Arena
          </span>
          <h1 className="text-3xl font-[family-name:var(--font-display)] font-extrabold tracking-tight sm:text-4xl md:text-5xl text-[#0F3D2E]">
            Available Quizzes
          </h1>
          <p className="text-[#0F3D2E]/80 text-base max-w-2xl font-medium leading-relaxed">
            Pick your challenge, beat the countdown, and secure your place on each quiz&apos;s live leaderboard. 
            Sign in required to record verified scores.
          </p>

          {/* Quiz Rules & Competition Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-3.5 text-xs font-bold text-[#0F3D2E] shadow-[4px_4px_0_#0F3D2E]">
              <Flame className="h-4 w-4 text-[#0F3D2E] shrink-0" />
              <div>
                <span>Scoring System: </span>
                <span className="text-[#0F3D2E]/70 font-semibold">+10 pts per correct answer</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-3.5 text-xs font-bold text-[#0F3D2E] shadow-[4px_4px_0_#0F3D2E]">
              <Clock className="h-4 w-4 text-[#0F3D2E] shrink-0" />
              <div>
                <span>Speed Matters: </span>
                <span className="text-[#0F3D2E]/70 font-semibold">Faster completion breaks ties</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-3.5 text-xs font-bold text-[#0F3D2E] shadow-[4px_4px_0_#0F3D2E]">
              <Trophy className="h-4 w-4 text-[#0F3D2E] shrink-0" />
              <div>
                <span>Dedicated Podium: </span>
                <span className="text-[#0F3D2E]/70 font-semibold">Every quiz has its Hall of Fame</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-10 rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 shadow-[9px_9px_0_#0F3D2E] md:p-6 text-[#0F3D2E]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D2E]/60" />
              <Input
                type="text"
                placeholder="Search quizzes by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#FFFDF5] border-2 border-[#0F3D2E] rounded-[10px] text-[#0F3D2E] placeholder:text-[#0F3D2E]/40 font-medium focus-visible:ring-[#0F3D2E]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Difficulty selector & Clear button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#0F3D2E] hidden sm:block" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2E] hidden sm:block">
                  Difficulty:
                </span>
                <div className="flex rounded-[10px] border-2 border-[#0F3D2E] bg-[#E3F9EE] p-1 text-xs">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`rounded-[7px] px-3 py-1 text-xs font-bold capitalize transition-all ${
                        selectedDifficulty === diff
                          ? "bg-[#FFE94A] text-[#0F3D2E] border border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                          : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs font-bold text-[#E5484D] hover:bg-[#E5484D]/10 gap-1 rounded-[8px]"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border-[3px] border-dashed border-[#0F3D2E] bg-[#FFFDF5] p-12 text-center text-[#0F3D2E] shadow-[5px_5px_0_#0F3D2E]">
            <h3 className="text-xl font-[family-name:var(--font-display)] font-extrabold mb-2">
              {mockQuizzes.length === 0 ? "No quizzes available yet" : "No quizzes found"}
            </h3>
            <p className="text-sm font-medium text-[#0F3D2E]/70 mb-5">
              {mockQuizzes.length === 0
                ? "Quizzes will appear here once published from the database."
                : "Try adjusting your search query or difficulty filter."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
              >
                Reset filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
