# Template: Client-Managed Site (Astro + Vercel + Supabase + Sanity)

Reusable recipe for a client who wants to **edit their own content** (blog,
photos, text). Companion to the static-only `WEBSITE-CLAUDE-TEMPLATE.md`. Use
this when the intake says "client wants to manage the site himself."

## When to use which stack

- **Static-only** (`WEBSITE-CLAUDE-TEMPLATE.md`): developer edits JSON/content
  and pushes. Simplest. Use when the client won't touch content.
- **This template**: client edits in a friendly CMS; site rebuilds itself. Use
  when the client will publish blogs / swap photos / update details themselves.

## The four pieces

| Piece | Role | Notes |
|-------|------|-------|
| **Astro** (static) | Public site, generated at build | Unchanged house stack |
| **Vercel** | Hosting + auto-deploy + `/api/lead` function | Unchanged house stack |
| **Supabase** | Lead capture ONLY (`leads` table) | Content does NOT go here |
| **Sanity** | Content database + client's editing screen | Free hosted; nothing to self-host |

Publish loop: client publishes in Sanity → webhook → Vercel Deploy Hook →
Astro rebuilds pulling fresh content → live in ~1–2 min.

## The pattern that makes it robust

1. **`src/lib/defaults.ts`** — all demo/placeholder content as plain JS objects
   with image fields as **URL strings**. This is the fallback.
2. **`src/lib/sanity.ts`** — `hasSanity` flag (true only when a project id is
   set), the client, and `imageUrl(source, w)` which passes through plain
   strings and resolves Sanity image objects.
3. **`src/lib/queries.ts`** — one async helper per content type. Each returns
   **normalised, render-ready** data (images already resolved to URL strings)
   and falls back to `defaults.ts` when Sanity is absent or a list is empty.
   Site Settings falls back **per field** so partial edits are safe.
4. **Components** take props and map over the normalised data — a **single
   render path**, no `urlFor` or Sanity specifics leaking into markup.
5. **`sanity/`** — a self-contained Studio (schemas define the editing forms;
   Site Settings is a singleton). Reads `SANITY_STUDIO_PROJECT_ID` from env.

Result: the site builds and looks like the approved demo **before** the CMS is
connected, and each piece is progressively replaced as the client adds content.
Never blank, never a broken build waiting on an account.

## Content model checklist (adapt per client)

- A **Site Settings** singleton for contact info + hero + stat numbers → also
  powers `LocalBusiness` structured data (so SEO can't drift from what the
  client edits).
- List types for each repeated section (services, team, testimonials, gallery,
  case studies), each with an `order` number and required image `alt`.
- **Blog Post** with `status` (draft/published), `slug`, `excerpt`, cover
  image, rich-text `body`, `author` (reference → team member, for E-E-A-T),
  `publishedAt`, and optional `seoTitle` / `metaDescription`.
- Give services/programs their **own pages** (`/x/[slug]`) for search intent,
  not just homepage cards.

## SEO baked in

- `LocalBusiness` JSON-LD from Site Settings; `BlogPosting` on posts.
- `@astrojs/sitemap` + `public/robots.txt` + self-referencing canonicals.
- Required alt text on every CMS image field.

## Env vars

Site: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LEAD_NOTIFY_TO`,
`LEAD_NOTIFY_FROM`. Studio: `SANITY_STUDIO_PROJECT_ID`,
`SANITY_STUDIO_DATASET`. Secrets live only in Vercel env vars.

## Go-live steps

See `SETUP.md` in this repo for the full click-by-click runbook (create Sanity
project → deploy Studio → deploy Vercel → env vars → publish webhook → invite
client).
