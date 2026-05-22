'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Shield, Database, FileText, Link, Lock, Code, KeyRound, ShieldAlert,
  Trophy, BookOpen, Target, Zap, ChevronRight, Star, Menu, X, Sun, Moon, Monitor, Languages
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { modules } from '@/lib/security-data';
import { quizCategories } from '@/lib/data/quiz-data';

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield size={24} />,
  Database: <Database size={24} />,
  FileText: <FileText size={24} />,
  Link: <Link size={24} />,
  Lock: <Lock size={24} />,
  Code: <Code size={24} />,
  KeyRound: <KeyRound size={24} />,
  ShieldAlert: <ShieldAlert size={24} />,
};

const features = [
  {
    icon: Database,
    title: 'Интерактивные лаборатории',
    description: 'SQL-инъекции, XSS, CSRF и другие уязвимости с пошаговыми симуляциями',
  },
  {
    icon: Shield,
    title: 'OWASP Top 10',
    description: 'Полное покрытие 10 критических угроз с примерами кода и защитами',
  },
  {
    icon: Trophy,
    title: 'Система достижений',
    description: 'XP, уровни, достижения — отслеживайте прогресс и мотивируйте себя',
  },
  {
    icon: BookOpen,
    title: 'Квизы и тестирование',
    description: `${quizCategories.length} категорий квизов для проверки знаний по каждой теме`,
  },
];

const stats = [
  { label: 'Модулей', value: modules.length.toString() },
  { label: 'Квизов', value: quizCategories.length.toString() },
  { label: 'Уровней', value: '15+' },
  { label: 'Достижений', value: '15+' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type ThemeCycle = 'light' | 'dark' | 'system';
const THEME_CYCLE: ThemeCycle[] = ['light', 'dark', 'system'];
const THEME_ICONS: Record<ThemeCycle, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

const LOCALE_STORAGE_KEY = 'app-locale';

function getStoredLocale(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCALE_STORAGE_KEY) || '';
  }
  return '';
}

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState(() => getStoredLocale() || 'ru');

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme: ThemeCycle = (theme as ThemeCycle) || 'system';
  const nextThemeIndex = (THEME_CYCLE.indexOf(currentTheme) + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextThemeIndex];
  const ThemeIcon = THEME_ICONS[currentTheme];

  const toggleLocale = () => {
    const next = locale === 'ru' ? 'en' : 'ru';
    setLocale(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
      window.location.reload();
    }
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-600 dark:text-emerald-500" size={24} />
            <span className="font-bold text-lg text-slate-900 dark:text-white">CyberSec Lab</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <button onClick={() => scrollTo('features')} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Возможности
            </button>
            <button onClick={() => scrollTo('modules')} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Модули
            </button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-600 dark:text-slate-300"
                onClick={() => setTheme(nextTheme)}
                title={`Тема: ${currentTheme} → ${nextTheme}`}
              >
                <ThemeIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 dark:text-slate-300"
              onClick={toggleLocale}
              aria-label="Toggle language"
            >
              <Languages className="h-4 w-4" />
              {mounted && (
                <span className="ml-1 text-xs">{locale === 'ru' ? 'EN' : 'RU'}</span>
              )}
            </Button>
            <Button variant="outline" className="border-emerald-600/50 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10" onClick={() => router.push('/auth/signin')}>
              Войти
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block w-full text-left text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2">
              Возможности
            </button>
            <button onClick={() => scrollTo('modules')} className="block w-full text-left text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2">
              Модули
            </button>
            <div className="flex items-center gap-2 py-2">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-600 dark:text-slate-300"
                  onClick={() => setTheme(nextTheme)}
                >
                  <ThemeIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-600 dark:text-slate-300"
                onClick={toggleLocale}
              >
                <Languages className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/auth/signin')}>
              Войти
            </Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-6 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-sm px-4 py-1.5">
              09.03.04 Программная инженерия
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent"
          >
            Тренажёр по информационной безопасности
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Изучайте уязвимости на практике: SQL-инъекции, XSS, CSRF, OWASP Top 10 и безопасное кодирование в интерактивных лабораториях
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8" onClick={() => router.push('/auth/signin')}>
              Начать обучение <ChevronRight size={20} className="ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => scrollTo('modules')}>
              Смотреть модули
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Возможности платформы</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Всё необходимое для изучения основ информационной безопасности веб-приложений
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 h-full hover:border-emerald-500/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Modules Preview */}
      <section id="modules" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Учебные модули</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              {modules.length} интерактивных модулей — от основ OWASP до продвинутых техник безопасного кодирования
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {modules.map((mod) => (
              <motion.div key={mod.id} variants={itemVariants}>
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 h-full hover:border-emerald-500/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        {iconMap[mod.icon] || <Shield size={24} />}
                      </div>
                      <Badge className={mod.difficultyColor}>{mod.difficulty}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{mod.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{mod.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {mod.lessons} уроков
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={14} /> {mod.totalSteps} шагов
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Achievements Preview */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-600/20 dark:to-teal-600/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-8 md:p-12 text-center"
          >
            <div className="flex justify-center gap-4 mb-6">
              <Trophy size={32} className="text-emerald-600 dark:text-emerald-400" />
              <Star size={32} className="text-yellow-500 dark:text-yellow-400" />
              <Zap size={32} className="text-orange-500 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">Система прогресса и достижений</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-8 max-w-lg mx-auto">
              Получайте XP за прохождение модулей, квизов и задач. Открывайте достижения и отслеживайте свой уровень.
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/auth/signin')}>
              Начать зарабатывать XP <ChevronRight size={20} className="ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Готовы начать?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Войдите в систему, чтобы получить доступ ко всем модулям, квизам и инструментам
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10" onClick={() => router.push('/auth/signin')}>
            Войти в систему <ChevronRight size={20} className="ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-600 dark:text-emerald-500" size={16} />
            <span>CyberSec Lab — Тренажёр по ИБ</span>
          </div>
          <span>09.03.04 Программная инженерия</span>
        </div>
      </footer>
    </div>
  );
}
