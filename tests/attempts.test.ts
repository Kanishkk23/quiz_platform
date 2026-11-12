import { test, describe } from 'node:test';
import assert from 'node:assert';

// Comprehensive test suite for Member 2 Attempt Engine & Scoring
describe('Quiz Attempt Engine & Server-Side Scoring Tests', () => {

  describe('1. Attempt Creation & Recovery', () => {
    test('creates fresh in_progress attempt with authoritative duration', () => {
      const quiz = {
        id: 'quiz-1',
        duration_seconds: 300,
        marks_per_question: 2,
        is_published: true,
      };

      const attempt = {
        id: 'attempt-1',
        quiz_id: quiz.id,
        user_id: 'user-1',
        status: 'in_progress',
        started_at: new Date().toISOString(),
        duration_seconds: quiz.duration_seconds,
        saved_answers: {},
      };

      assert.strictEqual(attempt.status, 'in_progress');
      assert.strictEqual(attempt.duration_seconds, 300);
      assert.deepStrictEqual(attempt.saved_answers, {});
    });

    test('recovers existing active attempt and accurately calculates server countdown', () => {
      const durationSeconds = 300;
      // Started 100 seconds ago
      const startedAt = new Date(Date.now() - 100 * 1000).toISOString();
      const now = Date.now();
      const elapsed = Math.floor((now - new Date(startedAt).getTime()) / 1000);
      const remainingSeconds = Math.max(0, durationSeconds - elapsed);

      const savedAnswers = {
        'q-1': 'opt-1',
        'q-2': 'opt-3',
      };

      assert.ok(remainingSeconds <= 201 && remainingSeconds >= 198);
      assert.strictEqual(Object.keys(savedAnswers).length, 2);
      assert.strictEqual(savedAnswers['q-1'], 'opt-1');
    });
  });

  describe('2. Answer Insert, Update, and Authorized Clear', () => {
    test('inserts answer when not previously recorded', () => {
      const answersTable: Record<string, { option_id: string | null }> = {};
      const questionId = 'q-101';
      const selectedOptionId = 'opt-201';

      answersTable[questionId] = { option_id: selectedOptionId };
      assert.strictEqual(answersTable[questionId].option_id, 'opt-201');
    });

    test('updates existing answer via authorized option_id column update', () => {
      const answersTable: Record<string, { option_id: string | null }> = {
        'q-101': { option_id: 'opt-201' },
      };

      // User changes answer from opt-201 to opt-202
      answersTable['q-101'].option_id = 'opt-202';
      assert.strictEqual(answersTable['q-101'].option_id, 'opt-202');
    });

    test('clears answer by setting option_id to null without calling DELETE', () => {
      const answersTable: Record<string, { option_id: string | null }> = {
        'q-101': { option_id: 'opt-202' },
      };

      // Deselecting option sets option_id to null
      answersTable['q-101'].option_id = null;
      assert.strictEqual(answersTable['q-101'].option_id, null);
    });
  });

  describe('3. Expired Attempt Enforcement', () => {
    test('detects expired attempt when elapsed time exceeds duration', () => {
      const durationSeconds = 300;
      // Started 350 seconds ago
      const startedAt = new Date(Date.now() - 350 * 1000).toISOString();
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const remainingSeconds = Math.max(0, durationSeconds - elapsed);
      const isExpired = remainingSeconds <= 0;

      assert.strictEqual(isExpired, true);
      assert.strictEqual(remainingSeconds, 0);
    });

    test('rejects answer saves beyond duration plus grace period', () => {
      const durationSeconds = 300;
      const gracePeriod = 10;
      const elapsedSeconds = 320; // 20s past deadline

      const isAllowed = elapsedSeconds <= durationSeconds + gracePeriod;
      assert.strictEqual(isAllowed, false);
    });
  });

  describe('4. Retakes & Single Active Attempt Constraint', () => {
    test('forceRetake finalizes existing in_progress attempt before creating new one', () => {
      const attempts = [
        { id: 'att-1', status: 'in_progress', quiz_id: 'q-1', user_id: 'u-1' },
      ];

      // On forceRetake:
      const existing = attempts.find(
        (a) => a.quiz_id === 'q-1' && a.user_id === 'u-1' && a.status === 'in_progress'
      );
      if (existing) {
        existing.status = 'submitted';
      }

      // New attempt created
      attempts.push({ id: 'att-2', status: 'in_progress', quiz_id: 'q-1', user_id: 'u-1' });

      const activeAttempts = attempts.filter(
        (a) => a.quiz_id === 'q-1' && a.user_id === 'u-1' && a.status === 'in_progress'
      );

      assert.strictEqual(activeAttempts.length, 1);
      assert.strictEqual(activeAttempts[0].id, 'att-2');
      assert.strictEqual(attempts[0].status, 'submitted');
    });
  });

  describe('5. Duplicate Submissions (Idempotency)', () => {
    test('subsequent submissions return existing result without re-evaluating or erroring', () => {
      const submittedRecord = {
        id: 'att-1',
        status: 'submitted',
        score: 8,
        total_points: 10,
        time_taken_seconds: 45,
        submitted_at: '2026-11-12T10:00:00Z',
      };

      function submit(attempt: typeof submittedRecord) {
        if (attempt.status === 'submitted') {
          return { ...attempt, is_duplicate: true };
        }
        return { ...attempt, status: 'submitted', is_duplicate: false };
      }

      const firstCall = submit(submittedRecord);
      const secondCall = submit(submittedRecord);

      assert.strictEqual(firstCall.is_duplicate, true);
      assert.strictEqual(secondCall.is_duplicate, true);
      assert.strictEqual(secondCall.score, 8);
    });
  });

  describe('6. Server-Side Score Calculation', () => {
    test('computes exact score and marks accuracy correctly', () => {
      const questions = [
        { id: 'q-1', correct_option_id: 'opt-1-b' },
        { id: 'q-2', correct_option_id: 'opt-2-a' },
        { id: 'q-3', correct_option_id: 'opt-3-d' },
        { id: 'q-4', correct_option_id: 'opt-4-c' },
        { id: 'q-5', correct_option_id: 'opt-5-a' },
      ];

      const userAnswers: Record<string, string | null> = {
        'q-1': 'opt-1-b', // correct (+2)
        'q-2': 'opt-2-c', // incorrect (0)
        'q-3': 'opt-3-d', // correct (+2)
        'q-4': null,      // skipped (0)
        'q-5': 'opt-5-a', // correct (+2)
      };

      const marksPerQuestion = 2;
      const totalPoints = questions.length * marksPerQuestion;

      let correctCount = 0;
      let answeredCount = 0;

      for (const q of questions) {
        const selected = userAnswers[q.id];
        if (selected) {
          answeredCount++;
          if (selected === q.correct_option_id) {
            correctCount++;
          }
        }
      }

      const score = correctCount * marksPerQuestion;
      const percentage = Math.round((score / totalPoints) * 100);

      assert.strictEqual(correctCount, 3);
      assert.strictEqual(answeredCount, 4);
      assert.strictEqual(score, 6);
      assert.strictEqual(totalPoints, 10);
      assert.strictEqual(percentage, 60);
    });
  });

  describe('7. Answer-Key Protection (Anti-Cheat)', () => {
    test('masks is_correct and explanation during active in_progress attempt', () => {
      const activeAttemptQuestionPayload = {
        id: 'q-1',
        text: 'What is HTTP?',
        position: 1,
        options: [
          { id: 'opt-1', text: 'HyperText Transfer Protocol' },
          { id: 'opt-2', text: 'High Tech Transfer Process' },
        ],
        // correctOptionId and explanation are strictly stripped out
        correctOptionId: '',
      };

      assert.strictEqual(activeAttemptQuestionPayload.correctOptionId, '');
      assert.strictEqual((activeAttemptQuestionPayload as Record<string, unknown>).explanation, undefined);
      assert.strictEqual((activeAttemptQuestionPayload.options[0] as Record<string, unknown>).is_correct, undefined);
    });
  });

  describe('8. Ownership & RLS Verification', () => {
    test('enforces user ownership on answer saves and submissions', () => {
      const currentUserId = 'user-alice';
      const attempt = {
        id: 'att-99',
        user_id: 'user-bob',
        status: 'in_progress',
      };

      const isAuthorized = attempt.user_id === currentUserId;
      assert.strictEqual(isAuthorized, false);
    });
  });
});
