'use client';

import { useAppStore, type PageType } from '@/lib/store';
import { useHashRouting } from '@/hooks/use-hash-routing';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAchievementToasts } from '@/hooks/use-achievement-toasts';
import Sidebar from '@/components/security-trainer/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import BottomNav from '@/components/security-trainer/BottomNav';
import { useTranslations } from '@/lib/intlStub';

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
const AdvancedCTFSimulation = dynamic(() => import('@/components/security-trainer/AdvancedCTFSimulation'), { ssr: false, loading: () => <PageSkeleton /> });
const RealAppSimulation = dynamic(() => import('@/components/security-trainer/RealAppSimulation'), { ssr: false, loading: () => <PageSkeleton /> });
const DevSecOpsSimulation = dynamic(() => import('@/components/security-trainer/DevSecOpsSimulation'), { ssr: false, loading: () => <PageSkeleton /> });
const AdminDashboard = dynamic(() => import('@/components/security-trainer/admin/AdminDashboard'), { ssr: false, loading: () => <PageSkeleton /> });
const TeacherDashboard = dynamic(() => import('@/components/security-trainer/teacher/TeacherDashboard'), { ssr: false, loading: () => <PageSkeleton /> });
const LeaderboardPage = dynamic(() => import('@/components/security-trainer/Leaderboard'), { ssr: false, loading: () => <PageSkeleton /> });
const ProfilePage = dynamic(() => import('@/components/security-trainer/Profile'), { ssr: false, loading: () => <PageSkeleton /> });

const pages: Record<PageType, React.ComponentType> = {
  dashboard: Dashboard, 'sql-injection': SQLInjectionLab,
  xss: XSSLab, csrf: CSRFLab,
  auth: AuthSecurityLab, 'secure-coding': SecureCodingLab,
  tools: ToolsLab, 'security-headers': SecurityHeadersLab,
  quiz: QuizSystem, achievements: AchievementsGlossary,
  owasp: OWASPTop10, notes: NotesPage,
  analytics: ProgressAnalytics, settings: SettingsPage,
  'weakness-review': WeaknessReviewPage, blog: BlogPage,
  'ctf-labs': CTFLabs, 'advanced-ctf': AdvancedCTFSimulation,
  'real-app-simulation': RealAppSimulation, 'devsecops-simulation': DevSecOpsSimulation,
  admin: AdminDashboard, teacher: TeacherDashboard,
  leaderboard: LeaderboardPage, profile: ProfilePage,
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-200/60 dark:bg-slate-700/60 ${className ?? ''}`}>
      <div className="shimmer-overlay absolute inset-0" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading content">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-3 w-56" />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200/80 to-slate-300/60 dark:from-slate-800 dark:to-slate-700/80 h-32">
        <div className="shimmer-overlay absolute inset-0" />
        <div className="p-6 space-y-3 relative">
          <div className="h-4 w-20 bg-white/50 dark:bg-slate-600/50 rounded-full" />
          <div className="h-6 w-72 bg-white/50 dark:bg-slate-600/50 rounded-lg" />
          <div className="h-4 w-48 bg-white/50 dark:bg-slate-600/50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <SkeletonBlock className="h-48" />
    </div>
  );
}

function NavigationProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const currentPage = useAppStore((s) => s.currentPage);
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      setProgress(0);
      setVisible(true);
      const timer1 = setTimeout(() => setProgress(50), 50);
      const timer2 = setTimeout(() => setProgress(90), 200);
      const timer3 = setTimeout(() => {
        setProgress(100);
        setTimeout(() => setVisible(false), 300);
      }, 400);
      prevPageRef.current = currentPage;
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }
  }, [currentPage]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function AppPage() {
  const currentPage = useAppStore((s) => s.currentPage);
  const [searchOpen, setSearchOpen] = useState(false);
  const hashReady = useHashRouting();
  useKeyboardShortcuts({ onOpenSearch: () => setSearchOpen(true) });
  useAchievementToasts();
  const mainRef = useRef<HTMLElement>(null);
  const t = useTranslations('common');

  const Page = pages[currentPage] ?? Dashboard;

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/3 rounded-full blur-[100px] pointer-events-none" />
      </div>
      <NavigationProgress />
      <Sidebar />
      <main
        id="main-content"
        ref={mainRef}
        className="flex-1 min-w-0 overflow-x-hidden relative z-10"
        tabIndex={-1}
      >
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8">
          {hashReady ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Page />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
              <Sparkles size={20} className="animate-pulse mr-2" />
              <span>{t('loading')}</span>
            </div>
          )}
        </div>
      </main>
      <Toaster position="top-right" richColors closeButton />
      <ContentSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BottomNav />
    </div>
    </MotionConfig>
  );
}
