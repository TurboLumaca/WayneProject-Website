import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every journal entry, Monk Mode and video script is one file in src/content/cases.
// The body of the file is the excerpt shown on the card.
const cases = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cases' }),
  schema: z.object({
    no: z.number().int(),
    title: z.string(),
    date: z.string(),
    year: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    kind: z.enum(['journal', 'monk', 'script']),
    closed: z.boolean().optional(),
    href: z.string().url(),
  }),
});

// Every project is one file in src/content/projects. The body is the brief (paragraphs).
// Projects without a `slug` have no page of their own and link out to `href`.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number().int(),
    code: z.string(),
    name: z.string(),
    text: z.string(),
    status: z.string(),
    progress: z.number().min(0).max(1).optional(), // only where a real number exists
    progressLabel: z.string().optional(),
    href: z.string().url(),
    slug: z.string().optional(),
    kicker: z.string().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    logTitle: z.string().optional(),
    log: z.array(z.object({ date: z.string(), who: z.string(), text: z.string() })).default([]),
    notes: z.array(z.string()).default([]),
    source: z.string().optional(),
    img: z.string().optional(),
    imgAlt: z.string().optional(),
    timeline: z.array(z.object({ date: z.string(), text: z.string(), miss: z.boolean().optional() })).optional(),
    preAssessments: z.array(z.object({ name: z.string(), passed: z.boolean() })).optional(),
  }),
});

export const collections = { cases, projects };
