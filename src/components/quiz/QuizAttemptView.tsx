"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockQuizzes, mockQuestions } from "@/data/mock";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Clock, Hourglass } from "lucide-react";

interface QuizAttemptViewProps {
  quizId: string;
}

export function QuizAttemptView({ quizId }: QuizAttemptViewProps) {
  const router = useRouter();

  const quiz = useMemo(() => {
    return mockQuizzes.find((q) => q.id === quizId) || {
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
    };
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
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

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

    localStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify(attemptResult));
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

    router.push(`/quizzes/${quiz.id}/result`);
  }, [answers, questions, quiz, router, startTime, timerMode, totalQuestions]);

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

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">No Questions Ready</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This quiz doesn&apos;t have any active questions yet. Questions will appear once loaded from the backend.
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
              className="font-medium"
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
              className="gap-2"
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
            Question Overview
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
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
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
              className="bg-primary"
            >
              Submit & View Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
