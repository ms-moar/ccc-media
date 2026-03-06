---
name: code-refactor
description: This skill should be used when analyzing, reviewing, or refactoring TypeScript/JavaScript code. It triggers automatically when the user asks to improve code quality, fix code smells, modernize syntax, optimize performance, or apply clean code principles. Covers SOLID principles, DRY, naming conventions, performance optimization, and modern ES/TS patterns.
---

# Code Refactor

## Overview

Analyze and refactor TypeScript/JavaScript code to improve quality, maintainability, and performance. Apply clean code principles, modern patterns, and best practices systematically.

## When This Skill Triggers

- User asks to "refactor", "clean up", "improve", or "optimize" code
- Code review requests mentioning quality or maintainability
- Requests to modernize legacy JavaScript/TypeScript
- Performance improvement requests for JS/TS code
- Requests to apply SOLID, DRY, or clean code principles

## Refactoring Workflow

### Step 1: Analyze Current Code

Before making changes, assess the code:

1. Read the target file(s) completely
2. Identify code smells and issues using the checklist in `references/refactoring-patterns.md`
3. Note dependencies and potential breaking changes
4. Determine refactoring priority (high-impact, low-risk first)

### Step 2: Report Findings

Present findings to user before refactoring:

```
## Code Analysis: [filename]

### Issues Found
- [Category]: [Specific issue] (Line X)
- ...

### Recommended Refactoring
1. [Priority 1]: [What to change] - [Why]
2. [Priority 2]: [What to change] - [Why]

### Risk Assessment
- Breaking changes: [Yes/No - details]
- Test coverage needed: [Specific areas]
```

### Step 3: Apply Refactoring

Apply changes incrementally:

1. Make one logical change at a time
2. Preserve existing behavior (unless bug fixing)
3. Maintain or improve type safety
4. Keep changes minimal and focused

### Step 4: Verify Changes

After refactoring:

1. Ensure no TypeScript errors introduced
2. Run existing tests if available: `npm test` or `yarn test`
3. Verify exports and public API unchanged (unless intentional)

## Refactoring Categories

### Clean Code Principles

**Single Responsibility**
- Functions do one thing
- Classes have one reason to change
- Modules have focused purpose

**Naming**
- Variables: descriptive nouns (`userProfile`, not `data`)
- Functions: verb phrases (`fetchUserData`, not `userData`)
- Booleans: question form (`isActive`, `hasPermission`, `canEdit`)
- Constants: SCREAMING_SNAKE_CASE for true constants

**Function Design**
- Max 3 parameters (use object for more)
- Early returns over nested conditionals
- Avoid side effects in pure functions
- Max ~20 lines per function

### Performance Optimization

**React-Specific**
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passed to children
- Use `React.memo` for pure components receiving stable props
- Avoid inline object/array creation in JSX

**General JavaScript**
- Prefer `Map`/`Set` for frequent lookups over arrays
- Use `for...of` or array methods over `for...in`
- Avoid unnecessary object spreading in loops
- Debounce/throttle expensive event handlers

### Modernization

**Syntax Updates**
- `const`/`let` over `var`
- Arrow functions for callbacks
- Template literals over string concatenation
- Destructuring for object/array access
- Optional chaining (`?.`) and nullish coalescing (`??`)
- `async`/`await` over `.then()` chains

**Pattern Updates**
- Named exports over default exports
- ESM imports over CommonJS require
- TypeScript strict mode patterns
- Modern React hooks over class components

## Quick Reference Commands

```bash
# Find long functions (potential refactor targets)
grep -n "function\|=>" [file] | head -20

# Find TODO/FIXME comments
grep -rn "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx"

# Check for any type usage
grep -rn ": any" --include="*.ts" --include="*.tsx"

# Find console.log statements
grep -rn "console.log" --include="*.ts" --include="*.tsx"
```

## Resources

Detailed refactoring patterns and examples are in `references/refactoring-patterns.md`. Consult this file for:

- Complete code smell checklist
- Before/after refactoring examples
- TypeScript-specific patterns
- React component patterns
