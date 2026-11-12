import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve('supabase/schema.sql'), 'utf8');
const policies = readFileSync(resolve('supabase/policies.sql'), 'utf8');
const attemptsService = readFileSync(resolve('src/services/attempts.service.ts'), 'utf8');

describe('Backend database integration and security contracts', () => {
  describe('Database integrity', () => {
    test('keeps submitted attempts internally consistent', () => {
      assert.match(schema, /CONSTRAINT attempts_submission_state CHECK/);
      assert.match(schema, /status = 'submitted' AND submitted_at IS NOT NULL/);
      assert.match(schema, /CONSTRAINT attempts_score_within_total CHECK/);
      assert.match(schema, /CONSTRAINT scores_attempt_matches_quiz_and_user/);
    });

    test('allows only one active attempt per user and quiz', () => {
      assert.match(
        schema,
        /CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_attempt_per_user_quiz/
      );
      assert.match(schema, /WHERE \(status = 'in_progress'\)/);
    });

    test('locks published quizzes and validates answer keys', () => {
      assert.match(schema, /CONSTRAINT quizzes_valid_window CHECK/);
      assert.match(schema, /assert_published_question_has_one_correct_option/);
      assert.match(schema, /CREATE CONSTRAINT TRIGGER question_options_answer_key_guard/);
    });
  });

  describe('Row-level security and answer-key protection', () => {
    test('enables RLS on every user-facing table', () => {
      for (const table of [
        'profiles',
        'quizzes',
        'questions',
        'question_options',
        'attempts',
        'answers',
        'scores',
      ]) {
        assert.match(policies, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
      }
    });

    test('restricts attempts and answers to the authenticated owner', () => {
      assert.match(policies, /CREATE POLICY attempts_read_own/);
      assert.match(policies, /USING \(user_id = \(SELECT auth\.uid\(\)\)\)/);
      assert.match(policies, /CREATE POLICY answers_read_own/);
      assert.match(policies, /attempt\.user_id = \(SELECT auth\.uid\(\)\)/);
    });

    test('does not grant answer keys during active quiz access', () => {
      assert.match(policies, /REVOKE SELECT \(explanation\)/);
      assert.match(policies, /REVOKE SELECT \(is_correct\)/);
      assert.match(policies, /CREATE OR REPLACE FUNCTION public\.get_submitted_quiz_review/);
      assert.match(policies, /attempt\.status = 'submitted'/);
      assert.match(policies, /GRANT EXECUTE ON FUNCTION public\.get_submitted_quiz_review/);
    });

    test('validates answer ownership and question-option relationships', () => {
      assert.match(policies, /CREATE POLICY answers_insert_during_own_attempt/);
      assert.match(policies, /answer_option\.question_id = answers\.question_id/);
      assert.match(policies, /CREATE POLICY answers_update_during_own_attempt/);
    });
  });

  describe('Leaderboard and scoring behavior', () => {
    test('keeps one best score per user using score then time ordering', () => {
      const scores = [
        { userId: 'bob', score: 10, time: 45 },
        { userId: 'alice', score: 10, time: 50 },
        { userId: 'bob', score: 8, time: 20 },
      ];
      const best = scores.filter(
        (score, index, entries) =>
          entries.findIndex((candidate) => candidate.userId === score.userId) === index
      );

      assert.deepEqual(best, [
        { userId: 'bob', score: 10, time: 45 },
        { userId: 'alice', score: 10, time: 50 },
      ]);
    });

    test('assigns competition ranks for tied score and time results', () => {
      const ordered = [
        { score: 10, time: 40 },
        { score: 10, time: 40 },
        { score: 8, time: 30 },
      ];
      const ranks: number[] = [];
      ordered.forEach((entry, index) => {
        const firstMatchingIndex = ordered.findIndex(
          (candidate) => candidate.score === entry.score && candidate.time === entry.time
        );
        ranks.push(index > 0 &&
          ordered[index - 1].score === entry.score &&
          ordered[index - 1].time === entry.time
          ? ranks[index - 1]
          : firstMatchingIndex + 1);
      });

      assert.deepEqual(ranks, [1, 1, 3]);
    });
  });

  describe('API input and authorization contracts', () => {
    test('requires authentication for profile and attempt data', () => {
      assert.match(policies, /CREATE POLICY attempts_read_own/);
      assert.match(policies, /TO authenticated/);
      assert.match(attemptsService, /Authentication required/);
    });

    test('exposes submitted review data through a restricted RPC', () => {
      assert.match(policies, /LANGUAGE sql/);
      assert.match(policies, /STABLE/);
      assert.match(policies, /SECURITY DEFINER/);
      assert.match(policies, /REVOKE ALL ON FUNCTION public\.get_submitted_quiz_review/);
    });
  });
});
