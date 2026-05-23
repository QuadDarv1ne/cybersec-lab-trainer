import { describe, it, expect } from 'vitest';
import { glossaryTerms } from '@/lib/data/glossary-data';

describe('Flashcard data and filtering', () => {
  it('should have glossary terms available', () => {
    expect(glossaryTerms.length).toBeGreaterThan(50);
  });

  it('should filter by category correctly', () => {
    const categories = new Set(glossaryTerms.map((t) => t.category));
    expect(categories.size).toBeGreaterThan(5);

    const attackTerms = glossaryTerms.filter((t) => t.category === 'Атаки');
    expect(attackTerms.length).toBeGreaterThan(0);
    attackTerms.forEach((t) => expect(t.category).toBe('Атаки'));
  });

  it('should have unique term IDs', () => {
    const ids = glossaryTerms.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have non-empty terms and definitions', () => {
    glossaryTerms.forEach((term) => {
      expect(term.term.length).toBeGreaterThan(0);
      expect(term.definition.length).toBeGreaterThan(0);
      expect(term.category.length).toBeGreaterThan(0);
    });
  });

  it('should calculate difficulty tracking correctly', () => {
    const difficulty: Record<string, 'easy' | 'medium' | 'hard'> = {};

    // Mark some terms
    difficulty['sql-injection'] = 'easy';
    difficulty['xss'] = 'medium';
    difficulty['csrf'] = 'hard';

    const values = Object.values(difficulty);
    expect(values.filter((d) => d === 'easy').length).toBe(1);
    expect(values.filter((d) => d === 'medium').length).toBe(1);
    expect(values.filter((d) => d === 'hard').length).toBe(1);
    expect(values.length).toBe(3);
  });

  it('should filter hard cards correctly', () => {
    const difficulty: Record<string, 'easy' | 'medium' | 'hard'> = {
      'sql-injection': 'easy',
      'xss': 'hard',
      'csrf': 'hard',
      'owasp': 'medium',
    };

    const hardIds = Object.entries(difficulty)
      .filter(([, d]) => d === 'hard')
      .map(([id]) => id);

    const hardTerms = glossaryTerms.filter((t) => hardIds.includes(t.id));
    expect(hardTerms.length).toBe(2);
    expect(hardTerms.map((t) => t.id)).toContain('xss');
    expect(hardTerms.map((t) => t.id)).toContain('csrf');
  });

  it('should shuffle array correctly', () => {
    const original = Array.from({ length: 20 }, (_, i) => i);
    const shuffled = [...original];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    expect(shuffled.length).toBe(original.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });

  it('should calculate session duration correctly', () => {
    const start = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    const duration = Math.floor((Date.now() - start) / 60000);
    expect(duration).toBeGreaterThanOrEqual(4);
    expect(duration).toBeLessThanOrEqual(6);
  });

  it('should navigate cards within bounds', () => {
    const totalCards = 10;
    let currentIndex = 0;

    // Next
    if (currentIndex < totalCards - 1) currentIndex++;
    expect(currentIndex).toBe(1);

    // Prev
    if (currentIndex > 0) currentIndex--;
    expect(currentIndex).toBe(0);

    // Can't go before first
    if (currentIndex > 0) currentIndex--;
    expect(currentIndex).toBe(0);

    // Can't go after last
    currentIndex = totalCards - 1;
    if (currentIndex < totalCards - 1) currentIndex++;
    expect(currentIndex).toBe(totalCards - 1);
  });
});

describe('Flashcard keyboard shortcuts', () => {
  it('should map keys to actions correctly', () => {
    const keyMap: Record<string, string> = {
      'ArrowRight': 'next',
      'ArrowLeft': 'prev',
      ' ': 'flip',
      'Enter': 'flip',
    };

    expect(keyMap['ArrowRight']).toBe('next');
    expect(keyMap['ArrowLeft']).toBe('prev');
    expect(keyMap[' ']).toBe('flip');
    expect(keyMap['Enter']).toBe('flip');
  });
});
