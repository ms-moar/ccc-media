# Agent Teams Rules

## When to Use Teams

Use agent teams when work parallelizes across independent files/modules AND agents need to communicate. Use sub-agents for focused independent tasks. Use a single session for sequential same-file work.

## Choosing Teams vs Sub-Agents

- Need 2+ agents talking to each other → team
- Need isolated one-shot work reported back → sub-agent
- 30+ minutes of single-agent work with parallelizable parts → team

## Roles

- **Lead**: creates team, writes tasks, spawns teammates, monitors, synthesizes. NEVER writes source code. May edit shared config files (`package.json`, `tsconfig.json`) and non-code artifacts. Use delegate mode (Shift+Tab).
- **Teammates**: claim tasks, implement, communicate findings, mark complete. NEVER spawn other teammates or expand scope.
- Always refer to teammates by **name**, never agentId.

## Spawning Teammates

When creating teammates with the Task tool, choose `subagent_type` based on the work:

- **`general-purpose`**: full tool access — editing, writing, bash. Use for all implementation work.
- **`Explore`** or **`Plan`**: read-only. Use for research or planning tasks only. Cannot edit files.
- Custom agents in `.claude/agents/` may have restricted tools — check their descriptions.

Always set `team_name` so the teammate joins the team, and `name` for their identity.

## File Ownership

**One file = one agent. No exceptions.** Two agents editing the same file causes silent data loss.

- Every task description MUST include `Files you own: [list]`
- Need a file another agent owns → message them, never edit directly
- Shared config files → lead only or one designated agent
- Ownership ambiguous → stop and ask the lead

## Task Protocol

1. Claim: `TaskUpdate` → `status: "in_progress"`, `owner: your-name`
2. Prefer lowest-ID unblocked task
3. Complete: `TaskUpdate` → `status: "completed"`, then `TaskList` for next work
4. Extra work discovered → `TaskCreate` a new task, don't expand current scope
5. NEVER mark completed if tests fail, implementation is partial, or errors unresolved

## Task Sizing

- One task = one agent, one deliverable, one file set
- Aim for 5–6 tasks per teammate
- Too large = context fills, quality degrades. Too small = coordination overhead exceeds benefit.

## Team Sizing

A good starting point is one teammate per independent module or workstream. Add more as the work demands — there is no hard limit on teammates.

## Task Description Format

```
[Action verb] [specific deliverable].

Files you own: [explicit list]
Files you may read but not edit: [list]

Acceptance criteria:
- [Criterion 1]
- [Criterion 2]

Context: [Background not in CLAUDE.md]
```

Example:

```
Implement the login form with email/password validation.

Files you own: src/components/LoginForm.tsx, src/components/LoginForm.test.tsx
Files you may read but not edit: src/types/auth.ts, src/api/authClient.ts

Acceptance criteria:
- Email format validation with inline error message
- Password minimum 8 characters with inline error message
- Submit button calls AuthService.login() and disables during request
- Shows server-side errors returned from the API

Context: Project uses React Hook Form + Zod for validation (already installed). Auth API base URL is in src/api/authClient.ts.
```

## Communication

- Direct message by name for all normal communication
- Broadcast ONLY for blocking issues affecting the entire team
- On task completion → message lead with summary of changes
- When blocked → message lead immediately with the specific blocker
- Use `TaskUpdate` for status, not JSON messages

## Quality

- Run tests before marking any task completed
- No new lint errors or warnings
- For risky changes (auth, data models, API contracts) → spawn the teammate with `mode: "plan"` so the lead reviews their plan before implementation

## Context

Teammates do NOT share the lead's conversation history. They see: CLAUDE.md, `.claude/rules/*.md`, task descriptions, direct messages, and repo files. Task descriptions are the primary way context reaches teammates — write them thoroughly. Teammates can also message each other directly to share context, coordinate, and fill gaps. If a task is ambiguous → message the lead or a relevant teammate, don't guess.

## Lead Rules

- Wait at least 60 seconds between status checks
- Idle is normal, not an error — sending a message wakes idle teammates
- Check `TaskList` for status, not idle notifications
- If a teammate goes idle with an in_progress task, message them to complete or explain the blocker
- Shut down teammates gracefully (`shutdown_request`) before `TeamDelete`

## Recovery

- **Teammate stuck**: message with guidance → if unresponsive after 2 messages, shut down and replace
- **File conflict**: stop both agents, check git diff, reassign ownership
- **Deadlocked dependency**: check if blocking task was actually marked completed, manually complete if needed
- **After disconnect**: spawn new teammates, check `TaskList` for remaining work (completed tasks persist)

## Workflow Recipes

The `prompts/` folder in the agent-teams resource kit contains reusable patterns. These are not auto-loaded — read them when you need a specific workflow:

| Pattern | File |
|---------|------|
| Reviewer + fixer | `prompts/parallel-code-review.md` |
| Competing debug hypotheses | `prompts/multi-hypothesis-debug.md` |
| Independent module builds | `prompts/parallel-feature-build.md` |
| Advocate / critic / analyst | `prompts/research-perspectives.md` |
| Module-by-module refactor | `prompts/large-refactor.md` |
| Parallel test writing | `prompts/test-coverage-blitz.md` |
