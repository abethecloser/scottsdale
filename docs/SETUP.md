# Setup & Go-Live Runbook

Everything the code needs is already built. These are the account/connection
steps that need a human login (I can't do them headlessly). Do them in order.
Plain-language; copy/paste the commands as written.

Local project: `C:\Users\tagal\demodesigns`

---

## 1. Create the free Sanity project (≈5 min)

1. Go to **https://www.sanity.io** and sign up (Google login is easiest).
2. Create a new project. Name it **Scottsdale Sales Training**. Dataset: **production** (the default).
3. On the project page, copy the **Project ID** (a short code like `abc12xyz`).

## 2. Plug the Project ID into the site

1. In the project folder, copy `.env.example` to a new file named `.env`.
2. Open `.env` and fill in:
   ```
   PUBLIC_SANITY_PROJECT_ID=<the Project ID you copied>
   PUBLIC_SANITY_DATASET=production
   ```
   (Leave the Supabase / Resend lines for step 5.)
3. In the `sanity` sub-folder, copy `sanity/.env.example` to `sanity/.env` and fill in:
   ```
   SANITY_STUDIO_PROJECT_ID=<the same Project ID>
   SANITY_STUDIO_DATASET=production
   ```

## 3. Put the editing screen (Studio) online

In a terminal:
```bash
cd C:\Users\tagal\demodesigns\sanity
npm install
npx sanity login        # opens the browser, log in with the same account
npx sanity deploy       # pick a name, e.g. scottsdale-sales-training
```
Your editing screen is now live at `https://<name>.sanity.studio`. That is the
link the client logs in to.

> If `npm install` here ever errors on versions, the official fallback is to run
> `npm create sanity@latest` in the project root, choose the existing project,
> then copy the files from `sanity/schemaTypes/` over the generated ones.

## 4. Deploy the website to Vercel

1. Push this repo to GitHub (already the `demodesigns` repo) if not already:
   ```bash
   cd C:\Users\tagal\demodesigns
   git push origin main
   ```
2. In **Vercel**, "Add New Project" → import the `demodesigns` repo. Framework
   auto-detects as **Astro**. Deploy.
3. The site goes live at a `*.vercel.app` URL (custom domain later, per package).

## 5. Turn on lead capture (Supabase + email)

In **Vercel → your project → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `PUBLIC_SANITY_PROJECT_ID` | your Sanity Project ID |
| `PUBLIC_SANITY_DATASET` | `production` |
| `SUPABASE_URL` | from your Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role, **secret**) |
| `RESEND_API_KEY` | from resend.com |
| `LEAD_NOTIFY_TO` | the client's inbox for new leads |
| `LEAD_NOTIFY_FROM` | a verified Resend sender, e.g. `leads@yourdomain.com` |

The `leads` table in Supabase needs columns: `name`, `company`, `email`,
`team`, `message`, `created_at` (default `now()`). Redeploy after adding vars.

## 6. Auto-rebuild when the client publishes

So the live site updates automatically when the client hits Publish:

1. **Vercel → Settings → Git → Deploy Hooks** → create a hook on branch `main`
   named `sanity-publish`. Copy its URL.
2. **Sanity → your project → API → Webhooks** → Add webhook:
   - URL: the Vercel Deploy Hook URL
   - Trigger on: Create, Update, Delete
   - Filter (so only real publishes rebuild): `!(_id in path("drafts.**"))`
3. Test: edit something in the Studio, hit Publish, watch Vercel rebuild
   (~1–2 min) and the change appear live.

## 7. Give the client access

**Sanity → project → Members → Invite** the client's email as an **Editor**.
Send them the Studio link and `docs/CLIENT-GUIDE.md`.

---

## Notes

- Until step 1–2 are done, the site still builds and looks exactly like the
  approved demo — it uses the built-in demo content as a fallback. Real content
  from the CMS replaces it automatically once connected.
- Secrets (Supabase service-role, Resend) live **only** in Vercel env vars,
  never in the code or the client bundle.
