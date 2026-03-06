---
name: notebooklm
description: Manages NotebookLM notebooks as external knowledge bases via the nlm CLI. Handles queries, source management, research, and artifact generation.
---

# NotebookLM Skill

This skill activates when Claude needs to interact with NotebookLM notebooks.

## Trigger Conditions

- User mentions "knowledge base", "notebook", "NLM", or "NotebookLM"
- User asks to query, research, or look something up in project context
- Automatic rules from CLAUDE.md fire (feature completion, debugging, security check, doc sync)
- User references a registered notebook alias (second-brain, debug-companion, security-handbook, cross-tool-kb)

## Workflow

1. **Identify target notebook** — Check the Notebook Registry in CLAUDE.md for the appropriate alias
2. **Determine operation** — Map user intent to the correct `nlm` command
3. **Execute** — Run the command, handle errors (auth, missing notebook, processing delays)
4. **Report** — Summarize results to the user

## Intent-to-Command Mapping

| User Intent | Command |
|---|---|
| "What does the knowledge base say about X?" | `nlm query notebook <alias> "<question>"` |
| "Add this to the knowledge base" | `nlm note create <alias> -c "<content>" -t "<title>"` |
| "Add this URL/file as a source" | `nlm source add <alias> --url/--file <target> -w` |
| "Research X for me" | `nlm research start "<query>" -n <alias> -m deep` |
| "Create a mind map / infographic / slides" | `nlm mindmap/infographic/slides create <alias> -y` |
| "Generate a report on this" | `nlm report create <alias> -f "Briefing Doc" -y` |
| "Download the mind map / report" | `nlm download mind-map/report <alias> -o <path>` |
| "Share the notebook" | `nlm share public <alias>` |
| "What sources are in the notebook?" | `nlm source list <alias>` |
| "Summarize the notebook" | `nlm notebook describe <alias>` |

## Error Handling

- **Auth expired:** Run `nlm login --check`. If failed, prompt user to run `nlm login`.
- **Notebook not found:** Check `nlm alias list`. If alias missing, suggest running the init command.
- **Source still processing:** Wait and retry with `nlm source list <id>` to check status.
- **Research in progress:** Poll `nlm research status <id>` until complete.

## Reference

See `references/nlm-cli-reference.md` for the full CLI command reference with all flags and options.
