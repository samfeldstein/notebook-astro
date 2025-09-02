import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/notes'}),
});

export const collections = { notes };