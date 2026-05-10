// Achievements and Glossary Data

export interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: string;
}

export const achievements: Achievement[] = [
  {
    id: 'first-steps',
    title: 'Первые шаги',
    description: 'Завершите свой первый модуль обучения.',
    condition: 'Пройдите любой модуль',
  },
  {
    id: 'sql-master',
    title: 'SQL-мастер',
    description: 'Завершите все задания лаборатории SQL-инъекций.',
    condition: 'Пройдите модуль SQL-инъекции',
  },
  {
    id: 'xss-hunter',
    title: 'Охотник на XSS',
    description: 'Изучите все три типа XSS-атак.',
    condition: 'Пройдите модуль XSS',
  },
  {
    id: 'security-guard',
    title: 'Страж безопасности',
    description: 'Изучите все 10 категорий OWASP Top 10.',
    condition: 'Изучите все пункты OWASP Top 10',
  },
  {
    id: 'auth-expert',
    title: 'Эксперт по аутентификации',
    description: 'Завершите модуль безопасности аутентификации.',
    condition: 'Пройдите модуль Аутентификация',
  },
  {
    id: 'code-reviewer',
    title: 'Код-ревьюер',
    description: 'Завершите все задания безопасного кодирования.',
    condition: 'Пройдите модуль Безопасное кодирование',
  },
  {
    id: 'quiz-master',
    title: 'Мастер квизов',
    description: 'Пройдите квизы в 3 и более категориях.',
    condition: 'Завершите 3 квиза',
  },
  {
    id: 'quiz-perfect',
    title: 'Безупречный результат',
    description: 'Получите 100% в любом квизе.',
    condition: 'Наберите 100% в квизе',
  },
  {
    id: 'crypto-ninja',
    title: 'Криптограф-ниндзя',
    description: 'Завершите модуль инструментов безопасности.',
    condition: 'Пройдите модуль Инструменты',
  },
  {
    id: 'full-completion',
    title: 'Полное прохождение',
    description: 'Завершите все обучающие модули платформы.',
    condition: 'Пройдите все 7 модулей',
  },
];

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'sql-injection',
    term: 'SQL-инъекция',
    definition: 'Тип атаки, при которой злоумышленник внедряет произвольный SQL-код в запросы к базе данных через уязвимые входные данные.',
    category: 'Атаки',
  },
  {
    id: 'xss',
    term: 'XSS (Cross-Site Scripting)',
    definition: 'Уязвимость, позволяющая внедрять вредоносный JavaScript-код в страницы, отображаемые другим пользователям.',
    category: 'Атаки',
  },
  {
    id: 'csrf',
    term: 'CSRF (Cross-Site Request Forgery)',
    definition: 'Атака, заставляющая жертву выполнять нежелательные действия на доверенном сайте через автоматическую отправку запросов с куки аутентификации.',
    category: 'Атаки',
  },
  {
    id: 'owasp',
    term: 'OWASP',
    definition: 'Open Web Application Security Project — международная некоммерческая организация, занимающаяся улучшением безопасности программного обеспечения.',
    category: 'Организации',
  },
  {
    id: 'cve',
    term: 'CVE (Common Vulnerabilities and Exposures)',
    definition: 'Система идентификации уязвимостей, где каждая уязвимость получает уникальный идентификатор (например, CVE-2021-44228).',
    category: 'Стандарты',
  },
  {
    id: 'bcrypt',
    term: 'bcrypt',
    definition: 'Алгоритм хеширования паролей с встроенной солью и настраиваемой сложностью, устойчивый к брутфорс-атакам.',
    category: 'Криптография',
  },
  {
    id: 'jwt',
    term: 'JWT (JSON Web Token)',
    definition: 'Стандарт (RFC 7519) для создания подписанных токенов аутентификации, состоящий из header, payload и signature.',
    category: 'Аутентификация',
  },
  {
    id: 'salt',
    term: 'Соль (Salt)',
    definition: 'Случайные данные, добавляемые к паролю перед хешированием для защиты от rainbow tables и обеспечения уникальности хешей.',
    category: 'Криптография',
  },
  {
    id: 'https',
    term: 'HTTPS',
    definition: 'Расширение протокола HTTP с использованием шифрования TLS/SSL для защиты передаваемых данных.',
    category: 'Протоколы',
  },
  {
    id: 'tls',
    term: 'TLS (Transport Layer Security)',
    definition: 'Криптографический протокол для обеспечения безопасной связи между приложениями в сети.',
    category: 'Протоколы',
  },
  {
    id: 'csp',
    term: 'CSP (Content Security Policy)',
    definition: 'Механизм безопасности, позволяющий указать разрешённые источники загрузки ресурсов (скриптов, стилей, изображений).',
    category: 'Безопасность',
  },
  {
    id: 'xss-reflected',
    term: 'Reflected XSS',
    definition: 'Тип XSS-атаки, при которой вредоносный скрипт отражается от сервера через параметры запроса или форму.',
    category: 'Атаки',
  },
  {
    id: 'xss-stored',
    term: 'Stored XSS',
    definition: 'Наиболее опасный тип XSS, при котором вредоносный код сохраняется на сервере (в БД, комментариях) и выполняется для всех посетителей.',
    category: 'Атаки',
  },
  {
    id: 'xss-dom',
    term: 'DOM-based XSS',
    definition: 'XSS-уязвимость, возникающая на стороне клиента при модификации DOM-дерева через данные из ненадёжных источников.',
    category: 'Атаки',
  },
  {
    id: 'sqli-blind',
    term: 'Blind SQL Injection',
    definition: 'Тип SQL-инъекции, при котором сервер не возвращает данные напрямую, но поведение приложения позволяет извлекать информацию.',
    category: 'Атаки',
  },
  {
    id: 'sqli-union',
    term: 'UNION-based SQL Injection',
    definition: 'Техника SQL-инъекции, использующая оператор UNION для объединения результатов оригинального запроса с данными злоумышленника.',
    category: 'Атаки',
  },
  {
    id: 'oauth',
    term: 'OAuth 2.0',
    definition: 'Фреймворк авторизации для делегирования доступа к ресурсам без передачи паролей, использующий токены доступа.',
    category: 'Аутентификация',
  },
  {
    id: 'mfa',
    term: 'MFA (Multi-Factor Authentication)',
    definition: 'Многофакторная аутентификация — требование нескольких независимых доказательств личности (пароль + SMS + токен).',
    category: 'Аутентификация',
  },
  {
    id: '2fa',
    term: '2FA (Two-Factor Authentication)',
    definition: 'Двухфакторная аутентификация — частный случай MFA с двумя факторами (обычно пароль + одноразовый код).',
    category: 'Аутентификация',
  },
  {
    id: 'totp',
    term: 'TOTP (Time-based One-Time Password)',
    definition: 'Алгоритм генерации одноразовых паролей на основе времени, используемый в Google Authenticator и аналогах.',
    category: 'Аутентификация',
  },
  {
    id: 'ddos',
    term: 'DDoS (Distributed Denial of Service)',
    definition: 'Распределённая атака на отказ в обслуживании, при которой множество устройств перегружают целевой сервер запросами.',
    category: 'Атаки',
  },
  {
    id: 'mitm',
    term: 'MitM (Man-in-the-Middle)',
    definition: 'Атака «человек посередине» — перехват и возможная модификация трафика между двумя сторонами.',
    category: 'Атаки',
  },
  {
    id: 'phishing',
    term: 'Фишинг',
    definition: 'Социальная инженерия для получения конфиденциальных данных через поддельные сайты, письма или сообщения.',
    category: 'Атаки',
  },
  {
    id: 'zero-day',
    term: 'Zero-Day уязвимость',
    definition: 'Уязвимость, о которой разработчики не знают и для которой нет исправлений, что позволяет злоумышленникам эксплуатировать её.',
    category: 'Уязвимости',
  },
  {
    id: 'exploit',
    term: 'Exploit',
    definition: 'Программа или код, использующие уязвимость для получения несанкционированного доступа или выполнения атаки.',
    category: 'Уязвимости',
  },
  {
    id: 'payload',
    term: 'Payload',
    definition: 'Часть вредоносного кода, выполняющая целевое действие после успешной эксплуатации уязвимости.',
    category: 'Уязвимости',
  },
  {
    id: 'shell',
    term: 'Shell',
    definition: 'Интерфейс командной строки, который может быть получен на сервере после успешной атаки (reverse shell, bind shell).',
    category: 'Уязвимости',
  },
  {
    id: 'privesc',
    term: 'Привилегировенное повышение (Privilege Escalation)',
    definition: 'Эксплуатация уязвимости для получения более высоких прав доступа в системе.',
    category: 'Атаки',
  },
  {
    id: 'idor',
    term: 'IDOR (Insecure Direct Object Reference)',
    definition: 'Уязвимость контроля доступа, при которой пользователь может получить доступ к объектам, изменив их идентификатор в запросе.',
    category: 'Уязвимости',
  },
  {
    id: 'ssrf',
    term: 'SSRF (Server-Side Request Forgery)',
    definition: 'Атака, при которой сервер делает HTTP-запросы к внутренним ресурсам по указанию злоумышленника.',
    category: 'Атаки',
  },
  {
    id: 'lfi',
    term: 'LFI (Local File Inclusion)',
    definition: 'Уязвимость, позволяющая включать и читать локальные файлы на сервере через уязвимые параметры.',
    category: 'Уязвимости',
  },
  {
    id: 'rfi',
    term: 'RFI (Remote File Inclusion)',
    definition: 'Уязвимость, позволяющая включать и выполнять удалённые файлы с другого сервера.',
    category: 'Уязвимости',
  },
  {
    id: 'rce',
    term: 'RCE (Remote Code Execution)',
    definition: 'Критическая уязвимость, позволяющая выполнить произвольный код на удалённом сервере.',
    category: 'Уязвимости',
  },
  {
    id: 'waf',
    term: 'WAF (Web Application Firewall)',
    definition: 'Межсетевой экран для веб-приложений, фильтрующий HTTP-трафик и блокирующий атаки.',
    category: 'Защита',
  },
];