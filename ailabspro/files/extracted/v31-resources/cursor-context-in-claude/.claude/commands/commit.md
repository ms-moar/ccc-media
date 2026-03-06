# Git Commit with Validation

Run pre-commit checks and commit changes with a standardized message format.

## Pre-Commit Checklist

Before committing, run these checks in order. Stop and fix issues if any check fails:

### 1. TypeScript Validation
```bash
npx tsc --noEmit
```
Ensure no type errors exist.

### 2. ESLint Check
```bash
npm run lint
```
Fix any linting errors before proceeding.

### 3. Build Validation
```bash
npm run build
```
Ensure the project builds successfully.

### 4. Check for Debug Code
Search for and remove any:
- `console.log` statements (unless intentional)
- `debugger` statements
- Commented-out code blocks

## Commit Message Format

Use this format: `feat-XXX-description-of-change`

Where:
- `feat` = new feature
- `fix` = bug fix
- `refactor` = code refactoring
- `docs` = documentation
- `style` = formatting/styling
- `test` = adding tests
- `chore` = maintenance tasks

**XXX** = ticket/issue number (ask user if not provided)

**Examples:**
- `feat-123-add-user-authentication`
- `fix-456-resolve-login-redirect-issue`
- `refactor-789-simplify-api-handlers`

## Workflow

1. Run all validation checks above
2. If checks pass, show `git status` and `git diff --stat`
3. Ask user for:
   - Commit type (feat/fix/refactor/etc)
   - Ticket number
   - Brief description
4. Stage relevant files with `git add`
5. Commit with formatted message
6. Show final `git log -1` to confirm

## Arguments

$ARGUMENTS - Optional: commit type, ticket number, or description to skip prompts
