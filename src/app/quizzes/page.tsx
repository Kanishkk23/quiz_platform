"use client";

import { useState, useMemo } from "react";
import { mockQuizzes } from "@/data/mock";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Filter, X } from "lucide-react";

const categories = ["All", "Programming", "Frontend", "Computer Science", "Backend", "Architecture"];
const difficulties = ["All", "easy", "medium", "hard"];

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredQuizzes = useMemo(() => {
    return mockQuizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || quiz.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedCategory !== "All" || selectedDifficulty !== "All";

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Header section */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Test Your Knowledge
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Available Quizzes
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Choose a challenge from diverse topics. Answer the questions before the timer runs out and earn your spot on the live leaderboard.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
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
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Difficulty selector */}
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
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs text-muted-foreground hover:text-destructive ml-auto gap-1"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
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
            Try adjusting your search or filter keywords to find what you&apos;re looking for.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}
