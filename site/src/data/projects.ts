import { ORIGIN } from './wayne';

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
}

/** Text taken from the original project pages; trimmed, never rewritten. */
export const projectPages: ProjectPage[] = [
  {
    slug: 'world-record-in-pull-ups',
    code: 'PULL-24',
    name: 'World Record in Pull-Ups',
    kicker: 'Project Feynman · subdivision',
    intro: [
      'A subdivision of Project Feynman, the belief that anyone can become good at anything given enough time and effort is the driving force between this endeavor.',
      'Pull-ups have always been a challenge for me. Despite doing them every back workout, after four years of working out I couldn’t do more than 10. After leaving college and moving to a place where I had a pull-up bar installed right outside my door and reading about David Goggin’s’ world record, I knew what I wanted to do.',
      'While writing this in Year 2, I’ve currently been doing 100 pull-ups a day, with a PR of all 100 done in 26 minutes.',
    ],
    facts: [
      ['Goal', 'Most pull-ups in 24 hours'],
      ['Target', '10,000'],
      ['Pace (Year 2)', '100 a day'],
      ['PR', '100 in 26 minutes'],
    ],
    log: [],
    source: `${ORIGIN}/project-feynman/world-record-in-pull-ups/`,
  },
  {
    slug: 'real-estate',
    code: 'RE-LIC',
    name: 'Real Estate Investing',
    kicker: 'Ongoing project',
    intro: [
      'Learning as much as possible about real estate investing, including earning a real estate license, with the aim of representing myself in deals to expand my investment portfolio.',
    ],
    facts: [
      ['Status', 'License earned'],
      ['Pre-licensing exam', 'Passed, June 24, 2024'],
      ['Next', 'VA loan + 1031 exchanges'],
    ],
    logTitle: 'Journal',
    log: [
      { date: 'April 29, 2024', who: 'Project Wayne', text: 'Finished the real estate course about a week ago. Just need to do the final test in person and then the state exam. Have a couple of goals to work on now: 1 – Working on getting experience in the industry so that I know what I’m doing, 2 – Work on building up more capital to invest, and 3 – Finishing off the final two exams so I’m fully licensed.' },
      { date: 'June 14, 2024', who: 'Project Wayne', text: 'Have the real estate course final exam scheduled for later this month, will be cramming the week before and then trying to figure out the next steps towards the state exam.' },
      { date: 'June 26, 2024', who: 'Project Wayne', text: 'UPDATE FROM 6/24 – took and passed the pre-licensing exam. Pretty much forgot about it until the night before but was feeling pretty confident anyway. Studied a Quizlet on the ‘learn’ mode and got an 86%. Need to work out the details but broadly plan to take the state exam before mid-September.' },
      { date: 'September 20, 2024', who: 'Bruce Wayne', text: 'Was supposed to take the state license exam a week ago. Logged into the site the morning of an realized It passed a month ago, I leave for the army soon so I don’t have any time to reschedule. I’ll have to work out some time to take it in the future. Annoyed at myself for messing up like this, as there is not convenient time when I return. The best time to have taken it was now.' },
      { date: 'March 30, 2025', who: 'Bruce Wayne', text: 'UPDATE 3/30/25 – Passed the real estate license exam a month or so ago. It’s useless at the moment, however. I’ve continued to put together some plans in the background to take advantage of the VA loan and 1031 exchanges to build my real estate portfolio. These should start to take effect in around March-April of 2026.' },
    ],
    source: `${ORIGIN}/real-estate/`,
  },
  {
    slug: 'certified-public-accountant',
    code: 'CPA',
    name: 'Certified Public Accountant',
    kicker: 'The accountant',
    intro: [
      'I got the idea of becoming a CPA from the movie, The Accountant. Despite the movie not having anything to do with actual accounting, I thought it would be beneficial to become educated in finances and accounting. This’ll help me when I start my own business.',
      'Since I already was on the senior year of my first undergraduate degree, I had a leg up on the needed 150 credits to sit for the CPA exams. All I would need is the necessary accounting credits and a years worth of experience to complete the requirements.',
      'Western Governor’s University – Needing to complete my credits as soon as possible and with as little time wasted as possible, WGU was the perfect solution. Their competency progression model allowed me to move at my own pace: as long as I passed a final, I would get credit for the class.',
    ],
    facts: [
      ['Project duration', 'One year'],
      ['Degree', 'BS in Accounting · 37 classes'],
      ['School', 'Western Governors University'],
      ['Goal', 'CPA exams'],
    ],
    logTitle: 'Journal · pre-gaming',
    log: [
      { date: '11/21/2023', who: 'Journal', text: 'Finished orientation. Pre-assessments: Organization Behavior passed, Critical Thinking and Logic passed “somehow”, Fundamentals for Success in Business failed, Introduction to Sociology failed, Compensation and Benefits failed, Human Resource Management passed, Principles of Management passed.' },
      { date: '11/22/2023', who: 'Journal', text: 'Met with mentor – doesn’t think I can finish in one term. Fundamentals for Success in Business retaken: passed on the 4th attempt – just didn’t get what I was getting wrong. Sociology, Compensation and Benefits and Concepts in Marketing, Sales, and Consumer Contact all passed on retake.' },
    ],
    source: `${ORIGIN}/certified-public-accountant/`,
  },
  {
    slug: 'b-s-computer-science',
    code: 'BS-CS',
    name: 'B.S. Computer Science',
    kicker: 'Degree tracker',
    intro: [
      'This project tracks my progress in completing a B.S. in computer science. It discusses strategies in lowering the cost of the degree, what schools are viable in the busy life of someone with many other fields of interest, and journals of my experiences.',
      'Not only will this give me a skill I believe Bruce Wayne would have been extremely proficient in, it opens more opportunities for overemployment.',
    ],
    facts: [
      ['Plan', 'Finish in one term'],
      ['Pre-game', 'Sophia.com · about $100 a month'],
      ['Also', 'Harvard CS50'],
    ],
    logTitle: 'Notes',
    log: [
      { date: 'April 3, 2024', who: 'Project Batman', text: 'Goal is to start working on the pre-game for the degree this month. Sophia.com cost around $100 dollars for a month, so the plan is to get all the courses that can possibly be done though there in only one payment. Then I’ll start learning the material in preparation for the rest of the degree. I have previously worked on Harvard’s CS50, will return to that and finish it sometime after finishing up with sophia.com but before starting the actual degree. Goal is to spend as little on the degree as possible, meaning completing the degree in one term. Will undoubtedly be much harder than the accounting degree was.' },
      { date: 'April 29, 2024', who: 'Project Wayne', text: 'Started working on the sophia classes. Have four done so far. Some of the classes require graded assessments (they call them touchstones) that take a little bit to be graded. Between this and the fact that you can only have two classes active at a time, there’s periods of time where I’m stuck waiting on them.' },
      { date: 'September 4, 2024', who: 'Reader', text: 'You should check out DegreeForum.net if you already aren’t aware of it – it’s a great resource for degree hacking. I’m doing Sophia right now as well although for a different degree and university (UMPI).' },
      { date: 'September 4, 2024', who: 'Reader', text: 'Also, I think you’d be better of doing TESU instead of WGU for CS. TESU is a lot quicker and you actually graduate with a GPA which helps you out in case you ever decide to go to grad school.' },
    ],
    source: `${ORIGIN}/b-s-computer-science/`,
  },
  {
    slug: 'mma',
    code: 'MMA',
    name: 'Mixed Martial Arts',
    kicker: 'Training since August 2025',
    intro: [
      '8/18/2025 – Started MMA around two weeks ago, currently training two to two and a half hours a day of skill building and forty-five to an hour fifteen of strength and conditioning in the morning. Currently weighing in at 195 and consuming 5,000 calories a day and 196oz of water.',
      'My training is around a little over an hour of both kickboxing and BJJ 5 times a week and a 6th open mat session. This includes 3x no gi, and 2x gi sessions.',
    ],
    facts: [
      ['Skill work', '2 – 2.5 h a day'],
      ['Strength + conditioning', '45 min – 1 h 15 a morning'],
      ['Weekly', 'Kickboxing + BJJ ×5, open mat ×1'],
      ['Weight · food · water', '195 lb · 5,000 kcal · 196 oz'],
    ],
    logTitle: 'Training models',
    log: [
      { date: 'Model 1', who: 'Fighter', text: 'George St. Pierre – admire his training style and how intentional all of his training seemed.' },
      { date: 'Model 2', who: 'Fighter', text: 'Chael Sonnen – admirable work ethic.' },
      { date: 'Model 3', who: 'Fighter', text: 'Tim Kennedy – trained MMA while full time as an active duty Green Beret.' },
      { date: 'Model 4 · 8/28/2025', who: 'Fighter', text: 'Sage Northcutt – staying lean year-round, eating a clean and healthy diet, and training smart.' },
    ],
    notes: ['Sept 19th, 2025', 'Sept. 15th, 2025', 'Sept. 8th, 2025', 'Sept. 4th, 2025', 'Sept. 3rd, 2025', 'August 29th, 2025', 'August 28th, 2025', 'August 27th, 2025', 'August 26th, 2025', 'August 25th, 2025', 'August 22nd, 2025', 'August 21st, 2025', 'August 20th, 2025', 'August 19th, 2025', 'August 18th, 2025'],
    source: `${ORIGIN}/mma/`,
  },
  {
    slug: 'a-book-a-day',
    code: 'BOOK-1',
    name: 'A Book a Day',
    kicker: 'Mass information consumption',
    intro: [
      'In an attempt to become as informed and knowledgeable as possible, I try to listen to one book a day. The Goodreads profile tracks my progress and shows what I’m currently reading.',
      'This project was inspired by two people, one real and one fictional, Elon Musk being the former, and Bobby Axelrod the latter.',
    ],
    facts: [
      ['Cadence', 'One audiobook a day'],
      ['Tracked on', 'Goodreads'],
      ['Inspired by', 'Elon Musk · Bobby Axelrod'],
    ],
    source: `${ORIGIN}/projects/listening-to-a-book-a-day/`,
  },
  {
    slug: 'project-feynman',
    code: 'FEYN',
    name: 'Project Feynman',
    kicker: 'Anyone can become skilled at anything',
    intro: [
      'I’ve always considered myself to be bad at math. In middle school, I dreaded math class because I knew the teacher would eventually call on me to do something I had no idea how to do. This continued into high school and college, in both of which I was placed into the lowest level math classes possible.',
      'A couple months ago, I came across a video of the Nobel laureate Richard Feynman talking about how he was an “ordinary person who studied hard.” In the various subdivisions of the Feynman Project, I attempt to prove that anyone can study anything and become an ‘expert’ at it.',
    ],
    facts: [
      ['Status', 'Paused'],
      ['SAT division', 'Cancelled, July 1, 2024'],
      ['Subdivision', 'World Record in Pull-Ups'],
    ],
    source: `${ORIGIN}/project-feynman/`,
  },
];

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
