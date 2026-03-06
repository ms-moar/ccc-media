# Monitor Hosted Apps

## Heartbeat Prompt

```
Create a heartbeat that runs every 30 minutes to monitor our hosted application at https://myapp.vercel.app.

On each check:
1. Verify the site is up and measure response time
2. Check the Vercel deployment logs using the Vercel CLI for any errors or warnings
3. Scan for basic security issues like missing security headers, exposed server info, XSS vectors, and SQL injection patterns in responses
4. Track uptime percentage over time

Report to the #app-monitoring channel on Discord with:
- Overall health status (healthy / degraded / down)
- Current uptime percentage
- Average response time
- Any security concerns found
- Actionable hardening steps if issues are detected

Only send an alert immediately if the site goes down or a critical security issue is found. Otherwise, send a summary report every 6 hours.
```
