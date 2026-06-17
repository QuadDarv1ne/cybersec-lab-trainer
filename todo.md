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
- **Batch-sync транзакции** — заменён `Promise.allSettled` на атомарные транзакции через `prisma.$transaction` / MongoDB session transactions. Теперь либо все обновления сохраняются, либо ни одно (rollback при ошибе).
- **FIFO eviction в rate-limit** — корректное удаление oldest entry по resetTime вместо `entries().next()`
- **Тесты** — sanitize.ts (13 тестов), store actions (19 тестов), API route edge cases (8 новых), i18n completeness (12 новых)
- **i18n hardcoded strings** — 30+ строк переведены в search-bar, StreakWidget, CodeBlock, not-found, loading, LandingPage, use-achievement-toasts
- **zh locale detection** — layout.tsx теперь определяет китайский язык из Accept-Language
- **ARIA accessibility** — aria-label на кнопки поиска, aria-expanded на мобильное меню, aria-hidden на декоративные элементы
- **Memory leak fix** — setTimeout в search-bar onBlur теперь очищается при unmount
- **Hint system XP penalties** — calculateHintPenalty() вычисляет множитель штрафа, recordHintsUsed сохраняет использование подсказок, getXPBreakdown() применяет штраф к XP
- **Hint key mismatches** — HINT_MAP ключи исправлены для совпадения с реальными ID挑战ов
- **Sort mutation fix** — teams.sort() в AdvancedCTFSimulation теперь не мутирует state

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
