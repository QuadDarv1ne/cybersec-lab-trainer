'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Loader2, Shield, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { isValidEmail, getEmailValidationError } from '@/lib/email-validation';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/theme-toggle';
import { signIn } from 'next-auth/react';
import { useTranslations } from '@/lib/intlStub';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function SignInPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/app';

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(true);
  const abortRef = useRef(false);

  // Form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = email.length > 0 && isValidEmail(email);
  const emailError = emailTouched && email.length > 0 ? getEmailValidationError(email) : null;
  const showEmailValidation = emailTouched && email.length > 0;

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = false;

    fetch('/api/auth/providers', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!abortRef.current) {
          setAvailableProviders(data.providers ?? []);
          setDemoMode(data.demoMode ?? false);
        }
      })
      .catch(() => {
        if (!abortRef.current) {
          setAvailableProviders([]);
          setDemoMode(true);
        }
      })
      .finally(() => {
        if (!abortRef.current) setProvidersLoading(false);
      });

    return () => {
      abortRef.current = true;
      controller.abort();
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('enterEmail'));
      return;
    }

    setLoadingProvider('credentials');
    try {
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();

      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          csrfToken,
          email,
          ...(name && { name }),
          callbackUrl,
          redirect: 'false',
        }),
        redirect: 'manual',
      });

      const location = res.headers.get('location');
      if (location) {
        window.location.replace(location);
      } else {
        window.location.replace(callbackUrl);
      }
    } catch {
      toast.error(t('errorOccurred'));
      setLoadingProvider(null);
    }
  };

  const handleOAuth = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast.error(t('authError', { provider }));
      setLoadingProvider(null);
    }
  };

  const handleDemo = async () => {
    setLoadingProvider('demo');
    try {
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();

      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          csrfToken,
          email: 'demo@example.com',
          name: 'Demo User',
          callbackUrl,
          redirect: 'false',
        }),
        redirect: 'manual',
      });

      const location = res.headers.get('location');
      if (location) {
        window.location.replace(location);
      } else {
        window.location.replace(callbackUrl);
      }
    } catch (err) {
      console.error('[SIGNIN] handleDemo error:', err);
      toast.error(t('loginError'));
      setLoadingProvider(null);
    }
  };

  if (providersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Shield className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  const hasOAuth = availableProviders.length > 0;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Language and theme controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl animate-float-delay-1" />
        <div className="absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-float-delay-2" />
      </div>

      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-2xl text-slate-900 dark:text-white">CyberSec Lab</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('subtitle')}</p>
          </div>
        </motion.div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl p-6 sm:p-8">
          {/* Dynamic title */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="font-bold text-2xl text-slate-900 dark:text-white">
              {isSignUp ? t('signUpTitle') : t('signInTitle')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {isSignUp
                ? t('signUpSubtitle')
                : t('signInSubtitle')}
            </p>
          </motion.div>

          {/* Tabs - segmented control */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="relative flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <motion.div
                className="absolute top-1 bottom-1 left-1 rounded-md bg-white dark:bg-slate-700 shadow-sm"
                animate={{ x: isSignUp ? '100%' : '0%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: 'calc(50% - 8px)' }}
              />
              <button
                className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${
                  !isSignUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
                onClick={() => setIsSignUp(false)}
              >
                {t('signIn')}
              </button>
              <button
                className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${
                  isSignUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
                onClick={() => setIsSignUp(true)}
              >
                {t('signUp')}
              </button>
            </div>
          </motion.div>

          {/* Email form */}
          <motion.form variants={itemVariants} onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('nameLabel')}
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('emailLabel')}
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  className={`pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors ${
                    emailError
                      ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500'
                      : emailValid
                        ? 'border-emerald-500 dark:border-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500'
                        : 'focus:border-emerald-500 dark:focus:border-emerald-500'
                  }`}
                  required
                />
                <AnimatePresence>
                  {showEmailValidation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {emailValid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : emailError ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-500 dark:text-red-400"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              disabled={loadingProvider === 'credentials'}
            >
              {loadingProvider === 'credentials' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              {isSignUp ? t('register') : t('signIn')}
            </Button>
          </motion.form>

          {/* Divider */}
          {hasOAuth && (
            <motion.div variants={itemVariants} className="relative flex items-center gap-3 py-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('orVia')}</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </motion.div>
          )}

          {/* OAuth buttons */}
          <motion.div variants={itemVariants} className="space-y-3">
            {availableProviders.includes('github') && (
              <Button
                variant="outline"
                className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleOAuth('github')}
                disabled={loadingProvider === 'github'}
              >
                {loadingProvider === 'github' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            )}

            {availableProviders.includes('google') && (
              <Button
                variant="outline"
                className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => handleOAuth('google')}
                disabled={loadingProvider === 'google'}
              >
                {loadingProvider === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Google
              </Button>
            )}
          </motion.div>

          {/* Demo mode */}
          {demoMode && (
            <>
              {!hasOAuth && (
                <motion.div variants={itemVariants} className="relative flex items-center gap-3 py-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('or')}</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <Button
                  variant="ghost"
                  className="w-full h-11 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={handleDemo}
                  disabled={loadingProvider === 'demo'}
                >
                  {loadingProvider === 'demo' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  {t('signInAsDemo')}
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Back to landing */}
        <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          <a href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            ← {t('backToHome')}
          </a>
        </motion.p>
      </motion.div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
