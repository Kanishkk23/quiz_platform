export interface LeaderboardScore {
  user_id: string;
  score: number;
  time_taken_seconds: number;
  submitted_at: string;
  id: string;
}

function compareScores(left: LeaderboardScore, right: LeaderboardScore): number {
  return (
    right.score - left.score ||
    left.time_taken_seconds - right.time_taken_seconds ||
    left.submitted_at.localeCompare(right.submitted_at) ||
    left.id.localeCompare(right.id)
  );
}

export function selectBestAttempts<T extends LeaderboardScore>(scores: T[]): T[] {
  const bestByUser = new Map<string, T>();

  for (const score of scores) {
    const currentBest = bestByUser.get(score.user_id);
    if (!currentBest || compareScores(score, currentBest) < 0) {
      bestByUser.set(score.user_id, score);
    }
  }

  return [...bestByUser.values()].sort(compareScores);
}

export function assignCompetitionRanks<T extends LeaderboardScore>(
  scores: T[]
): Array<T & { rank: number }> {
  const orderedScores = [...scores].sort(compareScores);
  let previousRank = 0;
  let previousScore: LeaderboardScore | undefined;

  return orderedScores.map((score, index) => {
    const isTie =
      previousScore?.score === score.score &&
      previousScore.time_taken_seconds === score.time_taken_seconds;
    const rank = isTie ? previousRank : index + 1;

    previousRank = rank;
    previousScore = score;
    return { ...score, rank };
  });
}
