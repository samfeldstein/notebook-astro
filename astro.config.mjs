import { defineConfig } from 'astro/config'
import remarkSmartypants from 'remark-smartypants'
import remarkWikiLink from 'remark-wiki-link'
import remarkMath from "remark-math"
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  site: 'https://notes.samfeldstein.xyz',
  server: { host: true },

  vite: {
    build: {
      // Limit inline css (default is...lower)
      assetsInlineLimit: 14000,
    },
  },

  // https://docs.astro.build/en/guides/prefetch/
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
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
        hrefTemplate: (permalink) => `/notes/${permalink}`,

        aliasDivider: '|',
      }],
      remarkSmartypants,

    ],
  },

  integrations: [sitemap(), mdx()],
});