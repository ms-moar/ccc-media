# Project Rules (Use Alongside Superpowers Plugin)

## Core Rule
- Use the Superpowers plugin skills for tasks, but **assess before committing to the full workflow**. Not every task warrants the complete process.

## Smart Workflow Decision
Before triggering the Superpowers workflow, evaluate the task:

### Skip or minimize the workflow when:
- **Simple UI changes**: cosmetic tweaks, copy updates, styling adjustments, moving elements around — just do them directly.
- **One-liner fixes**: typos, small bug fixes, config changes, renaming — no brainstorming/planning needed.
- **Straightforward implementations**: if the path is obvious and there's only one reasonable approach, skip brainstorming and go straight to implementation.
- **Non-code tasks**: updating docs, adding comments, writing READMEs — execute directly.
- **TDD is overkill**: UI-only changes, static content, config files, and purely visual work don't need a full TDD cycle. Only use TDD when there's meaningful logic to verify.

### Use the full workflow when:
- **Complex features**: multi-file changes, new systems, architectural decisions.
- **Ambiguous requirements**: the task needs clarification, tradeoff analysis, or has multiple valid approaches.
- **High-risk changes**: touching auth, data models, APIs, or shared infrastructure.
- **Sufficient context exists**: you have enough information about the codebase and requirements to run a productive brainstorm/plan phase.

### When context is insufficient:
- Don't force the workflow — ask the user for clarification first.
- If you'd just be guessing during brainstorming, skip it and ask targeted questions instead.

**Rule of thumb**: Match the weight of the process to the weight of the task. A 2-minute fix doesn't need a 10-minute workflow.

## Context Window Protection
- After any compaction or `/compact`, re-state which Superpowers skill is currently active and what phase the project is in before continuing.
- If the Superpowers session-start instructions are no longer in context, tell the user the plugin was lost during compaction and ask them to restart or re-trigger it.

## Process Shortcuts
- When the user says "just do it" or "skip the process": skip brainstorming and planning entirely.
- When the user says "plan only": run brainstorming and planning, then stop. Do not begin implementation until the user explicitly asks.
- When the user says "implement without the process": execute the plan directly without subagent workflows or review loops.

## Security
- Never commit `.env`, credentials, API keys, or secrets.
