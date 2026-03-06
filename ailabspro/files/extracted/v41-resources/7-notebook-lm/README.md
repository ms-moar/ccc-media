# NotebookLM Resource Kit for AI-Assisted Development

Use Google NotebookLM as an external knowledge base for Claude Code. This kit provides 7 workflows for research, debugging, documentation, security auditing, and cross-tool context sharing — all powered by the `nlm` CLI.

## Prerequisites

- **nlm** v0.2.18+ — NotebookLM CLI (`uv tool install notebooklm-mcp-cli` or `pip install notebooklm-mcp-cli`) — [GitHub](https://github.com/jacob-bd/notebooklm-mcp-cli)
- **repomix** v1.11.1+ — Codebase-to-document converter (`npm install -g repomix`)
- **Claude Code** — Anthropic's CLI for Claude

## Quick Start

```bash
# 1. Run setup to verify dependencies
chmod +x setup.sh && ./setup.sh

# 2. Create your project knowledge base
/second-brain init

# 3. You're ready — try any of the 7 workflows below
```

## The 7 Workflows

### 1. `/second-brain` — Project Knowledge Base
Build a living knowledge base that captures features, decisions, and context as you develop. Claude automatically updates it after completing features.

```
/second-brain init          # Create and populate the knowledge base
/second-brain <update>      # Add specific context or recent changes
```

### 2. `/research` — Deep Research
Research any topic using NotebookLM's deep research engine. Discovers 40+ sources, imports them, and generates a briefing document.

```
/research how to implement WebSocket authentication in Node.js
```

### 3. `/explain-codebase` — Codebase Visualization
Pack any codebase with repomix, upload to NotebookLM, and generate architecture mind maps and infographics.

```
/explain-codebase .                              # Current directory
/explain-codebase /path/to/project               # Local project
/explain-codebase https://github.com/user/repo   # GitHub repo
```

### 4. `/debug-companion` — Debugging Knowledge Base
Auto-detects your tech stack and builds a debugging companion loaded with stack-specific patterns, common errors, and solutions.

```
/debug-companion init                                    # Build the companion
/debug-companion "TypeError: Cannot read property of undefined"  # Query it
```

### 5. `/cross-tool-context` — Shared AI Context
Create a publicly shared notebook so any AI tool (Cursor, Copilot, ChatGPT) can access your project context.

```
/cross-tool-context init    # Create and share the notebook
/cross-tool-context sync    # Sync recent doc changes
```

### 6. `/visualize-docs` — Visual Artifacts
Generate mind maps, infographics, slide decks, data tables, and reports from any notebook.

```
/visualize-docs second-brain all         # All artifact types
/visualize-docs second-brain mindmap     # Just the mind map
/visualize-docs second-brain slides      # Just the slide deck
```

### 7. `/security-audit` — Security Handbook + Audit
Build a security knowledge base from OWASP resources, then audit your codebase against it.

```
/security-audit init     # Build the security handbook
/security-audit audit    # Run a full codebase audit
```

## Automatic Behaviors

Once notebooks are initialized, Claude automatically:

1. **Updates second-brain** after completing features (build passes)
2. **Queries debug-companion** before web searching when debugging
3. **Checks security-handbook** before marking features complete
4. **Syncs cross-tool-kb** when project docs change

## File Structure

```
7-notebook-lm/
├── CLAUDE.md                          # Core instructions + CLI reference + registry
├── README.md                          # This file
├── setup.sh                           # Dependency check + auth verification
├── .claude/
│   ├── settings.json                  # Permission config
│   ├── commands/
│   │   ├── second-brain.md            # Workflow 1: Project knowledge base
│   │   ├── research.md                # Workflow 2: Deep research
│   │   ├── explain-codebase.md        # Workflow 3: Codebase visualization
│   │   ├── debug-companion.md         # Workflow 4: Debugging companion
│   │   ├── cross-tool-context.md      # Workflow 5: Cross-tool context
│   │   ├── visualize-docs.md          # Workflow 6: Visual artifacts
│   │   └── security-audit.md          # Workflow 7: Security audit
│   └── skills/
│       └── notebooklm/
│           ├── SKILL.md               # Auto-triggering NLM skill
│           └── references/
│               └── nlm-cli-reference.md   # Full CLI command reference
└── templates/
    ├── notebook-config.md             # Portable CLAUDE.md snippet
    └── security-sources.md            # Curated security URLs by stack
```

## Customization

### Add notebooks to the registry
Edit the Notebook Registry table in `CLAUDE.md` to add custom notebooks.

### Add security sources
Edit `templates/security-sources.md` to add URLs for your specific tech stack.

### Use in other projects
Copy `templates/notebook-config.md` content into any project's `CLAUDE.md` to enable NotebookLM integration there.

### Change automatic rules
Edit the "Automatic Rules" section in `CLAUDE.md` to customize when Claude interacts with notebooks.
