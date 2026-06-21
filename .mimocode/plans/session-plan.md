# Plan: Quality Improvement Cycle (Session 2026-06-21)

## Completed This Session
- Fixed TS7053 in `hint-system.ts` (`satisfies` → `Record<string, Hint[]>` annotation)
- Moved unknown-action block inside try/catch in `route.ts`
- Added quiz history percentage test in `route.test.ts`
- Replaced 30 magic `xpReduction` numbers with `HINT_XP_PENALTY` constant
- Synced all remotes (origin + gitverse), force-pushed to gitverse
- Fixed React hooks rules-of-hooks violation in SecureCodingLab (6 ESLint errors)

---

## 10-Point Improvement Plan

### 1. ~~Fix TS7053 type error in hint-system.ts~~ ✅ DONE
**Impact:** High — compilation error blocking CI  
**Done:** Changed `satisfies Record<string, Hint[]>` to explicit type annotation

### 2. ~~Fix unreachable code in API GET handler~~ ✅ DONE
**Impact:** Medium — CSRF cookie set unnecessarily for unknown actions  
**Done:** Moved unknown-action response block inside try/catch

### 3. ~~Add test for quiz history percentage fix~~ ✅ DONE
**Impact:** Medium — regression test for score vs percentage bug  
**Done:** Added test verifying `score` returns percentage, `correct` returns raw count

### 4. ~~Fix React hooks rules-of-hooks violation in SecureCodingLab~~ ✅ DONE
**Impact:** High — 6 ESLint errors, hooks called conditionally after early return
**Effort:** Low — moved 6 useCallback hooks before the early return block
**Files:** `src/components/security-trainer/SecureCodingLab.tsx`

### 5. Accessibility: Add aria-labels to interactive elements
**Impact:** High — screen reader users cannot navigate QuizSystem, SecureCodingLab, CSRFLab
**Effort:** Low — mechanical additions to existing components
**Files:** `src/components/security-trainer/QuizSystem.tsx`, `SecureCodingLab.tsx`, `CSRFLab.tsx`

### 5. Performance: Add React.lazy + Suspense to heavy page components
**Impact:** High — initial bundle is large, Dashboard/QuizSystem/AdvancedAnalytics load eagerly
**Effort:** Medium — wrap 3-5 heaviest components in `React.lazy`
**Files:** `src/app/page.tsx`, `src/components/security-trainer/Dashboard.tsx`

### 6. Security: Validate CSRF token format before comparison
**Impact:** High — malformed tokens could cause timing issues in validation
**Effort:** Low — add hex-string length check in `validateCsrfToken`
**Files:** `src/lib/csrf.ts`

### 7. Code quality: Extract duplicated quiz category matching into shared utility
**Impact:** Medium — `quizCategories.find(c => c.id === qr.quizId)` duplicated in API route and store
**Effort:** Low — one shared function
**Files:** `src/lib/quiz-utils.ts` (new), `src/app/api/route.ts`, `src/lib/store.ts`

### 8. Testing: Add integration test for hint penalty calculation
**Impact:** Medium — `calculateHintPenalty` has no dedicated test
**Effort:** Low — pure function, easy to test
**Files:** `src/lib/hint-system.test.ts` (new)

### 9. UX: Add loading skeleton to Dashboard and ProgressAnalytics
**Impact:** Low-Medium — visual jank on first load
**Effort:** Medium — need skeleton components
**Files:** `src/components/security-trainer/Dashboard.tsx`, `ProgressAnalytics.tsx`

### 10. Docs: Update README with current setup instructions
**Impact:** Low — onboarding docs may reference removed scripts/DB configs
**Effort:** Low — text update
**Files:** `README.md`
