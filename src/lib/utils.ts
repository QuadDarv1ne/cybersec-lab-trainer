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
  // Node.js >= 14.17 built-in crypto module fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomUUID } = require('crypto');
  return randomUUID();
}
