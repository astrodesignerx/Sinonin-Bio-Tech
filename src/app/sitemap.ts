import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/config";
import { getPostSlugs } from "@/lib/blog";
import { REPORT_SLUGS } from "@/lib/reports";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Slugs come from Sanity now, so the list has to be awaited before use.
  const slugs = await getPostSlugs();

  const paths = [
    "",
    "/expertise",
    "/training",
    "/reports",
    ...REPORT_SLUGS.map((r) => `/reports/${r.slug}`),
    "/about",
    "/blog",
    ...slugs.map((s) => `/blog/${s}`),
    "/contact",
    "/impressum",
    "/privacy",
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site.baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((l) => [l, `${site.baseUrl}/${l}${path}`]),
          ["x-default", `${site.baseUrl}/${routing.defaultLocale}${path}`],
        ]),
      },
    })),
  );
}
