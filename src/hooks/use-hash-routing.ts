'use client';

import { useEffect, useState } from 'react';
import { useAppStore, type PageType } from '@/lib/store';

const pageToHash: Record<PageType, string> = {
  dashboard: '',
  owasp: 'owasp',
  'sql-injection': 'sql-injection',
  xss: 'xss',
  csrf: 'csrf',
  auth: 'auth',
  'secure-coding': 'secure-coding',
  'security-headers': 'security-headers',
  tools: 'tools',
  quiz: 'quiz',
  achievements: 'achievements',
  notes: 'notes',
  analytics: 'analytics',
  settings: 'settings',
  'weakness-review': 'weakness-review',
  blog: 'blog',
  'ctf-labs': 'ctf-labs',
  'advanced-ctf': 'advanced-ctf',
  'real-app-simulation': 'real-app-simulation',
  'devsecops-simulation': 'devsecops-simulation',
  admin: 'admin',
  teacher: 'teacher',
  leaderboard: 'leaderboard',
  profile: 'profile',
};

const hashToPage: Record<string, PageType> = Object.fromEntries(
  Object.entries(pageToHash).map(([page, hash]) => [hash, page as PageType])
);

/**
 * Hook that syncs the app's currentPage with the URL hash.
 * - On mount: reads the hash to set the initial page
 * - On page change: updates the hash
 * - On hash change (back/forward): navigates to the corresponding page
 * Returns `true` once the initial hash has been read (prevents flash of wrong page).
 */
export function useHashRouting(): boolean {
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const [ready, setReady] = useState(false);

  // Initialize page from URL hash on mount and listen for hash changes (back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const page = hashToPage[hash] ?? 'dashboard';
      setCurrentPage(page);
    };

    // Read initial hash on mount before first paint
    handleHashChange();
    setReady(true);

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentPage]);

  // Update URL hash when currentPage changes
  useEffect(() => {
    if (!ready) return;
    const hash = pageToHash[currentPage];
    const currentHash = window.location.hash.replace('#', '');
    if (hash !== currentHash) {
      if (hash) {
        window.history.replaceState(null, '', `#${hash}`);
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [currentPage, ready]);

  return ready;
}
