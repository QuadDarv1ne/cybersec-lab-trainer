'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import InlineNotes from './InlineNotes';
import { useAppStore } from '@/lib/store';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import { authChallenges } from '@/lib/security-data';
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Hash,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Target,
  XCircle,
} from 'lucide-react';

export default function AuthSecurityLab() {
  const completeModule = useAppStore((s) => s.completeModule);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);
  const setAuthChallengeScore = useAppStore((s) => s.setAuthChallengeScore);
  const authChallengeScores = useAppStore((s) => s.authChallengeScores);
  const t = useTranslations('auth');
  const isCompleted = completedModules.includes('auth');

  // Challenge state
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(authChallengeScores.correct);

  // Keep a ref to answeredChallenges for the sync effect — the effect reads
  // answeredChallenges.has(activeChallenge) to restore showResult, but also
  // calls setAnsweredChallenges. Adding the Set to deps would create a new
  // reference each render and cause an infinite loop, so we use a ref instead.
  const answeredChallengesRef = useRef<Set<number>>(new Set(authChallengeScores.answered));
  const [answeredChallenges, setAnsweredChallenges] = useState<Set<number>>(new Set(authChallengeScores.answered));

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [crackLength, setCrackLength] = useState(8);
  const [crackComplexity, setCrackComplexity] = useState(1);
  const [hashInput, setHashInput] = useState('');
  const [simulatedHash, setSimulatedHash] = useState('');

  // Re-sync local state when store values change
  useEffect(() => {
    setCorrectCount(authChallengeScores.correct);
    const newAnswered = new Set(authChallengeScores.answered);
    setAnsweredChallenges(newAnswered);
    answeredChallengesRef.current = newAnswered;
    if (authChallengeScores.selectedOptions?.[activeChallenge] !== undefined) {
      setSelectedOption(authChallengeScores.selectedOptions[activeChallenge]);
      setShowResult(answeredChallengesRef.current.has(activeChallenge));
    } else {
      setSelectedOption(null);
      setShowResult(false);
    }
  }, [authChallengeScores.correct, authChallengeScores.answered, authChallengeScores.selectedOptions, activeChallenge]);

  // Simulated hash using Web Crypto API (SHA-256)
  useEffect(() => {
    if (!hashInput) {
      setSimulatedHash('');
      return;
    }
    let cancelled = false;
    const computeHash = async () => {
      try {
        const salt = 'a1b2c3d4e5f6';
        const encoder = new TextEncoder();
        const data = encoder.encode(salt + hashInput);
        const buffer = await crypto.subtle.digest('SHA-256', data);
        const hashHex = Array.from(new Uint8Array(buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        if (!cancelled) {
          setSimulatedHash(hashHex);
        }
      } catch {
        if (!cancelled) {
          setSimulatedHash('(crypto unavailable)');
        }
      }
    };
    computeHash();
    return () => { cancelled = true; };
  }, [hashInput]);

  // Complete module when all challenges are answered with >= 70% correct
  useEffect(() => {
    if (answeredChallenges.size === authChallenges.length &&
        correctCount >= Math.ceil(authChallenges.length * 0.7) &&
        !isCompleted) {
      completeModule('auth');
    }
  }, [answeredChallenges.size, correctCount, isCompleted, completeModule]);

  // Password strength checker
  const passwordAnalysis = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', checks: [] };

    const checks = [
      { label: 'Минимум 8 символов', passed: password.length >= 8 },
      { label: 'Строчные буквы (a-z)', passed: /[a-z]/.test(password) },
      { label: 'Заглавные буквы (A-Z)', passed: /[A-Z]/.test(password) },
      { label: 'Цифры (0-9)', passed: /[0-9]/.test(password) },
      { label: 'Спецсимволы (!@#$...)', passed: /[^a-zA-Z0-9]/.test(password) },
      { label: 'Минимум 12 символов', passed: password.length >= 12 },
      { label: 'Нет повторяющихся символов', passed: !/(.)\1{2,}/.test(password) },
      { label: 'Нет последовательностей (abc, 123)', passed: !/(?:abc|bcd|cde|def|efg|012|123|234|345|456|567|678|789)/i.test(password) },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    let score = 0;
    let label = '';
    let color = '';

    if (passedCount <= 2) { score = 20; label = 'Очень слабый'; color = 'bg-red-500'; }
    else if (passedCount <= 3) { score = 40; label = 'Слабый'; color = 'bg-red-400'; }
    else if (passedCount <= 5) { score = 60; label = 'Средний'; color = 'bg-yellow-500'; }
    else if (passedCount <= 6) { score = 80; label = 'Надёжный'; color = 'bg-emerald-500'; }
    else { score = 100; label = 'Отличный'; color = 'bg-emerald-600'; }

    return { score, label, color, checks };
  }, [password]);

  const currentChallenge = authChallenges[activeChallenge];
  const isChallengeAnswered = answeredChallenges.has(activeChallenge);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        {t('noChallenges')}
      </div>
    );
  }

  const handleSelectOption = (index: number) => {
    if (isChallengeAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isChallengeAnswered) return;
    setShowResult(true);
    const newAnswered = new Set(answeredChallenges);
    newAnswered.add(activeChallenge);
    setAnsweredChallenges(newAnswered);
    answeredChallengesRef.current = newAnswered;
    const isCorrect = currentChallenge.options[selectedOption].correct;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);
    const newSelectedOptions = { ...authChallengeScores.selectedOptions, [activeChallenge]: selectedOption };
    setAuthChallengeScore(newCorrect, [...newAnswered], newSelectedOptions);
  };

  const nextChallenge = () => {
    if (activeChallenge < authChallenges.length - 1) {
      setActiveChallenge(activeChallenge + 1);
      setShowResult(false);
    }
  };

  const prevChallenge = () => {
    if (activeChallenge > 0) {
      setActiveChallenge(activeChallenge - 1);
      setShowResult(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return { seconds, label: t('timeLabels.instant') };
    if (seconds < 60) return { seconds, label: `${Math.round(seconds)} ${t('timeLabels.seconds')}` };
    if (seconds < 3600) return { seconds, label: `${Math.round(seconds / 60)} ${t('timeLabels.minutes')}` };
    if (seconds < 86400) return { seconds, label: `${Math.round(seconds / 3600)} ${t('timeLabels.hours')}` };
    if (seconds < 31536000) return { seconds, label: `${Math.round(seconds / 86400)} ${t('timeLabels.days')}` };
    if (seconds < 31536000 * 100) return { seconds, label: `${Math.round(seconds / 31536000)} ${t('timeLabels.years')}` };
    if (seconds < 31536000 * 1e6) return { seconds, label: `${Math.round(seconds / 31536000 / 1000)} ${t('timeLabels.thousandYears')}` };
    if (seconds < 31536000 * 1e9) return { seconds, label: `${Math.round(seconds / 31536000 / 1e6)} ${t('timeLabels.millionYears')}` };
    return { seconds, label: t('timeLabels.forever') };
  };

  // Brute force time estimation
  const getCrackTime = () => {
    let charsetSize = 26;
    if (crackComplexity >= 2) charsetSize += 26;
    if (crackComplexity >= 3) charsetSize += 10;
    if (crackComplexity >= 4) charsetSize += 32;
    const combinations = Math.pow(charsetSize, crackLength);
    const attemptsPerSecond = 1e10;
    const seconds = combinations / attemptsPerSecond / 2;
    return formatTime(seconds);
  };
  const crackTime = getCrackTime();

  const handleComplete = () => {
    if (!isCompleted) completeModule('auth');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('backToDashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Lock size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
          <TabsTrigger value="password" className="text-xs">
            <KeyRound size={14} className="mr-1" /> {t('passwordStrength')}
          </TabsTrigger>
          <TabsTrigger value="bruteforce" className="text-xs">
            <Zap size={14} className="mr-1" /> {t('bruteForce')}
          </TabsTrigger>
          <TabsTrigger value="hashing" className="text-xs">
            <Hash size={14} className="mr-1" /> {t('hashing')}
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">
            <Clock size={14} className="mr-1" /> {t('jwtExplainer')}
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs">
            <Target size={14} className="mr-1" /> Задания ({authChallenges.length})
          </TabsTrigger>
        </TabsList>

        {/* Password Strength Checker */}
        <TabsContent value="password" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <KeyRound size={16} className="text-emerald-600" />
                {t('passwordStrength')}
              </h3>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordInput')}
                  className="pr-10 font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{passwordAnalysis.label}</span>
                    <Badge variant={passwordAnalysis.score >= 80 ? 'default' : 'destructive'}>
                      {passwordAnalysis.score}/100
                    </Badge>
                  </div>
                  <Progress
                    value={passwordAnalysis.score}
                    className="h-2"
                  />

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-600">{t('passwordAnalysis')}:</h4>
                    {passwordAnalysis.checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {check.passed ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <AlertTriangle size={14} className="text-slate-300" />
                        )}
                        <span className={check.passed ? 'text-slate-700' : 'text-slate-400'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brute Force Visualizer */}
        <TabsContent value="bruteforce" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Zap size={16} className="text-red-500" />
                {t('bruteForce')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('estimatedTime')}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>{t('passwordLength')}</span>
                    <span className="font-mono font-bold">{crackLength} {crackLength === 1 ? 'символ' : crackLength < 5 ? 'символа' : 'символов'}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={20}
                    value={crackLength}
                    onChange={(e) => setCrackLength(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                    aria-label="Длина пароля"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>4</span>
                    <span>20</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>{t('complexity')}</span>
                    <span className="font-mono font-bold">
                      {crackComplexity === 1
                        ? '26 (a-z)'
                        : crackComplexity === 2
                          ? '52 (a-z, A-Z)'
                          : crackComplexity === 3
                            ? '62 (+0-9)'
                            : '94 (+спецсимволы)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={crackComplexity}
                    onChange={(e) => setCrackComplexity(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                    aria-label="Сложность пароля"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Строчные</span>
                    <span>Полная</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-slate-900 rounded-xl p-5 text-center">
                  <p className="text-xs text-slate-400 mb-2">Время полного перебора (10 млрд попыток/сек)</p>
                  <p className={`text-3xl font-bold font-mono ${
                    crackTime.seconds < 3600
                      ? 'text-red-400'
                      : crackTime.seconds < 86400
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }`}>
                    {crackTime.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Комбинаций: {Math.pow(
                      crackComplexity === 1 ? 26 : crackComplexity === 2 ? 52 : crackComplexity === 3 ? 62 : 94,
                      crackLength
                    ).toExponential(2)}
                  </p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-700">
                    💡 <strong>Рекомендация:</strong> Используйте пароли длиной 12+ символов с
                    заглавными и строчными буквами, цифрами и спецсимволами. Такой пароль потребует
                    сотни лет для подбора даже на мощных GPU-кластерах.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hashing Demo */}
        <TabsContent value="hashing" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Hash size={16} className="text-violet-600" />
                {t('hashing')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('hashInput')}
              </p>

              <Input
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder={t('hashInput')}
                type="text"
                className="font-mono"
              />

              {hashInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-1">{t('hashInput')}:</p>
                    <code className="text-xs font-mono">{hashInput}</code>
                  </div>

                  <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                    <p className="text-[10px] text-violet-500 mb-1">{t('hashResult')}:</p>
                    <code className="text-xs font-mono text-violet-700 break-all">{simulatedHash}</code>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-1">{t('hashAlgorithm')}:</p>
                    <div className="space-y-1">
                      <p className="text-[11px]">
                        <code className="bg-red-100 text-red-700 px-1 rounded">$2b$12$</code>
                        <span className="text-slate-500 ml-1">— алгоритм (bcrypt) и стоимость (12 раундов)</span>
                      </p>
                      <p className="text-[11px]">
                        <code className="bg-amber-100 text-amber-700 px-1 rounded">a1b2c3d4e5f6</code>
                        <span className="text-slate-500 ml-1">— соль (уникальная для каждого пользователя)</span>
                      </p>
                      <p className="text-[11px]">
                        <code className="bg-emerald-100 text-emerald-700 px-1 rounded">7f3a...</code>
                        <span className="text-slate-500 ml-1">— собственно хеш пароля</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <h4 className="text-xs font-semibold text-emerald-700 mb-1">
                      🛡️ Почему bcrypt?
                    </h4>
                    <ul className="text-[11px] text-emerald-600 space-y-1">
                      <li>• Автоматически добавляет соль — защита от rainbow tables</li>
                      <li>• Настраиваемая стоимость (cost factor) — замедляет перебор</li>
                      <li>• Устойчив к GPU-атакам (памятекоёмкий алгоритм)</li>
                      <li>• Однонаправленный — невозможно восстановить пароль из хеша</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              <CodeBlock
                code={`// Пример использования bcrypt в Node.js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Хеширование пароля
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
  // Результат: $2b$12$N9qo8uLOickgx2ZMRZoMy...
}

// Проверка пароля
async function verify(password, hash) {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch; // true или false
}`}
                language="javascript"
                title="bcrypt-usage.js"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Security */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock size={16} className="text-sky-600" />
                {t('jwtExplainer')}
              </h3>

              <div className="space-y-4">
                <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                  <h4 className="text-xs font-semibold text-sky-800 mb-2">JWT (JSON Web Token)</h4>
                  <p className="text-xs text-sky-700 leading-relaxed">
                    JWT — это компактный токен для передачи информации между клиентом и сервером.
                    Состоит из трёх частей: Header (заголовок с алгоритмом подписи), Payload
                    (данные: id пользователя, роль, срок действия) и Signature (подпись для
                    проверки целостности). Токены могут храниться в localStorage или в HttpOnly
                    куках.
                  </p>
                </div>

                <CodeBlock
                  code={`// Генерация JWT
const jwt = require('jsonwebtoken');

function login(user) {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }  // Токен истекает через час
  );
  return token;
}

// Проверка JWT (middleware)
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
}`}
                  language="javascript"
                  title="jwt-auth.js"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <h4 className="text-xs font-semibold text-red-700 mb-2">❌ Небезопасно</h4>
                    <ul className="text-[11px] text-red-600 space-y-1">
                      <li>• Хранение JWT в localStorage (доступен через XSS)</li>
                      <li>• Срок действия больше 24 часов</li>
                      <li>• Отсутствие refresh-токенов</li>
                      <li>• Секрет в клиентском коде</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <h4 className="text-xs font-semibold text-emerald-700 mb-2">✅ Безопасно</h4>
                    <ul className="text-[11px] text-emerald-600 space-y-1">
                      <li>• Хранение в HttpOnly + Secure куках</li>
                      <li>• Короткий срок (15-30 мин) + refresh-токен</li>
                      <li>• Проверка подписи на каждом запросе</li>
                      <li>• Чёрный список compromised токенов</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          {/* Challenge Progress */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  {t('taskLabel', { current: activeChallenge + 1, total: authChallenges.length })}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {t('correctCount', { count: correctCount })}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {authChallenges.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveChallenge(i); setSelectedOption(null); setShowResult(false); }}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      answeredChallenges.has(i) ? 'bg-emerald-500' : i === activeChallenge ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenge Card */}
          <motion.div key={activeChallenge} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-emerald-600" />
                  <h3 className="font-semibold">{currentChallenge.title}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase">{currentChallenge.category}</Badge>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-600">{currentChallenge.scenario}</p>
                </div>

                <CodeBlock code={currentChallenge.code} language="javascript" title="challenge.js" />

                <h4 className="font-medium mt-4 mb-3">{currentChallenge.question}</h4>

                <div className="space-y-2">
                  {currentChallenge.options.map((option, i) => {
                    let optionStyle = 'border-slate-200 hover:border-slate-400 hover:bg-slate-50';
                    if (isChallengeAnswered) {
                      optionStyle = option.correct ? 'border-emerald-400 bg-emerald-50' :
                        selectedOption === i && !option.correct ? 'border-red-400 bg-red-50' : 'border-slate-100 opacity-60';
                    } else if (selectedOption === i) {
                      optionStyle = 'border-emerald-400 bg-emerald-50/50';
                    }

                    return (
                      <button
                        key={`${currentChallenge.id}-${i}`}
                        onClick={() => handleSelectOption(i)}
                        disabled={isChallengeAnswered}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${optionStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isChallengeAnswered && option.correct ? 'border-emerald-500 bg-emerald-500' :
                            isChallengeAnswered && selectedOption === i && !option.correct ? 'border-red-500 bg-red-500' :
                            selectedOption === i ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'
                          }`}>
                            {isChallengeAnswered && option.correct && <CheckCircle2 size={14} className="text-white" />}
                            {isChallengeAnswered && selectedOption === i && !option.correct && <XCircle size={14} className="text-white" />}
                          </div>
                          <span className="text-sm">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!isChallengeAnswered && (
                  <Button
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                  >
                    {t('checkAnswerBtn')}
                  </Button>
                )}

                <AnimatePresence>
                  {showResult && selectedOption !== null && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <div className={`rounded-lg p-4 ${
                        currentChallenge.options[selectedOption].correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <h4 className={`text-xs font-semibold mb-1 ${
                          currentChallenge.options[selectedOption].correct ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {currentChallenge.options[selectedOption].correct ? `✅ ${t('correctAnswer')}` : `❌ ${t('incorrectAnswer')}`}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{currentChallenge.explanation}</p>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" onClick={prevChallenge} disabled={activeChallenge === 0}>
                          {t('backBtn')}
                        </Button>
                        {activeChallenge < authChallenges.length - 1 ? (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={nextChallenge}>
                            {t('nextBtn')}
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-600 text-white py-1.5">{t('allTasksPassed')}</Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Complete module */}
      {!isCompleted ? (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={handleComplete}
        >
          {t('markComplete')}
        </Button>
      ) : (
        <div className="text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> {t('moduleComplete')}
        </div>
      )}

      {/* Notes for current challenge */}
      {currentChallenge && <InlineNotes itemId={currentChallenge.id} moduleId="auth" moduleName={t('title')} />}
    </div>
  );
}
