'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore, type PageType } from '@/lib/store';
import { modules } from '@/lib/security-data';
import { useTranslations } from '@/lib/intlStub';

interface SearchResult {
  type: 'module' | 'page';
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  page: PageType;
}

interface SearchBarProps {
  className?: string;
  variant?: 'simple' | 'expanded';
}

export function SearchBar({ className, variant = 'simple' }: SearchBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const t = useTranslations('common');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (query.trim()) {
      const searchQuery = query.toLowerCase();
      const foundResults: SearchResult[] = [];

      modules.forEach((mod) => {
        if (
          mod.title.toLowerCase().includes(searchQuery) ||
          mod.description.toLowerCase().includes(searchQuery) ||
          mod.difficulty.toLowerCase().includes(searchQuery)
        ) {
          foundResults.push({
            type: 'module',
            id: mod.id,
            title: mod.title,
            description: mod.description,
            icon: mod.icon,
            page: mod.id as PageType,
          });
        }
      });

      setResults(foundResults.slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (page: PageType) => {
    setCurrentPage(page);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].page);
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 200);
  };

  if (variant === 'simple') {
    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t('searchPlaceholder')}
            className="pl-9 pr-10 h-9 w-48 md:w-64"
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
              aria-label={t('searchClose')}
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <AnimatePresence>
          {isFocused && query && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <div className="rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.page)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Search className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                    </div>
                    <Command className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFocused && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="rounded-xl border border-border bg-popover shadow-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">{t('noResults')}</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={t('searchPlaceholderExpanded')}
          className="pl-12 pr-12 h-12 text-base"
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label={t('searchClose')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <div
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  className="pl-10 pr-4 h-12 text-base border-0 focus-visible:ring-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result.page)}
                        className={cn(
                          'w-full flex items-center gap-4 px-6 py-3 text-left transition-colors',
                          index === selectedIndex
                            ? 'bg-accent'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Search className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base">{result.title}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                          {result.type === 'module' ? t('moduleLabel') : t('pageLabel')}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('tryOtherKeywords')}
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Command className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm font-medium">{t('searchPlaceholderExpanded')}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('searchHint')}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border px-6 py-3 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted font-medium">↑↓</kbd>
                      {t('searchNav')}
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted font-medium">↵</kbd>
                      {t('searchSelect')}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-medium">⎋</kbd>
                    {t('searchClose')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SearchButtonProps {
  onClick?: () => void;
  className?: string;
}

export function SearchButton({ onClick, className }: SearchButtonProps) {
  const t = useTranslations('common');
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('gap-2 h-9 px-3', className)}
      onClick={onClick}
    >
      <Search className="h-4 w-4" />
      <span className="hidden md:inline">{t('searchButton')}</span>
      <kbd className="hidden md:inline-flex ml-1 px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded">
        ⌘K
      </kbd>
    </Button>
  );
}
