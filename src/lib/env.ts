export function validateEnv() {
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
  ] as const;

  const missing: string[] = [];
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env.local and set these values.'
    );
  }

  // Optional but warn if missing
  const optional = ['GITHUB_ID', 'GITHUB_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const;
  const missingOptional = optional.filter((k) => !process.env[k]);
  if (missingOptional.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(`Warning: Optional OAuth providers not configured: ${missingOptional.join(', ')}`);
  }
}
