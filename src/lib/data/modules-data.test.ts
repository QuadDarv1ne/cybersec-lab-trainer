import { describe, it, expect } from 'vitest';
import {
  isModuleAccessible,
  getNextLearningPathModule,
  learningPathOrder,
} from './modules-data';

describe('modules-data', () => {
  describe('learningPathOrder', () => {
    it('contains all modules in the path', () => {
      expect(learningPathOrder).toHaveLength(11);
    });

    it('starts with owasp', () => {
      expect(learningPathOrder[0]).toBe('owasp');
    });

    it('ends with devsecops-simulation', () => {
      expect(learningPathOrder[learningPathOrder.length - 1]).toBe('devsecops-simulation');
    });
  });

  describe('isModuleAccessible', () => {
    it('first module is always accessible', () => {
      expect(isModuleAccessible('owasp', [])).toBe(true);
    });

    it('module not in path is accessible', () => {
      expect(isModuleAccessible('nonexistent', [])).toBe(true);
    });

    it('completed module is accessible', () => {
      expect(isModuleAccessible('sql-injection', ['sql-injection'])).toBe(true);
    });

    it('second module not accessible without first', () => {
      expect(isModuleAccessible('sql-injection', [])).toBe(false);
    });

    it('second module accessible after first', () => {
      expect(isModuleAccessible('sql-injection', ['owasp'])).toBe(true);
    });

    it('third module not accessible without first two', () => {
      expect(isModuleAccessible('xss', ['owasp'])).toBe(false);
    });

    it('third module accessible after first two', () => {
      expect(isModuleAccessible('xss', ['owasp', 'sql-injection'])).toBe(true);
    });

    it('later module not accessible with gaps', () => {
      // Completed owasp and xss, but not sql-injection
      expect(isModuleAccessible('csrf', ['owasp', 'xss'])).toBe(false);
    });
  });

  describe('getNextLearningPathModule', () => {
    it('returns first module when nothing completed', () => {
      expect(getNextLearningPathModule([])).toBe('owasp');
    });

    it('returns next module after first completed', () => {
      expect(getNextLearningPathModule(['owasp'])).toBe('sql-injection');
    });

    it('returns next module with partial completion', () => {
      expect(getNextLearningPathModule(['owasp', 'sql-injection', 'xss'])).toBe('csrf');
    });

    it('returns null when all completed', () => {
      expect(getNextLearningPathModule(learningPathOrder)).toBe(null);
    });
  });
});
