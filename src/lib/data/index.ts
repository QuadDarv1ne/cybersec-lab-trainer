// Security Data Index - re-exports from modular data files

export { owaspTopics } from './owasp-data';
export type { OWASPTopic } from './owasp-data';

export { sqlChallenges } from './sql-data';
export type { SQLChallenge } from './sql-data';

export { xssTypes } from './xss-data';
export type { XSSType } from './xss-data';

export { csrfSteps } from './csrf-data';
export type { CSRFStep } from './csrf-data';

export { quizQuestions, quizCategories } from './quiz-data';
export type { QuizQuestion } from './quiz-data';

export { secureCodingChallenges, modules } from './modules-data';
export type { SecureCodingChallenge, Module } from './modules-data';

export { achievements, glossaryTerms } from './glossary-data';
export type { Achievement, GlossaryTerm } from './glossary-data';