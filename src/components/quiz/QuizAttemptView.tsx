"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Lock,
  Flame,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AttemptState } from "@/types/attempts";
import { Question, Quiz } from "@/types";

interface QuizAttemptViewProps {
  quizId: string;
}

export function QuizAttemptView({ quizId }: QuizAttemptViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("retake") === "true";
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<AttemptState | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [unsavedQuestionIds, setUnsavedQuestionIds] = useState<Set<string>>(new Set());

  // Server-authoritative remaining time (in seconds)
  const [remainingTime, setRemainingTime] = useState<number>(600);

  // Load quiz data and create/restore attempt from Supabase
  useEffect(() => {
    let active = true;

    async function initAttempt() {
      try {
        // 1. Fetch quiz info and questions from Supabase API
        const quizRes = await fetch(`/api/quizzes/${quizId}`);
        const quizData = await quizRes.json();

        if (!active) return;

        if (!quizRes.ok || !quizData.success) {
          throw new Error(quizData.error || "Failed to load quiz details");
        }

        const loadedQuiz: Quiz = {
          id: quizData.data.quiz.id,
          title: quizData.data.quiz.title,
          description: quizData.data.quiz.description,
          category: quizData.data.quiz.category,
          difficulty: "medium",
          questionCount: quizData.data.quiz.questionCount,
          timeLimit: quizData.data.quiz.durationSeconds,
          timerMode: "quiz",
          questionTimeLimit: quizData.data.quiz.secondsPerQuestion || 30,
          createdAt: quizData.data.quiz.startsAt,
        };

        setQuiz(loadedQuiz);
        setQuestions(
          (quizData.data.questions || []).map((q: Question) => ({
            ...q,
            options: q.options || [],
            correctOptionId: "", // Kept secret by server
          }))
        );

        // 2. If authenticated, create or restore attempt
        if (isAuthenticated) {
          const attemptRes = await fetch("/api/attempts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quizId,
              forceRetake: isRetake,
            }),
          });

          const attemptData = await attemptRes.json();

          if (!active) return;

          if (!attemptRes.ok || !attemptData.success) {
            throw new Error(attemptData.error || "Failed to initialize quiz attempt");
          }

          const state: AttemptState = attemptData.data.attempt;
          setAttempt(state);

          // If attempt is already submitted, redirect to result review
          if (state.status === "submitted") {
            router.replace(`/quizzes/${quizId}/result?attemptId=${state.id}`);
            return;
          }

          // Restore saved answers from previous session (Attempt Recovery on refresh!)
          if (state.savedAnswers) {
            const cleanAnswers: Record<string, string> = {};
            for (const [k, v] of Object.entries(state.savedAnswers)) {
              if (v) cleanAnswers[k] = v;
            }
            setAnswers(cleanAnswers);
          }

          // Synchronize server-authoritative timer
          setRemainingTime(Math.max(10, state.remainingSeconds));
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load quiz attempt");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initAttempt();

    return () => {
      active = false;
    };
  }, [quizId, isAuthenticated, isRetake, router]);

  // Handle option selection with immediate optimistic UI and explicit error surfacing
  const handleSelectOption = async (optionId: string) => {
    if (!currentQuestion || !attempt) return;
    setSaveError(null);

    // 1. Optimistic local update
    const updated = {
      ...answers,
      [currentQuestion.id]: optionId,
    };
    setAnswers(updated);

    // 2. Background persistence to Supabase answers table
    setIsSavingAnswer(true);
    try {
      const res = await fetch(`/api/attempts/${attempt.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          optionId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to persist answer");
      }
      // Successfully saved to server: clear from unsaved tracking
      setUnsavedQuestionIds((prev) => {
        const next = new Set(prev);
        next.delete(currentQuestion.id);
        return next;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      console.error("Save answer failed:", err);
      setSaveError(`Failed to save answer for Question ${currentIndex + 1}: ${message}. Please re-select or check connection.`);
      setUnsavedQuestionIds((prev) => new Set(prev).add(currentQuestion.id));
    } finally {
      setIsSavingAnswer(false);
    }
  };

  // Submit attempt to server
  const handleFinishAttempt = useCallback(async () => {
    if (!attempt || isSubmitting) return;

    if (unsavedQuestionIds.size > 0) {
      const msg = `Cannot submit: Answers for ${unsavedQuestionIds.size} question(s) failed to save to server. Please re-select them before submitting.`;
      setSaveError(msg);
      alert(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      setSaveError(null);

      // Fast submission: Answers are already auto-persisted on selection.
      // If any pending answers remain unsaved, flush them in parallel.
      if (unsavedQuestionIds.size > 0) {
        await Promise.all(
          Array.from(unsavedQuestionIds).map(async (qId) => {
            const optId = answers[qId];
            if (!optId) return;
            const res = await fetch(`/api/attempts/${attempt.id}/answers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ questionId: qId, optionId: optId }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || `Failed to save answer for question ${qId}`);
            }
          })
        );
      }

      const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      // Navigate to server-verified result screen
      router.push(`/quizzes/${quizId}/result?attemptId=${attempt.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error. Please try again.";
      setSaveError(msg);
      alert(msg);
      setIsSubmitting(false);
    }
  }, [answers, attempt, isSubmitting, quizId, router, unsavedQuestionIds]);

  // Handler when overall quiz timer runs out
  const handleQuizTimeUp = useCallback(() => {
    setIsSubmitDialogOpen(false);
    handleFinishAttempt();
  }, [handleFinishAttempt]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Unauthenticated Barrier Card
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
              You must be signed in to attempt this quiz. Sign in to record your verified score on the live leaderboard.
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

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#BDF2D5]">
        <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-8 shadow-[9px_9px_0_#0F3D2E] text-center max-w-sm">
          <Loader2 className="h-10 w-10 animate-spin text-[#0F3D2E] mx-auto mb-4" />
          <h3 className="text-lg font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
            Syncing Attempt Engine...
          </h3>
          <p className="text-xs text-[#0F3D2E]/70 mt-1 font-medium">
            Fetching secure questions &amp; restoring your timer...
          </p>
        </div>
      </div>
    );
  }

  // Error State (e.g. Availability window closed or not found)
  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md my-12 text-[#0F3D2E]">
        <div className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE94A] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] mb-4">
            <AlertCircle className="h-7 w-7 text-[#0F3D2E]" />
          </div>
          <h2 className="text-2xl font-[family-name:var(--font-display)] font-extrabold mb-2">
            Quiz Unavailable
          </h2>
          <p className="text-sm text-[#0F3D2E]/80 font-medium mb-6">
            {error || "We could not find or access this quiz."}
          </p>
          <Link href="/quizzes">
            <Button className="bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
              Back to Available Quizzes
            </Button>
          </Link>
        </div>
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
        {/* Quiz Arena Top Bar */}
        <div className="mb-4 flex items-center justify-between px-1 text-xs font-bold text-[#0F3D2E]">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#0F3D2E]" />
            <span>
              Contender: <strong className="bg-[#FFE94A] px-1 rounded border border-[#0F3D2E]">{user?.name}</strong>
            </span>
            {isSavingAnswer && (
              <span className="ml-2 text-xs font-semibold text-[#0F3D2E]/70 animate-pulse">
                • Saving answer...
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#0F3D2E]" />
            <span>Server-Authoritative Timer &amp; Verified Scoring</span>
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
            {/* Server-Authoritative Quiz Countdown Timer */}
            <QuizTimer
              mode="quiz"
              initialSeconds={remainingTime}
              onTimeUp={handleQuizTimeUp}
            />

            <Button
              size="sm"
              onClick={() => setIsSubmitDialogOpen(true)}
              disabled={isSubmitting || unsavedQuestionIds.size > 0}
              className="bg-[#0F3D2E] hover:bg-[#FFE94A] hover:text-[#0F3D2E] text-[#FFFDF5] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E] transition-all px-4 disabled:opacity-50"
            >
              Finish
            </Button>
          </div>
        </div>

        {/* Answer save failure banner */}
        {saveError && (
          <div className="mb-4 rounded-[12px] border-2 border-[#E5484D] bg-[#FFEAEA] p-3 text-xs font-bold text-[#E5484D] flex items-center justify-between shadow-[3px_3px_0_#E5484D]">
            <span>⚠️ {saveError}</span>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              className="ml-3 underline hover:opacity-80 shrink-0 font-extrabold"
            >
              Dismiss
            </button>
          </div>
        )}

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
              disabled={isSubmitting}
              className="gap-2 bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[5px_5px_0_#0F3D2E] transition-all px-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Question overview palette */}
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
            <DialogTitle className="text-center text-2xl font-[family-name:var(--font-display)] font-extrabold">
              Ready to submit?
            </DialogTitle>
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
              disabled={isSubmitting}
              className="border-2 border-[#0F3D2E] bg-[#FFFDF5] font-bold text-[#0F3D2E] rounded-[10px]"
            >
              Continue Quiz
            </Button>
            <Button
              onClick={() => {
                setIsSubmitDialogOpen(false);
                handleFinishAttempt();
              }}
              disabled={isSubmitting}
              className="bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
            >
              {isSubmitting ? "Scoring..." : "Submit & View Results"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
