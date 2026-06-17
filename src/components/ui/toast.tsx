'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const toastColors: Record<ToastType, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
  error: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50',
};

const toastTextColors: Record<ToastType, string> = {
  success: 'text-emerald-800 dark:text-emerald-200',
  error: 'text-rose-800 dark:text-rose-200',
  warning: 'text-amber-800 dark:text-amber-200',
  info: 'text-blue-800 dark:text-blue-200',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-emerald-500 dark:text-emerald-400',
  error: 'text-rose-500 dark:text-rose-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-blue-500 dark:text-blue-400',
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ 
        opacity: isExiting ? 0 : 1, 
        y: isExiting ? -20 : 0,
        scale: isExiting ? 0.95 : 1
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-xl border shadow-lg',
        toastColors[type]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('shrink-0 mt-0.5', iconColors[type])}>
            {toastIcons[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-semibold text-sm', toastTextColors[type])}>
              {title}
            </h4>
            {message && (
              <p className={cn('mt-1 text-sm line-clamp-2', toastTextColors[type], 'opacity-90')}>
                {message}
              </p>
            )}
          </div>

          <button
            onClick={handleClose}
            className={cn(
              'shrink-0 p-1 rounded-md transition-colors',
              'hover:bg-black/5 dark:hover:bg-white/10',
              toastTextColors[type]
            )}
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20">
          <motion.div
            className={cn('h-full', iconColors[type])}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ToastContainer({ children, className }: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
}

interface useToastReturn {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

interface ToastContextType {
  toasts: Array<{ id: string; type: ToastType; title: string; message?: string; duration?: number }>;
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastContextType['toasts']>([]);

  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast(): useToastReturn {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    success: (title: string, message?: string) => context.addToast('success', title, message),
    error: (title: string, message?: string) => context.addToast('error', title, message),
    warning: (title: string, message?: string) => context.addToast('warning', title, message),
    info: (title: string, message?: string) => context.addToast('info', title, message),
  };
}
