'use client';

import { ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';

export default function ScrollToTop() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > 300);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={scrollToTop}
            className="relative w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-95"
            aria-label={t('scrollToTop')}
          >
            <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200 dark:text-slate-700"
              />
              <motion.circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-emerald-500"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 16}
                style={{ strokeDashoffset: scrollYProgress.get() ? (1 - scrollYProgress.get()) * 2 * Math.PI * 16 : 2 * Math.PI * 16 }}
              />
            </svg>
            <ArrowUp size={18} className="absolute inset-0 m-auto text-slate-600 dark:text-slate-300" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
