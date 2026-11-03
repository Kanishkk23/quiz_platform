"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { mockQuizzes, mockQuestions } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
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

  const quiz = useMemo(() => {
    return mockQuizzes.find((q) => q.id === quizId) || mockQuizzes[0];
  }, [quizId]);

  const questions = useMemo(() => {
    return mockQuestions[quizId] || mockQuestions["1"] || [];
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

  // Compute stats
  const totalQuestions = questions.length || 10;
  const userScore = result ? result.score : Math.round(totalQuestions * 0.7);
  const timeTaken = result ? result.timeTaken : 185;
  const percentage = Math.round((userScore / totalQuestions) * 100);

  const correctCount = userScore;
  const answeredCount = result ? Object.keys(result.answers).length : totalQuestions;
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = totalQuestions - answeredCount;

  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const formattedTime = `${minutes}m ${seconds}s`;

  const getPerformanceBadge = () => {
    if (percentage >= 80) {
      return {
        label: "Outstanding Mastery!",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        message: "You displayed remarkable mastery of these concepts.",
      };
    } else if (percentage >= 50) {
      return {
        label: "Good Effort!",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        message: "Solid work! A bit more practice and you will top the leaderboard.",
      };
    } else {
      return {
        label: "Keep Practicing!",
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        message: "Review the question answers below and try again to improve your score.",
      };
    }
  };

  const performance = getPerformanceBadge();

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Result Hero Header */}
      <Card className="overflow-hidden border shadow-md mb-8">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 text-center border-b">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4 shadow-sm">
            <Trophy className="h-8 w-8" />
          </div>

          <Badge variant="outline" className={`mb-3 px-3 py-1 text-xs font-semibold ${performance.color}`}>
            {performance.label}
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Quiz Completed!
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {quiz.title} &bull; {performance.message}
          </p>

          {/* Big Score Display */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-primary">
              {percentage}%
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Final Score: {userScore} / {totalQuestions} Correct
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-xl border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Correct
              </div>
              <div className="text-xl sm:text-2xl font-bold">{correctCount}</div>
            </div>

            <div className="rounded-xl border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-1">
                <XCircle className="h-4 w-4" />
                Incorrect
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
              <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-semibold mb-1">
                <Clock className="h-4 w-4" />
                Time Taken
              </div>
              <div className="text-xl sm:text-2xl font-bold">{formattedTime}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href={`/quizzes/${quiz.id}`}>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>

            <Link href="/leaderboard">
              <Button className="gap-2">
                <Trophy className="h-4 w-4" />
                View Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/quizzes">
              <Button variant="ghost" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse More Quizzes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Answer Key Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Answer Review</h2>
            <p className="text-xs text-muted-foreground">
              Review each question, your selected option, and the correct answer.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, idx) => {
            const userSelectedOptionId = result?.answers?.[question.id];
            const isCorrect = userSelectedOptionId === question.correctOptionId;
            const isAnswered = !!userSelectedOptionId;

            return (
              <Card key={question.id} className="border shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <CardTitle className="text-base font-semibold leading-relaxed">
                        {question.text}
                      </CardTitle>
                    </div>

                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Correct
                        </span>
                      ) : isAnswered ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" />
                          Incorrect
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          Skipped
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {question.options.map((opt) => {
                      const isOptionSelected = userSelectedOptionId === opt.id;
                      const isOptionCorrect = opt.id === question.correctOptionId;

                      let style = "border-border bg-card text-muted-foreground";
                      if (isOptionCorrect) {
                        style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs sm:text-sm ${style}`}
                        >
                          <span>{opt.text}</span>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Correct
                            </span>
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
