import { defineRouting } from "next-intl/routing";

/*
  Single-language English site. The `[locale]` segment stays in the folder tree
  because next-intl still routes through it, but the locale is kept out of the
  URL: pages live at /blog/x, not /en/blog/x.

  `localePrefix: "as-needed"` with a single default locale means no page ever
  carries a prefix, and next-intl redirects the redundant /en/* prefix back to
  the clean path on its own. That covers old inbound /en/* links (the shared
  blog link included). German is gone; old /de/* links are redirected in
  next.config.ts.
*/
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
