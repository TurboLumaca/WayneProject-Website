// All content is taken from projectwayne.com (read 2026-10-22) and its public
// Google Sheets. Nothing here is invented: where the site gives no number,
// the UI shows a status instead of a progress bar.

export const ORIGIN = 'https://projectwayne.com';
export const PROJECT_START = '2022-11-15T00:00:00'; // first journal entry, "Taking Up the Reins"

export type Theme = 'night' | 'bruce' | 'cave';

export type Wing = 'bruce' | 'batman';

export interface Room {
  id: string;
  label: string;
  blurb: string;
  anchor: string; // hash on the floor's page
}

export interface Floor {
  id: string;
  code: string;
  level: number;
  /** The space, named after places in the films. */
  name: string;
  /** What the space is for on this site. */
  fn: string;
  href: string;
  blurb: string;
  theme: Theme;
  wing: Wing;
  /** Which films the space nods to (2005 onward). */
  ref: string;
  /** One line of atmosphere for the map. */
  mood: string;
  rooms: Room[];
}

export const floors: Floor[] = [
  {
    id: 'atrium', code: 'L42', level: 42, name: 'Penthouse', fn: 'Atrium', href: '/', theme: 'night', wing: 'bruce',
    blurb: 'The manifesto and the numbers.',
    ref: 'Batman Begins · The Dark Knight',
    mood: 'Roof of Wayne Tower. A signal over the city.',
    rooms: [
      { id: 'roof', label: 'The Roof', blurb: 'Manifesto and the day counter', anchor: '' },
      { id: 'manifesto', label: 'Manifesto', blurb: 'Batman has no powers', anchor: '#manifesto' },
    ],
  },
  {
    id: 'record', code: 'L30', level: 30, name: 'Boardroom', fn: 'The Record', href: '/record', theme: 'bruce', wing: 'bruce',
    blurb: 'Four years of accomplishments.',
    ref: 'Batman Begins · The Dark Knight',
    mood: 'Wayne Enterprises, the public face. Minutes of the board.',
    rooms: [1, 2, 3, 4].map((n) => ({ id: `year-${n}`, label: `Year ${n}`, blurb: ['Nov 2022 – Oct 2023', 'Nov 2023 – Oct 2024', 'Nov 2024 – Oct 2025', 'Nov 2025 – present'][n - 1], anchor: `#year-${n}` })),
  },
  {
    id: 'blueprint', code: 'L12', level: 12, name: 'Applied Sciences', fn: 'The Blueprint', href: '/blueprint', theme: 'bruce', wing: 'bruce',
    blurb: 'The phases, finance and research.',
    ref: 'Batman Begins · The Dark Knight',
    mood: 'The basement lab: prototypes, plans, the budget.',
    rooms: [
      { id: 'phases', label: 'The Phases', blurb: 'Finance, then apprenticeship', anchor: '#phases' },
      { id: 'guides', label: 'Finance Rooms', blurb: 'Six strategies toward $1.25M', anchor: '#guides' },
      { id: 'research', label: 'Research', blurb: 'Ideas under evaluation', anchor: '#research' },
    ],
  },
  {
    id: 'archive', code: 'G', level: 0, name: 'Wayne Manor', fn: 'The Archive', href: '/archive', theme: 'bruce', wing: 'bruce',
    blurb: 'Influences and community.',
    ref: 'Batman Begins · The Dark Knight Rises',
    mood: 'The study. The clock on the wall opens the way down.',
    rooms: [
      { id: 'shelf', label: 'The Library', blurb: 'Influences, in his words', anchor: '#shelf' },
      { id: 'community', label: 'The Door', blurb: 'Where the conversation happens', anchor: '#community' },
    ],
  },
  {
    id: 'cases', code: 'B1', level: -1, name: 'Evidence Room', fn: 'Case Files', href: '/cases', theme: 'cave', wing: 'batman',
    blurb: 'Journal, Monk Modes, video scripts.',
    ref: 'The Batman',
    mood: 'Numbered files, a stamp, rain on the skylight.',
    rooms: [
      { id: 'files', label: 'All Case Files', blurb: '29 numbered entries', anchor: '' },
      { id: 'monk', label: 'Monk Modes', blurb: 'Two closed cases', anchor: '#case-8' },
    ],
  },
  {
    id: 'cave', code: 'B3', level: -3, name: 'The Cave', fn: 'Live data', href: '/cave', theme: 'cave', wing: 'batman',
    blurb: 'Live data and active projects.',
    ref: 'Batman Begins · The Dark Knight Rises',
    mood: 'Under the manor. Water, stone, one light.',
    rooms: [
      { id: 'training', label: 'Training Floor', blurb: '10,000 pull-ups, one dot each', anchor: '#pullups' },
      { id: 'track', label: 'The Track', blurb: '1,819.5 miles logged', anchor: '#running' },
      { id: 'workshop', label: 'Workshop', blurb: 'Eight active projects', anchor: '#projects' },
      { id: 'console', label: 'Command Console', blurb: 'Time management systems', anchor: '#system' },
    ],
  },
];

export const floorCode = (level: number) =>
  level > 0 ? `L${String(level).padStart(2, '0')}` : level === 0 ? 'G' : `B${Math.abs(level)}`;

export const manifesto = [
  'Batman has no special powers.',
  'The languages, the physique, the companies he runs, etc.',
  'Products of his relentless work ethic.',
];

export const manifestoLong =
  'What sets Batman apart from other superheroes is that he has no special powers given to him. The languages he knows, the subjects he’s mastered, his Olympic level physique, the companies he runs, etc. are all products of his relentless work ethic.';

export interface Year {
  n: number;
  span: string;
  title: string;
  items: { text: string; key?: boolean }[];
  note?: string;
}

export const years: Year[] = [
  {
    n: 1,
    span: 'Nov 2022 – Oct 2023',
    title: 'Taking up the reins',
    items: [
      { text: 'Earned motorcycle license' },
      { text: 'Ran first marathon and half-marathon', key: true },
    ],
  },
  {
    n: 2,
    span: 'Nov 2023 – Oct 2024',
    title: 'Building the machine',
    items: [
      { text: 'Started the Project Wayne YouTube channel' },
      { text: 'Earned B.S. Business Administration, Accounting', key: true },
      { text: 'Graduated with a B.S. in Fire Science', key: true },
      { text: 'Became a licensed security guard' },
      { text: 'Took the real estate pre-licensing course' },
      { text: 'Started working 80-hour weeks' },
    ],
    note: 'Most of the first two years were unquantifiable: learning the habits and time management needed for bigger goals.',
  },
  {
    n: 3,
    span: 'Nov 2024 – Oct 2025',
    title: 'The output years',
    items: [
      { text: 'YouTube channel hits 1,000 subscribers (Jan 2)' },
      { text: 'Hits 2,000 subscribers (Mar 2025)' },
      { text: 'Built a credit card system for score, benefits and yield' },
      { text: 'Learned to swim through a mentor' },
      { text: 'Completed Army IBOLC', key: true },
      { text: 'Became Infantry Platoon Leader', key: true },
      { text: 'Earned Real Estate License' },
      { text: 'PR’d 5-mile at 34:21' },
      { text: 'Started training MMA (August)' },
    ],
  },
  {
    n: 4,
    span: 'Nov 2025 – present',
    title: 'Habitus',
    items: [
      { text: 'Project goes remote during deployment to the Middle East; returns with a Combat Infantry Badge', key: true },
      { text: 'YouTube channel hits 3,900 subscribers' },
      { text: 'Financial portfolio hits 1/5 of the retirement goal', key: true },
      { text: 'First cut: 190 lb to 160 lb, around 10% body fat' },
      { text: 'Building the Bruce Wayne side: wardrobe, manners, culture, social circles' },
      { text: 'Extreme intentionality, combined with Jocko Willink’s extreme ownership' },
    ],
  },
];

/** What went wrong, from his own journal pages. Dates and wording as written there. */
export const misses: { year: number; date: string; plan: string; said: string }[] = [
  { year: 2, date: '11/21/2023', plan: 'Pass the WGU pre-assessments', said: 'Failed three of seven. Fundamentals for Success in Business took four attempts.' },
  { year: 2, date: 'Jul 1, 2024', plan: 'SAT division of Project Feynman', said: 'Cancelled.' },
  { year: 2, date: 'Sep 20, 2024', plan: 'State real estate exam', said: 'Annoyed at myself for messing up like this. The best time to have taken it was now.' },
  { year: 4, date: 'Feb 2026', plan: 'Running log', said: '4 miles in the whole month. The log notes a bout of COVID.' },
];

export const headline = [
  { value: 4, suffix: '', label: 'Years in the project', sub: 'Since Nov 2022' },
  { value: 3900, suffix: '', label: 'YouTube subscribers', sub: 'Channel started in Year 2' },
  { value: 100, suffix: '', label: 'Pull-ups a day', sub: 'Training for the 24h record' },
];

export const comments = [
  { who: 'Ethan', when: 'Jan 2025', text: 'Can’t wait to see where you are in 5 years time. Nice work' },
  { who: 'Anonymous', when: 'Apr 2025', text: 'keep up the good work, very impressive and inspiring.' },
  { who: 'Anonymous', when: 'Aug 2025', text: 'Love the progress, very inspirational 👏!!!' },
  { who: 'Anonymouskid', when: 'Aug 2025', text: 'Following this journey since the channel had around a thousand or less subscribers… I genuinely am proud of your work.' },
];

export const phases = [
  {
    n: 1,
    name: 'Finance',
    tag: 'Buy back the time',
    text: 'Bruce can spend his time however he likes; a normal person spends a quarter of it earning a living. Phase One puts finances on autopilot: accounts, credit, and a retirement planned as early as possible.',
    href: `${ORIGIN}/phase-1-finance/`,
  },
  {
    n: 2,
    name: 'Global Apprenticeship',
    tag: 'Learn from the world',
    text: 'With finances on autopilot, the polymath pursues the degrees Batman would draw on, and travels the world to learn from a multitude of mentors.',
    href: `${ORIGIN}/phase-two-global-apprenticeship/`,
  },
];

export const blueprintNote = {
  date: '4/7/2025',
  text: 'Leaning towards combining Phase One and Two: acquire skills with a large ROI in both time and money first, then expand. Currently working night security while studying for the CPA.',
};

export const financeGuides = [
  { name: 'FIRE', full: 'Financial Independence, Retire Early', text: 'Invest hard while young; every other strategy here feeds this one.', href: `${ORIGIN}/finance/financial-independence-retire-early-fire/` },
  { name: 'Accounts', full: 'Setting Up Financial Accounts', text: 'The accounts to open first.', href: `${ORIGIN}/setting-up-financial-accounts/` },
  { name: 'Credit', full: 'Credit Card Strategies', text: 'Cash back, and a card strategy that pays for travel.', href: `${ORIGIN}/finance/credit-card-strategies/` },
  { name: 'Profit First', full: 'Profit First Banking Strategy', text: 'Envelope budgeting, done with digital accounts.', href: `${ORIGIN}/finance/profit-first-banking-strategy/` },
  { name: 'Education', full: 'Financing Bruce Wayne’s Education', text: 'Medical, business and law school: who pays.', href: `${ORIGIN}/finance/financing-bruce-waynes-extensive-education/` },
  { name: 'Diet', full: 'Bulking / Dieting on a Budget', text: 'Eating for size or for a cut on a fixed budget.', href: `${ORIGIN}/finance/bulking-dieting-on-a-budget/` },
];

export const research = [
  { name: 'Sleep schedules and techniques', text: 'Polyphasic sleep.', href: `${ORIGIN}/research/polyphasic-sleep-schedules/` },
  { name: 'Wayne’s Education Blueprint', text: 'Which degrees, in what order.', href: `${ORIGIN}/research/waynes-education-blueprint/` },
  { name: 'Mentors', text: 'Who to learn from.', href: `${ORIGIN}/mentors/` },
];

export const influences = [
  { name: 'Chael Sonnen', why: 'MMA and work ethic', kind: 'Fighter' },
  { name: 'Tim Kennedy', why: 'Training MMA on active duty as a Green Beret', kind: 'Soldier' },
  { name: 'Absolute Batman', why: 'Becoming Batman with little to no resources', kind: 'Comic' },
  { name: 'Black Edge', why: 'Information processing and an automated inbox', kind: 'Book' },
  { name: 'Bobby Axelrod', why: 'Billions: huge work capacity', kind: 'Series' },
  { name: 'Ari Gold', why: 'Entourage: work ethic and training', kind: 'Series' },
  { name: 'The Almanack of Naval Ravikant', why: 'Leverage over labor', kind: 'Book' },
];

export const channels = [
  { name: 'YouTube', handle: '3,900 subscribers', href: 'https://www.youtube.com/channel/UCSBUbi9s8nTe5OR_otTaFMA' },
  { name: 'Reddit', handle: 'r/becomingbatman', href: 'https://www.reddit.com/r/becomingbatman/' },
  { name: 'Goodreads', handle: 'A book a day', href: 'https://www.goodreads.com/user/show/179578197-bruce-wayne' },
  { name: 'TikTok', handle: '@projectwayne1', href: 'https://www.tiktok.com/@projectwayne1' },
  { name: 'GitHub', handle: 'ProjectBruceWayne', href: 'https://github.com/ProjectBruceWayne' },
];

export interface CaseFile {
  no: number;
  title: string;
  date: string;
  year: 1 | 2 | 3;
  kind: 'journal' | 'monk' | 'script';
  excerpt?: string;
  closed?: boolean;
  href: string;
}

const N = `${ORIGIN}/notes-observations`;
export const cases: CaseFile[] = [
  { no: 1, title: 'Taking Up the Reins', date: 'Nov 15, 2022', year: 1, kind: 'journal', excerpt: 'Already work out a lot, both with weights, running, rucks. Going to begin learning Chinese soon. The first skill I’ll try to tackle is lockpicking.', href: `${N}/year-1/tuesday-november-15th-2022/` },
  { no: 2, title: 'Wednesday, April 19th, 2023', date: 'Apr 19, 2023', year: 1, kind: 'journal', href: `${N}/year-1/wednesday-april-19th-2023/` },
  { no: 3, title: 'Thursday, June 29th, 2023', date: 'Jun 29, 2023', year: 1, kind: 'journal', href: `${N}/year-1/thursday-june-29th-2023/` },
  { no: 4, title: 'Tuesday, September 19th, 2023', date: 'Sep 19, 2023', year: 1, kind: 'journal', href: `${N}/year-1/tuesday-september-19th-2023/` },
  { no: 5, title: 'Tuesday, October 24th, 2023', date: 'Oct 24, 2023', year: 1, kind: 'journal', href: `${N}/year-1/tuesday-october-24th-2023/` },
  { no: 6, title: 'Thursday, November 9th, 2023', date: 'Nov 9, 2023', year: 1, kind: 'journal', href: `${N}/year-1/thursday-november-9th-2023/` },
  { no: 7, title: 'November', date: 'Nov 2023', year: 2, kind: 'journal', href: `${N}/year-2/november/` },
  { no: 8, title: 'Monk Mode 2', date: 'Mar 3 – May 13, 2024', year: 2, kind: 'monk', closed: true, excerpt: 'The second Monk Mode of Year Two: March 3rd to May 13th.', href: `${N}/year-2/monk-mode-2-march-3rd-may-13th/` },
  { no: 9, title: 'June', date: 'Jun 2024', year: 2, kind: 'journal', excerpt: 'Ten entries. On June 13th he was training at 100 pull-ups a day.', href: `${N}/year-2/june/` },
  { no: 10, title: 'July', date: 'Jul 2024', year: 2, kind: 'journal', href: `${N}/year-2/july/` },
  { no: 11, title: 'Monk Mode 3', date: 'Jul 25 – Sep 20, 2024', year: 2, kind: 'monk', closed: true, excerpt: 'I was previously working 80 hours a week… This only left me with around four hours each day to sleep, workout, run, and build my other business ventures.', href: `${N}/year-2/monk-mode-3-july-25th-sept-20th/` },
  { no: 12, title: 'Sunday, January 5th', date: 'Jan 5, 2025', year: 3, kind: 'journal', href: `${N}/year-2-copyyear-3/sunday-january-5th/` },
  { no: 13, title: 'Sunday, March 30th', date: 'Mar 30, 2025', year: 3, kind: 'journal', excerpt: 'When you’re younger, people focus on seeing your potential but as you get older, they only care about your results.', href: `${N}/year-2-copyyear-3/sunday-march-30th/` },
  ...[16, 17, 18, 19, 20, 21, 23, 24, 28, 30, 31, 34, 35, 38, 40, 41].map((w, i) => ({
    no: 14 + i,
    title: w === 35 ? 'Year 3: Weeks 35 & 36' : `Year 3: Week ${w}`,
    date: `Week ${w}`,
    year: 3 as const,
    kind: 'script' as const,
    href: `${ORIGIN}/youtube/`,
  })),
];

export const pullups = {
  record: 10000,
  daily: 100,
  pr: '26:00',
  pace: '6.94 / min',
  paceNote: '100 every 14:41, for 24 hours',
  since: 'Jun 13, 2024', // the site says "as of", not "started"
  quote: 'Despite doing them every back workout, after four years of working out I couldn’t do more than 10.',
};

// Monthly miles from the public running sheet (Jul 2024 – Aug 2026).
export const running = {
  totalMiles: 1819.5,
  runs: 531,
  longest: 26.22,
  avgPace: '10:48',
  fiveMilePR: '34:21',
  months: [
    ['2024-07', 7.5], ['2024-08', 44], ['2024-09', 29.1], ['2024-10', 77.8], ['2024-11', 108.7], ['2024-12', 90.9],
    ['2025-01', 105.8], ['2025-02', 60.3], ['2025-03', 62.2], ['2025-04', 42.6], ['2025-05', 27.4], ['2025-06', 41.1],
    ['2025-07', 95.1], ['2025-08', 41.8], ['2025-09', 81.5], ['2025-10', 139.2], ['2025-11', 109.2], ['2025-12', 103.8],
    ['2026-01', 52.6], ['2026-02', 4], ['2026-03', 21.9], ['2026-04', 85.2], ['2026-05', 105.9], ['2026-06', 87.5],
    ['2026-07', 84.9], ['2026-08', 109.4],
  ] as [string, number][],
};

export interface Project {
  code: string;
  name: string;
  text: string;
  status: string;
  progress?: number; // only where the site gives a real figure
  progressLabel?: string;
  href: string;
}

export const projects: Project[] = [
  { code: 'FIN-30', name: 'Financial Independence by 30', text: 'Save $1,250,000 by age 30, free to take whatever job he wants.', status: 'Active', progress: 0.2, progressLabel: '1/5 of goal', href: `${ORIGIN}/projects/` },
  { code: 'PULL-24', name: 'World Record in Pull-Ups', text: 'Most pull-ups in 24 hours. Target: 10,000.', status: 'Training', progress: 0.01, progressLabel: '100 / day', href: `${ORIGIN}/project-feynman/world-record-in-pull-ups/` },
  { code: 'RE-LIC', name: 'Real Estate Investing', text: 'Represent himself in deals to grow the portfolio.', status: 'Licensed', progress: 1, progressLabel: 'License earned', href: `${ORIGIN}/real-estate/` },
  { code: 'CPA', name: 'Certified Public Accountant', text: 'Understand the financials of a company before starting one.', status: 'Studying', href: `${ORIGIN}/certified-public-accountant/` },
  { code: 'BS-CS', name: 'B.S. Computer Science', text: 'A skill Bruce Wayne would master, and leverage for overemployment.', status: 'In progress', href: `${ORIGIN}/b-s-computer-science/` },
  { code: 'MMA', name: 'Mixed Martial Arts', text: 'Training since August 2025.', status: 'Training', href: `${ORIGIN}/mma/` },
  { code: 'BOOK-1', name: 'A Book a Day', text: 'One audiobook every day, tracked on Goodreads.', status: 'Daily', href: `${ORIGIN}/projects/listening-to-a-book-a-day/` },
  { code: 'FEYN', name: 'Project Feynman', text: 'Anyone can become skilled at anything. SAT division cancelled.', status: 'Paused', href: `${ORIGIN}/project-feynman/` },
];

export const tools = ['Google Calendar', 'Notion', 'Clockify', 'MyFitnessPal', 'Garmin Connect', 'Trello', 'Gmail'];

// His own line, Case 013 (Mar 30, 2025).
export const caveWall = ['…as you get older,', 'they only care', 'about your results.'];
export const caveWallSource = 'Case 013 · Mar 30, 2025';
