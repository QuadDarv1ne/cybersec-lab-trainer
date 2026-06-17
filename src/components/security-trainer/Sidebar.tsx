'use client';

import { useAppStore, type PageType } from '@/lib/store';
import { useTranslations } from '@/lib/intlStub';
import {
  LayoutDashboard,
  Shield,
  Database,
  FileCode,
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
  User,
  StickyNote,
  BarChart3,
  Settings,
  AlertTriangle,
  BookOpen,
  Flag,
  Globe,
  Workflow,
  ChevronDown,
  ChevronLeft,
  GraduationCap,
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
import { ROLE_LABELS, ROLE_BADGE_COLORS, type Role } from '@/lib/rbac-types';
import { useState, useRef, useEffect, useCallback } from 'react';

interface SectionDef {
  labelKey: string;
  items: { id: PageType; label: string; icon: React.ReactNode }[];
}

const sections: SectionDef[] = [
  {
    labelKey: 'sectionMain',
    items: [
      { id: 'dashboard', label: 'dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'owasp', label: 'owasp', icon: <Shield size={18} /> },
    ],
  },
  {
    labelKey: 'sectionLabs',
    items: [
      { id: 'sql-injection', label: 'sqlInjection', icon: <Database size={18} /> },
      { id: 'xss', label: 'xss', icon: <FileCode size={18} /> },
      { id: 'csrf', label: 'csrf', icon: <Link size={18} /> },
      { id: 'auth', label: 'auth', icon: <Lock size={18} /> },
      { id: 'secure-coding', label: 'secureCoding', icon: <Code size={18} /> },
      { id: 'tools', label: 'tools', icon: <KeyRound size={18} /> },
      { id: 'security-headers', label: 'securityHeaders', icon: <ShieldAlert size={18} /> },
    ],
  },
  {
    labelKey: 'sectionSimulations',
    items: [
      { id: 'ctf-labs', label: 'ctfLabs', icon: <Flag size={18} /> },
      { id: 'advanced-ctf', label: 'advancedCTF', icon: <ShieldAlert size={18} /> },
      { id: 'real-app-simulation', label: 'realAppSimulation', icon: <Globe size={18} /> },
      { id: 'devsecops-simulation', label: 'devsecops', icon: <Workflow size={18} /> },
    ],
  },
  {
    labelKey: 'sectionLearning',
    items: [
      { id: 'quiz', label: 'quiz', icon: <HelpCircle size={18} /> },
      { id: 'achievements', label: 'achievements', icon: <Trophy size={18} /> },
      { id: 'leaderboard', label: 'leaderboard', icon: <GraduationCap size={18} /> },
      { id: 'weakness-review', label: 'weaknessReview', icon: <AlertTriangle size={18} /> },
    ],
  },
  {
    labelKey: 'sectionOther',
    items: [
      { id: 'profile', label: 'profile', icon: <User size={18} /> },
      { id: 'blog', label: 'blog', icon: <BookOpen size={18} /> },
      { id: 'notes', label: 'notes', icon: <StickyNote size={18} /> },
      { id: 'analytics', label: 'analytics', icon: <BarChart3 size={18} /> },
      { id: 'settings', label: 'settings', icon: <Settings size={18} /> },
    ],
  },
];

export default function Sidebar() {
  const t = useTranslations('sidebar');
  const currentPage = useAppStore((s) => s.currentPage);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  const getSectionKeyForPage = useCallback((page: PageType): string | undefined => {
    for (const section of sections) {
      if (section.items.some((item) => item.id === page)) return section.labelKey;
    }
    return undefined;
  }, []);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const expanded: Record<string, boolean> = {};
    for (const section of sections) {
      expanded[section.labelKey] = true;
    }
    return expanded;
  });

  // Auto-expand section when current page changes to ensure visibility
  useEffect(() => {
    const activeSection = getSectionKeyForPage(currentPage);
    if (activeSection) {
      setExpandedSections((prev) => {
        if (prev[activeSection]) return prev;
        return { ...prev, [activeSection]: true };
      });
    }
  }, [currentPage, getSectionKeyForPage]);

  // Scroll active item into view when it changes
  useEffect(() => {
    if (collapsed) return;
    const timer = setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage, collapsed]);

  const { session, isAuthenticated, isLoading } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  const trackableItems = sections
    .flatMap((s) => s.items)
    .filter((item) =>
      item.id !== 'dashboard' && item.id !== 'achievements' && item.id !== 'quiz' &&
      item.id !== 'teacher' && item.id !== 'admin' && item.id !== 'leaderboard' &&
      item.id !== 'profile' && item.id !== 'blog' && item.id !== 'notes' &&
      item.id !== 'analytics' && item.id !== 'settings' && item.id !== 'weakness-review'
    );
  const completedCount = trackableItems.filter((item) => completedModules.includes(item.id)).length;
  const progressPct = trackableItems.length > 0 ? Math.round((completedCount / trackableItems.length) * 100) : 0;

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navContent = (
    <div className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 ease-out ${collapsed ? 'w-[68px]' : ''}`}>
      <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'hidden' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">CyberSec Lab</h2>
            <p className="text-[11px] text-slate-400">{t('majorCode')}</p>
          </div>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>
        )}
      </div>

      {!collapsed && <Separator className="bg-slate-700/50" />}

      <nav ref={navRef} className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 scrollbar-thin" aria-label="Main navigation">
        {sections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.id === 'teacher' && userRole !== 'TEACHER' && userRole !== 'ADMIN') return false;
            if (item.id === 'admin' && userRole !== 'ADMIN') return false;
            return true;
          });
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedSections[section.labelKey];

          return (
            <div key={section.labelKey} className="mb-2">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.labelKey)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
                >
                  <span>{t(section.labelKey)}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                  />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(isExpanded || collapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5">
                      {visibleItems.map((item) => {
                        const isActive = currentPage === item.id;
                        const isCompleted = completedModules.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            ref={isActive ? activeItemRef : undefined}
                            onClick={() => { setCurrentPage(item.id); if (collapsed) setCollapsed(false); }}
                            aria-label={t(item.label)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                              transition-all duration-150 text-left group relative
                              ${collapsed ? 'justify-center px-0 mx-auto w-10 h-10 group/tooltip' : ''}
                              ${
                                isActive
                                  ? 'bg-emerald-600/20 text-emerald-400'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }
                            `}
                          >
                            <span className={`shrink-0 transition-colors ${
                              isActive
                                ? 'text-emerald-400'
                                : 'text-slate-500 group-hover:text-slate-300'
                            }`}>
                              {item.icon}
                            </span>
                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate text-left">{t(item.label)}</span>
                                {isCompleted && (
                                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                )}
                              </>
                            )}
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-emerald-400" />
                            )}
                            {collapsed && (
                              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
                                {t(item.label)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <Separator className="bg-slate-700/50" />

      {!collapsed && (
        <div className="px-3 py-2">
          {!isLoading && (
            <>
              {isAuthenticated && session?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-slate-700 ring-offset-1 ring-offset-slate-900">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                      <AvatarFallback className="text-xs bg-emerald-600 text-white font-medium">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{session.user.name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate leading-tight">{session.user.email || ''}</p>
                      {userRole && (
                        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded mt-1 font-medium ${ROLE_BADGE_COLORS[userRole as Role] || 'bg-slate-700 text-slate-300'}`}>
                          {ROLE_LABELS[userRole as Role] || userRole}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
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
                  className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10 transition-all"
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
      )}

      <div className={`p-4 border-t border-slate-700/50 ${collapsed ? 'hidden' : ''}`} aria-live="polite" aria-label="Overall progress">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">{t('overallProgress')}</span>
          <span className="text-emerald-400 font-semibold tabular-nums">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-1.5 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />
        <p className="text-[11px] text-slate-500 mt-2">
          {t('modulesCompleted', { completed: completedCount, total: trackableItems.length })}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500">
          <Keyboard size={12} />
          <span>{t('shortcuts')}</span>
        </div>
        <div className="mt-2">
          <SyncIndicator />
        </div>
      </div>

      {collapsed && (
        <div className="p-3 flex justify-center">
          <SyncIndicator />
        </div>
      )}
    </div>
  );

  return (
    <>
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
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`hidden md:block ${collapsed ? 'w-[68px]' : 'w-[220px] lg:w-[260px]'} shrink-0 transition-all duration-300`}>
        <div className="fixed top-0 bottom-0 z-30 flex flex-col">
          <div className="relative flex-1 flex">
            {navContent}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute -right-3 top-1/2 z-40 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft size={12} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
