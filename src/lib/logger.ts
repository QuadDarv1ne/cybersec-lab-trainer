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

function createLogger(context: string) {
  return {
    debug(...args: unknown[]) {
      if (isDevelopment) {
        const [message = '', ...rest] = args;
        console.debug(...formatLog('DEBUG', context, String(message), rest));
      }
    },

    info(...args: unknown[]) {
      if (isDevelopment) {
        const [message = '', ...rest] = args;
        console.info(...formatLog('INFO', context, String(message), rest));
      }
    },

    warn(...args: unknown[]) {
      const [message = '', ...rest] = args;
      console.warn(...formatLog('WARN', context, String(message), rest));
    },

    error(...args: unknown[]) {
      const [message = 'Unknown error', ...rest] = args;
      console.error(...formatLog('ERROR', context, String(message), rest));
    },
  };
}

export const logger = createLogger('App');
