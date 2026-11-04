"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockLeaderboard as initialLeaderboard, mockQuizzes } from "@/data/mock";
import { LeaderboardEntry, Quiz } from "@/types";
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
  Flame,
  Award,
  Zap,
  CheckCircle2,
  HelpCircle,
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
        difficulty: "medium",
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
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header with Authentic Quiz Arena Micro-copy */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-2">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
            Per-Quiz Arena Hall of Fame
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Quiz Leaderboards
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1 max-w-2xl">
            Each quiz features an independent competitive leaderboard. Rankings are calculated by maximum accuracy and fastest completion time.
          </p>
        </div>

        {/* Live sync & Status */}
        <div className="flex items-center gap-3">
          <Button
            variant={isLiveActive ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className="gap-2"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isLiveActive ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"
              }`}
            />
            {isLiveActive ? "Live Sync Active" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Quiz Switcher Navigation Pills (One Leaderboard for EVERY Quiz) */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Trophy className="h-3.5 w-3.5 text-[#CC5500]" />
            Select Quiz Leaderboard:
          </span>
          <span>{mockQuizzes.length} Quizzes Available</span>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border bg-card/80 shadow-xs">
          {mockQuizzes.map((quiz) => {
            const isSelected = quiz.id === selectedQuizId;
            return (
              <button
                key={quiz.id}
                onClick={() => handleSelectQuiz(quiz.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#CC5500] text-white shadow-sm font-semibold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <span>{quiz.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-background text-muted-foreground"
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
      <Card className="mb-10 border-border/80 bg-gradient-to-r from-card via-card to-primary/5 shadow-xs">
        <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-semibold text-[#CC5500] border-[#CC5500]/30 bg-[#CC5500]/5">
                Current Standings
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize font-medium">
                {selectedQuiz.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                • {selectedQuiz.questionCount} Questions
              </span>
              <span className="text-xs text-muted-foreground">
                • {Math.round(selectedQuiz.timeLimit / 60)} min limit
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {selectedQuiz.title} — Hall of Fame
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {selectedQuiz.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link href={attemptQuizHref}>
              <Button className="w-full sm:w-auto gap-2 bg-[#CC5500] hover:bg-[#B34700] text-white shadow-xs font-semibold">
                <Zap className="h-4 w-4 fill-white" />
                Challenge This Quiz
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Dedicated Top 3 Podium for this specific Quiz */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
          {/* Rank 2 - Silver */}
          {second && (
            <Card className="order-2 md:order-1 border-border/80 bg-gradient-to-t from-slate-400/10 to-card shadow-sm text-center">
              <CardContent className="pt-6 pb-6 space-y-1">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xl mb-3 border-2 border-slate-400">
                  <Medal className="h-8 w-8 text-slate-400" />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-white text-xs font-bold">
                    2
                  </span>
                </div>
                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  🥈 Silver Rank
                </div>
                <h3 className="font-bold text-lg line-clamp-1">{second.userName}</h3>
                <div className="text-2xl font-black text-foreground pt-1">
                  {second.score} / {second.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time: {formatTime(second.timeTaken)}
                </p>
                <Badge variant="outline" className="text-[10px] mt-1 text-slate-600 border-slate-300">
                  Accuracy: {Math.round((second.score / second.totalQuestions) * 100)}%
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Rank 1 - Champion Gold */}
          {first && (
            <Card className="order-1 md:order-2 border-amber-500/50 bg-gradient-to-t from-amber-500/15 via-background to-card shadow-lg text-center transform md:-translate-y-3">
              <div className="bg-[#CC5500] text-white font-bold text-xs py-1.5 tracking-wider uppercase flex items-center justify-center gap-1.5">
                <Award className="h-4 w-4" />
                👑 {selectedQuiz.title} Champion
              </div>
              <CardContent className="pt-6 pb-6 space-y-1">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-[#CC5500] font-black text-2xl mb-3 border-2 border-amber-500 shadow-xs">
                  <Trophy className="h-10 w-10 text-amber-500" />
                </div>
                <div className="text-xs uppercase font-bold text-[#CC5500] tracking-wider">
                  🥇 First Place
                </div>
                <h3 className="font-extrabold text-xl line-clamp-1">{first.userName}</h3>
                <div className="text-3xl font-black text-[#CC5500] pt-1">
                  {first.score} / {first.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Record Time: {formatTime(first.timeTaken)}
                </p>
                <Badge className="text-[11px] mt-1 bg-[#CC5500] text-white">
                  Accuracy: {Math.round((first.score / first.totalQuestions) * 100)}%
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Rank 3 - Bronze */}
          {third && (
            <Card className="order-3 border-border/80 bg-gradient-to-t from-amber-800/10 to-card shadow-sm text-center">
              <CardContent className="pt-6 pb-6 space-y-1">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-800/20 text-amber-800 dark:text-amber-600 font-black text-xl mb-3 border-2 border-amber-700/50">
                  <Medal className="h-8 w-8 text-amber-700" />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-800 text-white text-xs font-bold">
                    3
                  </span>
                </div>
                <div className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                  🥉 Bronze Rank
                </div>
                <h3 className="font-bold text-lg line-clamp-1">{third.userName}</h3>
                <div className="text-2xl font-black text-foreground pt-1">
                  {third.score} / {third.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time: {formatTime(third.timeTaken)}
                </p>
                <Badge variant="outline" className="text-[10px] mt-1 text-amber-700 border-amber-400">
                  Accuracy: {Math.round((third.score / third.totalQuestions) * 100)}%
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Table Card for this specific Quiz */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                Standings for &quot;{selectedQuiz.title}&quot;
              </CardTitle>
              <CardDescription className="text-xs">
                Showing rankings of all registered contenders for this quiz only
              </CardDescription>
            </div>

            {/* Search filter within this quiz's leaderboard */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Contender</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
                <TableHead className="text-right pr-6">Time Taken</TableHead>
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
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="text-center font-bold">
                      {entry.rank === 1 ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-[#CC5500] font-extrabold text-sm">
                          🥇
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-400/20 text-slate-600 font-extrabold text-sm">
                          🥈
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-500 font-extrabold text-sm">
                          🥉
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm font-medium">
                          #{entry.rank}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {entry.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold text-sm">
                            {entry.userName}
                          </span>
                          {entry.rank === 1 && (
                            <span className="ml-2 text-[10px] text-[#CC5500] font-bold">
                              👑 Leader
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-bold text-sm">{entry.score}</span>
                      <span className="text-xs text-muted-foreground">
                        /{entry.totalQuestions}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          accuracy >= 80
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {accuracy}%
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-6 font-mono text-xs text-muted-foreground">
                      {formatTime(entry.timeTaken)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredLeaderboard.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Trophy className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-medium text-foreground">
                        No contender records for this quiz yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Be the first to complete &quot;{selectedQuiz.title}&quot; and claim the #1 spot!
                      </p>
                      <Link href={attemptQuizHref} className="mt-1">
                        <Button size="sm" variant="outline">
                          Start Quiz Now
                        </Button>
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
