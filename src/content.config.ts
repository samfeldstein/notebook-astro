import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';


const notes = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/notes' }),
  schema: z.object({
    title: z.string(),
    // Accent string or array
    aliases: z
      .union([z.string(), z.array(z.string())])
      .transform((value) => (Array.isArray(value) ? value : [value]))
      .optional(),
    tags: z
      .union([z.string(), z.array(z.string())])
      .nullish()
      .transform((value) => {
        if (value == null) return [];
        return Array.isArray(value) ? value : [value];
      }),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { notes };