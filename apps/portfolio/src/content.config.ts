import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { SECTION_IDS } from './data/site';

const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: ({ image }) =>
    z.object({
      section: z.enum(SECTION_IDS),
      title: z.string(),
      link: z.url().optional(),
      description: z.string(),
      thumbnail: image().optional(),
      keywords: z.array(z.string()),
    }),
});

export const collections = { projects };
