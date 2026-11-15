import { createClient } from '@/lib/server';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Authentication required to view profile attempt history', 401);
    }

    // Query submitted attempts for the current user from Supabase
    const { data: attempts, error } = await supabase
      .from('attempts')
      .select(`
        id,
        quiz_id,
        score,
        total_points,
        time_taken_seconds,
        submitted_at,
        quizzes (
          id,
          title,
          category,
          marks_per_question,
          duration_seconds
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (error) {
      return apiError(`Failed to fetch attempts: ${error.message}`, 500);
    }

    const formatted = (attempts || []).map((att: any) => {
      const quiz = att.quizzes as unknown as {
        id: string;
        title: string;
        category?: string;
        marks_per_question?: number;
      } | null;

      const marksPerQ = quiz?.marks_per_question || 2;
      const totalQuestions = att.total_points > 0 ? Math.round(att.total_points / marksPerQ) : 0;
      const percentage = att.total_points > 0 ? Math.round((att.score / att.total_points) * 100) : 0;

      return {
        id: att.id,
        quizId: att.quiz_id,
        quizTitle: quiz?.title || 'Quiz',
        category: quiz?.category || 'General',
        score: att.score,
        totalPoints: att.total_points,
        totalQuestions,
        timeTaken: att.time_taken_seconds || 0,
        completedAt: att.submitted_at,
        percentage,
      };
    });

    return apiSuccess(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return apiError(message, 500);
  }
}
