# Lead Generation

## Cron Job Prompt

```
Create a cron job that runs daily at 9 AM to find potential developer leads.

On each run:
1. Check GitHub Trending for top developers working on LLM applications, AI tools, and related areas
2. For each developer who has public contact information (email, Twitter, website), save their details
3. Save the list of leads to ~/Documents/leads/ with the date as the filename
4. Using the gog CLI, create draft emails (do NOT send them) in Gmail for each lead

Email guidelines:
- Keep the tone casual and conversational
- Mention something specific about their work to show genuine interest
- Include a soft CTA, not a hard sell
- Keep it short, under 150 words

Report to Discord with how many new leads were found and how many draft emails were created.
```
