---
name: todo-quality-audit
description: "Read project todo.md, find and fix code quality issues (bugs, security, performance), build+test to verify, commit fixes, update todo.md progress, merge dev→main. Repeat until all issues resolved."
---

# Todo.md Quality Audit Loop

Systematically audit a project's code quality by reading its `todo.md`, finding and fixing issues, verifying with build+test, and tracking progress.

## Procedure

### 1. Reconnaissance
- Read `<project>/todo.md` to understand the current state and pending items
- `git log --oneline -5` to see recent work
- `git status --short` to check for uncommitted changes
- Identify the project's build system (cmake, npm, cargo, etc.)

### 2. Build & Test Baseline
- Run the project's build command (e.g., `cmake --build build_test`, `npm run build`)
- Run the test suite (e.g., `ctest --test-dir build_test`, `npm test`)
- Record pass/fail counts — this is your baseline

### 3. Find Quality Issues
- Read source files systematically, focusing on:
  - Potential bugs (null dereference, overflow, off-by-one, use-after-free)
  - Security issues (buffer overflows, injection, hardcoded secrets)
  - Performance problems (unnecessary copies, missing const ref, N+1 queries)
  - Code smells (dead code, duplicate logic, overly complex functions)
- Use `Grep` to search for common anti-patterns
- Use `Agent` subagent for broad codebase exploration when needed

### 4. Fix Issues (Quality Over Quantity)
- Fix one issue at a time with focused `Edit` calls
- Each fix should be minimal and targeted — don't refactor unrelated code
- Prefer correctness fixes over style changes

### 5. Verify Each Fix
- Rebuild after each fix: `cmake --build build_test` (or equivalent)
- Rerun tests: `ctest --test-dir build_test --output-on-failure`
- If a fix breaks tests, revert and try a different approach

### 6. Commit to Dev
- `git add <fixed_files>`
- `git commit` with a descriptive message explaining what was fixed and why
- `git push origin dev`

### 7. Update Todo.md
- Read todo.md again to find the audit section
- Update it with what was fixed (checkmarks, counts, dates)
- Commit the todo.md update separately: `git add todo.md && git commit -m "docs: update todo.md — <summary>"`

### 8. Merge Dev → Main → Return
```bash
git checkout main && git merge dev --no-edit && git push origin main && git checkout dev
```

### 9. Repeat
- Go back to step 3 and look for more issues
- Stop when: all todo.md items are checked off, or no more issues found, or user says stop

## Rules
- **Quality over quantity** — fix real bugs, not cosmetic nits
- **Don't create documentation without being asked** — only code fixes and todo.md updates
- **Always verify** — never commit without a passing build+test
- **One issue at a time** — don't batch unrelated fixes in one commit

## Stopping Condition
- All items in todo.md audit section are checked off
- Build passes with 0 warnings, all tests green
- No more quality issues found in source review
- User explicitly says to stop
