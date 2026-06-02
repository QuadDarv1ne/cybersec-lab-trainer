/**
 * Client-safe RBAC types and constants.
 * Import this file in client components instead of rbac.ts
 * to avoid pulling in server-only dependencies.
 */

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Студент',
  TEACHER: 'Преподаватель',
  ADMIN: 'Администратор',
};

export const ROLE_COLORS: Record<Role, string> = {
  STUDENT: 'text-blue-500',
  TEACHER: 'text-emerald-500',
  ADMIN: 'text-purple-500',
};

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  STUDENT: 'bg-blue-100 text-blue-700 border-blue-200',
  TEACHER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
};
