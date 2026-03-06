# 10 OpenClaw Use Cases for Developers

Resource pack for the video covering 10 practical ways developers can use OpenClaw as an always-on assistant running on a Mac Mini.

## Folder Structure

```
.
├── skills/                  # OpenClaw skills (placed in ~/.openclaw/skills/)
│   ├── aws-cost-watchdog/   # Monitor AWS spending via Cost Explorer & CloudWatch
│   └── api-cost-aggregator/ # Combined view of AI/API spending across providers
│
└── prompts/                 # Ready-to-use prompts for OpenClaw's chat interface
    ├── 01-api-cost-watchdog.md
    ├── 02-dependency-maintenance.md
    ├── 03-research-across-sites.md
    ├── 04-monitor-hosted-apps.md
    ├── 05-seo-monitor.md
    ├── 06-build-overnight.md
    ├── 07-multi-model-orchestration.md
    ├── 08-lead-generation.md
    └── 09-email-assistant.md
```

## How to Use

### Skills

Copy the skill folders into your OpenClaw skills directory:

```bash
cp -r skills/* ~/.openclaw/skills/
```

Once copied, the skills will appear on the OpenClaw dashboard. Make sure to configure the required environment variables and API keys listed in each skill's `SKILL.md` file.

### Prompts

Each prompt file contains a ready-to-paste prompt for OpenClaw's chat interface. Open the file, copy the prompt block, and paste it into OpenClaw's chat to create the corresponding cron job, heartbeat, or task.

Before using:
- Replace placeholder values like URLs, directory paths, and channel names with your own
- Make sure the required CLIs and integrations are configured (e.g., `aws`, `vercel`, `gog` for Google Workspace)
- For prompts that use Claude Code, either pre-allow permissions in `.claude/settings.json` or use the `dangerously-skip-permissions` flag to avoid timeout issues

### Prompt Types

| Type | What it does |
|------|-------------|
| **Cron job** | Runs on a schedule (e.g., every 12 hours, daily at 9 AM) |
| **Heartbeat** | Runs frequent checks at fixed intervals (e.g., every 30 minutes) |
| **Chat prompt** | One-time instruction given directly in OpenClaw's chat |

## Use Cases Covered

1. **API Cost Watchdog** — Monitor cloud spending and get alerts on spikes
2. **Dependency Maintenance** — Auto-update dependencies and open PRs
3. **Research Across Sites** — Daily tech news digest with video angles
4. **Monitor Hosted Apps** — Health checks, uptime, and security scanning
5. **SEO Monitor** — Periodic SEO audits for hosted applications
6. **Build Overnight** — Build and deploy an app from a PRD
7. **Multi Model Orchestration** — Coordinate Claude Code and Nano Banana Pro
8. **Lead Generation** — Find developer leads and draft cold emails
9. **Email Assistant** — Surface important emails and filter noise
10. **Claude Code via OpenClaw** — Run Claude Code remotely through chat (no dedicated prompt needed, just tell OpenClaw what to do)
