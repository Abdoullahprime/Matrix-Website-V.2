# SEO notes

## What the build does for you

The site is a single-page app, so every address would normally serve the same `index.html`.
`npm run build:iis` therefore runs `scripts/seo-build.mjs` after the normal build, which gives
**every page its own HTML file** with the right title, description, canonical address, social
tags and structured data already in it, then writes `sitemap.xml`, `robots.txt` and the
`web.config` rules that serve those files.

Everything comes from two files, which the running site reads too:

| File | Holds |
| --- | --- |
| `src/seo/pages.json` | the address, title, description and heading of each main page |
| `src/data/solutionPages.json` | the dedicated solution pages (content, FAQ, who uses it) |

Titles should stay under about 60 characters and descriptions under about 155; the build
prints a warning when one is too long. The canonical host is **`https://matrixgambia.com`**
(no `www`); change `siteUrl` in `pages.json` if that ever changes.

## Adding a keyword page the right way

Add an entry to `src/data/solutionPages.json`, then rebuild. The page, its sitemap entry, its
HTML file, its server rule, its breadcrumb and its FAQ markup all appear automatically.

Rules that keep it helpful rather than harmful:

- **Real content.** Write what the product does, who uses it and answer real questions. Do not
  repeat keywords to fill space.
- **Linked from the site.** It may be absent from the top menu, but it must be linked from other
  pages (footer, the Solutions page, related-solution cards). A page nothing links to is
  hard for search engines to find and is treated as less important.
- **One page per real topic.** Do not make near-identical pages that differ only in a town or a
  keyword (doorway pages). Google penalises that.
- **Nothing hidden.** No invisible text, no text in the page's own colour, no content shown to
  search engines but not to visitors (cloaking).

## Things only you can do

1. **Google Search Console** (search.google.com/search-console): add `https://matrixgambia.com`,
   verify it (a DNS TXT record, or ask us to add the verification tag), then submit
   `https://matrixgambia.com/sitemap.xml`. It also shows which searches bring visitors.
2. **Bing Webmaster Tools**: import the site from Search Console.
3. **Google Business Profile**: create or claim the listing for the Kanifing office, using the
   same name, address and phone numbers as the site. For a local company this is often the
   biggest single gain.
4. **Redirects in Plesk** (Hosting Settings): redirect `http` to `https`, and `www` to the
   no-`www` address, with a permanent (301) redirect, so there is only one version of the site.
   Do this once the SSL certificate covers both names.
5. **Links from other sites**: ask clients and partners (for example the Oracle partner page)
   to link to the relevant page. Links from real organizations are one of the strongest signals.
6. **Keep content fresh and honest**: real case studies, real client names (with permission),
   real news. Rankings come from being the most useful page for a search, over weeks and months.

## Checking it after a deploy

```bash
curl -s https://matrixgambia.com/robots.txt
curl -s https://matrixgambia.com/sitemap.xml
curl -s https://matrixgambia.com/clients | grep -E "<title>|canonical"
```

Each page should show its own title and canonical address. Paste a page's address into Google's
Rich Results Test to confirm the structured data, and into PageSpeed Insights for speed.

## Known limits

- The page body is still drawn by JavaScript. Google runs it, so indexing works, but a full
  server-side render would be faster for crawlers. Worth doing only if indexing proves slow.
- Unknown addresses show the "page not found" screen but the server still answers with a normal
  status; the page is marked `noindex` so it cannot appear in search results.
