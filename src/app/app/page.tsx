'use client';

import { useAppStore } from '@/lib/store';
import { useHashRouting } from '@/hooks/use-hash-routing';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAchievementToasts } from '@/hooks/use-achievement-toasts';
import Sidebar from '@/components/security-trainer/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useRef, useEffect, useState } from 'react';

const Dashboard = dynamic(() => import('@/components/security-trainer/Dashboard'), { ssr: false, loading: () => <PageSkeleton /> });
const OWASPTop10 = dynamic(() => import('@/components/security-trainer/OWASPTop10'), { ssr: false, loading: () => <PageSkeleton /> });
const SQLInjectionLab = dynamic(() => import('@/components/security-trainer/SQLInjectionLab'), { ssr: false, loading: () => <PageSkeleton /> });
const XSSLab = dynamic(() => import('@/components/security-trainer/XSSLab'), { ssr: false, loading: () => <PageSkeleton /> });
const CSRFLab = dynamic(() => import('@/components/security-trainer/CSRFLab'), { ssr: false, loading: () => <PageSkeleton /> });
const AuthSecurityLab = dynamic(() => import('@/components/security-trainer/AuthSecurityLab'), { ssr: false, loading: () => <PageSkeleton /> });
const SecureCodingLab = dynamic(() => import('@/components/security-trainer/SecureCodingLab'), { ssr: false, loading: () => <PageSkeleton /> });
const ToolsLab = dynamic(() => import('@/components/security-trainer/ToolsLab'), { ssr: false, loading: () => <PageSkeleton /> });
const QuizSystem = dynamic(() => import('@/components/security-trainer/QuizSystem'), { ssr: false, loading: () => <PageSkeleton /> });
const AchievementsGlossary = dynamic(() => import('@/components/security-trainer/AchievementsGlossary'), { ssr: false, loading: () => <PageSkeleton /> });
const SecurityHeadersLab = dynamic(() => import('@/components/security-trainer/SecurityHeadersLab'), { ssr: false, loading: () => <PageSkeleton /> });
const NotesPage = dynamic(() => import('@/components/security-trainer/Notes'), { ssr: false, loading: () => <PageSkeleton /> });
const SettingsPage = dynamic(() => import('@/components/security-trainer/SettingsPage'), { ssr: false, loading: () => <PageSkeleton /> });
const ContentSearch = dynamic(() => import('@/components/security-trainer/ContentSearch'), { ssr: false });
const ProgressAnalytics = dynamic(() => import('@/components/security-trainer/ProgressAnalytics'), { ssr: false, loading: () => <PageSkeleton /> });
const WeaknessReviewPage = dynamic(() => import('@/components/security-trainer/WeaknessReview'), { ssr: false, loading: () => <PageSkeleton /> });
const BlogPage = dynamic(() => import('@/components/security-trainer/BlogPage'), { ssr: false, loading: () => <PageSkeleton /> });
const CTFLabs = dynamic(() => import('@/components/security-trainer/CTFLabs'), { ssr: false, loading: () => <PageSkeleton /> });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pages: Record<string, React.ComponentType<any>> = {
  dashboard: Dashboard,
  'sql-injection': SQLInjectionLab,
  xss: XSSLab,
  csrf: CSRFLab,
  auth: AuthSecurityLab,
  'secure-coding': SecureCodingLab,
  tools: ToolsLab,
  'security-headers': SecurityHeadersLab,
  quiz: QuizSystem,
  achievements: AchievementsGlossary,
  owasp: OWASPTop10,
  notes: NotesPage,
  analytics: ProgressAnalytics,
  settings: SettingsPage,
  'weakness-review': WeaknessReviewPage,
  blog: BlogPage,
  'ctf-labs': CTFLabs,
};

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <Skeleton className="h-6 w-72 rounded" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AppPage() {
  const { currentPage } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  useHashRouting();
  useKeyboardShortcuts({ onOpenSearch: () => setSearchOpen(true) });
  useAchievementToasts();
  const mainRef = useRef<HTMLElement>(null);

  const Page = pages[currentPage] || Dashboard;

  useEffect(() => {
    if (mainRef.current) {
      const focusTarget = mainRef.current.querySelector<HTMLElement>('[tabindex="-1"], h1, h2');
      focusTarget?.focus();
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main id="main-content" ref={mainRef} className="flex-1 min-w-0" tabIndex={-1}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Page />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Toaster position="top-right" />
      <ContentSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
