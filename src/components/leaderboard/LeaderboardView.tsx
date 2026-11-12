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
import { mockLeaderboard as initialLeaderboard, mockQuizzes } from "@/data/mock";
import { LeaderboardEntry } from "@/types";
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
import { Trophy, Clock, Search, ArrowRight, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LeaderboardMotionPreview } from "@/components/leaderboard/LeaderboardMotionPreview";
import { createClient } from "@/lib/client";

// One style per tower, 1st to 5th
const TOWER_STYLES = [
  "bg-[#FFE94A] text-[#0F3D2E]",
  "bg-[#0F3D2E] text-[#FFFDF5]",
  "bg-[#FFFDF5] text-[#0F3D2E]",
  "bg-[#1F9D6B] text-[#FFFDF5]",
  "bg-[#E3F9EE] text-[#0F3D2E]",
];

// Confetti pieces fired around the champion
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

const entryKey = (e: LeaderboardEntry) => `${e.userId}_${e.timeTaken}`;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
};

/** Counts a number up smoothly whenever it changes. */
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

/** Loader shown while standings load: pulsing dashed capsules. */
function BoardSkeleton() {
  const heights = [300, 380, 240, 200, 160];
  return (
    <div role="status" aria-live="polite" className="mb-10">
      <ol className="flex items-end gap-2 sm:gap-4">
        {heights.map((h, i) => (
          <li key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end">
            <div
              className="w-full animate-pulse rounded-t-full border-[3px] border-b-0 border-dashed border-[#0F3D2E]/60 bg-[#0F3D2E]/10"
              style={{ height: h, animationDelay: `${i * 120}ms` }}
            />
            <div className="w-full border-t-[3px] border-[#0F3D2E] pt-2">
              <div className="mx-auto h-5 w-2/3 animate-pulse rounded bg-[#0F3D2E]/15" />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 flex items-center gap-2 font-[family-name:var(--font-hand)] text-2xl text-[#0F3D2E]">
        <Loader2 className="h-5 w-5 animate-spin" />
        counting the points…
      </p>
      <span className="sr-only">Loading standings</span>
    </div>
  );
}

export function LeaderboardView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const urlQuizId = searchParams.get("quizId");
  const selectedQuizId = urlQuizId || mockQuizzes[0]?.id || "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [storedEntries, setStoredEntries] = useState<{
    quizId: string;
    entries: LeaderboardEntry[];
  }>({ quizId: selectedQuizId, entries: [] });
  const supabase = useMemo(() => createClient(), []);

  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const lastLeft = useRef(new Map<string, number>());

  // First load: show the loader briefly
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(
    () => () => {
      if (loadTimer.current) clearTimeout(loadTimer.current);
    },
    []
  );

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

  const loadLeaderboard = useCallback(async (isActive?: () => boolean) => {
    try {
      const res = await fetch(`/api/quizzes/${selectedQuizId}/leaderboard`);
      const json = await res.json();
      if ((!isActive || isActive()) && res.ok && json.success && Array.isArray(json.data)) {
        setStoredEntries({ quizId: selectedQuizId, entries: json.data });
      }
    } catch (err) {
      console.error("Failed to load leaderboard from database:", err);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    let active = true;

    async function refreshLeaderboard() {
      await loadLeaderboard(() => active);
    }

    if (selectedQuizId) {
      void refreshLeaderboard();
    }

    const channel = supabase
      .channel(`leaderboard:${selectedQuizId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: `quiz_id=eq.${selectedQuizId}`,
        },
        () => {
          loadLeaderboard(() => active);
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [loadLeaderboard, selectedQuizId, supabase]);

  // Read authoritative leaderboard entries directly from database
  const currentQuizEntries = useMemo(() => {
    const dbEntries =
      storedEntries.quizId === selectedQuizId ? storedEntries.entries : [];

    if (dbEntries.length > 0) {
      return dbEntries;
    }

    // Default fixtures if no submitted scores yet for this quiz
    const baseEntries = initialLeaderboard.filter((entry) => entry.quizId === selectedQuizId);
    return baseEntries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [selectedQuizId, storedEntries]);

  // Towers glide to their new places when the ranking changes
  useLayoutEffect(() => {
    if (loading) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    itemRefs.current.forEach((el, id) => {
      const left = el.getBoundingClientRect().left;
      next.set(id, left);
      const before = lastLeft.current.get(id);
      if (!reduce && before !== undefined && Math.abs(before - left) > 1) {
        el.animate(
          [{ transform: `translateX(${before - left}px)` }, { transform: "translateX(0)" }],
          { duration: 650, easing: "cubic-bezier(0.2, 0.9, 0.25, 1.1)" }
        );
      }
    });
    lastLeft.current = next;
  });

  const filteredLeaderboard = useMemo(() => {
    return currentQuizEntries.filter((entry) =>
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentQuizEntries, searchQuery]);

  // Top 5 become capsule towers
  const towers = currentQuizEntries.slice(0, 5);
  const topScore = towers[0]?.score ?? 0;
  const lowScore = towers[towers.length - 1]?.score ?? 0;
  const towerHeight = (score: number) =>
    topScore === lowScore ? 300 : 150 + ((score - lowScore) / (topScore - lowScore)) * 250;

  // The signed-in user is matched by display name until entries carry real user ids
  const isMe = (name: string) => Boolean(user && user.name === name);
  const myEntry = currentQuizEntries.find((entry) => isMe(entry.userName));

  const handleSelectQuiz = (quizId: string) => {
    setLoading(true);
    if (loadTimer.current) clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => setLoading(false), 800);
    router.push(`/leaderboard?quizId=${quizId}`, { scroll: false });
  };

  const attemptQuizHref = isAuthenticated
    ? `/quizzes/${selectedQuiz.id}`
    : `/login?redirect=/quizzes/${selectedQuiz.id}`;

  return (
    <div className="container mx-auto max-w-6xl">
      <LeaderboardMotionPreview />

      {mockQuizzes.length === 0 ? (
        <div className="rounded-[18px] border-[3px] border-dashed border-[#0F3D2E] bg-[#FFFDF5] p-12 text-center text-[#0F3D2E] shadow-[5px_5px_0_#0F3D2E]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#0F3D2E] bg-[#FFE94A] shadow-[2px_2px_0_#0F3D2E]">
            <Trophy className="h-7 w-7 text-[#0F3D2E]" />
          </div>
          <h2 className="mb-1 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">
            No Leaderboard Data Yet
          </h2>
          <p className="mx-auto mb-4 max-w-md text-sm font-medium text-[#0F3D2E]/70">
            The chart above is an animated preview. Real standings will appear here once quizzes
            and completed attempts are available.
          </p>
          <Link href="/quizzes">
            <Button className="rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] font-extrabold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] hover:bg-[#FFE94A]/90">
              Browse Quizzes
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Quiz switcher */}
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Choose a quiz">
            {mockQuizzes.map((quiz) => {
              const isSelected = quiz.id === selectedQuizId;
              return (
                <button
                  key={quiz.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelectQuiz(quiz.id)}
                  className={`flex items-center gap-2 rounded-full border-[2.5px] border-[#0F3D2E] px-4 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#0F3D2E] text-[#FFE94A] shadow-[3px_3px_0_#FFE94A]"
                      : "bg-[#FFFDF5] text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFE94A]"
                  }`}
                >
                  <span>{quiz.title}</span>
                  <span className="font-mono text-[10px] uppercase opacity-70">{quiz.difficulty}</span>
                </button>
              );
            })}
          </div>

          {/* Quiz strip */}
          <div className="mb-12 flex flex-col gap-4 rounded-[14px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-4 shadow-[6px_6px_0_#0F3D2E] sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[#0F3D2E]">
                {selectedQuiz.title}
              </h2>
              <p className="mt-1 font-mono text-[11px] font-bold uppercase text-[#0F3D2E]/70">
                {selectedQuiz.category} · {selectedQuiz.questionCount} questions ·{" "}
                {Math.round(selectedQuiz.timeLimit / 60)} min limit
              </p>
            </div>
            <Link href={attemptQuizHref}>
              <Button className="w-full gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] font-extrabold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] hover:bg-[#FFE94A]/90 sm:w-auto">
                <Zap className="h-4 w-4 fill-[#0F3D2E]" />
                Challenge This Quiz
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Capsule towers */}
          {loading ? (
            <BoardSkeleton />
          ) : towers.length > 0 ? (
            <section key={selectedQuizId} aria-label="Top contenders" className="mb-12">
              <ol className="flex items-end gap-2 sm:gap-4">
                {towers.map((entry, i) => {
                  const id = entryKey(entry);
                  const mine = isMe(entry.userName);
                  return (
                    <li
                      key={id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(id, el);
                        else itemRefs.current.delete(id);
                      }}
                      className="relative flex min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      {/* Champion extras */}
                      {entry.rank === 1 && (
                        <>
                          <div className="mb-1 flex items-end gap-1">
                            <svg viewBox="0 0 48 32" className="qz-bob h-9 w-14" aria-hidden="true">
                              <path
                                d="M4 28 L8 8 L18 18 L24 4 L30 18 L40 8 L44 28 Z"
                                fill="#FFE94A"
                                stroke="#0F3D2E"
                                strokeWidth="3"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="-rotate-6 font-[family-name:var(--font-hand)] text-xl text-[#0F3D2E]">
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

                      {/* Score */}
                      <div className="relative mb-1.5 font-[family-name:var(--font-display)] text-xl font-extrabold text-[#0F3D2E] sm:text-3xl">
                        <CountUp value={entry.score} />
                        <span className="text-xs font-bold opacity-60">/{entry.totalQuestions}</span>
                      </div>

                      {/* Tower */}
                      <div
                        className={`qz-grow flex h-[calc(var(--h)*0.7)] w-full flex-col items-center rounded-t-full border-[3px] border-b-0 border-[#0F3D2E] pt-5 font-[family-name:var(--font-display)] text-5xl font-extrabold shadow-[6px_6px_0_#0F3D2E] transition-[height,translate] duration-700 ease-out hover:-translate-y-2 sm:h-[var(--h)] sm:text-7xl ${TOWER_STYLES[i]}`}
                        style={
                          {
                            "--h": `${towerHeight(entry.score)}px`,
                            animationDelay: `${i * 100}ms`,
                          } as CSSProperties
                        }
                      >
                        {entry.rank}
                        {mine && (
                          <span className="mb-4 mt-auto -rotate-6 rounded border-2 border-[#0F3D2E] bg-[#FFFDF5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#0F3D2E]">
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Name strip */}
                      <div className="w-full border-t-[3px] border-[#0F3D2E] pt-2 text-center">
                        <p
                          className={`mx-auto w-fit max-w-full truncate rounded px-2 text-sm font-bold ${
                            mine ? "bg-[#0F3D2E] text-[#FFE94A]" : "text-[#0F3D2E]"
                          }`}
                        >
                          {mine ? `${entry.userName} (you)` : entry.userName}
                        </p>
                        <p className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[11px] font-medium text-[#0F3D2E]/70">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.timeTaken)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-6 font-mono text-xs font-bold uppercase text-[#0F3D2E]">
                {myEntry
                  ? myEntry.rank === 1
                    ? "You are in the lead."
                    : `You are #${myEntry.rank}, ${currentQuizEntries[0].score - myEntry.score} pts from #1.`
                  : "Take the quiz to appear on the board."}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#0F3D2E]/70">
                Same score? The faster time ranks higher.
              </p>
            </section>
          ) : (
            <div className="mb-12 rounded-[18px] border-[3px] border-dashed border-[#0F3D2E] bg-[#FFFDF5] p-10 text-center shadow-[5px_5px_0_#0F3D2E]">
              <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-[#0F3D2E]">
                no attempts yet.
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F3D2E]/70">
                Be the first on the board for &quot;{selectedQuiz.title}&quot;.
              </p>
            </div>
          )}

          {/* Full standings table */}
          <div className="overflow-hidden rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] shadow-[9px_9px_0_#0F3D2E]">
            <div className="border-b-2 border-[#0F3D2E] p-5 pb-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#0F3D2E]">
                    Standings for &quot;{selectedQuiz.title}&quot;
                  </h3>
                  <p className="text-xs font-medium text-[#0F3D2E]/70">
                    Showing rankings of all registered contenders for this quiz only
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F3D2E]/60" />
                  <Input
                    placeholder="Search contender..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 rounded-[8px] border-2 border-[#0F3D2E] bg-[#FFFDF5] pl-9 text-xs font-medium text-[#0F3D2E] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-[#0F3D2E] bg-[#E3F9EE] hover:bg-[#E3F9EE]">
                    <TableHead className="w-16 text-center text-xs font-extrabold text-[#0F3D2E]">Rank</TableHead>
                    <TableHead className="text-xs font-extrabold text-[#0F3D2E]">Contender</TableHead>
                    <TableHead className="text-center text-xs font-extrabold text-[#0F3D2E]">Score</TableHead>
                    <TableHead className="text-center text-xs font-extrabold text-[#0F3D2E]">Accuracy</TableHead>
                    <TableHead className="pr-6 text-right text-xs font-extrabold text-[#0F3D2E]">Time Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading &&
                    [0, 1, 2, 3, 4].map((i) => (
                      <TableRow key={`skeleton-${i}`} className="border-b border-[#0F3D2E]/20">
                        <TableCell colSpan={5} className="py-3">
                          <div
                            className="h-7 animate-pulse rounded bg-[#0F3D2E]/10"
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!loading &&
                    filteredLeaderboard.map((entry) => {
                      const accuracy = Math.round((entry.score / entry.totalQuestions) * 100);

                      return (
                        <TableRow
                          key={entryKey(entry)}
                          className={`border-b border-[#0F3D2E]/20 transition-colors hover:bg-[#E3F9EE]/40 ${
                            isMe(entry.userName) ? "bg-[#FFE94A]/40" : ""
                          }`}
                        >
                          <TableCell className="text-center font-bold">
                            {entry.rank === 1 ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#0F3D2E] bg-[#FFE94A] text-sm font-extrabold">
                                🥇
                              </span>
                            ) : entry.rank === 2 ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#0F3D2E] bg-[#E3F9EE] text-sm font-extrabold">
                                🥈
                              </span>
                            ) : entry.rank === 3 ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#0F3D2E] bg-[#FFE94A]/40 text-sm font-extrabold">
                                🥉
                              </span>
                            ) : (
                              <span className="font-mono text-sm font-bold text-[#0F3D2E]/70">
                                #{entry.rank}
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-[#0F3D2E]">
                                <AvatarFallback className="bg-[#FFE94A] text-xs font-extrabold text-[#0F3D2E]">
                                  {entry.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-sm font-bold text-[#0F3D2E]">{entry.userName}</span>
                                {isMe(entry.userName) && (
                                  <span className="ml-2 rounded-full border border-[#0F3D2E] bg-[#0F3D2E] px-2 py-0.5 text-[10px] font-extrabold text-[#FFE94A]">
                                    You
                                  </span>
                                )}
                                {entry.rank === 1 && (
                                  <span className="ml-2 rounded-full border border-[#0F3D2E] bg-[#FFE94A] px-2 py-0.5 text-[10px] font-extrabold text-[#0F3D2E]">
                                    👑 Leader
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <span className="text-sm font-extrabold text-[#0F3D2E]">{entry.score}</span>
                            <span className="text-xs font-semibold text-[#0F3D2E]/60">
                              /{entry.totalQuestions}
                            </span>
                          </TableCell>

                          <TableCell className="text-center">
                            <span
                              className={`inline-block rounded-full border border-[#0F3D2E] px-2 py-0.5 text-xs font-bold ${
                                accuracy >= 80
                                  ? "bg-[#E3F9EE] text-[#0F3D2E]"
                                  : "bg-[#FFFDF5] text-[#0F3D2E]/80"
                              }`}
                            >
                              {accuracy}%
                            </span>
                          </TableCell>

                          <TableCell className="pr-6 text-right font-mono text-xs font-bold text-[#0F3D2E]">
                            {formatTime(entry.timeTaken)}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {!loading && filteredLeaderboard.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-sm text-[#0F3D2E]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Trophy className="h-8 w-8 text-[#0F3D2E]/40" />
                          <p className="font-bold text-[#0F3D2E]">
                            No contender records for this quiz yet
                          </p>
                          <p className="text-xs text-[#0F3D2E]/70">
                            Be the first to complete &quot;{selectedQuiz.title}&quot; and claim the
                            #1 spot!
                          </p>
                          <Link href={attemptQuizHref} className="mt-1">
                            <Button
                              size="sm"
                              className="rounded-[8px] border-2 border-[#0F3D2E] bg-[#FFE94A] font-extrabold text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] hover:bg-[#FFE94A]/90"
                            >
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