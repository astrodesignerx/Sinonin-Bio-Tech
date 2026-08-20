import type { MetadataRoute } from "next";
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

  // English-only site: one unprefixed URL per path, no hreflang alternates.
  return paths.map((path) => ({
    url: `${site.baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
  }));
}
