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

The current build needs **no** environment variables to render. Two are *recommended* before production:

| Variable | Value | Purpose |
|---|---|---|
| `FORMSPREE_ID` (or update `src/lib/config.ts`) | your real form endpoint | When you replace the FormSubmit placeholder with a production form service |
| `NEXT_PUBLIC_SITE_URL` (optional) | `https://www.sinoninbio.tech` | Already defaulted in `src/lib/config.ts`; override only if you serve from a different URL |

`src/lib/config.ts` currently has `formsEndpoint: "https://formsubmit.co/ajax/contact@sinoninbio.tech"` and `bookingUrl: "mailto:..."`. The mailto is a placeholder — the client should set the real `bookingUrl` when a calendar tool (Calendly / Cal.com) is chosen.

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
2. The locale proxy redirects `/` → `/en` and `/about-us` → `/en/about` (the legacy redirects from `next.config.ts`).
3. `https://sinoninbio.tech/sitemap.xml` returns a populated XML.
4. `https://sinoninbio.tech/robots.txt` is reachable.
5. All five blog posts render with their real cover images.
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
