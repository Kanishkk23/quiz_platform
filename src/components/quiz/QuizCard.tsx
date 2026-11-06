"use client";

import Link from "next/link";
import { Quiz } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, ArrowRight, Lock, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const { isAuthenticated } = useAuth();

  const getDifficultyColor = (diff: Quiz["difficulty"]) => {
    switch (diff) {
      case "easy":
        return "bg-[#E3F9EE] text-[#0F3D2E] border-2 border-[#0F3D2E]";
      case "medium":
        return "bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E]";
      case "hard":
        return "bg-[#E5484D] text-[#FFFDF5] border-2 border-[#0F3D2E]";
    }
  };

  const formatMinutes = (seconds: number) => {
    return `${Math.round(seconds / 60)} min`;
  };

  const targetHref = isAuthenticated
    ? `/quizzes/${quiz.id}`
    : `/login?redirect=/quizzes/${quiz.id}`;

  return (
    <Card className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[11px_11px_0_#0F3D2E] transition-all group overflow-hidden">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge className="bg-[#FFFDF5] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold text-xs capitalize shadow-[2px_2px_0_#0F3D2E]">
            {quiz.category}
          </Badge>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border-2 capitalize shadow-[2px_2px_0_#0F3D2E] ${getDifficultyColor(
              quiz.difficulty
            )}`}
          >
            {quiz.difficulty}
          </span>
        </div>
        <h3 className="text-xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E] transition-colors">
          {quiz.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <p className="text-sm text-[#0F3D2E]/80 line-clamp-2 font-medium">
          {quiz.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-bold text-[#0F3D2E]/80 pt-2 border-t-2 border-dashed border-[#0F3D2E]/20">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-[#0F3D2E]" />
            <span>{quiz.questionCount} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#0F3D2E]" />
            <span>{formatMinutes(quiz.timeLimit)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={targetHref} className="w-full">
          <Button className="w-full gap-2 bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] hover:shadow-[6px_6px_0_#0F3D2E] active:translate-y-0.5 active:shadow-none transition-all py-5">
            {isAuthenticated ? (
              <>
                <Play className="h-4 w-4 fill-current text-[#0F3D2E]" />
                Start Quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-[#0F3D2E]" />
                Sign In to Attempt
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
