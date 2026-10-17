# Issues

Known problems and small cleanups found during a site review on 2026-10-13.

- [x] **`npm run dev` fails without a Readwise token.** The `dev` script runs `sync:readwise` first, and [scripts/sync-readwise.mjs](scripts/sync-readwise.mjs) threw when `READWISE_TOKEN` was unset. It now warns and exits cleanly, so the dev server starts on a fresh clone.
- [x] **Cache headers miss the fonts.** [public/_headers](public/_headers) has rules for `/static/fonts/*` and `/static/images/*`, but those paths don't exist. Fonts are served from `/fonts/`, so they get no immutable rule. The `/*.png`, `/*.svg`, and similar rules also only match files at the root. Add `/fonts/*` and drop the `/static/` rules.
- [x] **`.readwise-last-sync` is tracked.** It's listed in `.gitignore` but was committed before that. Run `git rm --cached .readwise-last-sync`.
- [x] **Sticky TOC offset has no unit.** [src/components/notes/Toc.astro](src/components/notes/Toc.astro) set `top: 10;`. The CSS minifier was already turning it into `10px`, so it is now written as `top: 10px;` and nothing changes visually.
- [x] **Leftover editor `filepath` comments.** [DevSearch.astro](src/components/DevSearch.astro), [Skiplink.astro](src/components/Skiplink.astro), and [Toc.astro](src/components/notes/Toc.astro) start with `<!-- filepath: ... -->` comments that contain a local machine path. Remove them.
- [x] **Web manifest doesn't match the site.** [public/site.webmanifest](public/site.webmanifest) names the app "Sam Feldstein" and uses white for both `theme_color` and `background_color`. Use the notebook's title and colors that match the palette in [src/styles/_config.scss](src/styles/_config.scss). Now named "Sam Feldstein's Notebook" ("Notebook" for short), with `#f9f9f9` (the palette's `--white`) for both colors.
- [x] **Note header sorts tags in place.** [src/components/notes/Header.astro](src/components/notes/Header.astro) calls `.sort()` on `note.data.tags`, which mutates the collection entry. It's harmless today, but `[...note.data.tags].sort()` (or `toSorted()`) avoids surprises.

## Follow-ups from the performance audit (2026-10-17)

See [docs/performance-audit-2026-10.md](docs/performance-audit-2026-10.md) for context.

- [ ] **Verify the live headers and redirects.** The audit environment couldn't reach the live site. In DevTools, check that:
  - `/fonts/noto-serif.v2.woff2` returns `Cache-Control: public, max-age=31536000, immutable`.
  - `/sw.js` returns `no-cache`.
  - Clicking around produces no 307 redirects.
  - `/feed.xml` lists 50 items.
- [ ] **Note list styles never apply.** [src/styles/layouts/_note.scss](src/styles/layouts/_note.scss) is scoped to `.body`, but nothing uses that class; notes use `#body`. Change the selector to `#body` and check that the list spacing looks right, or delete the rules.
- [ ] **Letter print font isn't loaded.** [src/styles/layouts/_letter.scss](src/styles/layouts/_letter.scss) sets `'EB Garamond'`, which the site never loads, so printed letters use a fallback. Load the font or remove the declaration.
- [x] **Duplicate paragraph rule.** The mobile `main p { text-align: justify; hyphens: auto; }` in [src/components/Main.astro](src/components/Main.astro) repeats the global `p` rule in [src/styles/global.scss](src/styles/global.scss). Delete it.
- [ ] **List bullet isn't in the font.** The ⟡ bullet (U+27E1) in [src/styles/global.scss](src/styles/global.scss) isn't in Noto Serif, so it renders in a system font. Pick a bullet Noto Serif has, or accept the mismatch.
- [x] **Single-use MDX components load on every note.** GoogleSearch and Math are in the global component map ([src/components/global.js](src/components/global.js)), so their CSS ships on all note pages. Import them only in the notes that use them (`woodworking-resources`, `multiplication-principle`). This saves under 1 KB per page.
- [x] **Sitemap has no `lastmod`.** Use the `serialize` option of `@astrojs/sitemap` in [astro.config.mjs](astro.config.mjs) to add each note's `updated` or `created` date.
- [ ] **Pagefind Default UI is legacy.** Pagefind 1.5 recommends its Component UI. Consider migrating [src/components/Search.astro](src/components/Search.astro), which would also shrink the 120 KB `pagefind-ui.js`.
- [ ] **Rename fonts when they change.** `/fonts/*` is now cached as immutable, so any change to a font file needs a new filename (`.v3`, …), plus matching updates to [src/styles/_noto-serif.scss](src/styles/_noto-serif.scss), the preload in [src/components/head/Head.astro](src/components/head/Head.astro), and [scripts/sw-template.js](scripts/sw-template.js).
