"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { mockQuizzes, mockQuestions } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Filter,
  Sparkles,
  Award,
} from "lucide-react";

interface QuizResultViewProps {
  quizId: string;
}

interface StoredResult {
  quizId: string;
  quizTitle: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
}

export function QuizResultView({ quizId }: QuizResultViewProps) {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");

  const quiz = useMemo(() => {
    return mockQuizzes.find((q) => q.id === quizId);
  }, [quizId]);

  const questions = useMemo(() => {
    return mockQuestions[quizId] || [];
  }, [quizId]);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(`quiz_result_${quizId}`);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // fallback
      }
    }
  }, [quizId]);

  if (mounted && !result && questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
        <h2 className="text-2xl font-bold mb-2">No Result Recorded</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You haven&apos;t completed this quiz yet or the quiz is not currently available.
        </p>
        <Link href="/quizzes">
          <Button>Browse Quizzes</Button>
        </Link>
      </div>
    );
  }

  // Compute stats
  const totalQuestions = result ? result.totalQuestions : questions.length || 1;
  const userScore = result ? result.score : 0;
  const timeTaken = result ? result.timeTaken : 0;
  const percentage = Math.round((userScore / totalQuestions) * 100);

  const correctCount = userScore;
  const answeredCount = result ? Object.keys(result.answers).length : 0;
  const incorrectCount = Math.max(0, answeredCount - correctCount);
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  const correctPercent = Math.round((correctCount / totalQuestions) * 100);
  const incorrectPercent = Math.round((incorrectCount / totalQuestions) * 100);
  const skippedPercent = Math.max(0, 100 - correctPercent - incorrectPercent);

  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const formattedTime = `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;

  const getPerformanceBadge = () => {
    if (percentage >= 90) {
      return {
        label: "🏆 Master Tier • Champion Performance",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        message: "Incredible accuracy! You have a high chance of securing the #1 Gold spot on the leaderboard.",
      };
    } else if (percentage >= 70) {
      return {
        label: "🥈 Pro Tier • Podium Contender",
        color: "bg-[#CC5500]/10 text-[#CC5500] border-[#CC5500]/30",
        message: "Outstanding work! You have strong grasp of this topic and earned a competitive rank.",
      };
    } else if (percentage >= 50) {
      return {
        label: "🥉 Challenger Tier • Solid Attempt",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        message: "Good effort! A few targeted review sessions and you will break into the top 3.",
      };
    } else {
      return {
        label: "🎯 Apprentice Tier • Practice Required",
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        message: "Review the question solutions below and retake the quiz to level up your standing.",
      };
    }
  };

  const performance = getPerformanceBadge();
  const title = result?.quizTitle || quiz?.title || "Quiz Result";

  // Filter questions for review
  const filteredQuestions = questions.filter((question) => {
    const userSelected = result?.answers?.[question.id];
    const isCorrect = userSelected === question.correctOptionId;
    const isAnswered = !!userSelected;

    if (reviewFilter === "correct") return isCorrect;
    if (reviewFilter === "incorrect") return isAnswered && !isCorrect;
    if (reviewFilter === "skipped") return !isAnswered;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Score Summary Hero Card */}
      <Card className="mb-8 border shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Trophy className="h-7 w-7 text-[#CC5500]" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quiz Complete: {title}
          </CardTitle>
          <CardDescription className="text-sm">
            Your performance has been evaluated and recorded for the {title} Leaderboard
          </CardDescription>

          <div className="pt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border ${performance.color}`}
            >
              {performance.label}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-6">
          <p className="text-center text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {performance.message}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Correct Answers
              </div>
              <div className="text-xl sm:text-2xl font-bold">{correctCount}</div>
            </div>

            <div className="rounded-xl border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-1">
                <XCircle className="h-4 w-4" />
                Incorrect Answers
              </div>
              <div className="text-xl sm:text-2xl font-bold">{incorrectCount}</div>
            </div>

            <div className="rounded-xl border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs font-semibold mb-1">
                <HelpCircle className="h-4 w-4" />
                Skipped
              </div>
              <div className="text-xl sm:text-2xl font-bold">{unansweredCount}</div>
            </div>

            <div className="rounded-xl border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1.5 text-[#CC5500] text-xs font-semibold mb-1">
                <Clock className="h-4 w-4" />
                Time Taken
              </div>
              <div className="text-xl sm:text-2xl font-bold">{formattedTime}</div>
            </div>
          </div>

          {/* Segmented Result Breakdown Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Answer Distribution Breakdown</span>
              <span>{totalQuestions} Questions Total</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
              {correctPercent > 0 && (
                <div
                  style={{ width: `${correctPercent}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Correct: ${correctCount} (${correctPercent}%)`}
                />
              )}
              {incorrectPercent > 0 && (
                <div
                  style={{ width: `${incorrectPercent}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Incorrect: ${incorrectCount} (${incorrectPercent}%)`}
                />
              )}
              {skippedPercent > 0 && (
                <div
                  style={{ width: `${skippedPercent}%` }}
                  className="bg-slate-400/50 h-full transition-all"
                  title={`Skipped: ${unansweredCount} (${skippedPercent}%)`}
                />
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Correct: {correctCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Incorrect: {incorrectCount}
              </span>
              {unansweredCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Skipped: {unansweredCount}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons with Per-Quiz Leaderboard link */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={`/quizzes/${quizId}`}>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>

            <Link href={`/leaderboard?quizId=${quizId}`}>
              <Button className="gap-2 bg-[#CC5500] hover:bg-[#B34700] text-white">
                <Trophy className="h-4 w-4 text-white" />
                View Quiz Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/profile">
              <Button variant="secondary" className="gap-2">
                My Profile History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Answer Key Review Section */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Review Question Solutions</h2>
              <p className="text-xs text-muted-foreground">
                Examine your answers against verified solutions
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-lg border bg-muted/50 p-1 text-xs">
              <button
                onClick={() => setReviewFilter("all")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  reviewFilter === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setReviewFilter("correct")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  reviewFilter === "correct"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                onClick={() => setReviewFilter("incorrect")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  reviewFilter === "incorrect"
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
              <button
                onClick={() => setReviewFilter("skipped")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  reviewFilter === "skipped"
                    ? "bg-slate-500/15 text-slate-700 dark:text-slate-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Skipped ({unansweredCount})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const userAnswerId = result?.answers?.[q.id];
              const isCorrect = userAnswerId === q.correctOptionId;
              const isSkipped = !userAnswerId;

              return (
                <Card
                  key={q.id}
                  className={`border transition-colors ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : isSkipped
                      ? "border-border"
                      : "border-rose-500/30 bg-rose-500/[0.02]"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Question {idx + 1}
                      </span>
                      {isCorrect ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Correct (+10 pts)
                        </Badge>
                      ) : isSkipped ? (
                        <Badge variant="outline" className="text-muted-foreground gap-1 text-[11px]">
                          <HelpCircle className="h-3 w-3" />
                          Skipped
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1 text-[11px]">
                          <XCircle className="h-3 w-3" />
                          Incorrect
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold pt-1">
                      {q.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isUserPick = opt.id === userAnswerId;
                        const isCorrectAnswer = opt.id === q.correctOptionId;

                        let style = "border-border/60 bg-muted/20 text-muted-foreground";

                        if (isCorrectAnswer) {
                          style = "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-medium";
                        } else if (isUserPick && !isCorrect) {
                          style = "border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-300 line-through";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${style}`}
                          >
                            <span>{opt.text}</span>
                            {isCorrectAnswer && (
                              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                                Verified Solution ✓
                              </span>
                            )}
                            {isUserPick && !isCorrectAnswer && (
                              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                                Your Choice ✗
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-muted-foreground pt-2 italic border-t border-border/40">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
