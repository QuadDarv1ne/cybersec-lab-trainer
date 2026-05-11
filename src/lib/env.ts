import { z } from 'zod';

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
  
  // Optional
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const env = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
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

  // Warn about missing optional auth providers
  const missingAuth = [];
  if (!env.GITHUB_ID && !env.GOOGLE_CLIENT_ID) {
    missingAuth.push('No OAuth providers configured (GITHUB_ID or GOOGLE_CLIENT_ID)');
  }
  if (missingAuth.length > 0) {
    process.stderr.write(`[Env] Warning: ${missingAuth.join(', ')}\n`);
  }

  return result.data;
}

// Export validated env object for type-safe access
export const env = validateEnv();
