import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { site } from "./config";

const OG_LOCALES: Record<string, string> = {
  en: "en_GB",
  de: "de_DE",
};

/**
 * Full SEO metadata for a page: canonical + hreflang alternates,
 * OpenGraph and Twitter cards. `path` is the locale-less route path.
 */
export function seoMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${site.baseUrl}/${l}${path}`]),
  );
  const ogImage = image ?? "/images/og-image.png";

  return {
    title,
    description,
    alternates: {
      canonical: `${site.baseUrl}/${locale}${path}`,
      languages: {
        ...languages,
        "x-default": `${site.baseUrl}/${routing.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Sinonin Biotech GmbH",
      title,
      description,
      locale: OG_LOCALES[locale] ?? "en_GB",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
