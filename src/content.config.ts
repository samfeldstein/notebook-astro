import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';


const notes = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: 'src/content/notes' }),
  schema: z.object({
    title: z.string().optional(),
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
    private: z.boolean(),
    created: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

const letters = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/letters' }),
  schema: z.object({
    title: z.string(),
    private: z.boolean(),
    created: z.coerce.date(),
    location: z.string(),
  }),
});

export const collections = { notes, letters };