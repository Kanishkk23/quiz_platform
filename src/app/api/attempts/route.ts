import { NextRequest } from 'next/server';
import { AttemptsService } from '@/services/attempts.service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { CreateAttemptRequest } from '@/types/attempts';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as CreateAttemptRequest | null;

    if (!body?.quizId) {
      return apiError('Missing required field: quizId', 400);
    }

    const result = await AttemptsService.startOrResumeAttempt(body.quizId, body.forceRetake);

    return apiSuccess(result, result.isResumed ? 200 : 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Authentication required')
      ? 401
      : message.includes('not found')
      ? 404
      : 400;

    return apiError(message, status);
  }
}
