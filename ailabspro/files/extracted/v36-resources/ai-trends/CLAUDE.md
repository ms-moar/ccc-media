# Claude Code Instructions

## Workflow Requirements

### 1. Testing After Implementation

After implementing any feature or change:
- Run `npm run build` to verify the build passes
- Run `npm run lint` if available to check for code quality issues
- Use the **testing-engineer** agent to write and run tests for new functionality
- Use the **security-code-reviewer** agent for any code handling user input, authentication, or sensitive data
- Never consider a task complete until the build passes

### 2. Visual Verification with Chrome

After implementing UI changes:
- Use **Claude Chrome** (browser tool) to verify the functionality works as expected
- Take screenshots to confirm visual appearance matches requirements
- Test interactive elements (buttons, forms, navigation)
- Verify responsive behavior at different viewport sizes
- Check that animations and transitions work correctly

### 3. Git Commit Standards

Commit messages must be:
- **Descriptive**: Explain what changed and why
- **Atomic**: Each commit should represent one logical change
- **Clean**: No debug code, console.logs, or commented-out code

Format:
```
<type>: <short description>

<detailed explanation if needed>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `style`: Formatting, styling changes
- `docs`: Documentation updates
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

Example:
```
feat: add parallax scrolling to landing page hero

- Implement useScroll and useTransform for smooth parallax
- Add spring physics for natural movement
- Hero text and image move at different rates
```

### 4. Document Key Decisions

Record architectural and design decisions in `docs/decisions.md`:
- Why a particular library was chosen
- Trade-offs considered
- Alternative approaches that were rejected
- Breaking changes and migration notes

Format:
```markdown
## [Date] Decision Title

**Context**: Why this decision was needed
**Decision**: What was decided
**Alternatives**: Other options considered
**Consequences**: Impact of this decision
```

### 5. Clean Commits

Before committing:
- Remove all `console.log` statements (unless intentional logging)
- Remove commented-out code
- Remove TODO comments that were addressed
- Ensure no sensitive data (API keys, secrets) is committed
- Run the build to verify nothing is broken
- Stage only relevant files (avoid `git add .` when possible)

### 6. Task Breakdown and Parallel Execution

For any non-trivial task:
1. Break down into smaller, independent subtasks
2. Use **background agents** for tasks that can run in parallel:
   - `testing-engineer` for writing tests
   - `security-code-reviewer` for security audits
   - `tech-debt-refactor` for code quality analysis
   - `performance-optimizer` for performance audits
   - `Explore` agent for codebase research
3. Launch multiple agents simultaneously when tasks are independent
4. Use `run_in_background: true` for long-running operations
5. Continue working on other tasks while background agents complete

Example workflow:
```
User: "Add user profile page with edit functionality"

1. Launch Explore agent (background) - research existing patterns
2. Plan the implementation
3. Implement the feature
4. Launch in parallel:
   - testing-engineer (background) - write tests
   - security-code-reviewer (background) - audit the code
5. Verify build passes
6. Use Chrome to verify UI
7. Commit with descriptive message
8. Document any key decisions
```

## Project-Specific Notes

- This is a Next.js 16 project with App Router
- Uses Tailwind CSS v4 for styling
- Uses Framer Motion for animations
- Authentication via Clerk (configure keys in `.env.local`)
- Design aesthetic: Editorial, minimal, monochrome (see `.claude/agents/frontend-design-specialist.md`)
