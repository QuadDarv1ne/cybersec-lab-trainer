# TODO — CyberSec Lab Trainer

**Date:** 2026-05-11 | **Дата:** 2026-05-11
**Branch:** `main` | **Ветка:** `main`

---

## Critical | Критичные

### 1. Prisma in client-side code | Prisma в клиентском коде ~~COMPLETED~~

`store.ts` imports `db` from `@/lib/db` and calls `db.progress.upsert()` directly. Prisma is a server-only module and will crash in the browser.
`store.ts` импортирует `db` из `@/lib/db` и вызывает `db.progress.upsert()` напрямую. Prisma — server-only модуль, он упадёт в браузере.

- [x] Move DB sync to API route (`/api/route`) | Перенести DB sync в API route (`/api/route`)
- [x] Zustand store should call API endpoints, not Prisma directly | Zustand store должен вызывать API endpoints, а не Prisma напрямую
- [x] Remove `import { db }` from client modules | Убрать `import { db }` из клиентских модулей

---

### 2. ESLint fully disabled | ESLint полностью отключён

Nearly all rules are turned off in `eslint.config.mjs` — static analysis does not work.
В `eslint.config.mjs` выключены почти все правила — статический анализ не работает.

- [x] Enable `no-unused-vars` | Включить `no-unused-vars`
- [x] Enable `@typescript-eslint/no-explicit-any` | Включить `@typescript-eslint/no-explicit-any` (as warn)
- [x] Enable `react-hooks/exhaustive-deps` | Включить `react-hooks/exhaustive-deps` (as warn)
- [x] Enable `@next/next/no-img-element` | Включить `@next/next/no-img-element`
- [x] Enable `no-console` (as warn) | Включить `no-console` (как warn)
- [x] Enable additional rules: `prefer-const`, `no-debugger`, `no-useless-escape`, `no-redeclare`, `no-mixed-spaces-and-tabs`, `no-irregular-whitespace`, `@typescript-eslint/ban-ts-comment`, `@typescript-eslint/prefer-as-const`
- [x] Run linter and fix all errors | Прогнать линтер и исправить все ошибки (0 errors, 3 warnings — intentional console statements)

---

### 3. No tests | Нет тестов

Zero test coverage. CI does not run tests.
Нулевое покрытие тестами. CI не запускает тесты.

- [ ] Unit: crypto functions (Caesar, Vigenère, XOR, Base64, hash) | Unit: крипто-функции (Caesar, Vigenère, XOR, Base64, hash)
- [ ] Unit: Zod validation schemas | Unit: Zod validation schemas
- [ ] Unit: quiz scoring logic | Unit: логика подсчёта квизов
- [ ] Unit: `useAppStore` (without DB) | Unit: `useAppStore` (без DB)
- [ ] Component: Sidebar, Dashboard | Component: Sidebar, Dashboard
- [ ] E2E: auth flow, module completion | E2E: процесс авторизации, завершение модулей
- [ ] Add test step to `.github/workflows/ci.yml` | Добавить шаг тестов в `.github/workflows/ci.yml`

---

## High Priority | Высокий приоритет

### 4. i18n — two parallel systems | i18n — две параллельные системы

`next-intl` (`src/locales/`) and custom `intlStub` (`src/i18n/locales/`) coexist. Neither works fully.
Существуют `next-intl` (`src/locales/`) и кастомный `intlStub` (`src/i18n/locales/`). Ни одна не работает полностью.

- [ ] Choose `next-intl` as the canonical system | Выбрать `next-intl` как каноническую систему
- [ ] Delete `intlStub.ts` and `src/i18n/locales/` | Удалить `intlStub.ts` и `src/i18n/locales/`
- [ ] Wire up `IntlProvider` in `layout.tsx` | Подключить `IntlProvider` в `layout.tsx`
- [ ] Replace hardcoded strings in components with `useTranslations` | Заменить хардкод-строки в компонентах на `useTranslations`
- [ ] Delete duplicate `src/locales/` files if unused | Удалить дубликаты `src/locales/` если не используются

---

### 5. Environment variable validation | Валидация переменных окружения

`process.env.GITHUB_ID!` uses non-null assertion without validation. Crashes if env vars are missing.
`process.env.GITHUB_ID!` — non-null assertion без проверки. Краш при отсутствии env vars.

- [ ] Add `t3-env` or Zod schema to validate env vars at startup | Добавить `t3-env` или Zod-схему для валидации env vars при старте
- [ ] Create `.env.example` with all required variables | Создать `.env.example` со всеми необходимыми переменными

---

### 6. API route POST endpoint | POST endpoint API route ~~COMPLETED~~

`app/api/route.ts` validates with Zod but only returns `"Request received"`.
`app/api/route.ts` валидирует Zod, но только возвращает `"Request received"`.

- [x] Implement progress persistence via API | Реализовать сохранение прогресса через API
- [x] Fix Zod error check (`'issues' in error` → `'errors' in error` in newer versions) | Исправить проверку Zod error (`'issues' in error` → `'errors' in error` в новых версиях)

---

### 7. Rate limiting — in-memory | Rate limiting — in-memory

Current `Map` does not work in multi-instance deployments.
Текущий `Map` не работает в multi-instance deployment.

- [ ] Replace with Redis / Upstash for production | Заменить на Redis / Upstash для production
- [ ] Keep in-memory as fallback for dev | Оставить in-memory как fallback для dev

---

### 8. Error Boundary | Error Boundary

- [ ] Add global React error boundary (`error.tsx` in app router) | Добавить глобальный React error boundary (`error.tsx` в app router)
- [ ] Add loading states for async operations (auth, quiz, DB sync) | Добавить loading states для async операций (auth, quiz, DB sync)

---

### 9. TypeScript strictness | Строгость TypeScript

- [ ] `noImplicitAny: false` → `true` in `tsconfig.json` | `noImplicitAny: false` → `true` в `tsconfig.json`
- [ ] Fix all implicit any errors | Исправить все implicit any ошибки
- [ ] Remove `as unknown as` in `db.ts` | Убрать `as unknown as` в `db.ts`

---

## Medium Priority | Средний приоритет

### 10. Dead code | Мёртвый код

- [ ] Delete `src/components/IntlProvider.tsx` (not used in layout) | Удалить `src/components/IntlProvider.tsx` (не используется в layout)
- [ ] Delete unused `src/locales/` files (if next-intl not active) | Удалить неиспользуемые `src/locales/` файлы (если next-intl не активен)
- [ ] Remove unused deploy configs — keep only actively used platforms | Убрать лишние deploy configs — оставить только используемые платформы

---

### 11. Accessibility (a11y) | Доступность

- [ ] Add `aria-label` / `aria-current` to navigation buttons in Sidebar | Добавить `aria-label` / `aria-current` к кнопкам навигации в Sidebar
- [ ] Add skip-navigation link | Добавить skip-navigation link
- [ ] Add `aria-live` regions for dynamic content (progress, quiz results) | Добавить `aria-live` регионы для динамического контента (прогресс, результаты квизов)
- [ ] Difficulty badges and progress indicators — add icons/text alongside color | Difficulty badges и progress indicators — добавить иконки/текст кроме цвета
- [ ] Focus management during page transitions (AnimatePresence) | Focus management при переходах страниц (AnimatePresence)

---

### 12. Meta tags & SEO | Meta tags и SEO

- [ ] OpenGraph meta tags | OpenGraph meta tags
- [ ] Twitter Card meta tags | Twitter Card meta tags
- [ ] `sitemap.xml` | `sitemap.xml`
- [ ] `manifest.json` (PWA) | `manifest.json` (PWA)
- [ ] `robots.txt` | `robots.txt`

---

### 13. Docker Compose security | Безопасность Docker Compose

- [ ] Remove hardcoded credentials (`cybersec:cybersec`) from compose files | Убрать хардкод credentials (`cybersec:cybersec`) из compose файлов
- [ ] Use env vars or secrets | Использовать env vars или secrets

---

### 14. `dangerouslySetInnerHTML` review | Проверка `dangerouslySetInnerHTML`

- [ ] `chart.tsx` lines 83–84 — injects theme CSS. Find a safer alternative | `chart.tsx` строки 83–84 — inject theme CSS. Найти более безопасную альтернативу

---

### 15. Auth improvements | Улучшения авторизации

- [ ] Add credential-based auth (email/password) | Добавить credential-based auth (email/password)
- [ ] Protect API routes — require authentication | Добавить защиту API routes — требовать аутентификацию
- [ ] Add role-based access control (admin/user) | Добавить role-based access control (admin/user)

---

## Low Priority | Низкий приоритет

- [ ] Replace `console.error` with Sentry or another monitoring solution | Заменить `console.error` на Sentry или другое решение для мониторинга
- [ ] Code splitting for heavy components (`react-syntax-highlighter`, `OWASPTop10`) | Code splitting для тяжёлых компонентов (`react-syntax-highlighter`, `OWASPTop10`)
- [ ] Lazy load modules via `next/dynamic` | Lazy loading модулей через `next/dynamic`
- [ ] Keyboard shortcuts for navigation and quiz | Keyboard shortcuts для навигации и квизов
- [ ] Theme persistence across sessions (verify DB sync) | Theme persistence across sessions (проверить sync с DB)
- [ ] Add `CHANGELOG.md` | Добавить `CHANGELOG.md`
- [ ] Update `README.md` — screenshots, detailed setup instructions | Обновить `README.md` — скриншоты, подробные setup инструкции
- [ ] Delete `deploy-vercel.yml` — Vercel natively handles git integration | Удалить `deploy-vercel.yml` — Vercel нативно работает с git

---

## Quick Wins | Быстрые победы

- [ ] Create `.env.example` | Создать `.env.example`
- [ ] Add favicon and og:image | Добавить favicon и og:image
- [ ] Run `bun audit` and update vulnerable packages | Проверить `bun audit` и обновить уязвимые пакеты
- [ ] Ensure `prisma generate` runs in CI | Убедиться что `prisma generate` запускается в CI
