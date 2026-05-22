# ROADMAP — CyberSec Lab Trainer

**Создан:** 2026-05-22 | **Автор:** Qoder CLI

---

## План из 10 пунктов

### 1. Миграция Prisma: применить новую модель ItemProgress
Запустить `npx prisma db push` (или `prisma migrate dev`) для создания таблицы `item_progress` в PostgreSQL. Без этого синхронизация детализированного прогресса не заработает в production.

### 2. Добавить API route интеграционные тесты
Написать тесты для `src/app/api/route.ts` — покрыть все endpoint'ы: `load-progress`, `batch-sync`, `challenge-progress-sync`, `item-progress-sync`, `reset-progress`. Сейчас это единственный критический файл без тестов.

### 3. Добавить тесты для notes-system и study-sessions
`src/lib/notes-system.ts` и `src/lib/study-sessions.ts` не имеют тестов. Покрыть основную логику: создание/обновление/удаление заметок, расчёт XP за сессии, определение «сегодняшних» сессий.

### 4. Синхронизация заметок и учебных сессий с базой данных
Заметки (`notes`) и учебные сессии (`studySessions`) хранятся только в localStorage. Добавить Prisma модели и API endpoint'ы для их сохранения, чтобы данные не терялись при смене устройства.

### 5. Синхронизация csrfViewedChallenges с базой данных
Массив `csrfViewedChallenges` также не синхронизируется. Добавить его в механизм item-progress-sync или создать отдельный поток синхронизации.

### 6. Исправить pre-existing lint ошибки
- `SyncIndicator.test.tsx`: `require()` вместо `import`
- `rate-limit.test.ts`: неиспользуемые импорты `vi`, `beforeEach`, `afterEach`
- `study-sessions.ts`: неиспользуемый `getStartOfToday`
- `tsconfig.json`: пре-existing TS7006 ошибки в тестах

### 7. Добавить role-based access control (RBAC)
Опциональный пункт из todo.md: добавить роли `admin`/`user` в модель User, middleware для защиты админ-маршрутов, UI для управления пользователями.

### 8. Мониторинг ошибок: Sentry или аналог
Заменить `console.error` на интеграцию с Sentry (или аналогичным сервисом) для отслеживания ошибок в production. Сейчас ошибки логируются только в консоль сервера.

### 9. E2E тесты: auth flow и завершение модулей
Написать end-to-end тесты (Playwright) для ключевых пользовательских сценариев: регистрация/вход, прохождение модуля, прохождение квиза, проверка сохранения прогресса.

### 10. Оптимизация N+1 запросов в batch-sync
В `item-progress-sync` и `batch-sync` используется `Promise.all` с отдельными `upsert` для каждой записи. Для больших батчей заменить на `prisma.$transaction` с raw SQL или `createMany` + `updateMany` для повышения производительности.

---

## Статус выполнения

- [ ] 1. Миграция Prisma
- [ ] 2. API route тесты
- [ ] 3. Тесты notes-system и study-sessions
- [ ] 4. Синхронизация заметок и сессий
- [ ] 5. Синхронизация csrfViewedChallenges
- [ ] 6. Исправление lint ошибок
- [ ] 7. RBAC
- [ ] 8. Мониторинг ошибок
- [ ] 9. E2E тесты
- [ ] 10. Оптимизация batch-sync
