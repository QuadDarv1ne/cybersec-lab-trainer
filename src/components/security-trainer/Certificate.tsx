'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { modules, quizCategories, achievements } from '@/lib/security-data';
import { calculateLevel } from '@/lib/xp-system';
import { getStreakInfo } from '@/lib/study-sessions';
import { getAchievementStatus } from '@/lib/achievement-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import {
  Trophy,
  Star,
  Shield,
  Flame,
  BookOpen,
  Award,
  Printer,
  Zap,
  Share2,
  Check,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export function Certificate() {
  const t = useTranslations('certificate');
  const completedModules = useAppStore((s) => s.completedModules);
  const quizScores = useAppStore((s) => s.quizScores);
  const quizHistory = useAppStore((s) => s.quizHistory);
  const totalXP = useAppStore((s) => s.totalXP);
  const studySessions = useAppStore((s) => s.studySessions);
  const owaspChallengeScores = useAppStore((s) => s.owaspChallengeScores);
  const authChallengeScores = useAppStore((s) => s.authChallengeScores);
  const headersChallengeScores = useAppStore((s) => s.headersChallengeScores);
  const secureCodingChallengeScores = useAppStore((s) => s.secureCodingChallengeScores);
  const [shared, setShared] = useState(false);

  const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;

  const level = useMemo(() => calculateLevel(totalXP), [totalXP]);
  const streak = useMemo(() => getStreakInfo(studySessions), [studySessions]);

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

  const unlockedAchievements = useMemo(() =>
    achievements.filter((a) => getAchievementStatus(a.id, completedModules, quizScores, challengeStats)),
    [completedModules, quizScores, challengeStats]
  );

  const totalQuizzes = useMemo(() => {
    const scores = Object.values(quizScores);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [quizScores]);

  const completionDate = useMemo(() => {
    if (!quizHistory || quizHistory.length === 0) return new Date().toLocaleDateString('ru-RU');
    const lastAttempt = quizHistory[0];
    return new Date(lastAttempt.timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [quizHistory]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `🎉 Я завершил CyberSec Lab Trainer!\nУровень: ${level} | XP: ${totalXP} | Лучшая серия: ${streak.bestStreak} дней\nСредний балл: ${totalQuizzes}%`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'CyberSec Lab Trainer', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Silently fail
    }
  };

  const handleDownload = () => {
    const summary = {
      completedAt: completionDate,
      level,
      totalXP,
      bestStreak: streak.bestStreak,
      averageQuizScore: `${totalQuizzes}%`,
      completedModules: completedModules.length,
      achievements: unlockedAchievements.length,
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cybersec-certificate.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Certificate data downloaded');
  };

  if (!allComplete) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print-area, #certificate-print-area * { visibility: visible; }
          #certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4 landscape; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/10 dark:to-orange-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 no-print">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-amber-600" />
                <h3 className="font-semibold text-sm">{t('title')}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="h-7 text-xs">
                  {shared ? <Check size={12} className="mr-1 text-emerald-500" /> : <Share2 size={12} className="mr-1" />}
                  {shared ? t('shared') || 'Copied' : t('share') || 'Share'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-xs">
                  <Download size={12} className="mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 text-xs">
                  <Printer size={12} className="mr-1" /> {t('print')}
                </Button>
              </div>
            </div>

            <div id="certificate-print-area" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-center space-y-2"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md mb-2">
                  <Trophy size={32} />
                </div>
                <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-200">{t('certificateTitle')}</h2>
                <p className="text-sm text-amber-700 dark:text-amber-400">{t('subtitle')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {[
                  { icon: <Star size={16} className="text-amber-500" />, label: t('level'), value: level, sub: t('xpToNext') },
                  { icon: <Zap size={16} className="text-violet-500" />, label: t('totalXP'), value: totalXP, sub: t('xpPoints') },
                  { icon: <BookOpen size={16} className="text-emerald-500" />, label: t('avgScore'), value: `${totalQuizzes}%`, sub: t('avgScoreLabel') },
                  { icon: <Flame size={16} className="text-orange-500" />, label: t('bestStreak'), value: streak.bestStreak, sub: t('daysStreak') },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-white/70 dark:bg-white/10 rounded-lg p-3 text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      {stat.icon}
                      <span className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</span>
                    </div>
                    <div className="text-xl font-bold text-amber-900 dark:text-amber-200">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-500">{stat.sub}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('modulesCompleted')}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {modules.map((mod) => {
                    const isComplete = completedModules.includes(mod.id);
                    return (
                      <Badge
                        key={mod.id}
                        className={`text-[10px] ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        {isComplete ? <Shield size={10} className="mr-1" /> : null}
                        {mod.title}
                      </Badge>
                    );
                  })}
                </div>
              </motion.div>

              {Object.keys(quizScores).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('quizResults')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quizCategories.map((cat) => {
                      const score = quizScores[cat.id];
                      if (score === undefined) return null;
                      return (
                        <div key={cat.id} className="flex items-center justify-between bg-white/50 dark:bg-white/5 rounded px-3 py-1.5">
                          <span className="text-xs text-slate-700 dark:text-slate-300">{cat.name}</span>
                          <Badge className={`text-[10px] ${
                            score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            {score}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {unlockedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('achievements', { count: unlockedAchievements.length })}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {unlockedAchievements.slice(0, 10).map((ach) => (
                      <Badge key={ach.id} className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px]">
                        <Award size={10} className="mr-1" />
                        {ach.title}
                      </Badge>
                    ))}
                    {unlockedAchievements.length > 10 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{unlockedAchievements.length - 10}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center pt-2 border-t border-amber-200 dark:border-amber-800"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('completedOn')} {completionDate}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  CyberSec Lab Trainer — {t('platform')}
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
