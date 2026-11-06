"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockQuizzes, mockQuestions } from "@/data/mock";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [, setAuthChecked] = useState(false);

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
      <div
        className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16 bg-[#BDF2D5]"
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
        <Card className="w-full max-w-md text-center p-8 space-y-5 bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight">Login Required</h2>
            <p className="text-sm text-[#0F3D2E]/80 leading-relaxed font-medium">
              You must be signed in to attempt <span className="font-bold text-[#0F3D2E] bg-[#FFE94A] px-1 py-0.5 rounded border border-[#0F3D2E]">&quot;{quiz.title}&quot;</span>. 
              Sign in to record your score on the live leaderboard.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/login?redirect=/quizzes/${quizId}`)}
              className="w-full bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] h-11"
            >
              Sign In to Continue
            </Button>
            <Link href="/quizzes">
              <Button variant="ghost" className="w-full text-xs font-bold text-[#0F3D2E]/70 hover:text-[#0F3D2E]">
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
      <div className="container mx-auto px-4 py-20 text-center max-w-md bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] my-12 text-[#0F3D2E]">
        <h2 className="text-2xl font-[family-name:var(--font-display)] font-extrabold mb-2">No Questions Ready</h2>
        <p className="text-sm text-[#0F3D2E]/70 font-medium mb-6">
          This quiz doesn&apos;t have any active questions yet.
        </p>
        <Link href="/quizzes">
          <Button className="bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
            Back to Quizzes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 bg-[#BDF2D5]"
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
      <div className="container mx-auto max-w-4xl">
        {/* Authentic Quiz Arena Top Bar */}
        <div className="mb-4 flex items-center justify-between px-1 text-xs font-bold text-[#0F3D2E]">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#0F3D2E]" />
            <span>Quiz Arena Session • Verified Contender: <strong className="bg-[#FFE94A] px-1 rounded border border-[#0F3D2E]">{user?.name}</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#0F3D2E]" />
            <span>Anti-cheat active • Tab focus monitored</span>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 shadow-[6px_6px_0_#0F3D2E] text-[#0F3D2E]">
          <div className="flex items-center gap-3">
            <Link href="/quizzes">
              <Button variant="ghost" size="icon" className="h-9 w-9 border-2 border-[#0F3D2E] rounded-[8px] bg-[#E3F9EE] hover:bg-[#FFE94A] text-[#0F3D2E]">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Exit Quiz</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-[family-name:var(--font-display)] font-extrabold sm:text-lg line-clamp-1">{quiz.title}</h1>
              <p className="text-xs font-semibold text-[#0F3D2E]/70 font-mono">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
            {/* Timer mode switcher pill */}
            <div className="flex items-center rounded-[10px] border-2 border-[#0F3D2E] bg-[#E3F9EE] p-1 text-xs">
              <button
                type="button"
                onClick={() => setTimerMode("quiz")}
                className={`flex items-center gap-1 rounded-[7px] px-2.5 py-1 font-bold transition-all ${
                  timerMode === "quiz"
                    ? "bg-[#FFE94A] text-[#0F3D2E] border border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                    : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
                }`}
                title="Timer counts down total quiz duration"
              >
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => setTimerMode("question")}
                className={`flex items-center gap-1 rounded-[7px] px-2.5 py-1 font-bold transition-all ${
                  timerMode === "question"
                    ? "bg-[#FFE94A] text-[#0F3D2E] border border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                    : "text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
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
              onClick={() => setIsSubmitDialogOpen(true)}
              className="bg-[#0F3D2E] hover:bg-[#FFE94A] hover:text-[#0F3D2E] text-[#FFFDF5] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E] transition-all px-4"
            >
              Finish
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-[#0F3D2E]">
            <span>Progress: {answeredCount}/{totalQuestions} Answered</span>
            <span className="font-mono">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 w-full bg-[#FFFDF5] border-2 border-[#0F3D2E] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-[#1F9D6B] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
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
            className="gap-2 bg-[#FFFDF5] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[3px_3px_0_#0F3D2E] hover:bg-[#E3F9EE] disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="gap-2 bg-[#0F3D2E] hover:bg-[#FFE94A] hover:text-[#0F3D2E] text-[#FFFDF5] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] transition-all px-5"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setIsSubmitDialogOpen(true)}
              className="gap-2 bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[5px_5px_0_#0F3D2E] transition-all px-5"
            >
              Submit Quiz
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question palette / Jump grid */}
        <div className="mt-8 rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-6 shadow-[6px_6px_0_#0F3D2E] text-[#0F3D2E]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0F3D2E] mb-3">
            Question Overview Palette
          </div>
          <div className="flex flex-wrap gap-2.5">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-9 rounded-[8px] text-xs font-black transition-all border-2 ${
                    isCurrent
                      ? "bg-[#FFE94A] text-[#0F3D2E] border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] scale-105"
                      : isAnswered
                      ? "bg-[#1F9D6B] border-[#0F3D2E] text-[#FFFDF5]"
                      : "bg-[#E3F9EE] border-[#0F3D2E] text-[#0F3D2E] hover:bg-[#FFE94A]"
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
        <DialogContent className="sm:max-w-md bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] mb-3">
              <AlertCircle className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-2xl font-[family-name:var(--font-display)] font-extrabold">Ready to submit?</DialogTitle>
            <DialogDescription className="text-center pt-2 text-[#0F3D2E]/80 font-medium">
              You have answered <span className="font-bold text-[#0F3D2E] bg-[#FFE94A] px-1 rounded">{answeredCount}</span> out of{" "}
              <span className="font-bold text-[#0F3D2E]">{totalQuestions}</span> questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-3 text-[#E5484D] font-bold text-xs bg-[#E5484D]/10 p-2 rounded-lg border border-[#E5484D]">
                  ⚠️ You still have {totalQuestions - answeredCount} unanswered questions!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-3 mt-5">
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              className="border-2 border-[#0F3D2E] bg-[#FFFDF5] font-bold text-[#0F3D2E] rounded-[10px]"
            >
              Continue Quiz
            </Button>
            <Button
              onClick={() => {
                setIsSubmitDialogOpen(false);
                handleFinishAttempt();
              }}
              className="bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
            >
              Submit &amp; View Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
