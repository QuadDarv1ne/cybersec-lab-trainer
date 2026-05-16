// Auth Security Lab - Challenge Data

export interface AuthChallenge {
  id: string;
  title: string;
  category: 'jwt' | 'session' | 'password' | 'oauth' | 'mfa';
  scenario: string;
  code: string;
  question: string;
  options: Array<{ text: string; correct: boolean }>;
  explanation: string;
}

export const authChallenges: AuthChallenge[] = [
  {
    id: 'auth-c1',
    title: 'Уязвимость JWT: алгоритм "none"',
    category: 'jwt',
    scenario: 'Злоумышленник анализирует JWT токен приложения:',
    code: `// Header токена:
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload:
{
  "id": 42,
  "role": "user",
  "iat": 1700000000,
  "exp": 1700003600
}

// Атака: злоумышленник меняет header на:
{
  "alg": "none",
  "typ": "JWT"
}
// И payload на:
{
  "id": 1,
  "role": "admin"
}`,
    question: 'Почему эта атака может сработать?',
    options: [
      { text: 'Сервер не проверяет алгоритм подписи и принимает токены без подписи', correct: true },
      { text: 'JWT всегда можно изменить на клиенте', correct: false },
      { text: 'HS256 — слабый алгоритм', correct: false },
      { text: 'exp — это время создания, а не истечения', correct: false },
    ],
    explanation:
      'Атака "alg: none" — известная уязвимость JWT. Если сервер принимает токены с алгоритмом "none", он не проверяет подпись. Злоумышленник может изменить payload и убрать подпись. Защита: явно указывать разрешённые алгоритмы (HS256, RS256) и отклонять "none".',
  },
  {
    id: 'auth-c2',
    title: 'JWT: отсутствие проверки exp',
    category: 'jwt',
    scenario: 'Middleware проверки токена:',
    code: `function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Нет проверки expiration!
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
}`,
    question: 'В чём проблема?',
    options: [
      { text: 'jwt.verify() по умолчанию проверяет exp, проблема в другом месте', correct: false },
      { text: 'Токен может быть бессрочным если exp не задан при генерации', correct: true },
      { text: 'Нужно использовать cookie вместо header', correct: false },
      { text: 'Нужно шифровать payload', correct: false },
    ],
    explanation:
      'Если при генерации JWT не указан expiresIn, токен будет бессрочным. Даже если jwt.verify() проверяет exp, бессрочный токен никогда не истечёт. Это риск: при компрометации токена злоумышленник будет иметь вечный доступ. Решение: всегда указывать короткий срок действия (15-30 мин) + refresh-токены.',
  },
  {
    id: 'auth-c3',
    title: 'Session Fixation атака',
    category: 'session',
    scenario: 'Процесс аутентификации:',
    code: `// 1. Пользователь заходит на сайт — получает session ID
app.get('/login', (req, res) => {
  // Session ID: abc123 (создан до логина)
  res.render('login');
});

// 2. Пользователь входит:
app.post('/login', (req, res) => {
  const user = authenticate(req.body);
  if (user) {
    // Session ID остаётся abc123!
    req.session.userId = user.id;
    req.session.role = user.role;
    res.redirect('/dashboard');
  }
});`,
    question: 'Какая атака возможна?',
    options: [
      { text: 'Злоумышленник может передать жертве известный session ID и получить доступ после её входа', correct: true },
      { text: 'XSS через форму логина', correct: false },
      { text: 'SQL-инъекция через req.body', correct: false },
      { text: 'CSRF через POST', correct: false },
    ],
    explanation:
      'Session Fixation: злоумышленник получает session ID (abc123), отправляет жертве ссылку с этим ID. После входа жертвы злоумышленник использует тот же ID для доступа. Защита: генерировать НОВЫЙ session ID после аутентификации (session.regenerate() в express-session).',
  },
  {
    id: 'auth-c4',
    title: 'Небезопасное хранение JWT',
    category: 'jwt',
    scenario: 'Клиентская часть приложения:',
    code: `// login.js — после успешного входа:
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();

// Сохранение токена:
localStorage.setItem('authToken', token);

// Использование:
const res = await fetch('/api/users', {
  headers: { Authorization: \`Bearer \${localStorage.getItem('authToken')}\` },
});`,
    question: 'Какая проблема безопасности?',
    options: [
      { text: 'localStorage доступен через XSS — злоумышленник может прочитать токен', correct: true },
      { text: 'Нужно использовать sessionStorage вместо localStorage', correct: false },
      { text: 'Токен нужно шифровать перед сохранением', correct: false },
      { text: 'Нет проблемы, это стандартный подход', correct: false },
    ],
    explanation:
      'localStorage доступен любому JavaScript-коду на странице. При XSS-атаке злоумышленник читает все токены через localStorage.getItem(). Более безопасный подход: хранить JWT в HttpOnly + Secure cookie — браузер автоматически отправляет cookie, но JavaScript не имеет к ним доступа.',
  },
  {
    id: 'auth-c5',
    title: 'Weak OAuth state parameter',
    category: 'oauth',
    scenario: 'OAuth 2.0 callback handler:',
    code: `// Initiate OAuth flow:
app.get('/auth/google', (req, res) => {
  const state = Math.random().toString(36).slice(2);
  req.session.oauthState = state;
  res.redirect(\`https://accounts.google.com/o/oauth2/v2/auth?
    client_id=...&
    redirect_uri=...&
    state=\${state}&
    response_type=code
  \`);
});

// Handle callback:
app.get('/auth/google/callback', (req, res) => {
  if (req.query.state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid state' });
  }
  // Exchange code for tokens...
});`,
    question: 'Что небезопасно?',
    options: [
      { text: 'Math.random() предсказуем — злоумышленник может сгенерировать тот же state', correct: true },
      { text: 'State parameter не нужен в OAuth', correct: false },
      { text: 'Нужно использовать POST вместо GET', correct: false },
      { text: 'redirect_uri не проверяется', correct: false },
    ],
    explanation:
      'Math.random() не криптографически безопасен. Злоумышленник может предсказать state и провести CSRF-атаку через OAuth, связав свой аккаунт Google с аккаунтом жертвы. Используйте crypto.randomBytes(32).toString("hex") для генерации state. Также рекомендуется использовать PKCE (code_challenge).',
  },
  {
    id: 'auth-c6',
    title: 'Отсутствие MFA для критических операций',
    category: 'mfa',
    scenario: 'API для смены email пользователя:',
    code: `app.post('/api/change-email', authenticate, (req, res) => {
  const { newEmail } = req.body;
  const user = req.user;

  // Только аутентификация — нет дополнительной верификации!
  db.updateEmail(user.id, newEmail);
  res.json({ message: 'Email обновлён' });
});`,
    question: 'Какая проблема безопасности?',
    options: [
      { text: 'Критическая операция (смена email) требует повторной аутентификации или MFA', correct: true },
      { text: 'Нужно проверить формат email через regex', correct: false },
      { text: 'Нужно использовать PUT вместо POST', correct: false },
      { text: 'Нет проблемы, authenticate middleware достаточно', correct: false },
    ],
    explanation:
      'Смена email — критическая операция. Если токен аутентификации скомпрометирован (через XSS из localStorage), злоумышленник может сменить email и получить полный контроль. Для критических операций (смена пароля, email, привязка MFA) требуется повторная аутентификация (re-authentication) — запрос пароля или OTP.',
  },
  {
    id: 'auth-c7',
    title: 'Password reset token не истекает',
    category: 'password',
    scenario: 'Система сброса пароля:',
    code: `app.post('/api/forgot-password', async (req, res) => {
  const user = await db.findUser(req.body.email);
  const token = crypto.randomBytes(32).toString('hex');
  await db.saveResetToken(user.id, token);
  // Токен сохраняется БЕЗ срока действия!
  sendResetEmail(user.email, token);
  res.json({ message: 'Письмо отправлено' });
});

app.post('/api/reset-password', async (req, res) => {
  const user = await db.findUserByResetToken(req.body.token);
  if (user) {
    await db.updatePassword(user.id, req.body.newPassword);
    // Токен НЕ удаляется после использования!
    res.json({ message: 'Пароль обновлён' });
  }
});`,
    question: 'Какие проблемы безопасности?',
    options: [
      { text: 'Токен не имеет срока действия и не удаляется после использования', correct: true },
      { text: 'crypto.randomBytes() недостаточно случайный', correct: false },
      { text: 'Нужно использовать GET для сброса пароля', correct: false },
      { text: 'Нет проблемы, токен случайный и безопасный', correct: false },
    ],
    explanation:
      'Две критические проблемы: 1) Токен без срока действия — если он попадёт к злоумышленнику (утечка email, interception), он может использовать его в любое время. 2) Токен не удаляется после использования — можно использовать многократно. Исправление: срок действия 1 час + удаление токена после первого использования + одноразовый токен.',
  },
  {
    id: 'auth-c8',
    title: 'Timing attack на проверку пароля',
    category: 'password',
    scenario: 'Функция проверки пароля:',
    code: `function verifyPassword(input, stored) {
  // Посимвольное сравнение — разное время для разных позиций
  for (let i = 0; i < stored.length; i++) {
    if (input[i] !== stored[i]) {
      return false; // Возвращает раньше для неправильных символов
    }
  }
  return true;
}`,
    question: 'Какая атака возможна?',
    options: [
      { text: 'Timing attack — по времени ответа можно определить правильные символы пароля', correct: true },
      { text: 'Buffer overflow при длинном input', correct: false },
      { text: 'XSS через input', correct: false },
      { text: 'Нет атаки, это стандартное сравнение', correct: false },
    ],
    explanation:
      'Timing attack: стандартное сравнение строк останавливается на первом несовпадении. Если пароль "abcdef", сравнение с "abcyxx" займёт больше времени, чем "zbcdef". Измеряя время ответа, злоумышленник может посимвольно восстановить пароль. Решение: использовать сравнение постоянного времени (constant-time comparison), как в bcrypt.compare() или crypto.timingSafeEqual().',
  },
];
