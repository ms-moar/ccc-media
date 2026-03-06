# SEO Monitor

## Heartbeat Prompt

```
Create a heartbeat that runs every 24 hours to check the SEO health of our application at https://myapp.vercel.app.

On each run, check:
1. Whether the site is indexable (no accidental noindex tags)
2. robots.txt is reachable and properly configured
3. Sitemap.xml is reachable and contains valid URLs
4. All pages have proper meta titles and descriptions
5. Open Graph and Twitter card tags are present
6. Images have alt text
7. No broken internal links
8. Page load performance (Core Web Vitals if possible)

Report to the #seo-monitoring channel on Discord with:
- A summary of the current SEO health
- Any issues found, ranked by priority
- Specific fixes to implement for each issue
```
