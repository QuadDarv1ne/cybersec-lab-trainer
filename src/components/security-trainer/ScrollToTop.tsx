'use client';

import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            onClick={scrollToTop}
            aria-label="Прокрутить наверх"
          >
            <ArrowUp size={18} className="text-slate-600 dark:text-slate-300" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
