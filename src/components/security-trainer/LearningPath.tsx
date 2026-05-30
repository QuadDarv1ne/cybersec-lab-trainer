'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type PageType } from '@/lib/store';
import { modules, learningPathOrder, isModuleAccessible, getNextLearningPathModule } from '@/lib/data/modules-data';
import { useTranslations } from '@/lib/intlStub';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Route,
  Lock,
  CheckCircle2,
  Play,
  ChevronRight,
  Trophy,
} from 'lucide-react';

const moduleIconMap: Record<string, string> = {};
for (const mod of modules) {
  moduleIconMap[mod.id] = mod.title;
}

export function LearningPath() {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);
  const t = useTranslations('dashboard');

  const pathModules = useMemo(() =>
    learningPathOrder.map((id) => {
      const mod = modules.find((m) => m.id === id);
      if (!mod) return null;
      const isCompleted = completedModules.includes(id);
      const accessible = isModuleAccessible(id, completedModules);
      return { ...mod, isCompleted, accessible };
    }).filter(Boolean)
  , [completedModules]);

  const nextModule = useMemo(() =>
    getNextLearningPathModule(completedModules)
  , [completedModules]);

  const completedInPath = useMemo(() =>
    learningPathOrder.filter((id) => completedModules.includes(id)).length
  , [completedModules]);

  const pathProgress = Math.round((completedInPath / learningPathOrder.length) * 100);

  const handleNavigate = (moduleId: string, accessible: boolean) => {
    if (accessible) {
      setCurrentPage(moduleId as PageType);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Route size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {t('learningPath.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('learningPath.subtitle', { completed: completedInPath, total: learningPathOrder.length })}
              </p>
            </div>
            {pathProgress === 100 && (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                <Trophy size={10} className="mr-1" /> {t('learningPath.complete')}
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          <Progress value={pathProgress} className="h-2 mb-4 bg-sky-100 dark:bg-slate-700 [&>div]:bg-sky-500" />

          {/* Path steps */}
          <div className="space-y-1.5">
            {pathModules.map((mod, i) => {
              if (!mod) return null;
              const isNext = nextModule === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => handleNavigate(mod.id, mod.accessible)}
                  disabled={!mod.accessible}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                    ${mod.isCompleted
                      ? 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : mod.accessible
                        ? 'bg-white/70 hover:bg-white text-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-200 shadow-sm cursor-pointer'
                        : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600 cursor-not-allowed'
                    }
                    ${isNext ? 'ring-2 ring-sky-300 dark:ring-sky-700' : ''}
                  `}
                >
                  {/* Step indicator */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${mod.isCompleted
                      ? 'bg-emerald-500 text-white'
                      : mod.accessible
                        ? 'bg-sky-200 text-sky-700 dark:bg-sky-800 dark:text-sky-300'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500'
                    }
                  `}>
                    {mod.isCompleted ? (
                      <CheckCircle2 size={14} />
                    ) : mod.accessible ? (
                      i + 1
                    ) : (
                      <Lock size={12} />
                    )}
                  </div>

                  {/* Module info */}
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-medium text-xs truncate block">{mod.title}</span>
                  </div>

                  {/* Action icon */}
                  {mod.isCompleted ? (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-200/50 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300">
                      {t('learningPath.done')}
                    </Badge>
                  ) : mod.accessible ? (
                    <ChevronRight size={16} className="text-sky-400 shrink-0" />
                  ) : (
                    <Lock size={14} className="text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next action */}
          {nextModule && (
            <Button
              size="sm"
              className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white"
              onClick={() => setCurrentPage(nextModule as PageType)}
            >
              <Play size={14} className="mr-1.5" />
              {t('learningPath.continue', { module: moduleIconMap[nextModule] ?? nextModule })}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
