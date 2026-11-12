"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
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
  CheckCircle2,
} from "lucide-react";

interface AttemptRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  category?: string;
  score: number;
  totalPoints?: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
  percentage?: number;
}

const emptySubscribe = () => () => {};

export function ProfileView() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    let active = true;

    async function fetchAttempts() {
      try {
        const res = await fetch("/api/profile/attempts");
        const json = await res.json();
        if (active && res.ok && json.success && Array.isArray(json.data)) {
          setHistory(json.data);
        }
      } catch (err) {
        console.error("Failed to load profile attempts:", err);
      }
    }

    if (isAuthenticated) {
      fetchAttempts();
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

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
  const displayEmail = user?.email || "guest@quizora.local";
  const initial = displayName.charAt(0).toUpperCase();

  if (mounted && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-8 shadow-[9px_9px_0_#0F3D2E]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE94A] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] mb-4">
            <UserIcon className="h-7 w-7 text-[#0F3D2E]" />
          </div>
          <h2 className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E] mb-2">
            Please Sign In
          </h2>
          <p className="text-sm font-medium text-[#0F3D2E]/70 mb-6">
            Your profile and attempt history are private. Please sign in to your account to view your performance metrics.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login">
              <Button className="bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="bg-[#FFFDF5] hover:bg-[#E3F9EE] text-[#0F3D2E] font-bold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      {/* Profile Header Card */}
      <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[9px_9px_0_#0F3D2E] mb-8 overflow-hidden">
        <div className="bg-[#E3F9EE] border-b-2 border-[#0F3D2E] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar className="h-20 w-20 border-[2.5px] border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]">
              <AvatarFallback className="bg-[#FFE94A] text-[#0F3D2E] font-black text-2xl">
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
                  {displayName}
                </h1>
                <span className="w-fit mx-auto sm:mx-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#0F3D2E] bg-[#FFE94A] text-[#0F3D2E]">
                  {isAuthenticated ? "Authenticated Member" : "Guest Mode"}
                </span>
              </div>

              <p className="text-sm font-medium text-[#0F3D2E]/70">{displayEmail}</p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-bold text-[#0F3D2E]/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#0F3D2E]" />
                  Active Learner
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1F9D6B]" />
                  {totalAttempts} Completed Quizzes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/quizzes">
                <Button size="sm" className="gap-2 bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
                  <BookOpen className="h-4 w-4" />
                  Take a Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-4 sm:p-5 shadow-[5px_5px_0_#0F3D2E] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0F3D2E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Quizzes Taken</span>
            <BookOpen className="h-4 w-4 text-[#0F3D2E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
            {totalAttempts}
          </div>
          <p className="text-[11px] font-medium text-[#0F3D2E]/60 mt-1">Total finished attempts</p>
        </div>

        <div className="rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#E3F9EE] p-4 sm:p-5 shadow-[5px_5px_0_#0F3D2E] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0F3D2E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Accuracy</span>
            <Target className="h-4 w-4 text-[#1F9D6B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
            {averagePercentage}%
          </div>
          <p className="text-[11px] font-medium text-[#0F3D2E]/70 mt-1">Across all quizzes</p>
        </div>

        <div className="rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFE94A]/30 p-4 sm:p-5 shadow-[5px_5px_0_#0F3D2E] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0F3D2E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Highest Score</span>
            <Trophy className="h-4 w-4 text-[#0F3D2E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
            {bestScore}%
          </div>
          <p className="text-[11px] font-medium text-[#0F3D2E]/70 mt-1">Personal best accuracy</p>
        </div>

        <div className="rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-4 sm:p-5 shadow-[5px_5px_0_#0F3D2E] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0F3D2E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Time Invested</span>
            <Clock className="h-4 w-4 text-[#0F3D2E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-[family-name:var(--font-mono)] font-bold text-[#0F3D2E]">
            {totalMinutes}m
          </div>
          <p className="text-[11px] font-medium text-[#0F3D2E]/60 mt-1">Total solving duration</p>
        </div>
      </div>

      {/* Attempt History Section */}
      <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[9px_9px_0_#0F3D2E] overflow-hidden">
        <div className="p-5 sm:p-6 pb-4 border-b-2 border-[#0F3D2E]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
                Attempt History
              </h2>
              <p className="text-xs font-medium text-[#0F3D2E]/70">
                Your past quiz attempts, accuracy scores, and completion records.
              </p>
            </div>

            <span className="text-xs font-bold text-[#0F3D2E] bg-[#E3F9EE] border border-[#0F3D2E] px-2.5 py-1 rounded-full shadow-[2px_2px_0_#0F3D2E]">
              ● Database Verified
            </span>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-[#0F3D2E] bg-[#E3F9EE] hover:bg-[#E3F9EE]">
                <TableHead className="font-extrabold text-[#0F3D2E] text-xs">Quiz</TableHead>
                <TableHead className="text-center font-extrabold text-[#0F3D2E] text-xs">Score</TableHead>
                <TableHead className="text-center font-extrabold text-[#0F3D2E] text-xs">Accuracy</TableHead>
                <TableHead className="text-center font-extrabold text-[#0F3D2E] text-xs">Duration</TableHead>
                <TableHead className="text-center font-extrabold text-[#0F3D2E] text-xs hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right pr-6 font-extrabold text-[#0F3D2E] text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => {
                const percentage = record.percentage ?? Math.round((record.score / record.totalQuestions) * 100);

                return (
                  <TableRow key={record.id} className="transition-colors hover:bg-[#E3F9EE]/40 border-b border-[#0F3D2E]/20">
                    <TableCell>
                      <div className="font-bold text-sm text-[#0F3D2E]">{record.quizTitle}</div>
                      <div className="text-xs text-[#0F3D2E]/70 font-medium flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{record.category || "General"}</span>
                        <span className="sm:hidden">&bull; {formatDate(record.completedAt)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-extrabold text-sm text-[#0F3D2E]">
                      {record.score} / {record.totalQuestions}
                    </TableCell>

                    <TableCell className="text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border border-[#0F3D2E] ${
                          percentage >= 80
                            ? "bg-[#E3F9EE] text-[#0F3D2E]"
                            : percentage >= 50
                            ? "bg-[#FFE94A] text-[#0F3D2E]"
                            : "bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-[family-name:var(--font-mono)] text-xs font-bold text-[#0F3D2E]">
                      {formatDuration(record.timeTaken)}
                    </TableCell>

                    <TableCell className="text-center text-xs font-medium text-[#0F3D2E]/70 hidden sm:table-cell">
                      {formatDate(record.completedAt)}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <Link href={`/quizzes/${record.quizId}/result?attemptId=${record.id}`}>
                        <Button
                          size="sm"
                          className="h-8 gap-1 text-xs bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-bold border border-[#0F3D2E] rounded-[6px] shadow-[2px_2px_0_#0F3D2E]"
                        >
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
                  <TableCell colSpan={6} className="h-32 text-center text-[#0F3D2E]">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <Trophy className="h-8 w-8 text-[#0F3D2E]/40" />
                      <p className="font-bold text-[#0F3D2E]">No quiz attempts yet</p>
                      <p className="text-xs text-[#0F3D2E]/70 max-w-sm">
                        Take your first quiz to begin tracking your scores, accuracy, and study history.
                      </p>
                      <Link href="/quizzes" className="mt-2">
                        <Button size="sm" className="bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[8px] shadow-[2px_2px_0_#0F3D2E]">
                          Browse Quizzes
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
