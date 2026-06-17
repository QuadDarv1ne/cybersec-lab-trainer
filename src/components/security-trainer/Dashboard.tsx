'use client';

import { useAppStore } from '@/lib/store';
import { modules, achievements } from '@/lib/security-data';
import { quizCategories } from '@/lib/data/quiz-data';
import { getAchievementStatus } from '@/lib/achievement-utils';
import { getWeaknessCount } from '@/lib/weakness-review';
import { useTranslations } from '@/lib/intlStub';
import { exportProgress, importProgress } from '@/lib/progress-export';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getModuleIcon, MODULE_GRADIENTS, MODULE_PATTERNS, ACHIEVEMENT_ICONS } from './module-icons';
import XPDisplay from './XPDisplay';
import { StreakWidget } from './StreakWidget';
import { HeatmapCalendar } from './HeatmapCalendar';
import { LearningPath } from './LearningPath';
import { Certificate } from './Certificate';
import ScrollToTop from './ScrollToTop';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import {
  Shield,
  Database,
  HelpCircle,
  Menu,
  Trophy,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Award,
  Download,
  Upload,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Flame,
  Star,
  GraduationCap,
  Brain,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { toPageType } from '@/lib/constants';

export default function Dashboard() {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);
  const quizScores = useAppStore((s) => s.quizScores);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const owaspChallengeScores = useAppStore((s) => s.owaspChallengeScores);
  const authChallengeScores = useAppStore((s) => s.authChallengeScores);
  const headersChallengeScores = useAppStore((s) => s.headersChallengeScores);
  const secureCodingChallengeScores = useAppStore((s) => s.secureCodingChallengeScores);
  const studiedOwaspItems = useAppStore((s) => s.studiedOwaspItems);
  const sqlCompletedLevels = useAppStore((s) => s.sqlCompletedLevels);
  const xssCompletedLevels = useAppStore((s) => s.xssCompletedLevels);
  const csrfViewedChallenges = useAppStore((s) => s.csrfViewedChallenges);
  const quizHistory = useAppStore((s) => s.quizHistory);
  const importProgressData = useAppStore((s) => s.importProgressData);
  const totalXP = useAppStore((s) => s.totalXP);
  const notes = useAppStore((s) => s.notes);
  const t = useTranslations('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalModules = modules.length;
  const completedCount = useMemo(() =>
    completedModules.filter((id) => modules.some((m) => m.id === id)).length
  , [completedModules]);
  const totalProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const avgQuizScore = useMemo(() => {
    const scores = Object.values(quizScores);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [quizScores]);

  const weaknessCount = useMemo(() =>
    getWeaknessCount(quizHistory, owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores)
  , [quizHistory, owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores]);

  const challengeStats = useMemo(() => ({
    owaspCorrect: owaspChallengeScores.correct,
    authCorrect: authChallengeScores.correct,
    owaspTotal: owaspChallengeScores.total,
    authTotal: authChallengeScores.total,
    headersCorrect: headersChallengeScores.correct,
    headersTotal: headersChallengeScores.total,
    secureCodingCorrect: secureCodingChallengeScores.correct,
    secureCodingTotal: secureCodingChallengeScores.total,
  }), [owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores]);

  const { unlockedAchievements, nextAchievement } = useMemo(() => {
    const unlocked: typeof achievements = [];
    let next: typeof achievements[number] | undefined;
    for (const a of achievements) {
      if (getAchievementStatus(a.id, completedModules, quizScores, challengeStats)) unlocked.push(a);
      else if (!next) next = a;
    }
    return { unlockedAchievements: unlocked, nextAchievement: next };
  }, [completedModules, quizScores, challengeStats]);

  const isNewUser = completedModules.length === 0;

  const recommendation = useMemo(() => {
    if (completedModules.length === 0) return { text: t('recommendations.owaspStart'), page: toPageType('owasp') };
    if (!completedModules.includes('sql-injection')) return { text: t('recommendations.sqlTry'), page: toPageType('sql-injection') };
    if (!completedModules.includes('xss')) return { text: t('recommendations.xssLearn'), page: toPageType('xss') };
    if (!completedModules.includes('csrf')) return { text: t('recommendations.csrfLearn'), page: toPageType('csrf') };
    if (!completedModules.includes('auth')) return { text: t('recommendations.authLearn'), page: toPageType('auth') };
    if (!completedModules.includes('secure-coding')) return { text: t('recommendations.secureCodingLearn'), page: toPageType('secure-coding') };
    if (!completedModules.includes('tools')) return { text: t('recommendations.toolsTry'), page: toPageType('tools') };
    if (!completedModules.includes('security-headers')) return { text: t('recommendations.headersLearn'), page: toPageType('security-headers') };
    if (totalProgress < 100) {
      const remainingModule = modules.find((m) => !completedModules.includes(m.id));
      return { text: t('recommendations.completeRemaining'), page: toPageType(remainingModule?.id ?? 'dashboard') };
    }
    return { text: t('recommendations.wellDone'), page: toPageType('achievements') };
  }, [completedModules, totalProgress, t]);

  const handleStartModule = (moduleId: string) => setCurrentPage(toPageType(moduleId));
  const handleCardKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-slate-600 dark:text-slate-400">
          <Menu size={22} />
        </Button>
        <Shield size={20} className="text-emerald-600" />
        <span className="font-bold text-base">CyberSec Lab</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-6 sm:p-8 md:p-10"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none animate-levitate-delayed" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none animate-levitate" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute bottom-2 right-2 text-emerald-500/10">
          <Shield size={80} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30 rounded-full px-3 py-1 text-xs font-medium">
              <Sparkles size={12} className="mr-1" />
              {t('major')}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-balance leading-tight">{t('hero.title')}</h1>
          <p className="text-slate-300 max-w-2xl leading-relaxed text-sm md:text-base">{t('hero.description')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { icon: BookOpen, text: t('hero.modules', { count: totalModules }), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Flame, text: t('hero.progress', { percent: totalProgress }), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Trophy, text: avgQuizScore > 0 ? t('hero.quizScore', { score: avgQuizScore }) : t('hero.takeQuiz'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Star, text: t('hero.achievements', { count: unlockedAchievements.length }), color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`flex items-center gap-2.5 rounded-xl ${item.bg} px-3 py-2 backdrop-blur-sm`}
              >
                <item.icon size={14} className={`${item.color} shrink-0`} />
                <span className="text-xs text-slate-200 font-medium truncate">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-emerald-500/5 border border-emerald-200 dark:border-emerald-800/30 p-5 sm:p-6"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-base font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" />
              {t('quickStart.title')}
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/70 mb-4 max-w-lg">
              {t('quickStart.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                onClick={() => setCurrentPage('owasp')}
              >
                <Shield size={14} className="mr-1.5" />
                OWASP Top 10
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={() => setCurrentPage('quiz')}
              >
                <HelpCircle size={14} className="mr-1.5" />
                {t('quickStart.takeQuiz')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setCurrentPage('sql-injection')}
              >
                <Database size={14} className="mr-1.5" />
                SQL Injection
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="border-amber-200 dark:border-amber-700/30 bg-gradient-to-r from-amber-50 via-amber-50/50 to-orange-50 dark:from-amber-950/20 dark:via-amber-900/10 dark:to-orange-950/20 overflow-hidden">
        <CardContent className="p-5">
          <XPDisplay />
        </CardContent>
      </Card>

      <LearningPath />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <StreakWidget />
        </div>
        <div className="lg:col-span-2">
          <HeatmapCalendar />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-live="polite" aria-label="Learning statistics">
        {[
          { label: t('stats.modulesCompleted'), value: completedCount, total: totalModules, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', borderColor: 'border-emerald-200 dark:border-emerald-800/30' },
          { label: t('stats.quizzesCompleted'), value: Object.keys(quizScores).length, total: quizCategories.length, icon: Brain, gradient: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800/30' },
          { label: t('stats.averageScore'), value: avgQuizScore, suffix: '%', icon: Target, gradient: 'from-sky-500 to-blue-500', bgColor: 'bg-sky-50 dark:bg-sky-950/30', borderColor: 'border-sky-200 dark:border-sky-800/30' },
          { label: t('stats.achievements'), value: unlockedAchievements.length, total: achievements.length, icon: Trophy, gradient: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50 dark:bg-violet-950/30', borderColor: 'border-violet-200 dark:border-violet-800/30' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="group">
            <Card className={`border ${stat.borderColor} ${stat.bgColor} card-hover`}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <stat.icon size={16} className="text-white" />
                </div>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">
                  <AnimatedCounter value={stat.value} />
                  {stat.total !== undefined && <span className="text-slate-400 dark:text-slate-500 text-base font-normal">/{stat.total}</span>}
                  {stat.suffix && !stat.total ? stat.suffix : ''}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card
          className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800/30 cursor-pointer card-hover group"
          onClick={() => setCurrentPage(recommendation.page)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage(recommendation.page))}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <ArrowRight size={20} />
              </div>
              <div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">{t('recommendationBanner.title')}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{recommendation.text}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </motion.div>

      {nextAchievement && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-amber-200 dark:border-amber-800/30 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                {ACHIEVEMENT_ICONS[nextAchievement.id] ?? <Award size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('nextAchievement')}</p>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{nextAchievement.title}</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/70">{nextAchievement.condition}</p>
              </div>
              <Trophy size={20} className="text-amber-300 shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-500" />
            {t('modulesTitle')}
          </h2>
          <span className="text-xs text-slate-400">{completedCount}/{totalModules}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((mod, i) => {
            const isCompleted = completedModules.includes(mod.id);
            const modGradient = MODULE_GRADIENTS[mod.id] || 'from-emerald-500 to-teal-500';
            const modPattern = MODULE_PATTERNS[mod.id] || '';
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={`group cursor-pointer border-slate-200 dark:border-slate-700/50 overflow-hidden card-hover ${isCompleted ? 'border-emerald-200 dark:border-emerald-800/40' : ''}`}
                  onClick={() => handleStartModule(mod.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => handleCardKeyDown(e, () => handleStartModule(mod.id))}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className={`w-[72px] shrink-0 flex items-center justify-center bg-gradient-to-br ${modGradient} relative overflow-hidden ${isCompleted ? '' : 'opacity-70'}`}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="text-white relative z-10">{getModuleIcon(mod.icon)}</span>
                      </div>
                      <div className="flex-1 p-3.5 relative overflow-hidden">
                        {modPattern && (
                          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: modPattern }} />
                        )}
                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">{mod.title}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{mod.description}</p>
                            </div>
                            <ChevronRight size={15} className={`text-slate-300 dark:text-slate-600 mt-1 shrink-0 transition-all duration-200 ${isCompleted ? 'text-emerald-400' : 'group-hover:text-emerald-500 group-hover:translate-x-0.5'}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <Badge variant="secondary" className={`text-[10px] ${mod.difficultyColor} border-0`}>{mod.difficulty}</Badge>
                            <span className="text-[11px] text-slate-400">{mod.lessons} {t('modulesLessons', { count: mod.lessons }).split(' ').slice(1).join(' ')}</span>
                            {isCompleted && (
                              <Badge className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-[10px] ml-auto">
                                <CheckCircle2 size={10} className="mr-1" /> {t('completed')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full transition-all duration-500 ease-out ${isCompleted ? 'bg-gradient-to-r ' + modGradient + ' w-full' : 'w-0 group-hover:w-1/3'}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: modules.length * 0.04 }}>
            <Card
              className="group cursor-pointer border-amber-200 dark:border-amber-800/30 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/10 dark:to-yellow-950/10 card-hover overflow-hidden"
              onClick={() => setCurrentPage('quiz')}
              role="button" tabIndex={0}
              onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage('quiz'))}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                  <HelpCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{t('quizCard.title')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{t('quizCard.description')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0 text-[10px]">{t('quizCard.categories', { count: quizCategories.length })}</Badge>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (modules.length + 1) * 0.04 }}>
            <Card
              className="group cursor-pointer border-violet-200 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/10 dark:to-purple-950/10 card-hover overflow-hidden"
              onClick={() => setCurrentPage('achievements')}
              role="button" tabIndex={0}
              onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage('achievements'))}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/20">
                  <Trophy size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{t('achievementsCard.title')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{t('achievementsCard.description')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 border-0 text-[10px]">
                      {unlockedAchievements.length}/{achievements.length}
                    </Badge>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-violet-500 shrink-0 group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card
          className="border-orange-200 dark:border-orange-800/30 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 cursor-pointer card-hover group"
          onClick={() => setCurrentPage('weakness-review')}
          onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage('weakness-review'))}
          role="button" tabIndex={0}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{t('weaknessReview.title')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {weaknessCount > 0
                        ? t('weaknessReview.hasWeaknesses', { count: weaknessCount })
                        : t('weaknessReview.noWeaknesses')}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 shrink-0 group-hover:translate-x-0.5 transition-all" />
                </div>
                {weaknessCount > 0 && (
                  <div className="flex items-center gap-2 mt-2.5">
                    <Badge className="bg-orange-200 dark:bg-orange-500/15 text-orange-800 dark:text-orange-400 border-0 text-[10px]">
                      {weaknessCount} {t('weaknessReview.count', { count: weaknessCount }).split(' ').slice(1).join(' ')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30" aria-label="Overall progress" aria-live="polite">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-500" />
            {t('overallProgress.title')}
          </h3>
          <Progress value={totalProgress} className="h-2.5 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalProgress === 100
              ? t('overallProgress.completed')
              : totalProgress === 0
                ? t('overallProgress.notStarted')
                : t('overallProgress.inProgress', { remaining: totalModules - completedCount })}
          </p>
        </CardContent>
      </Card>

      <Certificate />

      <ScrollToTop />

      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Upload size={15} className="text-slate-500" />
            <h3 className="font-semibold text-sm">{t('exportImport.title')}</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">{t('exportImport.description')}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const state = { completedModules, quizScores, studiedOwaspItems, sqlCompletedLevels, xssCompletedLevels, owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores, csrfViewedChallenges, quizHistory, totalXP, notes };
              const exportedAt = exportProgress(state);
              toast.success(t('exportImport.exportSuccess', { date: new Date(exportedAt).toLocaleString() }));
            }}>
              <Download size={14} className="mr-1.5" /> {t('exportImport.export')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} className="mr-1.5" /> {t('exportImport.import')}
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const data = importProgress(ev.target?.result as string);
                  if (data) { importProgressData(data); toast.success(t('exportImport.importSuccess')); }
                  else toast.error(t('exportImport.importError'), { icon: <AlertTriangle size={16} /> });
                } catch { toast.error(t('exportImport.importError'), { icon: <AlertTriangle size={16} /> }); }
                finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
              };
              reader.onerror = () => { toast.error(t('exportImport.readError'), { icon: <AlertTriangle size={16} /> }); if (fileInputRef.current) fileInputRef.current.value = ''; };
              reader.readAsText(file);
            }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
