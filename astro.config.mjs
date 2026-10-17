import { defineConfig } from 'astro/config'
import remarkSmartypants from 'remark-smartypants'
import remarkWikiLink from 'remark-wiki-link'
import remarkMath from "remark-math"
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import fs from 'node:fs'
import path from 'node:path'

// Map each note's URL path to its `updated` (or `created`) date for the sitemap.
const notesDir = 'src/content/notes'
const noteDates = new Map(
  fs.readdirSync(notesDir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const frontmatter = fs.readFileSync(path.join(notesDir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
      const field = (name) => frontmatter.match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+)`, 'm'))?.[1]
      const date = new Date(field('updated') ?? field('created'))
      return [`/notes/${file.replace(/\.mdx?$/, '')}/`, date]
    })
    .filter(([, date]) => !isNaN(date))
)

// https://astro.build/config
export default defineConfig({
  site: 'https://notes.samfeldstein.xyz',
  server: { host: true },

  // Match Cloudflare's directory-style URLs so links don't redirect.
  trailingSlash: 'always',

  build: {
    // CSS is small (~2 KB gzipped), so inlining beats an extra request.
    inlineStylesheets: 'always',
  },

  // https://docs.astro.build/en/guides/prefetch/
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },

  markdown: {
    remarkPlugins: [
      remarkMath,
      [remarkWikiLink, {
        pageResolver: (name) => {
          const rawTarget = name.split('|')[0].trim();
          const targetWithoutHash = rawTarget.split('#')[0].trim();

          const permalink = targetWithoutHash
            // Note IDs do not include the route prefix.
            .replace(/^notes\//i, '')
            // Support wikilinks written with either Markdown extension.
            .replace(/\.mdx?$/i, '')
            .replace(/ /g, '-')
            .toLowerCase();

          return [permalink];
        },

        // `permalink` is now e.g. `private/how-should-we-spend-our-time`.
        hrefTemplate: (permalink) => `/notes/${permalink}/`,

        aliasDivider: '|',
      }],
      remarkSmartypants,

    ],
  },

  integrations: [
    sitemap({
      serialize(item) {
        const date = noteDates.get(new URL(item.url).pathname)
        if (date) item.lastmod = date.toISOString()
        return item
      },
    }),
    mdx(),
  ],
});