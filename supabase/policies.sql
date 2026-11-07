CREATE OR REPLACE FUNCTION public.is_quiz_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'quiz_admin', 'quiz_host')
  );
$$;

REVOKE ALL ON FUNCTION public.is_quiz_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_quiz_admin() TO anon, authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_read_authenticated ON public.profiles;
CREATE POLICY profiles_read_authenticated
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS quizzes_read_available ON public.quizzes;
CREATE POLICY quizzes_read_available
  ON public.quizzes
  FOR SELECT
  TO anon, authenticated
  USING (
    is_published
    OR created_by = (SELECT auth.uid())
    OR (SELECT public.is_quiz_admin())
  );

DROP POLICY IF EXISTS quizzes_insert_admin ON public.quizzes;
CREATE POLICY quizzes_insert_admin
  ON public.quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_quiz_admin())
    AND created_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS quizzes_update_before_live ON public.quizzes;
CREATE POLICY quizzes_update_before_live
  ON public.quizzes
  FOR UPDATE
  TO authenticated
  USING (
    (created_by = (SELECT auth.uid()) OR (SELECT public.is_quiz_admin()))
    AND NOT (is_published AND statement_timestamp() >= starts_at)
  )
  WITH CHECK (
    (created_by = (SELECT auth.uid()) OR (SELECT public.is_quiz_admin()))
    AND NOT (is_published AND statement_timestamp() >= starts_at)
  );

DROP POLICY IF EXISTS quizzes_delete_before_live ON public.quizzes;
CREATE POLICY quizzes_delete_before_live
  ON public.quizzes
  FOR DELETE
  TO authenticated
  USING (
    (created_by = (SELECT auth.uid()) OR (SELECT public.is_quiz_admin()))
    AND NOT (is_published AND statement_timestamp() >= starts_at)
  );

DROP POLICY IF EXISTS questions_read_available_quizzes ON public.questions;
CREATE POLICY questions_read_available_quizzes
  ON public.questions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes AS quiz
      WHERE quiz.id = questions.quiz_id
        AND (
          quiz.is_published
          OR quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
    )
  );

DROP POLICY IF EXISTS questions_insert_before_live ON public.questions;
CREATE POLICY questions_insert_before_live
  ON public.questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.quizzes AS quiz
      WHERE quiz.id = questions.quiz_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  );

DROP POLICY IF EXISTS questions_update_before_live ON public.questions;
CREATE POLICY questions_update_before_live
  ON public.questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes AS quiz
      WHERE quiz.id = questions.quiz_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.quizzes AS quiz
      WHERE quiz.id = questions.quiz_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  );

DROP POLICY IF EXISTS questions_delete_before_live ON public.questions;
CREATE POLICY questions_delete_before_live
  ON public.questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes AS quiz
      WHERE quiz.id = questions.quiz_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  );

DROP POLICY IF EXISTS question_options_read_available_quizzes
  ON public.question_options;
CREATE POLICY question_options_read_available_quizzes
  ON public.question_options
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.questions AS question
      JOIN public.quizzes AS quiz ON quiz.id = question.quiz_id
      WHERE question.id = question_options.question_id
        AND (
          quiz.is_published
          OR quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
    )
  );

DROP POLICY IF EXISTS question_options_insert_before_live
  ON public.question_options;
CREATE POLICY question_options_insert_before_live
  ON public.question_options
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.questions AS question
      JOIN public.quizzes AS quiz ON quiz.id = question.quiz_id
      WHERE question.id = question_options.question_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  );

DROP POLICY IF EXISTS question_options_update_before_live
  ON public.question_options;
CREATE POLICY question_options_update_before_live
  ON public.question_options
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.questions AS question
      JOIN public.quizzes AS quiz ON quiz.id = question.quiz_id
      WHERE question.id = question_options.question_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.questions AS question
      JOIN public.quizzes AS quiz ON quiz.id = question.quiz_id
      WHERE question.id = question_options.question_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  );

DROP POLICY IF EXISTS question_options_delete_before_live
  ON public.question_options;
CREATE POLICY question_options_delete_before_live
  ON public.question_options
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.questions AS question
      JOIN public.quizzes AS quiz ON quiz.id = question.quiz_id
      WHERE question.id = question_options.question_id
        AND (
          quiz.created_by = (SELECT auth.uid())
          OR (SELECT public.is_quiz_admin())
        )
        AND NOT (quiz.is_published AND statement_timestamp() >= quiz.starts_at)
    )
  );

DROP POLICY IF EXISTS attempts_read_own ON public.attempts;
CREATE POLICY attempts_read_own
  ON public.attempts
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS attempts_insert_own ON public.attempts;
CREATE POLICY attempts_insert_own
  ON public.attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS answers_read_own ON public.answers;
CREATE POLICY answers_read_own
  ON public.answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.attempts AS attempt
      WHERE attempt.id = answers.attempt_id
        AND attempt.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS answers_insert_during_own_attempt
  ON public.answers;
CREATE POLICY answers_insert_during_own_attempt
  ON public.answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.attempts AS attempt
      JOIN public.questions AS question
        ON question.id = answers.question_id
       AND question.quiz_id = attempt.quiz_id
      JOIN public.quizzes AS quiz ON quiz.id = attempt.quiz_id
      WHERE attempt.id = answers.attempt_id
        AND attempt.user_id = (SELECT auth.uid())
        AND attempt.status = 'in_progress'
        AND statement_timestamp()
          < attempt.started_at + quiz.duration_seconds * interval '1 second'
    )
    AND (
      option_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.question_options AS answer_option
        WHERE answer_option.id = answers.option_id
          AND answer_option.question_id = answers.question_id
      )
    )
  );

DROP POLICY IF EXISTS answers_update_during_own_attempt
  ON public.answers;
CREATE POLICY answers_update_during_own_attempt
  ON public.answers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.attempts AS attempt
      WHERE attempt.id = answers.attempt_id
        AND attempt.user_id = (SELECT auth.uid())
        AND attempt.status = 'in_progress'
        AND EXISTS (
          SELECT 1
          FROM public.quizzes AS quiz
          WHERE quiz.id = attempt.quiz_id
            AND statement_timestamp()
              < attempt.started_at
                + quiz.duration_seconds * interval '1 second'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.attempts AS attempt
      JOIN public.questions AS question
        ON question.id = answers.question_id
       AND question.quiz_id = attempt.quiz_id
      JOIN public.quizzes AS quiz ON quiz.id = attempt.quiz_id
      WHERE attempt.id = answers.attempt_id
        AND attempt.user_id = (SELECT auth.uid())
        AND attempt.status = 'in_progress'
        AND statement_timestamp()
          < attempt.started_at + quiz.duration_seconds * interval '1 second'
    )
    AND (
      option_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.question_options AS answer_option
        WHERE answer_option.id = answers.option_id
          AND answer_option.question_id = answers.question_id
      )
    )
  );

DROP POLICY IF EXISTS scores_read_authenticated ON public.scores;
CREATE POLICY scores_read_authenticated
  ON public.scores
  FOR SELECT
  TO authenticated
  USING (true);

REVOKE ALL ON TABLE
  public.profiles,
  public.quizzes,
  public.questions,
  public.question_options,
  public.attempts,
  public.answers,
  public.scores
FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, role, created_at)
  ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE SELECT (explanation)
  ON TABLE public.questions FROM PUBLIC, anon, authenticated;
REVOKE SELECT (is_correct)
  ON TABLE public.question_options FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (username, full_name, avatar_url)
  ON TABLE public.profiles TO authenticated;

GRANT SELECT ON TABLE public.quizzes TO anon, authenticated;
GRANT INSERT (
  title, description, category, instructions,
  marks_per_question, seconds_per_question, duration_seconds,
  starts_at, ends_at, is_published, is_featured, created_by
)
  ON TABLE public.quizzes TO authenticated;
GRANT UPDATE (
  title, description, category, instructions,
  marks_per_question, seconds_per_question, duration_seconds,
  starts_at, ends_at, is_published, is_featured
)
  ON TABLE public.quizzes TO authenticated;
GRANT DELETE ON TABLE public.quizzes TO authenticated;

GRANT SELECT (id, quiz_id, text, position)
  ON TABLE public.questions TO anon, authenticated;
GRANT DELETE ON TABLE public.questions TO authenticated;
GRANT INSERT (quiz_id, text, position, explanation)
  ON TABLE public.questions TO authenticated;
GRANT UPDATE (quiz_id, text, position, explanation)
  ON TABLE public.questions TO authenticated;

GRANT SELECT (id, question_id, text, position)
  ON TABLE public.question_options TO anon, authenticated;
GRANT INSERT (question_id, text, is_correct, position)
  ON TABLE public.question_options TO authenticated;
GRANT UPDATE (question_id, text, is_correct, position)
  ON TABLE public.question_options TO authenticated;
GRANT DELETE ON TABLE public.question_options TO authenticated;

GRANT SELECT ON TABLE public.attempts TO authenticated;
GRANT INSERT (quiz_id, user_id) ON TABLE public.attempts TO authenticated;

GRANT SELECT ON TABLE public.answers TO authenticated;
GRANT INSERT (attempt_id, question_id, option_id)
  ON TABLE public.answers TO authenticated;
GRANT UPDATE (option_id) ON TABLE public.answers TO authenticated;

GRANT SELECT ON TABLE public.scores TO authenticated;

GRANT ALL ON TABLE
  public.profiles,
  public.quizzes,
  public.questions,
  public.question_options,
  public.attempts,
  public.answers,
  public.scores
TO service_role;

CREATE OR REPLACE FUNCTION public.get_submitted_quiz_review(
  target_attempt_id uuid
)
RETURNS TABLE (
  question_id uuid,
  explanation text,
  option_id uuid,
  option_text text,
  is_correct boolean,
  option_position integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    question.id,
    question.explanation,
    answer_option.id,
    answer_option.text,
    answer_option.is_correct,
    answer_option.position
  FROM public.attempts AS attempt
  JOIN public.questions AS question
    ON question.quiz_id = attempt.quiz_id
  JOIN public.question_options AS answer_option
    ON answer_option.question_id = question.id
  WHERE attempt.id = target_attempt_id
    AND attempt.user_id = auth.uid()
    AND attempt.status = 'submitted'
  ORDER BY question.position, answer_option.position;
$$;

REVOKE ALL ON FUNCTION public.get_submitted_quiz_review(uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_submitted_quiz_review(uuid)
  TO authenticated;
