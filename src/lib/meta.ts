import type { Metadata } from "next";
import { site } from "./config";

/**
 * Full SEO metadata for a page: canonical, OpenGraph and Twitter cards. `path`
 * is the route path (locale-less, e.g. "/blog/x" or "" for the home page).
 *
 * The site is English-only, so there are no hreflang alternates and the
 * canonical carries no locale prefix.
 */
export function seoMetadata({
  path,
  title,
  description,
  image,
}: {
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const ogImage = image ?? "/images/og-image.png";

  return {
    title,
    description,
    alternates: {
      canonical: `${site.baseUrl}${path}`,
    },
    openGraph: {
      type: "website",
      siteName: "Sinonin Biotech GmbH",
      title,
      description,
      locale: "en_GB",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
