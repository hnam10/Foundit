/**
 * Dev-only debug logging.
 *
 * Every helper is a no-op unless NODE_ENV === 'development'. Next.js inlines
 * NODE_ENV at build time, so production bundles ship none of this output.
 *
 * Usage:
 *   debugLog('claim-form', 'validation failed', { fields: ['category'] });
 *   const done = debugTimer('api', 'POST /api/claims');
 *   ...await fetch...
 *   done('201 Created');
 *
 * Conventions:
 *   • scope — short kebab-case area tag ('api', 'claim-form', 'auth'). Makes
 *     console output filterable by typing "[foundit:api]" in the devtools
 *     filter box.
 *   • Never log secrets (tokens, passwords) or full user-typed content; log
 *     lengths/shapes instead. Dev consoles get screen-shared.
 */

const DEV = process.env.NODE_ENV === 'development';

function prefix(scope: string): string {
  return `[foundit:${scope}]`;
}

export function debugLog(scope: string, message: string, data?: unknown) {
  if (!DEV) return;
  if (data === undefined) {
    console.info(`${prefix(scope)} ${message}`);
  } else {
    console.info(`${prefix(scope)} ${message}`, data);
  }
}

export function debugWarn(scope: string, message: string, data?: unknown) {
  if (!DEV) return;
  if (data === undefined) {
    console.warn(`${prefix(scope)} ${message}`);
  } else {
    console.warn(`${prefix(scope)} ${message}`, data);
  }
}

export function debugError(scope: string, message: string, error?: unknown) {
  if (!DEV) return;
  console.error(`${prefix(scope)} ${message}`, error ?? '');
}

/**
 * Start a timer; the returned function logs the elapsed time plus an optional
 * outcome note. No-op (returns a no-op) outside development.
 */
export function debugTimer(
  scope: string,
  label: string
): (outcome?: string) => void {
  if (!DEV) return () => {};
  const startedAt = performance.now();
  return (outcome?: string) => {
    const ms = Math.round(performance.now() - startedAt);
    console.info(
      `${prefix(scope)} ${label} — ${ms}ms${outcome ? ` (${outcome})` : ''}`
    );
  };
}
