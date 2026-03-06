Create stories from the PRD and Architecture with the following structure:
- Read docs/prd.md and docs/architecture.md
- Generate stories organized for parallel development using Git worktrees
- Use this numbering scheme:
  * Parallel stories: Story 1-1, Story 1-2, Story 1-3 (can be developed simultaneously)
  * Sequential stories: Story 2, Story 3, Story 4 (must be done in order after parallel set)
- For each story include:
  * Story ID (e.g., "Story 1-1" for parallel, "Story 2" for sequential)
  * Worktree branch name (e.g., "feature/story-1-1")
  * Dependencies (which stories must complete first)
  * Parallel-safe indicator (true/false)
  * Module/area of codebase affected (to minimize conflicts)

Structure the output like:
## Parallel Development Set 1 (Can run simultaneously in worktrees)
- Story 1-1: [Feature Name] - Branch: feature/story-1-1
- Story 1-2: [Feature Name] - Branch: feature/story-1-2
- Story 1-3: [Feature Name] - Branch: feature/story-1-3

## Sequential Stories (Must complete after Set 1)
- Story 2: [Feature Name] - Depends on: Stories 1-1, 1-2, 1-3
- Story 3: [Feature Name] - Depends on: Story 2

Note: These stories are designed for parallel execution using Git worktrees where developers will work on non-conflicting modules simultaneously.