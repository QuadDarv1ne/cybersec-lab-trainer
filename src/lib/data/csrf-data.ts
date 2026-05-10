// CSRF Lab Data

export interface CSRFStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  diagram?: string;
}

export const csrfSteps: CSRFStep[] = [
  {
    id: 'step-1',
    title: 'Что такое CSRF?',
    description:
      'CSRF (Cross-Site Request Forgery) — это атака, при которой злоумышленник заставляет браузер жертвы отправить нежелательный запрос к уязвимому сайту. Браузер автоматически прикрепляет куки аутентификации, поэтому сервер воспринимает запрос как легитимный.',
  },
  {
    id: 'step-2',
    title: 'Условия для CSRF-атаки',
    description:
      'Для успешной CSRF-атаки необходимы следующие условия:',
    code: `1. Сайт использует куки для аутентификации
2. Действие имеет значимые последствия (перевод денег, смена пароля)
3. В запросе нет дополнительных параметров (CSRF-токен)
4. Злоумышленник знает структуру запроса`,
  },
  {
    id: 'step-3',
    title: 'Симуляция атаки',
    description:
      'Злоумышленник создаёт вредоносную страницу, которая автоматически отправляет запрос к целевому сайту:',
    code: `<!-- Злоумышленник создаёт страницу evil.com -->
<!DOCTYPE html>
<html>
<body>
  <!-- Скрытая форма для перевода денег -->
  <form id="csrf-form" action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="evil-account">
    <input type="hidden" name="amount" value="1000">
  </form>

  <script>
    // Автоматически отправляем форму при загрузке
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>`,
  },
  {
    id: 'step-4',
    title: 'Как защититься?',
    description:
      'Основные методы защиты от CSRF-атак:',
    code: `1. CSRF-токены (анти-CSRF токены)
   - Сервер генерирует уникальный токен для каждой сессии
   - Токен включается в каждую форму и проверяется при отправке

2. SameSite куки
   - SameSite=Strict — куки не отправляются с кросс-сайтовыми запросами
   - SameSite=Lax — куки отправляются только для GET-запросов

3. Проверка Referer/Origin заголовков
   - Проверяем, что запрос пришёл с доверенного домена

4. Double Submit Cookie
   - Токен хранится в куки и в заголовке X-CSRF-Token`,
  },
];