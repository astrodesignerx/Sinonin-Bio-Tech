# Sinonin Biotech website: project state

Last updated 2026-09-16. This file records the present state, not the history.

## Goal and hard constraints

Rebuild and run [www.sinoninbio.tech](https://www.sinoninbio.tech), replacing the
old WordPress/Elementor site. Live on Vercel, content in Sanity.

Constraints that shape everything else:

- **Sanity is the single source of truth for content.** Anything that writes to
  Sanity must never overwrite hand-authored work.
- **The client must always have a way to publish.** The legacy WordPress is kept
  alive as his fallback publisher, so it cannot simply be switched off.
- **The site is English only.** German was removed; old `/de/*` and `/en/*` links
  must keep resolving.
- **No secrets in this file.** It is written to be pasted and shared.

## Current status

Site is live and deployed from `main` on every push. The WordPress fallback sync
is green as of 2026-09-16, after the fix described below.

Stack: Next.js 16 (App Router) with React 19, Tailwind CSS v4, next-intl, pnpm.
Deployed on Vercel in the `fra1` region. Dev server runs on port 3011.

## Decisions and what they superseded

- **Content moved from MDX files to Sanity** (schemas in `studio/schemaTypes/`:
  `post`, `report`, `legal-doc`, `site-settings`, `block-content`). This
  superseded the `src/content/**/*.mdx` blog and legal pages. The MDX files are
  no longer the site's content.
- **The site became English only**, superseding the earlier bilingual English
  plus German setup. `src/i18n/routing.ts` now declares one locale with
  `localePrefix: "as-needed"`, so no page carries a prefix: posts live at
  `/blog/x`, not `/en/blog/x`. `next.config.ts` redirects both old prefixes
  explicitly, `/en/:path*` and `/de` plus `/de/:path*`, back to the clean path.
- **The WordPress sync now reaches the server by origin IP first** (2026-09-16),
  superseding the previous order, which tried `wp.sinoninbio.tech` first and fell
  back to the IP. The host put a CDN bot challenge in front of that subdomain
  which answers Node's `fetch` with a 403 regardless of headers or cookies, while
  the origin IP answers the same request with a 200. Both routes now get four
  attempts with a widening gap before failing, because both drop connections
  intermittently. A single refused connection used to crash the whole run.
- **`bookingUrl` points at HubSpot Meetings**, superseding the `mailto:`
  placeholder.

## Live specs the work depends on

**Sanity.** Project `8kpnyqu2`, dataset `production`, API version `2026-05-04`.
Values are hardcoded in `studio/env.ts` on purpose: neither is a secret, both
ship in the deployed Studio bundle, and hardcoding keeps `sanity deploy` working
from a fresh checkout.

**Environment variables** (values in `.env.local` locally, in Vercel and in
GitHub Actions secrets for deployed and scheduled use):

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | site build, sync script |
| `NEXT_PUBLIC_SANITY_DATASET` | site build, sync script |
| `SANITY_API_WRITE_TOKEN` | sync script (Editor token) |
| `SANITY_REVALIDATE_SECRET` | `src/app/api/revalidate` webhook |

**WordPress fallback sync.** `scripts/wp-sync.mjs`, run by
`.github/workflows/wp-sync.yml` on cron `13,43 * * * *` (twice an hour).

- Cutover date `2026-08-18`. Posts published before it are ignored, because they
  were migrated by hand under new slugs.
- The sync recognises its own documents by a hidden `wpId` field and skips any
  post it did not create, so hand-authored Sanity content always wins.
- Routing: origin IP `67.222.38.76`, presenting SNI and Host `sinoninbio.tech`,
  is the primary route. `https://wp.sinoninbio.tech` is the last resort, kept
  only because DNS is the one way to find the server again if the account moves.
- Dry run, writes nothing: `node scripts/wp-sync.mjs --dry`
- Workflow actions are on the current majors: `actions/checkout@v7`,
  `actions/setup-node@v7` and `pnpm/action-setup@v6`. Anything on v4 runs on the
  deprecated Node 20 and emits a warning; v5 and above run on Node 24.

**Forms.** Post to a FormSubmit AJAX endpoint that delivers to
`contact@sinoninbio.tech`. The token in `src/lib/config.ts` is FormSubmit's
hashed alias for that address. Changing the destination address means activating
the new address with FormSubmit and replacing the token; editing the address
alone redirects nothing.

## Open questions

- **Blocking nothing today, but the clearest single point of failure:** the
  origin IP `67.222.38.76` is hardcoded in `scripts/wp-sync.mjs`. It works now.
  If Bluehost moves the account, the script falls back to the subdomain route,
  which currently always returns 403, so the sync would go down again. Worth
  deciding whether to resolve the IP at runtime or to accept the risk.
- Four untracked items sit in `Content/` (three invoice PDFs and
  `sanity-draft-backups/`). Decide whether they belong in the repo, in
  `.gitignore`, or outside the project.
- If Bluehost is ever cancelled, the fallback dies with it. Disable the workflow
  at that point rather than letting it fail on schedule forever.

## Sources

- `README.md` for conventions, design tokens and component rules.
- `DEPLOY.md` for Vercel setup, DNS records, the environment variable table and
  post-deploy verification, and for the fuller description of the WordPress
  fallback.
- `studio/env.ts` for the Sanity connection values.
- `src/lib/config.ts` for site config, forms and the booking link.
- Repository: `astrodesignerx/Sinonin-Bio-Tech`, default branch `main`.
