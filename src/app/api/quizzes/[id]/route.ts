import { NextRequest } from 'next/server';
import { createClient } from '@/lib/server';
import { apiSuccess, apiError } from '@/lib/api-response';

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

    // 1. Fetch Quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return apiError('Quiz not found', 404);
    }

    const now = new Date();
    const startsAt = new Date(quiz.starts_at);
    const endsAt = new Date(quiz.ends_at);

    let availability: 'live' | 'upcoming' | 'finished' = 'live';
    if (now < startsAt) {
      availability = 'upcoming';
    } else if (now >= endsAt) {
      availability = 'finished';
    }

    // 2. Fetch safe questions & options (without answers/explanations)
    const { data: rawQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, quiz_id, text, position, question_options(id, question_id, text, position)')
      .eq('quiz_id', quizId)
      .order('position', { ascending: true });

    if (questionsError) {
      return apiError(questionsError.message, 500);
    }

    const questions = (rawQuestions || []).map((q) => {
      const options = Array.isArray(q.question_options)
        ? [...q.question_options].sort((a, b) => a.position - b.position)
        : [];

      return {
        id: q.id,
        quizId: q.quiz_id,
        text: q.text,
        position: q.position,
        options: options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          position: opt.position,
        })),
      };
    });

    return apiSuccess({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        instructions: quiz.instructions,
        marksPerQuestion: quiz.marks_per_question,
        secondsPerQuestion: quiz.seconds_per_question,
        durationSeconds: quiz.duration_seconds,
        startsAt: quiz.starts_at,
        endsAt: quiz.ends_at,
        isPublished: quiz.is_published,
        availability,
        questionCount: questions.length,
      },
      questions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return apiError(message, 500);
  }
}
