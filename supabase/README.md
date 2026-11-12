# Supabase database

This folder contains the database schema, access policies, and development seed
data for Quizora-B.

## Apply scripts

Run the scripts in this order in the Supabase SQL Editor:

1. `schema.sql` — core schema, tables, constraints, unique active attempt index, triggers, and Realtime publication.
2. `policies.sql` — row-level security, grants, answer-key protection, atomic submission procedure (`submit_quiz_attempt()`), and secure solution review (`get_submitted_quiz_review()`).
3. `seed.sql` or `seed_10_quizzes.sql` — repeatable development fixtures.

The schema and policies must be applied before the seed script. `policies.sql` automatically creates and grants execution on `submit_quiz_attempt()` and `get_submitted_quiz_review()` to authenticated users. Run these scripts only in a development or test Supabase project, not in production.

## Seed data

`seed.sql` is safe to rerun: its fixture rows use stable IDs and are upserted.
It creates three published quizzes (upcoming, live, and finished), five sample
questions, and four options per question with one correct option.

Leaderboard fixtures are added only when the project already has profiles with
the usernames `demo_player_one` and `demo_player_two`. Create two disposable
test accounts whose email names produce those usernames, or set those usernames
on disposable test profiles before running the seed script. The script creates
three submitted attempts and corresponding scores: two players have equal scores
with different completion times, and one player has a lower-scoring retake. If
the two demo profiles are absent, it prints a notice and seeds the quiz fixtures
without creating attempts or scores. No auth users or passwords are created by
the seed script.

The seed data uses fixed quiz IDs:

| State | Quiz ID |
| --- | --- |
| Upcoming | `10000000-0000-4000-8000-000000000001` |
| Live | `10000000-0000-4000-8000-000000000002` |
| Finished | `10000000-0000-4000-8000-000000000003` |

Availability dates are relative to the time the script runs, so rerunning the
script resets the three quiz windows relative to the current time.

## Design decisions

- Quizzes use one availability window; a separate sessions table is not part of
  this initial schema.
- Retakes create separate attempt and score rows. The leaderboard uses each
  player's best attempt (highest score, then fastest time).
- Ties with the same score and completion time receive the same competition
  rank, while the next rank accounts for the tied entries.
- `attempts` and `answers` are the private attempt record; `scores` is the
  leaderboard feed.
- Correct options and explanations are protected by database grants in
  `policies.sql` and are revealed through the submitted-attempt review function.
- The client subscribes to score changes through Supabase Realtime and reloads
  the authoritative leaderboard response after a change.

## Acceptance checks

The application test suite also verifies the checked-in database contracts:

```bash
npm test
```

These checks cover RLS ownership, answer-key protection, published-quiz
locking, submitted-attempt consistency, active-attempt uniqueness, and
leaderboard best-attempt ranking. They are contract checks against the SQL
files; run the scripts in a development or test Supabase project to validate
the live database behavior.

After applying the scripts, run these checks in the SQL Editor.

Confirm all three quiz states and question counts:

```sql
SELECT
  id,
  title,
  CASE
    WHEN now() < starts_at THEN 'Upcoming'
    WHEN now() < ends_at THEN 'Live'
    ELSE 'Finished'
  END AS status,
  (SELECT count(*) FROM public.questions WHERE quiz_id = quiz.id) AS question_count
FROM public.quizzes AS quiz
WHERE id IN (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003'
)
ORDER BY starts_at;
```

Confirm that every seeded question has four options and exactly one correct
option:

```sql
SELECT
  question.id,
  count(answer_option.id) AS option_count,
  count(*) FILTER (WHERE answer_option.is_correct) AS correct_option_count
FROM public.questions AS question
LEFT JOIN public.question_options AS answer_option
  ON answer_option.question_id = question.id
WHERE question.id BETWEEN
  '20000000-0000-4000-8000-000000000001'::uuid
  AND '20000000-0000-4000-8000-000000000005'::uuid
GROUP BY question.id
ORDER BY question.id;
```

If the demo profiles are present, verify their submitted scores:

```sql
SELECT profile.username, score.score, score.total_points, score.time_taken_seconds
FROM public.scores AS score
JOIN public.profiles AS profile ON profile.id = score.user_id
WHERE score.quiz_id = '10000000-0000-4000-8000-000000000002'
ORDER BY score.score DESC, score.time_taken_seconds ASC;
```
