'use client';

import { useEffect } from 'react';
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
};

const hashToPage: Record<string, PageType> = {
  '': 'dashboard',
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
};

/**
 * Hook that syncs the app's currentPage with the URL hash.
 * - On mount: reads the hash to set the initial page
 * - On page change: updates the hash
 * - On hash change (back/forward): navigates to the corresponding page
 */
export function useHashRouting() {
  const { currentPage, setCurrentPage } = useAppStore();

  // Initialize page from URL hash on mount and listen for hash changes (back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as string;
      const page = hashToPage[hash] ?? 'dashboard';
      setCurrentPage(page);
    };

    // Read initial hash on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentPage]);

  // Update URL hash when currentPage changes
  useEffect(() => {
    const hash = pageToHash[currentPage];
    const currentHash = window.location.hash.replace('#', '');
    if (hash !== currentHash) {
      if (hash) {
        window.history.replaceState(null, '', `#${hash}`);
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [currentPage]);
}
