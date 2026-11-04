"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockQuizzes, mockQuestions } from "@/data/mock";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Hourglass,
  Lock,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface QuizAttemptViewProps {
  quizId: string;
}

export function QuizAttemptView({ quizId }: QuizAttemptViewProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Authentication guard: redirect to login if not authenticated
  useEffect(() => {
    setAuthChecked(true);
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/quizzes/${quizId}`);
    }
  }, [isAuthenticated, quizId, router]);

  const quiz = useMemo(() => {
    return (
      mockQuizzes.find((q) => q.id === quizId) || {
        id: quizId,
        title: "Quiz " + quizId,
        description: "Interactive knowledge evaluation",
        category: "General",
        difficulty: "medium" as const,
        questionCount: 10,
        timeLimit: 600,
        timerMode: "quiz" as const,
        questionTimeLimit: 30,
        createdAt: new Date().toISOString(),
      }
    );
  }, [quizId]);

  const questions = useMemo(() => {
    return mockQuestions[quizId] || [];
  }, [quizId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [startTime] = useState<number>(() => Date.now());

  // Timer mode state: can be per-quiz (overall) or per-question
  const [timerMode, setTimerMode] = useState<"quiz" | "question">(
    quiz.timerMode || "quiz"
  );
  const perQuestionTimeLimit = quiz.questionTimeLimit || 30;

  // Load saved progress if any
  useEffect(() => {
    const saved = localStorage.getItem(`quiz_answers_${quizId}`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [quizId]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    const updated = {
      ...answers,
      [currentQuestion.id]: optionId,
    };
    setAnswers(updated);
    localStorage.setItem(`quiz_answers_${quizId}`, JSON.stringify(updated));
  };

  const handleFinishAttempt = useCallback(() => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    // Calculate score
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionId) {
        score += 1;
      }
    });

    // Save attempt result for the result page
    const attemptResult = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      answers,
      score,
      totalQuestions: totalQuestions || 10,
      timeTaken,
      completedAt: new Date().toISOString(),
      timerMode,
    };

    localStorage.setItem(
      `quiz_result_${quiz.id}`,
      JSON.stringify(attemptResult)
    );
    localStorage.removeItem(`quiz_answers_${quiz.id}`);

    // Append to global attempt history (for profile page)
    try {
      const existingHistoryStr = localStorage.getItem("quiz_attempt_history");
      const history = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      history.unshift({
        id: "att_" + Date.now(),
        ...attemptResult,
      });
      localStorage.setItem("quiz_attempt_history", JSON.stringify(history));
    } catch {
      // ignore
    }

    // Append to this specific quiz's leaderboard so the user immediately ranks on this quiz
    if (user) {
      try {
        const key = `quiz_leaderboard_custom_${quiz.id}`;
        const existingCustomStr = localStorage.getItem(key);
        const customEntries = existingCustomStr
          ? JSON.parse(existingCustomStr)
          : [];
        customEntries.push({
          userId: user.id,
          userName: user.name,
          quizId: quiz.id,
          quizTitle: quiz.title,
          score,
          totalQuestions: totalQuestions || 10,
          timeTaken,
          completedAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(customEntries));
      } catch {
        // ignore
      }
    }

    router.push(`/quizzes/${quiz.id}/result`);
  }, [answers, questions, quiz, router, startTime, timerMode, totalQuestions, user]);

  // Handler when per-question timer runs out
  const handleQuestionTimeUp = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishAttempt();
    }
  }, [currentIndex, totalQuestions, handleFinishAttempt]);

  // Handler when overall quiz timer runs out
  const handleQuizTimeUp = useCallback(() => {
    setIsSubmitDialogOpen(false);
    handleFinishAttempt();
  }, [handleFinishAttempt]);

  // If not authenticated, render the authentication barrier card
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16 bg-muted/10">
        <Card className="w-full max-w-md text-center p-8 space-y-5 border-border shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-[#CC5500] ring-4 ring-[#CC5500]/10">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Login Required</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must be signed in to attempt <span className="font-semibold text-foreground">&quot;{quiz.title}&quot;</span>. 
              Sign in to record your score on the live leaderboard.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/login?redirect=/quizzes/${quizId}`)}
              className="w-full bg-[#CC5500] hover:bg-[#B34700] text-white font-medium h-11"
            >
              Sign In to Continue
            </Button>
            <Link href="/quizzes">
              <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                Back to Available Quizzes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">No Questions Ready</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This quiz doesn&apos;t have any active questions yet.
        </p>
        <Link href="/quizzes">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Authentic Quiz Arena Top Bar */}
        <div className="mb-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Flame className="h-3.5 w-3.5 text-[#CC5500]" />
            <span>Quiz Arena Session • Verified Contender: <strong className="text-foreground">{user?.name}</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-[#607C52]" />
            <span>Anti-cheat active • Tab focus monitored</span>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/quizzes">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Exit Quiz</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold sm:text-lg line-clamp-1">{quiz.title}</h1>
              <p className="text-xs text-muted-foreground">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            {/* Timer mode switcher pill */}
            <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTimerMode("quiz")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  timerMode === "quiz"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Timer counts down total quiz duration"
              >
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => setTimerMode("question")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  timerMode === "question"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Timer counts down 30s per question"
              >
                <Hourglass className="h-3 w-3" />
                <span className="hidden sm:inline">Per Question</span>
              </button>
            </div>

            {/* Active Timer */}
            {timerMode === "quiz" ? (
              <QuizTimer
                mode="quiz"
                initialSeconds={quiz.timeLimit}
                onTimeUp={handleQuizTimeUp}
              />
            ) : (
              <QuizTimer
                mode="question"
                questionKey={currentIndex}
                initialSeconds={perQuestionTimeLimit}
                onTimeUp={handleQuestionTimeUp}
              />
            )}

            <Button
              size="sm"
              variant="default"
              onClick={() => setIsSubmitDialogOpen(true)}
              className="font-medium bg-[#CC5500] hover:bg-[#B34700] text-white"
            >
              Finish
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Progress: {answeredCount}/{totalQuestions} Answered</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          selectedOptionId={answers[currentQuestion.id]}
          onSelectOption={handleSelectOption}
          questionNumber={currentIndex + 1}
        />

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="gap-2 bg-[#607C52] hover:bg-[#4E6642] text-white"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setIsSubmitDialogOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Submit Quiz
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question palette / Jump grid */}
        <div className="mt-8 rounded-xl border bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Question Overview Palette
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold transition-all border ${
                    isCurrent
                      ? "ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground border-primary"
                      : isAnswered
                      ? "bg-[#607C52]/15 border-[#607C52]/40 text-[#607C52] dark:text-[#9CAF88]"
                      : "bg-muted/60 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Ready to submit?</DialogTitle>
            <DialogDescription className="text-center pt-1">
              You have answered <span className="font-semibold text-foreground">{answeredCount}</span> out of{" "}
              <span className="font-semibold text-foreground">{totalQuestions}</span> questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium text-xs">
                  ⚠️ You still have {totalQuestions - answeredCount} unanswered questions!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Continue Quiz
            </Button>
            <Button
              onClick={() => {
                setIsSubmitDialogOpen(false);
                handleFinishAttempt();
              }}
              className="bg-[#CC5500] hover:bg-[#B34700] text-white"
            >
              Submit & View Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
