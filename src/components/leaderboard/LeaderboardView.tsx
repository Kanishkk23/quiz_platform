"use client";

import { useState, useEffect } from "react";
import { mockLeaderboard as initialLeaderboard } from "@/data/mock";
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
  Sparkles,
  Radio,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

const randomCandidates = [
  { name: "Devansh Rao", score: 9, timeTaken: 210 },
  { name: "Tanvi Saxena", score: 8, timeTaken: 290 },
  { name: "Rohan Kulkarni", score: 10, timeTaken: 330 },
  { name: "Siddharth Jain", score: 9, timeTaken: 240 },
  { name: "Aishwarya Iyer", score: 7, timeTaken: 310 },
  { name: "Mohit Chawla", score: 8, timeTaken: 260 },
];

export function LeaderboardView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  // Simulated live real-time score additions
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      // Pick a random event to simulate real-time updates
      const candidate = randomCandidates[Math.floor(Math.random() * randomCandidates.length)];
      const newEntry: LeaderboardEntry = {
        rank: 0,
        userId: "live_" + Date.now(),
        userName: candidate.name,
        score: candidate.score,
        totalQuestions: 10,
        timeTaken: candidate.timeTaken + Math.floor(Math.random() * 40 - 20),
        completedAt: new Date().toISOString(),
      };

      setLeaderboard((prev) => {
        // Add new entry, sort by score DESC, then by timeTaken ASC
        const merged = [...prev, newEntry];
        const uniqueByName = Array.from(
          new Map(merged.map((item) => [item.userName, item])).values()
        );

        uniqueByName.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.timeTaken - b.timeTaken;
        });

        // Reassign ranks
        return uniqueByName.map((entry, idx) => ({
          ...entry,
          rank: idx + 1,
        }));
      });

      setLastUpdated(new Date().toLocaleTimeString());
    }, 12000); // Trigger update periodically

    return () => clearInterval(interval);
  }, [isLiveActive]);

  const handleManualSimulation = () => {
    const candidate = randomCandidates[Math.floor(Math.random() * randomCandidates.length)];
    const newEntry: LeaderboardEntry = {
      rank: 0,
      userId: "sim_" + Date.now(),
      userName: candidate.name,
      score: 10,
      totalQuestions: 10,
      timeTaken: candidate.timeTaken,
      completedAt: new Date().toISOString(),
    };

    setLeaderboard((prev) => {
      const merged = [newEntry, ...prev];
      const uniqueByName = Array.from(
        new Map(merged.map((item) => [item.userName, item])).values()
      );

      uniqueByName.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeTaken - b.timeTaken;
      });

      return uniqueByName.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));
    });

    setLastUpdated(new Date().toLocaleTimeString());
  };

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-2">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
            Live Realtime Updates
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            See how top contenders rank by accuracy and speed. Live syncs automatically.
          </p>
        </div>

        {/* Live sync controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSimulation}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Simulate Live Submission
          </Button>

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
            {isLiveActive ? "Live Connected" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
          {/* 2nd Place */}
          {second && (
            <Card className="order-2 md:order-1 border-border/80 bg-gradient-to-t from-slate-500/10 to-card shadow-sm text-center">
              <CardContent className="pt-6 pb-6">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xl mb-3 border-2 border-slate-400">
                  <Medal className="h-8 w-8 text-slate-400" />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-white text-xs font-bold">
                    2
                  </span>
                </div>
                <h3 className="font-bold text-lg">{second.userName}</h3>
                <div className="text-2xl font-black text-foreground mt-1">
                  {second.score} / {second.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(second.timeTaken)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 1st Place Champion */}
          {first && (
            <Card className="order-1 md:order-2 border-amber-500/50 bg-gradient-to-t from-amber-500/15 via-background to-card shadow-lg text-center transform md:-translate-y-3">
              <div className="bg-amber-500 text-amber-950 font-bold text-xs py-1 tracking-wider uppercase">
                👑 Champion &bull; Rank 1
              </div>
              <CardContent className="pt-6 pb-6">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 font-black text-2xl mb-3 border-2 border-amber-500">
                  <Trophy className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="font-extrabold text-xl">{first.userName}</h3>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {first.score} / {first.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(first.timeTaken)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 3rd Place */}
          {third && (
            <Card className="order-3 border-border/80 bg-gradient-to-t from-amber-700/10 to-card shadow-sm text-center">
              <CardContent className="pt-6 pb-6">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-600 font-black text-xl mb-3 border-2 border-amber-700/50">
                  <Medal className="h-8 w-8 text-amber-700" />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-800 text-white text-xs font-bold">
                    3
                  </span>
                </div>
                <h3 className="font-bold text-lg">{third.userName}</h3>
                <div className="text-2xl font-black text-foreground mt-1">
                  {third.score} / {third.totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(third.timeTaken)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Standings</CardTitle>
              <CardDescription className="text-xs">
                Updated at {lastUpdated}
              </CardDescription>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participant..."
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
                <TableHead>Participant</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
                <TableHead className="text-right pr-6">Time Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaderboard.map((entry) => {
                const accuracy = Math.round((entry.score / entry.totalQuestions) * 100);

                return (
                  <TableRow key={entry.userId} className="transition-colors hover:bg-muted/40">
                    <TableCell className="text-center font-bold">
                      {entry.rank === 1 ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 font-extrabold text-sm">
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
                        <span className="text-muted-foreground text-sm">#{entry.rank}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {entry.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{entry.userName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-bold text-sm">
                        {entry.score}
                      </span>
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
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                    No participants matching &quot;{searchQuery}&quot;
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
