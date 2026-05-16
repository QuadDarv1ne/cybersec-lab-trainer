// OWASP Top 10 (2021) — Educational Content in Russian

export interface OWASPTopic {
  id: string;
  code: string;
  title: string;
  severity: string;
  severityColor: string;
  description: string;
  realExample: string;
  vulnerableCode: string;
  secureCode: string;
  mitigations: string[];
}

export interface OWASPChallenge {
  id: string;
  topicId: string;
  title: string;
  scenario: string;
  code: string;
  question: string;
  options: Array<{ text: string; correct: boolean }>;
  explanation: string;
}

export const owaspChallenges: OWASPChallenge[] = [
  // A01: Broken Access Control
  {
    id: 'owasp-c1',
    topicId: 'a01',
    title: 'Найдите уязвимость контроля доступа',
    scenario: 'Вы проводите аудит API интернет-магазина. Найдите проблему в коде:',
    code: `app.get('/api/orders/:id', (req, res) => {
  const order = db.findOrder(req.params.id);
  res.json(order);
});`,
    question: 'Какая уязвимость присутствует в этом коде?',
    options: [
      { text: 'SQL-инъекция в req.params.id', correct: false },
      { text: 'Отсутствует проверка, что заказ принадлежит текущему пользователю (IDOR)', correct: true },
      { text: 'XSS в ответе сервера', correct: false },
      { text: 'Нет HTTPS-соединения', correct: false },
    ],
    explanation:
      'Код возвращает любой заказ по ID без проверки прав доступа. Злоумышленник может перебирать ID и просматривать чужие заказы. Это классический IDOR (Insecure Direct Object Reference). Исправление: проверять order.userId === req.user.id.',
  },
  {
    id: 'owasp-c2',
    topicId: 'a01',
    title: 'Исправьте контроль доступа',
    scenario: 'Какой код корректно исправляет уязвимость?',
    code: `// Исходный код (уязвимый):
app.get('/api/users/:id/profile', (req, res) => {
  const user = db.getUser(req.params.id);
  res.json({ name: user.name, email: user.email });
});`,
    question: 'Выберите безопасную реализацию:',
    options: [
      { text: 'Добавить проверку if (req.user.id !== req.params.id) return 403', correct: true },
      { text: 'Заменить GET на POST', correct: false },
      { text: 'Добавить rate limiting на эндпоинт', correct: false },
      { text: 'Валидировать формат ID через regex', correct: false },
    ],
    explanation:
      'Контроль доступа должен проверять, что аутентифицированный пользователь имеет право просматривать данные запрашиваемого ресурса. Проверка req.user.id !== req.params.id гарантирует, что пользователь видит только свой профиль (или администратор — все).',
  },
  // A02: Cryptographic Failures
  {
    id: 'owasp-c3',
    topicId: 'a02',
    title: 'Определите криптографическую уязвимость',
    scenario: 'Приложение хранит данные пользователей. Найдите проблемы:',
    code: `const user = {
  email: 'user@example.com',
  password: 'p@ssw0rd123',      // ?
  ssn: '123-45-6789',           // ?
  api_key: 'sk-abc123...',      // ?
};`,
    question: 'Какие данные хранятся небезопасно?',
    options: [
      { text: 'Только пароль — его нужно хешировать', correct: false },
      { text: 'Все три: пароль (нужен bcrypt), SSN и API ключ (нужно шифрование AES-256)', correct: true },
      { text: 'Только SSN — это персональные данные', correct: false },
      { text: 'Ничего, данные хранятся в базе с паролем', correct: false },
    ],
    explanation:
      'Пароли нельзя хранить в открытом виде — нужен bcrypt/Argon2. SSN (номер социального страхования) и API ключи — чувствительные данные, которые нужно шифровать при хранении (encryption at rest) через AES-256.',
  },
  // A03: Injection
  {
    id: 'owasp-c4',
    topicId: 'a03',
    title: 'Найдите инъекцию в коде',
    scenario: 'Приложение выполняет поиск пользователей:',
    code: `app.get('/api/search', (req, res) => {
  const { query } = req.query;
  const filter = { name: { $regex: query } };
  const users = db.collection('users').find(filter);
  res.json(users);
});`,
    question: 'Какой тип инъекции возможен?',
    options: [
      { text: 'SQL-инъекция через req.query', correct: false },
      { text: 'NoSQL-инъекция — злоумышленник может передать { $gt: "" } вместо строки', correct: true },
      { text: 'XPath-инъекция', correct: false },
      { text: 'LDAP-инъекция', correct: false },
    ],
    explanation:
      'MongoDB/NoSQL инъекция возможна, когда приложение принимает объект вместо строки. Злоумышленник может передать ?query[$gt]=, что превратит фильтр в { $regex: { $gt: "" } }, вернув всех пользователей. Решение: валидировать тип входных данных (typeof query === "string").',
  },
  // A04: Insecure Design
  {
    id: 'owasp-c5',
    topicId: 'a04',
    title: 'Проблема дизайна: Coupon Brute Force',
    scenario: 'Система купонов на скидку:',
    code: `app.post('/api/apply-coupon', (req, res) => {
  const { code } = req.body;
  const coupon = db.findCoupon(code);
  if (coupon && coupon.valid) {
    applyDiscount(req.user, coupon.discount);
    res.json({ success: true });
  } else {
    res.json({ error: 'Неверный код купона' });
  }
});
// Купоны: SAVE10, SAVE20, SAVE30...`,
    question: 'Какая проблема дизайна присутствует?',
    options: [
      { text: 'Нет ограничения попыток — можно перебрать все купоны', correct: true },
      { text: 'Купоны слишком предсказуемы', correct: false },
      { text: 'Нет HTTPS', correct: false },
      { text: 'Нет валидации на клиенте', correct: false },
    ],
    explanation:
      'Небезопасный дизайн: отсутствие rate limiting позволяет автоматически перебирать все возможные коды купонов. Предсказуемый формат (SAVE10, SAVE20...) усугубляет проблему. Исправление: rate limiting + случайные UUID-коды + мониторинг подозрительных попыток.',
  },
  // A05: Security Misconfiguration
  {
    id: 'owasp-c6',
    topicId: 'a05',
    title: 'Найдите ошибки конфигурации',
    scenario: 'Express-приложение в продакшене:',
    code: `const app = express();
app.set('trust proxy', true);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    db: process.env.DB_PASSWORD,
    version: '2.4.1'
  });
});`,
    question: 'Какие проблемы безопасности есть?',
    options: [
      { text: 'Нет helmet.js и раскрывается DB_PASSWORD в health эндпоинте', correct: true },
      { text: 'trust proxy включён — это всегда уязвимость', correct: false },
      { text: 'express.json() небезопасен', correct: false },
      { text: 'Нет проблем, всё корректно настроено', correct: false },
    ],
    explanation:
      'Раскрытие пароля БД в ответе — критическая ошибка. Дополнительно: нет helmet.js для заголовков безопасности, версия приложения раскрыта. В продакшене /health эндпоинт должен возвращать минимум информации и быть защищён.',
  },
  // A06: Vulnerable Components
  {
    id: 'owasp-c7',
    topicId: 'a06',
    title: 'Анализ зависимостей',
    scenario: 'Файл package.json проекта:',
    code: `"dependencies": {
  "lodash": "4.17.11",
  "express": "4.17.1",
  "axios": "0.21.1",
  "jsonwebtoken": "8.5.1"
}`,
    question: 'Какой подход к управлению зависимостями правильный?',
    options: [
      { text: 'Обновить все пакеты до последних версий и настроить Dependabot', correct: true },
      { text: 'Использовать только мажорные версии (^)', correct: false },
      { text: 'Удалить все зависимости и написать свой код', correct: false },
      { text: 'Оставить как есть, если всё работает', correct: false },
    ],
    explanation:
      'Все перечисленные версии имеют известные CVE: lodash (CVE-2021-23337), axios (CVE-2021-3749), jsonwebtoken (CVE-2022-23529). Необходимо регулярно обновлять зависимости, использовать lock-файлы и настроить автоматический мониторинг (Dependabot, Snyk).',
  },
  // A07: Auth Failures
  {
    id: 'owasp-c8',
    topicId: 'a07',
    title: 'Уязвимость аутентификации',
    scenario: 'Функция восстановления пароля:',
    code: `app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.findUser(email);
  if (user) {
    const otp = Math.floor(Math.random() * 9999);
    sendEmail(email, \`Код: \${otp}\`);
    res.json({ message: 'Код отправлен' });
  } else {
    res.json({ message: 'Код отправлен' }); // Скрываем существование
  }
});`,
    question: 'Что здесь небезопасно?',
    options: [
      { text: 'Math.random() предсказуем — OTP можно угадать', correct: true },
      { text: 'Нет rate limiting, но это не критично', correct: false },
      { text: 'Сообщение "Код отправлен" раскрывает информацию', correct: false },
      { text: 'Всё безопасно', correct: false },
    ],
    explanation:
      'Math.random() в JavaScript не криптографически безопасен — его вывод можно предсказать. Злоумышленник может сгенерировать последовательность и угадать OTP. Используйте crypto.randomInt(1000, 9999). Также нужен rate limiting (макс. 3 попытки в 15 минут).',
  },
  // A08: Data Integrity
  {
    id: 'owasp-c9',
    topicId: 'a08',
    title: 'Десериализация данных',
    scenario: 'API принимает JSON и создаёт объект:',
    code: `app.post('/api/process', (req, res) => {
  const data = req.body;
  // Прямое использование данных без валидации
  const result = eval(data.calculation);
  res.json({ result });
});`,
    question: 'Какая уязвимость критична?',
    options: [
      { text: 'XSS через JSON', correct: false },
      { text: 'RCE через eval() — злоумышленник выполнит любой код', correct: true },
      { text: 'SQL-инъекция через data.calculation', correct: false },
      { text: 'CSRF через POST', correct: false },
    ],
    explanation:
      'eval() выполняет произвольный JavaScript. Злоумышленник может передать calculation: "require(\'child_process\').exec(\'rm -rf /\')" и получить RCE. Никогда не используйте eval() с пользовательским вводом. Используйте mathjs.evaluate() с sandbox или парсер выражений.',
  },
  // A09: Logging Failures
  {
    id: 'owasp-c10',
    topicId: 'a09',
    title: 'Проблемы журналирования',
    scenario: 'Логи приложения содержат:',
    code: `// Логи сервера:
[2024-01-15] Login failed for user admin
[2024-01-15] Login failed for user admin
[2024-01-15] Login failed for user admin
... (500 раз)
// Нет IP, нет User-Agent, нет timestamp
console.log('Error:', error);`,
    question: 'Что нужно улучшить в логировании?',
    options: [
      { text: 'Добавить IP, User-Agent, timestamp и алерты на множественные failures', correct: true },
      { text: 'Удалить логи для экономии места', correct: false },
      { text: 'Логировать пароль для отладки', correct: false },
      { text: 'Отображать логи на главной странице', correct: false },
    ],
    explanation:
      'Без IP и User-Agent невозможно определить источник атаки. Без алертов на множественные неудачные попытки невозможно обнаружить brute force в реальном времени. Также нельзя логировать пароли, токены, номера карт. Нужна централизованная система (ELK, Splunk).',
  },
  // A10: SSRF
  {
    id: 'owasp-c11',
    topicId: 'a10',
    title: 'SSRF-уязвимость',
    scenario: 'Сервис загрузки изображений по URL:',
    code: `app.post('/api/fetch-image', async (req, res) => {
  const { url } = req.body;
  const response = await fetch(url);
  const buffer = await response.buffer();
  res.set('Content-Type', 'image/png');
  res.send(buffer);
});`,
    question: 'Какая атака возможна?',
    options: [
      { text: 'SSRF — запрос к http://169.254.169.254 для получения AWS метаданных', correct: true },
      { text: 'XSS через URL', correct: false },
      { text: 'SQL-инъекция через url', correct: false },
      { text: 'CSRF через POST', correct: false },
    ],
    explanation:
      'SSRF позволяет злоумышленнику заставить сервер запросить внутренние ресурсы. AWS EC2 metadata (169.254.169.254) содержит IAM credentials, которые дадут доступ к S3, RDS и другим сервисам. Исправление: валидировать URL (только HTTPS), белый список доменов, блокировка приватных IP.',
  },
];

export const owaspTopics: OWASPTopic[] = [
  {
    id: 'a01',
    code: 'A01:2021',
    title: 'Сбой контроля доступа (Broken Access Control)',
    severity: 'Критический',
    severityColor: 'bg-red-500',
    description:
      'Сбои контроля доступа являются наиболее критической уязвимостью в веб-приложениях. Они возникают, когда пользователи могут получать доступ к данным или функциям, которые не должны быть им доступны. Это включает обход аутентификации, повышение привилегий, просмотр чужих данных и несанкционированное выполнение операций.',
    realExample:
      'В 2019 году исследователи обнаружили, что в популярном банковском приложении можно было изменить номер аккаунта в URL-адресе запроса и получить доступ к счетам других клиентов. Это позволило злоумышленникам просматривать балансы и совершать переводы от имени других пользователей, что привело к многомиллионным убыткам.',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — отсутствие проверки прав доступа
app.get('/api/users/:id', (req, res) => {
  // Любой пользователь может запросить данные любого другого пользователя
  const user = db.findUser(req.params.id);
  res.json(user);
});

// УЯЗВИМЫЙ КОД — манипуляция ID в запросе
app.get('/api/orders/:orderId', (req, res) => {
  const order = db.findOrder(req.params.orderId);
  // Нет проверки, что заказ принадлежит текущему пользователю
  res.json(order);
});`,
    secureCode: `// БЕЗОПАСНЫЙ КОД — проверка прав доступа
app.get('/api/users/:id', (req, res) => {
  // Проверяем, что пользователь запрашивает только свои данные
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const user = db.findUser(req.params.id);
  res.json(user);
});

// БЕЗОПАСНЫЙ КОД — использование токена авторизации
app.get('/api/orders/:orderId', (req, res) => {
  const order = db.findOrder(req.params.orderId);
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Заказ не найден' });
  }
  res.json(order);
});`,
    mitigations: [
      'Реализуйте контроль доступа на серверной стороне (никогда не полагайтесь на клиент)',
      'Используйте принцип наименьших привилегий для всех ролей',
      'Запретите доступ к файлам по умолчанию (deny by default)',
      'Внедрите логирование и мониторинг несанкционированных попыток доступа',
      'Используйте идентификаторы сессии вместо прямых ID объектов',
    ],
  },
  {
    id: 'a02',
    code: 'A02:2021',
    title: 'Криптографические сбои (Cryptographic Failures)',
    severity: 'Критический',
    severityColor: 'bg-red-500',
    description:
      'Криптографические сбои возникают при неправильном использовании криптографии — слабое шифрование, отсутствие шифрования важных данных, использование устаревших алгоритмов или неправильное управление ключами. Ранее эта категория называлась «Раскрытие конфиденциальных данных» и затрагивает не только криптографию, но и общие проблемы с защитой данных.',
    realExample:
      'Один из крупнейших утечек данных произошёл в 2017 году, когда компания Equifax потеряла данные 147 миллионов человек. Причиной стало использование устаревшей версии Apache Struts с известной уязвимостью. Данные (номера карт, SSN) хранились в открытом виде без должной криптографической защиты, что усугубило последствия.',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — хранение паролей в открытом виде
const user = {
  email: 'user@example.com',
  password: 'mypassword123',  // Хранится в plain text!
  creditCard: '4532-1234-5678-9012' // Нет шифрования
};

// УЯЗВИМЫЙ КОД — использование слабого хеширования
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
  // MD5 — устаревший и ненадёжный алгоритм
}`,
    secureCode: `// БЕЗОПАСНЫЙ КОД — использование bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// БЕЗОПАСНОЕ хранение данных
const user = {
  email: 'user@example.com',
  passwordHash: '$2b$12$LJ3m4...hash',
  creditCard: encryptData(cardNumber, ENCRYPTION_KEY)
};`,
    mitigations: [
      'Используйте bcrypt или Argon2 для хеширования паролей',
      'Применяйте AES-256 для шифрования данных в покое',
      'Используйте TLS 1.3 для передачи данных',
      'Не храните пароли в открытом виде — только хеши',
      'Классифицируйте данные по уровню конфиденциальности',
    ],
  },
  {
    id: 'a03',
    code: 'A03:2021',
    title: 'Инъекции (Injection)',
    severity: 'Критический',
    severityColor: 'bg-red-500',
    description:
      'Инъекции — это класс уязвимостей, при которых недоверенные данные отправляются интерпретатору в составе команды или запроса. Наиболее распространённые виды: SQL-инъекции, NoSQL-инъекции, OS-инъекции, LDAP-инъекции. Злоумышленник может выполнить нежелательные команды или получить доступ к данным без соответствующих прав.',
    realExample:
      'В 2008 году атака SQL-инъекцией на корпоративную сеть Heartland Payment Systems позволила злоумышленникам украсть данные 130 миллионов кредитных карт. Атакующие использовали SQL-инъекцию в веб-форме для выполнения произвольных SQL-запросов к базе данных компании. Этот случай стал одним из самых масштабных краж финансовых данных.',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — прямая подстановка в SQL
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = \`SELECT * FROM users
    WHERE username = '\${username}'
    AND password = '\${password}'\`;
  // Ввод: ' OR '1'='1' --
  // Итог: SELECT * FROM users WHERE username='' OR '1'='1' --
  db.query(query, (err, results) => {
    if (results.length > 0) res.json({ success: true });
  });
});`,
    secureCode: `// БЕЗОПАСНЫЙ КОД — параметризованные запросы
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password_hash = ?';
  // Параметры передаются отдельно — невозможна инъекция
  db.query(query, [username, passwordHash], (err, results) => {
    if (results.length > 0) res.json({ success: true });
  });
});

// Или с ORM (Prisma, Sequelize)
const user = await prisma.user.findUnique({
  where: { username }
});`,
    mitigations: [
      'Используйте параметризованные запросы или ORM',
      'Применяйте валидацию и санитизацию входных данных',
      'Используйте принцип наименьших привилегий для БД',
      'Внедрите WAF (Web Application Firewall)',
      'Тестируйте с помощью автоматизированных инструментов (SQLMap)',
    ],
  },
  {
    id: 'a04',
    code: 'A04:2021',
    title: 'Небезопасный дизайн (Insecure Design)',
    severity: 'Высокий',
    severityColor: 'bg-orange-500',
    description:
      'Небезопасный дизайн — это широкая категория уязвимостей, связанная с недостатками в архитектуре и проектировании приложения. В отличие от Implementation bugs, эти проблемы заложены на этапе проектирования и не могут быть решены простой модификацией кода. Примеры: отсутствие ограничений на частоту запросов, слабые бизнес-правила валидации, отсутствие управления состоянием.',
    realExample:
      'Многие системы онлайн-бронирования позволяют злоумышленникам бронировать товары без оплаты, блокируя их для реальных покупателей. Это происходит потому, что при проектировании не было предусмотрено ограничение по времени незавершённых бронирований и не была реализована система предварительной авторизации средств.',
    vulnerableCode: `// НЕБЕЗОПАСНЫЙ ДИЗАЙН — нет ограничений
app.post('/api/forgot-password', (req, res) => {
  // Нет лимита на количество запросов — можно перебрать коды
  // Нет верификации email перед сменой пароля
  sendResetCode(req.body.email);
  res.json({ message: 'Код отправлен' });
});

// Нет ограничения на количество попыток ввода OTP
app.post('/api/verify-otp', (req, res) => {
  if (req.body.code === storedCode) {
    resetPassword(req.body.email);
  }
});`,
    secureCode: `// БЕЗОПАСНЫЙ ДИЗАЙН — rate limiting + бизнес-логика
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: 'Слишком много попыток. Попробуйте позже.'
});

app.post('/api/verify-otp', otpLimiter, (req, res) => {
  // Проверяем, что код не просрочен (10 минут)
  if (Date.now() - otpCreatedAt > 10 * 60 * 1000) {
    return res.status(400).json({ error: 'Код просрочен' });
  }
  // Верифицируем код
  if (req.body.code === storedCode) {
    resetPassword(req.body.email);
  }
});`,
    mitigations: [
      'Проводите анализ угроз на этапе проектирования (Threat Modeling)',
      'Внедряйте ограничение частоты запросов (Rate Limiting)',
      'Проектируйте безопасные бизнес-процессы с учётом злоупотреблений',
      'Используйте storyboarding и abuse cases',
      'Применяйте защищённые паттерны проектирования',
    ],
  },
  {
    id: 'a05',
    code: 'A05:2021',
    title: 'Ошибки безопасности (Security Misconfiguration)',
    severity: 'Высокий',
    severityColor: 'bg-orange-500',
    description:
      'Ошибки безопасности — это наиболее распространённая категория уязвимостей, вызванная некорректной конфигурацией приложений, серверов, фреймворков и библиотек. Это может включать включённые отладочные режимы в продакшене, открытые облачные хранилища, неиспользуемые функции по умолчанию, незащищённые заголовки HTTP и многое другое.',
    realExample:
      'В 2017 году исследователи обнаружили, что Defence.gc.ca — официальный сайт Министерства национальной обороны Канады — оставил открытым сервер Elasticsearch без пароля. Это позволило любому пользователю получить доступ к базам данных с конфиденциальной информацией, включая внутренние документы и учётные записи.',
    vulnerableCode: `// НЕБЕЗОПАСНАЯ КОНФИГУРАЦИЯ
const app = express();

// Заголовки безопасности отсутствуют
app.use(express.static('public'));
// Нет CORS
// Нет Helmet
// Отладка включена в продакшене
app.set('env', 'development');

// Развернутые на продакшене отладочные эндпоинты
app.get('/debug/routes', (req, res) => {
  res.json(app._router.stack); // Показывает все маршруты
});

app.get('/debug/env', (req, res) => {
  res.json(process.env); // Показывает переменные окружения!
});`,
    secureCode: `// БЕЗОПАСНАЯ КОНФИГУРАЦИЯ
const app = express();
const helmet = require('helmet');

// Защитные заголовки HTTP
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: { defaultSrc: ["'self'"] }
}));

// Настройка CORS
const cors = require('cors');
app.use(cors({ origin: 'https://myapp.com' }));

// Отключение лишних заголовков
app.disable('x-powered-by');

// В продакшене — никакой отладки
if (process.env.NODE_ENV === 'production') {
  app.set('env', 'production');
  // Отладочные эндпоинты ТОЛЬКО в разработке
}`,
    mitigations: [
      'Используйте helmet.js для настройки заголовков безопасности',
      'Отключите отладку и ненужные эндпоинты в продакшене',
      'Применяйте минимальную конфигурацию (отключайте всё лишнее)',
      'Автоматизируйте проверку конфигурации через CI/CD',
      'Регулярно проводите аудит конфигурации серверов',
    ],
  },
  {
    id: 'a06',
    code: 'A06:2021',
    title: 'Уязвимые и устаревшие компоненты (Vulnerable Components)',
    severity: 'Высокий',
    severityColor: 'bg-orange-500',
    description:
      'Использование библиотек, фреймворков и других программных компонентов с известными уязвимостями — одна из самых распространённых проблем безопасности. Злоумышленники могут автоматически сканировать приложения на наличие известных уязвимых версий и эксплуатировать их с минимальными усилиями. Каждое приложение использует множество компонентов, и любой из них может быть уязвим.',
    realExample:
      'Уязвимость Log4Shell (CVE-2021-44228) в библиотеке Apache Log4j затронула миллионы приложений по всему миру. Уязвимость позволяла злоумышленникам выполнять произвольный код на сервере, отправляя специально сформированную строку в лог. Многие организации даже не знали, что используют Log4j, так как он был транзитивной зависимостью в их приложениях.',
    vulnerableCode: `// УЯЗВИМЫЕ ЗАВИСИМОСТИ в package.json
{
  "dependencies": {
    "lodash": "4.17.4",        // Уязвимость CVE-2021-23337
    "express": "4.16.0",       // Обнаружены уязвимости
    "jquery": "2.2.4",         // XSS уязвимости
    "minimist": "0.0.8"       // Prototype pollution
  }
}

// Без блокировки версий:
// "lodash": "^4.17.0" — может установить уязвимую версию
`,
    secureCode: `// БЕЗОПАСНОЕ управление зависимостями

// 1. Используйте точные или ranged версии с aware-интервалом
{
  "dependencies": {
    "lodash": "4.17.21",      // Последняя безопасная версия
    "express": "4.19.2",      // Актуальная версия
  }
}

// 2. Регулярный аудит через npm/bun
// bun audit
// npm audit --production

// 3. Используйте Snyk или Dependabot для мониторинга
// 4. Блокировка версий через lock-файлы (bun.lock)
// 5. Проверяйте лицензии зависимостей
`,
    mitigations: [
      'Регулярно обновляйте зависимости (минимум раз в месяц)',
      'Используйте `bun audit` или `npm audit` для проверки',
      'Настройте Dependabot или Snyk для автоматического мониторинга',
      'Удаляйте неиспользуемые зависимости',
      'Подпишитесь на Security Advisories используемых пакетов',
    ],
  },
  {
    id: 'a07',
    code: 'A07:2021',
    title: 'Ошибки идентификации и аутентификации',
    severity: 'Высокий',
    severityColor: 'bg-orange-500',
    description:
      'Ошибки идентификации и аутентификации возникают, когда функции подтверждения личности пользователя реализованы некорректно. Это позволяет злоумышленникам выдавать себя за других пользователей, обходить аутентификацию или использовать слабые механизмы проверки. Проблемы включают: permitByDefault, слабые пароли, отсутствие MFA, уязвимые механизмы восстановления пароля.',
    realExample:
      'В 2020 году исследователи обнаружили, что система входа крупного провайдера облачных услуг позволяла перебирать пароли без ограничений. Злоумышленники могли сделать до 100 попыток в минуту, что при наличии слабых паролей пользователей приводило к успешной компрометации аккаунтов. Для миллионов аккаунтов использовались пароли из топ-10000 самых популярных.',
    vulnerableCode: `// УЯЗВИМЫЙ МЕХАНИЗМ АУТЕНТИФИКАЦИИ
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.findUser(email);
  // Нет ограничения на количество попыток!
  if (user && user.password === password) { // Plain text сравнение!
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).json({ error: 'Неверные данные' });
  }
});

// Слабая функция восстановления пароля
app.post('/reset-password', (req, res) => {
  // 4-значный PIN — легко перебрать
  if (req.body.pin === storedPin) {
    resetPassword(req.body.email);
  }
});`,
    secureCode: `// БЕЗОПАСНАЯ АУТЕНТИФИКАЦИЯ
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа'
});

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUser(email);

  // Используем bcrypt для сравнения (с постоянным временем)
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    // Генерируем токен с TTL
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } else {
    // Одинаковое сообщение для обоих случаев
    res.status(401).json({ error: 'Неверные учётные данные' });
  }
});`,
    mitigations: [
      'Реализуйте многофакторную аутентификацию (MFA)',
      'Используйте bcrypt/Argon2 для хранения паролей',
      'Внедрите ограничение попыток входа (Rate Limiting)',
      'Не раскрывайте информацию о существовании аккаунтов',
      'Используйте стандартные библиотеки аутентификации (NextAuth, Passport)',
    ],
  },
  {
    id: 'a08',
    code: 'A08:2021',
    title: 'Ошибки целостности и сериализации данных',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'Ошибки целостности данных связаны с ненадёжной десериализацией данных из ненадёжных источников. Это может привести к выполнению произвольного кода, подмене объектов или манипуляции логикой приложения. В новых архитектурах эта категория также включает CSRF, в котором десериализация может изменить данные на сервере от имени другого пользователя.',
    realExample:
      'В 2015 году уязвимость в библиотеке Apache Commons Collections позволяла злоумышленникам выполнить произвольный код через десериализацию Java-объектов. Эта уязвимость затронула множество приложений, включая WebLogic, WebSphere, JBoss и другие серверы приложений. Впоследствии аналогичные уязвимости были найдены в .NET (Json.NET) и Node.js (node-serialize).',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — прямая десериализация
const deserialize = require('node-serialize');

app.post('/api/data', (req, res) => {
  // Данные от пользователя десериализуются напрямую
  // Злоумышленник может внедрить IIFE: _$$ND_FUNC$$_function(){require('child_process').exec('whoami')}()
  const data = deserialize.unserialize(req.body.data);
  res.json({ result: processData(data) });
});

// УЯЗВИМЫЙ КОД — eval() на пользовательских данных
app.post('/api/calculate', (req, res) => {
  // Никогда не делайте так!
  const result = eval(req.body.expression);
  res.json({ result });
});`,
    secureCode: `// БЕЗОПАСНЫЙ КОД — Schema validation
const { z } = require('zod');

const DataSchema = z.object({
  name: z.string().max(100),
  age: z.number().int().positive().max(150),
  email: z.string().email(),
});

app.post('/api/data', (req, res) => {
  // Валидация через схему — безопасная десериализация
  const result = DataSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error });
  }
  res.json({ result: processData(result.data) });
});

// Для вычислений — используйте безопасные библиотеки
const math = require('mathjs');
const result = math.evaluate(sanitizedExpression);`,
    mitigations: [
      'Никогда не десериализуйте данные от ненадёжных источников напрямую',
      'Используйте JSON.parse() вместо кастомных десериализаторов',
      'Внедряйте валидацию схем (Zod, Joi, Yup)',
      'Используйте integrity checks (цифровые подписи)',
      'Избегайте eval() и аналогичных функций с пользовательским вводом',
    ],
  },
  {
    id: 'a09',
    code: 'A09:2021',
    title: 'Ошибки журналирования и мониторинга',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'Без надлежащего журналирования и мониторинга нарушения безопасности остаются незамеченными длительное время. Большинство успешных атак можно было предотвратить или минимизировать при наличии эффективной системы мониторинга и логирования. К сожалению, журналирование часто является послесловием при разработке и не получает должного внимания.',
    realExample:
      'Атака на Equifax в 2017 году оставалась незамеченной более 76 дней, несмотря на то, что инструменты мониторинга безопасности компании должны были обнаружить её. После инцидента выяснилось, что сертификат для одного из инструментов мониторинга SSL истёк 10 месяцами ранее. Если бы журналирование работало корректно, утечка данных 147 миллионов человек могла бы быть предотвращена.',
    vulnerableCode: `// НЕДОСТАТОЧНОЕ ЖУРНАЛИРОВАНИЕ
app.post('/login', (req, res) => {
  const user = authenticate(req.body);
  if (user) {
    // Нет записи об успешном входе
    res.json({ token: user.token });
  } else {
    // Нет записи о неуспешной попытке
    // Нет IP-адреса, User-Agent, timestamp
    res.status(401).json({ error: 'Ошибка' });
  }
});

// Логи без контекста
console.log('Login failed'); // Кем? Когда? Откуда?
console.error(err);          // Без stack trace
`,
    secureCode: `// БЕЗОПАСНОЕ ЖУРНАЛИРОВАНИЕ
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
  ]
});

app.post('/login', (req, res) => {
  const ip = req.ip;
  const userAgent = req.get('user-agent');
  const user = authenticate(req.body);

  if (user) {
    logger.info('LOGIN_SUCCESS', {
      userId: user.id,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    res.json({ token: user.token });
  } else {
    logger.warn('LOGIN_FAILURE', {
      email: req.body.email,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    res.status(401).json({ error: 'Ошибка' });
  }
});`,
    mitigations: [
      'Логируйте все события аутентификации (успешные и неуспешные)',
      'Записывайте IP-адреса, User-Agent и временные метки',
      'Настройте автоматические алерты на подозрительную активность',
      'Используйте централизованную систему логирования (ELK, Splunk)',
      'Не логируйте конфиденциальные данные (пароли, токены, номера карт)',
    ],
  },
  {
    id: 'a10',
    code: 'A10:2021',
    title: 'Подделка запросов на стороне сервера (SSRF)',
    severity: 'Средний',
    severityColor: 'bg-yellow-500',
    description:
      'SSRF-уязвимости возникают, когда серверное приложение делает HTTP-запросы к указанному пользователем URL без должной проверки. Злоумышленник может заставить сервер запрашивать внутренние ресурсы, облачные метаданные или внутренние API, к которым у него нет прямого доступа. Это особенно опасно в облачных средах, где метаданные экземпляров содержат учётные данные.',
    realExample:
      'В 2019 году исследователи обнаружили SSRF-уязвимость в Capital One, которая позволила злоумышленнице получить доступ к метаданным AWS EC2-инстанса через запрос к внутреннему IP-адресу 169.254.169.254. Это позволило ей получить временные IAM-учётные данные и получить доступ к базам данных S3 с персональными данными 106 миллионов клиентов Capital One.',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — SSRF
app.get('/api/fetch-url', async (req, res) => {
  const { url } = req.query;
  // Сервер делает запрос к любому URL без проверки
  const response = await fetch(url);
  const data = await response.text();
  res.send(data);
  // Атака: /api/fetch-url?url=http://169.254.169.254/latest/meta-data/
  // Возвращает метаданные AWS с учётными данными!
});

// УЯЗВИМЫЙ КОД — загрузка изображений
app.post('/api/proxy-image', async (req, res) => {
  // Нет валидации URL — можно запросить внутренние ресурсы
  const image = await fetch(req.body.imageUrl);
  const buffer = await image.buffer();
  res.set('Content-Type', 'image/png');
  res.send(buffer);
});`,
    secureCode: `// БЕЗОПАСНЫЙ КОД — валидация URL
const { URL } = require('url');

const ALLOWED_DOMAINS = ['images.example.com', 'cdn.example.com'];
const BLOCKED_HOSTS = ['169.254.169.254', 'localhost', '127.0.0.1'];

app.get('/api/fetch-url', async (req, res) => {
  try {
    const parsedUrl = new URL(req.query.url);

    // Проверяем протокол
    if (!['https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Только HTTPS разрешён' });
    }

    // Проверяем домен
    if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
      return res.status(400).json({ error: 'Домен не разрешён' });
    }

    // Проверяем на заблокированные хосты
    if (BLOCKED_HOSTS.includes(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const response = await fetch(parsedUrl.href);
    res.send(await response.text());
  } catch {
    res.status(400).json({ error: 'Некорректный URL' });
  }
});`,
    mitigations: [
      'Используйте белый список разрешённых доменов',
      'Запретите запросы к внутренним IP-адресам и localhost',
      'Используйте только HTTPS для исходящих запросов',
      'Настройте network policies для ограничения исходящего трафика',
      'Внедрите проверку URL на этапе разбора (до выполнения запроса)',
    ],
  },
];