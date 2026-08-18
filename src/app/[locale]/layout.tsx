import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { seoMetadata } from "@/lib/meta";
import { site } from "@/lib/config";
import SiteHeader, { type MegaItem } from "@/components/layout/site-header";
import { type SearchDoc } from "@/components/layout/site-search";
import { getReports } from "@/lib/reports";
import SiteFooter from "@/components/layout/site-footer";
import RevealFallback from "@/components/ui/reveal-fallback";
import { getAllPosts } from "@/lib/blog";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.baseUrl),
    ...seoMetadata({
      locale,
      path: "",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // Read on the server so the header's blog panel ships as static markup.
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const latestPosts: MegaItem[] = (await getAllPosts()).slice(0, 4).map((p) => ({
    href: `/blog/${p.slug}`,
    title: p.title,
    image: p.cover,
    meta: [
      dateFmt.format(new Date(p.date)),
      p.readingMinutes ? `${p.readingMinutes} min read` : null,
    ]
      .filter(Boolean)
      .join(" | "),
  }));

  /* Report covers live in Sanity, and the header is a client component, so
     the mega panel's cells are assembled here and passed down. Titles stay on
     the home namespace, which is the wording the menu has always used. */
  const reportCopy = await getReports(locale);
  const reportTitlesT = await getTranslations({ locale, namespace: "home.reports" });
  const reportItems: MegaItem[] = reportCopy.map((r) => ({
    href: `/reports/${r.slug}`,
    title: reportTitlesT(`${r.key}.title`),
    image: r.cover,
  }));

  // Search corpus: every destination on the site, built on the server so the
  // header ships it as static data rather than fetching an index at runtime.
  const nav = await getTranslations({ locale, namespace: "nav" });
  const fields = await getTranslations({ locale, namespace: "expertisePage.sections" });

  const searchDocs: SearchDoc[] = [
    ...["expertise", "training", "reports", "about", "blog", "contact"].map((k) => ({
      href: `/${k === "reports" ? "reports" : k}`,
      title: nav(k),
      kind: nav("searchPage"),
    })),
    ...["proteins", "palatants", "enzymes", "insects"].map((k) => ({
      href: `/expertise#${k}`,
      title: fields(`${k}.title`),
      kind: nav("expertise"),
    })),
    ...reportCopy.map((r) => ({
      href: `/reports/${r.slug}`,
      title: r.title,
      kind: nav("reports"),
    })),
    ...(await getAllPosts()).map((p) => ({
      href: `/blog/${p.slug}`,
      title: p.title,
      kind: nav("blog"),
    })),
  ];

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          {/*
            Renders nothing. Drives the reveal animations in browsers without
            scroll timelines; see reveal-fallback.tsx. Mounted at the layout so
            one observer serves the whole page rather than one per section.
          */}
          <RevealFallback />
          <SiteHeader
            posts={latestPosts}
            reportItems={reportItems}
            searchDocs={searchDocs}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
