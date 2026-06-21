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
- **Quiz history score bug** — load-progress возвращал qr.score (количество правильных) вместо qr.percentage (процент 0-100). Пользователи видели "7%" вместо "70%" после синхронизации

---

## План на следующие 10 улучшений

> Приоритизировано по impact/effort. Следующий аудит начинать с пункта 1.

### 1. DRY: Извлечь shared `getOptionStyle()` из 6 компонентов ✅
**Файл:** `src/lib/ui-helpers.ts` (новый)
**Проблема:** QuizSystem, SecureCodingLab, WeaknessReview, SecurityHeadersLab, OWASPTop10, AuthSecurityLab — все содержат идентичный 10-строчный блок вычисления стиля опций (default → correct → incorrect-selected → other-selected).
**Решение:** Одна функция `getOptionStyle(isAnswered, isCorrect, isSelected, accentColor)`, импортируемая во все 6 файлов.
**Статус:** ✅ Готово — `src/lib/utils.ts`, -64/+51 строк, 6 компонентов обновлены.

### 2. Performance: `useCallback` в SecureCodingLab ✅
**Файл:** `src/components/security-trainer/SecureCodingLab.tsx:84-108`
**Проблема:** `handleSelectOption`, `revealHint`, `navigateToChallenge` пересоздаются каждый рендер без `useCallback`.
**Решение:** Обернуть хендлеры в `useCallback` с зависимостями.
**Статус:** ✅ Готово — 6 хендлеров обёрнуты, navigateToChallenge упрощён (убрано дублирование useEffect), -31/+20 строк.

### 3. Performance: заменить module-level search cache на `useMemo` ✅
**Файл:** `src/components/security-trainer/ContentSearch.tsx:254-259`
**Проблема:** `buildSearchIndex()` вызывается один раз и кэшируется в module-level переменной. Невалидируется при HMR и работает даже если поиск не открыт.
**Решение:** `useMemo` внутри компонента с lazy initialization.
**Статус:** ✅ Готово — module-level кэш удалён, -9/+1 строк.

### 4. Code quality: убрать дублирование в `navigateToChallenge` ✅
**Файл:** `src/components/security-trainer/SecureCodingLab.tsx:97-108`
**Проблема:** `navigateToChallenge` дублирует логику `useEffect` на строках 50-59, плюс создаёт дублирующий `Set` вместо использования `useMemo` на строке 45.
**Решение:** Оставить только `setActiveChallenge(index)`, `useEffect` сам обработает остальное.
**Статус:** ✅ Готово — выполнено вместе с пунктом 2 (useCallback refactor).

### 5. API: исправить unreachable code в GET handler ✅
**Файл:** `src/app/api/route.ts:329-335`
**Проблема:** Блок "unknown action" за пределами try/catch unreachable для валидных запросов, но вызывает `setCsrfCookie()` зря.
**Решение:** Добавить `else` внутри try-блока для неизвестных action.
**Статус:** ✅ Готово — блок "unknown action" перенесён внутрь try/catch.

### 6. Accessibility: добавить `aria-label` на все интерактивные элементы
**Файлы:** QuizSystem, SecureCodingLab, CSRFLab
**Проблема:** Некоторые кнопки навигации и переключатели не имеют `aria-label`.

### 7. Testing: добавить тест для quiz history percentage fix ✅
**Файл:** `src/app/api/route.test.ts`
**Проблема:** Нет теста, проверяющего что `score` в load-progress возвращает percentage, а не raw count.
**Решение:** Добавлен тест-кейс с mock quizResult содержащим `score=3, total=10, percentage=30`.
**Статус:** ✅ Готово — проверяет что `score` = percentage (30), `correct` = raw count (3).

### 8. Code quality: типизировать `hint-system.ts` строже ✅
**Файл:** `src/lib/hint-system.ts`
**Проблема:** Магические числа `xpReduction` (0.10, 0.25, 0.50) дублировались 30 раз; `getHintLevelLabel` использовал switch c default-строкой.
**Решение:** Заменить все xpReduction на `HINT_XP_PENALTY[level]`, добавить `satisfies Record<string, Hint[]>`, переписать `getHintLevelLabel` через `Record<HintLevel, string>`.
**Статус:** ✅ Готово — единый источник истины для штрафов, строгая типизация, никаких магических чисел.

### 9. UX: добавить skeleton loading для тяжёлых компонентов
**Файлы:** Dashboard, ContentSearch, ProgressAnalytics
**Проблема:** При первой загрузке данные появляются без плавного transition.

### 10. Docs: обновить README с актуальными инструкциями по запуску
**Файл:** `README.md`
**Проблема:** Инструкции могут устареть после изменений в конфигурации БД и Docker.

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
