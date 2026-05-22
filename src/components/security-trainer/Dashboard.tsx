'use client';

import { useAppStore } from '@/lib/store';
import { modules, achievements, glossaryTerms } from '@/lib/security-data';
import { quizCategories } from '@/lib/data/quiz-data';
import { getAchievementStatus } from '@/lib/achievement-utils';
import { useTranslations } from '@/lib/intlStub';
import { exportProgress, importProgress } from '@/lib/progress-export';
import XPDisplay from './XPDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Database,
  FileText,
  Link,
  Lock,
  Code,
  HelpCircle,
  KeyRound,
  Menu,
  Trophy,
  Flame,
  BookOpen,
  ChevronRight,
  Star,
  Target,
  ArrowRight,
  Zap,
  ShieldCheck,
  ShieldAlert,
  LayoutList,
  Award,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PageType } from '@/lib/store';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (v) => Math.round(v));
  const text = useTransform(rounded, (v) => `${v}${suffix}`);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === value) return;
    prevValueRef.current = value;
    const controls = animate(count, value, { duration: 1, ease: 'easeOut' });
    return controls.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <motion.span>{text}</motion.span>;
}

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield size={28} />,
  Database: <Database size={28} />,
  FileText: <FileText size={28} />,
  Link: <Link size={28} />,
  Lock: <Lock size={28} />,
  Code: <Code size={28} />,
  KeyRound: <KeyRound size={28} />,
  ShieldAlert: <ShieldAlert size={28} />,
};

const achievementIcons: Record<string, React.ReactNode> = {
  'first-steps': <BookOpen size={18} />,
  'sql-master': <Database size={18} />,
  'xss-hunter': <Code size={18} />,
  'security-guard': <Shield size={18} />,
  'auth-expert': <Target size={18} />,
  'code-reviewer': <Code size={18} />,
  'quiz-master': <Trophy size={18} />,
  'quiz-perfect': <Star size={18} />,
  'crypto-ninja': <Lock size={18} />,
  'full-completion': <Zap size={18} />,
  'headers-master': <ShieldCheck size={18} />,
  'owasp-challenger': <ShieldAlert size={18} />,
  'auth-challenger': <KeyRound size={18} />,
  'quiz-streak': <Zap size={18} />,
  'all-categories': <LayoutList size={18} />,
  'first-challenge': <Award size={18} />,
  'perfect-challenges': <Award size={18} />,
};

export default function Dashboard() {
  const { setCurrentPage, completedModules, quizScores, toggleSidebar, owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores, studiedOwaspItems, sqlCompletedLevels, xssCompletedLevels, csrfViewedChallenges, quizHistory, importProgressData, totalXP } = useAppStore();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalModules = modules.length;
  const completedCount = useMemo(() =>
    completedModules.filter((id) =>
      modules.some((m) => m.id === id)
    ).length
  , [completedModules]);
  const totalProgress = Math.round((completedCount / totalModules) * 100);

  const avgQuizScore = useMemo(() => {
    const scores = Object.values(quizScores);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }, [quizScores]);

  const challengeStats = useMemo(() =>
    ({
      owaspCorrect: owaspChallengeScores.correct,
      authCorrect: authChallengeScores.correct,
      owaspTotal: owaspChallengeScores.total,
      authTotal: authChallengeScores.total,
      headersCorrect: headersChallengeScores.correct,
      headersTotal: headersChallengeScores.total,
      secureCodingCorrect: secureCodingChallengeScores.correct,
      secureCodingTotal: secureCodingChallengeScores.total,
    })
  , [owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores]);

  const { unlockedAchievements, nextAchievement } = useMemo(() => {
    const unlocked: typeof achievements = [];
    let next: typeof achievements[number] | undefined;
    for (const a of achievements) {
      if (getAchievementStatus(a.id, completedModules, quizScores, challengeStats)) {
        unlocked.push(a);
      } else if (!next) {
        next = a;
      }
    }
    return { unlockedAchievements: unlocked, nextAchievement: next };
  }, [completedModules, quizScores, challengeStats]);

  // Recommendations
  const recommendation = useMemo(() => {
    if (completedModules.length === 0) {
      return { text: t('recommendations.owaspStart'), page: 'owasp' as PageType };
    }
    if (!completedModules.includes('sql-injection')) {
      return { text: t('recommendations.sqlTry'), page: 'sql-injection' as PageType };
    }
    if (!completedModules.includes('xss')) {
      return { text: t('recommendations.xssLearn'), page: 'xss' as PageType };
    }
    if (!completedModules.includes('csrf')) {
      return { text: t('recommendations.csrfLearn'), page: 'csrf' as PageType };
    }
    if (!completedModules.includes('tools')) {
      return { text: t('recommendations.toolsTry'), page: 'tools' as PageType };
    }
    if (totalProgress < 100) {
      const remainingModule = modules.find((m) => !completedModules.includes(m.id));
      return { text: t('recommendations.completeRemaining'), page: (remainingModule?.id ?? 'dashboard') as PageType };
    }
    return { text: t('recommendations.wellDone'), page: 'achievements' as PageType };
  }, [completedModules, totalProgress, t]);

  const handleStartModule = (moduleId: string) => {
    setCurrentPage(moduleId as PageType);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top bar mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu size={22} />
        </Button>
        <Shield size={22} className="text-emerald-600" />
        <span className="font-bold text-lg">CyberSec Lab</span>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-8 md:p-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        <div className="relative z-10">
          <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-600/30 mb-4">
            09.03.04 Программная инженерия
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {t('hero.title')}
          </h1>
          <p className="text-slate-300 max-w-2xl leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 text-sm"
            >
              <BookOpen size={16} className="text-emerald-400" />
              <span className="text-slate-300">{t('hero.modules', { count: totalModules })}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 text-sm"
            >
              <Flame size={16} className="text-emerald-400" />
              <span className="text-slate-300">{t('hero.progress', { percent: totalProgress })}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-sm"
            >
              <Trophy size={16} className="text-emerald-400" />
              <span className="text-slate-300">
                {avgQuizScore > 0 ? t('hero.quizScore', { score: avgQuizScore }) : t('hero.takeQuiz')}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 text-sm"
            >
              <Star size={16} className="text-amber-400" />
              <span className="text-slate-300">{t('hero.achievements', { count: unlockedAchievements.length })}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* XP & Level */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-5">
          <XPDisplay />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-live="polite" aria-label="Learning statistics">
        {[
          { label: t('stats.modulesCompleted'), value: completedCount, total: totalModules, color: 'text-emerald-600' },
          { label: t('stats.quizzesCompleted'), value: Object.keys(quizScores).length, total: quizCategories.length, color: 'text-amber-600' },
          { label: t('stats.averageScore'), value: avgQuizScore, suffix: '%', color: 'text-sky-600' },
          { label: t('stats.achievements'), value: unlockedAchievements.length, total: achievements.length, color: 'text-violet-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} />
                  {stat.total !== undefined ? <span>/{stat.total}</span> : null}
                  {stat.suffix && !stat.total ? stat.suffix : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recommendation banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 cursor-pointer hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          onClick={() => setCurrentPage(recommendation.page)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage(recommendation.page))}
          aria-label="Next recommendation">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <ArrowRight size={20} />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">{t('recommendationBanner.title')}</p>
                <p className="text-sm font-semibold text-slate-800">{recommendation.text}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-emerald-400 shrink-0" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Next achievement */}
      {nextAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                {achievementIcons[nextAchievement.id]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600">{t('nextAchievement')}</p>
                <p className="text-sm font-semibold text-amber-900">{nextAchievement.title}</p>
                <p className="text-[11px] text-amber-700">{nextAchievement.condition}</p>
              </div>
              <Trophy size={20} className="text-amber-300 shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Module Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4">{t('modulesTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod, i) => {
            const isCompleted = completedModules.includes(mod.id);
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  className="group cursor-pointer border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  onClick={() => handleStartModule(mod.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => handleCardKeyDown(e, () => handleStartModule(mod.id))}
                  aria-label={mod.title}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      <div
                        className={`w-20 shrink-0 flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-50' : 'bg-slate-50'
                        }`}
                      >
                        <span className={isCompleted ? 'text-emerald-600' : 'text-slate-400'}>
                          {iconMap[mod.icon]}
                        </span>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">
                              {mod.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {mod.description}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-slate-300 group-hover:text-emerald-500 transition-colors mt-1 shrink-0"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className={`text-[10px] ${mod.difficultyColor}`}>
                            {mod.difficulty}
                          </Badge>
                          <span className="text-[11px] text-slate-400">{t('modulesLessons', { count: mod.lessons })}</span>
                          {isCompleted && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">{tCommon('completed')}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="h-1 bg-slate-100">
                      <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500 w-full' : 'bg-slate-200 w-0'}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quiz + Achievements cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: modules.length * 0.06 }}
          >
            <Card
              className="group cursor-pointer border-amber-200 hover:border-amber-400 hover:shadow-md transition-all duration-300 overflow-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              onClick={() => setCurrentPage('quiz')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage('quiz'))}
              aria-label="Quiz system"
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-20 shrink-0 flex items-center justify-center bg-amber-50">
                    <span className="text-amber-500"><HelpCircle size={28} /></span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-amber-700 transition-colors">{t('quizCard.title')}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t('quizCard.description')}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors mt-1 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">{t('quizCard.categories', { count: quizCategories.length })}</Badge>
                      <span className="text-[11px] text-slate-400">{t('quizCard.questions', { count: quizCategories.reduce((sum, c) => sum + c.count, 0) })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (modules.length + 1) * 0.06 }}
          >
            <Card
              className="group cursor-pointer border-violet-200 hover:border-violet-400 hover:shadow-md transition-all duration-300 overflow-hidden focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              onClick={() => setCurrentPage('achievements')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleCardKeyDown(e, () => setCurrentPage('achievements'))}
              aria-label="Achievements and glossary"
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-20 shrink-0 flex items-center justify-center bg-violet-50">
                    <span className="text-violet-500"><Trophy size={28} /></span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-violet-700 transition-colors">{t('achievementsCard.title')}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t('achievementsCard.description')}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-500 transition-colors mt-1 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px]">
                        {t('achievementsCard.unlocked', { unlocked: unlockedAchievements.length, total: achievements.length })}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{t('achievementsCard.terms', { count: glossaryTerms.length })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Overall progress */}
      <Card className="border-none shadow-sm bg-white" aria-live="polite" aria-label="Overall progress">
        <CardContent className="p-6">
          <h3 className="font-semibold text-sm mb-3">{t('overallProgress.title')}</h3>
          <Progress value={totalProgress} className="h-3 mb-2" />
          <p className="text-xs text-slate-500">
            {totalProgress === 100
              ? t('overallProgress.completed')
              : totalProgress === 0
                ? t('overallProgress.notStarted')
                : t('overallProgress.inProgress', { remaining: totalModules - completedCount })}
          </p>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Upload size={16} className="text-slate-500" />
            <h3 className="font-semibold text-sm">Экспорт / Импорт данных</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Сохраните резервную копию прогресса или восстановите из файла
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const state = {
                  completedModules, quizScores, studiedOwaspItems, sqlCompletedLevels,
                  xssCompletedLevels, owaspChallengeScores, authChallengeScores,
                  headersChallengeScores, secureCodingChallengeScores, csrfViewedChallenges,
                  quizHistory, totalXP,
                };
                const exportedAt = exportProgress(state);
                toast.success(`Прогресс экспортирован (${new Date(exportedAt).toLocaleString('ru-RU')})`);
              }}
            >
              <Download size={14} className="mr-1.5" /> Экспорт
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} className="mr-1.5" /> Импорт
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const content = ev.target?.result as string;
                  const data = importProgress(content);
                  if (data) {
                    importProgressData(data);
                    toast.success('Прогресс успешно восстановлен');
                  } else {
                    toast.error('Неверный формат файла', {
                      icon: <AlertTriangle size={16} />,
                    });
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
