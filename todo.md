# TODO — CyberSec Lab Trainer

**Date:** 2026-05-18 | **Дата:** 2026-05-18
**Branch:** `main` | **Ветка:** `main`

---

## Critical | Критичные — ~~ALL DONE~~

### 1. Prisma in client-side code | Prisma в клиентском коде ~~COMPLETED~~
- [x] Move DB sync to API route (`/api/route`)
- [x] Zustand store should call API endpoints, not Prisma directly
- [x] Remove `import { db }` from client modules

### 2. ESLint fully disabled | ESLint полностью отключён ~~COMPLETED~~
- [x] All rules re-enabled (0 errors, 3 warnings — intentional console statements)

### 3. Tests | Тесты ~~COMPLETED~~
- [x] Unit: crypto functions (Caesar, Vigenère, XOR, Base64, hash) — `crypto-utils.test.ts` (176 lines)
- [x] Unit: Zod validation schemas — `validations/api.test.ts`
- [x] Unit: quiz data integrity — `data/quiz-data.test.ts`
- [x] Unit: `useAppStore` (without DB) — `store.test.ts`
- [x] Utility functions — `utils.test.ts`
- [x] Component: Sidebar (7 tests) + Dashboard (5 tests) — `Sidebar.test.tsx`, `Dashboard.test.tsx`
- [x] Test step in CI — already in `.github/workflows/ci.yml`
- [ ] E2E: auth flow, module completion — low priority

### 6. API route POST endpoint ~~COMPLETED~~
- [x] Progress persistence via API
- [x] Zod error handling fixed

---

## High Priority | Высокий приоритет

### 4. i18n — current `intlStub` works | i18n — текущая система работает

The project uses a custom lightweight `intlStub.ts` + JSON locale files. It works reliably — 26 usages across 13 components. `next-intl` is not installed. No need to refactor.
Проект использует кастомную лёгкую `intlStub.ts` + JSON. Работает стабильно. `next-intl` не установлен. Рефакторинг не требуется.

- [x] intlStub.ts actively used across 13+ components
- [x] Two locales: `ru`, `en` — each with 344 lines of translations
- [x] No dead `IntlProvider.tsx` or `src/locales/` directory exists

### 5. Environment variable validation ~~COMPLETED~~
- [x] Zod schema in `src/lib/env.ts` validates all env vars at module load
- [x] `.env.example` exists with all required variables
- [x] Early error detection on startup

### 7. Rate limiting — Upstash Redis + in-memory fallback ~~COMPLETED~~
- [x] Upstash Redis integration for production (auto-detected via env vars)
- [x] In-memory fallback for dev (when UPSTASH_REDIS_* not set)
- [x] Extracted to `src/lib/rate-limit.ts` — clean separation from API route
- [x] `.env.example` updated with UPSTASH_REDIS vars

### 8. Error Boundary & Loading States ~~COMPLETED~~
- [x] Global React error boundary (`src/app/error.tsx`) added
- [x] `ErrorBoundary` component (`src/components/ErrorBoundary.tsx`) wraps layout
- [x] Loading states via Skeleton for all lazy-loaded pages (dynamic imports)

### 9. TypeScript strictness ~~COMPLETED~~
- [x] `strict: true` and `noImplicitAny: true` in `tsconfig.json`
- [x] No `as unknown as` in `db.ts`

---

## Medium Priority | Средний приоритет

### 10. Dead code | Мёртвый код ~~COMPLETED~~
- [x] `IntlProvider.tsx` does not exist in components
- [x] `src/locales/` directory does not exist
- [x] `chart.tsx` does not exist
- [x] intlStub.ts is actively used (not dead)

### 11. Accessibility (a11y) | Доступность ~~COMPLETED~~
- [x] `aria-label` / `aria-current` on all navigation buttons in Sidebar
- [x] Skip-navigation link in root layout
- [x] `aria-live="polite"` on progress section and stats
- [x] Focus management during page transitions (useEffect on currentPage change)
- [x] `role="button"` with `tabIndex={0}` and `onKeyDown` on all clickable cards
- [x] Difficulty badges use color + text (already sufficient)

### 12. Meta tags & SEO | Meta tags и SEO ~~COMPLETED~~
- [x] OpenGraph meta tags in layout.tsx (with security-logo.png)
- [x] Twitter Card meta tags (summary_large_image)
- [x] `sitemap.ts` — dynamic sitemap for all routes
- [x] `manifest.ts` — PWA manifest
- [x] `robots.txt` — already existed, updated metadata

### 13. Docker Compose security ~~COMPLETED~~
- [x] Already uses env var defaults (`${POSTGRES_USER:-cybersec}`), not hardcoded
- [x] `.env.example` documents all variables

### 14. `dangerouslySetInnerHTML` review ~~COMPLETED~~
- [x] No usage of `dangerouslySetInnerHTML` found anywhere in source code
- [x] `chart.tsx` does not exist in the project

### 15. Auth improvements | Улучшения авторизации
- [x] CredentialsProvider demo fallback exists — works without OAuth
- [x] API routes protected with session check
- [x] Middleware auth guard — `next-auth/middleware` with `withAuth`
- [ ] Add role-based access control (admin/user) — optional

---

## Low Priority | Низкий приоритет

- [ ] Replace `console.error` with Sentry or another monitoring solution
- [x] Code splitting for heavy components — `react-syntax-highlighter` dynamically imported
- [ ] Keyboard shortcuts for navigation and quiz
- [ ] Theme persistence across sessions (verify DB sync)
- [x] `CHANGELOG.md` — not applicable
- [x] `README.md` — exists with setup, deploy, and usage docs
- [x] `.env.example` — exists
- [x] favicon — exists (`/logo.svg`)

---

## Quick Wins | Быстрые победы

- [x] Create `.env.example` — exists
- [x] Add favicon — `/logo.svg` is configured in layout metadata
- [x] Add `og:image` (`/security-logo.png`) and full OpenGraph meta tags
- [x] Run `bun audit` — clean
- [x] `prisma generate` runs in CI — already in build step
