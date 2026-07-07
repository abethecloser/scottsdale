// Default content = the approved demo content, used as a fallback whenever
// Sanity is not yet connected OR a given list/field is empty. This guarantees
// the site is never blank: it ships looking exactly like the approved demo,
// and each piece is progressively replaced as the client adds real content in
// the CMS. All images here are plain URL strings (Unsplash placeholders);
// Sanity images are normalised to URL strings in queries.ts, so components
// only ever deal with `imageUrl` / `imageAlt` strings — one render path.

export interface SiteSettings {
  phone: string;
  tel: string;
  email: string;
  address: string;
  hours: string;
  heroSubheadline: string;
  heroImageUrl: string;
  heroImageAlt: string;
  statWinRate: string;
  statTrained: string;
  statRampWeeks: string;
}

export interface Program {
  title: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  imageAlt: string;
  badge?: string;
  body?: any; // PortableText array (detail page)
}

export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  imageAlt: string;
  objectPosition?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  titleCompany: string;
  imageUrl?: string;
  rating: number;
}

export interface CaseStudy {
  category: string;
  headlineStat: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export interface GalleryImage {
  imageUrl: string;
  imageAlt: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: string;
  seoTitle?: string;
  metaDescription?: string;
  author?: { name: string; role: string; imageUrl?: string };
  body?: any; // PortableText array
}

const U = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: '(480) 555-1234',
  tel: '+14805551234',
  email: 'hello@scottsdalesalestraining.com',
  address: 'Scottsdale, Arizona',
  hours: 'Mon-Fri 8-5 MST',
  heroSubheadline:
    'Practical sales coaching that shortens your cycle and lifts win rates, built around the real deals your team is working right now.',
  heroImageUrl: U('photo-1505373877841-8d25f7d46678', 1700),
  heroImageAlt: 'Sales training workshop in session',
  statWinRate: '38%',
  statTrained: '2,500+',
  statRampWeeks: '8 wks',
};

const para = (text: string) => ({
  _type: 'block',
  style: 'normal',
  children: [{ _type: 'span', text }],
});

export const DEFAULT_PROGRAMS: Program[] = [
  {
    title: 'Sales Team Workshops',
    slug: 'sales-team-workshops',
    shortDescription: 'Role-play driven sessions, on-site or virtual.',
    imageUrl: U('photo-1543269865-cbf427effbad', 800),
    imageAlt: 'Team workshops',
    badge: 'Most booked',
    body: [
      para('Our team workshops rebuild how your reps sell, one real deal at a time. Sessions are role-play driven and run on-site or virtually, so the whole team practices the exact conversations they have every week.'),
      para('We tailor each session to your pipeline: objection handling, discovery, negotiation, and closing. Reps leave with a shared language and a playbook they actually use.'),
    ],
  },
  {
    title: '1-on-1 Coaching',
    slug: '1-on-1-coaching',
    shortDescription: 'Private weekly coaching for reps and leaders.',
    imageUrl: U('photo-1573497019940-1c28c88b4f3e', 800),
    imageAlt: '1-on-1 coaching',
    body: [para('Private weekly coaching for individual reps and sales leaders. We work live deals, sharpen skills, and build the habits that compound into quota-crushing quarters.')],
  },
  {
    title: 'Sales Leadership',
    slug: 'sales-leadership',
    shortDescription: 'Coach deals, forecast, build a winning culture.',
    imageUrl: U('photo-1542744173-8e7e53415bb0', 800),
    imageAlt: 'Sales leadership',
    body: [para('Give your managers the tools to coach deals, forecast with confidence, and build a culture that wins. Leadership is the multiplier on every rep you hire.')],
  },
  {
    title: 'Keynotes & Kickoffs',
    slug: 'keynotes-and-kickoffs',
    shortDescription: 'High-energy talks for kickoffs and conferences.',
    imageUrl: U('photo-1475721027785-f74eccf877e2', 800),
    imageAlt: 'Keynotes and kickoffs',
    body: [para('High-energy, practical keynotes for sales kickoffs and conferences. Your team leaves fired up and armed with something they can use on Monday morning.')],
  },
  {
    title: 'New-Hire Ramp',
    slug: 'new-hire-ramp',
    shortDescription: 'Get new reps to quota in weeks, not months.',
    imageUrl: U('photo-1556761175-b413da4baf72', 800),
    imageAlt: 'New-hire ramp',
    body: [para('A structured onboarding program that gets new reps to quota in weeks instead of months. Clear milestones, real practice, and fast feedback.')],
  },
];

export const DEFAULT_TEAM: TeamMember[] = [
  { name: 'Brad', role: 'Founder & Head Coach', imageUrl: '/brad-founder-sales-coach.jpg', imageAlt: 'Brad, founder and head sales coach at Scottsdale Sales Training, Scottsdale AZ', objectPosition: '50% 22%' },
  { name: 'Sarah Whitfield', role: 'Lead Sales Coach', imageUrl: U('photo-1573497019940-1c28c88b4f3e', 500), imageAlt: 'Sarah Whitfield, lead sales coach' },
  { name: 'David Okafor', role: 'Enablement Lead', imageUrl: U('photo-1507003211169-0a1dd7228f2d', 500), imageAlt: 'David Okafor, enablement lead' },
  { name: 'Elena Marchetti', role: 'Negotiation Coach', imageUrl: U('photo-1487412720507-e7ab37603c6f', 500), imageAlt: 'Elena Marchetti, negotiation coach' },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { quote: 'Our close rate jumped 30% in one quarter. The role-play sessions completely changed how my reps handle objections.', name: 'Marcus Delgado', titleCompany: 'VP Sales, mid-market SaaS', imageUrl: U('photo-1560250097-0b93528c311a', 120), rating: 5 },
  { quote: "Best sales investment we've made. Practical, energizing, and the follow-up coaching kept it from fading.", name: 'Dana Russo', titleCompany: 'Founder, creative agency', imageUrl: U('photo-1573497019940-1c28c88b4f3e', 120), rating: 5 },
  { quote: "My new hires used to take six months to ramp. After this program, they're hitting quota in eight weeks.", name: 'Eric Lindqvist', titleCompany: 'Sales Director, distribution', imageUrl: U('photo-1472099645785-5658abf4ff4e', 120), rating: 5 },
  { quote: 'The discovery framework alone paid for the whole engagement. Bigger deals, shorter cycles.', name: 'Priya Nair', titleCompany: 'RevOps Lead, fintech', imageUrl: U('photo-1507003211169-0a1dd7228f2d', 120), rating: 5 },
];

export const DEFAULT_CASE_STUDIES: CaseStudy[] = [
  { category: 'SaaS · 12 reps', headlineStat: '+30% close rate', description: 'A quarter of role-play driven workshops rebuilt their objection handling and discovery.', imageUrl: U('photo-1543269865-cbf427effbad', 800), imageAlt: 'SaaS sales team' },
  { category: 'Distribution · new hires', headlineStat: '8-week ramp', description: 'A structured ramp program cut time-to-quota from six months to eight weeks.', imageUrl: U('photo-1521737711867-e3b97375f902', 800), imageAlt: 'Distribution sales team' },
  { category: 'Fintech · RevOps', headlineStat: 'Bigger deals', description: 'A new discovery framework lifted average deal size and shortened the cycle.', imageUrl: U('photo-1542744173-8e7e53415bb0', 800), imageAlt: 'Fintech RevOps team' },
];

export const DEFAULT_GALLERY: GalleryImage[] = [
  { imageUrl: U('photo-1517048676732-d65bc937f952', 600), imageAlt: 'Workshop session' },
  { imageUrl: U('photo-1600880292203-757bb62b4baf', 600), imageAlt: 'Team collaborating' },
  { imageUrl: U('photo-1521791136064-7986c2920216', 600), imageAlt: 'Handshake after a deal' },
  { imageUrl: U('photo-1559136555-9303baea8ebd', 600), imageAlt: 'Coaching conversation' },
  { imageUrl: U('photo-1454165804606-c3d57bc86b40', 600), imageAlt: 'Strategy meeting' },
  { imageUrl: U('photo-1507537297725-24a1c029d3ca', 600), imageAlt: 'Presenter at a workshop' },
  { imageUrl: U('photo-1556761175-b413da4baf72', 600), imageAlt: 'Virtual training session' },
  { imageUrl: U('photo-1551836022-d5d88e9218df', 600), imageAlt: 'Reps taking notes' },
];

export const DEFAULT_POSTS: BlogPost[] = [
  {
    title: 'The 4 objections that actually kill deals',
    slug: 'four-objections-that-kill-deals',
    category: 'Objection handling',
    excerpt: 'Most lost deals die on the same handful of objections. Here is how to see them coming and handle them before they end the conversation.',
    coverImageUrl: U('photo-1556761175-b413da4baf72', 800),
    coverImageAlt: 'Rep handling an objection on a call',
    publishedAt: '2026-06-24',
    author: { name: 'Brad', role: 'Founder & Head Coach', imageUrl: '/brad-founder-sales-coach.jpg' },
    body: [
      para('Every rep hears the same objections, yet the same objections keep ending deals. The difference between a rep who closes and one who stalls is rarely talent. It is preparation.'),
      para('In this piece we break down the four objections that actually kill deals: price, timing, authority, and status quo. For each, you get the signal to watch for and the move that keeps the conversation alive.'),
    ],
  },
  {
    title: 'Questions that make buyers sell themselves',
    slug: 'questions-that-make-buyers-sell-themselves',
    category: 'Discovery',
    excerpt: 'Great discovery is not an interrogation. The right questions get the buyer to articulate the cost of doing nothing.',
    coverImageUrl: U('photo-1600880292203-757bb62b4baf', 800),
    coverImageAlt: 'Discovery conversation between two people',
    publishedAt: '2026-06-18',
    author: { name: 'Brad', role: 'Founder & Head Coach', imageUrl: '/brad-founder-sales-coach.jpg' },
    body: [para('The best discovery questions do not sell your product. They help the buyer sell themselves by making the cost of the status quo impossible to ignore.')],
  },
  {
    title: 'A 30-60-90 that gets reps to quota faster',
    slug: '30-60-90-that-gets-reps-to-quota-faster',
    category: 'Ramp',
    excerpt: 'A ramp plan is not a checklist of trainings. It is a sequence of small wins that build a rep who can carry a number.',
    coverImageUrl: U('photo-1517048676732-d65bc937f952', 800),
    coverImageAlt: 'New hire onboarding at a desk',
    publishedAt: '2026-06-10',
    author: { name: 'Brad', role: 'Founder & Head Coach', imageUrl: '/brad-founder-sales-coach.jpg' },
    body: [para('A great 30-60-90 is a sequence of small, compounding wins. Here is the ramp we use to get new reps carrying a real number in eight weeks.')],
  },
];
