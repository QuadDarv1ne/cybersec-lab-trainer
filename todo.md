# TODO List — CyberSec Lab Trainer
**Актуально на:** воскресенье, 10 мая 2026 г.
**Ветка:** `dev` → `main` (синхронизация обязательна)
**Статус:** Работа в dev-ветке
---

## 🔥 High Priority (Критично для production)

### 1. База данных и аутентификация
- [x] ✅ **Prisma схема** — `prisma/schema.prisma` существует (PostgreSQL + модели для User, Account, Session, Progress, QuizResult)
- [x] ✅ **Prisma клиент** — `src/lib/db.ts` настроен (логирование: dev=[query,error,warn], prod=[error])
- [ ] **Настроить подключение к БД** — `DATABASE_URL` в `.env` + проверить подключение в production
- [x] ✅ **NextAuth.js реализован** — `src/lib/auth.ts` + `SessionProvider` с GitHub/Google провайдерами
- [x] ✅ **Модуляризация данных** — `security-data.ts` разбит на 7 модулей (`src/lib/data/`)
- [x] ✅ **Синхронизация прогресса с БД** — `useAppStore` (`src/lib/store.ts`) имеет методы `syncWithDatabase` и `loadFromDatabase`

### 2. Безопасность приложения
- [x] ✅ **CSP заголовки** — настроены в `next.config.ts` (Content-Security-Policy, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy)
- [x] ✅ **Rate limiting** — реализован в `src/app/api/route.ts` (100 запросов/минута, в памяти)
- [ ] **Валидация входных данных** — использовать Zod для всех форм (уже подключён)
- [ ] **Проверить зависимости** — `bun audit` + обновить уязвимые пакеты

---

## ⚡ Medium Priority (Важные улучшения)

### 3. UX/UI
- [x] ✅ **Тёмная тема** — `next-themes` подключён в `layout.tsx`, `ThemeToggle` компонент есть
- [x] ✅ **Адаптивность проверена** — Sidebar, OWASPTop10, QuizSystem работают на мобильных
- [ ] **Анимации переходов** — добавить Framer Motion для смены страниц
- [ ] **PWA поддержка** — добавить `manifest.json` + service worker

### 4. Локализация (i18n)
- [x] ✅ **next-intl подключён** — `next-env.ts` настроен (`locales: ['en', 'ru']`, `defaultLocale: 'ru'`)
- [x] ✅ **middleware.ts** — настроен для i18n
- [x] ✅ **Структура переводов** — `locales/ru.json` и `locales/en.json` созданы с полной структурой
- [ ] **Обновить компоненты** — использовать `useTranslations` вместо хардкода

### 5. Контент
- [ ] **Расширить квизы** — добавить вопросы до 50+ (сейчас 25)
- [ ] **Интерактивные упражнения для CSRF** — сейчас только демонстрация
- [ ] **Расширить глоссарий** — добавить все OWASP термины (сейчас 34)
- [ ] **Система уровней/рейтинга** — геймификация для пользователей

---

## 🛠️ Технические долги

### Код
- [x] ✅ **Рефакторинг `security-data.ts`** — разбит на 7 модулей (`src/lib/data/`)
- [ ] **Унифицировать обработку ошибок** — создать `lib/errors.ts` с кастомными ошибками
- [ ] **TypeScript strict mode** — включить в `tsconfig.json` и исправить ошибки
- [ ] **Оптимизация производительности**:
  - Code splitting для тяжёлых компонентов (`OWASPTop10`, `QuizSystem`)
  - Lazy loading для модулей (`next/dynamic`)
  - `React.memo` для списков (например, в `Dashboard`)

### Конфигурация
- [ ] **Pre-commit hooks** — настроить Husky + lint-staged:
  ```bash
  bun add -D husky lint-staged
  bunx husky init
  ```
- [ ] **CI/CD пайплайн** — GitHub Actions для:
  - Линтинга (`bun run lint`)
  - Сборки (`bun run build`)
  - Тестов (если будут)
- [ ] **Automatic formatting** — подключить Prettier + настроить в `package.json`

---

## 📊 Аналитика и мониторинг
- [ ] **Логирование ошибок** — интегрировать Sentry или аналоги
- [ ] **Аналитика использования** — отслеживать активность в модулях
- [ ] **Отслеживание прогресса студентов** — для режима преподавателя

---

## 🎯 Расширения функционала
- [ ] **Экспорт прогресса в PDF** — генерация отчётов
- [ ] **Система комментариев** — к материалам модулей
- [ ] **Режим «преподаватель»** — отслеживание группы студентов
- [ ] **Поделиться результатами** — социальные сети/ссылки

---

## ✅ Выполнено (проверено 10.05.2026)
- ✅ Prisma схема существует (`prisma/schema.prisma`)
- ✅ Prisma клиент настроен (`src/lib/db.ts`) — логирование: dev=[query,error,warn], prod=[error]
- ✅ Next-themes подключён в `layout.tsx`
- ✅ `ThemeToggle` компонент реализован
- ✅ `reactStrictMode: true` в `next.config.ts`
- ✅ `bun run build` — сборка проходит успешно
- ✅ `bun run lint` — ошибок нет
- ✅ Все 12 компонентов security-trainer работают
- ✅ Zustand store с persist (localStorage) настроен (`src/lib/store.ts`)
- ✅ next-intl подключён (`next-env.ts`, `middleware.ts`)
- ✅ Локальные JSON файлы переводов созданы (`locales/ru.json`, `locales/en.json`)
- ✅ NextAuth.js реализован (`src/lib/auth.ts` + `SessionProvider`)
- ✅ CSP заголовки настроены в `next.config.ts`
- ✅ Модуляризация `security-data.ts` — разбит на 7 модулей
- ✅ Синхронизация прогресса с БД реализована в `store.ts`
- ✅ Rate limiting реализован (`src/app/api/route.ts`) — 100 запросов/минута
- ✅ Адаптивность проверена — Sidebar, OWASPTop10, QuizSystem работают на мобильных

---

## ⚠️ Текущие проблемы
1. **Prisma не используется в production** — схема есть, клиент настроен, но нет подключения к БД в production
2. **i18n не интегрирован в компоненты** — next-intl подключён, но компоненты ещё используют хардкод

---

## 🚀 Следующие шаги (приоритет)
1. **Подключить БД в production** — настроить `DATABASE_URL` + миграции
2. **Интегрировать i18n в компоненты** — использовать `useTranslations` в основных компонентах
3. **Унифицировать обработку ошибок** — создать `lib/errors.ts`

---

## 🔄 Правила работы
- **Не создавать документацию без запроса** — только код и исправления
- **Качество > количество** — фокус на важных улучшениях
- **Работа в `dev`** → тестирование → синхронизация с `main`
- **Все изменения коммитить и пушить** — не забывать про `git push`
- **Проверять зависимости** — `bun audit` перед коммитом