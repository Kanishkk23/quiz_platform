"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockLeaderboard as initialLeaderboard, mockQuizzes } from "@/data/mock";
import { LeaderboardEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Trophy,
  Medal,
  Clock,
  Search,
  Radio,
  Sparkles,
  ArrowRight,
  Award,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LeaderboardView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const urlQuizId = searchParams.get("quizId");
  const defaultQuizId = urlQuizId || mockQuizzes[0]?.id || "1";

  const [selectedQuizId, setSelectedQuizId] = useState<string>(defaultQuizId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Update selectedQuizId if URL changes
  useEffect(() => {
    if (urlQuizId && urlQuizId !== selectedQuizId) {
      setSelectedQuizId(urlQuizId);
    }
  }, [urlQuizId, selectedQuizId]);

  const selectedQuiz = useMemo(() => {
    return (
      mockQuizzes.find((q) => q.id === selectedQuizId) ||
      mockQuizzes[0] || {
        id: "1",
        title: "Quiz",
        description: "",
        category: "General",
        difficulty: "medium" as const,
        questionCount: 10,
        timeLimit: 600,
        createdAt: "",
      }
    );
  }, [selectedQuizId]);

  // Load static mock entries for this quiz + any attempts saved in localStorage
  const currentQuizEntries = useMemo(() => {
    // 1. Initial mock entries matching this quiz
    const baseEntries = initialLeaderboard.filter(
      (entry) => entry.quizId === selectedQuizId
    );

    // 2. Custom local storage entries completed on this device
    let customEntries: LeaderboardEntry[] = [];
    try {
      const customStr = localStorage.getItem(`quiz_leaderboard_custom_${selectedQuizId}`);
      if (customStr) {
        customEntries = JSON.parse(customStr);
      }
    } catch {
      // ignore
    }

    // Combine and deduplicate
    const combined = [...baseEntries, ...customEntries];

    // Sort by score desc, then by timeTaken asc (faster time wins tiebreaker)
    combined.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTaken - b.timeTaken;
    });

    // Re-assign ranks 1..N
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [selectedQuizId]);

  const filteredLeaderboard = useMemo(() => {
    return currentQuizEntries.filter((entry) =>
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentQuizEntries, searchQuery]);

  const topThree = currentQuizEntries.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    router.push(`/leaderboard?quizId=${quizId}`, { scroll: false });
  };

  const attemptQuizHref = isAuthenticated
    ? `/quizzes/${selectedQuiz.id}`
    : `/login?redirect=/quizzes/${selectedQuiz.id}`;

  return (
    <div className="container mx-auto max-w-6xl">
      {/* Header with Study Lab Micro-copy */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[#0F3D2E] bg-[#FFFDF5] text-[#0F3D2E] px-4 py-1 text-xs font-bold -rotate-1 shadow-[2px_2px_0_#0F3D2E] mb-3">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#1F9D6B]" />
            Per-Quiz Arena Hall of Fame
          </span>
          <h1 className="text-3xl font-[family-name:var(--font-display)] font-extrabold tracking-tight sm:text-4xl md:text-5xl text-[#0F3D2E]">
            Quiz Leaderboards
          </h1>
          <p className="text-[#0F3D2E]/80 text-sm sm:text-base mt-1 max-w-2xl font-medium">
            Each quiz features an independent competitive leaderboard. Rankings are calculated by maximum accuracy and fastest completion time.
          </p>
        </div>

        {/* Live sync & Status */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`gap-2 rounded-[10px] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] font-bold text-xs ${
              isLiveActive ? "bg-[#E3F9EE] text-[#0F3D2E]" : "bg-[#FFFDF5] text-[#0F3D2E]/60"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isLiveActive ? "bg-[#1F9D6B] animate-ping" : "bg-[#0F3D2E]/40"
              }`}
            />
            {isLiveActive ? "Live Sync Active" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Empty State when no quizzes exist in database yet */}
      {mockQuizzes.length === 0 ? (
        <div className="rounded-[18px] border-[3px] border-dashed border-[#0F3D2E] bg-[#FFFDF5] p-12 text-center text-[#0F3D2E] shadow-[5px_5px_0_#0F3D2E]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE94A] border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] mb-4">
            <Trophy className="h-7 w-7 text-[#0F3D2E]" />
          </div>
          <h2 className="text-xl font-[family-name:var(--font-display)] font-extrabold tracking-tight mb-1">
            No Leaderboard Data Yet
          </h2>
          <p className="text-sm font-medium text-[#0F3D2E]/70 max-w-md mx-auto mb-4">
            Leaderboards will automatically activate and rank contenders as soon as quizzes are published from the database.
          </p>
          <Link href="/quizzes">
            <Button className="bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
              Browse Quizzes
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Quiz Switcher Navigation Pills (One Leaderboard for EVERY Quiz) */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F3D2E] px-1">
              <span className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-[#0F3D2E]" />
                Select Quiz Leaderboard:
              </span>
              <span>{mockQuizzes.length} Quizzes Available</span>
            </div>

            <div className="flex flex-wrap gap-2 p-2 rounded-[14px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[4px_4px_0_#0F3D2E]">
              {mockQuizzes.map((quiz) => {
                const isSelected = quiz.id === selectedQuizId;
                return (
                  <button
                    key={quiz.id}
                    onClick={() => handleSelectQuiz(quiz.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                        : "bg-[#E3F9EE] hover:bg-[#FFFDF5] text-[#0F3D2E]/80 hover:text-[#0F3D2E] border border-[#0F3D2E]/30"
                    }`}
                  >
                    <span>{quiz.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase font-extrabold ${
                        isSelected
                          ? "bg-[#0F3D2E] text-white"
                          : "bg-[#FFFDF5] text-[#0F3D2E]/70 border border-[#0F3D2E]/20"
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Quiz Overview & Call to Action Card */}
          <div className="mb-10 rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 sm:p-6 shadow-[9px_9px_0_#0F3D2E] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-[#0F3D2E] border-2 border-[#0F3D2E] bg-[#FFE94A] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0_#0F3D2E]">
                  Current Standings
                </span>
                <span className="text-xs capitalize font-bold text-[#0F3D2E] bg-[#E3F9EE] border border-[#0F3D2E] px-2 py-0.5 rounded-full">
                  {selectedQuiz.category}
                </span>
                <span className="text-xs text-[#0F3D2E]/70 font-semibold">
                  • {selectedQuiz.questionCount} Questions
                </span>
                <span className="text-xs text-[#0F3D2E]/70 font-semibold">
                  • {Math.round(selectedQuiz.timeLimit / 60)} min limit
                </span>
              </div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
                {selectedQuiz.title} — Hall of Fame
              </h2>
              <p className="text-xs sm:text-sm text-[#0F3D2E]/80 max-w-xl font-medium">
                {selectedQuiz.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link href={attemptQuizHref}>
                <Button className="w-full sm:w-auto gap-2 bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[10px] shadow-[3px_3px_0_#0F3D2E]">
                  <Zap className="h-4 w-4 fill-[#0F3D2E]" />
                  Challenge This Quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Dedicated Top 3 Podium for this specific Quiz */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
              {/* Rank 2 - Silver */}
              {second && (
                <div className="order-2 md:order-1 rounded-[16px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-6 shadow-[6px_6px_0_#0F3D2E] text-center space-y-1">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E3F9EE] border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] mb-3">
                    <Medal className="h-8 w-8 text-[#0F3D2E]" />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F3D2E] text-white text-xs font-extrabold">
                      2
                    </span>
                  </div>
                  <div className="text-xs uppercase font-extrabold text-[#0F3D2E]/80 tracking-wider">
                    🥈 Silver Rank
                  </div>
                  <h3 className="font-bold text-lg text-[#0F3D2E] line-clamp-1">{second.userName}</h3>
                  <div className="text-2xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E] pt-1">
                    {second.score} / {second.totalQuestions}
                  </div>
                  <p className="text-xs text-[#0F3D2E]/70 flex items-center justify-center gap-1 font-mono font-medium">
                    <Clock className="h-3 w-3" />
                    Time: {formatTime(second.timeTaken)}
                  </p>
                  <span className="inline-block text-[11px] mt-2 font-bold px-2 py-0.5 rounded-full bg-[#E3F9EE] border border-[#0F3D2E] text-[#0F3D2E]">
                    Accuracy: {Math.round((second.score / second.totalQuestions) * 100)}%
                  </span>
                </div>
              )}

              {/* Rank 1 - Champion Gold */}
              {first && (
                <div className="order-1 md:order-2 rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[9px_9px_0_#0F3D2E] text-center transform md:-translate-y-3 overflow-hidden">
                  <div className="bg-[#0F3D2E] text-[#FFE94A] font-extrabold text-xs py-2 tracking-wider uppercase flex items-center justify-center gap-1.5 border-b-2 border-[#0F3D2E]">
                    <Award className="h-4 w-4" />
                    👑 {selectedQuiz.title} Champion
                  </div>
                  <div className="p-6 space-y-1">
                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFE94A] border-2 border-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] mb-3">
                      <Trophy className="h-10 w-10 text-[#0F3D2E]" />
                    </div>
                    <div className="text-xs uppercase font-extrabold text-[#0F3D2E] tracking-wider">
                      🥇 First Place
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[#0F3D2E] line-clamp-1">
                      {first.userName}
                    </h3>
                    <div className="text-3xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E] pt-1">
                      {first.score} / {first.totalQuestions}
                    </div>
                    <p className="text-xs text-[#0F3D2E]/80 flex items-center justify-center gap-1 font-mono font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      Record Time: {formatTime(first.timeTaken)}
                    </p>
                    <span className="inline-block text-xs mt-2 font-extrabold px-3 py-1 rounded-full bg-[#FFE94A] border-2 border-[#0F3D2E] text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]">
                      Accuracy: {Math.round((first.score / first.totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 3 - Bronze */}
              {third && (
                <div className="order-3 rounded-[16px] border-[2.5px] border-[#0F3D2E] bg-[#FFFDF5] p-6 shadow-[6px_6px_0_#0F3D2E] text-center space-y-1">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE94A]/40 border-2 border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] mb-3">
                    <Medal className="h-8 w-8 text-[#0F3D2E]" />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F3D2E] text-white text-xs font-extrabold">
                      3
                    </span>
                  </div>
                  <div className="text-xs uppercase font-extrabold text-[#0F3D2E]/80 tracking-wider">
                    🥉 Bronze Rank
                  </div>
                  <h3 className="font-bold text-lg text-[#0F3D2E] line-clamp-1">{third.userName}</h3>
                  <div className="text-2xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E] pt-1">
                    {third.score} / {third.totalQuestions}
                  </div>
                  <p className="text-xs text-[#0F3D2E]/70 flex items-center justify-center gap-1 font-mono font-medium">
                    <Clock className="h-3 w-3" />
                    Time: {formatTime(third.timeTaken)}
                  </p>
                  <span className="inline-block text-[11px] mt-2 font-bold px-2 py-0.5 rounded-full bg-[#E3F9EE] border border-[#0F3D2E] text-[#0F3D2E]">
                    Accuracy: {Math.round((third.score / third.totalQuestions) * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Main Table Card for this specific Quiz */}
          <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[9px_9px_0_#0F3D2E] overflow-hidden">
            <div className="p-5 sm:p-6 pb-4 border-b-2 border-[#0F3D2E]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
                    Standings for &quot;{selectedQuiz.title}&quot;
                  </h3>
                  <p className="text-xs font-medium text-[#0F3D2E]/70">
                    Showing rankings of all registered contenders for this quiz only
                  </p>
                </div>

                {/* Search filter within this quiz's leaderboard */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D2E]/60" />
                  <Input
                    placeholder="Search contender..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-[#FFFDF5] border-2 border-[#0F3D2E] rounded-[8px] text-[#0F3D2E] placeholder:text-[#0F3D2E]/40 font-medium text-xs focus-visible:ring-[#0F3D2E]"
                  />
                </div>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-[#0F3D2E] bg-[#E3F9EE] hover:bg-[#E3F9EE]">
                    <TableHead className="w-16 text-center font-extrabold text-[#0F3D2E] text-xs">Rank</TableHead>
                    <TableHead className="font-extrabold text-[#0F3D2E] text-xs">Contender</TableHead>
                    <TableHead className="text-center font-extrabold text-[#0F3D2E] text-xs">Score</TableHead>
                    <TableHead className="text-center font-extrabold text-[#0F3D2E] text-xs">Accuracy</TableHead>
                    <TableHead className="text-right pr-6 font-extrabold text-[#0F3D2E] text-xs">Time Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaderboard.map((entry) => {
                    const accuracy = Math.round(
                      (entry.score / entry.totalQuestions) * 100
                    );

                    return (
                      <TableRow
                        key={`${entry.userId}_${entry.rank}`}
                        className="transition-colors hover:bg-[#E3F9EE]/40 border-b border-[#0F3D2E]/20"
                      >
                        <TableCell className="text-center font-bold">
                          {entry.rank === 1 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE94A] border border-[#0F3D2E] font-extrabold text-sm">
                              🥇
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E3F9EE] border border-[#0F3D2E] font-extrabold text-sm">
                              🥈
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE94A]/40 border border-[#0F3D2E] font-extrabold text-sm">
                              🥉
                            </span>
                          ) : (
                            <span className="text-[#0F3D2E]/70 text-sm font-bold font-mono">
                              #{entry.rank}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-[#0F3D2E]">
                              <AvatarFallback className="bg-[#FFE94A] text-[#0F3D2E] text-xs font-extrabold">
                                {entry.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-sm text-[#0F3D2E]">
                                {entry.userName}
                              </span>
                              {entry.rank === 1 && (
                                <span className="ml-2 text-[10px] text-[#0F3D2E] bg-[#FFE94A] px-2 py-0.5 rounded-full border border-[#0F3D2E] font-extrabold">
                                  👑 Leader
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="font-extrabold text-sm text-[#0F3D2E]">{entry.score}</span>
                          <span className="text-xs text-[#0F3D2E]/60 font-semibold">
                            /{entry.totalQuestions}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border border-[#0F3D2E] ${
                              accuracy >= 80
                                ? "bg-[#E3F9EE] text-[#0F3D2E]"
                                : "bg-[#FFFDF5] text-[#0F3D2E]/80"
                            }`}
                          >
                            {accuracy}%
                          </span>
                        </TableCell>

                        <TableCell className="text-right pr-6 font-[family-name:var(--font-mono)] text-xs font-bold text-[#0F3D2E]">
                          {formatTime(entry.timeTaken)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {filteredLeaderboard.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-[#0F3D2E] text-sm"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Trophy className="h-8 w-8 text-[#0F3D2E]/40" />
                          <p className="font-bold text-[#0F3D2E]">
                            No contender records for this quiz yet
                          </p>
                          <p className="text-xs text-[#0F3D2E]/70">
                            Be the first to complete &quot;{selectedQuiz.title}&quot; and claim the #1 spot!
                          </p>
                          <Link href={attemptQuizHref} className="mt-1">
                            <Button size="sm" className="bg-[#FFE94A] hover:bg-[#FFE94A]/90 text-[#0F3D2E] font-extrabold border-2 border-[#0F3D2E] rounded-[8px] shadow-[2px_2px_0_#0F3D2E]">
                              Start Quiz Now
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
        </>
      )}
    </div>
  );
}
