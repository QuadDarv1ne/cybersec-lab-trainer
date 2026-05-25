# TODO — Active Improvements for CyberSec Lab Trainer

> Приоритизировано по влиянию: от самого значимого к менее критичному.

---

## ✅ Выполнено (сессии 1–4)

- **Полное завершение i18n** — ContentSearch, Dashboard (weakness review, export/import), HeatmapCalendar, ErrorBoundary полностью переведены. Английская локаль больше не показывает русский текст
- **i18n система** — `useTranslations` реактивный, locale switcher в Sidebar, LandingPage полностью переведён, динамический `<html lang>`
- **Race condition в resetProgress** — убран вызов `loadFromDatabase` после сброса + очистка in-flight sync
- **beforeunload listener leak** — `{ once: true }` + self-re-registration для SPA навигации
- **deleteNote data loss** — optimistic delete с rollback при ошибке DB
- **Runtime validation в loadFromDatabase** — проверка типов для всех полей API ответа (Array.isArray, typeof object)
- **Sanitization заметок** — XSS защита через `sanitizeNoteContent` + тесты
- **prefers-reduced-motion** — хук `useReducedMotion`, Dashboard + FlashcardMode
- **Unhandled promise rejection** — `.catch()` в SettingsPage
- **Мемоизация в ToolsLab** — крипто-вычисления в `useMemo`
- **CI fix** — `--run` флаг для Vitest
- **Dockerfile fix** — `prisma generate` перед build
- **`.dockerignore`** — создан
- **Доступность FlashcardMode** — `onKeyDown` для Enter/Space
- **Batch-sync улучшен** — `Promise.allSettled` с обработкой ошибок
- **FIFO eviction в rate-limit** — корректное удаление oldest entry по resetTime вместо `entries().next()`
- **Тесты** — sanitize.ts (13 тестов), store actions (19 тестов), API route edge cases (8 новых), i18n completeness (12 новых)

---

## 1. Лидерборд и социальная геймификация
**Приоритет:** Высокий
XP/уровни и 15+ достижений уже есть, но студенты не могут сравнивать прогресс.
- Глобальная таблица лидеров по XP
- Профили пользователей с витриной достижений
- Делимые карточки достижений (shareable achievement cards)

## 2. Квизы по модулям (per-module quizzes)
**Приоритет:** Высокий
Все 80+ вопросов — единый пул, нет привязки к конкретным лабораториям.
- Генерация квиза после завершения каждого модуля
- Отдельный счёт и XP за модульные квизы
- Автоматическая рекомендация: «повтори модуль X, если результат < 70%»

## 3. Интерактивный симулятор атак / Payload Builder
**Приоритет:** Средний
Лаборатории (SQL, XSS, CSRF) проверяют ввод по ключевым словам без визуализации.
- Визуальный XSS payload builder с live-preview (sandboxed iframe)
- SQL injection query builder — видеть изменение запроса в реальном времени
- Пошаговая анимация: «как запрос выполняется на сервере»

## 4. Система подсказок с XP-штрафом
**Приоритет:** Средний
SecureCodingLab и челленджи не имеют подсказок — студенты могут застрять.
- Прогрессивные подсказки (общая → конкретная, до 3 уровней)
- Каждая подсказка уменьшает максимальный XP за задачу
- Визуальный индикатор: «подсказка использована, XP −20%»

## 5. Batch-sync транзакции
**Приоритет:** Средний
API использует `Promise.allSettled` — можно улучшить до `prisma.$transaction` для полной атомарности.
- Заменить на `prisma.$transaction` с `createMany`/`updateMany`
