# Deployment to Vercel

Vercel account: `astrodesignerx@gmail.com`

## Prerequisites

- Vercel account (sign in with `astrodesignerx@gmail.com`)
- Access to the DNS registrar for `sinoninbio.tech`
- Node 20.x (locally — Vercel pins via `.nvmrc`)
- This repo pushed to a Git provider that Vercel can read (GitHub / GitLab / Bitbucket). If the project lives only on this machine, import it via the Vercel dashboard by dragging the folder.

## One-time setup

1. **Push the repo to GitHub** (or your preferred provider). The whole folder as a single repo; do not commit `node_modules`, `.next`, or `.vercel`.

2. **Import into Vercel**
   - Sign in at https://vercel.com with `astrodesignerx@gmail.com`.
   - **Add New → Project → Import** the Git repo.
   - Vercel auto-detects Next.js 16. The defaults are correct:
     - Build command: `pnpm build` (from `vercel.json`)
     - Install command: `pnpm install --frozen-lockfile`
     - Output directory: leave blank (Next.js uses `.next`)
     - Node: 20 (from `.nvmrc`)
   - Click **Deploy**. The first build will finish in ~2 minutes and produce a `sinonin-biotech.vercel.app` preview URL.

3. **Set the custom domain**
   - In the Vercel project → **Settings → Domains**, add `sinoninbio.tech` and `www.sinoninbio.tech`.
   - Vercel will display the DNS records to add.

4. **Update DNS at the registrar** (where `sinoninbio.tech` is registered)
   - For the apex `sinoninbio.tech`:
     - Remove any existing A record on `@`.
     - Add an A record: `@` → `76.76.21.21`
   - For `www`:
     - Add a CNAME: `www` → `cname.vercel-dns.com`
   - If a `www` A record exists, remove it.
   - DNS propagation: up to 48 hours, usually under an hour.
   - Vercel will issue a Let's Encrypt certificate automatically once the records resolve.

## Environment variables

Three environment variables are required. The build **fails** without the first two: `src/sanity/env.ts` throws at build time if either is missing. The third is not needed to build, but without it published content edits never reach the live site (see the webhook section below).

| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | On the project page at https://sanity.io/manage | The Sanity project the site reads its content from |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (same page) | The dataset within that project |
| `SANITY_REVALIDATE_SECRET` | A random string you generate | Shared secret that signs the Sanity publish webhook hitting `/api/revalidate` |

To set them in Vercel: **Project → Settings → Environment Variables**, ticked for Production, Preview, and Development. Locally they belong in `.env.local`.

The site URL is hardcoded as `baseUrl` in `src/lib/config.ts`; no `NEXT_PUBLIC_SITE_URL` variable is read anywhere.

Forms post to FormSubmit, which needs no account and no env var.

`FORMSUBMIT_TOKEN` in `src/lib/config.ts` is live and verified: it is FormSubmit's hashed alias for contact@sinoninbio.tech, so submissions arrive there without the address appearing in the page source. If the destination address ever changes, the new one has to be activated with FormSubmit and the token replaced. Editing the address alone redirects nothing.

`bookingUrl` in `src/lib/config.ts` is the client's live HubSpot Meetings link; no placeholder remains.

## Sanity CMS and Studio

Content (blog posts, market reports, legal pages) lives in Sanity, not in the repo. The Studio (Sanity's editing UI) is its own workspace in `studio/`, deployed separately from the website:

```bash
pnpm studio           # run the Studio locally (Vite dev server)
pnpm studio:deploy    # publish it to its sanity.studio subdomain
```

The website redirects `/studio` to that subdomain, so editors only need to remember the site's own domain.

### Publish webhook

So that publishing in the Studio updates the live site in seconds instead of waiting for a redeploy, create a webhook at https://sanity.io/manage (project → **API → Webhooks**):

- URL: `https://www.sinoninbio.tech/api/revalidate`
- Trigger on: create, update, delete
- Secret: the same value as `SANITY_REVALIDATE_SECRET` in Vercel

The route (`src/app/api/revalidate/route.ts`) verifies the webhook signature against that secret, then revalidates every page. If the secrets do not match, the request is rejected with a 401 and published edits will not appear until the next deploy.

## Continuous deployment

Once the Git repo is connected, every push to the connected branch deploys automatically:
- Pushes to the production branch → production deploy
- Pull requests → preview deploys (each PR gets its own URL)
- `main` is the conventional default branch

## CLI alternative (one-off deploy from a workstation)

If you prefer the CLI to the dashboard import:

```bash
# One-time: install and link
pnpm dlx vercel login
pnpm dlx vercel link --yes

# Deploy to preview
pnpm dlx vercel

# Deploy to production
pnpm dlx vercel deploy --prod
```

For non-interactive deploys, create a Vercel token at https://vercel.com/account/tokens and set it before running the CLI:

```bash
export VERCEL_TOKEN=…your-token…
pnpm dlx vercel deploy --prod --yes --token "$VERCEL_TOKEN"
```

## Post-deploy verification

After the first production deploy, confirm:

1. `https://sinoninbio.tech` and `https://www.sinoninbio.tech` both serve the site and auto-redirect `http://` → `https://` and `www.` → apex.
2. The locale proxy redirects `/` → `/en` and `/about-us` → `/en/about` (the legacy redirects from `next.config.ts`).
3. `https://sinoninbio.tech/sitemap.xml` returns a populated XML.
4. `https://sinoninbio.tech/robots.txt` is reachable.
5. The blog index lists the posts from Sanity, and individual posts render with their cover images.
6. The Impressum and Datenschutz pages are reachable from the footer.
7. Lighthouse (run in incognito at https://pagespeed.web.dev/) — target: Performance ≥ 90, Accessibility ≥ 95, SEO = 100 on the home page.

## Local verification before deploy

```bash
pnpm install --frozen-lockfile
pnpm build            # needs the two NEXT_PUBLIC_SANITY_* vars in .env.local
pnpm start            # serves the production build on :3000 (only `pnpm dev` uses :3011)
```

The production server is the closest preview of what Vercel will run.

## Notes

- The site uses the `proxy.ts` (formerly `middleware.ts`) convention for next-intl locale routing. Vercel supports this natively.
- Image optimization is handled by Vercel's built-in `next/image` integration; no extra config required.
- One API route exists: `POST /api/revalidate`, the Sanity publish webhook described above. No edge functions, no server actions. The forms post to a third-party endpoint (FormSubmit) from the browser.
- Deployment region: **Frankfurt (`fra1`)** is set in `vercel.json` for the German audience. Change to `iad1` if most traffic is North American.
