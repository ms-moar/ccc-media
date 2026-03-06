---
name: api-cost-aggregator
description: Combined view of all AI/API spending — OpenAI, Anthropic, AWS Bedrock, and OpenClaw internal tracking in one place.
requires:
  env:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
  bins:
    - curl
    - jq
    - aws
---

# API Cost Aggregator

Use this skill when the user wants a combined view of ALL their AI/API spending across providers.

## Get combined cost summary

```bash
{baseDir}/bin/aggregate-costs.sh
```

Present the results as a table:

| Provider | This Month | Source |
|----------|-----------|--------|
| OpenClaw (tracked) | from estimate | Token counting |
| OpenAI | from billing API | Actual billing |
| Anthropic | from usage API | Actual billing |
| AWS Bedrock | from Cost Explorer | Actual billing |
| **Total** | sum all | |

**Important**: OpenAI and Anthropic cost APIs require **admin keys**, not regular API keys:
- OpenAI: `OPENAI_ADMIN_KEY` from https://platform.openai.com/settings/organization/admin-keys
- Anthropic: `ANTHROPIC_ADMIN_KEY` (starts with `sk-ant-admin`) from console settings

If only regular API keys are configured, the script will note that and skip those providers. AWS works with standard IAM credentials.

Always note: OpenClaw's internal tracking is an *estimate* from token counts. Provider billing APIs show *actual* billed amounts. They may differ.

## For deeper breakdown per provider

Use the `aws-cost-watchdog` skill for AWS-specific drilldowns (by service, by day, Bedrock tokens).
