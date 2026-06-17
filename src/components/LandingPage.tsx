'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Database, FileText, FileCode, Link, Lock, Code, KeyRound, ShieldAlert,
  Trophy, BookOpen, Target, Zap, Star, Menu, X,
  ArrowRight, Sparkles, Layers, ScrollText, CheckCircle2, Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { modules } from '@/lib/security-data';
import { quizCategories } from '@/lib/data/quiz-data';
import { useTranslations } from '@/lib/intlStub';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield size={20} />,
  Database: <Database size={20} />,
  FileText: <FileText size={20} />,
  Link: <Link size={20} />,
  Lock: <Lock size={20} />,
  Code: <Code size={20} />,
  KeyRound: <KeyRound size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
};

const features = [
  {
    icon: Database,
    titleKey: 'interactiveLabs',
    descKey: 'interactiveLabsDesc',
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    titleKey: 'owaspTop10',
    descKey: 'owaspTop10Desc',
    gradient: 'from-blue-500 to-violet-500',
    bgGlow: 'bg-blue-500/10',
  },
  {
    icon: Trophy,
    titleKey: 'achievementSystem',
    descKey: 'achievementSystemDesc',
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/10',
  },
  {
    icon: BookOpen,
    titleKey: 'quizzesTitle',
    descKey: 'quizzesDesc',
    gradient: 'from-rose-500 to-pink-500',
    bgGlow: 'bg-rose-500/10',
  },
];

const stats = [
  { labelKey: 'statsModules', value: modules.length, suffix: '' },
  { labelKey: 'statsQuizzes', value: quizCategories.length, suffix: '' },
  { labelKey: 'statsLevels', value: 15, suffix: '+' },
  { labelKey: 'statsAchievements', value: 15, suffix: '+' },
];

const floatingIcons = [
  { Icon: Shield, color: 'text-emerald-400/20', size: 48, x: '10%', y: '20%', delay: 0 },
  { Icon: Lock, color: 'text-blue-400/20', size: 36, x: '85%', y: '30%', delay: 1 },
  { Icon: Database, color: 'text-teal-400/20', size: 42, x: '20%', y: '70%', delay: 2 },
  { Icon: Code, color: 'text-violet-400/20', size: 32, x: '75%', y: '60%', delay: 0.5 },
  { Icon: KeyRound, color: 'text-amber-400/20', size: 28, x: '50%', y: '15%', delay: 1.5 },
  { Icon: FileCode, color: 'text-rose-400/20', size: 34, x: '90%', y: '75%', delay: 2.5 },
  { Icon: Globe, color: 'text-cyan-400/20', size: 30, x: '35%', y: '80%', delay: 1.8 },
  { Icon: ShieldAlert, color: 'text-orange-400/20', size: 26, x: '65%', y: '85%', delay: 0.8 },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('landing');

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating security icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map(({ Icon, color, size, x, y, delay }, i) => (
          <motion.div
            key={i}
            className={`absolute ${color}`}
            style={{ left: x, top: y, willChange: 'transform' }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/30 dark:bg-emerald-400/20"
            style={{ left: `${12 + i * 15}%`, top: `${18 + (i % 3) * 28}%`, willChange: 'transform' }}
            animate={{
              y: [0, -24 - (i % 3) * 8, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.6,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">CyberSec Lab</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-1">
            {['features', 'modules'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t(id)}
              </button>
            ))}
            <div className="ml-2 flex items-center gap-1">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <Button
              variant="premium"
              size="sm"
              className="ml-2 shadow-lg shadow-emerald-600/20"
              onClick={() => router.push('/auth/signin')}
            >
              {t('signIn')}
            </Button>
          </nav>

          <button
            className="md:hidden text-slate-600 dark:text-slate-300 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t('closeMenu') : t('openMenu')}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg"
          >
            {['features', 'modules'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2"
              >
                {t(id)}
              </button>
            ))}
            <div className="flex items-center gap-2 py-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <Button variant="premium" className="w-full" onClick={() => router.push('/auth/signin')}>
              {t('signIn')}
            </Button>
          </motion.div>
        )}
      </header>

      <section className="relative pt-36 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-sm px-4 py-1.5 rounded-full">
              <Sparkles size={14} className="mr-1.5" />
              {t('majorBadge')}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              {t('heroTitle')}
            </span>
          </motion.h1>

          <motion.p
             initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed text-balance"
          >
            {t('heroDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="xl"
              variant="premium"
              className="shadow-xl shadow-emerald-600/25 hover:shadow-emerald-500/30 transition-all duration-300"
              onClick={() => router.push('/auth/signin')}
            >
              {t('startLearning')}
              <ArrowRight size={20} className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 px-8 py-6"
              onClick={() => scrollTo('modules')}
            >
              {t('viewModules')}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <div className="text-4xl font-bold bg-gradient-to-b from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500 mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-full px-4 py-1.5">
              <Layers size={14} className="mr-1.5" />
              {t('features')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t('featuresTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{t('featuresDesc')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group relative h-full border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 overflow-hidden card-hover">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <CardContent className="p-6 relative z-10">
                      <div className={`w-12 h-12 rounded-xl ${feature.bgGlow} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <div className={`bg-gradient-to-br ${feature.gradient} rounded-lg p-2.5`}>
                          <Icon size={20} className="text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t(feature.titleKey)}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.descKey === 'quizzesDesc'
                          ? t(feature.descKey, { count: quizCategories.length })
                          : t(feature.descKey)}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="modules" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-full px-4 py-1.5">
              <ScrollText size={14} className="mr-1.5" />
              {t('modulesTitle')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t('modulesTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              {t('modulesDesc', { count: modules.length })}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="group relative h-full border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 overflow-hidden card-hover cursor-default">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        {iconMap[mod.icon] || <Shield size={22} />}
                      </div>
                      <Badge className={`${mod.difficultyColor} border-0 text-[10px]`}>{mod.difficulty}</Badge>
                    </div>
                    <h3 className="text-base font-semibold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">{mod.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{mod.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={13} /> {t('lessonsCount', { count: mod.lessons })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Target size={13} /> {t('stepsCount', { count: mod.totalSteps })}
                      </span>
                    </div>
                  </CardContent>
                  <div className="h-0.5 bg-slate-100 dark:bg-slate-700">
                    <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-500 ease-out" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-28 px-4">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-8 md:p-14 text-center"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none animate-levitate-delayed" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none animate-levitate" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative z-10">
              <div className="flex justify-center gap-4 mb-6">
                {[Trophy, Star, Zap].map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      i === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                      i === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    <Icon size={28} />
                  </motion.div>
                ))}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t('progressTitle')}</h2>
              <p className="text-slate-300 mb-8 max-w-lg mx-auto">{t('progressDesc')}</p>
              <Button
                size="xl"
                variant="premium"
                className="shadow-lg shadow-emerald-600/30 px-8"
                onClick={() => router.push('/auth/signin')}
              >
                {t('startEarningXP')} <Sparkles size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-28 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t('ctaTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">{t('ctaDesc')}</p>
            <Button
              size="xl"
              variant="premium"
              className="shadow-xl shadow-emerald-600/25"
              onClick={() => router.push('/auth/signin')}
            >
              {t('ctaButton')} <CheckCircle2 size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="relative py-10 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-medium">{t('footerName')}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200">{t('footerAbout')}</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200">{t('footerDocs')}</a>
            <span>{t('footerMajor')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
