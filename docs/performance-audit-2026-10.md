# Performance audit, October 2026

Site-wide performance review done on 2026-10-17. Changes merged in [#1](https://github.com/samfeldstein/notebook-astro/pull/1).

## Baseline

Measured on a local build in Chromium at a mobile viewport with 4x CPU throttling, 150 ms latency, and about 1.4 Mbps.

| Page | FCP/LCP | CLS | TBT | Requests | Bytes |
|---|---|---|---|---|---|
| Home | 400 ms | 0 | 16 ms | 8 | 233 KB |
| Note (`augmented-learning`) | 500 ms | 0 | 127 ms | 11 | 266 KB |
| `/notes/tags/` | 368 ms | 0 | 9 ms | 52 | 287 KB |
| Search | 316 ms (DCL 1518 ms) | 0.0007 | 0 | 9 | 239 KB |

The site was already fast. Each page ships about 2.5 KB of JS (Astro's prefetch runtime) and about 2 KB gzipped of inline CSS. The work below removes wasted requests, fixes caching, and fixes font coverage.

## Changes

### Links and prefetching

- **Trailing slashes.** About 1,200 internal links had no trailing slash, so Cloudflare answered each click and prefetch with a redirect to the `/`-ending URL. Links in wikilinks (`hrefTemplate` in [astro.config.mjs](../astro.config.mjs)), [SiteHeader.astro](../src/components/SiteHeader.astro), [Tags.astro](../src/components/Tags.astro), [notes/tags/index.astro](../src/pages/notes/tags/index.astro), and the dev search results now end in `/`. `trailingSlash: 'always'` makes the dev server enforce it, so a link without the slash 404s in dev instead of silently redirecting in production.
- **Prefetch on hover.** `defaultStrategy` changed from `viewport` to `hover`. The viewport strategy fetched every visible link: more than 100 pages on `/notes/tags/`, plus the 114 KB RSS feed on the home page. The feed link also has `data-astro-prefetch="false"`.

### Caching ([public/_headers](../public/_headers))

The old rules targeted `/static/fonts/*` and `/static/images/*`, which don't exist, and `/**/*.html`, which never matches directory URLs. The fonts got no long-term caching.

New rules:

- `/_astro/*`, `/fonts/*`, `/pagefind/fragment/*`, `/pagefind/index/*`: one year, immutable.
- Favicons and app icons: one week.
- `/sw.js`: `no-cache`.
- HTML and the Pagefind entry files keep Cloudflare's default revalidation.

Font files aren't hashed, so **rename them when they change** (they're currently `.v2`).

### Service worker ([scripts/sw-template.js](../scripts/sw-template.js))

- The precache keys (`index.html`, `/search/index.html`) never matched real request paths, so precached pages were never served offline. They now use real paths: `/`, `/notes/tags/`, `/search/`.
- The worker used to cache every `/notes` response, including prefetches and errors, with no limit. It now caches only successful page navigations, keeps the last 100, and ignores non-GET and cross-origin requests.
- Fonts are served cache-first. Only the regular font is precached; the italic is cached the first time a page uses it.
- When offline, a page that isn't cached falls back to the home page.
- [scripts/generate-sw.js](../scripts/generate-sw.js) versions the cache from a hash of the template instead of `Date.now()`, so a deploy only clears caches when the worker itself changes.
- The worker registers after `load`, so it doesn't compete with the first page load.

### Fonts ([src/styles/_noto-serif.scss](../src/styles/_noto-serif.scss))

- The old subsets covered Latin-1 only, but remark-smartypants turns every quote and dash into ‘ ’ “ ” – — …. Thousands of characters were rendering in the fallback font.
- Both files were re-subset from upstream Noto Serif (google/fonts), keeping the `wght` and `wdth` axes. The `wdth` axis is used by the tag list.
- They now include curly quotes, dashes, the ellipsis, guillemets, €, ™ and a few others. `unicode-range` matches.
- Roman is 86 KB (was 82 KB) and italic 115 KB (was 109 KB).
- The ⟡ list bullet (U+27E1) isn't in Noto Serif, so it still uses a system font.
- The Georgia fallback has `size-adjust`, `ascent-override` and `descent-override`, calculated from capsize metrics, so text reflows less when the web font arrives.

### Smaller changes

- **Search:** `pagefind-ui.js` (120 KB) loads with `defer` instead of blocking parsing.
- **RSS:** [feed.xml.js](../src/pages/feed.xml.js) lists the latest 50 notes instead of all 442 (114 KB → 13 KB).
- **Image:** the probability note's image ships in three widths (480, 930 and 1298w) with `sizes` set.
- **Dev search:** the client code moved to [src/scripts/dev-search.ts](../src/scripts/dev-search.ts) and loads behind `import.meta.env.DEV`. The 27 KB Fuse.js bundle is no longer emitted into `dist`.
- **CSS:** `build.inlineStylesheets: 'always'` replaces the `assetsInlineLimit: 14000` workaround.

## Decisions

- **Keep CSS inline.** HTML revalidates on every view, so inline CSS (about 2 KB gzipped) is re-sent with each page. A separate cached file would save that on later page views, but it adds a render-blocking request on every first visit, and Astro often splits CSS across several files. At this size, inline wins. Revisit if the CSS grows past about 10 KB gzipped.
- **No KaTeX.** remark-math is installed without rehype-katex, so no math CSS ships.

## Verification

- `npm run build` passes and builds all 554 pages.
- The built HTML has no internal links without a trailing slash.
- Checked in Chromium against `dist`:
  - Pagefind search returns results.
  - The service worker activates and serves a visited note offline.
  - Both fonts load.
  - No redirects or console errors.
- Dev search works under `astro dev`.
- The Cloudflare Workers preview build succeeded. The live headers weren't checked from the audit environment.

## Remaining ideas

All three were done on 2026-10-17: GoogleSearch and Math are imported only in the notes that use them, the sitemap has `lastmod`, and the duplicate `main p` rule is gone. Open follow-ups are tracked in [ISSUES.md](../ISSUES.md).
