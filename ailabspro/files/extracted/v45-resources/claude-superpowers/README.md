# Superpowers Plugin — Resource Pack

Companion resource for the [Superpowers plugin](https://github.com/obra/superpowers).

## Install the Plugin First

```bash
# Claude Code
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
# Restart Claude Code
```

For Cursor, Codex, or OpenCode — see the [plugin repo](https://github.com/obra/superpowers).

## What's Here

**[CLAUDE.md](CLAUDE.md)** — Drop into your project root. Gives the agent instructions the plugin doesn't set: context recovery after compaction, process shortcuts ("just do it" / "plan only" / "implement without the process"), and security rules.

## The One Thing to Know

The plugin is context-hungry. After compaction, Claude may silently forget the plugin and revert to default behavior. The CLAUDE.md tells the agent to self-detect this, but if it starts skipping steps, remind it: "Use the superpowers plugin."

For large projects, split across sessions. Brainstorming + planning produces files in `docs/plans/` that persist. Start the next session with: "Load the plan from docs/plans/[filename].md and execute it."
