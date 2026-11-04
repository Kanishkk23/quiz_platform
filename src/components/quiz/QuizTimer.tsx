"use client";

import { useEffect, useState } from "react";
import { Clock, Hourglass } from "lucide-react";

interface QuizTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  mode?: "quiz" | "question";
  questionKey?: string | number; // triggers reset when in per-question mode
}

export function QuizTimer({
  initialSeconds,
  onTimeUp,
  isPaused = false,
  mode = "quiz",
  questionKey,
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  // Reset timer whenever questionKey changes (for per-question timer)
  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [questionKey, initialSeconds]);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp, isPaused]);

  const isPerQuestion = mode === "question";

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = isPerQuestion
    ? `${timeLeft}s`
    : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Visual urgency styling
  const dangerThreshold = isPerQuestion ? 5 : 60;
  const warningThreshold = isPerQuestion ? 10 : 180;

  const isDanger = timeLeft <= dangerThreshold;
  const isWarning = timeLeft <= warningThreshold && !isDanger;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs sm:text-sm font-semibold transition-colors ${
        isDanger
          ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
          : isWarning
          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-muted/60 text-foreground"
      }`}
      title={isPerQuestion ? "Timer per question" : "Overall quiz timer"}
    >
      {isPerQuestion ? (
        <Hourglass className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isDanger ? "text-destructive" : ""}`} />
      ) : (
        <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isDanger ? "text-destructive" : ""}`} />
      )}
      <span className="hidden xs:inline text-[11px] uppercase tracking-wider text-muted-foreground font-sans">
        {isPerQuestion ? "Question:" : "Time:"}
      </span>
      <span>{formattedTime}</span>
    </div>
  );
}
