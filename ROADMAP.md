# ROADMAP — CyberSec Lab Trainer

**Создан:** 2026-05-22 | **Автор:** Qoder CLI
**Обновлён:** 2026-05-22 | Исправлены неточные статусы

---

## Выполненные пункты ~~COMPLETED~~

### ~~2. API route интеграционные тесты~~ ~~COMPLETED~~
Тесты для `src/app/api/route.ts` уже существуют — `src/app/api/route.test.ts` (381 строка, 15 тестов). Покрыты все endpoint'ы: `load-progress`, `save-progress`, `quiz-answers`, `batch-sync`, `challenge-progress-sync`, `item-progress-sync`, `reset-progress`, валидация.

### ~~3. Тесты для notes-system и study-sessions~~ ~~COMPLETED~~
Оба файла покрыты тестами: `src/lib/notes-system.test.ts` и `src/lib/study-sessions.test.ts`.

### ~~6. Исправить pre-existing lint ошибки~~ ~~COMPLETED~~
Все lint ошибки исправлены. Оставшиеся предупреждения — только `no-console` (intentional).

---

## В процессе / Планируется

### 1. Миграция Prisma: применить новую модель ItemProgress
Запустить `npx prisma db push` (или `prisma migrate dev`) для создания таблицы `item_progress` в PostgreSQL. Без этого синхронизация детализированного прогресса не заработает в production.

### 4. Синхронизация заметок и учебных сессий с базой данных
Заметки (`notes`) и учебные сессии (`studySessions`) хранятся только в localStorage. Добавить Prisma модели и API endpoint'ы для их сохранения, чтобы данные не терялись при смене устройства.

### 5. Синхронизация csrfViewedChallenges с базой данных
Массив `csrfViewedChallenges` также не синхронизируется. Добавить его в механизм item-progress-sync или создать отдельный поток синхронизации.

### 7. Добавить role-based access control (RBAC)
Опциональный пункт: добавить роли `admin`/`user` в модель User, middleware для защиты админ-маршрутов, UI для управления пользователями.

### 8. Мониторинг ошибок: Sentry или аналог
Заменить `console.error` на интеграцию с Sentry (или аналогичным сервисом) для отслеживания ошибок в production. Сейчас ошибки логируются только в консоль сервера.

### 9. E2E тесты: auth flow и завершение модулей
Написать end-to-end тесты (Playwright) для ключевых пользовательских сценариев: регистрация/вход, прохождение модуля, прохождение квиза, проверка сохранения прогресса.

### 10. Оптимизация N+1 запросов в batch-sync
В `item-progress-sync` и `batch-sync` используется `Promise.all` с отдельными `upsert` для каждой записи. Для больших батчей заменить на `prisma.$transaction` с raw SQL или `createMany` + `updateMany` для повышения производительности.

---

## Статус выполнения

- [ ] 1. Миграция Prisma
- [x] 2. API route тесты ~~COMPLETED~~
- [x] 3. Тесты notes-system и study-sessions ~~COMPLETED~~
- [ ] 4. Синхронизация заметок и сессий
- [ ] 5. Синхронизация csrfViewedChallenges
- [x] 6. Исправление lint ошибок ~~COMPLETED~~
- [ ] 7. RBAC
- [ ] 8. Мониторинг ошибок
- [ ] 9. E2E тесты
- [ ] 10. Оптимизация batch-sync
