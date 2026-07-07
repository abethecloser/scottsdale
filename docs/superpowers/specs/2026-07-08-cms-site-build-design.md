# Scottsdale Sales Training — Real Site Build (Client-Managed CMS)

**Date:** 2026-07-08
**Status:** Approved by user, ready for implementation planning

## Context

The client (Scottsdale Sales Training) reviewed the three demo tiers in this repo (`index-basic.html`, `index-standard.html`, `index-premium.html`) and chose **Premium**. This spec covers turning that static Tailwind-CDN demo into the real, deployed website — with one key difference from prior client builds (e.g. Saguaro Cabinetry): **this client wants to manage his own content** (occasional blog posts, and updates to text/photos/testimonials/etc.), not just have the developer edit JSON files and push.

This is also intended to become the **new default template** for any future client who wants self-managed content, alongside the existing static-only Astro workflow documented in the `WEBSITE-CLAUDE-TEMPLATE.md` pattern.

## Architecture

Four pieces, three of them already the established house stack and unchanged:

- **Astro** (static output) — the public site, generated at build time. Unchanged tech.
- **Vercel** — hosting + auto-deploy on push, plus the existing `/api/lead` serverless function. Unchanged.
- **Supabase** — unchanged. Continues to handle only the lead-capture flow: `/api/lead` inserts into the `leads` table and emails the client via Resend. No new tables. No content lives here.
- **Sanity** (new) — a free, hosted headless CMS. This is the one new piece, and it requires no server of ours to run or maintain:
  - Content (programs, team members, testimonials, case studies, gallery images, blog posts, site settings) lives in Sanity's hosted dataset.
  - The client edits content through **Sanity Studio**, deployed to a free Sanity-hosted address (e.g. `scottsdale-sales-training.sanity.studio`) via the `sanity deploy` CLI command — a one-time setup step, not an ongoing hosting responsibility.
  - The client logs in with his own Sanity account, scoped to this one project (Editor role).

**Publish flow:** client edits/publishes in Sanity Studio → Sanity fires a webhook on publish → webhook calls a Vercel Deploy Hook URL → Vercel rebuilds the Astro site, pulling fresh content from Sanity at build time → live in roughly 1–2 minutes. Drafts in Sanity don't trigger a rebuild — only publish actions do.

No new secrets to manage beyond what already exists: Supabase service-role key and Resend key stay server-side in Vercel env vars exactly as today. Sanity's read API for public marketing content does not require a secret token (public dataset); write access is gated by the client's own Sanity login, not a shared credential.

## Content Model (Sanity schemas)

Each schema below maps directly to a section of `index-premium.html`.

| Schema | Fields | Powers |
|---|---|---|
| **Site Settings** (singleton) | phone, email, address, hours, hero headline, hero subheadline, hero photo, stat: win-rate %, stat: reps trained, stat: new-hire ramp weeks | Header, hero, bento stat tiles, footer, CTA section, and the `LocalBusiness` JSON-LD (generated from these fields at build time instead of hardcoded) |
| **Program** (list) | title, slug, short description, photo, optional badge (e.g. "Most booked"), order | Homepage programs carousel (card links to its own page) **and** its own page at `/programs/[slug]` |
| **Team Member / Coach** (list) | name, role, photo, order | Coaches grid |
| **Testimonial** (list) | quote, name, title/company, photo, star rating, order | Testimonials carousel + the quote tile in the bento grid |
| **Case Study** (list) | category tag, headline stat, description, photo, order | Case studies grid |
| **Gallery Image** (list) | photo, alt text, order | "Inside the room" marquee |
| **Blog Post** (list) | title, slug, category, excerpt, cover photo, body (rich text), author (reference to Team Member), published date, status (draft/published), SEO title, meta description | Homepage "Insights" teaser (latest 3) + `/blog` index + `/blog/[slug]` pages |

All image fields require alt text. Colors, fonts, layout, and page structure are fixed — the client edits content, not design (confirmed scope: not a page-builder).

### SEO additions (from applying the seo-audit skill)

- `LocalBusiness` structured data is generated from **Site Settings** fields at build time, so it can never drift out of sync with what the client edits (unlike the demo's hardcoded JSON-LD).
- Blog posts carry their own SEO title + meta description, and a linked author (credibility/E-E-A-T signal), plus get real `Article`/`BlogPosting` structured data.
- **Programs get individual pages** (`/programs/[slug]`), not just homepage carousel cards linking to `#contact`. This lets each service target its own search intent (e.g. "sales team workshops Scottsdale" vs. "1-on-1 sales coaching Scottsdale") instead of competing for one page. Case studies remain homepage-only for now (schema already supports individual pages later if wanted).
- Standard technical SEO carried over from the existing house pattern: auto-generated `sitemap-index.xml`, `robots.txt`, self-referencing canonical per page.

## Routes

- `/` — homepage (hero, skills marquee, bento stats, programs carousel, gallery marquee, testimonials carousel, coaches grid, case studies grid, blog teaser (latest 3), lead form, CTA, footer)
- `/programs/[slug]` — one page per program
- `/blog` — blog index (published posts only)
- `/blog/[slug]` — individual blog post
- `/api/lead` — unchanged existing serverless function
- `/sitemap-index.xml`, `/robots.txt` — auto-generated

## Out of scope for this build (flagged, not blocking)

- Real client photos/video — still placeholder Unsplash images except Brad's headshot (`brad-founder-sales-coach.jpg`), per the existing brief in `CLAUDE.md`. The CMS makes swapping these trivial once the client has real assets.
- Final copy review/legal pages (Privacy/Terms currently placeholder links in the footer).
- Domain/DNS setup — depends on the client's package, per house convention.

## Template deliverable

Once the real site is built on this pattern, write up the general **Astro + Vercel + Supabase(leads) + Sanity(content)** approach as a companion document to the existing `WEBSITE-CLAUDE-TEMPLATE.md`, so future clients who want self-managed content don't require re-deriving this architecture from scratch.
