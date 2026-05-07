'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Lock, Globe, Server, ShieldCheck } from 'lucide-react';

const attackSteps = [
  {
    id: 1,
    title: 'Вход в банковское приложение',
    description: 'Пользователь заходит на bank.com и успешно проходит аутентификацию. Сервер устанавливает сессионную куку в браузер.',
    detail: 'Set-Cookie: session_id=abc123; Domain=bank.com; Path=/',
    icon: <Globe size={20} className="text-emerald-600" />,
    color: 'border-emerald-300 bg-emerald-50',
  },
  {
    id: 2,
    title: 'Посещение вредоносного сайта',
    description: 'Пользователь переходит на evil.com, который содержит скрытую HTML-форму, автоматически отправляющую запрос к bank.com.',
    detail: 'На evil.com загружается страница с невидимой формой, JavaScript автоматически отправляет POST-запрос.',
    icon: <AlertTriangle size={20} className="text-amber-600" />,
    color: 'border-amber-300 bg-amber-50',
  },
  {
    id: 3,
    title: 'Автоматическая отправка запроса',
    description: 'Скрытая форма на evil.com автоматически отправляет POST-запрос к bank.com/transfer с параметрами перевода.',
    detail: 'POST /transfer HTTP/1.1\nHost: bank.com\nCookie: session_id=abc123\n\namount=10000&to=attacker_account',
    icon: <Server size={20} className="text-orange-600" />,
    color: 'border-orange-300 bg-orange-50',
  },
  {
    id: 4,
    title: 'Банк обрабатывает запрос',
    description: 'Банк получает запрос с корректной сессионной кукой и выполняет перевод. Сервер не может отличить этот запрос от легитимного действия пользователя.',
    detail: 'Сервер проверяет session_id → cookie валиден → выполняет перевод. Деньги переведены злоумышленнику!',
    icon: <AlertTriangle size={20} className="text-red-600" />,
    color: 'border-red-300 bg-red-50',
  },
];

const defenseMechanisms = [
  {
    title: 'CSRF-токены (Anti-CSRF Tokens)',
    description: 'Сервер генерирует уникальный случайный токен для каждой формы и сохраняет его в сессии. При отправке формы токен проверяется на сервере. Злоумышленник не может получить токен из-за Same-Origin Policy.',
    code: `// Генерация CSRF-токена
app.use(csrf({ cookie: true }));

// В форме
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <input name="amount" type="number">
  <button type="submit">Перевести</button>
</form>`,
  },
  {
    title: 'SameSite Cookie Attribute',
    description: 'Атрибут SameSite контролирует, когда куки отправляются с кросс-сайтовыми запросами. SameSite=Strict полностью блокирует, SameSite=Lax разрешает только навигационные GET-запросы.',
    code: `// Настройка куки с SameSite
Set-Cookie: session_id=abc123;
  SameSite=Strict;
  Secure;
  HttpOnly

// Express.js
app.use(session({
  cookie: {
    sameSite: 'strict',
    secure: true,
    httpOnly: true
  }
}));`,
  },
  {
    title: 'Проверка Referer / Origin',
    description: 'Сервер проверяет заголовок Referer или Origin входящего запроса. Если запрос приходит не с собственного домена — он отклоняется.',
    code: `// Проверка Origin заголовка
app.post('/transfer', (req, res) => {
  const origin = req.headers.origin;
  if (origin !== 'https://bank.com') {
    return res.status(403).json({
      error: 'CSRF: неверный Origin'
    });
  }
  // Обработка перевода...
});`,
  },
];

export default function CSRFLab() {
  const { completedModules, completeModule, setCurrentPage } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDefense, setShowDefense] = useState(false);
  const [activeDefense, setActiveDefense] = useState(0);

  const isCompleted = completedModules.includes('csrf');

  const handleComplete = () => {
    if (!isCompleted) {
      completeModule('csrf');
    }
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
          <h1 className="text-xl font-bold">CSRF-атаки</h1>
          <p className="text-xs text-slate-500">Cross-Site Request Forgery — подделка межсайтовых запросов</p>
        </div>
      </div>

      {/* What is CSRF */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-2">Что такое CSRF?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            CSRF — это атака, при которой злоумышленник заставляет браузер аутентифицированного пользователя
            выполнить нежелательное действие на сайте, на котором пользователь уже авторизован. Атака
            эксплуатирует то, что браузер автоматически прикрепляет куки аутентификации к каждому запросу
            к домену, для которого они установлены. Злоумышленник создаёт вредоносную страницу с
            скрытой HTML-формой, которая автоматически отправляет запрос к целевому сайту.
          </p>
        </CardContent>
      </Card>

      {/* Attack simulation */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-1">🎭 Симуляция атаки — пошаговая демонстрация</h3>
          <p className="text-xs text-slate-500 mb-4">
            Нажимайте «Далее», чтобы увидеть каждый этап CSRF-атаки
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {attackSteps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className={`rounded-lg border-2 p-4 transition-all duration-300 ${
                  i <= currentStep ? step.color : 'border-slate-100 bg-slate-50 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                      i <= currentStep ? 'bg-slate-800' : 'bg-slate-300'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h4 className="text-sm font-semibold">{step.title}</h4>
                    </div>
                    <AnimatePresence>
                      {i <= currentStep && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <p className="text-xs text-slate-600 leading-relaxed mb-2">
                            {step.description}
                          </p>
                          <div className="bg-white/70 rounded p-2">
                            <code className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                              {step.detail}
                            </code>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={14} className="mr-1" /> Назад
            </Button>
            <div className="flex gap-1">
              {attackSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i <= currentStep ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
            {currentStep < attackSteps.length - 1 ? (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Далее <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowDefense(true)}
              >
                К защите <ShieldCheck size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Defense mechanisms */}
      {showDefense && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-2">
                <ShieldCheck size={16} />
                Механизмы защиты от CSRF
              </h3>
              <p className="text-xs text-emerald-700">
                Нажимайте на каждый механизм, чтобы увидеть пример кода
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {defenseMechanisms.map((def, i) => (
              <Card
                key={i}
                className="border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors"
                onClick={() => setActiveDefense(activeDefense === i ? -1 : i)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{def.title}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {activeDefense === i ? 'Скрыть' : 'Показать код'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{def.description}</p>

                  <AnimatePresence>
                    {activeDefense === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="mt-3">
                          <CodeBlock code={def.code} language="javascript" title="defense.js" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Complete */}
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
        </motion.div>
      )}
    </div>
  );
}
