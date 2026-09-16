# Sinonin Biotech Website Redesign

Modern rebuild of [sinoninbio.tech](https://www.sinoninbio.tech) (previously WordPress/Elementor).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`
- **next-intl** for routing. Single language: English, with no locale prefix in the URL
- **Sanity** as the CMS. Standalone Studio in `studio/`
- **Motion** (`motion/react`) for animation, **@phosphor-icons/react** for icons
- Package manager: **pnpm**

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3011
```

Build with `pnpm build`, lint with `pnpm lint`. Run the Studio with `pnpm studio`.

Pages live at clean paths (`/blog/x`, not `/en/blog/x`). Old `/en/*` and `/de/*`
links are redirected in `next.config.ts`.

## Conventions

- **i18n:** messages in `src/messages/en.json`; routing config in `src/i18n/routing.ts`; locale negotiation proxy in `src/proxy.ts`. Always use `Link`/`usePathname` from `@/i18n/navigation` (never `next/link` directly), so routing stays correct if a second language is ever added back.
- **Icons in Server Components:** import from `@phosphor-icons/react/ssr` (the main entry uses React context and crashes RSC).
- **Colors:** `paper` (bg), `ink` / `ink-muted` (text), `navy`, `forest` (dark surfaces), `leaf` (accent), `line` (hairlines). One accent only: leaf green.
- **Shapes:** buttons are full-pill, cards `rounded-2xl`, inputs `rounded-lg`.
- **Fonts:** Space Grotesk (`font-display`), Geist (`font-sans`), Geist Mono (`font-mono`, for eyebrows, labels and data).
- Static rendering: every page/layout under `[locale]` calls `setRequestLocale(locale)`.

## Site config (`src/lib/config.ts`)

- **Forms** post to a FormSubmit AJAX endpoint delivering to `contact@sinoninbio.tech`. Note: the **first-ever submission triggers a one-time confirmation email** to that address. The owner must click confirm once, then all submissions arrive directly.
- **Booking URL** points at HubSpot Meetings (`bookingUrl`).

## Pages

Home, Expertise (four anchored pillar sections), Training, Market Reports hub + four report pages with request forms (`/reports/[slug]`), About, Contact, Blog, Impressum, Datenschutz.

## Content

**Content lives in Sanity, not in this repo.** Blog posts, market reports, legal
pages and site settings are all documents there; schemas are in
`studio/schemaTypes/`. Read them through `src/lib/blog.ts`, `src/lib/reports.ts`,
`src/lib/legal.ts` and `src/lib/site-settings.ts`.

The files under `src/content/blog` and `src/content/legal` are the pre-migration
MDX. They look like the site's content but are not: editing one changes nothing.
They are kept only as a record of what was migrated.

The privacy policy names FormSubmit as the form processor, so it needs updating
in Sanity if the form endpoint in `src/lib/config.ts` changes.

A post published on the legacy WordPress is copied into Sanity automatically.
See the WordPress fallback sync in `DEPLOY.md`, and `STATE.md` for its routing.
