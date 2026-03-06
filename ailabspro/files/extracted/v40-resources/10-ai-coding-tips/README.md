# Claude Code Production Workflow Template

A ready-to-use template that encodes 10 battle-tested practices for Claude Code, extracted from daily production usage. Drop this into any project to start every Claude Code session with best practices baked in.

## Quick Start

```bash
# 1. Clone or download this template
git clone <this-repo> claude-code-template
cd claude-code-template

# 2. Install all tools (once per machine)
chmod +x env-setup.sh && ./env-setup.sh

# 3. Copy everything into your project
cp -r .claude/ /path/to/your-project/.claude/
cp CLAUDE.md /path/to/your-project/CLAUDE.md
cp -r templates/ /path/to/your-project/templates/
cp -r hooks/ /path/to/your-project/hooks/
cp -r scripts/ /path/to/your-project/scripts/
cp -r docs/ /path/to/your-project/docs/
cp -r user-stories/ /path/to/your-project/user-stories/
cp env-setup.sh /path/to/your-project/
cp tsconfig.strict.json /path/to/your-project/  # TypeScript projects only

# 4. Start Claude Code and follow the session flow
cd /path/to/your-project && claude
```

> **After copying**, follow the [Recommended Session Flow](#recommended-session-flow) below.
> The `docs/` and `user-stories/` directories contain **fill-in templates** with small examples — the AI agent fills them in for your project using the prompts in `templates/`.

## What's Included

```
.
├── CLAUDE.md                          # Auto-loaded rules for every session
├── env-setup.sh                       # One-command tool installation
├── tsconfig.strict.json               # TypeScript strict mode template
├── .claude/                           # Claude Code configuration (auto-loaded)
│   ├── settings.json                  # Hooks config + MCP Tool Search
│   └── hooks/
│       └── protect-tests.sh           # Blocks test file modification
├── docs/                              # Fill-in templates for project docs (agent fills these in)
│   ├── PRD.md                         # Product Requirements — placeholders + examples
│   ├── architecture.md                # Architecture — placeholders + examples
│   ├── decision.md                    # Decision log — placeholders + examples
│   └── features.json                  # Feature tracker — schema + example entry
├── hooks/                             # Additional hook examples (see note below)
│   ├── pre-commit-lint.sh             # Git hook: lint staged files before commit
│   ├── pre-push-tests.sh              # Git hook: run tests before push
│   └── claude-protect-env.sh          # Claude hook: block editing .env/secret files
├── scripts/                           # Utility scripts
│   ├── worktree-setup.sh              # Create git worktrees for parallel features
│   ├── worktree-cleanup.sh            # Remove worktrees after merge
│   ├── verify-setup.sh                # Check that all tools are installed
│   └── ws-load-test.sh                # Example WebSocket load test
├── templates/
│   ├── context-generation-prompt.md   # Generate PRD, architecture, decisions, features.json
│   ├── user-story-template.md         # Write user stories before implementation
│   ├── reverse-prompt.md              # Pre-deployment failure prediction audit
│   ├── adversarial-agents-prompt.md   # Executor + Verifier agent pattern
│   ├── worktree-parallel-prompt.md    # Parallel feature implementation via git worktrees
│   └── insights-workflow.md           # Turn session insights into CLAUDE.md rules
└── user-stories/                      # Fill-in template for user stories (one per feature)
    └── TEMPLATE.md                    # Story template — placeholders + examples
```

## The 10 Practices

| # | Practice | Implemented As |
|---|----------|---------------|
| 1 | Session insights feedback loop | `templates/insights-workflow.md` |
| 2 | Structured context provision | `templates/context-generation-prompt.md` |
| 3 | Live library docs via Context7 MCP | `env-setup.sh` (configures MCPs automatically) |
| 4 | Exit code 2 hooks for guardrails | `.claude/hooks/protect-tests.sh` |
| 5 | MCP Tool Search to reduce context bloat | `.claude/settings.json` (`ENABLE_TOOL_SEARCH`) |
| 6 | Git worktrees for parallel agents | `templates/worktree-parallel-prompt.md` + `scripts/worktree-*.sh` |
| 7 | TypeScript strict mode | `tsconfig.strict.json` |
| 8 | Scenario-based testing with user stories | `templates/user-story-template.md` + `user-stories/TEMPLATE.md` |
| 9 | Adversarial parallel agents | `templates/adversarial-agents-prompt.md` |
| 10 | Agent verification + reverse prompting | `templates/reverse-prompt.md` + `CLAUDE.md` |

## Hook Directories

This template has **two** hook directories — they serve different purposes:

| Directory | Purpose | Used by |
|-----------|---------|---------|
| `.claude/hooks/` | Claude Code pre-tool-use hooks. Loaded automatically by Claude Code via `.claude/settings.json`. | Claude Code agent |
| `hooks/` | Git hooks and additional Claude hook examples. Copy these into your `.git/hooks/` or add to `.claude/settings.json` as needed. | Git / optional |

- `.claude/hooks/protect-tests.sh` runs automatically — it prevents Claude from editing test files
- `hooks/claude-protect-env.sh` is also configured in `.claude/settings.json` — it prevents Claude from editing `.env` and secret files
- `hooks/pre-commit-lint.sh` and `hooks/pre-push-tests.sh` are standard git hooks — copy them into `.git/hooks/` or use with [Husky](https://typicode.github.io/husky/)

## Recommended Session Flow

1. **Setup** — Run `env-setup.sh` (once per machine)
2. **Context** — Fill in the templates in `docs/` with your project details using the prompt in `templates/context-generation-prompt.md`
3. **Stories** — Generate user stories from `user-stories/TEMPLATE.md` using the prompt in `templates/user-story-template.md`
4. **Implement** — Follow stories one by one, or parallelize with `scripts/worktree-setup.sh`
5. **Verify** — Use Agent Browser / Puppeteer for UI verification, or `scripts/verify-setup.sh` to check tool installation
6. **Audit** — Run the prompt in `templates/reverse-prompt.md` before deployment
7. **Learn** — Run `/insights`, add rules to CLAUDE.md (see `templates/insights-workflow.md`)
