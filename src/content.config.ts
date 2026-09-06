import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({ title: z.string(), description: z.string(), category: z.enum(['Advisory', 'Field notes', 'Archive']), date: z.coerce.date(), cve: z.string().optional(), product: z.string().optional(), featured: z.boolean().default(false), draft: z.boolean().default(true) })
});
const drafts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './editorial/field-rules' }),
  schema: z.object({ title: z.string(), description: z.string(), rule: z.string(), maxim: z.string(), mechanism: z.string(), outcome: z.string(), layout: z.enum(['rulebook', 'casefile']), draft: z.literal(true) })
});
const bugCode = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bug-code' }),
  schema: z.object({ title: z.string(), description: z.string(), rule: z.string(), maxim: z.string(), mechanism: z.string(), outcome: z.string(), layout: z.enum(['rulebook', 'casefile']), date: z.coerce.date(), draft: z.boolean().default(true) })
});
export const collections = { research, drafts, bugCode };
