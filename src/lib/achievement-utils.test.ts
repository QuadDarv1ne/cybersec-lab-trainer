import { describe, it, expect } from 'vitest';
import { getAchievementStatus } from './achievement-utils';

describe('achievement-utils', () => {
  describe('getAchievementStatus', () => {
    it('returns unlocked for first module completion', () => {
      const status = getAchievementStatus('first-steps', ['owasp'], {});
      expect(status).toBe(true);
    });

    it('returns locked for first module when no modules completed', () => {
      const status = getAchievementStatus('first-steps', [], {});
      expect(status).toBe(false);
    });

    it('returns unlocked for quiz-perfect when score is 100', () => {
      const status = getAchievementStatus('quiz-perfect', [], { owasp: 100 });
      expect(status).toBe(true);
    });

    it('returns locked for quiz-perfect when no perfect score', () => {
      const status = getAchievementStatus('quiz-perfect', [], { owasp: 80 });
      expect(status).toBe(false);
    });

    it('returns unlocked for quiz-master when 3+ categories scored', () => {
      const status = getAchievementStatus('quiz-master', [], { owasp: 80, sql: 70, xss: 90 });
      expect(status).toBe(true);
    });

    it('returns locked for quiz-master when fewer than 3 categories', () => {
      const status = getAchievementStatus('quiz-master', [], { owasp: 80 });
      expect(status).toBe(false);
    });

    it('returns unlocked for sql-master when sql-injection completed', () => {
      const status = getAchievementStatus('sql-master', ['sql-injection'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for xss-hunter when xss completed', () => {
      const status = getAchievementStatus('xss-hunter', ['xss'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for security-guard when owasp completed', () => {
      const status = getAchievementStatus('security-guard', ['owasp'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for auth-expert when auth completed', () => {
      const status = getAchievementStatus('auth-expert', ['auth'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for code-reviewer when secure-coding completed', () => {
      const status = getAchievementStatus('code-reviewer', ['secure-coding'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for crypto-ninja when tools completed', () => {
      const status = getAchievementStatus('crypto-ninja', ['tools'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for headers-master when security-headers completed', () => {
      const status = getAchievementStatus('headers-master', ['security-headers'], {});
      expect(status).toBe(true);
    });

    it('returns unlocked for full-completion when all modules completed', () => {
      const allModules = ['owasp', 'sql-injection', 'xss', 'csrf', 'auth', 'secure-coding', 'tools', 'security-headers'];
      const status = getAchievementStatus('full-completion', allModules, {});
      expect(status).toBe(true);
    });

    it('returns locked for full-completion when not all modules completed', () => {
      const status = getAchievementStatus('full-completion', ['owasp'], {});
      expect(status).toBe(false);
    });

    it('returns unlocked for owasp-challenger when 11+ correct answers', () => {
      const status = getAchievementStatus('owasp-challenger', [], {}, { owaspCorrect: 11, authCorrect: 0 });
      expect(status).toBe(true);
    });

    it('returns locked for owasp-challenger when fewer than 11 correct', () => {
      const status = getAchievementStatus('owasp-challenger', [], {}, { owaspCorrect: 5, authCorrect: 0 });
      expect(status).toBe(false);
    });

    it('returns unlocked for auth-challenger when 8+ correct answers', () => {
      const status = getAchievementStatus('auth-challenger', [], {}, { owaspCorrect: 0, authCorrect: 8 });
      expect(status).toBe(true);
    });

    it('returns unlocked for quiz-streak when 3+ high scores', () => {
      const status = getAchievementStatus('quiz-streak', [], { owasp: 85, sql: 90, xss: 80 });
      expect(status).toBe(true);
    });

    it('returns locked for quiz-streak when fewer than 3 high scores', () => {
      const status = getAchievementStatus('quiz-streak', [], { owasp: 85, sql: 50 });
      expect(status).toBe(false);
    });

    it('returns unlocked for all-categories when 8+ categories', () => {
      const scores = { owasp: 80, sql: 70, xss: 90, csrf: 85, auth: 75, coding: 80, tools: 95, headers: 70 };
      const status = getAchievementStatus('all-categories', [], scores);
      expect(status).toBe(true);
    });

    it('returns unlocked for first-challenge when any correct answer', () => {
      const status = getAchievementStatus('first-challenge', [], {}, { owaspCorrect: 1, authCorrect: 0 });
      expect(status).toBe(true);
    });

    it('returns locked for first-challenge when no correct answers', () => {
      const status = getAchievementStatus('first-challenge', [], {}, { owaspCorrect: 0, authCorrect: 0 });
      expect(status).toBe(false);
    });

    it('returns unlocked for perfect-challenges when all answers correct', () => {
      const status = getAchievementStatus('perfect-challenges', [], {}, {
        owaspCorrect: 10, owaspTotal: 10,
        authCorrect: 5, authTotal: 5,
      });
      expect(status).toBe(true);
    });

    it('returns locked for perfect-challenges when any answer wrong', () => {
      const status = getAchievementStatus('perfect-challenges', [], {}, {
        owaspCorrect: 9, owaspTotal: 10,
        authCorrect: 5, authTotal: 5,
      });
      expect(status).toBe(false);
    });

    it('returns false for unknown achievement id', () => {
      const status = getAchievementStatus('unknown-achievement', [], {});
      expect(status).toBe(false);
    });
  });
});
