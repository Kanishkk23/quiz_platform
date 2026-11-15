import { NextRequest } from 'next/server';
import { createClient } from '@/lib/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import {
  assignCompetitionRanks,
  selectBestAttempts,
} from '@/services/leaderboard.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    if (!quizId) {
      return apiError('Quiz ID is required', 400);
    }

    const supabase = await createClient();

    // Fetch top scores for this quiz from Supabase ordered by score desc, time taken asc
    const { data: scores, error } = await supabase
      .from('scores')
      .select(`
        id,
        attempt_id,
        quiz_id,
        user_id,
        score,
        total_points,
        time_taken_seconds,
        submitted_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        ),
        quizzes (
          marks_per_question
        )
      `)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
      .limit(1000);

    if (error) {
      return apiError(`Failed to fetch leaderboard: ${error.message}`, 500);
    }

    const bestScores = selectBestAttempts((scores || []) as any[]);
    const rankedScores = assignCompetitionRanks(bestScores as any[]) as any[];

    const entries = rankedScores.slice(0, 50).map((s: any) => {
      const profile = s.profiles as unknown as {
        id: string;
        username?: string;
        full_name?: string;
        avatar_url?: string;
      } | null;

      const quiz = s.quizzes as unknown as { marks_per_question?: number } | null;
      const marksPerQ = quiz?.marks_per_question || 2;
      const totalQuestions = s.total_points > 0 ? Math.round(s.total_points / marksPerQ) : 0;

      return {
        rank: s.rank,
        userId: s.user_id,
        userName: profile?.full_name || profile?.username || 'Player',
        userAvatar: profile?.avatar_url,
        quizId: s.quiz_id,
        score: s.score,
        totalQuestions,
        timeTaken: s.time_taken_seconds,
        completedAt: s.submitted_at,
      };
    });

    return apiSuccess(entries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return apiError(message, 500);
  }
}
