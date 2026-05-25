// Security Data Index - re-exports from modular data files

export { owaspTopics, owaspChallenges } from './owasp-data';
export type { OWASPTopic, OWASPChallenge } from './owasp-data';

export { sqlChallenges } from './sql-data';
export type { SQLChallenge } from './sql-data';

export { xssTypes } from './xss-data';
export type { XSSType } from './xss-data';

export { csrfChallenges, csrfMitigations } from './csrf-data';
export type { CSRFChallenge } from './csrf-data';

export { quizQuestions, quizCategories } from './quiz-data';
export type { QuizQuestion } from './quiz-data';

export { secureCodingChallenges, modules } from './modules-data';
export type { SecureCodingChallenge, Module } from './modules-data';

export { achievements, glossaryTerms } from './glossary-data';
export type { Achievement, GlossaryTerm } from './glossary-data';

export { securityHeaders, headerChallenges } from './security-headers-data';
export type { SecurityHeaderTopic, HeaderChallenge } from './security-headers-data';

export { authChallenges } from './auth-challenges-data';
export type { AuthChallenge } from './auth-challenges-data';

export { ctfLabs, DIFFICULTY_META, CATEGORY_META } from './ctf-labs-data';
export type { CTFLab } from './ctf-labs-data';

export { blogArticles, articleCategories, searchArticles } from './blog-data';
export type { BlogArticle } from './blog-data';