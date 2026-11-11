import { createClient } from '@/lib/server';
import {
  AttemptState,
  SubmitAttemptResponse,
  AttemptReviewResponse,
  QuestionReview,
  OptionReview,
} from '@/types/attempts';

export class AttemptsService {
  /**
   * Start a new attempt or resume an existing active attempt for the current user.
   */
  static async startOrResumeAttempt(
    quizId: string,
    forceRetake = false
  ): Promise<{ attempt: AttemptState; isResumed: boolean }> {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Authentication required to attempt a quiz');
    }

    // 1. Fetch quiz availability and configuration
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, duration_seconds, seconds_per_question, marks_per_question, starts_at, ends_at, is_published')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      throw new Error('Quiz not found');
    }

    if (!quiz.is_published) {
      throw new Error('This quiz is not published yet');
    }

    const now = new Date();
    const startsAt = new Date(quiz.starts_at);
    const endsAt = new Date(quiz.ends_at);

    if (now < startsAt) {
      throw new Error(`This quiz has not started yet. Starts at ${startsAt.toLocaleString()}`);
    }

    if (now >= endsAt) {
      throw new Error('This quiz availability window has ended');
    }

    // 2. Count total questions in quiz
    const { count: totalQuestions, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    if (countError) {
      throw new Error('Failed to verify quiz questions');
    }

    const questionsCount = totalQuestions ?? 0;

    // 3. Check for an existing in_progress attempt unless forceRetake is requested
    if (!forceRetake) {
      const { data: existingAttempt } = await supabase
        .from('attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingAttempt) {
        // Calculate server remaining time
        const startedTime = new Date(existingAttempt.started_at).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - startedTime) / 1000));
        const remainingSeconds = Math.max(0, quiz.duration_seconds - elapsedSeconds);
        const isExpired = remainingSeconds <= 0;

        // If time expired, auto-submit the attempt
        if (isExpired) {
          await this.submitAttempt(existingAttempt.id);
          // If user still wants to take the quiz, continue below to start a retake or report finished
        } else {
          // Fetch previously saved answers for attempt recovery
          const { data: savedAnswersList } = await supabase
            .from('answers')
            .select('question_id, option_id')
            .eq('attempt_id', existingAttempt.id);

          const savedAnswers: Record<string, string | null> = {};
          if (savedAnswersList) {
            for (const item of savedAnswersList) {
              savedAnswers[item.question_id] = item.option_id;
            }
          }

          const attemptState: AttemptState = {
            id: existingAttempt.id,
            quizId: existingAttempt.quiz_id,
            userId: existingAttempt.user_id,
            status: existingAttempt.status,
            score: existingAttempt.score,
            totalPoints: existingAttempt.total_points,
            startedAt: existingAttempt.started_at,
            submittedAt: existingAttempt.submitted_at,
            timeTakenSeconds: existingAttempt.time_taken_seconds,
            durationSeconds: quiz.duration_seconds,
            secondsPerQuestion: quiz.seconds_per_question,
            remainingSeconds,
            isExpired: false,
            savedAnswers,
            totalQuestions: questionsCount,
            answeredCount: Object.values(savedAnswers).filter(Boolean).length,
          };

          return { attempt: attemptState, isResumed: true };
        }
      }
    }

    // 4. Create a brand new attempt record
    const { data: newAttempt, error: insertError } = await supabase
      .from('attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
      })
      .select('*')
      .single();

    if (insertError || !newAttempt) {
      throw new Error(`Failed to create attempt: ${insertError?.message || 'Database error'}`);
    }

    const freshState: AttemptState = {
      id: newAttempt.id,
      quizId: newAttempt.quiz_id,
      userId: newAttempt.user_id,
      status: 'in_progress',
      score: 0,
      totalPoints: questionsCount * quiz.marks_per_question,
      startedAt: newAttempt.started_at,
      submittedAt: null,
      timeTakenSeconds: null,
      durationSeconds: quiz.duration_seconds,
      secondsPerQuestion: quiz.seconds_per_question,
      remainingSeconds: quiz.duration_seconds,
      isExpired: false,
      savedAnswers: {},
      totalQuestions: questionsCount,
      answeredCount: 0,
    };

    return { attempt: freshState, isResumed: false };
  }

  /**
   * Restore attempt on page refresh or reconnection.
   */
  static async getAttempt(attemptId: string): Promise<AttemptState> {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Fetch attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('*, quizzes!inner(duration_seconds, seconds_per_question, marks_per_question)')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Attempt not found or access denied');
    }

    const rawQuiz = attempt.quizzes as unknown;
    const quiz = (Array.isArray(rawQuiz) ? rawQuiz[0] : rawQuiz) as {
      duration_seconds: number;
      seconds_per_question: number;
      marks_per_question: number;
    };

    // Calculate server-authoritative timer
    const now = Date.now();
    const startedTime = new Date(attempt.started_at).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now - startedTime) / 1000));
    const remainingSeconds =
      attempt.status === 'submitted'
        ? 0
        : Math.max(0, quiz.duration_seconds - elapsedSeconds);
    const isExpired = remainingSeconds <= 0 && attempt.status === 'in_progress';

    // Fetch saved answers
    const { data: savedAnswersList } = await supabase
      .from('answers')
      .select('question_id, option_id')
      .eq('attempt_id', attempt.id);

    const savedAnswers: Record<string, string | null> = {};
    if (savedAnswersList) {
      for (const item of savedAnswersList) {
        savedAnswers[item.question_id] = item.option_id;
      }
    }

    // Fetch total questions count
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', attempt.quiz_id);

    return {
      id: attempt.id,
      quizId: attempt.quiz_id,
      userId: attempt.user_id,
      status: attempt.status,
      score: attempt.score,
      totalPoints: attempt.total_points,
      startedAt: attempt.started_at,
      submittedAt: attempt.submitted_at,
      timeTakenSeconds: attempt.time_taken_seconds,
      durationSeconds: quiz.duration_seconds,
      secondsPerQuestion: quiz.seconds_per_question,
      remainingSeconds,
      isExpired,
      savedAnswers,
      totalQuestions: totalQuestions ?? 0,
      answeredCount: Object.values(savedAnswers).filter(Boolean).length,
    };
  }

  /**
   * Save or update an answer for an active attempt.
   */
  static async saveAnswer(
    attemptId: string,
    questionId: string,
    optionId: string | null
  ): Promise<{ success: boolean; questionId: string; optionId: string | null; answeredAt: string }> {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // 1. Verify attempt ownership, status and timer deadline
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('id, quiz_id, status, started_at')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      throw new Error(`Attempt not found or access denied: ${attemptError?.message || ''}`);
    }

    if (attempt.status !== 'in_progress') {
      throw new Error('Cannot modify answers for a submitted attempt');
    }

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('duration_seconds')
      .eq('id', attempt.quiz_id)
      .single();

    if (quizError || !quiz) {
      throw new Error(`Quiz not found: ${quizError?.message || ''}`);
    }

    const elapsedSeconds = (Date.now() - new Date(attempt.started_at).getTime()) / 1000;
    // Allow 10 seconds grace period for network latency
    if (elapsedSeconds > quiz.duration_seconds + 10) {
      throw new Error('Time limit has expired. Please submit your attempt.');
    }

    const answeredAt = new Date().toISOString();

    if (optionId === null) {
      // Clear answer if optionId is null
      await supabase
        .from('answers')
        .delete()
        .eq('attempt_id', attemptId)
        .eq('question_id', questionId);

      return { success: true, questionId, optionId: null, answeredAt };
    }

    // 2. Check if answer already exists to cleanly separate INSERT vs UPDATE permissions
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('id')
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (existingAnswer) {
      // Matches GRANT UPDATE (option_id) ON TABLE public.answers TO authenticated
      const { error: updateError } = await supabase
        .from('answers')
        .update({ option_id: optionId })
        .eq('id', existingAnswer.id);

      if (updateError) {
        throw new Error(`Failed to update answer: ${updateError.message}`);
      }
    } else {
      // Matches GRANT INSERT (attempt_id, question_id, option_id) ON TABLE public.answers TO authenticated
      const { error: insertError } = await supabase
        .from('answers')
        .insert({
          attempt_id: attemptId,
          question_id: questionId,
          option_id: optionId,
        });

      if (insertError) {
        throw new Error(`Failed to insert answer: ${insertError.message}`);
      }
    }

    return { success: true, questionId, optionId, answeredAt };
  }

  /**
   * Submit attempt with server-side validation, scoring and idempotency.
   */
  static async submitAttempt(attemptId: string): Promise<SubmitAttemptResponse> {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Call atomic RPC stored procedure in Supabase
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      target_attempt_id: attemptId,
    });

    if (error) {
      throw new Error(`Submission failed: ${error.message}`);
    }

    const result = data as {
      attempt_id: string;
      quiz_id: string;
      user_id: string;
      status: 'submitted';
      score: number;
      total_points: number;
      time_taken_seconds: number;
      submitted_at: string;
      total_questions: number;
      answered_count: number;
      correct_count: number;
      percentage: number;
      is_duplicate: boolean;
    };

    return {
      attemptId: result.attempt_id,
      quizId: result.quiz_id,
      userId: result.user_id,
      status: 'submitted',
      score: result.score,
      totalPoints: result.total_points,
      timeTakenSeconds: result.time_taken_seconds,
      submittedAt: result.submitted_at,
      totalQuestions: result.total_questions,
      answeredCount: result.answered_count,
      correctCount: result.correct_count,
      percentage: result.percentage,
      isDuplicate: result.is_duplicate,
    };
  }

  /**
   * Secure post-submission review: reveals correct options and explanations.
   */
  static async getAttemptReview(attemptId: string): Promise<AttemptReviewResponse> {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // 1. Fetch attempt and verify it is submitted
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('id, quiz_id, user_id, status, score, total_points, time_taken_seconds, submitted_at')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Attempt not found or access denied');
    }

    if (attempt.status !== 'submitted') {
      throw new Error('Review is only available after attempt is submitted');
    }

    // 2. Fetch user's saved answers
    const { data: userAnswers } = await supabase
      .from('answers')
      .select('question_id, option_id, is_correct')
      .eq('attempt_id', attemptId);

    const userAnswerMap = new Map<string, { optionId: string | null; isCorrect: boolean }>();
    if (userAnswers) {
      for (const ans of userAnswers) {
        userAnswerMap.set(ans.question_id, {
          optionId: ans.option_id,
          isCorrect: ans.is_correct,
        });
      }
    }

    // 3. Fetch questions text and positions
    const { data: questionsList } = await supabase
      .from('questions')
      .select('id, text, position')
      .eq('quiz_id', attempt.quiz_id)
      .order('position', { ascending: true });

    // 4. Fetch options & explanations securely via the get_submitted_quiz_review RPC
    const { data: reviewRows, error: rpcError } = await supabase.rpc(
      'get_submitted_quiz_review',
      { target_attempt_id: attemptId }
    );

    if (rpcError) {
      throw new Error(`Failed to load review: ${rpcError.message}`);
    }

    // Group options and explanations by question_id
    const optionsByQuestion = new Map<
      string,
      { explanation: string | null; options: OptionReview[] }
    >();

    if (reviewRows) {
      for (const row of reviewRows as Array<{
        question_id: string;
        explanation: string | null;
        option_id: string;
        option_text: string;
        is_correct: boolean;
        option_position: number;
      }>) {
        if (!optionsByQuestion.has(row.question_id)) {
          optionsByQuestion.set(row.question_id, {
            explanation: row.explanation,
            options: [],
          });
        }
        optionsByQuestion.get(row.question_id)!.options.push({
          id: row.option_id,
          text: row.option_text,
          isCorrect: row.is_correct,
          position: row.option_position,
        });
      }
    }

    // Build question reviews
    let correctCount = 0;
    const questions: QuestionReview[] = [];

    for (const q of questionsList ?? []) {
      const qReview = optionsByQuestion.get(q.id);
      const userAns = userAnswerMap.get(q.id);
      const isCorrect = userAns?.isCorrect ?? false;
      if (isCorrect) correctCount++;

      questions.push({
        questionId: q.id,
        questionText: q.text,
        position: q.position,
        explanation: qReview?.explanation ?? null,
        userOptionId: userAns?.optionId ?? null,
        isCorrect,
        options: (qReview?.options ?? []).sort((a, b) => a.position - b.position),
      });
    }

    const percentage =
      attempt.total_points > 0
        ? Math.round((attempt.score / attempt.total_points) * 10000) / 100
        : 0;

    return {
      attemptId: attempt.id,
      quizId: attempt.quiz_id,
      userId: attempt.user_id,
      score: attempt.score,
      totalPoints: attempt.total_points,
      timeTakenSeconds: attempt.time_taken_seconds ?? 0,
      submittedAt: attempt.submitted_at ?? new Date().toISOString(),
      totalQuestions: questions.length,
      correctCount,
      percentage,
      questions,
    };
  }
}
