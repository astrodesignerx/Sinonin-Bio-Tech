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

export const REPORT_COVERS: Record<string, { src: string; alt: string; credit: string }> = {
  "insect-proteins": {
    src: "/images/reports/insect-proteins.webp",
    alt: "A close-up of black soldier fly larvae and pupae on a processing tray, the insect protein source for petfood.",
    credit: "Photograph: Sinonin Biotech.",
  },
  "vegan-palatants": {
    src: "/images/reports/vegan-palatants.webp",
    alt: "Vegan petfood ingredients flat-lay: dried chickpeas, peas, oats and herbs on a light surface.",
    credit: "Photograph: Sinonin Biotech.",
  },
  "vegan-petfood": {
    src: "/images/reports/vegan-petfood.webp",
    alt: "A healthy golden retriever eating kibble from a stainless steel bowl on a light kitchen floor.",
    credit: "Photograph: Sinonin Biotech.",
  },
  "petcare-market": {
    src: "/images/reports/petcare-market.webp",
    alt: "A dog owner in a bright pet store aisle looking at pet food packaging, with a shopping basket.",
    credit: "Photograph: Sinonin Biotech.",
  },
};

