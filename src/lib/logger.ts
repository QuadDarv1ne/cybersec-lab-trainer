/**
 * Logging utility that wraps console methods and disables them in production
 * to prevent sensitive information leakage while maintaining debug capability in development.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    // Always log errors, but format them consistently
    const [message, ...rest] = args;
    // eslint-disable-next-line no-console
    console.error(`[App] ${message}`, ...rest);
  },
};
