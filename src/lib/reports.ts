import { client } from "@/sanity/lib/client";
import { allReportsQuery } from "@/sanity/lib/queries";

/*
  The four market reports.

  Slugs stay here rather than in Sanity: they are the URLs, the redirect map in
  next.config.ts points at them, and the per-report brand showcase in
  lib/brands.ts is keyed to them. Adding or removing a report is a developer's
  job. Everything the client was promised control of, the wording and the cover
  image, comes from Sanity.
*/
export const REPORT_SLUGS = [
  { key: "insect", slug: "insect-proteins" },
  { key: "palatants", slug: "vegan-palatants" },
  { key: "petfood", slug: "vegan-petfood" },
  { key: "petcare", slug: "petcare-market" },
] as const;

export type ReportSlug = (typeof REPORT_SLUGS)[number];

export function findReport(slug: string) {
  return REPORT_SLUGS.find((r) => r.slug === slug);
}

export type ReportCopy = {
  key: string;
  slug: string;
  language: string;
  title: string;
  body: string;
  points: string[];
  cover?: string;
  coverAlt?: string;
  coverCredit?: string;
  coverLqip?: string;
};

type ReportDoc = Omit<ReportCopy, "slug">;

/**
 * Every report in the requested language, in the order REPORT_SLUGS declares.
 *
 * Falls back to the English document when a translation is missing, so a half
 * translated dataset renders a complete page rather than gaps.
 */
export async function getReports(language: string): Promise<ReportCopy[]> {
  const docs = await client.fetch<ReportDoc[]>(allReportsQuery);

  return REPORT_SLUGS.flatMap(({ key, slug }) => {
    const doc =
      docs.find((d) => d.key === key && d.language === language) ??
      docs.find((d) => d.key === key && d.language === "en");
    return doc ? [{ ...doc, slug }] : [];
  });
}

export async function getReport(
  slug: string,
  language: string,
): Promise<ReportCopy | null> {
  const reports = await getReports(language);
  return reports.find((r) => r.slug === slug) ?? null;
}
