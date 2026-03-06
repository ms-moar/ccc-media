# Always On Email Assistant

## Heartbeat Prompt

```
Create a heartbeat that runs every 2 hours to scan my Gmail inbox using the gog CLI.

On each scan:
1. Check for new unread emails since the last scan
2. Ignore promotional emails and newsletters
3. Prioritize emails marked as important or from known contacts
4. Score each remaining email by urgency (high / medium / low) based on content and sender
5. Identify any actionable items from each email (deadlines, requests, follow-ups needed)

Report to the configured Discord/WhatsApp channel with only the emails that need attention, grouped by urgency. Include a one-line summary and the actionable item for each.
```
