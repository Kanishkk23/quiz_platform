-- Development fixtures only. Do not run against production data.
BEGIN;

INSERT INTO public.quizzes (
  id,
  title,
  description,
  category,
  instructions,
  marks_per_question,
  seconds_per_question,
  duration_seconds,
  starts_at,
  ends_at,
  is_published,
  is_featured
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'Foundations of the Web',
    'A short quiz on the building blocks of the web.',
    'Technology',
    'Choose one option for each question.',
    2,
    30,
    600,
    now() + interval '7 days',
    now() + interval '37 days',
    true,
    true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Database Essentials',
    'Test your knowledge of relational databases.',
    'Technology',
    'Choose one option for each question.',
    2,
    30,
    600,
    now() - interval '1 day',
    now() + interval '30 days',
    true,
    true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Welcome to Quizora',
    'A completed sample quiz for checking finished quiz states.',
    'General',
    'This sample quiz is no longer available for attempts.',
    2,
    30,
    300,
    now() - interval '37 days',
    now() - interval '7 days',
    true,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  instructions = EXCLUDED.instructions,
  marks_per_question = EXCLUDED.marks_per_question,
  seconds_per_question = EXCLUDED.seconds_per_question,
  duration_seconds = EXCLUDED.duration_seconds,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();

INSERT INTO public.questions (id, quiz_id, text, position, explanation)
VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Which language gives a web page its structure?',
    1,
    'HTML describes the structure and content of a web page.'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Which protocol is commonly used to transfer web pages?',
    2,
    'HTTP is the protocol used to transfer resources on the web.'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'What does a primary key identify?',
    1,
    'A primary key uniquely identifies a row in its table.'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'Which SQL command reads rows from a table?',
    2,
    'SELECT retrieves data from one or more tables.'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000003',
    'Which database feature links rows between tables?',
    1,
    'A foreign key relates a row to a referenced row in another table.'
  )
ON CONFLICT (id) DO UPDATE SET
  quiz_id = EXCLUDED.quiz_id,
  text = EXCLUDED.text,
  position = EXCLUDED.position,
  explanation = EXCLUDED.explanation;

INSERT INTO public.question_options (
  id,
  question_id,
  text,
  is_correct,
  position
)
VALUES
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'HTML', true, 1),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'CSS', false, 2),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'SQL', false, 3),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', 'JSON', false, 4),
  ('40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', 'FTP', false, 1),
  ('40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', 'HTTP', true, 2),
  ('40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000002', 'SMTP', false, 3),
  ('40000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000002', 'SSH', false, 4),
  ('40000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000003', 'A row position', false, 1),
  ('40000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000003', 'A table name', false, 2),
  ('40000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000003', 'A unique row identifier', true, 3),
  ('40000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000003', 'A database connection', false, 4),
  ('40000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000004', 'INSERT', false, 1),
  ('40000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000004', 'SELECT', true, 2),
  ('40000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000004', 'UPDATE', false, 3),
  ('40000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000004', 'CREATE', false, 4),
  ('40000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000005', 'A view', false, 1),
  ('40000000-0000-4000-8000-000000000018', '20000000-0000-4000-8000-000000000005', 'A foreign key', true, 2),
  ('40000000-0000-4000-8000-000000000019', '20000000-0000-4000-8000-000000000005', 'An index', false, 3),
  ('40000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000005', 'A transaction', false, 4)
ON CONFLICT (id) DO UPDATE SET
  question_id = EXCLUDED.question_id,
  text = EXCLUDED.text,
  is_correct = EXCLUDED.is_correct,
  position = EXCLUDED.position;

DO $$
DECLARE
  demo_player_count integer;
BEGIN
  SELECT count(*)
  INTO demo_player_count
  FROM public.profiles
  WHERE username IN ('demo_player_one', 'demo_player_two');

  IF demo_player_count = 2 THEN
    INSERT INTO public.attempts (
      id,
      quiz_id,
      user_id,
      status,
      score,
      total_points,
      started_at,
      submitted_at,
      time_taken_seconds
    )
    SELECT
      demo.attempt_id,
      '10000000-0000-4000-8000-000000000002',
      profile.id,
      'submitted',
      demo.score,
      4,
      now() - make_interval(secs => demo.time_taken_seconds),
      now(),
      demo.time_taken_seconds
    FROM (
      VALUES
        ('30000000-0000-4000-8000-000000000001'::uuid, 'demo_player_one', 2, 60),
        ('30000000-0000-4000-8000-000000000002'::uuid, 'demo_player_two', 2, 45),
        ('30000000-0000-4000-8000-000000000003'::uuid, 'demo_player_one', 0, 90)
    ) AS demo(attempt_id, username, score, time_taken_seconds)
    JOIN public.profiles AS profile ON profile.username = demo.username
    ON CONFLICT (id) DO UPDATE SET
      quiz_id = EXCLUDED.quiz_id,
      user_id = EXCLUDED.user_id,
      status = EXCLUDED.status,
      score = EXCLUDED.score,
      total_points = EXCLUDED.total_points,
      started_at = EXCLUDED.started_at,
      submitted_at = EXCLUDED.submitted_at,
      time_taken_seconds = EXCLUDED.time_taken_seconds;

    INSERT INTO public.scores (
      id,
      attempt_id,
      quiz_id,
      user_id,
      score,
      total_points,
      time_taken_seconds,
      submitted_at
    )
    SELECT
      demo.score_id,
      attempt.id,
      attempt.quiz_id,
      attempt.user_id,
      attempt.score,
      attempt.total_points,
      attempt.time_taken_seconds,
      attempt.submitted_at
    FROM (
      VALUES
        ('50000000-0000-4000-8000-000000000001'::uuid, '30000000-0000-4000-8000-000000000001'::uuid),
        ('50000000-0000-4000-8000-000000000002'::uuid, '30000000-0000-4000-8000-000000000002'::uuid),
        ('50000000-0000-4000-8000-000000000003'::uuid, '30000000-0000-4000-8000-000000000003'::uuid)
    ) AS demo(score_id, attempt_id)
    JOIN public.attempts AS attempt ON attempt.id = demo.attempt_id
    ON CONFLICT (attempt_id) DO UPDATE SET
      quiz_id = EXCLUDED.quiz_id,
      user_id = EXCLUDED.user_id,
      score = EXCLUDED.score,
      total_points = EXCLUDED.total_points,
      time_taken_seconds = EXCLUDED.time_taken_seconds,
      submitted_at = EXCLUDED.submitted_at;
  ELSE
    RAISE NOTICE
      'Quiz fixtures were added, but demo attempts and scores were skipped. Create profiles with usernames demo_player_one and demo_player_two, then rerun this script to add leaderboard fixtures.';
  END IF;
END;
$$;

COMMIT;
