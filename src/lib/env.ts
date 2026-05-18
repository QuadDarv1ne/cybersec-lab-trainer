import { z } from 'zod';

const isServer = typeof window === 'undefined';

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GITHUB_ID: z.string().min(1).optional(),
  GITHUB_SECRET: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  JWT_SECRET: process.env.NODE_ENV === 'production'
    ? z.string().min(1, 'JWT_SECRET is required in production')
    : z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function warnMissingEnvFile(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { existsSync } = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require('path') as typeof import('path');
    const cwd = process.cwd();
    if (!existsSync(join(cwd, '.env.local')) && !existsSync(join(cwd, '.next', '.env.local'))) {
      process.stderr.write(
        '\x1b[33m[Env] Warning: .env.local file not found.\x1b[0m\n' +
        '  Copy .env.example to .env.local and configure your environment variables.\n' +
        '  Run: copy .env.example .env.local\n\n'
      );
    }
  } catch {
    // fs not available (browser or edge runtime) — skip warning
  }
}

export function validateEnv(): Env {
  const env = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    throw new Error(
      `Invalid environment variables:\n${errors.join('\n')}\n\n` +
      'Check your .env.local file and ensure all required variables are set.'
    );
  }

  return result.data;
}

// Validate at module load time only on the server
if (isServer) {
  warnMissingEnvFile();
  validateEnv();
}
