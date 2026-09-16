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

The site reads its content from Sanity at build time, so the two
`NEXT_PUBLIC_SANITY_*` variables are **required**. Without them the build fails
with an error naming the missing variable.

| Variable | Value | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `8kpnyqu2` | yes | Sanity project the site reads from |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | yes | Sanity dataset |
| `SANITY_REVALIDATE_SECRET` | secret | yes, at runtime | Verifies the Sanity publish webhook at `/api/revalidate`. The build succeeds without it, but publishing stops revalidating the site |
| `NEXT_PUBLIC_SITE_URL` | `https://www.sinoninbio.tech` | no | Already defaulted in `src/lib/config.ts`; override only if you serve from a different URL |

Neither `NEXT_PUBLIC_SANITY_*` value is a secret: both ship in the client bundle.
`SANITY_REVALIDATE_SECRET` is a real secret and must match the value configured
on the webhook in sanity.io/manage.

`SANITY_API_WRITE_TOKEN` is **not** used by the site. It belongs to the WordPress
fallback sync and lives in GitHub Actions secrets. See the section at the end.

Forms post to FormSubmit, which needs no account and no env var.

`FORMSUBMIT_TOKEN` in `src/lib/config.ts` is live and verified: it is FormSubmit's hashed alias for contact@sinoninbio.tech, so submissions arrive there without the address appearing in the page source. If the destination address ever changes, the new one has to be activated with FormSubmit and the token replaced. Editing the address alone redirects nothing.

`bookingUrl` in `src/lib/config.ts` points at HubSpot Meetings. No placeholders remain.

To set env vars in Vercel: **Project → Settings → Environment Variables**. Apply to Production, Preview, and Development as needed.

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
2. The legacy redirects from `next.config.ts` work: `/about-us` → `/about`, and the old locale prefixes `/en/blog` and `/de/blog` both land on `/blog`.
3. `https://sinoninbio.tech/sitemap.xml` returns a populated XML.
4. `https://sinoninbio.tech/robots.txt` is reachable.
5. `/blog` lists the posts from Sanity and each one renders with its cover image.
6. The Impressum and Datenschutz pages are reachable from the footer.
7. Lighthouse (run in incognito at https://pagespeed.web.dev/) — target: Performance ≥ 90, Accessibility ≥ 95, SEO = 100 on the home page.

## Local verification before deploy

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start            # serves the production build on :3011 (per package.json)
```

The production server is the closest preview of what Vercel will run.

## Notes

- The site uses the `proxy.ts` (formerly `middleware.ts`) convention for next-intl locale routing. Vercel supports this natively.
- Image optimization is handled by Vercel's built-in `next/image` integration; no extra config required.
- No API routes, no edge functions, no server actions. The forms post to a third-party endpoint (FormSubmit) from the browser.
- Deployment region: **Frankfurt (`fra1`)** is set in `vercel.json` for the German audience. Change to `iad1` if most traffic is North American.

## WordPress fallback sync

The legacy WordPress install is still alive on the old Bluehost server,
reachable at `https://wp.sinoninbio.tech` (a subdomain whose A record points at
the old server; the main domain points at Vercel). The client logs in at
`wp.sinoninbio.tech/wp-admin`. It serves as the client's fallback publisher:
if Sanity misbehaves, a post published on WordPress is copied into Sanity by
`scripts/wp-sync.mjs`, which `.github/workflows/wp-sync.yml` runs twice an
hour. Sanity's own publish webhook then revalidates the site.

Sanity remains the source of truth. The sync never touches a post it did not
create (it recognises its own by the hidden `wpId` field), and it ignores
everything published before the 2026-08-18 cutover.

Setup, once: create an **Editor** API token in
[sanity.io/manage](https://www.sanity.io/manage) and add it to the GitHub repo
as the `SANITY_API_WRITE_TOKEN` Actions secret (**Settings → Secrets and
variables → Actions**). Put the same value in `.env.local` to run the script
locally. Until the secret exists, every scheduled run fails with a message
saying exactly this; that is intentional.

To test without writing: `node scripts/wp-sync.mjs --dry`.

If Bluehost is ever cancelled, the fallback dies with it: disable the workflow
at that point rather than letting it fail on schedule forever.
