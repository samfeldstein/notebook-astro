# Sam Feldstein’s Notebook

The source for [notes.samfeldstein.xyz](https://notes.samfeldstein.xyz), my digital notebook. Some people call this kind of site a second brain or a digital garden.
I keep this repo public mainly as a code sample. You’re welcome to read it, borrow from it, or fork it. The notes live in the repo too, though, so a fork brings all of them along.

## Stack

- [Astro](https://astro.build) for static site generation, with MDX for notes that need components
- Sass for styles, with no CSS framework and no client-side UI framework
- [Pagefind](https://pagefind.app) for search in production, and [Fuse.js](https://www.fusejs.io) for search during development
- [Foam](https://foambubble.github.io/foam/) in VS Code for writing
- Cloudflare Workers static assets for hosting. Cloudflare builds and deploys from GitHub on every push.

## How it works

### Writing

I write notes in VS Code with the Foam extension, which adds wikilinks, backlinks, and a graph view. A Foam template ([.foam/templates/new-note.md](.foam/templates/new-note.md)) creates new notes in `src/content/notes/` with `title`, `created`, and `updated` already filled in. The editor and the site read the same files, so a note is published once it's committed and pushed.

### Content collection

Notes are an Astro content collection defined in [src/content.config.ts](src/content.config.ts). The `glob` loader picks up `.md` and `.mdx` files. A Zod schema validates the frontmatter. `tags` and `aliases` can be a single string or a list, and both become arrays. A missing or empty `tags` becomes `[]`, and dates are coerced from plain `YYYY-MM-DD` strings.

### Wikilinks

Foam writes links as `[[note-name]]`, `[[note-name|alias]]`, or `[[notes/note-name.md#heading]]`. [remark-wiki-link](https://github.com/landakram/remark-wiki-link) turns these into HTML links, with a custom `pageResolver` in [astro.config.mjs](astro.config.mjs) to handle the variations. The resolver strips the alias, the heading anchor, any `notes/` prefix, and the file extension, then slugifies what's left to match the note's ID. Every variant ends up at `/notes/<id>`. The same pipeline also runs `remark-math` for LaTeX and `remark-smartypants` for typographic quotes and dashes.

### Public and private notes

Not everything in the notebook is public, and three layers keep it that way:

1. **Private folder.** `src/content/notes/private/` is gitignored and excluded from the loader. Those notes never reach GitHub or the build.
2. **Private flag.** A note with `private: true` in its frontmatter can live alongside public notes. `getPublicNotes()` in [src/lib/notes.ts](src/lib/notes.ts) includes it on the dev server and drops it from production builds. Every public route uses this function, including note pages, tag pages, and the RSS feed.
3. **Graceful dead links.** A public note can still link to a private one. Those links land on the [404 page](src/pages/404.astro), which says the page is most likely private and offers a way to ask about it.

### Pages

- [`/notes/[...id]`](src/pages/notes/[...id].astro) renders each note. If the note has headings, it adds a table of contents ([Toc.astro](src/components/notes/Toc.astro)) that sits in a sticky sidebar on wide screens.
- [`/notes/tags`](src/pages/notes/tags/index.astro) and [`/notes/tags/[tag]`](src/pages/notes/tags/[tag].astro) are generated from the tags across all public notes.
- [`/feed.xml`](src/pages/feed.xml.js) is an RSS feed sorted by creation date, and `@astrojs/sitemap` generates the sitemap.

### Search

Search works differently in production and development:

- **Production:** After `astro build`, a `postbuild` script runs `pagefind --site dist`. It indexes only the note body, because note pages mark the `<article>` with `data-pagefind-body`. [Search.astro](src/components/Search.astro) loads the Pagefind UI and restyles it to match the site.
- **Development:** Pagefind needs a finished build, so the dev server uses Fuse.js instead. [DevSearch.astro](src/components/DevSearch.astro) fetches the notes from a JSON endpoint ([src/pages/api/dev-note-search.json.ts](src/pages/api/dev-note-search.json.ts)) and runs a weighted fuzzy search over titles, descriptions, and bodies. The endpoint includes private notes, and it returns a 404 outside of dev. That way, the full index is never published.

[search.astro](src/pages/search.astro) picks one or the other with `import.meta.env.DEV`.

### MDX components

[src/components/global.js](src/components/global.js) registers MDX components once, and every note can use them without importing anything. The one I use most is [BlockQuote](src/components/notes/BlockQuote.astro). It takes `author`, `work`, `medium`, and `cite` props. It formats the attribution and styles the title by medium: italics for books, and quotation marks for essays and articles. If there's a source URL, the whole quote becomes a link to it. The others are `Callout`, `Math`, and Astro's `Image`.

### Offline support and performance

- **Service worker.** [scripts/generate-sw.js](scripts/generate-sw.js) runs before each build and stamps [scripts/sw-template.js](scripts/sw-template.js) with a hash of its contents, so caches are only cleared when the worker itself changes. The worker precaches the home page, tags, search, and the regular font. Fonts are served cache-first. Pages you open are fetched network-first and the last 100 are kept, so notes you've already read still open offline.
- **Navigation.** Astro prefetches every link once it enters the viewport, and cross-document view transitions smooth out page changes.
- **Fonts and caching.** The site uses a self-hosted variable Noto Serif, and the regular weight is preloaded. [public/_headers](public/_headers) sets long-lived immutable caching for hashed assets and images.

### Design

Styles are Sass partials in [src/styles/](src/styles/), plus scoped `<style>` blocks inside components. Colors are OKLCH tokens set with `light-dark()` in [_config.scss](src/styles/_config.scss), so the site follows the OS light or dark setting without a toggle or any JavaScript. Type sizes scale with `clamp()`. Headings use the variable font's width axis for a condensed look, and links in note bodies use small caps. There's also a skip link and a semantic `<search>` element.

### Readwise sync

[scripts/sync-readwise.mjs](scripts/sync-readwise.mjs) pulls my reading highlights from the Readwise export API into Markdown files. I use them as reference material while I write. The script syncs incrementally from the last-sync timestamp and follows pagination cursors. It backs off when Readwise rate-limits it, and it skips the sync if one ran in the last 24 hours (`--force` overrides that). The output folder is gitignored, and every file is marked `private: true`, so highlights never reach the public site.

## Project structure

```text
├── astro.config.mjs        Site config, Markdown pipeline, wikilink resolver
├── wrangler.jsonc          Cloudflare static assets config
├── scripts/
│   ├── generate-sw.js      Writes public/sw.js with a fresh cache version
│   ├── sw-template.js      Service worker source
│   └── sync-readwise.mjs   Imports Readwise highlights as private notes
├── public/                 Fonts, icons, manifest, and Cloudflare _headers
└── src/
    ├── content.config.ts   Collection definitions and frontmatter schema
    ├── content/notes/      The notes (Markdown and MDX)
    ├── lib/notes.ts        getPublicNotes(): the public/private filter
    ├── pages/              Routes: notes, tags, search, RSS, 404, dev API
    ├── layouts/Base.astro  Page shell
    ├── components/         Site chrome, search, and MDX components
    ├── data/config.js      Site title, description, and links
    └── styles/             Sass partials and tokens
```

## Running it locally

```bash
npm install
```

```bash
npm run dev
```

The `dev` script runs the Readwise sync first. If `READWISE_TOKEN` isn't set, the sync prints a warning and the dev server starts anyway.

To build the site and its search index, then preview the result:

```bash
npm run build
```

```bash
npm run preview
```

## Reuse

The code is here to learn from and borrow. The writing is mine, so please don't republish the notes as your own.
