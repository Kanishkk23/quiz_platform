"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LoaderCircle, Radio, RotateCcw, Sparkles } from "lucide-react";

const PLAYERS = [
  { id: "player-one", name: "Player One", color: "bg-[#FFE94A] text-[#0F3D2E]" },
  { id: "player-two", name: "Player Two", color: "bg-[#1F9D6B] text-[#FFFDF5]" },
  { id: "player-three", name: "Player Three", color: "bg-[#FFFDF5] text-[#0F3D2E]" },
  { id: "player-four", name: "Player Four", color: "bg-[#E3F9EE] text-[#0F3D2E]" },
  { id: "you", name: "You", color: "bg-[#0F3D2E] text-[#FFE94A]" },
] as const;

const RACE_STEPS: Record<(typeof PLAYERS)[number]["id"], number>[] = [
  {
    "player-one": 950,
    "player-two": 900,
    "player-three": 860,
    "player-four": 820,
    you: 720,
  },
  {
    "player-one": 950,
    "player-two": 915,
    "player-three": 890,
    "player-four": 845,
    you: 810,
  },
  {
    "player-one": 950,
    "player-two": 920,
    "player-three": 895,
    "player-four": 860,
    you: 925,
  },
  {
    "player-one": 950,
    "player-two": 920,
    "player-three": 895,
    "player-four": 860,
    you: 990,
  },
];

function useAnimatedNumber(value: number) {
  const [shown, setShown] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const from = previous.current;
    const duration = reduceMotion ? 0 : 650;
    let frame = 0;

    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(from + (value - from) * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previous.current = value;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return shown;
}

function PreviewSkeleton() {
  return (
    <ol
      aria-label="Loading animated leaderboard preview"
      className="flex h-[330px] min-w-[560px] items-end gap-3 sm:gap-5"
    >
      {[72, 86, 62, 54, 42].map((height, index) => (
        <li key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div className="h-4 w-10 animate-pulse rounded bg-[#0F3D2E]/15" />
          <div
            className="w-full animate-pulse rounded-t-full border-[3px] border-b-0 border-dashed border-[#0F3D2E]/40 bg-[#1F9D6B]/20"
            style={{ height: `${height}%`, animationDelay: `${index * 100}ms` }}
          />
          <div className="h-4 w-4/5 animate-pulse rounded bg-[#0F3D2E]/15" />
        </li>
      ))}
    </ol>
  );
}

type Player = (typeof PLAYERS)[number];

function PlayerBar({
  player,
  index,
  rank,
  score,
  finished,
  registerBar,
}: {
  player: Player;
  index: number;
  rank: number;
  score: number;
  finished: boolean;
  registerBar: (id: string, element: HTMLDivElement | null) => void;
}) {
  const isYou = player.id === "you";
  const points = useAnimatedNumber(score);
  const height = 130 + ((score - 650) / 340) * 160;

  return (
    <li className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
      <div className="mb-2 h-6 font-mono text-xs font-bold tabular-nums text-[#0F3D2E]/80">
        <span className={isYou && finished ? "text-[#1F9D6B]" : ""}>{points}</span>
      </div>
      <div
        ref={(element) => registerBar(player.id, element)}
        className={`relative flex w-full flex-col items-center rounded-t-full border-[3px] border-b-0 border-[#0F3D2E] pt-4 font-[family-name:var(--font-display)] text-4xl font-extrabold shadow-[5px_5px_0_#0F3D2E] transition-[height,transform] duration-1000 ease-[cubic-bezier(0.2,0.9,0.25,1)] sm:text-6xl ${
          player.color
        } ${isYou && finished ? "ring-4 ring-[#FFE94A] ring-offset-2 ring-offset-[#FFFDF5]" : ""}`}
        style={{
          height: `${height}px`,
          transitionDelay: `${Math.min(index * 70, 280)}ms`,
        }}
      >
        {rank}
        {isYou && finished && (
          <span className="mt-auto mb-4 rounded-full border-2 border-[#0F3D2E] bg-[#FFFDF5] px-3 py-1 font-mono text-[10px] font-extrabold tracking-widest text-[#0F3D2E]">
            YOU
          </span>
        )}
      </div>
      <div className="mt-2 w-full border-t-[3px] border-[#0F3D2E] pt-2 text-center">
        <p
          className={`truncate rounded px-1 text-[11px] font-extrabold sm:text-xs ${
            isYou ? "bg-[#0F3D2E] text-[#FFE94A]" : "text-[#0F3D2E]"
          }`}
        >
          {player.name}
        </p>
      </div>
    </li>
  );
}

export function LeaderboardMotionPreview() {
  const [step, setStep] = useState(-1);
  const [replayKey, setReplayKey] = useState(0);
  const bars = useRef(new Map<string, HTMLDivElement>());
  const previousLeft = useRef(new Map<string, number>());
  const finalStep = RACE_STEPS.length - 1;
  const finished = step === finalStep;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const timer = setTimeout(() => setStep(finalStep), 0);
      return () => clearTimeout(timer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    RACE_STEPS.forEach((_, index) => {
      timers.push(setTimeout(() => setStep(index), 450 + index * 1100));
    });

    return () => timers.forEach(clearTimeout);
  }, [finalStep, replayKey]);

  useLayoutEffect(() => {
    if (step < 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const positions = new Map<string, number>();
    bars.current.forEach((element, id) => {
      const left = element.getBoundingClientRect().left;
      positions.set(id, left);
      const oldLeft = previousLeft.current.get(id);

      if (oldLeft !== undefined && Math.abs(oldLeft - left) > 1) {
        element.animate(
          [{ transform: `translateX(${oldLeft - left}px)` }, { transform: "translateX(0)" }],
          { duration: 850, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)" }
        );
      }
    });

    previousLeft.current = positions;
  }, [step]);

  const scores = step < 0 ? null : RACE_STEPS[step];
  const sortedPlayers = PLAYERS.map((player) => ({
    ...player,
    score: scores?.[player.id] ?? 0,
  })).sort((a, b) => b.score - a.score);

  return (
    <section
      aria-labelledby="leaderboard-preview-title"
      className="mb-10 overflow-hidden rounded-[20px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-5 shadow-[8px_8px_0_#0F3D2E] sm:p-8"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F3D2E]/70 sm:text-xs">
          <span className="rounded-full border border-dashed border-[#0F3D2E] px-2.5 py-1">
            Q4.
          </span>
          Motivational preview
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#0F3D2E]/20 bg-[#E3F9EE] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#0F3D2E] sm:text-xs">
          {finished ? (
            <Sparkles className="h-3.5 w-3.5 text-[#1F9D6B]" />
          ) : step < 0 ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#1F9D6B]" />
          )}
          {finished ? "You made the climb" : step < 0 ? "Getting the arena ready" : "The climb is on"}
        </div>
      </div>

      <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="leaderboard-preview-title"
            className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[0.92] tracking-tight text-[#0F3D2E] sm:text-6xl md:text-7xl"
          >
            who&apos;s winning
            <br />
            <span className="bg-[linear-gradient(transparent_58%,#FFE94A_58%)]">right now?</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium text-[#0F3D2E]/70">
            Every great run starts somewhere. Watch your bar rise all the way to the top.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            previousLeft.current.clear();
            setStep(-1);
            setReplayKey((key) => key + 1);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] px-4 py-2.5 text-xs font-extrabold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay climb
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        {step < 0 ? (
          <PreviewSkeleton />
        ) : (
          <ol aria-label="Animated leaderboard preview" className="flex h-[330px] min-w-[560px] items-end gap-3 sm:gap-5">
            {sortedPlayers.map((player, index) => {
              return (
                <PlayerBar
                  key={player.id}
                  player={player}
                  index={index}
                  rank={index + 1}
                  score={player.score}
                  finished={finished}
                  registerBar={(id, element) => {
                    if (element) bars.current.set(id, element);
                    else bars.current.delete(id);
                  }}
                />
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-1 border-t-2 border-dashed border-[#0F3D2E]/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#0F3D2E] sm:text-xs">
          {finished ? "You are #1. Keep that momentum." : "Same arena. New personal best."}
        </p>
        <p className="font-mono text-[9px] font-medium uppercase tracking-wide text-[#0F3D2E]/55 sm:text-[10px]">
          Animated preview · these are not real quiz scores
        </p>
      </div>
    </section>
  );
}
