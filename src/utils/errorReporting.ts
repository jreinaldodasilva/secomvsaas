import type { ErrorInfo } from 'react';

/**
 * Reports an unhandled error to the configured monitoring backend.
 *
 * Currently logs to console. To integrate an SDK (e.g. Sentry):
 *   1. Install the SDK: `npm install @sentry/react`
 *   2. Initialise it in `src/index.tsx` with your DSN.
 *   3. Replace the console.error call below with `Sentry.captureException(error, { extra: { componentStack: info.componentStack } })`.
 */
export function reportError(error: Error, info: ErrorInfo): void {
  console.error('[ErrorBoundary]', error, info.componentStack);
}
