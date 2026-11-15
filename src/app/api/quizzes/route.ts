import { createClient } from '@/lib/server';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*, questions(id)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError(error.message, 500);
    }

    const now = new Date();

    const formatted = (quizzes || []).map((q: any) => {
      const startsAt = new Date(q.starts_at);
      const endsAt = new Date(q.ends_at);

      let availability: 'live' | 'upcoming' | 'finished' = 'live';
      if (now < startsAt) {
        availability = 'upcoming';
      } else if (now >= endsAt) {
        availability = 'finished';
      }

      const questionsCount = Array.isArray(q.questions) ? q.questions.length : 0;

      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
      if (q.duration_seconds <= 300) {
        difficulty = 'easy';
      } else if (q.duration_seconds >= 600) {
        difficulty = 'hard';
      }

      return {
        id: q.id,
        title: q.title,
        description: q.description || '',
        category: q.category || 'General',
        difficulty,
        marksPerQuestion: q.marks_per_question,
        durationSeconds: q.duration_seconds,
        timeLimit: q.duration_seconds,
        secondsPerQuestion: q.seconds_per_question,
        startsAt: q.starts_at,
        endsAt: q.ends_at,
        isFeatured: q.is_featured,
        availability,
        questionCount: questionsCount,
        createdAt: q.created_at,
      };
    });

    return apiSuccess(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return apiError(message, 500);
  }
}
