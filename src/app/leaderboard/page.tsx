import { Suspense } from "react";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";

export const metadata = {
  title: "Per-Quiz Leaderboards — Quizora Arena",
  description: "Check dedicated rankings, podium scores, and top contenders for every quiz on Quizora.",
};

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LeaderboardView />
    </Suspense>
  );
}
