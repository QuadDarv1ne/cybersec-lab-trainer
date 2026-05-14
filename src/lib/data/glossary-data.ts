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
    condition: 'Пройдите все модули',
  },
  {
    id: 'headers-master',
    title: 'Мастер заголовков',
    description: 'Завершите модуль заголовков безопасности.',
    condition: 'Пройдите модуль Заголовки безопасности',
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
  {
    id: 'cors',
    term: 'CORS (Cross-Origin Resource Sharing)',
    definition: 'Механизм HTTP, позволяющий серверам указывать, какие origins (домены) могут получать ресурсы с сервера.',
    category: 'Протоколы',
  },
  {
    id: 'sop',
    term: 'Same-Origin Policy (SOP)',
    definition: 'Базовая модель безопасности браузеров, запрещающая скриптам с одного origin получать доступ к ресурсам другого origin.',
    category: 'Безопасность',
  },
  {
    id: 'clickjacking',
    term: 'Clickjacking (Кликджекинг)',
    definition: 'Атака, при которой невидимый iframe с целевым сайтом накладывается на видимые элементы, заставляя пользователя выполнить нежелательные действия.',
    category: 'Атаки',
  },
  {
    id: 'hsts',
    term: 'HSTS (HTTP Strict Transport Security)',
    definition: 'Заголовок HTTP, предписывающий браузеру использовать только HTTPS-соединение для данного домена.',
    category: 'Протоколы',
  },
  {
    id: 'x-frame-options',
    term: 'X-Frame-Options',
    definition: 'HTTP-заголовок, управляющий возможностью встраивания страницы в iframe. Значения: DENY, SAMEORIGIN.',
    category: 'Защита',
  },
  {
    id: 'content-type-options',
    term: 'X-Content-Type-Options',
    definition: 'HTTP-заголовок со значением nosniff, запрещающий браузеру угадывать MIME-тип файла и предотвращающий MIME-sniffing атаки.',
    category: 'Защита',
  },
  {
    id: 'ratelimiting',
    term: 'Rate Limiting',
    definition: 'Ограничение количества запросов от одного клиента за определённый промежуток времени для защиты от brute-force и DDoS.',
    category: 'Защита',
  },
  {
    id: 'honeypot',
    term: 'Honeypot (Ханипот)',
    definition: 'Декларативная система или сервис, предназначенные для привлечения и изучения злоумышленников с целью сбора данных об их методах.',
    category: 'Защита',
  },
  {
    id: 'pentest',
    term: 'Penetration Testing (Пентест)',
    definition: 'Моделирование атаки на систему с целью обнаружения уязвимостей и оценки безопасности.',
    category: 'Защита',
  },
  {
    id: 'redteam',
    term: 'Red Team / Blue Team',
    definition: 'Red Team — группа, имитирующая атакующих; Blue Team — группа защиты. Совместная работа для повышения безопасности.',
    category: 'Защита',
  },
  {
    id: 'threat-model',
    term: 'Threat Modeling (Моделирование угроз)',
    definition: 'Систематический процесс идентификации, оценки и документирования потенциальных угроз безопасности системы на этапе проектирования.',
    category: 'Защита',
  },
  {
    id: 'security-headers',
    term: 'HTTP Security Headers',
    definition: 'Набор заголовков безопасности: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.',
    category: 'Защита',
  },
  {
    id: 'input-validation',
    term: 'Input Validation (Валидация входных данных)',
    definition: 'Проверка всех данных, поступающих от пользователя, на соответствие ожидаемому формату, типу и диапазону значений.',
    category: 'Защита',
  },
  {
    id: 'output-encoding',
    term: 'Output Encoding (Кодирование выходных данных)',
    definition: 'Преобразование специальных символов в безопасное представление при выводе данных в HTML, JavaScript, SQL или другие контексты.',
    category: 'Защита',
  },
  {
    id: 'parameterized-query',
    term: 'Parameterized Query (Параметризованный запрос)',
    definition: 'SQL-запрос с параметрами-плейсхолдерами, при котором данные передаются отдельно от кода запроса, предотвращая SQL-инъекции.',
    category: 'Защита',
  },
  {
    id: 'hashing',
    term: 'Хеширование (Hashing)',
    definition: 'Односторонняя криптографическая функция, преобразующая данные произвольной длины в фиксированную строку. Необратима.',
    category: 'Криптография',
  },
  {
    id: 'encryption',
    term: 'Шифрование (Encryption)',
    definition: 'Процесс преобразования данных в нечитаемый вид с использованием ключа. В отличие от хеширования, обратим при наличии ключа.',
    category: 'Криптография',
  },
  {
    id: 'argon2',
    term: 'Argon2',
    definition: 'Современный алгоритм хеширования паролей, победитель Password Hashing Competition 2015. Устойчив к GPU-атакам.',
    category: 'Криптография',
  },
  {
    id: 'aes',
    term: 'AES (Advanced Encryption Standard)',
    definition: 'Симметричный блочный шифр, стандарт шифрования данных. Использует ключи 128, 192 или 256 бит.',
    category: 'Криптография',
  },
  {
    id: 'rainbow-table',
    term: 'Rainbow Table (Радужная таблица)',
    definition: 'Предварительно вычисленная таблица хешей для обратного поиска паролей. Защита — использование соли (salt).',
    category: 'Криптография',
  },
  {
    id: 'botnet',
    term: 'Botnet (Ботнет)',
    definition: 'Сеть заражённых устройств (ботов), управляемая злоумышленником для проведения DDoS-атак, рассылки спама и других целей.',
    category: 'Атаки',
  },
  {
    id: 'ransomware',
    term: 'Ransomware (Программа-шифровальщик)',
    definition: 'Вредоносное ПО, шифрующее данные жертвы и требующее выкуп за расшифровку.',
    category: 'Атаки',
  },
  {
    id: 'social-engineering',
    term: 'Social Engineering (Социальная инженерия)',
    definition: 'Манипуляция людьми с целью получения конфиденциальной информации или доступа к системам.',
    category: 'Атаки',
  },
  {
    id: 'bypass-auth',
    term: 'Authentication Bypass (Обход аутентификации)',
    definition: 'Техника получения доступа к системе без предоставления корректных учётных данных.',
    category: 'Атаки',
  },
  {
    id: 'privilege-escalation',
    term: 'Privilege Escalation (Повышение привилегий)',
    definition: 'Эксплуатация уязвимости для получения более высоких прав доступа, чем были изначально предоставлены.',
    category: 'Атаки',
  },
  {
    id: 'api-security',
    term: 'API Security (Безопасность API)',
    definition: 'Практики защиты API-эндпоинтов: аутентификация, авторизация, rate limiting, валидация входных данных.',
    category: 'Защита',
  },
  {
    id: 'devsecops',
    term: 'DevSecOps',
    definition: 'Интеграция практик безопасности в процессы DevOps: автоматическое тестирование безопасности в CI/CD пайплайне.',
    category: 'Защита',
  },
  {
    id: 'dependency-check',
    term: 'Dependency Check (Проверка зависимостей)',
    definition: 'Автоматизированное сканирование зависимостей проекта на наличие известных уязвимостей (CVE).',
    category: 'Защита',
  },
  {
    id: 'secure-cookie',
    term: 'Secure Cookie Flags',
    definition: 'Атрибуты cookie: Secure (только HTTPS), HttpOnly (недоступен JS), SameSite (ограничение кросс-сайтовых запросов).',
    category: 'Защита',
  },
  {
    id: 'session-management',
    term: 'Session Management (Управление сессиями)',
    definition: 'Механизмы создания, хранения, проверки и уничтожения пользовательских сессий безопасным образом.',
    category: 'Аутентификация',
  },
  {
    id: 'brute-force',
    term: 'Brute Force (Полный перебор)',
    definition: 'Метод атаки, при котором злоумышленник последовательно перебирает все возможные варианты пароля или ключа.',
    category: 'Атаки',
  },
  {
    id: 'dictionary-attack',
    term: 'Dictionary Attack (Атака по словарю)',
    definition: 'Вариант брутфорса, использующий заранее составленный словарь наиболее вероятных паролей.',
    category: 'Атаки',
  },
  {
    id: 'credential-stuffing',
    term: 'Credential Stuffing',
    definition: 'Автоматизированная подстановка учётных данных из утечек на множестве сайтов для получения доступа.',
    category: 'Атаки',
  },
  {
    id: 'data-breach',
    term: 'Data Breach (Утечка данных)',
    definition: 'Инцидент безопасности, при котором конфиденциальные данные становятся доступными неавторизованным лицам.',
    category: 'Уязвимости',
  },
];