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
  const [prevKey, setPrevKey] = useState(questionKey);

  // Reset timer whenever questionKey changes (for per-question timer) without cascading render effect
  if (questionKey !== prevKey) {
    setPrevKey(questionKey);
    setTimeLeft(initialSeconds);
  }

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
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] border-2 font-mono text-xs sm:text-sm font-bold transition-colors ${
        isDanger
          ? "border-[#0F3D2E] bg-[#E5484D] text-[#FFFDF5] shadow-[3px_3px_0_#0F3D2E] animate-pulse"
          : isWarning
          ? "border-[#0F3D2E] bg-[#FFE94A] text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]"
          : "border-[#0F3D2E] bg-[#FFFDF5] text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]"
      }`}
      title={isPerQuestion ? "Timer per question" : "Overall quiz timer"}
    >
      {isPerQuestion ? (
        <Hourglass className="h-4 w-4 text-current" />
      ) : (
        <Clock className="h-4 w-4 text-current" />
      )}
      <span className="hidden xs:inline text-[11px] uppercase tracking-wider text-current font-sans font-bold">
        {isPerQuestion ? "Q-Timer:" : "Time:"}
      </span>
      <span>{formattedTime}</span>
    </div>
  );
}
