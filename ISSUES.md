# Issues

Known problems and small cleanups found during a site review on 2026-10-13.

- [x] **`npm run dev` fails without a Readwise token.** The `dev` script runs `sync:readwise` first, and [scripts/sync-readwise.mjs](scripts/sync-readwise.mjs) threw when `READWISE_TOKEN` was unset. It now warns and exits cleanly, so the dev server starts on a fresh clone.
- [ ] **Cache headers miss the fonts.** [public/_headers](public/_headers) has rules for `/static/fonts/*` and `/static/images/*`, but those paths don't exist. Fonts are served from `/fonts/`, so they get no immutable rule. The `/*.png`, `/*.svg`, and similar rules also only match files at the root. Add `/fonts/*` and drop the `/static/` rules.
- [ ] **`.readwise-last-sync` is tracked.** It's listed in `.gitignore` but was committed before that. Run `git rm --cached .readwise-last-sync`.
- [ ] **Sticky TOC offset has no unit.** [src/components/notes/Toc.astro](src/components/notes/Toc.astro) sets `top: 10;`, which is invalid and ignored. Use something like `top: 1rem;`.
- [ ] **Leftover editor `filepath` comments.** [DevSearch.astro](src/components/DevSearch.astro), [Skiplink.astro](src/components/Skiplink.astro), and [Toc.astro](src/components/notes/Toc.astro) start with `<!-- filepath: ... -->` comments that contain a local machine path. Remove them.
- [ ] **Web manifest doesn't match the site.** [public/site.webmanifest](public/site.webmanifest) names the app "Sam Feldstein" and uses white for both `theme_color` and `background_color`. Use the notebook's title and colors that match the palette in [src/styles/_config.scss](src/styles/_config.scss).
- [ ] **Note header sorts tags in place.** [src/components/notes/Header.astro](src/components/notes/Header.astro) calls `.sort()` on `note.data.tags`, which mutates the collection entry. It's harmless today, but `[...note.data.tags].sort()` (or `toSorted()`) avoids surprises.
