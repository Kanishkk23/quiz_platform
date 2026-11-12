import { NextRequest } from 'next/server';
import { AttemptsService } from '@/services/attempts.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return apiError('Attempt ID is required', 400);
    }

    const attemptState = await AttemptsService.getAttempt(id);
    return apiSuccess(attemptState, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Authentication required')
      ? 401
      : message.includes('not found') || message.includes('access denied')
      ? 404
      : 400;

    return apiError(message, status);
  }
}
