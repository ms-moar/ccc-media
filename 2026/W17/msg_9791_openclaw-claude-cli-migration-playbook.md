# OpenClaw → Claude CLI Backend Migration Playbook

A self-contained, agent-executable runbook for moving an OpenClaw gateway off Anthropic API keys / OAuth access tokens onto the **bundled `claude-cli` backend** (Anthropic Max / Pro / Team / Enterprise subscription reuse via the `claude` binary).

Written 2026-04-21. Everything below is generalized — nothing references a specific host, user, or agent fleet. Substitute `<host>`, `<user>`, and agent IDs where indicated.

> **Audience.** A DevOps agent (or human operator) asked to either (a) perform the migration end-to-end on a working OpenClaw gateway, or (b) audit a gateway already on the cli backend and fix drift.
>
> **Reading order.** §0 → §1 → §2. §3 is a migration-executor script. §4 is hardening. §5 is troubleshooting. §6 is the gotcha catalogue — read first if you're auditing a running system.
>
> **Time.** Migration: 20–40 min wall clock. Hardening: additional 30 min. Dry-audit only: 5 min.

---

## §0 — Concepts & terminology

- **OpenClaw gateway**: the long-running `openclaw-gateway` node process (usually a `systemctl --user` service) that owns sessions, routes channel messages, and calls LLMs.
- **Backends** = how OpenClaw reaches a model. Relevant ones:
  - `anthropic` (API key or OAuth access-token) — direct HTTP to Anthropic.
  - `claude-cli` — OpenClaw spawns the `claude` binary as a subprocess per turn and streams back its `stream-json` output.
- **`claude` binary**: Anthropic's official Claude Code CLI (`@anthropic-ai/claude-code` on npm). Reads credentials from `~/.claude/.credentials.json` after `claude /login` or from `CLAUDE_CODE_OAUTH_TOKEN` env var after `claude setup-token`.
- **Subscription path**: using a Max/Pro/Team/Enterprise login instead of API-keyed Anthropic credit. Billed per-subscription, rate-limited per-subscription window, NOT visible in the Anthropic Console usage dashboard.
- **LCM / lossless-claw**: an OpenClaw plugin that replaces sliding-window compaction with a DAG of summaries. Has its own `summaryModel` config that must be kept in sync with the backend switch.
- **Well-known profile id**: `anthropic:claude-cli` — OpenClaw auto-synthesizes this once `claude` is logged in; you only need to reference it in your model config.
- **Session ID drift**: each turn, OpenClaw binds its own session UUID to a claude-cli session UUID (`~/.claude/projects/<workspace>/<uuid>.jsonl`). If these get out of sync the agent replays stale history.

---

## §1 — Prerequisites (read-only)

Before touching anything, confirm the target system meets these preconditions. Fail fast if not.

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Host user has `systemctl --user` access | `systemctl --user is-active openclaw-gateway.service` | `active` |
| 2 | Node.js ≥ 22.14 or Node 24 | `node --version` | `v22.14.x` or newer |
| 3 | OpenClaw version ≥ 2026.2.23 (CVE-2026-25253 patched) | `openclaw --version` | `>= 2026.2.23` |
| 4 | You have owner access to an Anthropic Max/Pro/Team plan | verify in Anthropic Console | account logged in to `claude.ai` |
| 5 | Gateway config readable | `jq . ~/.openclaw/openclaw.json | head` | parses cleanly |
| 6 | At least 100MB free disk for fresh claude-cli credentials, plugin dirs, and session files | `df -h $HOME` | > 100MB free |
| 7 | No concurrent claude-cli migration in progress elsewhere for the same Anthropic account | check with operator | |

> ⚠️ **Policy gate.** Anthropic re-sanctioned CLI reuse in 2026 ("Anthropic staff told us OpenClaw-style Claude CLI usage is allowed again"). But the stance is conditional on no future policy change. If your org requires contractually-guaranteed commercial terms, prefer API key billing instead.

---

## §2 — Pre-flight audit (read-only)

Run these before any mutation to know what you're walking into. Capture output to a scratch file; the agent executing §3 will diff against it later.

```bash
# --- Config state ---
jq '{
  version: .meta.lastTouchedVersion,
  auth_profiles: (.auth.profiles | to_entries | map({key, provider: .value.provider, mode: .value.mode})),
  default_model: .agents.defaults.model,
  compaction_model: .agents.defaults.compaction.model,
  fallbacks: .agents.defaults.model.fallbacks,
  list: (.agents.list | map({id, model, heartbeat})),
  telegram_accounts: (.channels.telegram.accounts // {} | to_entries | map({agent: .key, dmPolicy: .value.dmPolicy, allowFrom: .value.allowFrom})),
  plugins_allow: .plugins.allow,
  lossless_claw: .plugins.entries["lossless-claw"].config,
  memory_recall_enabled: .plugins.entries["memory-recall"].enabled
}' ~/.openclaw/openclaw.json

# --- Per-agent auth files (token residue?) ---
for f in ~/.openclaw/agents/*/agent/auth-profiles.json; do
  echo "=== $(basename $(dirname $(dirname $f))) ==="
  jq '{profiles: (.profiles | keys), lastGood}' "$f"
done

# --- Is claude binary already installed? ---
which claude && claude --version || echo "claude not installed"
test -f ~/.claude/.credentials.json && echo "creds present ($(stat -c %s ~/.claude/.credentials.json) bytes)"

# --- Is there an orphan /login process? ---
ps -eo etime,pid,cmd | grep "claude /login" | grep -v grep

# --- Anything stale on disk? ---
du -sh ~/.openclaw/lcm.db ~/.openclaw/extensions/*/`*.db` 2>/dev/null

# --- Service config sanity ---
systemctl --user cat openclaw-gateway.service | head -60
openclaw doctor --non-interactive 2>&1 | tail -40
openclaw security audit 2>&1 | tail -30   # modern openclaw only
```

Save the output. It's your rollback reference.

### Decision tree after the audit

- **If any `anthropic/*` or `sk-ant-oat01-*` token is present**: this is a true migration. Proceed to §3.
- **If model is already `claude-cli/*` but there are still `sk-ant-oat01-*` tokens in per-agent `auth-profiles.json`**: you're half-migrated. Skip to §3 Phase D (token removal) and then §4.
- **If model is `claude-cli/*` and no `sk-ant-oat01-*`**: this is an audit-only pass. Skip to §4 and §5.

---

## §3 — Migration procedure

Five phases. Each phase is reversible up to and including phase D. After phase E (harden) the system is final.

### Phase A — Backup & install (safe)

```bash
# Snapshot everything we might touch
BACKUP=~/backups/openclaw-cli-migration-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP"
cp ~/.openclaw/openclaw.json "$BACKUP/openclaw.json"
tar czf "$BACKUP/agents.tar.gz" -C ~/.openclaw agents

# Install claude binary (Node package, global)
npm install -g @anthropic-ai/claude-code
# On systems where the target user doesn't own /usr/lib/node_modules
# (e.g., a service-account user running against system-Node), this will
# fail with EACCES. Retry with sudo:
#   sudo npm install -g @anthropic-ai/claude-code
# NVM-based installs typically do NOT need sudo.
which claude && claude --version   # must print a version
```

### Phase B — Authenticate

Two options. **Option 2 is strongly preferred for production / multi-agent systems** because it sidesteps the headless refresh race.

#### Option 1 (simple, fragile): interactive `auth login`

Run once on the target host, with SSH TTY:

```bash
claude auth login
```

**Do NOT confuse with `claude /login`.** `/login` is a *slash-command inside an interactive claude session* — running it as `claude /login` from a shell starts an interactive REPL that renders a URL but gives no place to paste the code back. Use `claude auth login` (the proper CLI subcommand) for headless/SSH flows; it prints a URL you open in any browser on any device, you approve, it auto-writes `~/.claude/.credentials.json` via the OAuth callback. No code-paste step needed.

> **macOS credential storage surprise.** On macOS, `claude auth login` writes credentials to the system Keychain, NOT to `~/.claude/.credentials.json`. This breaks the "log in on Mac, then `scp` the file to the server" workflow many operators reach for first. Solutions:
> 1. Run `claude auth login` *directly on the target host via SSH* (recommended for headless Linux — the OAuth callback works across devices).
> 2. Use Option 2 (`claude setup-token`) — it returns a token string you can transport however you like, and it's the recommended path for multi-agent systems anyway.

Writes `~/.claude/.credentials.json` on the target. Works but has two known bugs:

- **Issue #24317** — concurrent subprocesses race the single-use refresh token → intermittent 401s once you have more than ~2 parallel claude invocations.
- **Issue #28827** — non-interactive `-p` invocations don't always refresh the access token before expiry → 401s after ~10–15 min of idle.

For any gateway with `maxConcurrent > 2`, this is a ticking time bomb. Acceptable for small personal setups, not for multi-agent fleets.

#### Option 2 (robust, recommended): long-lived OAuth token

Run on the *operator's workstation* (needs browser):

```bash
claude setup-token
# prints: Generated token: sk-ant-oat01-... (1-year lifespan)
# Copy and store in your secret manager / 1Password.
```

On the target host:

```bash
cat > ~/.openclaw/.env <<'EOF'
CLAUDE_CODE_OAUTH_TOKEN=<paste-the-token>
EOF
chmod 600 ~/.openclaw/.env
```

Make the gateway service pick it up via an override. For a `systemctl --user` service:

```bash
mkdir -p ~/.config/systemd/user/openclaw-gateway.service.d
cat > ~/.config/systemd/user/openclaw-gateway.service.d/claude-oauth.conf <<'EOF'
[Service]
EnvironmentFile=~/.openclaw/.env
EOF
systemctl --user daemon-reload
```

The `claude` CLI reads `CLAUDE_CODE_OAUTH_TOKEN` when `~/.claude/.credentials.json` is missing (or you can delete it; the env var takes precedence in current versions). Test:

```bash
echo "say only: ok" | claude -p --model sonnet
# Expected output: ok
```

If it fails, the token is wrong or expired. If it succeeds, you now have a stable credential that won't refresh-race.

### Phase C — Wire OpenClaw

Single edit to `~/.openclaw/openclaw.json`. Use `jq` for surgical changes.

```bash
CFG=~/.openclaw/openclaw.json
TMP=$(mktemp)
jq '
  # 1. Register the well-known profile (OpenClaw auto-synthesizes auth from ~/.claude/)
  .auth.profiles["anthropic:claude-cli"] = { provider: "claude-cli", mode: "oauth" }

  # 2. Pin the claude binary path explicitly (avoids PATH drift under systemd)
  | .agents.defaults.cliBackends["claude-cli"] = { command: "/absolute/path/to/claude" }

  # 3. Flip the global default model to claude-cli/<model>
  | .agents.defaults.model.primary = "claude-cli/claude-opus-4-7"

  # 4. Kill stale compaction model refs (critical — they will silently fail)
  | .agents.defaults.compaction.model = "claude-cli/claude-sonnet-4-7"
  | (.plugins.entries["lossless-claw"].config.summaryModel) |= "claude-cli/claude-sonnet-4-7"

  # 5. Re-namespace every per-agent model from anthropic/* to claude-cli/*
  | .agents.list |= map(
      if   .model == "anthropic/claude-opus-4-7"    then .model = "claude-cli/claude-opus-4-7"
      elif .model == "anthropic/claude-opus-4-6"    then .model = "claude-cli/claude-opus-4-7"
      elif .model == "anthropic/claude-sonnet-4-7"  then .model = "claude-cli/claude-sonnet-4-7"
      elif .model == "anthropic/claude-sonnet-4-6"  then .model = "claude-cli/claude-sonnet-4-7"
      else . end)

  # 6. (Optional) drop any fallback pointing at a different provider —
  #    see §6 Gotcha #6 for why silent fallbacks bite.
  | del(.agents.defaults.model.fallbacks)
' "$CFG" > "$TMP" && diff <(jq -S . "$CFG") <(jq -S . "$TMP")
# Review the diff. If it matches expectations:
cp "$CFG" "$CFG.pre-clicutover-$(date +%Y%m%d-%H%M%S)"
mv "$TMP" "$CFG"
systemctl --user restart openclaw-gateway.service
sleep 3 && systemctl --user is-active openclaw-gateway.service
```

Substitute `/absolute/path/to/claude` with the output of `which claude`. Absolute path matters: systemd-user services run with a minimal PATH, and if `claude` is under `~/.nvm/...` it won't be on PATH inside the unit.

### Phase D — Remove old Anthropic credentials

Once the gateway is up with cli backend, purge the legacy tokens so nothing falls back to them.

```bash
# 1. Drop old Anthropic profiles from the global registry, keep codex/other providers.
CFG=~/.openclaw/openclaw.json
jq '.auth.profiles |= with_entries(select(
  .value.provider != "anthropic" or .key == "anthropic:claude-cli"
))' "$CFG" > "$CFG.tmp" && mv "$CFG.tmp" "$CFG"

# 2. Blank the per-agent token files (keep the shell, drop the secrets).
for f in ~/.openclaw/agents/*/agent/auth-profiles.json; do
  cp "$f" "$f.pre-purge"
  printf '{ "version": 1, "profiles": {} }\n' > "$f"
done

systemctl --user restart openclaw-gateway.service
```

Verify nothing breaks: ping each agent via `openclaw agent --agent <id> --message 'reply only PONG' --json --timeout 60` and confirm `result.meta.executionTrace.winnerProvider == "claude-cli"` and `fallbackUsed == false`.

### Phase E — Validate end-to-end

1. `openclaw doctor --non-interactive` — no `ERROR` lines, no `plugin disabled ... but config is present` warnings (delete those config stubs if they exist).
2. `openclaw security audit --deep` — review findings; `--fix` tightens group-open policies + file perms (reversible via your Phase A backup).
3. Send a real message to each connected channel (Telegram/Slack/Discord/etc.) and confirm a conversational reply returns. A short ping like `"ping"` must not trigger any silent sentinel (see §6 Gotcha #1).
4. Inspect the turn report JSON for one agent:
   ```bash
   openclaw agent --agent <id> --message 'reply with only PONG' --json --timeout 120 | jq '{
     provider: .result.meta.systemPromptReport.provider,
     model: .result.meta.systemPromptReport.model,
     fallback: .result.meta.executionTrace.fallbackUsed,
     runner: .result.meta.executionTrace.runner,
     text: .result.payloads[0].text,
     cacheRead: .result.meta.agentMeta.usage.cacheRead,
     cacheWrite: .result.meta.agentMeta.usage.cacheWrite
   }'
   ```
   Expected: `provider: "claude-cli"`, `fallback: false`, `runner: "cli"`, `text: "PONG"`, `cacheRead > 0`, `cacheWrite > 0` (prompt caching is working).
   > ⚠️ The agent's reply text lives at `result.payloads[0].text` (or equivalently `result.meta.finalAssistantVisibleText`). The top-level `result.text` is always `null` on current OpenClaw versions — ignore it. Older snippets that check `.result.text` will misreport success.

---

## §4 — Hardening (post-migration)

Do these after §3 is green.

1. **Kill the dead fallback.** If `agents.defaults.model.fallbacks` still points at a disabled provider (revoked gemini projects are a common trap), delete the key. OpenClaw puts the *whole provider* into cooldown on a 429, so a cross-provider fallback is your only effective backup — and it must actually work or it silently adds ~8 seconds of latency to every failover attempt.
2. **Audit `heartbeat` config on any DM-serving agent.** OpenClaw's system-prompt builder injects *"If the current user message is a heartbeat poll and nothing needs attention, reply exactly: HEARTBEAT_OK"* into every agent with a `heartbeat: { every: ... }` entry in `agents.list`. Agents then classify short DMs like `ping` / `alive?` as polls and emit the silent `HEARTBEAT_OK` sentinel, which OpenClaw swallows. Either remove the `heartbeat` block, or make sure your users know never to DM the agent anything that looks like a poll. (Cron-scheduled morning-checks via `cron`, not heartbeat, are the clean pattern.)
3. **Check `gateway.controlUi.allowInsecureAuth`.** If `true`, the gateway warns "dangerous config flags enabled" every boot. Flip to `false` unless you know you need the insecure auth path.
4. **Lock `plugins.allow`.** OpenClaw warns on plugins loaded "without install/load-path provenance" unless you pin them explicitly. Set `plugins.allow: ["lossless-claw", "telegram", "acpx", ...]` with exact ids for every plugin you rely on.
5. **Back up `~/.claude/`.** The credentials file, sessions, and claude-cli project history live here. Standard `openclaw backup` only covers `~/.openclaw`. Add a tarball of `~/.claude/` (excluding `plugins/marketplaces/*` which is re-downloadable).
6. **Write a rate-limit watch.** Cron (every 15 min) greps journalctl for `429 | rate_limit | cooldown | PERMISSION_DENIED | 401 authentication_error` in the last 15 min window, alerts to Telegram/Slack/email. One week of zero hits ≈ single-seat is fine; any hits are signal to add a second subscription or demote low-traffic agents.
7. **Monitor `lcm.db` growth.** LCM persists every message + every summary. Typical growth: a few MB per agent per day under normal load. Alert if > 2 GB.
8. **Kill orphan `claude /login` processes.** Add `ps -eo etime,cmd | grep "claude /login" | awk '$1 ~ /:[0-9]+$/ { print }'` to your health check — anything > 5 minutes is an abandoned login terminal.

---

## §5 — Troubleshooting cookbook

### Symptom: agent is "typing" on Telegram but never sends a reply

One of:
- **HEARTBEAT_OK trap** — agent has `heartbeat` config; short DMs get classified as polls, silent sentinel is swallowed. Check `~/.claude/projects/<workspace>/<sessionId>.jsonl` — if the last assistant message is literally `"text": "HEARTBEAT_OK"`, that's it.
- **Stale session resume** — OpenClaw's `sessions.json` binds to a `cliSessionBinding.sessionId` that points at an old jsonl with a terminal `"NO_REPLY"` or similar. Fix: delete the offending `agent:<id>:<channel>:<scope>:<chatId>` entry from `~/.openclaw/agents/<id>/sessions/sessions.json` and rename the jsonl to `*.pre-reset`. Restart gateway.

### Symptom: 8-second latency on every Telegram turn, then reply appears

`[agent/embedded] ... provider=gemini` visible in logs → embedded runner fell through to a broken gemini fallback before trying cli. Fix: delete the dead fallback from `agents.defaults.model.fallbacks` (or fix the Google project). Make sure the compaction / summaryModel are also on claude-cli.

### Symptom: `401 authentication_error` intermittently

Subscription OAuth refresh is racing (Issue #24317). Migrate to `CLAUDE_CODE_OAUTH_TOKEN` via `claude setup-token` (§3 Phase B Option 2). This eliminates the refresh cycle entirely.

### Symptom: agent self-reports wrong model ("I'm opus-4.6" when config says 4.7)

Agent reading its own session history, which was stamped with the old model before the migration. Confabulation, not a real downgrade. To fix permanently, reset the session (wipe the `agent:<id>:<channel>:...` entry from `sessions.json` + rename the jsonl); next turn starts clean with the new model.

### Symptom: after migration, agent keeps hitting the OLD provider's errors (401 / quota / billing) even though `openclaw.json` primary is on the new backend

Gotcha #25. The session entry in `~/.openclaw/agents/<agent-id>/sessions/sessions.json` has a pinned `modelProvider` + `model` from before the migration; the gateway resumes with the pin rather than re-resolving from config. The symptom is usually masked by a fallback chain — removing the fallback surfaces it. Diagnose and fix:

```bash
# 1. Confirm the pin on an affected session:
jq '.[] | select(.modelProvider != "<new_provider>") | {modelProvider, model}' \
  ~/.openclaw/agents/<agent-id>/sessions/sessions.json | head

# 2. Sweep all 7 agents (see Gotcha #25 for the idempotent script).
# 3. Restart gateway and retry the affected chat.
```

Operator-side alternative: ask the user to send `/new` in each affected chat to start a fresh session (which will resolve from current config).

### Symptom: logs show `model=<old-model> provider=<old-provider>` but config says otherwise, and no `cli exec:` line appears for that agent's turns

Same root cause as above (Gotcha #25). The tell-tale: `journalctl --user -u openclaw-gateway.service | grep "<agent-id>.*cli exec"` returns nothing for the affected agent even though other agents on the same gateway DO produce `cli exec: provider=claude-cli` lines. That asymmetry means the healthy agents have sessions pinned to the new provider and the sick agent's session is pinned to the old one.

### Symptom: `[tools] tools.allow allowlist contains unknown entries (exec, image, process)`

Workspace or agent config references OpenClaw's legacy native tools that aren't exposed through the claude-cli backend. Agents use Claude Code's own `Bash`, `Read`, `Write`, `Edit`, etc. instead. Rewrite `TOOLS.md` / `agents.list[].tools` to reference the Claude Code tool names. Warning-only, doesn't block turns.

### Symptom: every turn reports `cost: {total: 0}`

Expected on the subscription path. Real dollar cost isn't visible to OpenClaw; check the Anthropic Console weekly. Plan your budget via subscription tier, not per-turn cost.

### Symptom: `Extra usage is required for long context requests`

Default context cap on subscription is 200K. For 1M context you need "Extra Usage" flipped on in your Anthropic account, OR switch to API key billing for long-context jobs.

### Symptom: DMs to the bot are silently ignored

If `dmPolicy: "pairing"` is set and no pairing state exists for the sender, OpenClaw drops the message without logging. Symptoms: no inbound log, no typing indicator. Fix: switch to `dmPolicy: "allowlist"` with `allowFrom: [<user_id_as_integer>]` (integer, not string — the string form silently doesn't match). Or complete a pairing handshake with `openclaw pairing approve`.

### Symptom: `cli session reset: reason=mcp` loop every ~20s

MCP config hash keeps changing (usually because of a plugin hot-reload or flapping env). Check for restart loops in the gateway or plugin reload events. Not fatal but spams cache misses.

### Symptom: `[cron] failed to start: TypeError: Cannot read properties of undefined (reading 'runningAtMs')` right after gateway restart

The internal cron scheduler crashed during its init pass. All gateway-scheduled jobs are dead until fixed (host-crontab is unaffected — different system).

Root cause: `~/.openclaw/cron/jobs.json` contains a job object missing the required `schedule` and/or `state` sub-objects. The scheduler iterates every job at startup and reads `job.state.runningAtMs`; if `state` is undefined on even one job, the whole pass aborts.

Diagnose:
```bash
jq '.jobs | map({id, name, has_schedule: (.schedule != null), has_state: (.state != null)})' ~/.openclaw/cron/jobs.json
```
Any `false` value is the culprit.

Fix (delete the bad job):
```bash
cp ~/.openclaw/cron/jobs.json ~/.openclaw/cron/jobs.json.pre-fix-$(date +%s)
jq '.jobs |= map(select(.id != "<bad-job-id>"))' ~/.openclaw/cron/jobs.json \
  > ~/.openclaw/cron/jobs.json.new
mv ~/.openclaw/cron/jobs.json.new ~/.openclaw/cron/jobs.json
systemctl --user restart openclaw-gateway.service
# Confirm clean:
journalctl --user -u openclaw-gateway.service --since "30 seconds ago" | grep -iE "cron|runningAtMs"
# Should show no `failed to start` line, and the gateway's ready message should list the expected plugins.
```

If you want to keep the job, reshape it to match the schema of a sibling job in the same file (must have `schedule: { kind, expr, tz }` and `state: { ... }` objects, even if empty). Easier to delete and re-create via `openclaw cron create`.

> This bug is pre-existing and triggered by *any* gateway restart, not only by a claude-cli migration. But a migration restart is often when it surfaces. Always inspect `jobs.json` in §2 pre-flight if the target has any history of cron-driven agents.

---

## §6 — Gotcha catalogue (read before you audit)

Quick-lookup index for the traps learned the hard way.

1. **HEARTBEAT_OK silent-sink.** Any agent with `heartbeat: { every: ... }` interprets short user DMs as polls and replies `HEARTBEAT_OK` — OpenClaw swallows that sentinel, user sees nothing. Remove the heartbeat block on DM-serving agents; run morning checks via `cron` instead.
2. **OAuth refresh race (Anthropic Issue #24317).** Concurrent claude-cli subprocesses invalidate each other's refresh tokens → intermittent 401s. Prefer `CLAUDE_CODE_OAUTH_TOKEN` for any `maxConcurrent > 2`.
3. **Headless OAuth expiry (Anthropic Issue #28827).** `claude -p` doesn't reliably refresh access tokens; they expire ~10-15 min. Same fix: long-lived token via `setup-token`.
4. **Session-ID drift.** OpenClaw's `sessions.json` binds to a claude-cli session UUID under `~/.claude/projects/<workspace>/<uuid>.jsonl`. If they get out of sync — e.g., after a partial rollback — the agent resumes stale history. Resetting a session means removing *both* sides.
5. **Compaction / summary model left on `anthropic/*`.** After you migrate the agent models to `claude-cli/*`, LCM's `summaryModel` and `agents.defaults.compaction.model` are the silent hold-outs. Symptom: every turn triggers an embedded-runner fallthrough to whatever your cross-provider fallback is (gemini, etc.), which is usually dead. Must flip these to `claude-cli/<cheaper-model>`.
6. **Provider cooldown on 429 blocks *all* models of that provider.** If opus-4-7 rate-limits, sonnet-4-7 and haiku on the same claude-cli provider are also blocked. Your fallback must be a *different provider* to matter — if you only have claude-cli registered, there is no effective graceful degradation. Decide: accept explicit rate-limit errors, or register a second provider.
7. **Orphan `claude /login`.** If an interactive `/login` SSH session was left running, it holds a process for hours/days and can interfere with concurrent logins or refresh. Kill anything > 5 min old.
8. **`dmPolicy: "pairing"` silently drops DMs.** No pairing → no log, no typing indicator, no reply. Switch to `allowlist` with integer user IDs for predictable behavior.
9. **`allowFrom` type mismatch.** Integer vs string. OpenClaw stores user IDs as integers; some configs end up with strings and silently fail to match. Always integer.
10. **`bundleMcp: true` means tools come via MCP bridge.** OpenClaw's own `exec` / `image` / `process` core tools are NOT available to a claude-cli agent. Tools are exposed instead as MCP tools via a temporary `--mcp-config` file. Agents see Claude Code's native `Bash`, `Read`, `Write`, `Edit`, `Grep`, `Glob`, `Task`, plus any MCP you wire. Rewrite workspace `TOOLS.md` accordingly.
11. **Skills delivered via `--plugin-dir`.** OpenClaw packages the eligible skills into a temp plugin dir and mounts it to claude-cli. Skills that depend on OpenClaw's legacy tool names won't work.
12. **`cost: 0` on every turn.** The subscription path doesn't surface dollar cost to OpenClaw. Plan budget by subscription tier; monitor Anthropic Console separately.
13. **1M context NOT default.** 200K cap unless Extra Usage is enabled (API key or Claude-login with Extra Usage) or you're on an eligible subscription tier. Long conversations will compact more aggressively than on API-key mode.
14. **Agent confabulates its model number** when session history was stamped with the old model. Not a real downgrade — but confusing. Reset the session to flush.
15. **`memory-recall` / other plugins disabled-but-configured.** `enabled: false` with the config block still present triggers `plugin disabled (disabled in config) but config is present` every boot. Delete the block entirely or re-enable.
16. **`gateway.controlUi.allowInsecureAuth: true`** on a host you reach over Tailscale / VPN is usually fine — but the gateway still logs "dangerous config flags" at boot. Flip if not needed.
17. **`claude -p` default already has `--permission-mode bypassPermissions` in the bundled backend.** Look inside `cli-backend-*.js` in your OpenClaw install to confirm the flag is passed. If you see `"This command requires approval"` in the agent's reply text, the agent is *describing* what it thinks is happening, not what claude-cli is actually enforcing — check real Bash invocations work.
18. **LCM database size.** `~/.openclaw/lcm.db` grows linearly with turns. Typical: tens of MB per active agent per month. Monitor and archive.
19. **`serialize: true` on the cli backend** means same-provider runs are ordered. With 7+ agents on one subscription, effective concurrency is constrained by both OpenClaw's `maxConcurrent` and Anthropic's per-subscription concurrency limits. Expect cross-agent cascades on bursty load.
20. **Prompt caching IS working on claude-cli.** Verify via turn-report `usage.cacheRead` > 0 and `usage.cacheWrite` > 0. If those are zero, something is wrong with how your system prompt is being built (likely you're re-generating it every turn instead of reusing).
21. **`cron/jobs.json` malformed entries crash the scheduler on every restart.** Unrelated to the migration itself, but a claude-cli cutover requires at least one gateway restart, which triggers the crash for anyone carrying a legacy bad job. Symptom is `[cron] failed to start: TypeError: Cannot read properties of undefined (reading 'runningAtMs')` — see §5 for the fix. Always include `jq '.jobs | map({id, has_schedule: (.schedule != null), has_state: (.state != null)})' ~/.openclaw/cron/jobs.json` in your §2 pre-flight audit to catch this *before* you restart.
22. **Stale workspace persona files actively mislead the post-migration agent.** Every turn the gateway injects `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `TOOLS.md`, `HEARTBEAT.md`, `MEMORY.md` (and others) from the agent's workspace into the system prompt. If these files document capabilities your migration just removed (e.g., Surf/x402 tool blocks in `TOOLS.md`, wallet-flavored rules in `AGENTS.md`, a whole `WALLET.md`), the agent will happily try to use them — and fail opaquely. Always grep the workspace after a capability-removing migration:
    ```bash
    grep -rniE "x402|surf|openrouter|minimax|<old_provider>" ~/.openclaw/workspace-<agent>/*.md
    ```
    and surface hits to the operator. Do NOT auto-rewrite persona text — that's a voice/character decision, not a mechanical migration fix. But *flagging* is mandatory.
23. **Macos Keychain stores credentials, not `~/.claude/.credentials.json`.** `claude auth login` on macOS writes to the system Keychain; there is no file to `scp`. Either log in directly on the Linux target (OAuth callback works cross-device) or use `claude setup-token` and transport the printed token string via your secret manager. The "log in on workstation, copy file to server" workflow *does* work if your workstation is Linux (and other Linux-desktop setups depending on distro), but assume it does not work for macOS operators.
24. **Disabling a plugin leaves `plugin disabled (disabled in config) but config is present` warnings at every boot.** If you flipped `enabled: false` to turn off a provider plugin during migration (e.g., `openrouter`, `minimax`, `openclaw-agentbox`) but left the `config` block in place, the gateway grumbles on every start. Delete the entry entirely (not just `enabled`) once you're confident you won't revert, or accept the noise.
25. **Sessions pin `modelProvider` and `model` — a config change does NOT retroactively migrate existing sessions.** Each session entry in `~/.openclaw/agents/<agent-id>/sessions/sessions.json` carries a `modelProvider` and `model` field stamped from the turn that created/last-ran that session. The gateway resumes with the pinned values rather than re-resolving from `agents.defaults.model.primary`. So after you flip `primary` to `claude-cli/<model>`, every pre-existing session keeps calling whatever provider it was pinned to (commonly `anthropic/claude-opus-4-X` from before the migration). Symptoms: turns continue to hit the old provider's quota / credentials even though `openclaw.json` and per-agent `models.json` are clean; the old fallback chain silently masks this by succeeding on the secondary model; once you remove the fallback (Gotcha #6 hardening), the stale-provider error surfaces to the user. Fix: after the migration restart, sweep all `sessions.json` files and rewrite stale `modelProvider` + `model` to the new backend. Alternative per-chat fix: the user sends `/new` in the channel to start a fresh session, which resolves from current config. A DevOps-agent-safe sweep (idempotent, backs up each file first):
    ```bash
    python3 <<'PY'
    import json, shutil, time, os, glob
    NEW_PROVIDER = "claude-cli"
    NEW_MODEL    = "claude-opus-4-7"   # without provider prefix
    STALE_PROVIDERS = {"anthropic", "openrouter", "openai", "gemini"}  # adjust
    ts = time.strftime("%Y%m%d-%H%M%S")
    total = 0
    for p in glob.glob(os.path.expanduser("~/.openclaw/agents/*/sessions/sessions.json")):
        shutil.copy2(p, f"{p}.pre-sessionpin-{ts}")
        with open(p) as f: s = json.load(f)
        patched = 0
        for v in s.values():
            if v.get("modelProvider") in STALE_PROVIDERS:
                v["modelProvider"] = NEW_PROVIDER
                v["model"]         = NEW_MODEL
                patched += 1
        with open(f"{p}.new", "w") as f: json.dump(s, f, indent=2)
        os.replace(f"{p}.new", p)
        print(f"{p}: patched {patched}")
        total += patched
    print(f"total: {total}")
    PY
    systemctl --user restart openclaw-gateway.service
    ```
    Distinct from Gotcha #4 (which is about `cliSessionBindings.sessionId` drift between OpenClaw and the claude-cli jsonl files) and from Gotcha #14 (which is the agent *confabulating* its model from stamped history text, with no functional impact). Gotcha #25 is a real functional redirect: the pinned provider is actually called.

---

## §7 — One-shot audit snippet (for a DevOps agent)

If you just want to know whether an existing gateway is healthy on cli mode, run this and read the output. No mutations.

```bash
#!/usr/bin/env bash
# audit-claude-cli.sh — read-only audit of an OpenClaw gateway on cli backend
set -uo pipefail

CFG=${OPENCLAW_CONFIG:-~/.openclaw/openclaw.json}
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'
ok()   { echo -e " ${GREEN}✓${NC} $*"; }
fail() { echo -e " ${RED}✗${NC} $*"; }
warn() { echo -e " ${YELLOW}!${NC} $*"; }

# 1. claude binary
which claude >/dev/null 2>&1 && ok "claude: $(claude --version | head -1)" || fail "claude not on PATH"

# 2. credentials
if [[ -f "${HOME}/.claude/.credentials.json" ]]; then ok "~/.claude/.credentials.json present ($(stat -c %s "${HOME}/.claude/.credentials.json") bytes, mtime $(stat -c %y "${HOME}/.claude/.credentials.json" | cut -d' ' -f1))"
elif [[ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]]; then ok "CLAUDE_CODE_OAUTH_TOKEN env var set"
else fail "No claude credentials (neither ~/.claude/.credentials.json nor CLAUDE_CODE_OAUTH_TOKEN)"; fi

# 3. orphan /login
ORPHAN=$(ps -eo etime,cmd | grep "claude /login" | grep -v grep | awk '{print $1}' | head -1)
[[ -z "$ORPHAN" ]] && ok "no orphan claude /login" || warn "claude /login running for $ORPHAN"

# 4. no sk-ant-oat01 residue
if grep -rq "sk-ant-oat01" ~/.openclaw 2>/dev/null; then fail "legacy sk-ant-oat01 tokens still present in ~/.openclaw"; else ok "no legacy OAuth tokens in ~/.openclaw"; fi

# 5. model config consistency
BAD_MODELS=$(jq -r '[.agents.list[] | select(.model | tostring | startswith("claude-cli/") | not) | .id] | join(",")' "$CFG")
[[ -z "$BAD_MODELS" ]] && ok "all agents on claude-cli/*" || fail "agents not on claude-cli: $BAD_MODELS"

COMPACTION=$(jq -r '.agents.defaults.compaction.model // ""' "$CFG")
[[ "$COMPACTION" == claude-cli/* || -z "$COMPACTION" ]] && ok "compaction.model ok ($COMPACTION)" || fail "compaction.model=$COMPACTION (should start with claude-cli/)"

SUMMARY=$(jq -r '.plugins.entries["lossless-claw"].config.summaryModel // ""' "$CFG")
[[ "$SUMMARY" == claude-cli/* || -z "$SUMMARY" ]] && ok "lossless-claw.summaryModel ok ($SUMMARY)" || fail "summaryModel=$SUMMARY (should start with claude-cli/)"

# 6. heartbeat on DM-serving agents
HB=$(jq -r '[.agents.list[] | select(.heartbeat) | .id] | join(",")' "$CFG")
[[ -z "$HB" ]] && ok "no agents with heartbeat config" || warn "agents with heartbeat (will swallow short DMs as polls): $HB"

# 7. fallback sanity
FB=$(jq -r '.agents.defaults.model.fallbacks // [] | join(",")' "$CFG")
if [[ -z "$FB" ]]; then ok "no fallback configured"
elif [[ "$FB" =~ ^claude-cli/.* ]]; then warn "fallback within same provider will NOT rescue you from 429 cooldown: $FB"
else ok "cross-provider fallback: $FB (verify it's actually reachable!)"; fi

# 8. gateway state
systemctl --user is-active openclaw-gateway.service >/dev/null 2>&1 && ok "gateway active" || fail "gateway not active"

# 9. recent errors
if journalctl --user -u openclaw-gateway.service --since "24 hours ago" 2>/dev/null | grep -qiE "rate.?limit|HTTP 429|authentication_error|PERMISSION_DENIED"; then
  fail "errors in last 24h (grep journalctl): rate_limit / 401 / 403 present — investigate"
else
  ok "no rate-limit / auth errors in last 24h"
fi

# 10. LCM db health
LCM=~/.openclaw/lcm.db
if [[ -f "$LCM" ]]; then
  SIZE=$(du -h "$LCM" | awk '{print $1}')
  SIZE_BYTES=$(stat -c %s "$LCM")
  [[ $SIZE_BYTES -lt 2147483648 ]] && ok "lcm.db $SIZE" || warn "lcm.db $SIZE (>2GB, consider archival)"
else
  warn "lcm.db not found (lossless-claw not running?)"
fi

# 11. disabled-but-configured plugins (noise)
DEAD=$(jq -r '[.plugins.entries | to_entries[] | select(.value.enabled == false and (.value.config // {}) != {}) | .key] | join(",")' "$CFG")
[[ -z "$DEAD" ]] && ok "no disabled-but-configured plugins" || warn "disabled plugins with stale config (delete entries): $DEAD"

# 11b. cron/jobs.json sanity (prevents runningAtMs crash on restart)
JOBS=~/.openclaw/cron/jobs.json
if [[ -f "$JOBS" ]]; then
  BAD_JOBS=$(jq -r '[.jobs[] | select(.schedule == null or .state == null) | .id] | join(",")' "$JOBS")
  [[ -z "$BAD_JOBS" ]] && ok "cron/jobs.json all entries have schedule+state" || fail "cron/jobs.json malformed entries (will crash scheduler on next restart): $BAD_JOBS"
fi

# 11c. session pins (Gotcha #25) — sessions carrying a provider that doesn't match current primary
PRIMARY_PROVIDER=$(jq -r '.agents.defaults.model.primary // ""' "$CFG" | awk -F/ '{print $1}')
if [[ -n "$PRIMARY_PROVIDER" ]]; then
  STALE_TOTAL=0
  for S in ~/.openclaw/agents/*/sessions/sessions.json; do
    [[ -f "$S" ]] || continue
    N=$(jq --arg p "$PRIMARY_PROVIDER" '[to_entries[] | select(.value.modelProvider != null and .value.modelProvider != $p)] | length' "$S" 2>/dev/null || echo 0)
    STALE_TOTAL=$((STALE_TOTAL + N))
  done
  if [[ $STALE_TOTAL -eq 0 ]]; then ok "all sessions pinned to modelProvider=$PRIMARY_PROVIDER"
  else fail "$STALE_TOTAL session(s) pinned to a different modelProvider than primary=$PRIMARY_PROVIDER — see Gotcha #25 for the sweep script"
  fi
fi

# 12. doctor + security audit
if openclaw doctor --non-interactive 2>&1 | grep -qi "^ERROR"; then fail "openclaw doctor has ERROR lines"; else ok "openclaw doctor clean"; fi
if command -v openclaw >/dev/null; then
  openclaw security audit 2>&1 | tail -20 | grep -qiE "warning|fail" && warn "openclaw security audit has findings — review" || ok "openclaw security audit clean"
fi

echo
echo "Done. Investigate any ✗ or ! lines above."
```

Save as `audit-claude-cli.sh`, `chmod +x`, run on the target host. Output is grep-able for `✓` / `✗` / `!`.

---

## §8 — Appendix: reference paths & versions

- OpenClaw install: `$(npm root -g)/openclaw/`
- OpenClaw config: `~/.openclaw/openclaw.json`
- Per-agent state: `~/.openclaw/agents/<agent-id>/` (`sessions/`, `agent/auth-profiles.json`)
- Per-agent workspace: `~/.openclaw/workspace-<agent-id>/` (`AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `MEMORY.md`, `TOOLS.md`, `HEARTBEAT.md`, `USER.md`, `BOOTSTRAP.md`, `skills/`)
- Claude CLI state: `~/.claude/.credentials.json`, `~/.claude/projects/<sanitized-workspace>/<sessionId>.jsonl`, `~/.claude/settings.json`
- LCM DB: `~/.openclaw/lcm.db`
- Log files: `/tmp/openclaw/openclaw-YYYY-MM-DD.log` (JSON) + `journalctl --user -u openclaw-gateway.service` (systemd)
- Backup script: `openclaw backup` (covers `~/.openclaw`; does NOT cover `~/.claude/`)

## §9 — Validation log

Anonymized so any operator can skim the patterns. Each row is one real cutover or post-cutover audit; host/agent identities are generalized.

| Date | Target shape | OpenClaw | claude-cli | Notes |
|---|---|---|---|---|
| 2026-04-21 | Multi-agent fleet (~7 agents behind Telegram on one gateway) | 2026.4.x | recent | Initial cutover. Surfaced Gotcha #1 (HEARTBEAT_OK trap) on the default/CMO-style agent that had a `heartbeat` block. Cross-provider text fallback (Gemini) confirmed broken (403 `PERMISSION_DENIED` from a revoked Google project) — fallback was masking real failures for weeks. `claude-opus-4-7` alias accepted by claude-code CLI; short `opus-4-7` alias rejected. |
| 2026-04-21 | Single-agent community bot (Telegram + misc plugins) | 2026.4.x | 2.1.x | Used as a full non-Anthropic-provider purge (dropped an x402-proxy plugin + two non-Anthropic providers + a wallet plugin), not just a transport swap. Surfaced: (a) Gotcha #21 — pre-existing malformed cron job crashed scheduler on restart; fixed by deleting that job; (b) Gotcha #22 — persona files (`TOOLS.md`, `AGENTS.md`, a `WALLET.md`) still advertised capabilities the migration had removed; flagged for operator review, not auto-rewritten; (c) Gotcha #23 — macOS Keychain storage broke the "log in on Mac then `scp`" plan; resolved by running `claude auth login` directly on the Linux target via SSH. Verification probe bug also caught: `result.text` is always null — must read `result.payloads[0].text`. |
| 2026-04-21 | Same multi-agent fleet as row 1, post-cutover audit | 2026.4.x | recent | Post-cutover cleanup pass surfaced Gotcha #25 — ~40% of existing sessions across the fleet still carried `modelProvider: "anthropic"` + `model: "claude-opus-4-6"` pins from before the migration. The cross-provider fallback had been silently masking the bug: primary (old provider) was 401/billing-failing, fallback (claude-cli) was succeeding, user saw normal replies. When Gemini fallback was removed (Gotcha #6 hardening), the pinned-provider error surfaced directly to the user as a billing message. Fixed with the Gotcha #25 sweep script + gateway restart; added `§7` check 11c so this is caught on any future audit. |

Concepts should remain stable across minor version bumps; config key names may drift — cross-check against `openclaw doctor --non-interactive` output if a field is rejected.
