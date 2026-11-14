import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_ANON_KEY;

test('executes a live Supabase database query when test credentials are configured', async (context) => {
  if (!url || !key) {
    context.skip('Set SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY for live integration checks.');
    return;
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from('quizzes').select('id').limit(1);

  assert.ifError(error);
});
