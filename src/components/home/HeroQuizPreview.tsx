"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  RotateCcw,
} from "lucide-react";

export function HeroQuizPreview() {
  const [selectedOption, setSelectedOption] = useState<string>("b");
  const [timerSeconds, setTimerSeconds] = useState(24);

  // Gentle timer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const options = [
    { id: "a", text: '"null"' },
    { id: "b", text: '"object"' }, // correct
    { id: "c", text: '"undefined"' },
    { id: "d", text: '"boolean"' },
  ];

  const isAnswered = selectedOption !== "";
  const isCorrect = selectedOption === "b";

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative ambient glow backdrop */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-xl opacity-80 animate-pulse pointer-events-none" />

      {/* Main floating card */}
      <Card className="relative border-border/80 bg-card/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-primary/10">
        {/* Top Header of the mock quiz card */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <Badge variant="outline" className="font-semibold text-[11px] bg-background">
              JavaScript Basics
            </Badge>
            <span className="text-muted-foreground font-medium hidden xs:inline">
              Q3 of 10
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            <span>00:{timerSeconds.toString().padStart(2, "0")}</span>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Question Text */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Interactive Preview
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
              What does <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-[0.9em]">typeof null</code> return in JavaScript?
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isOptionCorrect = opt.id === "b";

              let btnStyle =
                "border-border bg-card hover:bg-muted/60 text-foreground";
              if (isSelected && isOptionCorrect) {
                btnStyle =
                  "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20";
              } else if (isSelected && !isOptionCorrect) {
                btnStyle =
                  "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold uppercase ${
                        isSelected && isOptionCorrect
                          ? "bg-emerald-500 text-white"
                          : isSelected && !isOptionCorrect
                          ? "bg-rose-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>

                  {isSelected && isOptionCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  {isSelected && !isOptionCorrect && (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Feedback Banner */}
          {isAnswered && (
            <div
              className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <Trophy className="h-4 w-4 text-emerald-500" />
                    <span>Great job! Correct answer (+100 XP)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-rose-500" />
                    <span>In JavaScript, typeof null is an historical quirk returning &quot;object&quot;.</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedOption("b")}
                className="text-[11px] underline opacity-80 hover:opacity-100 flex items-center gap-1 shrink-0 ml-2"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
