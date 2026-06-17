'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppStore, type PageType } from '@/lib/store';

interface BreadcrumbItem {
  label: string;
  href?: string;
  page?: PageType;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const handleNavigate = React.useCallback((page?: PageType, _href?: string) => {
    if (page) {
      setCurrentPage(page);
    }
  }, [setCurrentPage]);

  return (
    <nav className={cn('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isHome = index === 0;

        return (
          <React.Fragment key={index}>
            <div className="flex items-center gap-1">
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  onClick={() => handleNavigate(item.page, item.href)}
                >
                  <div className="flex items-center gap-1">
                    {isHome && <Home size={14} />}
                    <span>{item.label}</span>
                  </div>
                </Button>
              )}
            </div>
            {!isLast && (
              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Breadcrumbs items={breadcrumbs} />
        </motion.div>
      )}
      
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-2 text-muted-foreground text-sm"
            >
              {description}
            </motion.p>
          )}
        </div>
        
        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center gap-2 shrink-0"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card border border-border p-5 shadow-sm',
        'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

export function LoadingSkeleton({
  className,
  variant = 'text',
  width,
  height,
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse rounded-md bg-muted';
  
  const variantClasses = {
    text: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded-md',
  }[variant];

  return (
    <div
      className={cn(baseClasses, variantClasses, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface TooltipCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TooltipCard({
  title,
  description,
  icon,
  onClick,
  className,
}: TooltipCardProps) {
  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-card border border-border p-5 shadow-sm',
        'transition-all duration-300 hover:shadow-lg hover:border-primary/30',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={{ y: -4 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <ChevronRight 
          size={18} 
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" 
        />
      </div>
      
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-transparent group-hover:from-primary/5 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}
