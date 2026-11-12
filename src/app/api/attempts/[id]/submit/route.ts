import { NextRequest } from 'next/server';
import { AttemptsService } from '@/services/attempts.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;

    if (!attemptId) {
      return apiError('Attempt ID is required', 400);
    }

    const result = await AttemptsService.submitAttempt(attemptId);

    return apiSuccess(result, 200);
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
