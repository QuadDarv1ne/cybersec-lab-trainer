'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore, type PageType } from '@/lib/store';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface ShortcutOptions {
  onOpenSearch?: () => void;
}

/**
 * Hook that registers global keyboard shortcuts.
 * Prevents default for matched shortcuts to avoid browser conflicts.
 * Ignores events when focus is inside input/textarea/select elements.
 */
export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const currentPage = useAppStore((s) => s.currentPage);
  const currentPageRef = useRef(currentPage);
  const optionsRef = useRef(options);

  const shortcuts = useCallback(() => {
    // Navigation shortcuts - map keys to page IDs
    const navigationShortcuts: Omit<ShortcutConfig, 'action'>[] = [
      { key: '1', description: 'Dashboard' },
      { key: '2', description: 'OWASP Top 10' },
      { key: '3', description: 'SQL Injection' },
      { key: '4', description: 'XSS' },
      { key: '5', description: 'CSRF' },
      { key: '6', description: 'Auth Security' },
      { key: '7', description: 'Secure Coding' },
      { key: '8', description: 'Tools Lab' },
      { key: '9', description: 'Security Headers' },
      { key: '0', description: 'Quiz' },
    ];

    const pageOrder: PageType[] = [
      'dashboard',
      'owasp',
      'sql-injection',
      'xss',
      'csrf',
      'auth',
      'secure-coding',
      'tools',
      'security-headers',
      'quiz',
    ];

    return [
      // Number keys for navigation
      ...navigationShortcuts.map((shortcut, index) => ({
        ...shortcut,
        action: () => setCurrentPage(pageOrder[index]),
      })),

      // Alt + A = Achievements
      {
        key: 'a',
        altKey: true,
        action: () => setCurrentPage('achievements'),
        description: 'Achievements',
      },

      // Ctrl + K or / = Focus search
      {
        key: 'k',
        ctrlKey: true,
        action: () => {
          optionsRef.current.onOpenSearch?.();
        },
        description: 'Search',
      },

      // Ctrl + / = Toggle sidebar
      {
        key: '/',
        ctrlKey: true,
        action: () => toggleSidebar(),
        description: 'Toggle sidebar',
      },

      // Escape = Go to dashboard
      {
        key: 'Escape',
        action: () => {
          if (currentPageRef.current !== 'dashboard') {
            setCurrentPage('dashboard');
          }
        },
        description: 'Go to dashboard',
      },

      // Arrow Left/Right = Navigate between pages
      {
        key: 'ArrowRight',
        altKey: true,
        action: () => {
          const currentIndex = pageOrder.indexOf(currentPageRef.current);
          if (currentIndex < pageOrder.length - 1) {
            setCurrentPage(pageOrder[currentIndex + 1]);
          }
        },
        description: 'Next page',
      },

      {
        key: 'ArrowLeft',
        altKey: true,
        action: () => {
          const currentIndex = pageOrder.indexOf(currentPageRef.current);
          if (currentIndex > 0) {
            setCurrentPage(pageOrder[currentIndex - 1]);
          }
        },
        description: 'Previous page',
      },
    ] as ShortcutConfig[];
  }, [setCurrentPage, toggleSidebar]);

  useEffect(() => {
    currentPageRef.current = currentPage;
    optionsRef.current = options;

    const shortcutList = shortcuts();
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable
      ) {
        return;
      }

      // Find matching shortcut
      const match = shortcutList.find((shortcut) => {
        if (shortcut.key !== event.key) return false;
        // Ctrl/Cmd check: shortcut.ctrlKey means we need either Ctrl or Cmd pressed
        if (shortcut.ctrlKey) {
          const hasCtrlOrCmd = event.ctrlKey || event.metaKey;
          if (!hasCtrlOrCmd) return false;
        } else {
          // If shortcut doesn't require ctrl, make sure neither is pressed
          if (event.ctrlKey || event.metaKey) return false;
        }
        if (!!shortcut.altKey !== event.altKey) return false;
        if (!!shortcut.shiftKey !== event.shiftKey) return false;
        return true;
      });

      if (match) {
        event.preventDefault();
        event.stopPropagation();
        match.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are synced in effect body; callbacks read latest values via refs
  }, [shortcuts]);
}

/**
 * Returns the list of available keyboard shortcuts for display in UI.
 */
export function getShortcutList(): { keys: string[]; description: string }[] {
  return [
    { keys: ['1', '2', '3', '...'], description: 'Navigate to pages' },
    { keys: ['Alt', 'A'], description: 'Open Achievements' },
    { keys: ['Ctrl', 'K'], description: 'Search' },
    { keys: ['Ctrl', '/'], description: 'Toggle sidebar' },
    { keys: ['Alt', '→'], description: 'Next page' },
    { keys: ['Alt', '←'], description: 'Previous page' },
    { keys: ['Esc'], description: 'Go to Dashboard' },
  ];
}
