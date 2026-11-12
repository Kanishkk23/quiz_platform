CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE CHECK (btrim(username) <> ''),
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'participant'
    CHECK (role IN ('super_admin', 'quiz_admin', 'quiz_host', 'participant')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  instructions text,
  marks_per_question integer NOT NULL DEFAULT 1 CHECK (marks_per_question > 0),
  seconds_per_question integer NOT NULL DEFAULT 30 CHECK (seconds_per_question > 0),
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_valid_window CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes (id) ON DELETE CASCADE,
  text text NOT NULL,
  position integer NOT NULL CHECK (position > 0),
  explanation text,
  CONSTRAINT questions_quiz_position_unique UNIQUE (quiz_id, position)
);

CREATE TABLE IF NOT EXISTS public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL CHECK (position > 0),
  CONSTRAINT question_options_question_position_unique
    UNIQUE (question_id, position)
);

CREATE TABLE IF NOT EXISTS public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted')),
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  total_points integer NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  time_taken_seconds integer CHECK (time_taken_seconds >= 0),
  CONSTRAINT attempts_submission_state CHECK (
    (status = 'in_progress' AND submitted_at IS NULL AND time_taken_seconds IS NULL)
    OR
    (status = 'submitted' AND submitted_at IS NOT NULL AND time_taken_seconds IS NOT NULL)
  ),
  CONSTRAINT attempts_score_within_total CHECK (score <= total_points),
  CONSTRAINT attempts_id_quiz_user_unique UNIQUE (id, quiz_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.attempts (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.question_options (id) ON DELETE SET NULL,
  is_correct boolean NOT NULL DEFAULT false,
  answered_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT answers_attempt_question_unique UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL UNIQUE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0),
  total_points integer NOT NULL CHECK (total_points >= 0),
  time_taken_seconds integer NOT NULL CHECK (time_taken_seconds >= 0),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scores_score_within_total CHECK (score <= total_points),
  CONSTRAINT scores_attempt_matches_quiz_and_user
    FOREIGN KEY (attempt_id, quiz_id, user_id)
    REFERENCES public.attempts (id, quiz_id, user_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz
  ON public.questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question
  ON public.question_options (question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user
  ON public.attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz
  ON public.attempts (quiz_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_attempt_per_user_quiz
  ON public.attempts (user_id, quiz_id)
  WHERE (status = 'in_progress');
CREATE INDEX IF NOT EXISTS idx_answers_attempt
  ON public.answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_scores_leaderboard
  ON public.scores (quiz_id, score DESC, time_taken_seconds ASC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  base_username text;
  candidate_username text;
BEGIN
  base_username := NULLIF(btrim(NEW.raw_user_meta_data ->> 'username'), '');

  IF base_username IS NULL THEN
    base_username := COALESCE(
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'user'
    );
  END IF;

  candidate_username := base_username;

  LOOP
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
      NEW.id,
      candidate_username,
      COALESCE(
        NULLIF(btrim(NEW.raw_user_meta_data ->> 'full_name'), ''),
        NULLIF(btrim(NEW.raw_user_meta_data ->> 'name'), '')
      )
    )
    ON CONFLICT (username) DO NOTHING;

    EXIT WHEN FOUND;
    candidate_username := base_username || '_' || left(gen_random_uuid()::text, 8);
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.assert_published_question_has_one_correct_option(
  target_question_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  quiz_is_published boolean;
  correct_option_count bigint;
BEGIN
  SELECT quiz.is_published
  INTO quiz_is_published
  FROM public.questions AS question
  JOIN public.quizzes AS quiz ON quiz.id = question.quiz_id
  WHERE question.id = target_question_id;

  IF NOT FOUND OR NOT quiz_is_published THEN
    RETURN;
  END IF;

  SELECT count(*) FILTER (WHERE answer_option.is_correct)
  INTO correct_option_count
  FROM public.question_options AS answer_option
  WHERE answer_option.question_id = target_question_id;

  IF correct_option_count <> 1 THEN
    RAISE EXCEPTION
      'Published question % must have exactly one correct option',
      target_question_id
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_published_question_options()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_TABLE_NAME = 'questions' THEN
    IF TG_OP <> 'INSERT' THEN
      PERFORM public.assert_published_question_has_one_correct_option(OLD.id);
    END IF;

    IF TG_OP <> 'DELETE' THEN
      PERFORM public.assert_published_question_has_one_correct_option(NEW.id);
    END IF;
  ELSE
    IF TG_OP <> 'INSERT' THEN
      PERFORM public.assert_published_question_has_one_correct_option(OLD.question_id);
    END IF;

    IF TG_OP <> 'DELETE' THEN
      PERFORM public.assert_published_question_has_one_correct_option(NEW.question_id);
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS question_options_answer_key_guard
  ON public.question_options;
CREATE CONSTRAINT TRIGGER question_options_answer_key_guard
  AFTER INSERT OR UPDATE OR DELETE ON public.question_options
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_published_question_options();

DROP TRIGGER IF EXISTS questions_answer_key_guard ON public.questions;
CREATE CONSTRAINT TRIGGER questions_answer_key_guard
  AFTER INSERT OR UPDATE OF quiz_id ON public.questions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_published_question_options();

CREATE OR REPLACE FUNCTION public.validate_quiz_before_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_published AND EXISTS (
    SELECT question.id
    FROM public.questions AS question
    LEFT JOIN public.question_options AS answer_option
      ON answer_option.question_id = question.id
    WHERE question.quiz_id = NEW.id
    GROUP BY question.id
    HAVING count(*) FILTER (WHERE answer_option.is_correct) <> 1
  ) THEN
    RAISE EXCEPTION
      'Every question must have exactly one correct option before publishing quiz %',
      NEW.id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quizzes_validate_before_publish ON public.quizzes;
CREATE TRIGGER quizzes_validate_before_publish
  BEFORE INSERT OR UPDATE OF is_published ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quiz_before_publish();

CREATE OR REPLACE FUNCTION public.validate_attempt_quiz_window()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  quiz_starts_at timestamptz;
  quiz_ends_at timestamptz;
  quiz_is_published boolean;
BEGIN
  SELECT starts_at, ends_at, is_published
  INTO quiz_starts_at, quiz_ends_at, quiz_is_published
  FROM public.quizzes
  WHERE id = NEW.quiz_id;

  IF NOT FOUND OR NOT quiz_is_published THEN
    RAISE EXCEPTION 'Quiz % is not available for attempts', NEW.quiz_id
      USING ERRCODE = 'check_violation';
  END IF;

  IF statement_timestamp() < quiz_starts_at
    OR statement_timestamp() >= quiz_ends_at THEN
    RAISE EXCEPTION 'Quiz % is outside its availability window', NEW.quiz_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attempts_validate_quiz_window ON public.attempts;
CREATE TRIGGER attempts_validate_quiz_window
  BEFORE INSERT ON public.attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_attempt_quiz_window();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assert_published_question_has_one_correct_option(uuid)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_published_question_options() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_quiz_before_publish() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_attempt_quiz_window() FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    RAISE EXCEPTION 'Supabase publication "supabase_realtime" does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
  END IF;
END;
$$;
