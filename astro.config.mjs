import { defineConfig } from 'astro/config'
import remarkSmartypants from 'remark-smartypants'
import remarkWikiLink from 'remark-wiki-link'
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
      [remarkWikiLink, {
        pageResolver: (name) => {
          const rawTarget = name.split('|')[0].trim()
          const targetWithoutHash = rawTarget.split('#')[0].trim()

          const permalink = targetWithoutHash
            .replace(/\.md$/i, '')
            .replace(/ /g, '-')
            .toLowerCase()

          return [permalink]
        },
        hrefTemplate: (permalink) => `/${permalink}`,
        aliasDivider: '|',
      }],
      remarkSmartypants,
    ],
  },

  integrations: [sitemap(), mdx()],
});