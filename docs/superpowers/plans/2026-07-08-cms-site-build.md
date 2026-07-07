# Scottsdale Sales Training — CMS Site Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved static `index-premium.html` demo into the real, deployed Scottsdale Sales Training website, where the client edits content himself through Sanity CMS.

**Architecture:** Astro (static) generates the public site at build time, pulling marketing content from Sanity's hosted dataset. Supabase stays purely for lead capture (`/api/lead` → `leads` table → Resend email), unchanged from the house pattern. Sanity Studio (free, Sanity-hosted) is the client's editing screen; publishing there fires a webhook to a Vercel Deploy Hook, which rebuilds and republishes the site.

**Tech Stack:** Astro 5 · Tailwind CSS v3.4 (`@astrojs/tailwind`) · Sanity v3 (`sanity`, `@sanity/client`, `@sanity/image-url`) · `@astrojs/sitemap` · Vercel (adapter + hosting) · Supabase + Resend (leads only, existing).

## Global Constraints

- **Design is fixed, content is editable.** Colors, fonts, layout, animations, page structure must match `index-premium.html` exactly. The client edits content only — never a page builder.
- **Brand tokens (verbatim from demo):** `ink:#0B0E0C`, `char:#131714`, `emerald:#0E3A2C` (light `#1C7A5A`, deep `#082319`, glow `#23A579`), `gold:#C9A24A` (goldlt `#E2C26C`), `paper:#F5F2EA`, `paper2:#ECE7D9`, `inkt:#16170F`. Fonts: Inter (body), Playfair Display italic (accent words only).
- **No AI-slop tells** (from repo `CLAUDE.md`): no fake-metallic gold gradients, no gradient text on large headings, no centered-everything layouts, no em-dashes as decoration, no filler copy. Flat gold only.
- **Motion:** transform/opacity only, 150–300ms, `prefers-reduced-motion` disables all animation (the demo already does this — preserve it).
- **Secrets server-side only:** Supabase service-role key + Resend key live in Vercel env vars, never in client bundles. Sanity read uses a public dataset (no token needed for published marketing content).
- **Images require alt text** on every Sanity image field.
- **Lead form** keeps the existing honeypot field (`company_website`) and posts to `/api/lead`.
- **git identity for this repo:** name `ShanIngrid1207`, email `aittagala@mymail.mapua.edu.ph` (already set repo-locally).
- **Every tier ships valid `LocalBusiness` schema** — here generated from Sanity Site Settings, not hardcoded.

## File Structure

```
demodesigns/
  demos/                          # OLD static demos, preserved for reference
    index.html                    # (moved) showcase/compare page
    index-basic.html              # (moved)
    index-standard.html           # (moved)
    index-premium.html            # (moved) — SOURCE OF TRUTH for the port
  public/
    fulllogo-wide.jpg             # from "FullLogo Wide.jpg"
    fulllogo.jpg                  # from "FullLogo.jpg"
    brad-founder-sales-coach.jpg  # existing headshot
    robots.txt
  src/
    lib/
      sanity.ts                   # Sanity client + image URL builder
      queries.ts                  # GROQ queries (typed helpers)
      seo.ts                      # JSON-LD builders (LocalBusiness, BlogPosting)
    layouts/
      Base.astro                  # <head>, fonts, tailwind, global CSS, meta/OG/canonical, page shell
    components/
      Header.astro
      Hero.astro
      SkillsMarquee.astro
      BentoStats.astro
      ProgramsCarousel.astro
      GalleryMarquee.astro
      Testimonials.astro
      Coaches.astro
      CaseStudies.astro
      BlogTeaser.astro
      LeadForm.astro
      CtaBand.astro
      Footer.astro
      RevealScripts.astro         # the shared inline JS (word-reveal, carousels, lightbox, year)
    pages/
      index.astro                 # homepage — composes the components
      programs/[slug].astro       # one page per program
      blog/index.astro            # blog listing
      blog/[slug].astro           # single post
      api/lead.ts                 # serverless lead handler (Supabase + Resend)
    styles/
      global.css                  # the <style> block from the demo, ported
  sanity/                         # Sanity Studio project (schemas live here)
    sanity.config.ts
    schemaTypes/
      index.ts
      siteSettings.ts
      program.ts
      teamMember.ts
      testimonial.ts
      caseStudy.ts
      galleryImage.ts
      blogPost.ts
      blockContent.ts
  astro.config.mjs
  tailwind.config.mjs
  tsconfig.json
  package.json
  .env                            # gitignored — local dev keys
  .env.example                    # committed — documents required vars
  docs/superpowers/…              # spec + this plan
```

**Verification approach for a static marketing site:** "tests" = (1) `npm run build` succeeds with expected page count, (2) headless-Chrome screenshot renders correctly, (3) structured data is valid JSON. Use Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`. NOTE (from prior builds): this machine's 125% display scaling clamps the headless viewport to a **482px minimum** — screenshot mobile at width **482**, desktop at **1280**; `--window-size` below 482 only crops, it does not shrink the layout. Below-fold scroll-reveal content is hidden in static screenshots — capture with `--force-prefers-reduced-motion` so reveals show immediately.

---

## Phase A — Deployable Astro shell (pixel-match the demo, hardcoded content)

Goal of this phase: a Vercel-deployable Astro site that looks identical to `index-premium.html`, with content still hardcoded. This is the **hero checkpoint** from the repo's workflow ritual — get a thumbs-up on the real rendered site before wiring the CMS.

### Task A1: Preserve demos, scaffold Astro, port config

**Files:**
- Move: `index.html`, `index-basic.html`, `index-standard.html`, `index-premium.html` → `demos/`
- Move + rename: `FullLogo Wide.jpg` → `public/fulllogo-wide.jpg`, `FullLogo.jpg` → `public/fulllogo.jpg`, `brad-founder-sales-coach.jpg` → `public/brad-founder-sales-coach.jpg`
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `.env.example`, `.gitignore` (append)

- [ ] **Step 1: Preserve the demos and images**

```bash
cd "C:\Users\tagal\demodesigns"
mkdir -p demos public
git mv "index.html" demos/index.html
git mv "index-basic.html" demos/index-basic.html
git mv "index-standard.html" demos/index-standard.html
git mv "index-premium.html" demos/index-premium.html
git mv "FullLogo Wide.jpg" public/fulllogo-wide.jpg
git mv "FullLogo.jpg" public/fulllogo.jpg
git mv "brad-founder-sales-coach.jpg" public/brad-founder-sales-coach.jpg
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "scottsdale-sales-training",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.2.1",
    "@astrojs/tailwind": "^5.1.4",
    "@astrojs/vercel": "^8.0.4",
    "@sanity/client": "^6.24.1",
    "@sanity/image-url": "^1.1.0",
    "astro": "^5.1.1",
    "resend": "^4.0.1",
    "tailwindcss": "^3.4.17"
  }
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static output with a serverless function for /api/lead.
export default defineConfig({
  site: 'https://scottsdalesalestraining.com', // provisional; update at domain cutover
  output: 'static',
  adapter: vercel(),
  integrations: [tailwind(), sitemap()],
});
```

- [ ] **Step 4: Create `tailwind.config.mjs`** (ports the demo's `tailwind.config` object 1:1)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E0C', char: '#131714',
        emerald: { DEFAULT: '#0E3A2C', light: '#1C7A5A', deep: '#082319', glow: '#23A579' },
        gold: '#C9A24A', goldlt: '#E2C26C',
        paper: '#F5F2EA', paper2: '#ECE7D9', inkt: '#16170F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '3rem' },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "sanity"]
}
```

- [ ] **Step 6: Create `.env.example`** and append to `.gitignore`

`.env.example`:
```
# Sanity (public read — safe to expose project id/dataset)
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=production

# Supabase (leads) — SERVER ONLY
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (lead notification email) — SERVER ONLY
RESEND_API_KEY=
LEAD_NOTIFY_TO=info@scottsdalesalestraining.com
LEAD_NOTIFY_FROM=leads@scottsdalesalestraining.com
```

Append to `.gitignore`:
```
# Astro / Node
dist/
.astro/
node_modules/
.env
.vercel/
# Sanity build
sanity/dist/
```

- [ ] **Step 7: Install and verify the scaffold builds empty**

Run (USER runs long installs per house convention — this is quick, agent may run it):
```bash
cd "C:\Users\tagal\demodesigns" && npm install
```
Create a throwaway `src/pages/index.astro` containing `<h1>ok</h1>`, then:
```bash
npm run build
```
Expected: build succeeds, `dist/` produced. (This throwaway page is replaced in Task A3.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, preserve demos under demos/"
```

### Task A2: Base layout + global styles + shared scripts

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/RevealScripts.astro`

**Interfaces:**
- Produces: `Base.astro` accepts props `{ title: string; description: string; canonical?: string; ogImage?: string; jsonLd?: string[] }` and a default `<slot />`. Renders the full `<head>` (fonts, tailwind, global.css, meta/OG/twitter, canonical, theme-color, each `jsonLd` string in its own `<script type="application/ld+json">`), the `<body class="bg-white text-inkt">` outer `<div class="p-3 sm:p-5">` wrapper, `<slot />`, then `<RevealScripts />`.
- Produces: `RevealScripts.astro` = the demo's trailing `<script>` (word-reveal, `.reveal` IntersectionObserver, carousels with `[data-carousel]`/`[data-track]`/`[data-prev]`/`[data-next]`/`[data-dots]`/`[data-auto]`, video lightbox, footer year) copied verbatim, plus the `#lightbox` markup.

- [ ] **Step 1: Port `src/styles/global.css`** — copy the entire `<style>` block from `demos/index-premium.html` lines 36–75 (the `.accent`, `.display`, `.word`, `.reveal`, `.kenburns`, `.mq`, `.car`, reduced-motion block, etc.) verbatim into `global.css`. Keep the `@media (prefers-reduced-motion: reduce)` rules exactly.

- [ ] **Step 2: Create `src/layouts/Base.astro`** — `<head>` mirrors `demos/index-premium.html` lines 3–34 but: link `global.css` via `import '../styles/global.css'`; keep Google Fonts `<link>` (Inter + Playfair Display italic, `display=swap`); KEEP Tailwind via `@astrojs/tailwind` (remove the CDN `<script src="cdn.tailwindcss.com">` and the inline `tailwind.config` — those now live in `tailwind.config.mjs`). Title/description/OG/canonical come from props. Render `jsonLd` array items each in their own `application/ld+json` script. Include the `#g-ink` inline SVG defs (demo lines 80–82).

- [ ] **Step 3: Create `src/components/RevealScripts.astro`** — copy the `#lightbox` block (demo lines 405–414) and the final `<script>` IIFE (demo lines 416–479) verbatim. This is design behavior, not content — it stays identical.

- [ ] **Step 4: Verify** — temporary `index.astro` that renders `<Base title="test" description="test"><p class="accent">hello</p></Base>`; `npm run build` succeeds; `npm run dev` and screenshot confirms Playfair italic gold "hello" renders (fonts + tailwind + global.css all wired).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: base layout, ported global styles, shared scripts"
```

### Task A3: Port all sections as components (hardcoded content) + assemble homepage

**Files:**
- Create the 13 component files under `src/components/` (see File Structure) + `src/pages/index.astro`

**Interfaces:**
- Each component is initially a **verbatim markup port** of its section from `demos/index-premium.html`, with `src="https://images.unsplash.com/..."` and text left as-is (hardcoded). Section → source line ranges:
  - `Header.astro` ← lines 87–96 (logo `src="/fulllogo-wide.jpg"`)
  - `Hero.astro` ← lines 99–121
  - `SkillsMarquee.astro` ← lines 124–133
  - `BentoStats.astro` ← lines 136–195 (id `results`)
  - `ProgramsCarousel.astro` ← lines 198–231
  - `GalleryMarquee.astro` ← lines 234–271
  - `Testimonials.astro` ← lines 274–302
  - `Coaches.astro` ← lines 305–316 (Brad `src="/brad-founder-sales-coach.jpg"`)
  - `CaseStudies.astro` ← lines 319–335
  - `BlogTeaser.astro` ← lines 337–345 (id `insights`)
  - `LeadForm.astro` ← lines 348–372 (INCLUDING the honeypot + the inline submit script at 372)
  - `CtaBand.astro` ← lines 374–385
  - `Footer.astro` ← lines 388–401

- [ ] **Step 1:** Create each component file, pasting its exact source range. Fix asset paths to `/fulllogo-wide.jpg` and `/brad-founder-sales-coach.jpg`. Leave everything else identical.

- [ ] **Step 2:** Create `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import SkillsMarquee from '../components/SkillsMarquee.astro';
import BentoStats from '../components/BentoStats.astro';
import ProgramsCarousel from '../components/ProgramsCarousel.astro';
import GalleryMarquee from '../components/GalleryMarquee.astro';
import Testimonials from '../components/Testimonials.astro';
import Coaches from '../components/Coaches.astro';
import CaseStudies from '../components/CaseStudies.astro';
import BlogTeaser from '../components/BlogTeaser.astro';
import LeadForm from '../components/LeadForm.astro';
import CtaBand from '../components/CtaBand.astro';
import Footer from '../components/Footer.astro';
---
<Base
  title="Scottsdale Sales Training | Sales Coaching & Workshops, Scottsdale AZ"
  description="Practical sales training and coaching in Scottsdale, AZ. Shorten your sales cycle, lift win rates, and build a team that loves to close. Call (480) 555-1234."
>
  <Header />
  <Hero />
  <SkillsMarquee />
  <BentoStats />
  <ProgramsCarousel />
  <GalleryMarquee />
  <Testimonials />
  <Coaches />
  <CaseStudies />
  <BlogTeaser />
  <LeadForm />
  <CtaBand />
  <Footer />
</Base>
```

- [ ] **Step 3: Verify pixel-match** — `npm run build` (expect 1 page + sitemap). Then `npm run dev`; screenshot desktop (1280) and mobile (482) with `--force-prefers-reduced-motion` and compare against `demos/index-premium.html` opened the same way. They must be visually identical.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: port premium demo to Astro components (hardcoded content)"
```

**>>> HERO CHECKPOINT:** Deploy this to Vercel (Phase E, Task E1 can run now for a preview URL) and get the user's thumbs-up that the real rendered site matches the demo before wiring the CMS.

---

## Phase B — Sanity content layer

### Task B1: Sanity Studio project + schemas

**Files:**
- Create: `sanity/sanity.config.ts`, `sanity/schemaTypes/*.ts`

- [ ] **Step 1: Scaffold the Studio** (USER runs — it is interactive: prompts for Sanity login + project name)

```bash
cd "C:\Users\tagal\demodesigns"
npm create sanity@latest -- --template clean --create-project "Scottsdale Sales Training" --dataset production --output-path sanity --typescript --no-eslint
```
This creates the `sanity/` project and prints a **PROJECT ID** — record it; it goes into `.env` as `PUBLIC_SANITY_PROJECT_ID`.

- [ ] **Step 2: `sanity/schemaTypes/blockContent.ts`** (rich text for blog bodies)

```ts
import { defineType, defineArrayMember } from 'sanity';
export default defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'link', type: 'object', title: 'Link',
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }],
    }),
  ],
});
```

- [ ] **Step 3: `sanity/schemaTypes/siteSettings.ts`** (singleton)

```ts
import { defineType, defineField } from 'sanity';
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'phone', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'email', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'address', type: 'string', title: 'Address / City' }),
    defineField({ name: 'hours', type: 'string', title: 'Opening hours', description: 'e.g. Mon-Fri 8-5 MST' }),
    defineField({ name: 'heroHeadline', type: 'string', title: 'Hero headline' }),
    defineField({ name: 'heroSubheadline', type: 'text', rows: 2, title: 'Hero subheadline' }),
    defineField({
      name: 'heroImage', type: 'image', title: 'Hero background photo', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }],
    }),
    defineField({ name: 'statWinRate', type: 'string', title: 'Stat: win-rate lift', description: 'e.g. 38%' }),
    defineField({ name: 'statTrained', type: 'string', title: 'Stat: reps trained', description: 'e.g. 2,500+' }),
    defineField({ name: 'statRampWeeks', type: 'string', title: 'Stat: new-hire ramp', description: 'e.g. 8 wks' }),
  ],
});
```

- [ ] **Step 4:** Create the remaining list schemas with an `order` number field on each (drives display order via `| order(order asc)`), all image fields carrying a required `alt`:
  - `program.ts` — `title`, `slug` (source: title), `shortDescription` (text), `image`(+alt), `badge` (string, optional), `body` (blockContent, for the detail page), `order`.
  - `teamMember.ts` — `name`, `role`, `image`(+alt), `order`.
  - `testimonial.ts` — `quote` (text), `name`, `titleCompany` (string), `image`(+alt, optional), `rating` (number, 1–5, default 5), `order`.
  - `caseStudy.ts` — `category` (string), `headlineStat` (string), `description` (text), `image`(+alt), `order`.
  - `galleryImage.ts` — `image`(+alt), `order`.
  - `blogPost.ts` — `title`, `slug`(source: title), `category` (string), `excerpt` (text), `coverImage`(+alt), `body` (blockContent), `author` (reference → teamMember), `publishedAt` (datetime), `status` (string list: `draft`|`published`, default `draft`), `seoTitle` (string), `metaDescription` (text). Use each field's `defineField` with `validation: (r) => r.required()` on title/slug/excerpt/publishedAt.

- [ ] **Step 5: `sanity/schemaTypes/index.ts`** — export array of all 8 types. Register in `sanity/sanity.config.ts` (`schema: { types: schemaTypes }`), and make `siteSettings` a singleton in the Studio structure (single "Site Settings" menu item, no "create new").

- [ ] **Step 6: Verify Studio runs** (USER)

```bash
cd "C:\Users\tagal\demodesigns\sanity" && npm run dev
```
Expected: Studio opens at `http://localhost:3333`, shows all content types, no schema errors.

- [ ] **Step 7: Commit**

```bash
cd "C:\Users\tagal\demodesigns"
git add -A && git commit -m "feat: Sanity Studio schemas for all content types"
```

### Task B2: Sanity client, image builder, queries

**Files:**
- Create: `src/lib/sanity.ts`, `src/lib/queries.ts`

**Interfaces:**
- Produces `src/lib/sanity.ts`:
  - `export const sanity = createClient({ projectId, dataset, apiVersion:'2024-01-01', useCdn:true })`
  - `export function urlFor(source): ImageUrlBuilder`
- Produces `src/lib/queries.ts` — async functions returning typed data:
  - `getSiteSettings()`, `getPrograms()`, `getProgramBySlug(slug)`, `getTeam()`, `getTestimonials()`, `getCaseStudies()`, `getGallery()`, `getPublishedPosts()`, `getPostBySlug(slug)`, `getLatestPosts(n)`.

- [ ] **Step 1: `src/lib/sanity.ts`**

```ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanity = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(sanity);
export function urlFor(source: any) {
  return builder.image(source);
}
```

- [ ] **Step 2: `src/lib/queries.ts`** — GROQ queries. Published posts filter on `status == "published" && publishedAt <= now()`. Example:

```ts
import { sanity } from './sanity';

export const getSiteSettings = () =>
  sanity.fetch(`*[_type == "siteSettings"][0]`);

export const getPrograms = () =>
  sanity.fetch(`*[_type == "program"] | order(order asc){ title, "slug": slug.current, shortDescription, image, badge }`);

export const getProgramBySlug = (slug: string) =>
  sanity.fetch(`*[_type == "program" && slug.current == $slug][0]{ title, shortDescription, body, image }`, { slug });

export const getTeam = () =>
  sanity.fetch(`*[_type == "teamMember"] | order(order asc){ name, role, image }`);

export const getTestimonials = () =>
  sanity.fetch(`*[_type == "testimonial"] | order(order asc){ quote, name, titleCompany, image, rating }`);

export const getCaseStudies = () =>
  sanity.fetch(`*[_type == "caseStudy"] | order(order asc){ category, headlineStat, description, image }`);

export const getGallery = () =>
  sanity.fetch(`*[_type == "galleryImage"] | order(order asc){ image }`);

export const getPublishedPosts = () =>
  sanity.fetch(`*[_type == "blogPost" && status == "published" && publishedAt <= now()] | order(publishedAt desc){ title, "slug": slug.current, category, excerpt, coverImage, publishedAt }`);

export const getLatestPosts = (n: number) =>
  sanity.fetch(`*[_type == "blogPost" && status == "published" && publishedAt <= now()] | order(publishedAt desc)[0...$n]{ title, "slug": slug.current, category, excerpt, coverImage, publishedAt }`, { n });

export const getPostBySlug = (slug: string) =>
  sanity.fetch(`*[_type == "blogPost" && slug.current == $slug][0]{ title, category, excerpt, coverImage, body, publishedAt, seoTitle, metaDescription, author->{name, role, image} }`, { slug });
```

- [ ] **Step 3: Verify** — with `.env` populated (project id + dataset), a temporary script logging `await getSiteSettings()` returns data (once at least one Site Settings doc is published in the Studio). Delete the temp script.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Sanity client + GROQ query helpers"
```

### Task B3: Wire homepage components to Sanity

**Files:**
- Modify: each section component to accept props; `src/pages/index.astro` to fetch and pass data.

**Interfaces (props each component now consumes):**
- `Header`/`Footer`/`Hero`/`BentoStats`/`CtaBand`/`LeadForm` ← `settings` (from `getSiteSettings`)
- `ProgramsCarousel` ← `programs`, `Testimonials` ← `testimonials`, `Coaches` ← `team`, `CaseStudies` ← `caseStudies`, `GalleryMarquee` ← `gallery`, `BlogTeaser` ← `posts`

- [ ] **Step 1:** In `index.astro` frontmatter, fetch all data in parallel:

```astro
---
import Base from '../layouts/Base.astro';
/* ...component imports... */
import { getSiteSettings, getPrograms, getTestimonials, getTeam, getCaseStudies, getGallery, getLatestPosts } from '../lib/queries';

const [settings, programs, testimonials, team, caseStudies, gallery, posts] = await Promise.all([
  getSiteSettings(), getPrograms(), getTestimonials(), getTeam(), getCaseStudies(), getGallery(), getLatestPosts(3),
]);
---
```
Pass each as a prop (`<ProgramsCarousel programs={programs} />`, etc.).

- [ ] **Step 2:** In each component, replace hardcoded blocks with `.map()` over its prop, and images with `urlFor(item.image).width(...).url()` + `item.image.alt` for alt text. Preserve every class name and wrapper element exactly (design is fixed). For repeated cards, keep ONE card's markup and map the data into it. Programs card `href` becomes `/programs/${p.slug}`. Hero headline/subheadline/photo, footer phone/email/hours, bento stat numbers, and CtaBand/LeadForm phone (`tel:`) all read from `settings`.

- [ ] **Step 3:** Provide graceful fallback: if a list query returns empty (client hasn't added content yet), render nothing for that list rather than crashing. Guard with `(items ?? []).map(...)` and wrap optional sections.

- [ ] **Step 4: Verify** — populate the Studio with the demo's content (one Site Settings doc + a few programs/testimonials/coaches/case studies/gallery images so screenshots have data), `npm run build`, screenshot desktop+mobile, confirm it still matches the demo.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: drive homepage sections from Sanity content"
```

### Task B4: Program detail pages `/programs/[slug]`

**Files:**
- Create: `src/pages/programs/[slug].astro`

- [ ] **Step 1:** `getStaticPaths()` from `getPrograms()` (map slug → params). Fetch full program via `getProgramBySlug`. Render inside `Base` with `Header` + a hero using the program image/title + `PortableText`-rendered `body` + a `LeadForm`/`CtaBand` + `Footer`. Set `title`/`description` from the program. Reuse existing components; introduce a small `PortableText` render (install `astro-portabletext` OR render blocks manually — use `astro-portabletext` for reliability; add to deps).

- [ ] **Step 2: Verify** — `npm run build` now emits one page per program; visit `/programs/<slug>` in dev, screenshot, confirm layout + brand.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: per-program SEO pages at /programs/[slug]"
```

### Task B5: Blog index + post pages

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`

- [ ] **Step 1:** `blog/index.astro` — `getPublishedPosts()`, render a grid of cards (reuse the BlogTeaser card markup) linking to `/blog/${slug}`. Empty state: a simple "New articles coming soon" block.

- [ ] **Step 2:** `blog/[slug].astro` — `getStaticPaths()` from published posts; fetch via `getPostBySlug`; render cover image, title, author (name/role/photo), date, and `PortableText` body inside `Base`. `title`/`description` use `seoTitle`/`metaDescription` (fallback to `title`/`excerpt`).

- [ ] **Step 3: Verify** — `npm run build` emits `/blog` + one page per published post; screenshots confirm rendering; a `draft` post does NOT appear.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: blog index + individual post pages"
```

---

## Phase C — Lead form backend

### Task C1: `/api/lead` serverless function

**Files:**
- Create: `src/pages/api/lead.ts`
- Modify: `LeadForm.astro` (ensure it POSTs to `/api/lead`; the demo already does)

**Interfaces:**
- `POST /api/lead` reads form fields (`name`, `company`, `email`, `team`, `message`, honeypot `company_website`). If honeypot filled → return 200 without side effects. Else insert row into Supabase `leads` (via REST with service-role key) AND send Resend email to `LEAD_NOTIFY_TO`. Returns JSON `{ ok: true }`.

- [ ] **Step 1:** Write `src/pages/api/lead.ts` as an Astro API route (`export const prerender = false; export async function POST({ request }) {...}`). Use `fetch` to Supabase REST (`${SUPABASE_URL}/rest/v1/leads`) with `apikey`/`Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}` and `Prefer: return=minimal`. Use `resend` SDK for the email. Validate `name`+`email` present; on honeypot, short-circuit `return new Response(JSON.stringify({ ok: true }), { status: 200 })`.

- [ ] **Step 2:** Confirm the `leads` table exists in Supabase (reuse the existing house `leads` table shape — `name, company, email, team, message, created_at`). If columns differ, this task adapts the insert body to the real columns; verify via the Supabase MCP `list_tables` before writing the insert.

- [ ] **Step 3: Verify** — `npm run dev`, submit the form with a test payload; confirm 200 + a row appears in Supabase + a notification email arrives. Honeypot-filled submission creates NO row.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: /api/lead → Supabase insert + Resend notification"
```

---

## Phase D — SEO layer

### Task D1: Structured data, sitemap, robots, per-page meta

**Files:**
- Create: `src/lib/seo.ts`, `public/robots.txt`
- Modify: `index.astro` (inject LocalBusiness JSON-LD), `blog/[slug].astro` (BlogPosting JSON-LD)

- [ ] **Step 1: `src/lib/seo.ts`**

```ts
export function localBusinessJsonLd(s: any, siteUrl: string) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: 'Scottsdale Sales Training',
    description: 'Sales training, coaching and team workshops in Scottsdale, Arizona.',
    areaServed: s?.address || 'Scottsdale, AZ',
    telephone: s?.phone, email: s?.email, url: siteUrl,
    address: { '@type': 'PostalAddress', addressLocality: 'Scottsdale', addressRegion: 'AZ', addressCountry: 'US' },
    openingHours: s?.hours || 'Mo-Fr 08:00-17:00',
  });
}

export function blogPostingJsonLd(post: any, url: string) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post?.title, description: post?.metaDescription || post?.excerpt,
    datePublished: post?.publishedAt, url,
    author: post?.author?.name ? { '@type': 'Person', name: post.author.name } : undefined,
  });
}
```

- [ ] **Step 2:** Pass `jsonLd={[localBusinessJsonLd(settings, Astro.site.href)]}` from `index.astro`; pass `[blogPostingJsonLd(post, Astro.url.href)]` from `blog/[slug].astro`. Confirm `Base.astro` renders each in an `application/ld+json` script.

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://scottsdalesalestraining.com/sitemap-index.xml
```

- [ ] **Step 4:** Confirm `@astrojs/sitemap` outputs `sitemap-index.xml` on build. Confirm each page sets a self-referencing canonical (add `canonical={Astro.url.href}` support in `Base.astro`, default to `Astro.url.href`). Ensure every page passes a unique `title`/`description`.

- [ ] **Step 5: Verify** — `npm run build`; validate the emitted JSON-LD parses (pipe the rendered `<script type="application/ld+json">` through `JSON.parse`); confirm `dist/sitemap-index.xml` + `dist/robots.txt` exist and list the real routes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: LocalBusiness + BlogPosting schema, sitemap, robots, canonicals"
```

---

## Phase E — Deploy wiring (mostly user-interactive)

### Task E1: Vercel project + env vars + Studio deploy + publish webhook

**Files:** none in-repo beyond config already added.

- [ ] **Step 1 (USER):** Import the GitHub repo into Vercel (or `vercel link`). Framework auto-detected as Astro. Set env vars in Vercel from `.env.example`: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, `LEAD_NOTIFY_FROM`.
- [ ] **Step 2 (USER):** In Vercel → Settings → Git → **Deploy Hooks**, create a hook (e.g. "sanity-publish") on `main`. Copy the URL.
- [ ] **Step 3 (USER):** Deploy the Studio: `cd sanity && npx sanity deploy` → pick a hostname (e.g. `scottsdale-sales-training`) → Studio live at `https://<name>.sanity.studio`. This is the client's login URL.
- [ ] **Step 4 (USER):** In Sanity → API → **Webhooks**, add a webhook firing on create/update/delete for published docs, targeting the Vercel Deploy Hook URL. (Filter to `_type in [...] && !(_id in path("drafts.**"))` so only publishes trigger rebuilds.)
- [ ] **Step 5 (USER):** In Sanity → project → **Members**, invite the client with the **Editor** role.
- [ ] **Step 6: Verify** — publish a content edit in the Studio; confirm Vercel rebuilds automatically and the change appears live within ~1–2 min.

### Task E2: Content migration + client handoff doc

- [ ] **Step 1:** Enter the demo's real content into Sanity (Site Settings, the 5 programs, 4 coaches, 4 testimonials, 3 case studies, gallery images, and 1–3 starter blog posts) so the live site is populated, not empty.
- [ ] **Step 2:** Write `docs/CLIENT-GUIDE.md` — plain-language: how to log in to the Studio, how to add a blog post, how to swap a photo, how to update phone/hours, and that changes go live automatically in ~2 minutes.

---

## Phase F — Template deliverable

### Task F1: Generalize into a reusable template

- [ ] **Step 1:** Write `docs/ASTRO-SANITY-TEMPLATE.md` — the general **Astro + Vercel + Supabase(leads) + Sanity(content)** recipe (architecture diagram, the schema-per-content-type pattern, the query/loader pattern, the publish-webhook wiring, the env-var checklist), as a companion to the existing `WEBSITE-CLAUDE-TEMPLATE.md`, so the next self-managed-content client is a fill-in-the-blanks job.
- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "docs: reusable Astro+Sanity CMS template + client guide"
```

---

## Self-Review

- **Spec coverage:** Every spec section maps to a task — content model → B1; SEO fields/LocalBusiness-from-settings → B1 + D1; programs get own pages → B4; blog draft/publish → B5 (+ status field B1); leads unchanged → C1; routes → A3/B4/B5; publish flow → E1; template deliverable → F1; out-of-scope items (real media, legal pages, domain) flagged, not tasked. ✔
- **Placeholder scan:** No "TBD"/"handle edge cases" — verification steps are concrete; markup port references exact source line ranges in the committed `demos/index-premium.html` (real content, not a placeholder). ✔
- **Type consistency:** Query helper names in B2 (`getSiteSettings`, `getPrograms`, `getProgramBySlug`, `getTeam`, `getTestimonials`, `getCaseStudies`, `getGallery`, `getPublishedPosts`, `getLatestPosts`, `getPostBySlug`) are used identically in B3/B4/B5/D1. Schema field names in B1 match query projections in B2. ✔
- **Known risk to confirm during execution:** the exact Supabase `leads` table columns (C1 Step 2 verifies via MCP before writing the insert); Astro+Vercel adapter needs `output: 'static'` + serverless `/api/lead` (prerender:false) — confirm the adapter emits the function on first deploy.
