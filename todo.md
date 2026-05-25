# TODO — Active Improvements for CyberSec Lab Trainer

> Приоритизировано по влиянию: от самого значимого к менее критичному.

---

## ✅ Выполнено (последний коммит)

- **i18n система** — `useTranslations` реактивный, locale switcher в Sidebar, LandingPage полностью переведён, динамический `<html lang>`
- **Race condition в resetProgress** — убран вызов `loadFromDatabase` после сброса
- **beforeunload listener leak** — добавлен `{ once: true }`
- **Sanitization заметок** — XSS защита через `sanitizeNoteContent`
- **prefers-reduced-motion** — хук `useReducedMotion`, Dashboard + FlashcardMode
- **Unhandled promise rejection** — `.catch()` в SettingsPage
- **Мемоизация в ToolsLab** — крипто-вычисления в `useMemo`
- **CI fix** — `--run` флаг для Vitest
- **Dockerfile fix** — `prisma generate` перед build
- **`.dockerignore`** — создан
- **Доступность FlashcardMode** — `onKeyDown` для Enter/Space
- **Batch-sync улучшен** — `Promise.allSettled` с обработкой ошибок

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
