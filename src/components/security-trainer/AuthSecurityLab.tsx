'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Clock,
  ShieldCheck,
  Hash,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function AuthSecurityLab() {
  const { completeModule, setCurrentPage, completedModules } = useAppStore();
  const isCompleted = completedModules.includes('auth');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [crackLength, setCrackLength] = useState(8);
  const [crackComplexity, setCrackComplexity] = useState(1);
  const [hashInput, setHashInput] = useState('');

  // Password strength checker
  const getPasswordAnalysis = () => {
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
  };
  const passwordAnalysis = getPasswordAnalysis();

  const formatTime = (seconds: number) => {
    if (seconds < 1) return 'Мгновенно';
    if (seconds < 60) return `${Math.round(seconds)} сек`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} мин`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} ч`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} дн`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} лет`;
    if (seconds < 31536000 * 1e6) return `${Math.round(seconds / 31536000 / 1000)} тыс. лет`;
    if (seconds < 31536000 * 1e9) return `${Math.round(seconds / 31536000 / 1e6)} млн лет`;
    return 'Бесконечно';
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

  // Simulated hash
  const getSimulatedHash = () => {
    if (!hashInput) return '';
    let hash = 0;
    const salt = 'a1b2c3d4e5f6';
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash + char + salt.charCodeAt(i % salt.length)) | 0;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return `$2b$12$${salt}$${hexHash.repeat(8)}`;
  };
  const simulatedHash = getSimulatedHash();

  const handleComplete = () => {
    if (!isCompleted) completeModule('auth');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Lock size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Безопасность аутентификации</h1>
          <p className="text-xs text-slate-500">Пароли, хеширование и управление сессиями</p>
        </div>
      </div>

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="password" className="text-xs">
            <KeyRound size={14} className="mr-1" /> Пароли
          </TabsTrigger>
          <TabsTrigger value="bruteforce" className="text-xs">
            <Zap size={14} className="mr-1" /> Брутфорс
          </TabsTrigger>
          <TabsTrigger value="hashing" className="text-xs">
            <Hash size={14} className="mr-1" /> Хеширование
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">
            <Clock size={14} className="mr-1" /> Сессии
          </TabsTrigger>
        </TabsList>

        {/* Password Strength Checker */}
        <TabsContent value="password" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <KeyRound size={16} className="text-emerald-600" />
                Проверка надёжности пароля
              </h3>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль для проверки..."
                  className="pr-10 font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                  <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                    <div className={`h-full ${passwordAnalysis.color} rounded-full transition-all duration-500`}
                      style={{ width: `${passwordAnalysis.score}%` }}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-600">Критерии проверки:</h4>
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
                Визуализация полного перебора (Brute Force)
              </h3>
              <p className="text-xs text-slate-500">
                Узнайте, сколько времени нужно для подбора пароля с учётом длины и сложности.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>Длина пароля</span>
                    <span className="font-mono font-bold">{crackLength} символов</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={20}
                    value={crackLength}
                    onChange={(e) => setCrackLength(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>4</span>
                    <span>20</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>Сложность (набор символов)</span>
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
                    crackTime === 'Мгновенно' || crackTime.includes('сек') || crackTime.includes('мин')
                      ? 'text-red-400'
                      : crackTime.includes('ч') || crackTime.includes('дн')
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }`}>
                    {crackTime}
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
                Демонстрация хеширования паролей
              </h3>
              <p className="text-xs text-slate-500">
                Введите пароль, чтобы увидеть, как работает bcrypt-хеширование с солью.
              </p>

              <Input
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Введите пароль для хеширования..."
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
                    <p className="text-[10px] text-slate-500 mb-1">Оригинальный пароль:</p>
                    <code className="text-xs font-mono">{hashInput}</code>
                  </div>

                  <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                    <p className="text-[10px] text-violet-500 mb-1">Сгенерированный хеш (bcrypt-подобный):</p>
                    <code className="text-xs font-mono text-violet-700 break-all">{simulatedHash}</code>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Структура хеша:</p>
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
                Безопасность сессий
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
      </Tabs>

      {/* Complete module */}
      {!isCompleted ? (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={handleComplete}
        >
          Отметить модуль как изученный
        </Button>
      ) : (
        <div className="text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Модуль завершён!
        </div>
      )}
    </div>
  );
}
