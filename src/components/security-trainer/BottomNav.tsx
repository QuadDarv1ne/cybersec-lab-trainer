'use client';

import { useAppStore, type PageType } from '@/lib/store';
import { useTranslations } from '@/lib/intlStub';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  Database,
  Trophy,
  User,
  Menu,
} from 'lucide-react';

const navItems: { id: PageType; icon: React.ReactNode; labelKey: string }[] = [
  { id: 'dashboard', labelKey: 'dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'owasp', labelKey: 'owasp', icon: <Shield size={20} /> },
  { id: 'sql-injection', labelKey: 'sqlInjection', icon: <Database size={20} /> },
  { id: 'quiz', labelKey: 'quiz', icon: <Trophy size={20} /> },
  { id: 'profile', labelKey: 'profile', icon: <User size={20} /> },
];

export default function BottomNav() {
  const t = useTranslations('sidebar');
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const label = t(item.labelKey);
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`
                flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg min-w-0
                transition-all duration-150 relative active:scale-90
                ${isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }
              `}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative">
                <AnimatePresence mode="popLayout">
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500"
                    />
                  )}
                </AnimatePresence>
                <motion.span
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="block"
                >
                  {item.icon}
                </motion.span>
              </span>
              <span className={`text-[10px] font-medium truncate max-w-full transition-colors duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-150 active:scale-90"
          aria-label={t('menu')}
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">{t('menu')}</span>
        </button>
      </div>
    </nav>
  );
}
