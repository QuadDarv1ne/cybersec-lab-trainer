'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { modules, quizCategories } from '@/lib/security-data';
import { calculateLevel } from '@/lib/xp-system';
import { getStreakInfo } from '@/lib/study-sessions';
import { achievements } from '@/lib/security-data';
import { getAchievementStatus } from '@/lib/achievement-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

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
        }
      `}</style>

      <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 no-print">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-600" />
              <h3 className="font-semibold text-sm">{t('title')}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 text-xs">
                <Printer size={12} className="mr-1" /> {t('print')}
              </Button>
            </div>
          </div>

          <div id="certificate-print-area" className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md mb-2">
                <Trophy size={32} />
              </div>
              <h2 className="text-2xl font-bold text-amber-900">{t('certificateTitle')}</h2>
              <p className="text-sm text-amber-700">{t('subtitle')}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Star size={16} className="text-amber-500" />
                  <span className="text-xs text-slate-600">{t('level')}</span>
                </div>
                <div className="text-xl font-bold text-amber-900">{level}</div>
                <div className="text-[10px] text-slate-500">{t('xpToNext')}</div>
              </div>

              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap size={16} className="text-violet-500" />
                  <span className="text-xs text-slate-600">{t('totalXP')}</span>
                </div>
                <div className="text-xl font-bold text-violet-900">{totalXP}</div>
                <div className="text-[10px] text-slate-500">{t('xpPoints')}</div>
              </div>

              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BookOpen size={16} className="text-emerald-500" />
                  <span className="text-xs text-slate-600">{t('avgScore')}</span>
                </div>
                <div className="text-xl font-bold text-emerald-900">{totalQuizzes}%</div>
                <div className="text-[10px] text-slate-500">{t('avgScoreLabel')}</div>
              </div>

              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-xs text-slate-600">{t('bestStreak')}</span>
                </div>
                <div className="text-xl font-bold text-orange-900">{streak.bestStreak}</div>
                <div className="text-[10px] text-slate-500">{t('daysStreak')}</div>
              </div>
            </div>

            {/* Module completion */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">{t('modulesCompleted')}</h4>
              <div className="flex flex-wrap gap-1.5">
                {modules.map((mod) => {
                  const isComplete = completedModules.includes(mod.id);
                  return (
                    <Badge
                      key={mod.id}
                      className={`text-[10px] ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isComplete ? <Shield size={10} className="mr-1" /> : null}
                      {mod.title}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Quiz scores */}
            {Object.keys(quizScores).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">{t('quizResults')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quizCategories.map((cat) => {
                    const score = quizScores[cat.id];
                    if (score === undefined) return null;
                    return (
                      <div key={cat.id} className="flex items-center justify-between bg-white/50 rounded px-3 py-1.5">
                        <span className="text-xs text-slate-700">{cat.name}</span>
                        <Badge className={`text-[10px] ${
                          score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {score}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  {t('achievements', { count: unlockedAchievements.length })}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {unlockedAchievements.slice(0, 10).map((ach) => (
                    <Badge key={ach.id} className="bg-amber-100 text-amber-700 text-[10px]">
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
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-2 border-t border-amber-200">
              <p className="text-xs text-slate-500">
                {t('completedOn')} {completionDate}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                CyberSec Lab Trainer — {t('platform')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
