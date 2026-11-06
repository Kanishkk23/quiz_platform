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
        <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-8 shadow-[9px_9px_0_#0F3D2E]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE94A] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] mb-4">
            <Trophy className="h-7 w-7 text-[#0F3D2E]" />
          </div>
          <h2 className="text-2xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E] mb-2">
            No Result Recorded
          </h2>
          <p className="text-sm font-medium text-[#0F3D2E]/70 mb-6">
            You haven&apos;t completed this quiz yet or the quiz is not currently available.
          </p>
          <Link href="/quizzes">
            <Button className="bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
              Browse Quizzes
            </Button>
          </Link>
        </div>
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
        color: "bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]",
        message: "Incredible accuracy! You have a high chance of securing the #1 Gold spot on the leaderboard.",
      };
    } else if (percentage >= 70) {
      return {
        label: "🥈 Pro Tier • Podium Contender",
        color: "bg-[#E3F9EE] text-[#0F3D2E] border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]",
        message: "Outstanding work! You have strong grasp of this topic and earned a competitive rank.",
      };
    } else if (percentage >= 50) {
      return {
        label: "🥉 Challenger Tier • Solid Attempt",
        color: "bg-[#FFFDF5] text-[#0F3D2E] border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]",
        message: "Good effort! A few targeted review sessions and you will break into the top 3.",
      };
    } else {
      return {
        label: "🎯 Practice Tier • Keep Going",
        color: "bg-[#E5484D]/15 text-[#E5484D] border-2 border-[#E5484D] shadow-[2px_2px_0_#E5484D]",
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
    <div className="container mx-auto max-w-4xl">
      {/* Score Summary Hero Card */}
      <div className="mb-8 rounded-[20px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-6 sm:p-8 shadow-[9px_9px_0_#0F3D2E]">
        <div className="text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE94A] border-[2.5px] border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] mb-3">
            <Trophy className="h-8 w-8 text-[#0F3D2E]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
            Quiz Complete: {title}
          </h1>
          <p className="text-sm font-medium text-[#0F3D2E]/80 mt-1">
            Your performance has been evaluated and recorded for the {title} Leaderboard
          </p>

          <div className="pt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold ${performance.color}`}
            >
              {performance.label}
            </span>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <p className="text-center text-sm font-medium text-[#0F3D2E]/70 mb-6 max-w-md mx-auto">
            {performance.message}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-[14px] border-[2px] border-[#0F3D2E] bg-[#E3F9EE] p-3 sm:p-4 shadow-[3px_3px_0_#0F3D2E]">
              <div className="flex items-center justify-center gap-1.5 text-[#0F3D2E] text-xs font-bold mb-1">
                <CheckCircle2 className="h-4 w-4 text-[#1F9D6B]" />
                Correct
              </div>
              <div className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
                {correctCount}
              </div>
            </div>

            <div className="rounded-[14px] border-[2px] border-[#0F3D2E] bg-[#FFFDF5] p-3 sm:p-4 shadow-[3px_3px_0_#0F3D2E]">
              <div className="flex items-center justify-center gap-1.5 text-[#E5484D] text-xs font-bold mb-1">
                <XCircle className="h-4 w-4 text-[#E5484D]" />
                Incorrect
              </div>
              <div className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#E5484D]">
                {incorrectCount}
              </div>
            </div>

            <div className="rounded-[14px] border-[2px] border-[#0F3D2E] bg-[#FFFDF5] p-3 sm:p-4 shadow-[3px_3px_0_#0F3D2E]">
              <div className="flex items-center justify-center gap-1.5 text-[#0F3D2E]/70 text-xs font-bold mb-1">
                <HelpCircle className="h-4 w-4" />
                Skipped
              </div>
              <div className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
                {unansweredCount}
              </div>
            </div>

            <div className="rounded-[14px] border-[2px] border-[#0F3D2E] bg-[#FFE94A]/40 p-3 sm:p-4 shadow-[3px_3px_0_#0F3D2E]">
              <div className="flex items-center justify-center gap-1.5 text-[#0F3D2E] text-xs font-bold mb-1">
                <Clock className="h-4 w-4 text-[#0F3D2E]" />
                Time Taken
              </div>
              <div className="text-xl sm:text-2xl font-[family-name:var(--font-mono)] font-bold text-[#0F3D2E]">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Segmented Result Breakdown Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#0F3D2E] font-bold">
              <span>Answer Distribution Breakdown</span>
              <span>{totalQuestions} Questions Total</span>
            </div>
            <div className="h-3.5 w-full rounded-full border-2 border-[#0F3D2E] bg-[#E3F9EE] overflow-hidden flex shadow-inner">
              {correctPercent > 0 && (
                <div
                  style={{ width: `${correctPercent}%` }}
                  className="bg-[#0F3D2E] h-full transition-all"
                  title={`Correct: ${correctCount} (${correctPercent}%)`}
                />
              )}
              {incorrectPercent > 0 && (
                <div
                  style={{ width: `${incorrectPercent}%` }}
                  className="bg-[#E5484D] h-full transition-all"
                  title={`Incorrect: ${incorrectCount} (${incorrectPercent}%)`}
                />
              )}
              {skippedPercent > 0 && (
                <div
                  style={{ width: `${skippedPercent}%` }}
                  className="bg-[#0F3D2E]/20 h-full transition-all"
                  title={`Skipped: ${unansweredCount} (${skippedPercent}%)`}
                />
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-[#0F3D2E]/80 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0F3D2E]" />
                Correct: {correctCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E5484D]" />
                Incorrect: {incorrectCount}
              </span>
              {unansweredCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0F3D2E]/20" />
                  Skipped: {unansweredCount}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons with Per-Quiz Leaderboard link */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={`/quizzes/${quizId}`}>
              <Button
                variant="outline"
                className="gap-2 bg-[#FFFDF5] hover:bg-[#E3F9EE] text-[#0F3D2E] font-bold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>

            <Link href={`/leaderboard?quizId=${quizId}`}>
              <Button className="gap-2 bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
                <Trophy className="h-4 w-4 text-[#0F3D2E]" />
                View Quiz Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/profile">
              <Button
                variant="secondary"
                className="gap-2 bg-[#E3F9EE] hover:bg-[#FFFDF5] text-[#0F3D2E] font-bold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
              >
                My Profile History
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Answer Key Review Section */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
                Review Question Solutions
              </h2>
              <p className="text-xs font-medium text-[#0F3D2E]/70">
                Examine your answers against verified solutions
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFFDF5] p-1 text-xs">
              <button
                onClick={() => setReviewFilter("all")}
                className={`rounded-[7px] px-3 py-1 font-bold transition-all ${
                  reviewFilter === "all"
                    ? "bg-[#FFE94A] text-[#0F3D2E] border border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                    : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setReviewFilter("correct")}
                className={`rounded-[7px] px-3 py-1 font-bold transition-all ${
                  reviewFilter === "correct"
                    ? "bg-[#E3F9EE] text-[#0F3D2E] border border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                    : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                onClick={() => setReviewFilter("incorrect")}
                className={`rounded-[7px] px-3 py-1 font-bold transition-all ${
                  reviewFilter === "incorrect"
                    ? "bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D] shadow-[2px_2px_0_#E5484D]"
                    : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
              <button
                onClick={() => setReviewFilter("skipped")}
                className={`rounded-[7px] px-3 py-1 font-bold transition-all ${
                  reviewFilter === "skipped"
                    ? "bg-[#FFFDF5] text-[#0F3D2E] border border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                    : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
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
                <div
                  key={q.id}
                  className="rounded-[16px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-5 shadow-[5px_5px_0_#0F3D2E] text-[#0F3D2E]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2E]/60">
                      Question {idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E3F9EE] border-2 border-[#0F3D2E] text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]">
                        <CheckCircle2 className="h-3 w-3 text-[#1F9D6B]" />
                        Correct (+10 pts)
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border-2 border-[#0F3D2E]/40 text-[#0F3D2E]/60">
                        <HelpCircle className="h-3 w-3" />
                        Skipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E5484D]/15 border-2 border-[#E5484D] text-[#E5484D] shadow-[2px_2px_0_#E5484D]">
                        <XCircle className="h-3 w-3" />
                        Incorrect
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#0F3D2E] mb-3">
                    {q.text}
                  </h3>

                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt) => {
                      const isUserPick = opt.id === userAnswerId;
                      const isCorrectAnswer = opt.id === q.correctOptionId;

                      let style = "border-[1.5px] border-[#0F3D2E]/20 bg-[#FFFDF5] text-[#0F3D2E]/80";

                      if (isCorrectAnswer) {
                        style = "border-2 border-[#0F3D2E] bg-[#E3F9EE] text-[#0F3D2E] font-bold shadow-[2px_2px_0_#0F3D2E]";
                      } else if (isUserPick && !isCorrect) {
                        style = "border-2 border-[#E5484D] bg-[#E5484D]/10 text-[#E5484D] font-bold line-through";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between p-3 rounded-[10px] text-xs ${style}`}
                        >
                          <span className="font-medium">{opt.text}</span>
                          {isCorrectAnswer && (
                            <span className="text-[10px] uppercase font-extrabold text-[#0F3D2E] bg-[#FFE94A] px-2 py-0.5 rounded-[4px] border border-[#0F3D2E]">
                              Verified Solution ✓
                            </span>
                          )}
                          {isUserPick && !isCorrectAnswer && (
                            <span className="text-[10px] uppercase font-extrabold text-[#E5484D] bg-[#E5484D]/10 px-2 py-0.5 rounded-[4px] border border-[#E5484D]">
                              Your Choice ✗
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3 rounded-[8px] border-l-4 border-[#0F3D2E] bg-[#E3F9EE]/50 text-xs text-[#0F3D2E] font-medium">
                      <strong className="font-bold">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
