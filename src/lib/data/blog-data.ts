// CyberSec Blog Articles Data

export interface BlogArticle {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  readTime: string;
  date: string;
  author: string;
  coverIcon: string;
  sections: ArticleSection[];
  tags: string[];
  relatedSlugs?: string[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  content: string;
  codeExample?: {
    language: string;
    title: string;
    code: string;
    caption?: string;
  };
  tip?: string;
  warning?: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'owasp-top-10-2024',
    title: 'OWASP Top 10 2024: Полный разбор уязвимостей',
    subtitle: 'Что изменилось по сравнению с 2021 годом и почему Broken Access Control остаётся на первом месте',
    category: 'Веб-безопасность',
    categoryColor: 'text-emerald-600 bg-emerald-50',
    readTime: '12 мин',
    date: '2025-01-15',
    author: 'Dupley Maxim',
    coverIcon: 'Shield',
    tags: ['OWASP', 'веб-безопасность', 'уязвимости'],
    sections: [
      {
        id: 'intro',
        heading: 'Что такое OWASP Top 10?',
        content: 'OWASP Top 10 — это стандартный перечень наиболее критических угроз безопасности веб-приложений, разработанный сообществом Open Worldwide Application Security Project. Он основан на анализе данных сотен организаций и тысяч приложений.',
        tip: 'OWASP Top 10 используется как стандарт в требованиях PCI DSS и многих регуляторных документах.',
      },
      {
        id: 'a01',
        heading: 'A01: Broken Access Control',
        content: 'Сбой контроля доступа — это когда пользователи могут получать доступ к данным или функциям, которые им не предназначены. Это включает IDOR (Insecure Direct Object Reference), обход аутентификации и эскалацию привилегий.',
        codeExample: {
          language: 'javascript',
          title: 'Уязвимый код — IDOR',
          code: `// УЯЗВИМО: нет проверки принадлежности заказа
app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrder(req.params.id);
  res.json(order); // Любой может посмотреть любой заказ!
});`,
          caption: 'Злоумышленник меняет ID в URL и получает чужие заказы.',
        },
        warning: 'Broken Access Control — №1 в OWASP Top 10 уже с 2021 года. 94% приложений протестированных имели эту уязвимость.',
      },
      {
        id: 'mitigations',
        heading: 'Как защититься',
        content: 'Реализуйте принцип «запрещено по умолчанию» (deny by default). Все endpoint-ы должны проверять: аутентифицирован ли пользователь? Имеет ли он права к этому ресурсу? Логируйте все отказы для мониторинга.',
      },
    ],
    relatedSlugs: ['sql-injection-basics', 'xss-types'],
  },
  {
    slug: 'sql-injection-basics',
    title: 'SQL-инъекции: от основ до защиты',
    subtitle: 'Как работает SQLi, какие бывают типы и как защитить приложение с помощью параметризованных запросов',
    category: 'Инъекции',
    categoryColor: 'text-red-600 bg-red-50',
    readTime: '10 мин',
    date: '2025-02-01',
    author: 'Dupley Maxim',
    coverIcon: 'Database',
    tags: ['SQL', 'инъекции', 'базы данных'],
    sections: [
      {
        id: 'intro',
        heading: 'Что такое SQL-инъекция?',
        content: 'SQL-инъекция — это тип атаки, при котором злоумышленник внедряет произвольный SQL-код в запрос через пользовательский ввод. Это позволяет обходить аутентификацию, извлекать данные или модифицировать базу.',
      },
      {
        id: 'types',
        heading: 'Типы SQL-инъекций',
        content: 'Существует три основных типа: In-band (данные возвращаются в том же канале — через UNION или error-based), Blind (ответ не содержит данных напрямую — Boolean-based или time-based), и Out-of-band (данные передаются через DNS или HTTP запросы).',
      },
      {
        id: 'example',
        heading: 'Пример атаки: обход аутентификации',
        content: 'Классический пример — форма входа с прямой подстановкой в SQL-запрос:',
        codeExample: {
          language: 'javascript',
          title: 'Уязвимая форма входа',
          code: `const query = \`SELECT * FROM users 
  WHERE username='\${username}' 
  AND password='\${password}'\`;
// Ввод: username = ' OR '1'='1' --
// Результат: SELECT * FROM users WHERE username='' OR '1'='1' --`,
          caption: 'Комментарий -- игнорирует остаток запроса, условие 1=1 всегда истинно.',
        },
        warning: 'В 2008 году SQL-инъекция в Heartland Payment Systems привела к краже данных 130 миллионов кредитных карт.',
      },
      {
        id: 'defense',
        heading: 'Защита: параметризованные запросы',
        content: 'Параметризованные запросы — это самый надёжный способ защиты. Параметры передаются отдельно от SQL-кода, что делает инъекцию невозможной.',
        codeExample: {
          language: 'javascript',
          title: 'Безопасный код — Prisma ORM',
          code: `// Prisma — автоматическая параметризация
const user = await prisma.user.findUnique({
  where: { username: req.body.username }
});

// Или через параметризованный запрос
const result = await db.query(
  'SELECT * FROM users WHERE username = ? AND password_hash = ?',
  [username, passwordHash]
);`,
          caption: 'Параметры передаются отдельно — SQL-код не может быть внедрён.',
        },
        tip: 'ORM (Prisma, Sequelize) автоматически используют параметризованные запросы. Но будьте осторожны с raw queries — они могут быть уязвимы.',
      },
    ],
    relatedSlugs: ['owasp-top-10-2024', 'xss-types'],
  },
  {
    slug: 'xss-types',
    title: '7 типов XSS-атак: от Reflected до Template Injection',
    subtitle: 'Подробный разбор каждого типа XSS с примерами и методами защиты',
    category: 'Веб-безопасность',
    categoryColor: 'text-amber-600 bg-amber-50',
    readTime: '15 мин',
    date: '2025-02-20',
    author: 'Dupley Maxim',
    coverIcon: 'FileText',
    tags: ['XSS', 'JavaScript', 'DOM'],
    sections: [
      {
        id: 'intro',
        heading: 'Что такое XSS?',
        content: 'Cross-Site Scripting (XSS) — это атака, при которой злоумышленник внедряет вредоносный JavaScript в страницы, просматриваемые другими пользователями. XSS позволяет красть сессии, выполнять действия от имени пользователя, перенаправлять на фишинговые сайты.',
      },
      {
        id: 'reflected',
        heading: 'Reflected XSS (Отражённый)',
        content: 'Скрипт внедряется через URL и «отражается» в ответе сервера. Часто используется в фишинговых ссылках.',
        codeExample: {
          language: 'javascript',
          title: 'Уязвимый код',
          code: `app.get('/search', (req, res) => {
  const query = req.query.q;
  // Прямой вывод пользовательского ввода в HTML!
  res.send(\`<p>Результаты для: \${query}</p>\`);
});
// Атака: /search?q=<script>stealCookie()</script>`,
        },
      },
      {
        id: 'stored',
        heading: 'Stored XSS (Хранимый)',
        content: 'Скрипт сохраняется на сервере (в базе данных) и выполняется каждый раз, когда пользователь просматривает заражённый контент. Самый опасный тип.',
        warning: 'Stored XSS в комментариях, профилях или сообщениях затрагивает всех пользователей, просматривающих заражённую страницу.',
      },
      {
        id: 'dom',
        heading: 'DOM-based XSS',
        content: 'Уязвимость находится в клиентском JavaScript, который обрабатывает данные из ненадёжных источников (location.hash, document.referrer) и записывает их в DOM через innerHTML, document.write().',
        codeExample: {
          language: 'javascript',
          title: 'DOM XSS',
          code: `// Уязвимый клиентский код
const name = new URLSearchParams(location.search).get('name');
document.getElementById('greeting').innerHTML = \`Привет, \${name}!\`;
// Атака: ?name=<img src=x onerror=alert(1)>`,
          caption: 'innerHTML выполняет JavaScript в атрибутах событий.',
        },
        tip: 'Используйте textContent вместо innerHTML для вставки пользовательских данных. Это автоматически экранирует HTML.',
      },
      {
        id: 'defense',
        heading: 'Защита от XSS',
        content: 'Три уровня защиты: 1) Экранирование вывода (escape/encode HTML-entities), 2) Content Security Policy (CSP) заголовки для блокировки inline-скриптов, 3) Валидация входных данных (sanitize input).',
      },
    ],
    relatedSlugs: ['csrf-attack-defense', 'owasp-top-10-2024'],
  },
  {
    slug: 'csrf-attack-defense',
    title: 'CSRF-атаки: невидимая угроза',
    subtitle: 'Как злоумышленник может выполнить действия от вашего имени и как защититься',
    category: 'Аутентификация',
    categoryColor: 'text-violet-600 bg-violet-50',
    readTime: '8 мин',
    date: '2025-03-10',
    author: 'Dupley Maxim',
    coverIcon: 'Link',
    tags: ['CSRF', 'токены', 'аутентификация'],
    sections: [
      {
        id: 'intro',
        heading: 'Что такое CSRF?',
        content: 'Cross-Site Request Forgery (CSRF) — это атака, при которой злоумышленник заставляет браузер авторизованного пользователя выполнить нежелательный запрос к веб-приложению. Браузер автоматически отправляет cookies, поэтому запрос выглядит легитимным.',
      },
      {
        id: 'attack',
        heading: 'Как работает атака',
        content: 'Злоумышленник размещает на своём сайте форму или изображение, которое отправляет POST-запрос к вашему банку. Если вы авторизованы в банке, запрос выполнится от вашего имени.',
        codeExample: {
          language: 'html',
          title: 'CSRF-атака через скрытую форму',
          code: `<!-- Злоумышленник размещает это на своём сайте -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker_account">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit();</script>`,
          caption: 'Форма автоматически отправляется при загрузке страницы.',
        },
        warning: 'CSRF работает только с «простыми» запросами (GET, POST с определёнными Content-Type). Запросы с application/json защищены CORS preflight.',
      },
      {
        id: 'defense',
        heading: 'Защита: CSRF-токены',
        content: 'Самый надёжный метод — анти-CSRF токены. Сервер генерирует уникальный токен для каждой сессии и проверяет его при каждом состоянии-изменяющем запросе. Токен нельзя узнать с другого домена из-за Same-Origin Policy.',
        tip: 'Современные подходы: SameSite cookies (Lax/Strict) и двойная отправка cookie (Double Submit Cookie) — как в этом проекте.',
      },
    ],
    relatedSlugs: ['password-security', 'sql-injection-basics'],
  },
  {
    slug: 'password-security',
    title: 'Безопасность паролей: хеширование, соль и брутфорс',
    subtitle: 'Почему MD5 и SHA-256 не подходят для паролей и как правильно хранить учётные данные',
    category: 'Криптография',
    categoryColor: 'text-blue-600 bg-blue-50',
    readTime: '11 мин',
    date: '2025-03-25',
    author: 'Dupley Maxim',
    coverIcon: 'Lock',
    tags: ['пароли', 'хеширование', 'bcrypt'],
    sections: [
      {
        id: 'intro',
        heading: 'Почему нельзя хранить пароли в открытом виде?',
        content: 'При утечке базы данных все пароли пользователей становятся доступны злоумышленникам. Поскольку многие пользователи повторяют пароли на разных сайтах, утечка одного сервиса может привести к компрометации аккаунтов в других сервисах.',
      },
      {
        id: 'hashing',
        heading: 'Хеширование — однонаправленная функция',
        content: 'Хеш-функция преобразует пароль в фиксированную строку, которую невозможно обратить. Но обычные хеши (MD5, SHA-256) слишком быстры — их можно перебирать миллиардами в секунду.',
        codeExample: {
          language: 'javascript',
          title: 'НЕЛЬЗЯ: MD5 для паролей',
          code: `const crypto = require('crypto');
// MD5 — 160 ГБ/сек на современном GPU
const hash = crypto.createHash('md5')
  .update('password123').digest('hex');
// 5f4dcc3b5aa765d61d8327deb882cf99
// Подбирается за секунды через rainbow tables`,
          caption: 'MD5 можно вычислить 160+ миллиардов раз в секунду на GPU.',
        },
      },
      {
        id: 'bcrypt',
        heading: 'bcrypt — специально для паролей',
        content: 'bcrypt — это адаптивный хеш-алгоритм, разработанный специально для паролей. Он использует соль (случайные данные) и «cost factor» (количество итераций), что делает перебор медленным.',
        codeExample: {
          language: 'javascript',
          title: 'Правильное хеширование с bcrypt',
          code: `const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Хеширование (занимает ~250мс)
const hash = await bcrypt.hash(password, SALT_ROUNDS);
// $2b$12$LJ3m4...30 символов соли встроены

// Верификация (тоже ~250мс)
const isValid = await bcrypt.compare(password, hash);`,
          caption: 'Cost factor 12 = 2^12 = 4096 итераций. Подбор занимает годы.',
        },
        warning: 'Никогда не используйте MD5, SHA-1 или SHA-256 для паролей. Используйте bcrypt (cost >= 12) или Argon2id.',
        tip: 'Рекомендации OWASP: bcrypt с cost factor >= 10, Argon2id с memory=64MB, iterations=3.',
      },
    ],
    relatedSlugs: ['csrf-attack-defense', 'owasp-top-10-2024'],
  },
  {
    slug: 'security-headers-guide',
    title: 'HTTP-заголовки безопасности: практическое руководство',
    subtitle: 'CSP, HSTS, X-Frame-Options и другие заголовки, которые защищают ваше приложение',
    category: 'Инфраструктура',
    categoryColor: 'text-slate-600 bg-slate-100',
    readTime: '14 мин',
    date: '2025-04-05',
    author: 'Dupley Maxim',
    coverIcon: 'ShieldAlert',
    tags: ['заголовки', 'CSP', 'HSTS', 'helmet'],
    sections: [
      {
        id: 'intro',
        heading: 'Зачем нужны security headers?',
        content: 'HTTP-заголовки безопасности — это первый рубеж защиты. Они сообщают браузеру, как обрабатывать контент, какие ресурсы загружать и какие действия запрещать. Правильная конфигурация может предотвратить XSS, clickjacking, MIME-sniffing и другие атаки.',
      },
      {
        id: 'csp',
        heading: 'Content-Security-Policy (CSP)',
        content: 'CSP — самый мощный заголовок безопасности. Он определяет, какие источники контента разрешены для загрузки. Это эффективно останавливает XSS, даже если уязвимость присутствует.',
        codeExample: {
          language: 'http',
          title: 'Строгая CSP',
          code: `Content-Security-Policy: \
default-src 'self'; \
script-src 'self'; \
style-src 'self' 'unsafe-inline'; \
img-src 'self' data:; \
font-src 'self'; \
connect-src 'self'; \
frame-ancestors 'none'`,
          caption: 'Разрешает загрузку скриптов только с того же домена. Блокирует inline-скрипты.',
        },
        tip: 'Начните с Content-Security-Policy-Report-Only, чтобы увидеть, что будет заблокировано, не ломая приложение.',
      },
      {
        id: 'helmet',
        heading: 'Helmet.js — простая настройка',
        content: 'Helmet — это Express-middleware, который автоматически устанавливает все важные заголовки безопасности.',
        codeExample: {
          language: 'javascript',
          title: 'Helmet.js',
          code: `const helmet = require('helmet');
app.use(helmet());

// Индивидуальная настройка
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
  }
}));`,
        },
        warning: 'Не используйте unsafe-inline в production CSP. Это полностью обходит защиту от XSS.',
      },
    ],
    relatedSlugs: ['owasp-top-10-2024', 'xss-types'],
  },
];

export const blogCategories = [
  { id: 'all', label: 'Все', icon: 'Grid' },
  { id: 'Веб-безопасность', label: 'Веб-безопасность', icon: 'Shield' },
  { id: 'Инъекции', label: 'Инъекции', icon: 'Database' },
  { id: 'Аутентификация', label: 'Аутентификация', icon: 'Lock' },
  { id: 'Криптография', label: 'Криптография', icon: 'KeyRound' },
  { id: 'Инфраструктура', label: 'Инфраструктура', icon: 'Server' },
];

// Backward compatibility alias for BlogPage.tsx
export const articleCategories = blogCategories;

export function searchArticles(query: string, category?: string) {
  const q = query.toLowerCase();
  return blogArticles.filter(article => {
    const matchCategory = !category || category === 'all' || article.category === category;
    const matchSearch = !query ||
      article.title.toLowerCase().includes(q) ||
      article.subtitle.toLowerCase().includes(q) ||
      article.tags.some(tag => tag.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });
}
