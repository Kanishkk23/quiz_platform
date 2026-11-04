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
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "hard":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
  };

  const formatMinutes = (seconds: number) => {
    return `${Math.round(seconds / 60)} min`;
  };

  const targetHref = isAuthenticated
    ? `/quizzes/${quiz.id}`
    : `/login?redirect=/quizzes/${quiz.id}`;

  return (
    <Card className="flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-primary/40 group">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-normal text-xs capitalize">
            {quiz.category}
          </Badge>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${getDifficultyColor(
              quiz.difficulty
            )}`}
          >
            {quiz.difficulty}
          </span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {quiz.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {quiz.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>{quiz.questionCount} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatMinutes(quiz.timeLimit)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={targetHref} className="w-full">
          <Button className="w-full gap-2 group/btn">
            {isAuthenticated ? (
              <>
                <Play className="h-4 w-4 fill-current" />
                Start Quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Sign In to Attempt
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
