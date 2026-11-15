"use client";

import {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LeaderboardEntry, Quiz } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Clock,
  Search,
  ArrowRight,
  ArrowLeft,
  Zap,
  Loader2,
  Radio,
  CheckCircle2,
  Flame,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/client";

// Tower styles from 1st to 5th
const TOWER_STYLES = [
  "bg-[#FFE94A] text-[#0F3D2E]",
  "bg-[#0F3D2E] text-[#FFFDF5]",
  "bg-[#FFFDF5] text-[#0F3D2E]",
  "bg-[#1F9D6B] text-[#FFFDF5]",
  "bg-[#E3F9EE] text-[#0F3D2E]",
];

const CONFETTI = [
  { x: -70, y: -60, r: 200, c: "bg-[#FFE94A]" },
  { x: 60, y: -80, r: -160, c: "bg-[#0F3D2E]" },
  { x: -110, y: -20, r: 120, c: "bg-[#1F9D6B]" },
  { x: 100, y: -30, r: -220, c: "bg-[#FFFDF5] border border-[#0F3D2E]" },
  { x: -30, y: -110, r: 300, c: "bg-[#0F3D2E]" },
  { x: 30, y: -120, r: -90, c: "bg-[#FFE94A]" },
  { x: -90, y: -90, r: 60, c: "bg-[#FFFDF5] border border-[#0F3D2E]" },
  { x: 90, y: -100, r: 180, c: "bg-[#1F9D6B]" },
];

const formatTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
};

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

/** Counts numbers up smoothly */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const origin = from.current;
    const duration = reduce ? 0 : 700;
    let raf = 0;

    const tick = (now: number) => {
      const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(origin + (value - origin) * eased));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        from.current = value;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{shown}</>;
}

export function LeaderboardView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const urlQuizId = searchParams.get("quizId");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(urlQuizId);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [searchPlayer, setSearchPlayer] = useState("");
  const [searchQuiz, setSearchQuiz] = useState("");
  const [lastLiveEvent, setLastLiveEvent] = useState<string | null>(null);

  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const lastLeft = useRef(new Map<string, number>());

  // Sync state if urlQuizId changes
  useEffect(() => {
    setSelectedQuizId(urlQuizId);
  }, [urlQuizId]);

  // 1. Fetch real quizzes from database
  useEffect(() => {
    let active = true;
    async function loadQuizzes() {
      try {
        setLoadingQuizzes(true);
        const res = await fetch("/api/quizzes");
        const json = await res.json();
        if (active && res.ok && json.success && Array.isArray(json.data)) {
          setQuizzes(json.data);
        }
      } catch (err) {
        console.error("Failed to load quizzes:", err);
      } finally {
        if (active) setLoadingQuizzes(false);
      }
    }
    loadQuizzes();
    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch real authoritative leaderboard for selected quiz
  const fetchLeaderboard = useCallback(
    async (quizId: string) => {
      try {
        setLoadingScores(true);
        const res = await fetch(`/api/quizzes/${quizId}/leaderboard`);
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data)) {
          setEntries(json.data);
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setEntries([]);
      } finally {
        setLoadingScores(false);
      }
    },
    []
  );

  // Trigger leaderboard fetch whenever selectedQuizId changes
  useEffect(() => {
    if (selectedQuizId) {
      fetchLeaderboard(selectedQuizId);
    } else {
      setEntries([]);
    }
  }, [fetchLeaderboard, selectedQuizId]);

  // 3. Supabase Realtime Subscription: 100% Live updates without refreshing
  useEffect(() => {
    if (!selectedQuizId) return;

    const channelName = `realtime_scores_${selectedQuizId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
        },
        (payload: any) => {
          // If the score update belongs to the current quiz, refresh immediately!
          const record = (payload.new as any) || (payload.old as any);
          if (!record || !record.quiz_id || record.quiz_id === selectedQuizId) {
            setLastLiveEvent(new Date().toLocaleTimeString());
            fetchLeaderboard(selectedQuizId);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard, selectedQuizId, supabase]);

  // Active quiz metadata
  const activeQuiz = useMemo(() => {
    return quizzes.find((q) => q.id === selectedQuizId) || null;
  }, [quizzes, selectedQuizId]);

  // Filter players in table
  const filteredEntries = useMemo(() => {
    if (!searchPlayer.trim()) return entries;
    const q = searchPlayer.toLowerCase();
    return entries.filter(
      (e) =>
        e.userName.toLowerCase().includes(q) ||
        (e.rank && e.rank.toString().includes(q))
    );
  }, [entries, searchPlayer]);

  // Filter quizzes in directory
  const filteredQuizzes = useMemo(() => {
    if (!searchQuiz.trim()) return quizzes;
    const q = searchQuiz.toLowerCase();
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(q) ||
        quiz.category.toLowerCase().includes(q)
    );
  }, [quizzes, searchQuiz]);

  const towers = useMemo(() => entries.slice(0, 5), [entries]);
  const topScore = towers[0]?.score ?? 0;
  const lowScore = towers[towers.length - 1]?.score ?? 0;
  const towerHeight = (score: number) =>
    topScore === lowScore
      ? 280
      : 150 + ((score - lowScore) / (topScore - lowScore || 1)) * 220;

  // Fluid transition when podium places shuffle
  useLayoutEffect(() => {
    if (loadingScores) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    itemRefs.current.forEach((el, id) => {
      const left = el.getBoundingClientRect().left;
      next.set(id, left);
      const before = lastLeft.current.get(id);
      if (!reduce && before !== undefined && Math.abs(before - left) > 1) {
        el.animate(
          [
            { transform: `translateX(${before - left}px)` },
            { transform: "translateX(0)" },
          ],
          { duration: 650, easing: "cubic-bezier(0.2, 0.9, 0.25, 1.1)" }
        );
      }
    });
    lastLeft.current = next;
  });

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    router.push(`/leaderboard?quizId=${quizId}`, { scroll: false });
  };

  const handleBackToAllQuizzes = () => {
    setSelectedQuizId(null);
    router.push("/leaderboard", { scroll: false });
  };

  // =========================================================================
  // VIEW 1: All Quizzes Directory (Shown when clicking Leaderboard in Navbar)
  // =========================================================================
  if (!selectedQuizId) {
    return (
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-6 sm:p-8 shadow-[9px_9px_0_#0F3D2E]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] px-3.5 py-1 rounded-full text-xs font-black shadow-[2px_2px_0_#0F3D2E] mb-3">
                <Trophy className="h-3.5 w-3.5" />
                Live Competitive Arenas
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F3D2E]">
                Select a Quiz Leaderboard
              </h1>
              <p className="mt-1 text-sm sm:text-base font-medium text-[#0F3D2E]/80 max-w-xl">
                Choose any challenge below to inspect its dedicated standings, verified player scores, and real-time completion speeds.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D2E]/60" />
              <Input
                value={searchQuiz}
                onChange={(e) => setSearchQuiz(e.target.value)}
                placeholder="Search by topic or title..."
                className="pl-10 bg-[#FFFDF5] border-2 border-[#0F3D2E] rounded-[12px] font-bold shadow-[3px_3px_0_#0F3D2E] text-sm text-[#0F3D2E] placeholder:text-[#0F3D2E]/50"
              />
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {loadingQuizzes ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#0F3D2E]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="font-[family-name:var(--font-display)] font-bold text-lg">
              Loading real quiz arenas from database...
            </p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="rounded-[18px] border-[3px] border-dashed border-[#0F3D2E] bg-[#FFFDF5] p-12 text-center text-[#0F3D2E] shadow-[5px_5px_0_#0F3D2E]">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <p className="font-bold text-lg">No quizzes found matching &quot;{searchQuiz}&quot;</p>
            <Button
              onClick={() => setSearchQuiz("")}
              className="mt-4 bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E]"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[7px_7px_0_#0F3D2E] hover:shadow-[10px_10px_0_#0F3D2E] hover:-translate-y-1 transition-all flex flex-col justify-between p-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black bg-[#E3F9EE] text-[#0F3D2E] border-2 border-[#0F3D2E] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0_#0F3D2E]">
                      {quiz.category}
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] px-2 py-0.5 rounded-full shadow-[2px_2px_0_#0F3D2E]">
                      {quiz.difficulty}
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#0F3D2E] leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-[#0F3D2E]/75 line-clamp-2 font-medium leading-relaxed">
                    {quiz.description || "Timed challenge with instant grading and real-time rankings."}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold text-[#0F3D2E]/70 pt-2 border-t border-dashed border-[#0F3D2E]/20">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      {quiz.questionCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.round(quiz.timeLimit / 60)}m Limit
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-4 border-t-2 border-dashed border-[#0F3D2E]/20 flex gap-2">
                  <Button
                    onClick={() => handleSelectQuiz(quiz.id)}
                    className="flex-1 bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-black rounded-[10px] shadow-[3px_3px_0_#0F3D2E] hover:shadow-[5px_5px_0_#0F3D2E] active:translate-y-0.5 transition-all text-xs py-5"
                  >
                    <Trophy className="h-4 w-4 mr-1.5" />
                    View Leaderboard
                  </Button>
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button
                      variant="outline"
                      className="bg-[#FFFDF5] hover:bg-[#FFE94A]/40 text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[10px] shadow-[3px_3px_0_#0F3D2E] text-xs py-5 px-3"
                      title="Attempt Quiz"
                    >
                      <Zap className="h-4 w-4 text-[#0F3D2E]" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Dedicated Leaderboard for a Particular Quiz
  // =========================================================================
  return (
    <div className="container mx-auto max-w-6xl space-y-6">
      {/* Top Bar: Back to Quizzes + Horizontal Quick Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          onClick={handleBackToAllQuizzes}
          className="bg-[#FFFDF5] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-black rounded-[12px] shadow-[3px_3px_0_#0F3D2E] text-xs py-2 px-4 gap-2 transition-all self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          All Quiz Leaderboards
        </Button>

        {/* Quick Quiz Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {quizzes.map((q) => {
            const isSelected = q.id === selectedQuizId;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuiz(q.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-extrabold border-2 transition-all ${
                  isSelected
                    ? "bg-[#0F3D2E] text-[#FFE94A] border-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]"
                    : "bg-[#FFFDF5] text-[#0F3D2E] border-[#0F3D2E] hover:bg-[#FFE94A]"
                }`}
              >
                {q.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Quiz Banner */}
      <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 sm:p-7 shadow-[9px_9px_0_#0F3D2E] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black bg-[#E3F9EE] text-[#0F3D2E] border-2 border-[#0F3D2E] px-3 py-0.5 rounded-full shadow-[2px_2px_0_#0F3D2E]">
              {activeQuiz?.category || "Quiz Arena"}
            </span>
            {/* Live Indicator Badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-black bg-[#1F9D6B] text-[#FFFDF5] border-2 border-[#0F3D2E] px-3 py-0.5 rounded-full shadow-[2px_2px_0_#0F3D2E]">
              <span className="h-2 w-2 rounded-full bg-[#FFE94A] animate-ping" />
              100% Live Sync Active
            </span>
            {lastLiveEvent && (
              <span className="text-[11px] font-mono text-[#0F3D2E]/60">
                Updated: {lastLiveEvent}
              </span>
            )}
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F3D2E]">
            {activeQuiz?.title || "Quiz Leaderboard"}
          </h2>

          <p className="text-xs sm:text-sm font-medium text-[#0F3D2E]/75">
            Ranked by highest score, then fastest completion time. Standings update live as players finish!
          </p>
        </div>

        {activeQuiz && (
          <Link href={`/quizzes/${activeQuiz.id}`} className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-black rounded-[12px] shadow-[4px_4px_0_#0F3D2E] hover:shadow-[6px_6px_0_#0F3D2E] text-sm py-6 px-6 gap-2 transition-all">
              <Zap className="h-4 w-4 fill-[#0F3D2E]" />
              Challenge This Quiz
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Standings Content */}
      {loadingScores ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#0F3D2E]">
          <Loader2 className="h-9 w-9 animate-spin" />
          <p className="font-[family-name:var(--font-display)] font-extrabold text-xl">
            Fetching verified live standings...
          </p>
        </div>
      ) : entries.length === 0 ? (
        /* Empty State: No Submissions Yet */
        <div className="rounded-[18px] border-[3px] border-dashed border-[#0F3D2E] bg-[#FFFDF5] p-12 text-center text-[#0F3D2E] shadow-[6px_6px_0_#0F3D2E]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#0F3D2E] bg-[#FFE94A] shadow-[3px_3px_0_#0F3D2E]">
            <Trophy className="h-8 w-8 text-[#0F3D2E]" />
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-[#0F3D2E] mb-2">
            Be the First Champion!
          </h3>
          <p className="text-sm font-medium text-[#0F3D2E]/70 max-w-md mx-auto mb-6">
            No player has completed this quiz yet. Take the challenge now to claim Rank #1 on this dedicated leaderboard!
          </p>
          {activeQuiz && (
            <Link href={`/quizzes/${activeQuiz.id}`}>
              <Button className="bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-black rounded-[12px] shadow-[4px_4px_0_#0F3D2E] py-5 px-6 text-sm">
                Start Quiz Now →
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Top 5 Podium Capsule Towers */}
          {towers.length > 0 && (
            <section aria-label="Podium contenders" className="mb-8 pt-4">
              <ol className="flex items-end justify-center gap-2 sm:gap-4 max-w-4xl mx-auto">
                {towers.map((entry, i) => {
                  const id = `${entry.userId}_${entry.score}_${entry.timeTaken}`;
                  const isFirst = entry.rank === 1;
                  return (
                    <li
                      key={id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(id, el);
                        else itemRefs.current.delete(id);
                      }}
                      className="relative flex min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      {/* Champion Crown and Confetti */}
                      {isFirst && (
                        <>
                          <div className="mb-1 flex items-end gap-1">
                            <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
                              <path
                                d="M4 28 L8 8 L18 18 L24 4 L30 18 L40 8 L44 28 Z"
                                fill="#FFE94A"
                                stroke="#0F3D2E"
                                strokeWidth="3"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="-rotate-6 font-[family-name:var(--font-hand)] text-xl font-bold text-[#0F3D2E]">
                              champ!
                            </span>
                          </div>
                          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-8">
                            {CONFETTI.map((piece, k) => (
                              <i
                                key={k}
                                className={`qz-confetti absolute block h-2.5 w-2.5 ${piece.c}`}
                                style={
                                  {
                                    "--x": `${piece.x}px`,
                                    "--y": `${piece.y}px`,
                                    "--rot": `${piece.r}deg`,
                                    animationDelay: "1.1s",
                                  } as CSSProperties
                                }
                              />
                            ))}
                          </span>
                        </>
                      )}

                      {/* Score Value */}
                      <div className="relative mb-1.5 font-[family-name:var(--font-display)] text-lg sm:text-2xl font-extrabold text-[#0F3D2E]">
                        <CountUp value={entry.score} />
                        <span className="text-xs font-bold opacity-60"> pts</span>
                      </div>

                      {/* Animated Tower */}
                      <div
                        className={`relative w-full rounded-t-full border-[3px] border-b-0 border-[#0F3D2E] p-2 sm:p-3 text-center shadow-[4px_0_0_#0F3D2E] transition-all ${
                          TOWER_STYLES[i] || TOWER_STYLES[4]
                        }`}
                        style={{ height: towerHeight(entry.score) }}
                      >
                        <div className="flex h-full flex-col items-center justify-between">
                          <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-current font-extrabold text-xs sm:text-sm">
                            #{entry.rank}
                          </span>

                          <div className="flex flex-col items-center gap-1 pb-1">
                            <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-current">
                              <AvatarFallback className="font-extrabold text-xs sm:text-sm bg-transparent text-current">
                                {entry.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-[family-name:var(--font-display)] text-[11px] sm:text-xs font-extrabold truncate max-w-[65px] sm:max-w-[100px]">
                              {entry.userName}
                            </span>
                            <span className="font-mono text-[10px] font-bold opacity-80">
                              {formatTime(entry.timeTaken)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tower Base Line */}
                      <div className="w-full border-t-[3px] border-[#0F3D2E]" />
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* Complete Live Standings Table */}
          <div className="rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 sm:p-6 shadow-[9px_9px_0_#0F3D2E]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#0F3D2E]">
                  All Verified Standings ({entries.length} {entries.length === 1 ? "Player" : "Players"})
                </h3>
                <p className="text-xs text-[#0F3D2E]/70 font-medium">
                  Real submissions recorded directly from the Supabase attempts table.
                </p>
              </div>

              {/* Player search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0F3D2E]/60" />
                <Input
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value)}
                  placeholder="Filter by player name..."
                  className="pl-9 h-9 bg-[#FFFDF5] border-2 border-[#0F3D2E] rounded-[10px] font-bold text-xs shadow-[2px_2px_0_#0F3D2E]"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-[12px] border-2 border-[#0F3D2E]">
              <Table>
                <TableHeader className="bg-[#E3F9EE] border-b-2 border-[#0F3D2E]">
                  <TableRow className="border-b-2 border-[#0F3D2E] hover:bg-transparent">
                    <TableHead className="w-16 font-extrabold text-[#0F3D2E] text-xs">Rank</TableHead>
                    <TableHead className="font-extrabold text-[#0F3D2E] text-xs">Player</TableHead>
                    <TableHead className="font-extrabold text-[#0F3D2E] text-xs text-right">Points</TableHead>
                    <TableHead className="font-extrabold text-[#0F3D2E] text-xs text-right">Time Taken</TableHead>
                    <TableHead className="font-extrabold text-[#0F3D2E] text-xs text-right hidden sm:table-cell">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const isCurrentUser = user && (user.name === entry.userName || user.id === entry.userId);
                    return (
                      <TableRow
                        key={`${entry.userId}_${entry.rank}_${entry.timeTaken}`}
                        className={`border-b border-[#0F3D2E]/20 transition-colors ${
                          isCurrentUser
                            ? "bg-[#FFE94A]/40 font-bold"
                            : "hover:bg-[#E3F9EE]/50"
                        }`}
                      >
                        <TableCell className="font-[family-name:var(--font-display)] font-extrabold text-[#0F3D2E]">
                          <span
                            className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-extrabold border-2 border-[#0F3D2E] shadow-[1px_1px_0_#0F3D2E] ${
                              entry.rank === 1
                                ? "bg-[#FFE94A] text-[#0F3D2E]"
                                : entry.rank === 2
                                ? "bg-[#FFFDF5] text-[#0F3D2E]"
                                : entry.rank === 3
                                ? "bg-[#E3F9EE] text-[#0F3D2E]"
                                : "bg-transparent text-[#0F3D2E]"
                            }`}
                          >
                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border-2 border-[#0F3D2E] shadow-[1px_1px_0_#0F3D2E]">
                              <AvatarFallback className="bg-[#FFE94A] text-[#0F3D2E] font-black text-xs">
                                {entry.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-[#0F3D2E]">
                                {entry.userName}
                                {isCurrentUser && (
                                  <span className="ml-1.5 text-[10px] bg-[#0F3D2E] text-[#FFE94A] px-1.5 py-0.2 rounded-full font-black">
                                    YOU
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-[family-name:var(--font-display)] font-extrabold text-base text-[#0F3D2E]">
                          {entry.score}
                          <span className="text-xs font-medium text-[#0F3D2E]/60"> pts</span>
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-xs text-[#0F3D2E]">
                          <span className="inline-flex items-center gap-1 bg-[#FFFDF5] border border-[#0F3D2E] px-2 py-0.5 rounded-md shadow-[1px_1px_0_#0F3D2E]">
                            <Clock className="h-3 w-3 text-[#0F3D2E]/70" />
                            {formatTime(entry.timeTaken)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right text-xs text-[#0F3D2E]/70 font-medium hidden sm:table-cell">
                          {formatDate(entry.completedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
