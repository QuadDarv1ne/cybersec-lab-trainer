// Secure Coding Challenges and Modules Data

export interface SecureCodingChallenge {
  id: string;
  title: string;
  category: string;
  code: string;
  options: Array<{ text: string; correct: boolean }>;
  explanation: string;
}

export const secureCodingChallenges: SecureCodingChallenge[] = [
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
  {
    id: 'sc-6',
    title: 'Path Traversal (обход пути)',
    category: 'Контроль доступа',
    code: `app.get('/api/files', (req, res) => {
  const filename = req.query.name;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filePath);
});`,
    options: [
      { text: 'Запретить загрузку файлов', correct: false },
      { text: 'Валидировать имя файла и использовать path.resolve с проверкой корневой директории', correct: true },
      { text: 'Скрывать ошибки файловой системы', correct: false },
      { text: 'Использовать только расширения .jpg и .png', correct: false },
    ],
    explanation:
      'Злоумышленник может передать name=../../etc/passwd и прочитать системные файлы. Необходимо валидировать имя файла, запретить символы ../ и проверять, что итоговый путь находится внутри разрешённой директории.',
  },
  {
    id: 'sc-7',
    title: 'Небезопасная десериализация',
    category: 'Десериализация',
    code: `app.post('/api/profile', (req, res) => {
  const profile = JSON.parse(req.body.data);
  // Динамическое создание объекта из пользовательских данных
  const User = eval(profile.type);
  const user = new User(profile);
  res.json(user);
});`,
    options: [
      { text: 'Использовать schema validation (Zod/Joi) и запретить eval()', correct: true },
      { text: 'Добавить try-catch вокруг eval()', correct: false },
      { text: 'Ограничить размер тела запроса', correct: false },
      { text: 'Использовать XML вместо JSON', correct: false },
    ],
    explanation:
      'eval() выполняет произвольный JavaScript-код. Злоумышленник может передать profile.type с вредоносным кодом и получить RCE (Remote Code Execution). Используйте безопасную валидацию схем и никогда не используйте eval() с пользовательским вводом.',
  },
  {
    id: 'sc-8',
    title: 'Race Condition (состояние гонки)',
    category: 'Конкурентность',
    code: `app.post('/api/withdraw', async (req, res) => {
  const user = await db.getUser(req.body.userId);
  if (user.balance >= req.body.amount) {
    await db.updateBalance(req.body.userId, user.balance - req.body.amount);
    res.json({ success: true });
  }
});`,
    options: [
      { text: 'Использовать транзакции базы данных с блокировкой строк', correct: true },
      { text: 'Добавить задержку между запросами', correct: false },
      { text: 'Проверять баланс на клиенте', correct: false },
      { text: 'Ограничить частоту запросов', correct: false },
    ],
    explanation:
      'При одновременных запросах оба запроса могут прочитать одинаковый баланс до обновления, что приведёт к двойному списанию. Транзакции с блокировкой строк (SELECT FOR UPDATE) гарантируют атомарность операции.',
  },
  {
    id: 'sc-9',
    title: 'Open Redirect (открытое перенаправление)',
    category: 'Перенаправление',
    code: `app.get('/api/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url);
});`,
    options: [
      { text: 'Разрешить только внутренние URL или использовать белый список доменов', correct: true },
      { text: 'Запретить все перенаправления', correct: false },
      { text: 'Добавить заголовки безопасности', correct: false },
      { text: 'Использовать POST вместо GET', correct: false },
    ],
    explanation:
      'Злоумышленник может создать ссылку https://yoursite.com/api/redirect?url=https://evil.com для фишинга. Пользователь видит доверенный домен, но попадает на вредоносный сайт. Используйте белый список разрешённых доменов для перенаправлений.',
  },
  {
    id: 'sc-10',
    title: 'Небезопасная загрузка файлов',
    category: 'Загрузка файлов',
    code: `app.post('/api/upload', (req, res) => {
  const file = req.files.document;
  file.mv(path.join(__dirname, 'uploads', file.name));
  res.json({ message: 'Файл загружен' });
});`,
    options: [
      { text: 'Проверять MIME-тип, расширение и размер файла, генерировать уникальное имя', correct: true },
      { text: 'Разрешить загрузку только изображений', correct: false },
      { text: 'Ограничить размер файла до 1MB', correct: false },
      { text: 'Хранить файлы в базе данных', correct: false },
    ],
    explanation:
      'Без проверки злоумышленник может загрузить .php или .js файл и выполнить его на сервере. Необходимо проверять MIME-тип, расширение, размер, генерировать уникальные имена файлов и хранить их вне директории с исполняемым кодом.',
  },
];

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  difficultyColor: string;
  lessons: number;
  totalSteps: number;
}

export const modules: Module[] = [
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
    description: 'Изучите семь типов XSS-уязвимостей: отражённый, хранимый, DOM-based, event-handler, SVG, data: URI и template injection. Интерактивные демонстрации.',
    icon: 'FileText',
    difficulty: 'Средний',
    difficultyColor: 'bg-yellow-100 text-yellow-800',
    lessons: 7,
    totalSteps: 7,
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
    description: 'Задачи по ревью кода: найдите уязвимость в фрагменте кода и выберите правильное решение. 10 практических задач.',
    icon: 'Code',
    difficulty: 'Продвинутый',
    difficultyColor: 'bg-red-100 text-red-800',
    lessons: 10,
    totalSteps: 10,
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
  {
    id: 'security-headers',
    title: 'Заголовки безопасности',
    description: 'Изучите HTTP-заголовки для защиты веб-приложений: CSP, HSTS, X-Frame-Options и другие.',
    icon: 'ShieldAlert',
    difficulty: 'Средний',
    difficultyColor: 'bg-yellow-100 text-yellow-800',
    lessons: 8,
    totalSteps: 8,
  },
];

/**
 * Learning Path: ordered module sequence for guided learning.
 * Each module requires the previous one to be completed.
 * OWASP -> SQL -> XSS -> CSRF -> Auth -> Headers -> Secure Coding -> Tools
 */
export const learningPathOrder: string[] = [
  'owasp',
  'sql-injection',
  'xss',
  'csrf',
  'auth',
  'security-headers',
  'secure-coding',
  'tools',
];

/**
 * Check if a module is accessible given the completed modules.
 * In guided mode, a module is accessible only if all previous modules
 * in the learning path have been completed.
 */
export function isModuleAccessible(moduleId: string, completedModules: string[]): boolean {
  // If already completed, always accessible
  if (completedModules.includes(moduleId)) return true;

  const idx = learningPathOrder.indexOf(moduleId);
  if (idx === -1) return true; // Not in learning path (e.g., free modules)
  if (idx === 0) return true; // First module is always accessible

  // Check if all previous modules in the path are completed
  const previousModules = learningPathOrder.slice(0, idx);
  return previousModules.every((prevId) => completedModules.includes(prevId));
}

/**
 * Get the next recommended module in the learning path.
 */
export function getNextLearningPathModule(completedModules: string[]): string | null {
  for (const moduleId of learningPathOrder) {
    if (!completedModules.includes(moduleId)) {
      return moduleId;
    }
  }
  return null; // All completed
}