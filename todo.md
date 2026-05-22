# TODO — CyberSec Lab Trainer

**Updated:** 2026-05-22 | **Author:** Qoder CLI
**Branch:** `main`

---

## Completed | Выполнено

### Infrastructure & Code Quality
- [x] Prisma moved to API routes — no client-side DB calls
- [x] ESLint fully re-enabled (0 errors)
- [x] 18 test files (unit, component, integration, API)
- [x] i18n with ru/en locale files (344 lines each)
- [x] Zod env validation at startup
- [x] Rate limiting (Upstash Redis + in-memory fallback)
- [x] React Error Boundary + loading skeletons
- [x] TypeScript strict mode (`strict: true`, `noImplicitAny: true`)
- [x] Accessibility (a11y): aria-labels, skip-nav, focus management, keyboard nav
- [x] SEO: OpenGraph, Twitter Cards, sitemap, PWA manifest, robots.txt
- [x] Docker Compose security (env var defaults, no hardcoded creds)
- [x] No `dangerouslySetInnerHTML` usage
- [x] Auth: NextAuth with GitHub/Google + demo fallback, session-protected API
- [x] CSRF protection on all POST requests
- [x] Code splitting for `react-syntax-highlighter`
- [x] `.env.example`, favicon, README, 8 deploy targets
- [x] CI/CD: lint, test, build, CodeQL, `bun audit`

---

## High Priority | Высокий приоритет

### 1. Database sync for Notes & Study Sessions
**Why:** Currently localStorage only — data lost on device change/clear.
- [ ] Add `Note` and `StudySession` Prisma models
- [ ] Create API endpoints: `POST /api/notes`, `GET /api/notes`, `DELETE /api/notes/:id`
- [ ] Create API endpoints: `POST /api/study-sessions`, `GET /api/study-sessions`
- [ ] Update Zustand store to sync with API when authenticated
- [ ] Merge strategy: localStorage wins on conflict, or server wins

### 2. Database sync for `csrfViewedChallenges`
**Why:** Progress in CSRF lab not persisted to DB.
- [ ] Add field to `ItemProgress` or create separate model
- [ ] Integrate into existing `item-progress-sync` endpoint
- [ ] Update store to call API instead of localStorage only

### 3. Prisma Migration for `ItemProgress`
**Why:** Table needs to exist in production DB for detail-level progress sync.
- [ ] Run `prisma migrate dev` (or `prisma db push`) on production PostgreSQL
- [ ] Verify `item_progress` table created with correct schema
- [ ] Test sync flow end-to-end with authenticated user

### 4. Batch-sync N+1 Query Optimization
**Why:** Current `Promise.all` with individual `upsert` calls is inefficient for large datasets.
- [ ] Replace with `prisma.$transaction` using `createMany` + `updateMany`
- [ ] Benchmark before/after for 100+ items
- [ ] Consider raw SQL for bulk upsert if Prisma doesn't support it well

---

## Medium Priority | Средний приоритет

### 5. Error Monitoring (Sentry)
**Why:** `console.error` is invisible in production — need alerts.
- [ ] Install `@sentry/nextjs`
- [ ] Configure Sentry DSN via env var
- [ ] Replace all `console.error` in server code with `Sentry.captureException()`
- [ ] Set up error filtering (ignore benign errors)
- [ ] Add release tracking for deploy correlation

### 6. E2E Tests (Playwright)
**Why:** Critical user flows untested end-to-end.
- [ ] Auth flow: login with demo credentials, session persistence
- [ ] Module completion: open module → interact → verify XP awarded
- [ ] Quiz: answer questions → submit → verify score saved
- [ ] Progress sync: log in on device A → save → log in on device B → verify data
- [ ] Notes: create note → reload → verify note persists

### 7. Role-Based Access Control (RBAC)
**Why:** Needed if multiple users/teachers use the platform.
- [ ] Add `role` field to `User` model (`enum Role { USER, ADMIN }`)
- [ ] Add middleware to protect admin-only routes
- [ ] Admin dashboard: view all users, reset progress, manage content
- [ ] Seed script to create initial admin user

### 8. Leaderboard & Social Features
**Why:** Gamification drives engagement — students compete.
- [ ] Global leaderboard (top users by XP, opt-in privacy)
- [ ] Weekly/monthly leaderboards with reset
- [ ] Achievement sharing (generate shareable image/card)
- [ ] User profiles: level, achievements, modules completed
- [ ] "Challenge a friend" feature for quiz duels

### 9. Additional Security Modules
**Why:** Current 8 modules are good but can expand coverage.
- [ ] **API Security Lab**: rate limiting abuse, JWT attacks, API key leaks
- [ ] **Network Security Basics**: MITM demo, TLS/SSL explanation, DNS spoofing
- [ ] **Container Security**: Docker misconfigurations, image vulnerabilities
- [ ] **Social Engineering**: phishing email analysis, password reuse demo
- [ ] **Incident Response**: log analysis, attack timeline reconstruction
- [ ] **OWASP API Security Top 10**: separate from web OWASP Top 10

### 10. Interactive Attack Simulator
**Why:** Watching attacks succeed/fail is more educational than reading.
- [ ] Visual XSS payload builder with live preview (sandboxed)
- [ ] SQL injection query builder — see query change in real-time
- [ ] Brute-force attack visualizer with configurable speed/dictionary
- [ ] Password cracking demo (hash comparison visualization)
- [ ] Session hijacking simulation (cookie stealing demo)

### 11. Certificate Generation
**Why:** Students need proof of completion for resumes/portfolios.
- [ ] Generate PDF certificate on course completion
- [ ] Include: user name, date, modules completed, final score, unique ID
- [ ] QR code on certificate linking to verification page
- [ ] Option to download or share certificate

---

## Low Priority | Низкий приоритет

### 12. Performance Optimizations
- [ ] Virtual scrolling for long lists (glossary, achievements)
- [ ] Image optimization for module thumbnails (Next.js `<Image>`)
- [ ] Prefetch module data on hover (Next.js `prefetch`)
- [ ] Bundle size audit (`@next/bundle-analyzer`) — identify heavy deps
- [ ] Lazy load framer-motion for reduced initial bundle
- [ ] Service worker for offline access to completed modules

### 13. Content Improvements
- [ ] Video explanations for complex concepts (embedded)
- [ ] Real-world breach case studies (Target, Equifax, etc.)
- [ ] "Learn More" external links to OWASP docs, CVEs, papers
- [ ] Difficulty progression: adaptive — skip easy modules if quiz score > 90%
- [ ] Module-specific quizzes (currently only general quiz exists)
- [ ] Code challenge submissions: user writes code → auto-grade → feedback

### 14. UI/UX Enhancements
- [ ] Animated XP progress bar on level-up
- [ ] Confetti animation for major achievements
- [ ] Dark mode: respect `prefers-color-scheme` animation on toggle
- [ ] Module progress heat map (like GitHub contributions)
- [ ] Streak tracker visualization (calendar view)
- [ ] Mobile-responsive improvements for tablet sizes
- [ ] Printable study guide / cheat sheets

### 15. Analytics & Insights
- [ ] Track most-missed quiz questions (identify weak topics)
- [ ] Average time per module (identify too-hard or too-easy content)
- [ ] User retention metrics (DAU/WAU/MAU)
- [ ] Module completion funnel (start → finish rate)
- [ ] Privacy-compliant (no PII tracking, anonymized)

### 16. Theme & Preferences Persistence
- [ ] Save theme preference in DB (not just localStorage)
- [ ] User settings page: language, theme, notifications, privacy
- [ ] Remember last-visited module on login

### 17. Keyboard Shortcuts Expansion
- [ ] Quiz: number keys (1-4) for answer selection
- [ ] Global: `g` for glossary, `n` for notes, `d` for dashboard
- [ ] Code editor shortcuts in interactive labs
- [ ] Customizable shortcuts in settings

### 18. Notification System
- [ ] In-app notification bell for new achievements, streak reminders
- [ ] Email notifications (optional): weekly progress summary, streak alerts
- [ ] Push notifications (PWA) for study reminders

### 19. Multi-language Expansion
- [ ] Add Spanish (`es`), Chinese (`zh`), or other locale files
- [ ] Use `next-intl` or `react-i18next` for more robust i18n if locales grow
- [ ] RTL language support (Arabic, Hebrew)

### 20. Accessibility Improvements
- [ ] Screen reader testing with NVDA/VoiceOver
- [ ] Color contrast audit (WCAG AA compliance)
- [ ] Reduced motion preference support (disable animations)
- [ ] Keyboard-only navigation audit for all interactive elements

### 21. Code Review Challenge Enhancements
- [ ] Timer for challenges (optional speed run mode)
- [ ] Hint system (costs XP or limits max score)
- [ ] Multiple vulnerability per code snippet (not just one)
- [ ] Community-submitted challenges (moderated)

### 22. Deployment & DevOps
- [ ] Automated deploy on push to main (GitHub Actions)
- [ ] Preview deployments for PRs (Vercel/Netlify)
- [ ] Health check endpoint (`/api/health`)
- [ ] Database backup automation for PostgreSQL
- [ ] Staging environment setup

---

## Future / Stretch Goals | Будущее

### 23. Multiplayer & Real-time Features
- [ ] Real-time quiz competitions (WebSocket-based)
- [ ] Team challenges (groups compete together)
- [ ] Live CTF (Capture The Flag) events

### 24. AI-Powered Features
- [ ] AI code reviewer: submit code → AI finds vulnerabilities
- [ ] Personalized learning path based on weak areas
- [ ] AI-generated quiz questions from module content
- [ ] Chat-based tutor for explaining concepts

### 25. Integration with LMS
- [ ] LTI (Learning Tools Interoperability) for university LMS integration
- [ ] SCORM compliance for enterprise training platforms
- [ ] Grade export to external systems

### 26. Mobile App
- [ ] React Native or PWA for mobile-first experience
- [ ] Offline mode for studying without internet
- [ ] Push notifications for study reminders

### 27. Content Management System
- [ ] Admin panel to add/edit modules without code changes
- [ ] Markdown-based content authoring
- [ ] Version control for content updates

---

## Quick Wins | Быстрые победы

- [ ] Add loading spinner on export/import buttons
- [ ] "Back to top" button on long pages
- [ ] Tooltip explanations for technical terms on hover
- [ ] Copy-to-clipboard button for code blocks
- [ ] Module completion confetti animation
- [ ] Add `robots.txt` disallow for `/api/` routes
- [ ] Add `404.tsx` custom error page with navigation
- [ ] Add `500.tsx` custom server error page
- [ ] Add contribution guide to README
- [ ] Add issue/PR templates to `.github/`

---

## Legend | Легенда

| Priority | Description |
|----------|-------------|
| **High** | Blocks production readiness or significant user value |
| **Medium** | Important feature, improves experience significantly |
| **Low** | Nice to have, polish, or nice-to-have improvements |
| **Future** | Ambitious, requires significant effort, long-term vision |
