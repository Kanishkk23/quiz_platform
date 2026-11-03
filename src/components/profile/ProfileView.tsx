"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User as UserIcon,
  Trophy,
  Target,
  Clock,
  Calendar,
  ArrowRight,
  BookOpen,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface AttemptRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
  timerMode?: "quiz" | "question";
}

export function ProfileView() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("quiz_attempt_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("quiz_attempt_history");
    setHistory([]);
  };

  // Stats computation
  const totalAttempts = history.length;
  const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
  const totalPossible = history.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const averagePercentage =
    totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  const bestScore = history.reduce(
    (max, curr) => Math.max(max, Math.round((curr.score / curr.totalQuestions) * 100)),
    0
  );

  const totalTimeSeconds = history.reduce((acc, curr) => acc + curr.timeTaken, 0);
  const totalMinutes = Math.round(totalTimeSeconds / 60);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const displayName = user?.name || "Quiz Participant";
  const displayEmail = user?.email || "guest@quizplatform.local";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Profile Header Card */}
      <Card className="border shadow-sm mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {displayName}
                </h1>
                <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 text-xs">
                  {isAuthenticated ? "Authenticated Member" : "Guest Mode"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{displayEmail}</p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Active Learner
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {totalAttempts} Completed Quizzes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/quizzes">
                <Button size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Take a Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border shadow-xs">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Quizzes Taken</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-black">{totalAttempts}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total finished attempts</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Average Accuracy</span>
              <Target className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {averagePercentage}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all quizzes</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Highest Score</span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {bestScore}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Personal best accuracy</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Time Invested</span>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-black">{totalMinutes}m</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total solving duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Attempt History Section */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Attempt History</CardTitle>
              <CardDescription className="text-xs">
                Your past quiz attempts, accuracy scores, and completion records.
              </CardDescription>
            </div>

            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Quiz</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => {
                const percentage = Math.round((record.score / record.totalQuestions) * 100);

                return (
                  <TableRow key={record.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>
                      <div className="font-semibold text-sm">{record.quizTitle}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{record.timerMode || "Quiz"} Timer</span>
                        <span className="sm:hidden">&bull; {formatDate(record.completedAt)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-bold text-sm">
                      {record.score} / {record.totalQuestions}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          percentage >= 80
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : percentage >= 50
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {percentage}%
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {formatDuration(record.timeTaken)}
                    </TableCell>

                    <TableCell className="text-center text-xs text-muted-foreground hidden sm:table-cell">
                      {formatDate(record.completedAt)}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <Link href={`/quizzes/${record.quizId}/result`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                          Review
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}

              {history.length === 0 && mounted && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <Trophy className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-medium text-foreground">No quiz attempts yet</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Take your first quiz to begin tracking your scores, accuracy, and study history.
                      </p>
                      <Link href="/quizzes" className="mt-2">
                        <Button size="sm">Browse Quizzes</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
