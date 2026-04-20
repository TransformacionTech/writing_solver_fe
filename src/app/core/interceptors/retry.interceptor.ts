import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { retry, timer } from 'rxjs';

/**
 * Retry network-level failures (cold-start Render, QUIC_TOO_MANY_RTOS,
 * dropped connections). We only retry when the response never reached the
 * server — HTTP status codes ≠ 0 are real errors and bubble up untouched.
 *
 * Attempts: up to 3 (initial + 2 retries) with exponential backoff 800ms → 2s.
 */
export const retryInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Don't retry SSE / stream endpoints — they open a long-lived connection and
  // retry would duplicate events. They're also consumed via fetch() elsewhere.
  const isStream = req.url.includes('/run-stream') || req.url.includes('/pipeline/run');
  if (isStream) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, attempt) => {
        const isNetworkFailure =
          error instanceof HttpErrorResponse &&
          (error.status === 0 ||
            /QUIC_|ERR_NETWORK|ERR_CONNECTION|ERR_FAILED/i.test(error.message ?? ''));
        if (!isNetworkFailure) {
          // Not a cold-start / network glitch — stop retrying.
          throw error;
        }
        // 800ms, 2000ms
        const backoffMs = attempt === 1 ? 800 : 2000;
        return timer(backoffMs);
      },
    }),
  );
};
