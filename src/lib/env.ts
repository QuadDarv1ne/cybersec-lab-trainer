import { z } from 'zod';
import { existsSync } from 'fs';
import { join } from 'path';

const envSchema = z.object({
  // Required
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Optional but recommended for auth
  GITHUB_ID: z.string().min(1).optional(),
  GITHUB_SECRET: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Required for production, optional for dev (crypto exercises)
  JWT_SECRET: process.env.NODE_ENV === 'production'
    ? z.string().min(1, 'JWT_SECRET is required in production')
    : z.string().optional(),

  // Optional
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type Env = z.infer<typeof envSchema>;

// Check for .env.local file existence (run once at module load)
const hasEnvLocal = existsSync(join(process.cwd(), '.env.local'));
const nextEnvLocal = existsSync(join(process.cwd(), '.next', '.env.local'));

// Global flag to prevent duplicate warnings across parallel workers
declare global {
  var __oauthWarningShown: boolean;
  var __envLocalChecked: boolean;
}

globalThis.__oauthWarningShown = globalThis.__oauthWarningShown ?? false;

if (!globalThis.__envLocalChecked && !hasEnvLocal && !nextEnvLocal && process.env.NODE_ENV !== 'production') {
  globalThis.__envLocalChecked = true;
  process.stderr.write(
    '\x1b[33m[Env] Warning: .env.local file not found.\x1b[0m\n' +
    '  Copy .env.example to .env.local and configure your environment variables.\n' +
    '  Run: copy .env.example .env.local\n\n'
  );
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

  // Warn about missing optional auth providers (only once across all workers)
  if (!globalThis.__oauthWarningShown && !env.GITHUB_ID && !env.GOOGLE_CLIENT_ID) {
    globalThis.__oauthWarningShown = true;
    process.stderr.write(
      '\x1b[33m[Env] Warning: No OAuth providers configured.\x1b[0m\n' +
      '  To enable GitHub OAuth: set GITHUB_ID and GITHUB_SECRET in .env.local\n' +
      '  To enable Google OAuth: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET\n' +
      '  See .env.example for template\n\n'
    );
  }

  return result.data;
}

// Export validated env object for type-safe access
export const env = validateEnv();
