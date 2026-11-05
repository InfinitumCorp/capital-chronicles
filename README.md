# Capital Chronicles

State-capital newspaper fronts that share one international wire.

Published so far:

- [The Albany Advocate](albany.html) — Albany, New York
- [The Annapolis Advocate](annapolis.html) — Annapolis, Maryland

[index.html](index.html) lists those two. The other 48 capitals are not in this repo yet.

`js/news.js` loads five public RSS feeds through rss2json. Titles, descriptions, links, and images are escaped before they are inserted into the page, and only `http`/`https` URLs are used for links and images.
