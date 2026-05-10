# TODO List — CyberSec Lab Trainer
**Актуально на:** воскресенье, 10 мая 2026 г.
**Ветка:** `dev` → `main` (синхронизация обязательна)
**Статус:** Работа в dev-ветке

---

## 🔥 High Priority (Критично для production)

### 1. База данных и аутентификация
- [x] ✅ Prisma схема — `prisma/schema.prisma` (PostgreSQL + модели User, Account, Session, Progress, QuizResult)
- [x] ✅ Prisma клиент — `src/lib/db.ts` (dev=[query,error,warn], prod=[error])
- [x] ✅ NextAuth.js — `src/lib/auth.ts` + `SessionProvider` (GitHub/Google провайдеры)
- [x] ✅ Синхронизация прогресса с БД — `useAppStore` имеет `syncWithDatabase` и `loadFromDatabase`
- [ ] **Настроить DATABASE_URL в production** — добавить реальные credentials в окружение

### 2. Безопасность
- [x] ✅ CSP заголовки — настроены в `next.config.ts`
- [x] ✅ Rate limiting — `src/app/api/route.ts` (100 запросов/минута)
- [ ] **Валидация входных данных** — Zod схемы для API-эндпоинтов
- [ ] **Проверить зависимости** — `bun audit` + обновить уязвимые пакеты

---

## ⚡ Medium Priority (Важные улучшения)

### 3. Локализация (i18n)
- [x] ✅ next-intl подключён — `next-env.ts` + `middleware.ts`
- [x] ✅ Структура переводов — `locales/ru.json` и `locales/en.json`
- [ ] **Интегрировать useTranslations в компоненты** — компоненты ещё используют хардкод

### 4. UX/UI
- [x] ✅ Тёмная тема — `next-themes` + `ThemeToggle`
- [x] ✅ Анимации переходов — Framer Motion в `page.tsx`
- [x] ✅ Адаптивность — Sidebar, OWASPTop10, QuizSystem работают на мобильных

### 5. Контент
- [ ] **Расширить квизы** — добавить вопросы до 50+ (сейчас 25)
- [ ] **Интерактивные упражнения для CSRF** — сейчас только демонстрация
- [ ] **Расширить глоссарий** — добавить все OWASP термины (сейчас 34)

---

## 🛠️ Технические долги

### Код
- [x] ✅ Модуляризация данных — `security-data.ts` разбит на 7 модулей (`src/lib/data/`)
- [ ] **TypeScript strict mode** — `noImplicitAny: false` → `true` + исправить ошибки
- [ ] **Оптимизация производительности**:
  - Code splitting для тяжёлых компонентов (`OWASPTop10`, `QuizSystem`)
  - Lazy loading для модулей (`next/dynamic`)

### Конфигурация
- [ ] **Pre-commit hooks** — Husky + lint-staged
- [ ] **CI/CD пайплайн** — GitHub Actions (lint, build, test)
- [ ] **Automatic formatting** — Prettier + конфиг в `package.json`

---

## 📊 Аналитика и мониторинг
- [ ] **Логирование ошибок** — Sentry или аналоги
- [ ] **Аналитика использования** — отслеживать активность в модулях

---

## 🎯 Расширения функционала
- [ ] **Экспорт прогресса в PDF** — генерация отчётов
- [ ] **Система комментариев** — к материалам модулей
- [ ] **Режим «преподаватель»** — отслеживание группы студентов
- [ ] **Поделиться результатами** — социальные сети/ссылки

---

## ✅ Выполнено (проверено 10.05.2026)
- ✅ Prisma схема (`prisma/schema.prisma`)
- ✅ Prisma клиент (`src/lib/db.ts`)
- ✅ NextAuth.js (`src/lib/auth.ts` + `SessionProvider`)
- ✅ CSP заголовки (`next.config.ts`)
- ✅ Rate limiting (`src/app/api/route.ts`)
- ✅ next-intl + middleware
- ✅ Тёмная тема + ThemeToggle
- ✅ Framer Motion анимации
- ✅ Модуляризация данных (7 модулей)
- ✅ Синхронизация прогресса с БД
- ✅ Адаптивность (мобильные устройства)
- ✅ `bun run build` — сборка проходит успешно
- ✅ `bun run lint` — ошибок нет

---

## ⚠️ Текущие проблемы
1. **i18n не интегрирован в компоненты** — next-intl подключён, но компоненты используют хардкод
2. **Нет реального DATABASE_URL в production** — требуется настройка окружения

---

## 🚀 Следующие шаги (приоритет)
1. **Интегрировать i18n в основные компоненты** — Dashboard, OWASPTop10, QuizSystem
2. **Добавить Zod валидацию для API** — защита от некорректных данных
3. **Настроить CI/CD пайплайн** — автоматический lint/build/test

---

## 🔄 Правила работы
- **Не создавать документацию без запроса** — только код и исправления
- **Качество > количество** — фокус на важных улучшениях
- **Работа в `dev`** → тестирование → синхронизация с `main`
- **Все изменения коммитить и пушить** — не забывать про `git push`