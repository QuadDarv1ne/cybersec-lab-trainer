'use client';

import { useAppStore, type PageType } from '@/lib/store';
import { useTranslations } from '@/lib/intlStub';
import {
  LayoutDashboard,
  Shield,
  Database,
  FileText,
  Link,
  Lock,
  Code,
  HelpCircle,
  KeyRound,
  Trophy,
  X,
  CheckCircle2,
  ShieldAlert,
  Keyboard,
  LogIn,
  LogOut,
  StickyNote,
  BarChart3,
  Settings,
  AlertTriangle,
  BookOpen,
  Flag,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useSession } from '@/hooks/use-session';
import { signIn, signOut } from 'next-auth/react';
import SyncIndicator from './SyncIndicator';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Shield: <Shield size={20} />,
  Database: <Database size={20} />,
  FileText: <FileText size={20} />,
  Link: <Link size={20} />,
  Lock: <Lock size={20} />,
  Code: <Code size={20} />,
  HelpCircle: <HelpCircle size={20} />,
  KeyRound: <KeyRound size={20} />,
  Trophy: <Trophy size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
  Flag: <Flag size={20} />,
  Globe: <Globe size={20} />,
  StickyNote: <StickyNote size={20} />,
  BarChart3: <BarChart3 size={20} />,
  Settings: <Settings size={20} />,
  AlertTriangle: <AlertTriangle size={20} />,
  BookOpen: <BookOpen size={20} />,
};

export default function Sidebar() {
  const t = useTranslations('sidebar');
  const currentPage = useAppStore((s) => s.currentPage);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);

  const { session, isAuthenticated, isLoading } = useSession();

  const navItems: { id: PageType; label: string; iconKey: string }[] = [
    { id: 'dashboard', label: t('dashboard'), iconKey: 'LayoutDashboard' },
    { id: 'owasp', label: t('owasp'), iconKey: 'Shield' },
    { id: 'sql-injection', label: t('sqlInjection'), iconKey: 'Database' },
    { id: 'xss', label: t('xss'), iconKey: 'FileText' },
    { id: 'csrf', label: t('csrf'), iconKey: 'Link' },
    { id: 'auth', label: t('auth'), iconKey: 'Lock' },
    { id: 'secure-coding', label: t('secureCoding'), iconKey: 'Code' },
    { id: 'tools', label: t('tools'), iconKey: 'KeyRound' },
    { id: 'security-headers', label: t('securityHeaders'), iconKey: 'ShieldAlert' },
    { id: 'ctf-labs', label: t('ctfLabs'), iconKey: 'Flag' },
    { id: 'advanced-ctf', label: t('advancedCTF'), iconKey: 'ShieldAlert' },
    { id: 'real-app-simulation', label: t('realAppSimulation'), iconKey: 'Globe' },
    { id: 'quiz', label: t('quiz'), iconKey: 'HelpCircle' },
    { id: 'achievements', label: t('achievements'), iconKey: 'Trophy' },
    { id: 'blog', label: t('blog'), iconKey: 'BookOpen' },
    { id: 'notes', label: t('notes'), iconKey: 'StickyNote' },
    { id: 'analytics', label: t('analytics'), iconKey: 'BarChart3' },
    { id: 'settings', label: t('settings'), iconKey: 'Settings' },
    { id: 'weakness-review', label: t('weaknessReview'), iconKey: 'AlertTriangle' },
  ];

  // Count trackable items (excluding dashboard, achievements, quiz)
  const trackableItems = navItems.filter((item) => item.id !== 'dashboard' && item.id !== 'achievements' && item.id !== 'quiz');
  const completedCount = trackableItems.filter((item) => completedModules.includes(item.id)).length;
  const progressPct = trackableItems.length > 0 ? Math.round((completedCount / trackableItems.length) * 100) : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">CyberSec Lab</h2>
            <p className="text-[11px] text-slate-400">{t('majorCode')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const isCompleted = completedModules.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 text-left group
                ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : item.id === 'achievements'
                      ? 'text-amber-400 hover:bg-amber-600/10 hover:text-amber-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <span className={isActive
                ? 'text-emerald-400'
                : item.id === 'achievements'
                  ? 'text-amber-500 group-hover:text-amber-300'
                  : 'text-slate-500 group-hover:text-slate-300'
              }>
                {iconMap[item.iconKey]}
              </span>
              <span className="flex-1">{item.label}</span>
              {isCompleted && (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth section */}
      <div className="px-3 py-2">
        {!isLoading && (
          <>
            {isAuthenticated && session?.user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                    <AvatarFallback className="text-xs bg-emerald-600 text-white">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => signOut()}
                  aria-label={t('signOut')}
                >
                  <LogOut size={14} className="mr-2" />
                  {t('signOut')}
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10"
                onClick={() => signIn()}
                aria-label={t('signIn')}
              >
                <LogIn size={14} className="mr-2" />
                {t('signIn')}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Progress */}
      <div className="p-4 border-t border-slate-700" aria-live="polite" aria-label="Overall progress">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">{t('overallProgress')}</span>
          <span className="text-emerald-400 font-semibold">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2 bg-slate-700 [&>div]:bg-emerald-500" />
        <p className="text-[11px] text-slate-500 mt-2">
          {t('modulesCompleted', { completed: completedCount, total: trackableItems.length })}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500">
          <Keyboard size={12} />
          <span>1-9, 0: navigate · Ctrl+K: search · Alt+A: achievements · Esc: dashboard</span>
        </div>
        <div className="mt-2">
          <SyncIndicator />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] max-w-[85vw] z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[220px] lg:w-[260px] shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
