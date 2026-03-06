# OpenClaw Installation Guide

A no-nonsense guide to installing OpenClaw without the headaches. Covers macOS, Linux, and Windows, with fixes for the problems the official docs don't warn you about.

---

## What You Need Before Starting

- **Node.js 22 or higher** — check with `node --version`
- **An API key** from one of these providers:
  - Anthropic (recommended) — get one at https://console.anthropic.com
  - OpenAI — get one at https://platform.openai.com
  - Google Gemini — get one at https://aistudio.google.com
  - Moonshot/Kimi K2.5 — get one at https://platform.moonshot.cn
  - Or use OpenRouter for access to multiple models
- **A messaging app** you want to chat through (Discord, Telegram, WhatsApp, or just use the web dashboard)
- **macOS / Linux / Windows with WSL2** — native Windows without WSL is not supported properly

### Install Node.js If You Don't Have It

**macOS:**
```bash
brew install node@22
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
```

**Windows:**
Install WSL2 first (open PowerShell as admin):
```powershell
wsl --install
```
Then open Ubuntu from Start menu and follow the Linux steps above.

> **Important:** If you're on Windows, do everything inside WSL2 from this point on. Native Windows installs have known issues with missing executables, PowerShell errors, and broken plugin installs.

---

## Step 1: Install OpenClaw

Pick one method:

### Option A: Install Script (Easiest)

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

### Option B: npm Global Install

```bash
npm install -g openclaw@latest
```

### Option C: pnpm Global Install

```bash
pnpm add -g openclaw@latest
```

### Verify It Installed

```bash
openclaw --version
```

If this prints a version number, you're good. If not, see the troubleshooting section below.

---

## Step 2: Run the Setup Wizard

```bash
openclaw onboard --install-daemon
```

The wizard walks you through everything. Here's what each step means:

### Gateway Mode
- Pick **Local** — this runs everything on your machine
- Default port is **18789** — just press Enter

### Authentication
- Pick **API Key** (simpler than OAuth)
- Paste your API key when asked
- Anthropic is the recommended provider — it works best with OpenClaw

### Channel Setup
- The wizard asks which messaging apps to connect
- **Discord** is the most stable option for beginners
- **Telegram** works but has timeout issues (see troubleshooting)
- **WhatsApp** requires scanning a QR code and can disconnect frequently
- You can skip channels entirely and just use the web dashboard at `http://127.0.0.1:18789/`

### Daemon Installation
- Say **yes** — this runs OpenClaw as a background service
- Pick **Node** as the runtime (not Bun — Bun has known issues with WhatsApp and Telegram)
- On macOS this creates a LaunchAgent, on Linux a systemd service

### Skills
- The wizard offers to install default skills
- For a first install, accept the defaults
- You can add/remove skills later

---

## Step 3: Verify Everything Works

Run these commands:

```bash
openclaw gateway status
openclaw status
openclaw health
```

If all three come back clean, open your browser to `http://127.0.0.1:18789/` — you should see the OpenClaw dashboard.

### Quick Test

Send a test message from whichever channel you connected:
- **Discord:** @ mention your bot in a channel
- **Telegram:** DM your bot directly
- **Web dashboard:** Type in the chat box

If it responds, you're done with basic setup.

---

## Step 4: Connect Discord (Recommended Channel)

Discord is the most reliable channel. Here's how to set it up:

### Create a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** — give it a name
3. Go to **Bot** in the left sidebar
4. Click **Reset Token** — copy the token (you won't see it again)
5. Under **Privileged Gateway Intents**, enable ALL THREE:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
6. Go to **OAuth2 → URL Generator**
7. Select scopes: `bot`
8. Select permissions: `Send Messages`, `Read Message History`, `Read Messages/View Channels`
9. Copy the generated URL and open it in your browser to invite the bot to your server

### Add the Token to OpenClaw

If you didn't add Discord during the wizard:

```bash
openclaw configure
```

Navigate to channels → Discord and paste your bot token.

Or edit the config directly:

```bash
nano ~/.openclaw/openclaw.json
```

Add under `channels`:
```json
"discord": {
  "token": "YOUR_BOT_TOKEN_HERE",
  "dmPolicy": "pairing"
}
```

Restart the gateway:
```bash
openclaw gateway restart
```

### Common Discord Problem: Bot Appears Online But Doesn't Reply

This usually means privileged intents are not enabled. Go back to the Discord Developer Portal → Bot → enable all three intents. This is the most common Discord issue.

### Common Discord Problem: Messages Lost on Slow Responses

If the bot takes over 2 minutes to respond, Discord sometimes drops the response. This is a Discord limitation. There's no fix — just be aware that complex tasks may silently fail to deliver.

---

## Step 5: Connect Telegram (Alternative Channel)

### Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow the prompts — pick a name and username
4. Copy the bot token BotFather gives you

### Add to OpenClaw

```bash
openclaw configure
```

Or edit config:
```json
"telegram": {
  "token": "YOUR_TELEGRAM_BOT_TOKEN"
}
```

Restart:
```bash
openclaw gateway restart
```

### Common Telegram Problem: Crashes Every Hour

The `getUpdates` call times out after 30 seconds and crashes the channel with no auto-reconnect. This has been an issue across multiple versions (2026.1.27 through 2026.1.30).

**Workaround:** Create a simple watchdog script that checks if Telegram is responding:

```bash
# Save as ~/check-openclaw.sh
#!/bin/bash
if ! openclaw status --deep | grep -q "telegram.*connected"; then
    openclaw gateway restart
fi
```

Run it every 5 minutes with cron:
```bash
crontab -e
# Add this line:
*/5 * * * * bash ~/check-openclaw.sh
```

### Common Telegram Problem: DMs Never Arrive

If `openclaw status --deep` shows Telegram as OK but messages never come through, another process might be consuming updates with the same token. Make sure you don't have another bot instance running with the same token.

### Common Telegram Problem: Pairing Fails on Restrictive Networks

Setup fails silently with no error. Your network might be blocking Telegram's polling connection. Switch to a mobile hotspot to complete pairing, then switch back.

---

## Step 6: Connect WhatsApp (Least Stable)

```bash
openclaw channels login
```

Scan the QR code with WhatsApp → Settings → Linked Devices → Link a Device.

### Know Before You Connect

WhatsApp is the least stable channel. Common issues:
- Frequent disconnections (408 errors)
- QR code times out if you're slow
- Needs re-pairing after gateway restarts sometimes

**If it keeps disconnecting:**
```bash
openclaw channels logout
openclaw channels login --verbose
```

Re-scan the QR code. If it still drops, switch to Discord or Telegram.

---

## Step 7: Set Up Cost Protection (Do This Now)

Before you start using OpenClaw for real work, set spending limits. OpenClaw burns tokens fast because it sends your full conversation history with every request.

### Set API Spending Limits

**Anthropic:**
1. Go to https://console.anthropic.com/settings/billing
2. Set a monthly spend limit (start with $10-20)

**OpenAI:**
1. Go to https://platform.openai.com/settings/organization/limits
2. Set a monthly budget limit

**Google:**
1. Set up billing alerts in Google Cloud Console

### Reduce Token Burn

Edit your config (`~/.openclaw/openclaw.json`):

```json
{
  "agents": {
    "defaults": {
      "heartbeat": {
        "every": "0m"
      }
    }
  },
  "session": {
    "reset": {
      "mode": "idle",
      "idleMinutes": 60
    }
  }
}
```

- **Heartbeat `"0m"`** disables the periodic check-ins that burn tokens while idle. Turn this back on later if you need scheduled tasks, but set it to `"2h"` or longer instead of the default.
- **Session reset after 60 min idle** clears the conversation history so it doesn't keep growing and making every message more expensive.

### Clear Sessions Manually

If your responses are getting slow (context building up):
```bash
rm ~/.openclaw/agents/main/sessions/*.jsonl
openclaw gateway restart
```

This wipes conversation history and resets response times. You'll lose chat context but save tokens.

---

## Step 8: Basic Security Hardening

### Know Where Your Credentials Are

Everything is stored in plaintext:
```
~/.openclaw/openclaw.json          — main config
~/.openclaw/credentials/            — OAuth tokens
~/.openclaw/agents/*/auth-profiles.json — API keys
```

Anyone with access to your user account can read these files.

### Run on a Separate User Account (Recommended)

Create a dedicated macOS user:
1. System Settings → Users & Groups → Add User
2. Name it something like `openclaw`
3. Install and configure OpenClaw under that account
4. That account has no access to your SSH keys, browser data, or real project files

### Run in Docker (Most Secure)

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
docker compose up -d
```

Docker isolates OpenClaw from your host filesystem. It can only access what you explicitly mount.

### Remove Unused Integrations

If you connected Discord but also have old Telegram tokens:
- Go to Discord Developer Portal → Bot → Reset Token (if you want to revoke)
- Delete any channel configs from `openclaw.json` that you're not using
- Restart the gateway

---

## Troubleshooting

### Installation Problems

**`sharp` build fails on macOS (Apple Silicon)**
```
sharp: Attempting to build from source via node-gyp
npm error code 1
```
Fix: Install the latest version manually:
```bash
npm install -g sharp@latest
npm install -g openclaw@latest
```

**`pnpm install` runs out of memory**
```
FATAL ERROR: invalid array length Allocation failed - JavaScript heap out of memory
```
Fix: Use npm instead:
```bash
npm install -g openclaw@latest --legacy-peer-deps
```

**Windows: `npm install -g` completes but no `openclaw` command**
The package was missing a `bin` field in some versions. Make sure you're on the latest:
```bash
npm install -g openclaw@latest
```
If still missing, find where npm puts global packages (`npm root -g`) and check if the binary exists.

**Windows: `spawn npm ENOENT` during plugin install**
OpenClaw calls `npm` without the `.cmd` extension on Windows. Run inside WSL2 instead.

**Linux VPS: Out of memory during install**
You need at least 2GB RAM. On a 1GB droplet:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
npm install -g openclaw@latest
```

### Gateway Problems

**"No API key found for provider"**
Authentication is per-agent. If you added a new agent, it doesn't inherit the parent's keys.
```bash
openclaw models auth setup-token --provider anthropic
```

**Gateway won't start — port already in use**
```bash
openclaw gateway status
openclaw gateway stop
# Wait a few seconds
openclaw gateway --port 18789
```

**`gateway stop` breaks `gateway start` (macOS)**
`gateway stop` uses `launchctl bootout` which completely unloads the service. Fix:
```bash
openclaw gateway stop
openclaw onboard --install-daemon
openclaw gateway start
```

**Dashboard won't load**
If you're accessing from a non-localhost URL, the browser blocks WebCrypto on HTTP.
Either:
- Access via `http://127.0.0.1:18789/` (localhost is fine)
- Set up HTTPS via Tailscale or a reverse proxy
- Or add to config: `"gateway": { "controlUi": { "allowInsecureAuth": true } }`

### Migration Problems (Clawdbot/Moltbot → OpenClaw)

If you had the old version installed, both services might fight over the same port.

```bash
# Stop everything
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.clawdbot.gateway.plist 2>/dev/null
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/bot.molt.gateway.plist 2>/dev/null
openclaw gateway stop

# Remove old packages
npm uninstall -g clawdbot 2>/dev/null
npm uninstall -g moltbot 2>/dev/null

# Clean up old configs (back up first if you want your history)
mv ~/.clawdbot ~/.clawdbot-backup 2>/dev/null
mv ~/.moltbot ~/.moltbot-backup 2>/dev/null

# Fresh install
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### Channel Problems

**Discord Error 4014: Privileged intents not enabled**
Go to Discord Developer Portal → Bot → enable Message Content Intent, Server Members Intent, and Presence Intent.

**Discord bot silent (online but no responses)**
Check if `requireMention` is blocking messages. Either @ mention the bot, or set:
```json
"channels": {
  "discord": {
    "groupPolicy": "open"
  }
}
```

**Telegram: `getUpdates` timeout crashes**
Known issue with no upstream fix. Use the watchdog script from Step 5 above.

**WhatsApp: Repeated 408 disconnections**
WhatsApp is unstable by design in OpenClaw. Try:
```bash
openclaw channels logout
openclaw channels login --verbose
```
If it keeps happening, switch to Discord.

**"Clawd had been replying to ALL of my iMessages"**
If you connected iMessage, OpenClaw responds to every incoming message by default. Fix by setting an allowlist:
```json
"channels": {
  "imessage": {
    "dmPolicy": "allowlist",
    "allowFrom": ["+15551234567"]
  }
}
```

### Cost/Performance Problems

**Responses getting slower over time**
Your conversation context is growing. Each message sends the full history.
```bash
# Check session file sizes
ls -lh ~/.openclaw/agents/main/sessions/

# Delete old sessions
rm ~/.openclaw/agents/main/sessions/*.jsonl
openclaw gateway restart
```

**Burning tokens overnight**
Disable heartbeat:
```json
"agents": {
  "defaults": {
    "heartbeat": {
      "every": "0m"
    }
  }
}
```

**$5+ burned on setup alone**
This is normal. The onboarding wizard, skill installation, and initial configuration all make API calls. Budget $5-10 for setup.

### Uninstall

If you need to remove OpenClaw completely:

```bash
# Stop the service
openclaw gateway stop

# Remove the package
npm uninstall -g openclaw

# Remove config and data
rm -rf ~/.openclaw
rm -rf ~/.clawdbot 2>/dev/null
rm -rf ~/.moltbot 2>/dev/null

# Remove LaunchAgent (macOS)
rm ~/Library/LaunchAgents/com.openclaw.gateway.plist 2>/dev/null
rm ~/Library/LaunchAgents/com.clawdbot.gateway.plist 2>/dev/null
rm ~/Library/LaunchAgents/bot.molt.gateway.plist 2>/dev/null

# IMPORTANT: Revoke tokens for connected services
# - Discord: Developer Portal → Bot → Reset Token
# - Telegram: @BotFather → /revoke
# - WhatsApp: Unlink device from WhatsApp settings
# - Any other connected service: revoke manually
```

> **Warning:** `openclaw uninstall` deletes `~/.openclaw` entirely, which may include your workspace files. Back up anything you need first.

> **Warning:** OAuth tokens remain active even after uninstalling the software. You must manually revoke tokens for every connected service, or they remain valid and accessible.

---

## Useful Commands Reference

| Command | What It Does |
|---------|-------------|
| `openclaw status` | Shows overview of gateway, channels, and config |
| `openclaw status --all` | Full diagnostic dump (safe to share for debugging) |
| `openclaw status --deep` | Deep health check including provider probes |
| `openclaw health` | Quick health check |
| `openclaw doctor` | Finds and fixes config issues |
| `openclaw doctor --fix` | Auto-repairs what it can |
| `openclaw gateway status` | Gateway process status |
| `openclaw gateway restart` | Restart the gateway |
| `openclaw gateway stop` | Stop the gateway |
| `openclaw logs --follow` | Live log stream |
| `openclaw configure` | Re-run configuration |
| `openclaw channels login` | Connect/reconnect WhatsApp |
| `openclaw channels logout` | Disconnect WhatsApp |
| `openclaw pairing list <channel>` | Show pending pairing requests |
| `openclaw pairing approve <channel> <code>` | Approve a pairing request |
| `openclaw models status` | Check which models are configured |
| `openclaw security audit --deep` | Run security audit |

---

## Config File Location

Everything lives in `~/.openclaw/`:

```
~/.openclaw/
├── openclaw.json              # Main config
├── credentials/               # OAuth tokens, WhatsApp auth
├── agents/
│   └── main/
│       ├── agent/
│       │   └── auth-profiles.json  # API keys
│       └── sessions/              # Conversation history
├── workspace/                 # Agent workspace
└── logs/                      # Gateway logs (macOS)
```

Logs on Linux: `journalctl --user -u openclaw-gateway.service -n 200 --no-pager`
Logs on macOS: `~/.openclaw/logs/gateway.log`
Crash logs: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`
