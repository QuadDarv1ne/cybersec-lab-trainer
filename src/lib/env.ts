import { z } from 'zod';
import { existsSync } from 'fs';
import { join } from 'path';

const envSchema = z.object({
  // Required
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Optional (CredentialsProvider fallback is used if none configured)
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

if (!hasEnvLocal && !nextEnvLocal && process.env.NODE_ENV !== 'production') {
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

  return result.data;
}

// Validate at module load time for early error detection
validateEnv();
