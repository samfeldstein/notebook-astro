import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/notes' }),
  schema: z.object({
    title: z.string(),
    aliases: z.string().optional(),
    tags: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { notes };