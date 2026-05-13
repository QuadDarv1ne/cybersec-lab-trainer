'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { achievements as achievementDefs, glossaryTerms } from '@/lib/security-data';
import { getAchievementStatus } from '@/lib/achievement-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import {
  ChevronLeft,
  Trophy,
  Search,
  Lock as LockIcon,
  BookOpen,
  Flame,
  Star,
  Target,
  Shield,
  Code,
  Database,
  GraduationCap,
} from 'lucide-react';

const categoryColors: Record<string, string> = {
  'Уязвимости': 'bg-red-100 text-red-700',
  'Криптография': 'bg-violet-100 text-violet-700',
  'Аутентификация': 'bg-amber-100 text-amber-700',
  'Защита': 'bg-emerald-100 text-emerald-700',
  'Сеть': 'bg-sky-100 text-sky-700',
  'Атаки': 'bg-orange-100 text-orange-700',
  'Организации': 'bg-slate-100 text-slate-700',
  'Методологии': 'bg-indigo-100 text-indigo-700',
  'Инструменты': 'bg-teal-100 text-teal-700',
};

const achievementIcons: Record<string, React.ReactNode> = {
  'first-steps': <BookOpen size={24} />,
  'sql-master': <Database size={24} />,
  'xss-hunter': <Code size={24} />,
  'security-guard': <Shield size={24} />,
  'auth-expert': <Target size={24} />,
  'code-reviewer': <Code size={24} />,
  'quiz-master': <Trophy size={24} />,
  'quiz-perfect': <Star size={24} />,
  'crypto-ninja': <LockIcon size={24} />,
  'full-completion': <GraduationCap size={24} />,
};

export default function AchievementsAndGlossary() {
  const t = useTranslations('achievements');
  const { setCurrentPage, completedModules, quizScores } = useAppStore();
  const [activeTab, setActiveTab] = useState<'achievements' | 'glossary'>('achievements');
  const [searchTerm, setSearchTerm] = useState('');

  const unlockedCount = achievementDefs.filter((a) => getAchievementStatus(a.id, completedModules, quizScores)).length;

  const filteredTerms = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Trophy size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('description')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'achievements' | 'glossary')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements" className="text-xs">
            <Trophy size={14} className="mr-1" /> {t('achievementsTab')} ({unlockedCount}/{achievementDefs.length})
          </TabsTrigger>
          <TabsTrigger value="glossary" className="text-xs">
            <BookOpen size={14} className="mr-1" /> {t('glossaryTab')} ({glossaryTerms.length})
          </TabsTrigger>
        </TabsList>

        {/* ===== ACHIEVEMENTS ===== */}
        <TabsContent value="achievements" className="mt-4 space-y-4">
          <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-sm">Ваш уровень безопасности</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {unlockedCount === 0
                      ? 'Начните обучение, чтобы получить первые достижения!'
                      : unlockedCount < 5
                        ? 'Вы на правильном пути! Продолжайте изучать модули.'
                        : unlockedCount < achievementDefs.length
                          ? 'Впечатляющий прогресс! Ещё немного до полного прохождения.'
                          : 'Великолепно! Все достижения разблокированы!'}
                  </p>
                </div>
                <div className="text-3xl font-bold text-amber-600">{unlockedCount}/{achievementDefs.length}</div>
              </div>
              <div className="h-2 bg-amber-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${(unlockedCount / achievementDefs.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievementDefs.map((ach, i) => {
              const unlocked = getAchievementStatus(ach.id, completedModules, quizScores);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`transition-all ${unlocked ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 opacity-70'}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                        unlocked ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {achievementIcons[ach.id]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${unlocked ? 'text-amber-900' : 'text-slate-500'}`}>
                            {ach.title}
                          </h3>
                          {unlocked && (
                            <Badge className="bg-amber-500 text-white border-0 text-[10px]">
                              <Flame size={10} className="mr-0.5" /> Получено
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${unlocked ? 'text-amber-800' : 'text-slate-400'}`}>
                          {ach.description}
                        </p>
                        {!unlocked && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">
                            {ach.condition}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== GLOSSARY ===== */}
        <TabsContent value="glossary" className="mt-4 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-10"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryColors).map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className={`text-[10px] cursor-pointer hover:opacity-80 ${categoryColors[cat]}`}
                onClick={() => setSearchTerm(cat)}
              >
                {cat}
              </Badge>
            ))}
            {searchTerm && (
              <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setSearchTerm('')}>
                {t('clear')}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {filteredTerms.map((term, i) => (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="border-slate-200 hover:border-emerald-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold font-mono">{term.term}</h3>
                      <Badge variant="secondary" className={`text-[10px] ${categoryColors[term.category] || 'bg-slate-100 text-slate-700'}`}>
                        {term.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{term.definition}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredTerms.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-400">
                {t('noResults')} &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
