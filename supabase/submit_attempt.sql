-- Function: submit_quiz_attempt
-- Provides atomic, server-authoritative quiz submission and score calculation.
-- Enforces:
-- 1. User ownership check (via auth.uid())
-- 2. Idempotency (prevent duplicate submissions)
-- 3. Server-side score calculation from question_options.is_correct
-- 4. Accurate elapsed time calculation
-- 5. Atomic transaction updating attempts and inserting into scores (fires Realtime publication)

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  target_attempt_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_attempt record;
  v_quiz record;
  v_total_questions integer;
  v_answered_count integer;
  v_correct_count integer;
  v_calculated_score integer;
  v_total_points integer;
  v_time_taken integer;
  v_submitted_at timestamptz;
  v_percentage numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 1. Fetch attempt and verify ownership
  SELECT * INTO v_attempt
  FROM public.attempts
  WHERE id = target_attempt_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found or access denied' USING ERRCODE = 'no_data_found';
  END IF;

  -- 2. Idempotency: if already submitted, return existing submission
  IF v_attempt.status = 'submitted' THEN
    SELECT count(*)::int INTO v_total_questions
    FROM public.questions
    WHERE quiz_id = v_attempt.quiz_id;

    SELECT count(*)::int INTO v_answered_count
    FROM public.answers
    WHERE attempt_id = target_attempt_id AND option_id IS NOT NULL;

    SELECT count(*)::int INTO v_correct_count
    FROM public.answers
    WHERE attempt_id = target_attempt_id AND is_correct = true;

    v_percentage := CASE
      WHEN v_attempt.total_points > 0 THEN ROUND((v_attempt.score::numeric / v_attempt.total_points::numeric) * 100, 2)
      ELSE 0
    END;

    RETURN jsonb_build_object(
      'attempt_id', v_attempt.id,
      'quiz_id', v_attempt.quiz_id,
      'user_id', v_attempt.user_id,
      'status', 'submitted',
      'score', v_attempt.score,
      'total_points', v_attempt.total_points,
      'time_taken_seconds', v_attempt.time_taken_seconds,
      'submitted_at', v_attempt.submitted_at,
      'total_questions', v_total_questions,
      'answered_count', v_answered_count,
      'correct_count', v_correct_count,
      'percentage', v_percentage,
      'is_duplicate', true
    );
  END IF;

  -- 3. Fetch quiz metadata
  SELECT * INTO v_quiz
  FROM public.quizzes
  WHERE id = v_attempt.quiz_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz not found' USING ERRCODE = 'no_data_found';
  END IF;

  v_submitted_at := statement_timestamp();

  -- Calculate elapsed time capped at quiz duration
  v_time_taken := GREATEST(1, EXTRACT(EPOCH FROM (v_submitted_at - v_attempt.started_at))::int);
  IF v_time_taken > v_quiz.duration_seconds THEN
    v_time_taken := v_quiz.duration_seconds;
  END IF;

  -- 4. Calculate total questions and maximum points
  SELECT count(*)::int INTO v_total_questions
  FROM public.questions
  WHERE quiz_id = v_attempt.quiz_id;

  v_total_points := v_total_questions * v_quiz.marks_per_question;

  -- 5. Mark each answer's correctness based on question_options.is_correct
  UPDATE public.answers a
  SET is_correct = COALESCE(qo.is_correct, false)
  FROM public.question_options qo
  WHERE a.attempt_id = target_attempt_id
    AND a.option_id = qo.id;

  -- 6. Count answered and correct answers
  SELECT count(*)::int INTO v_answered_count
  FROM public.answers
  WHERE attempt_id = target_attempt_id AND option_id IS NOT NULL;

  SELECT count(*)::int INTO v_correct_count
  FROM public.answers
  WHERE attempt_id = target_attempt_id AND is_correct = true;

  v_calculated_score := v_correct_count * v_quiz.marks_per_question;

  -- 7. Update attempt to submitted atomically
  UPDATE public.attempts
  SET status = 'submitted',
      score = v_calculated_score,
      total_points = v_total_points,
      submitted_at = v_submitted_at,
      time_taken_seconds = v_time_taken
  WHERE id = target_attempt_id;

  -- 8. Insert or update into public.scores (for leaderboard & Realtime)
  INSERT INTO public.scores (attempt_id, quiz_id, user_id, score, total_points, time_taken_seconds, submitted_at)
  VALUES (target_attempt_id, v_attempt.quiz_id, v_user_id, v_calculated_score, v_total_points, v_time_taken, v_submitted_at)
  ON CONFLICT (attempt_id) DO UPDATE
  SET score = EXCLUDED.score,
      total_points = EXCLUDED.total_points,
      time_taken_seconds = EXCLUDED.time_taken_seconds,
      submitted_at = EXCLUDED.submitted_at;

  v_percentage := CASE
    WHEN v_total_points > 0 THEN ROUND((v_calculated_score::numeric / v_total_points::numeric) * 100, 2)
    ELSE 0
  END;

  RETURN jsonb_build_object(
    'attempt_id', target_attempt_id,
    'quiz_id', v_attempt.quiz_id,
    'user_id', v_user_id,
    'status', 'submitted',
    'score', v_calculated_score,
    'total_points', v_total_points,
    'time_taken_seconds', v_time_taken,
    'submitted_at', v_submitted_at,
    'total_questions', v_total_questions,
    'answered_count', v_answered_count,
    'correct_count', v_correct_count,
    'percentage', v_percentage,
    'is_duplicate', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid) TO authenticated;
