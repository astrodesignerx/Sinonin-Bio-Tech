/**
 * One-off migration for everything that is not a blog post: the four market
 * reports, the two legal pages in both languages, and the site settings.
 *
 *   node scripts/migrate-copy-to-sanity.mjs --dry
 *   node scripts/migrate-copy-to-sanity.mjs
 *
 * Report copy is lifted out of src/messages/{en,de}.json and the cover images
 * out of src/lib/reports.ts. Those stay in the repo for now: nothing reads the
 * message keys once the pages are rewired, but leaving them costs nothing and
 * makes the migration reversible.
 *
 * Legal pages come from the MDX in src/content/legal.
 */
import fs from "node:fs";
import path from "node:path";
import {
  makeClient,
  makeImageUploader,
  makeKeyer,
  parseFrontmatter,
  processor,
  reportSkips,
  toPortableText,
  uploadedAssetCount,
} from "./lib/markdown-to-portable-text.mjs";

const LEGAL_DIR = "src/content/legal";
const LANGUAGES = ["en", "de"];
const DRY = process.argv.includes("--dry");

process.loadEnvFile(".env.local");

const client = makeClient();
const uploadImage = makeImageUploader(client, { dry: DRY });
const docs = [];
const notes = [];

/* Keys are the ones src/lib/reports.ts already uses; the slug is the URL and
   stays owned by the code, because the routes and the per-report brand
   showcase are keyed to it. */
const REPORTS = [
  { key: "insect", slug: "insect-proteins" },
  { key: "palatants", slug: "vegan-palatants" },
  { key: "petfood", slug: "vegan-petfood" },
  { key: "petcare", slug: "petcare-market" },
];

const messages = Object.fromEntries(
  LANGUAGES.map((lang) => [
    lang,
    JSON.parse(fs.readFileSync(`src/messages/${lang}.json`, "utf8")),
  ]),
);

/* Cover metadata currently lives as a literal in src/lib/reports.ts. Parsing
   the module would be fragile, so the four entries are restated here; this
   script runs once and then the Studio owns them. */
const COVERS = {
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

for (const { key, slug } of REPORTS) {
  const coverAsset = await uploadImage(COVERS[slug].src);
  for (const language of LANGUAGES) {
    const item = messages[language]?.reportsPage?.items?.[key];
    if (!item) {
      notes.push(`report ${key}/${language}: no copy found, skipped`);
      continue;
    }
    docs.push({
      _id: `report-${key}-${language}`,
      _type: "report",
      key,
      language,
      title: item.title,
      body: item.body,
      points: item.points ?? [],
      ...(coverAsset
        ? {
            cover: {
              _type: "image",
              asset: { _type: "reference", _ref: coverAsset },
              alt: COVERS[slug].alt,
              credit: COVERS[slug].credit,
            },
          }
        : {}),
    });
    notes.push(`report ${key}/${language}: ${(item.points ?? []).length} points`);
  }
}

for (const docType of ["impressum", "privacy"]) {
  for (const language of LANGUAGES) {
    const file = path.join(LEGAL_DIR, `${docType}.${language}.mdx`);
    if (!fs.existsSync(file)) {
      notes.push(`legal ${docType}/${language}: file missing, skipped`);
      continue;
    }
    const { body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
    const portable = await toPortableText(processor.parse(body), makeKeyer(), uploadImage);
    docs.push({
      _id: `legal-${docType}-${language}`,
      _type: "legalDoc",
      docType,
      language,
      body: portable,
    });
    notes.push(`legal ${docType}/${language}: ${portable.length} blocks`);
  }
}

/* Seeded from the current values in src/lib/config.ts. Those literals stay
   there as the fallback if this document is ever deleted, so the two must not
   drift: change both, or change this one and let the fallback go stale. */
docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  email: "contact@sinoninbio.tech",
  bookingUrl: "https://meetings-eu1.hubspot.com/sinonin",
});
notes.push("siteSettings: seeded from src/lib/config.ts");

if (DRY) {
  fs.writeFileSync("copy-migration-preview.json", JSON.stringify(docs, null, 2));
  console.log(`dry run: ${docs.length} documents written to copy-migration-preview.json`);
} else {
  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();
  console.log(`committed ${docs.length} documents, ${uploadedAssetCount()} images`);
}

for (const n of notes) console.log("  " + n);
reportSkips();
