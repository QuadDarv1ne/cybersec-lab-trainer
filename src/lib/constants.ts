// Shared constants used across the application

/**
 * Base URL of the application.
 * In production, set NEXTAUTH_URL environment variable.
 */
export const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * All valid page types — single source of truth.
 * Used by both client (store.ts) and server (validations/api.ts).
 */
export const PAGE_TYPES = [
  'dashboard',
  'owasp',
  'sql-injection',
  'xss',
  'csrf',
  'auth',
  'secure-coding',
  'tools',
  'security-headers',
  'quiz',
  'achievements',
  'notes',
  'analytics',
  'settings',
  'weakness-review',
  'blog',
  'ctf-labs',
  'advanced-ctf',
  'real-app-simulation',
  'devsecops-simulation',
  'admin',
  'teacher',
  'leaderboard',
  'profile',
] as const satisfies string[];
