'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  gradientFrom?: string;
  gradientTo?: string;
  hoverScale?: number;
  showGlow?: boolean;
  glowColor?: string;
  children: React.ReactNode;
}

export function EnhancedCard({
  className,
  variant = 'default',
  gradientFrom = 'emerald-500',
  gradientTo = 'teal-500',
  showGlow = false,
  glowColor = 'emerald',
  children,
  ...props
}: EnhancedCardProps) {
  const glowClasses = {
    emerald: 'glow-emerald',
    blue: 'glow-blue',
    amber: 'glow-amber',
  }[glowColor] || 'glow-emerald';

  const baseClasses = cn(
    'relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer',
    variant === 'default' && 'bg-card border border-border shadow-sm hover:shadow-md',
    variant === 'gradient' && `bg-gradient-to-br from-${gradientFrom} to-${gradientTo} text-white border-0 shadow-lg`,
    variant === 'glass' && 'glass border border-white/20 dark:border-white/10',
    variant === 'elevated' && 'bg-card border border-border shadow-lg hover:shadow-xl',
    showGlow && glowClasses,
    className
  );

  return (
    <div
      className={baseClasses}
      {...props}
    >
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  suffix = '',
  className,
  duration = 1,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
    if (hasAnimated.current) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.round(easedProgress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        hasAnimated.current = true;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className={cn('tabular-nums', className)}>
      {displayValue}{suffix}
    </span>
  );
}

interface PulseBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
  size?: 'sm' | 'md' | 'lg';
}

export function PulseBadge({
  className,
  color = 'emerald',
  size = 'md',
  children,
  ...props
}: PulseBadgeProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  }[color] || 'bg-emerald-500';

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size] || 'md';

  return (
    <div className={cn('relative inline-flex', className)} {...props}>
      <motion.div
        className={cn('absolute rounded-full opacity-75', sizeClasses, colorClasses)}
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className={cn('relative rounded-full', sizeClasses, colorClasses)} />
      {children}
    </div>
  );
}

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export function ShimmerButton({
  className,
  variant = 'default',
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-lg px-6 py-3 font-semibold transition-all duration-300',
        variant === 'default' && 
          'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        variant === 'outline' &&
          'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </button>
  );
}
