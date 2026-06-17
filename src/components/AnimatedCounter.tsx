'use client';

import { useMotionValue, useTransform, animate, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function AnimatedCounter({
  value,
  suffix = '',
  duration = 1,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const count = useMotionValue(0);
  const displayValue = useTransform(count, (v) => `${Math.round(v)}${suffix}`);
  const prefersReducedMotion = useReducedMotion();
  const prevValueRef = useRef(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      prevValueRef.current = value;
      if (prefersReducedMotion) {
        count.set(value);
        return;
      }
      const controls = animate(count, value, {
        duration,
        ease: 'easeOut',
        delay,
      });
      return controls.stop;
    }
    if (prevValueRef.current === value) return;
    prevValueRef.current = value;
    if (prefersReducedMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, delay, count, prefersReducedMotion]);

  return <motion.span>{displayValue}</motion.span>;
}
