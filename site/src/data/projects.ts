import { getCollection } from 'astro:content';

export interface Entry {
  date: string;
  who: string;
  text: string;
}

export interface ProjectPage {
  slug: string;
  code: string; // matches `projects[].code`
  name: string;
  kicker: string;
  intro: string[];
  facts: [string, string][];
  log?: Entry[];
  logTitle?: string;
  notes?: string[]; // titles of post-session notes etc. (titles only)
  source: string;
  img: string;
  imgAlt: string;
}

/** One page per project file in src/content/projects that has a `slug`. */
const entries = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
export const projectPages: ProjectPage[] = entries
  .filter((e) => e.data.slug)
  .map(({ data: d, body }) => ({
    slug: d.slug!,
    code: d.code,
    name: d.name,
    kicker: d.kicker ?? '',
    intro: (body ?? '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean),
    facts: d.facts.map((f) => [f.label, f.value] as [string, string]),
    log: d.log,
    logTitle: d.logTitle,
    notes: d.notes.length ? d.notes : undefined,
    source: d.source ?? d.href,
    img: d.img ?? '',
    imgAlt: d.imgAlt ?? '',
  }));

/** WGU pre-assessments (certified-public-accountant.md). */
export const preAssessments: { name: string; passed: boolean }[] =
  entries.find((e) => e.data.preAssessments)?.data.preAssessments ?? [];

/** Dated beats for projects with no photo of their own; `miss` marks a stumble. */
export const timelines: Record<string, { date: string; text: string; miss?: boolean }[]> = Object.fromEntries(
  entries.filter((e) => e.data.slug && e.data.timeline).map((e) => [e.data.slug!, e.data.timeline!])
);

export const projectBySlug = (s: string) => projectPages.find((p) => p.slug === s)!;
export const slugForCode = (code: string) => projectPages.find((p) => p.code === code)?.slug;

export interface Post {
  who: string;
  date: string;
  text: string;
  reply?: boolean; // answer to the post above
  owner?: boolean;
}

export const forumPosts: Post[] = [
  { who: 'Project Batman', date: 'April 2, 2024', owner: true, text: 'Still figuring out how to edit the site. Just discovered a bunch of ways to improve the look of the site. Will work more on he site tomorrow, early.' },
  { who: 'Project Wayne', date: 'June 13, 2024', owner: true, text: 'More construction on the site, organizing the journal entries into years and uploading a ton of new pages and projects underway…' },
  { who: 'José Pérez', date: 'June 15, 2024', text: 'Hello, Project Wayne! Just wanted to tell you that I find the website typography and the background images behind the text somewhat intruding and annoying. They were specially odd while reading the Friday 14th and Time Management Blogpost. I find it much better to just have pictures on the top of the pages and not behind the post’s content.' },
  { who: 'Project Wayne', date: 'June 15, 2024', owner: true, reply: true, text: 'Thanks for the feedback! I’ll definitely fix that.' },
  { who: 'Anonymous', date: 'August 6, 2024', text: 'Hey, Project Batman! I just wanted to say your project is extremely interesting and that I wish for your victory!' },
  { who: 'Anonymous', date: 'October 24, 2024', text: 'Hey man – Love the project! Very interesting project and I’m curious to see what the future brings!' },
  { who: 'Anonymous', date: 'August 11, 2025', text: 'Yoski mcbroski' },
  { who: 'Anonymous', date: 'August 21, 2025', text: 'Good stuff with the site updates' },
];
