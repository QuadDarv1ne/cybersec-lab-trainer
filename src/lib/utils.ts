import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

interface OptionStyleConfig {
  default?: string;
  defaultHover?: string;
  selected?: string;
  correct?: string;
  wrong?: string;
  other?: string;
}

const OPTION_STYLE_DEFAULTS: OptionStyleConfig = {
  default: 'border-slate-200',
  defaultHover: 'hover:border-slate-400 hover:bg-slate-50',
  selected: 'border-emerald-400 bg-emerald-50/50',
  correct: 'border-emerald-400 bg-emerald-50',
  wrong: 'border-red-400 bg-red-50',
  other: 'border-slate-100 opacity-60',
};

export function getOptionStyle(
  isAnswered: boolean,
  isCorrect: boolean,
  isSelected: boolean,
  config?: OptionStyleConfig
): string {
  const c = { ...OPTION_STYLE_DEFAULTS, ...config };
  if (isAnswered) {
    if (isCorrect) return c.correct!;
    if (isSelected) return c.wrong!;
    return c.other!;
  }
  if (isSelected) return c.selected!;
  return `${c.default} ${c.defaultHover}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a cryptographically strong UUID v4 string.
 * Works across all modern browsers and Node.js >= 14.17.
 * Falls back from Web Crypto API to Node.js built-in crypto module.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Node.js >= 14.17 built-in crypto module fallback.
  // Wrapped in try-catch for edge runtimes (Vercel Edge, Cloudflare Workers)
  // where crypto.randomUUID is available but require('crypto') is not.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomUUID } = require('crypto');
    return randomUUID();
  } catch {
    // Last resort: Math.random-based UUID v4 (not cryptographically secure,
    // but acceptable as a fallback when no other source is available)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
