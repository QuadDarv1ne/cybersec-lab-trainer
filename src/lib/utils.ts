import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
