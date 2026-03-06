# NotebookLM Resource Kit

This project integrates Google NotebookLM with Claude Code via the `nlm` CLI (v0.2.18) and `repomix` (v1.11.1). NotebookLM serves as an external knowledge base for research, debugging, documentation, security auditing, and cross-tool context sharing.

---

## Notebook Registry

Registered notebooks for this project. Update IDs after running init commands.

| Alias | Notebook ID | Purpose |
|---|---|---|
| `second-brain` | `<run /second-brain init>` | Project knowledge base — features, decisions, context |
| `debug-companion` | `<run /debug-companion init>` | Stack-specific debugging patterns and solutions |
| `security-handbook` | `<run /security-audit init>` | OWASP top 10, security best practices for your stack |
| `cross-tool-kb` | `<run /cross-tool-context init>` | Shared context across AI tools (Cursor, Copilot, etc.) |

**Register an alias:** `nlm alias set <alias> <notebook-id> -t notebook`
**List aliases:** `nlm alias list`

---

## NLM CLI Quick Reference

### Notebooks
| Command | Description |
|---|---|
| `nlm notebook create "<name>"` | Create a new notebook |
| `nlm notebook list` | List all notebooks |
| `nlm notebook get <id>` | Get notebook details |
| `nlm notebook describe <id>` | AI-generated summary |
| `nlm notebook query <id> "<question>"` | Ask a question (alias: `nlm query notebook`) |

### Sources
| Command | Description |
|---|---|
| `nlm source add <id> --url <url> -w` | Add website/YouTube, wait for processing |
| `nlm source add <id> --file <path> -w` | Upload local file (PDF, MD, TXT) |
| `nlm source add <id> --text "<content>" --title "<title>" -w` | Add inline text |
| `nlm source add <id> --drive <doc-id> -w` | Add Google Drive doc |
| `nlm source list <id>` | List sources in notebook |
| `nlm source delete <id> <source-id>` | Remove a source |
| `nlm source stale <id>` | Check for stale Drive sources |
| `nlm source sync <id>` | Sync stale sources |

### Notes
| Command | Description |
|---|---|
| `nlm note create <id> -c "<content>" -t "<title>"` | Create a note |
| `nlm note list <id>` | List notes |
| `nlm note update <id> <note-id> -c "<content>"` | Update a note |
| `nlm note delete <id> <note-id>` | Delete a note |

### Query & Research
| Command | Description |
|---|---|
| `nlm query notebook <id> "<question>"` | Query notebook |
| `nlm query notebook <id> "<question>" -s <source-ids>` | Query specific sources |
| `nlm query notebook <id> "<question>" -c <conversation-id>` | Continue conversation |
| `nlm research start "<query>" -n <id> -m fast` | Fast research (~30s, 10 sources) |
| `nlm research start "<query>" -n <id> -m deep` | Deep research (~5min, 40 sources) |
| `nlm research status <id>` | Check research progress |
| `nlm research import -n <id>` | Import discovered sources |

### Visualizations & Artifacts
| Command | Description |
|---|---|
| `nlm mindmap create <id> -t "<title>" -y` | Create mind map |
| `nlm infographic create <id> -y` | Create infographic |
| `nlm slides create <id> -y` | Create slide deck |
| `nlm data-table create <id> -y` | Create data table |
| `nlm report create <id> -f "Briefing Doc" -y` | Create briefing doc |
| `nlm report create <id> -f "Study Guide" -y` | Create study guide |
| `nlm report create <id> -f "Create Your Own" --prompt "<prompt>" -y` | Custom report |
| `nlm audio create <id> -y` | Create podcast-style audio |
| `nlm studio status <id>` | Check artifact generation status |

### Downloads
| Command | Description |
|---|---|
| `nlm download mind-map <id> -o <path>` | Download mind map (JSON) |
| `nlm download report <id> -o <path>` | Download report (MD) |
| `nlm download infographic <id> -o <path>` | Download infographic (PNG) |
| `nlm download slide-deck <id> -o <path>` | Download slides (PDF) |
| `nlm download data-table <id> -o <path>` | Download data table (CSV) |
| `nlm download audio <id> -o <path>` | Download audio (MP3) |

### Sharing
| Command | Description |
|---|---|
| `nlm share public <id>` | Make notebook public |
| `nlm share private <id>` | Make notebook private |
| `nlm share invite <id> --email <email>` | Invite collaborator |
| `nlm share status <id>` | Check sharing status |

### Aliases
| Command | Description |
|---|---|
| `nlm alias set <alias> <id> -t notebook` | Create alias for notebook |
| `nlm alias get <alias>` | Resolve alias to ID |
| `nlm alias list` | List all aliases |
| `nlm alias delete <alias>` | Remove alias |

### Repomix (Codebase Packing)
| Command | Description |
|---|---|
| `repomix <dir> --output <path>` | Pack codebase into single document |
| `repomix <dir> --output <path> --include "src/**"` | Pack specific directories |
| `repomix <dir> --output <path> --ignore "node_modules,dist"` | Exclude patterns |

---

## Automatic Rules

Claude follows these rules without being asked:

### Rule 1: Update Second Brain After Feature Completion
When a feature is completed and the build passes, create a note in `second-brain`:
```
nlm note create second-brain -c "<what was built, key decisions, files changed>" -t "Feature: <name>"
```

### Rule 2: Query Debug Companion Before Web Search
When debugging an error, query `debug-companion` BEFORE searching the web:
```
nlm query notebook debug-companion "<error message or description>"
```
Only proceed to web search if the debug companion has no relevant answer.

### Rule 3: Security Check Before Feature Completion
Before marking any feature as complete, query `security-handbook` for relevant risks:
```
nlm query notebook security-handbook "security risks for <feature description>"
```

### Rule 4: Sync Docs to Cross-Tool KB
When project documentation files change (README, docs/, API specs), sync to `cross-tool-kb`:
```
nlm source add cross-tool-kb --file <changed-file> -w
```

---

## Slash Commands

| Command | Description |
|---|---|
| `/second-brain` | Initialize or update project knowledge base |
| `/research` | Deep research on any topic via NotebookLM |
| `/explain-codebase` | Pack codebase with repomix + visualize architecture |
| `/debug-companion` | Build stack-specific debugging knowledge base |
| `/cross-tool-context` | Create shared notebook for cross-tool AI context |
| `/visualize-docs` | Generate mind maps, infographics, slides from notebook |
| `/security-audit` | Build security handbook + run codebase audit |

---

## File Structure

```
7-notebook-lm/
├── CLAUDE.md                          # This file — core instructions
├── README.md                          # Human-readable quick-start
├── setup.sh                           # Dependency check + auth
├── .claude/
│   ├── settings.json                  # Tool search config
│   ├── commands/                      # 7 slash commands
│   └── skills/notebooklm/            # NLM skill + CLI reference
└── templates/                         # Portable configs + security URLs
```
