# TODO List — CyberSec Lab Trainer
**Актуально на:** воскресенье, 10 мая 2026 г.
**Ветка:** `dev` → `main` (синхронизация обязательна)
**Статус:** Модуляризация данных завершена, синхронизировано с main (commit 86dff80)
---

## 🔥 High Priority (Критично для production)

### 1. База данных и аутентификация
- [x] ✅ **Prisma схема** — `prisma/schema.prisma` существует (PostgreSQL + модели для User, Account, Session, Progress, QuizResult)
- [x] ✅ **Prisma клиент** — `src/lib/db.ts` настроен (логирование включено для development)
- [ ] **Настроить подключение к БД** — `DATABASE_URL` в `.env` + проверить подключение в production
- [x] ✅ **NextAuth.js реализован** — `src/lib/auth.ts` + `src/app/api/auth/[...nextauth]/route.ts` с GitHub/Google провайдерами
- [x] ✅ **Модуляризация данных** — `security-data.ts` разбит на 7 модулей (commit 86dff80)
- [ ] **Мигрировать прогресс из localStorage в БД** — синхронизировать `useAppStore` (`src/lib/store.ts`) с Prisma

### 2. Безопасность приложения
- [ ] **Добавить CSP заголовки** — в `next.config.ts` есть базовые заголовки, нужно расширить:
  ```typescript
  headers: [
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    }
  ]
  ```
- [ ] **Настроить rate limiting** — для API routes (`src/app/api/route.ts`)
- [ ] **Валидация входных данных** — использовать Zod для всех форм (уже подключён)
- [ ] **Проверить зависимости** — `bun audit` + обновить уязвимые пакеты

---

## ⚡ Medium Priority (Важные улучшения)

### 3. UX/UI
- [x] ✅ **Тёмная тема** — `next-themes` подключён в `layout.tsx`, `ThemeToggle` компонент есть
- [ ] **Проверить адаптивность** — тестировать на мобильных устройствах (особенно `Sidebar`, `OWASPTop10`, `QuizSystem`)
- [ ] **Анимации переходов** — добавить Framer Motion для смены страниц
- [ ] **PWA поддержка** — добавить `manifest.json` + service worker

### 4. Локализация (i18n)
- [x] ✅ **next-intl подключён** — `next-env.ts` настроен (`locales: ['en', 'ru']`, `defaultLocale: 'ru'`)
- [x] ✅ **middleware.ts** — настроен для i18n
- [ ] **Создать структуру перевода** — вынести строки в JSON файлы (`locales/en.json`, `locales/ru.json`)
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
- ✅ Prisma клиент настроен (`src/lib/db.ts`)
- ✅ Next-themes подключён в `layout.tsx`
- ✅ `ThemeToggle` компонент реализован
- ✅ `reactStrictMode: true` в `next.config.ts`
- ✅ `bun run build` — сборка проходит успешно
- ✅ `bun run lint` — ошибок нет
- ✅ Все 12 компонентов security-trainer работают
- ✅ Zustand store с persist (localStorage) настроен (`src/lib/store.ts`)
- ✅ next-intl настроен (`next-env.ts`, `middleware.ts`)
- ✅ NextAuth.js реализован (`src/lib/auth.ts` + API route)
- ✅ CSP заголовки настроены в `next.config.ts`
- ✅ Модуляризация `security-data.ts` — разбит на 7 модулей

---

## ⚠️ Текущие проблемы
1. **Prisma не используется в production** — схема есть, клиент настроен, но нет подключения к БД в production
2. **i18n не работает** — next-intl подключён, но не используется в компонентах
3. **Rate limiting не настроен** — для API routes
4. **Нужно проверить адаптивность** — мобильные устройства

---

## 🚀 Следующие шаги (приоритет)
1. **Подключить БД в production** — настроить `DATABASE_URL` + миграции
2. **Настроить i18n** — вынести строки в JSON, использовать `useTranslations`
3. **Добавить rate limiting** — для API routes
4. **Проверить адаптивность** — тестировать на мобильных
5. **Унифицировать обработку ошибок** — создать `lib/errors.ts`

---

## 🔄 Правила работы
- **Не создавать документацию без запроса** — только код и исправления
- **Качество > количество** — фокус на важных улучшениях
- **Работа в `dev`** → тестирование → синхронизация с `main`
- **Все изменения коммитить и пушить** — не забывать про `git push`
- **Проверять зависимости** — `bun audit` перед коммитом
