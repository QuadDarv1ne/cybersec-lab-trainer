/**
 * Structured logging utility with context-scoped loggers and timestamps.
 *
 * Usage:
 *   import { logger, createLogger } from '@/lib/logger';
 *
 *   // Default app-level logger
 *   logger.error('Something went wrong', err);
 *
 *   // Module-scoped logger with context prefix
 *   const log = createLogger('batch-sync');
 *   log.info('Starting sync', { modules: 5, quizzes: 3 });
 *   log.error('Transaction failed', err);
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const timestamp = () => new Date().toISOString();

function formatLog(
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
  context: string,
  message: string,
  rest: unknown[],
): [string, ...unknown[]] {
  const ts = timestamp();
  const header = `[${ts}] [${level}] [${context}]`;
  return [header, message, ...rest];
}

function createScopedLogger(context: string) {
  return {
    debug(...args: unknown[]) {
      if (isDevelopment) {
        const [message = '', ...rest] = args;
        // eslint-disable-next-line no-console
        console.debug(...formatLog('DEBUG', context, String(message), rest));
      }
    },

    info(...args: unknown[]) {
      if (isDevelopment) {
        const [message = '', ...rest] = args;
        // eslint-disable-next-line no-console
        console.info(...formatLog('INFO', context, String(message), rest));
      }
    },

    warn(...args: unknown[]) {
      const [message = '', ...rest] = args;
      // eslint-disable-next-line no-console
      console.warn(...formatLog('WARN', context, String(message), rest));
    },

    error(...args: unknown[]) {
      const [message = 'Unknown error', ...rest] = args;
      // eslint-disable-next-line no-console
      console.error(...formatLog('ERROR', context, String(message), rest));
    },
  };
}

export function createLogger(context: string) {
  return createScopedLogger(context);
}

export const logger = createScopedLogger('App');
