# Dependency Maintenance

## Cron Job Prompt

```
Create a cron job that runs every 12 hours to check and maintain dependencies for the repo at ~/projects/my-app.

On each run:
1. Pull the latest changes from the main branch
2. Run dependency audit checks for known vulnerabilities
3. If safe patch-level updates are available, update the lockfile and verify nothing breaks by running the existing test suite and linter
4. If all checks pass, commit the changes and push to a new branch, then open a PR on GitHub
5. If linting or tests fail after the update, do not push. Instead, report what failed and what needs manual attention

Report the results to the configured Discord channel with:
- List of updated dependencies and their version changes
- Any vulnerabilities that were patched
- Any issues that need manual intervention
```
