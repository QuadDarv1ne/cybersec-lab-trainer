import { z } from 'zod';

// Schema для сохранения результатов квиза
export const quizResultSchema = z.object({
  quizId: z.string().min(1, 'quizId обязателен'),
  score: z.number().int().min(0, 'score должен быть >= 0'),
  total: z.number().int().min(1, 'total должен быть >= 1'),
  answers: z.array(z.record(z.string(), z.unknown())).optional(),
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
  })).optional().default([]),
  quizzes: z.array(z.object({
    quizId: z.string().min(1),
    score: z.number().int().min(0),
    total: z.number().int().min(1),
  })).optional().default([]),
});

// Schema для пользовательских данных
export const userDataSchema = z.object({
  userId: z.string().min(1, 'userId обязателен'),
  action: z.enum(['complete', 'progress', 'quiz']),
  data: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.record(z.string(), z.unknown()),
  ])),
});

// Типы для схем
export type QuizResult = z.infer<typeof quizResultSchema>;
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;
export type GlossarySearch = z.infer<typeof glossarySearchSchema>;
export type UserData = z.infer<typeof userDataSchema>;