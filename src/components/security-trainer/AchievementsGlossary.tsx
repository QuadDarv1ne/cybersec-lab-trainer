'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { achievements as achievementDefs } from '@/lib/security-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Trophy,
  Search,
  Lock as LockIcon,
  BookOpen,
  Flame,
  Star,
  Target,
  Shield,
  Code,
  Database,
  GraduationCap,
} from 'lucide-react';

const glossaryTerms: { term: string; definition: string; category: string }[] = [
  { term: 'OWASP', definition: 'Open Worldwide Application Security Project — некоммерческая организация, разрабатывающая стандарты и инструменты безопасности веб-приложений. Наиболее известна по OWASP Top 10.', category: 'Организации' },
  { term: 'SQL-инъекция', definition: 'Тип атаки, при котором злоумышленник вставляет SQL-код в запрос через пользовательский ввод. Позволяет читать, модифицировать и удалять данные в базе данных.', category: 'Уязвимости' },
  { term: 'XSS (Cross-Site Scripting)', definition: 'Внедрение вредоносного скрипта в веб-страницу, который выполняется в браузере жертвы. Бывает отражённым, хранимым и DOM-based.', category: 'Уязвимости' },
  { term: 'CSRF (Cross-Site Request Forgery)', definition: 'Атака, заставляющая браузер аутентифицированного пользователя выполнить нежелательное действие на целевом сайте с помощью подделки запроса.', category: 'Уязвимости' },
  { term: 'SSRF (Server-Side Request Forgery)', definition: 'Атака, заставляющая серверное приложение делать HTTP-запросы к внутренним ресурсам по указанию злоумышленника. Опасна в облачных средах.', category: 'Уязвимости' },
  { term: 'XSSI (Cross-Site Script Inclusion)', definition: 'Атака, при которой злоумышленник включает чувствительные JavaScript-файлы (содержащие данные) со стороннего сайта, обходя Same-Origin Policy.', category: 'Уязвимости' },
  { term: 'Хеширование', definition: 'Однонаправленное преобразование данных произвольной длины в строку фиксированной длины. Используется для хранения паролей и проверки целостности данных.', category: 'Криптография' },
  { term: 'Соль (Salt)', definition: 'Случайные данные, добавляемые к паролю перед хешированием. Предотвращает использование rainbow tables и обеспечивает уникальные хеши для одинаковых паролей.', category: 'Криптография' },
  { term: 'bcrypt', definition: 'Адаптивная хеш-функция на основе Blowfish. Специально разработана для хеширования паролей, включает соль и настраиваемый фактор стоимости.', category: 'Криптография' },
  { term: 'Argon2', definition: 'Победитель конкурса PHC (Password Hashing Competition). Поддерживает настраиваемое использование памяти и времени, устойчив к GPU-атакам.', category: 'Криптография' },
  { term: 'JWT (JSON Web Token)', definition: 'Компактный, URL-безопасный токен из трёх частей (Header.Payload.Signature) для передачи информации между сторонами. Используется для аутентификации.', category: 'Аутентификация' },
  { term: 'OAuth 2.0', definition: 'Протокол авторизации, позволяющий приложениям получать ограниченный доступ к аккаунтам пользователей на других сервисах без передачи пароля.', category: 'Аутентификация' },
  { term: 'MFA (Многофакторная аутентификация)', definition: 'Использование двух и более факторов для подтверждения личности: что-то, что вы знаете (пароль), что-то, что у вас есть (телефон), что-то, что вы есть (биометрия).', category: 'Аутентификация' },
  { term: 'CSP (Content Security Policy)', definition: 'HTTP-заголовок, ограничивающий источники, откуда браузер может загружать скрипты, стили, изображения и другие ресурсы. Эффективная защита от XSS.', category: 'Защита' },
  { term: 'WAF (Web Application Firewall)', definition: 'Межсетевой экран для веб-приложений, фильтрующий HTTP-трафик между приложением и интернетом. Обнаруживает и блокирует атаки.', category: 'Защита' },
  { term: 'CORS (Cross-Origin Resource Sharing)', definition: 'Механизм безопасности браузера, контролирующий запросы к ресурсам с других доменов. Использует заголовки Access-Control-* для разрешения/запрета.', category: 'Защита' },
  { term: 'Same-Origin Policy', definition: 'Фундаментальная политика безопасности браузера, запрещающая веб-странице получать доступ к ресурсам другого домена без явного разрешения.', category: 'Защита' },
  { term: 'HTTPS / TLS', definition: 'Протокол шифрования передачи данных между клиентом и сервером. Обеспечивает конфиденциальность (шифрование), целостность (нет модификаций) и аутентификацию.', category: 'Сеть' },
  { term: 'TLS 1.3', definition: 'Последняя версия протокола TLS. Упрощённое рукопожатие (1-RTT), удалены устаревшие алгоритмы, обязательное шифрование. Рекомендуется для всех новых проектов.', category: 'Сеть' },
  { term: 'Rate Limiting', definition: 'Ограничение количества запросов от одного клиента за определённый период. Защищает от брутфорса, DDoS и перечисления пользователей.', category: 'Защита' },
  { term: 'Brute Force', definition: 'Метод атаки путём полного перебора всех возможных вариантов (паролей, ключей). Эффективен при слабых паролях. Противодействие: Rate Limiting, блокировка аккаунта.', category: 'Атаки' },
  { term: 'Rainbow Table', definition: 'Предварительно вычисленная таблица хешей для быстрого взлома паролей. Соль делает rainbow tables бесполезными.', category: 'Атаки' },
  { term: 'Session Hijacking', definition: 'Перехват сессионного токена злоумышленником для получения доступа к сессии аутентифицированного пользователя. Защита: HttpOnly, Secure, SameSite cookies.', category: 'Атаки' },
  { term: 'Clickjacking', definition: 'Атака, при которой невидимый вредоносный элемент накладывается на легитимную кнопку/ссылку. Защита: X-Frame-Options, CSP frame-ancestors.', category: 'Атаки' },
  { term: 'DOM Clobbering', definition: 'Техника внедрения HTML-элементов с определёнными id/name для перезаписи DOM-свойств документа, что может привести к изменению логики приложения.', category: 'Атаки' },
  { term: 'Prototype Pollution', definition: 'Атака на JavaScript-приложения через модификацию прототипа Object, которая может привести к изменению поведения приложения и выполнению произвольного кода.', category: 'Атаки' },
  { term: 'Prepared Statement', definition: 'Параметризованный SQL-запрос, в котором данные передаются отдельно от SQL-кода. Полностью предотвращает SQL-инъекции.', category: 'Защита' },
  { term: 'Sanitization', definition: 'Процесс очистки входных данных от потенциально опасного содержимого (HTML-теги, скрипты, спецсимволы) перед использованием в приложении.', category: 'Защита' },
  { term: 'XSS Payload', definition: 'Вредоносный код (обычно JavaScript), внедряемый при XSS-атаке. Может варьироваться от простого alert() до сложных фреймворков для кражи данных.', category: 'Уязвимости' },
  { term: 'Penetration Testing', definition: 'Метод тестирования безопасности, при котором авторизованный специалист имитирует атаки на систему для обнаружения уязвимостей до того, как это сделают злоумышленники.', category: 'Методологии' },
  { term: 'Threat Modeling', definition: 'Процесс систематической идентификации угроз и уязвимостей архитектуры приложения на этапе проектирования (STRIDE, DREAD, PASTA).', category: 'Методологии' },
  { term: 'OWASP ZAP', definition: 'Zed Attack Proxy — бесплатный инструмент с открытым исходным кодом для автоматизированного и ручного тестирования безопасности веб-приложений.', category: 'Инструменты' },
  { term: 'Burp Suite', definition: 'Коммерческая платформа для тестирования безопасности веб-приложений. Включает прокси, сканер уязвимостей, инструмент повторного воспроизведения запросов.', category: 'Инструменты' },
  { term: 'Nmap', definition: 'Утилита для сканирования портов и обнаружения служб в сети. Используется для аудита безопасности и обнаружения открытых портов на серверах.', category: 'Инструменты' },
];

const categoryColors: Record<string, string> = {
  'Уязвимости': 'bg-red-100 text-red-700',
  'Криптография': 'bg-violet-100 text-violet-700',
  'Аутентификация': 'bg-amber-100 text-amber-700',
  'Защита': 'bg-emerald-100 text-emerald-700',
  'Сеть': 'bg-sky-100 text-sky-700',
  'Атаки': 'bg-orange-100 text-orange-700',
  'Организации': 'bg-slate-100 text-slate-700',
  'Методологии': 'bg-indigo-100 text-indigo-700',
  'Инструменты': 'bg-teal-100 text-teal-700',
};

const achievementIcons: Record<string, React.ReactNode> = {
  'first-steps': <BookOpen size={24} />,
  'sql-master': <Database size={24} />,
  'xss-hunter': <Code size={24} />,
  'security-guard': <Shield size={24} />,
  'auth-expert': <Target size={24} />,
  'code-reviewer': <Code size={24} />,
  'quiz-master': <Trophy size={24} />,
  'quiz-perfect': <Star size={24} />,
  'crypto-ninja': <LockIcon size={24} />,
  'full-completion': <GraduationCap size={24} />,
};

export default function AchievementsAndGlossary() {
  const { setCurrentPage, completedModules, quizScores, studiedOwaspItems, sqlCompletedLevels, xssCompletedLevels } = useAppStore();
  const [activeTab, setActiveTab] = useState<'achievements' | 'glossary'>('achievements');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate achievements
  const getAchievementStatus = (id: string) => {
    switch (id) {
      case 'first-steps': return completedModules.length >= 1;
      case 'sql-master': return completedModules.includes('sql-injection');
      case 'xss-hunter': return completedModules.includes('xss');
      case 'security-guard': return completedModules.includes('owasp');
      case 'auth-expert': return completedModules.includes('auth');
      case 'code-reviewer': return completedModules.includes('secure-coding');
      case 'quiz-master': return Object.keys(quizScores).length >= 3;
      case 'quiz-perfect': return Object.values(quizScores).some((s) => s === 100);
      case 'crypto-ninja': return completedModules.includes('tools');
      case 'full-completion': return completedModules.length >= 7;
      default: return false;
    }
  };

  const unlockedCount = achievementDefs.filter((a) => getAchievementStatus(a.id)).length;

  const filteredTerms = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Trophy size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Достижения и глоссарий</h1>
          <p className="text-xs text-slate-500">Отслеживайте прогресс и изучайте термины</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'achievements' | 'glossary')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements" className="text-xs">
            <Trophy size={14} className="mr-1" /> Достижения ({unlockedCount}/{achievementDefs.length})
          </TabsTrigger>
          <TabsTrigger value="glossary" className="text-xs">
            <BookOpen size={14} className="mr-1" /> Глоссарий ({glossaryTerms.length})
          </TabsTrigger>
        </TabsList>

        {/* ===== ACHIEVEMENTS ===== */}
        <TabsContent value="achievements" className="mt-4 space-y-4">
          <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-sm">Ваш уровень безопасности</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {unlockedCount === 0
                      ? 'Начните обучение, чтобы получить первые достижения!'
                      : unlockedCount < 5
                        ? 'Вы на правильном пути! Продолжайте изучать модули.'
                        : unlockedCount < achievementDefs.length
                          ? 'Впечатляющий прогресс! Ещё немного до полного прохождения.'
                          : 'Великолепно! Все достижения разблокированы!'}
                  </p>
                </div>
                <div className="text-3xl font-bold text-amber-600">{unlockedCount}/{achievementDefs.length}</div>
              </div>
              <div className="h-2 bg-amber-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${(unlockedCount / achievementDefs.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievementDefs.map((ach, i) => {
              const unlocked = getAchievementStatus(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`transition-all ${unlocked ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 opacity-70'}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                        unlocked ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {achievementIcons[ach.id]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${unlocked ? 'text-amber-900' : 'text-slate-500'}`}>
                            {ach.title}
                          </h3>
                          {unlocked && (
                            <Badge className="bg-amber-500 text-white border-0 text-[10px]">
                              <Flame size={10} className="mr-0.5" /> Получено
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${unlocked ? 'text-amber-800' : 'text-slate-400'}`}>
                          {ach.description}
                        </p>
                        {!unlocked && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">
                            {ach.condition}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== GLOSSARY ===== */}
        <TabsContent value="glossary" className="mt-4 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по терминам..."
              className="pl-10"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryColors).map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className={`text-[10px] cursor-pointer hover:opacity-80 ${categoryColors[cat]}`}
                onClick={() => setSearchTerm(cat)}
              >
                {cat}
              </Badge>
            ))}
            {searchTerm && (
              <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setSearchTerm('')}>
                Очистить
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {filteredTerms.map((term, i) => (
              <motion.div
                key={term.term}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="border-slate-200 hover:border-emerald-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold font-mono">{term.term}</h3>
                      <Badge variant="secondary" className={`text-[10px] ${categoryColors[term.category] || 'bg-slate-100 text-slate-700'}`}>
                        {term.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{term.definition}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredTerms.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-400">
                Ничего не найдено по запросу &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
