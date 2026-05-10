import { z } from 'zod';

// Schema для квиза
export const quizAnswerSchema = z.object({
  questionId: z.string().min(1, 'questionId обязателен'),
  answerIndex: z.number().int().min(0),
});

export const quizAnswersSchema = z.array(quizAnswerSchema);

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

// Schema для пользовательских данных
export const userDataSchema = z.object({
  userId: z.string().min(1, 'userId обязателен'),
  action: z.enum(['complete', 'progress', 'quiz']),
  data: z.record(z.string(), z.any()),
});

// Типы для схем
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type QuizAnswers = z.infer<typeof quizAnswersSchema>;
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;
export type GlossarySearch = z.infer<typeof glossarySearchSchema>;
export type UserData = z.infer<typeof userDataSchema>;