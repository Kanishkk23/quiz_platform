"use client";

import { useState, useMemo } from "react";
import { mockQuizzes } from "@/data/mock";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  Filter,
  X,
  Trophy,
  Clock,
  ShieldCheck,
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
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Header section with Authentic Quiz Platform Micro-copy */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Competitive Quiz Arena
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Available Quizzes
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Pick your challenge, beat the countdown, and secure your place on each quiz&apos;s live leaderboard. 
          Sign in required to record verified scores.
        </p>

        {/* Quiz Rules & Competition Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2.5 rounded-lg border bg-card/60 p-3 text-xs">
            <Flame className="h-4 w-4 text-[#CC5500] shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Scoring System: </span>
              <span className="text-muted-foreground">+10 pts per correct answer, 0 penalty</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border bg-card/60 p-3 text-xs">
            <Clock className="h-4 w-4 text-[#607C52] shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Speed Matters: </span>
              <span className="text-muted-foreground">Faster completion breaks leaderboard ties</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border bg-card/60 p-3 text-xs">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Dedicated Podium: </span>
              <span className="text-muted-foreground">Every quiz features its own Hall of Fame</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Category pills removed as requested) */}
      <div className="mb-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search quizzes by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Difficulty selector & Clear button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                Difficulty:
              </span>
              <div className="flex rounded-lg border bg-muted/50 p-1 text-xs">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      selectedDifficulty === diff
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
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
                className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">No quizzes found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search query or difficulty filter.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
