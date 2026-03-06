# API Cost Watchdog

## Cron Job Prompt

```
Create a cron job that runs every 6 hours to monitor our cloud API costs.

Use the aws-cost-watchdog and api-cost-aggregator skills to check current spending across all configured providers. Compare the current usage against the previous cycle. If spending has increased by more than 30% compared to the same period yesterday, or if any budget threshold is above 80%, report it immediately.

For each alert, include:
- Which service or provider caused the spike
- The percentage increase
- Actionable steps to reduce or prevent further cost increases

Report all findings to the configured Discord channel.
```
