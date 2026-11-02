"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface QuizTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function QuizTimer({ initialSeconds, onTimeUp, isPaused = false }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Visual urgency styling
  const isDanger = timeLeft <= 60;
  const isWarning = timeLeft <= 180 && !isDanger;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold transition-colors ${
        isDanger
          ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
          : isWarning
          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-muted/60 text-foreground"
      }`}
    >
      <Clock className={`h-4 w-4 ${isDanger ? "text-destructive" : ""}`} />
      <span>{formattedTime}</span>
    </div>
  );
}
