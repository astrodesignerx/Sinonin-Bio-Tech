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
