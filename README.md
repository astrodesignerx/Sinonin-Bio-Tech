# Sinonin Biotech — Website Redesign

Modern rebuild of [sinoninbio.tech](https://www.sinoninbio.tech) (previously WordPress/Elementor).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Tailwind CSS v4** — design tokens in `src/app/globals.css`
- **next-intl** — bilingual site: English (`/en`, default) + German (`/de`)
- **Motion** (`motion/react`) for animation, **@phosphor-icons/react** for icons
- Package manager: **pnpm**

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3011
```

`/ `redirects to `/en`. Build with `pnpm build`, lint with `pnpm lint`.

## Conventions

- **i18n:** messages in `src/messages/{en,de}.json`; routing config in `src/i18n/routing.ts`; locale negotiation proxy in `src/proxy.ts`. Always use `Link`/`usePathname` from `@/i18n/navigation` (never `next/link` directly) so locale prefixes are preserved.
- **Icons in Server Components:** import from `@phosphor-icons/react/ssr` (the main entry uses React context and crashes RSC).
- **Colors:** `paper` (bg), `ink` / `ink-muted` (text), `navy`, `forest` (dark surfaces), `leaf` (accent), `line` (hairlines). One accent only: leaf green.
- **Shapes:** buttons are full-pill, cards `rounded-2xl`, inputs `rounded-lg`.
- **Fonts:** Space Grotesk (`font-display`), Geist (`font-sans`), Geist Mono (`font-mono` — eyebrows/labels/data).
- Static rendering: every page/layout under `[locale]` calls `setRequestLocale(locale)`.

## Site config (`src/lib/config.ts`)

- **Forms** post to a FormSubmit AJAX endpoint delivering to `contact@sinoninbio.tech`. Note: the **first-ever submission triggers a one-time confirmation email** to that address — the owner must click confirm once, then all submissions arrive directly.
- **Booking URL** is currently a mailto fallback — replace `bookingUrl` with the client's real calendar link (Calendly/Cal.com) when provided.

## Pages

Home, Expertise (four anchored pillar sections), Training, Market Reports hub + four report pages with request forms (`/reports/[slug]`), About, Contact, Blog (MDX), Impressum, Datenschutz.

## Content

- **Blog posts** live in `src/content/blog/*.mdx` with frontmatter (`title`, `date`, `category`, `excerpt`, optional `cover`/`coverAlt`). Posts render in English in both locales. Note: the MDX serializer strips JSX expression attributes (`{123}`), so pass component props as strings (see `<Figure>`).
- **Legal pages** live in `src/content/legal/{impressum,privacy}.{en,de}.mdx`. The privacy policy references FormSubmit as form processor — update it if the form endpoint in `src/lib/config.ts` changes.
