import { defineConfig } from 'astro/config';
import remarkSmartypants from 'remark-smartypants'
import remarkWikiLink from 'remark-wiki-link';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://notes.samfeldstein.xyz',

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
          const pageName = name.split('|')[0].trim();
          return [pageName.replace(/ /g, '-').toLowerCase()];
        },
        hrefTemplate: (permalink) => `/notes/${permalink}`,
        aliasDivider: '|',
      }],
      remarkSmartypants,
    ],
  },

  integrations: [sitemap(), mdx()],
});