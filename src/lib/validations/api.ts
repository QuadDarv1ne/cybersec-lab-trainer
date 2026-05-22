import { z } from 'zod';

// Schema для сохранения результатов квиза
export const quizResultSchema = z.object({
  quizId: z.string().min(1, 'quizId обязателен'),
  score: z.number().int().min(0, 'score должен быть >= 0'),
  total: z.number().int().min(1, 'total должен быть >= 1'),
}).refine((data) => data.score <= data.total, {
  message: 'score не может превышать total',
  path: ['score'],
});

// Schema для отправки прогресса
export const progressUpdateSchema = z.object({
  moduleId: z.string().min(1, 'moduleId обязателен'),
  completed: z.boolean(),
  score: z.number().int().min(0).max(100).optional(),
});

// Schema для поиска в глоссарии
export const glossarySearchSchema = z.object({
  query: z.string().min(1, 'Поисковый запрос обязателен').max(100),
  category: z.string().optional(),
});

// Schema для пакетной синхронизации (заменяет N+1 вызовов)
export const batchSyncSchema = z.object({
  modules: z.array(z.object({
    moduleId: z.string().min(1),
    completed: z.boolean(),
    score: z.number().int().min(0).max(100).optional(),
  })).max(50).optional().default([]),
  quizzes: z.array(z.object({
    quizId: z.string().min(1),
    score: z.number().int().min(0),
    total: z.number().int().min(1),
  })).max(50).refine((items) => items.every((item) => item.score <= item.total), {
    message: 'score не может превышать total',
  }).optional().default([]),
});

// Schema для сохранения прогресса челленджей
export const challengeProgressSchema = z.object({
  challengeType: z.enum(['owasp', 'auth', 'headers', 'secure-coding']),
  correct: z.number().int().min(0),
  total: z.number().int().min(0),
  answered: z.array(z.number()).max(1000).optional(),
  selectedOptions: z.record(z.string(), z.number()).refine((obj) => Object.keys(obj).length <= 100, {
    message: 'selectedOptions не может содержать более 100 записей',
  }).optional(),
}).refine((data) => data.correct <= data.total, {
  message: 'correct не может превышать total',
  path: ['correct'],
});

// Schema для пакетной синхронизации челленджей
export const challengeBatchSchema = z.object({
  challenges: z.array(challengeProgressSchema).max(50).optional().default([]),
});

// Schema для синхронизации детализированного прогресса по элементам модулей
export const itemProgressSchema = z.object({
  moduleId: z.string().min(1, 'moduleId обязателен'),
  itemIds: z.array(z.string().min(1)).max(500).optional().default([]),
});

export const itemProgressBatchSchema = z.object({
  items: z.array(itemProgressSchema).max(20).optional().default([]),
});

// Типы для схем
export type QuizResult = z.infer<typeof quizResultSchema>;
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;
export type GlossarySearch = z.infer<typeof glossarySearchSchema>;
export type ChallengeProgress = z.infer<typeof challengeProgressSchema>;