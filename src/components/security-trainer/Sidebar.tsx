'use client';

import { useAppStore, type PageType } from '@/lib/store';
import { modules, achievements } from '@/lib/security-data';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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
};

const navItems: { id: PageType; label: string; iconKey: string }[] = [
  { id: 'dashboard', label: 'Главная', iconKey: 'LayoutDashboard' },
  ...modules.map((m) => ({ id: m.id as PageType, label: m.title, iconKey: m.icon })),
  { id: 'quiz', label: 'Квизы', iconKey: 'HelpCircle' },
  { id: 'achievements', label: 'Достижения', iconKey: 'Trophy' },
];

export default function Sidebar() {
  const {
    currentPage,
    sidebarOpen,
    setSidebarOpen,
    setCurrentPage,
    completedModules,
  } = useAppStore();

  // Count trackable items (excluding dashboard and achievements)
  const trackableItems = navItems.filter((item) => item.id !== 'dashboard' && item.id !== 'achievements');
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
            <p className="text-[11px] text-slate-400">09.03.04</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </Button>
      </div>

      <Separator className="bg-slate-700" />

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const isCompleted =
            item.id === 'dashboard' || completedModules.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
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

      {/* Progress */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">Общий прогресс</span>
          <span className="text-emerald-400 font-semibold">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2 bg-slate-700 [&>div]:bg-emerald-500" />
        <p className="text-[11px] text-slate-500 mt-2">
          Пройдено {completedCount} из {trackableItems.length} модулей
        </p>
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
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
