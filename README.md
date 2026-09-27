# Sinonin Biotech — Website Redesign

Modern rebuild of [sinoninbio.tech](https://www.sinoninbio.tech) (previously WordPress/Elementor).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Tailwind CSS v4** — design tokens in `src/app/globals.css`
- **next-intl** — bilingual site: English (`/en`, default) + German (`/de`)
- **Sanity**: headless CMS for blog, reports, and legal content; the Studio (editing UI) is its own workspace in `studio/`
- **@phosphor-icons/react** for icons
- Package manager: **pnpm**

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3011
pnpm studio     # Sanity Studio, local dev server
```

`/ `redirects to `/en`. Build with `pnpm build`, lint with `pnpm lint`. Deploy the Studio with `pnpm studio:deploy` (publishes to its sanity.studio subdomain; the site redirects `/studio` there).

The build needs Sanity credentials in `.env.local`: `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` (values at sanity.io/manage). A third variable, `SANITY_REVALIDATE_SECRET`, signs the publish webhook (see Content below). Details in `DEPLOY.md`.

## Conventions

- **i18n:** messages in `src/messages/{en,de}.json`; routing config in `src/i18n/routing.ts`; locale negotiation proxy in `src/proxy.ts`. Always use `Link`/`usePathname` from `@/i18n/navigation` (never `next/link` directly) so locale prefixes are preserved.
- **Icons in Server Components:** import from `@phosphor-icons/react/ssr` (the main entry uses React context and crashes RSC).
- **Colors:** `paper` (bg), `ink` / `ink-muted` (text), `navy`, `forest` (dark surfaces), `leaf` (accent), `line` (hairlines). One accent only: leaf green.
- **Shapes:** buttons are full-pill, cards `rounded-2xl`, inputs `rounded-lg`.
- **Fonts:** Space Grotesk (`font-display`), Geist (`font-sans`), Geist Mono (`font-mono` — eyebrows/labels/data).
- Static rendering: every page/layout under `[locale]` calls `setRequestLocale(locale)`.

## Site config (`src/lib/config.ts`)

- **Forms** post to a FormSubmit AJAX endpoint delivering to `contact@sinoninbio.tech`. Note: the **first-ever submission triggers a one-time confirmation email** to that address — the owner must click confirm once, then all submissions arrive directly.
- **Booking URL** (`bookingUrl`) is the client's HubSpot Meetings link, chosen so bookings attach to their existing CRM contacts.

## Pages

Home, Expertise (four anchored pillar sections), Training, Market Reports hub + report pages with request forms (`/reports/[slug]`), About, Contact, Blog, Impressum, Datenschutz.

## Content

- **Blog posts, market reports, and legal pages** live in Sanity and are edited in the Studio (`studio/` workspace). The site fetches them with `@sanity/client` and renders rich text with `@portabletext/react`.
- **Publishing** in the Studio triggers a Sanity webhook to `POST /api/revalidate` (`src/app/api/revalidate/route.ts`), signed with `SANITY_REVALIDATE_SECRET`, which revalidates the site so edits go live in seconds without a redeploy. Setup steps are in `DEPLOY.md`.
- `src/content/` still holds the pre-migration MDX files, kept only as an archive; the site no longer reads them.
- The privacy policy content references FormSubmit as form processor. Update it in Sanity if the form endpoint in `src/lib/config.ts` changes.
