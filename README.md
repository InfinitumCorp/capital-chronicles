# Capital Chronicles

State-capital newspaper fronts that share one international wire.

Published so far:

- [The Albany Advocate](albany.html) — Albany, New York
- [The Annapolis Advocate](annapolis.html) — Annapolis, Maryland

[index.html](index.html) lists those two. The other 48 capitals are not in this repo yet.

`js/news.js` loads five public RSS feeds through rss2json. Titles, descriptions, links, and images are escaped before they are inserted into the page, and only `http`/`https` URLs are used for links and images.

## Deploy (Cloudflare)

This site deploys to Cloudflare Workers as static assets, per [//RULES//](https://github.com/InfinitumCorp/RULES/blob/main/BUILD_RULES.md#6-github--cloudflare).

```bash
npx wrangler deploy
```

- `wrangler.jsonc` sets the Worker name (`capital-chronicles`) and serves this folder.
- `_headers` applies the standard security headers.
- `.assetsignore` keeps repo files (README, config, .git) out of the deploy.
- To deploy on every push to `main`, connect this repo in the Cloudflare dashboard (Workers & Pages → Import a repository).
