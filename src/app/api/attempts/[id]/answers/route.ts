import { NextRequest } from 'next/server';
import { AttemptsService } from '@/services/attempts.service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { SaveAnswerRequest } from '@/types/attempts';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;

    if (!attemptId) {
      return apiError('Attempt ID is required', 400);
    }

    const body = (await request.json().catch(() => null)) as SaveAnswerRequest | null;

    if (!body?.questionId) {
      return apiError('Missing required field: questionId', 400);
    }

    // optionId can be null if user unselects/clears their answer
    const result = await AttemptsService.saveAnswer(attemptId, body.questionId, body.optionId ?? null);

    return apiSuccess(result, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Authentication required')
      ? 401
      : message.includes('expired')
      ? 410 // 410 Gone / Expired
      : message.includes('not found')
      ? 404
      : 400;

    return apiError(message, status);
  }
}
