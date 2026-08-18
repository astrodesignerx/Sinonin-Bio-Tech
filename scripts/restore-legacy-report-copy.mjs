/**
 * Restore report copy that existed on the old WordPress site and was dropped
 * in the rebuild. Recovered verbatim from the old pages, then edited only for
 * house voice.
 *
 *   node --env-file=.env.local scripts/restore-legacy-report-copy.mjs --dry
 *   node --env-file=.env.local scripts/restore-legacy-report-copy.mjs
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-05-04",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const DRY = process.argv.includes("--dry");

/* The old /insect-proteins/ page listed seven topics. The rebuild kept three.
   These restore all seven, folded together with the three so nothing is lost
   in either direction. */
const INSECT_EN = [
  "Key farmed insect species, the companies farming them, and production volumes",
  "Catalogue of insect products available on the market",
  "Global and regional market trends for petfood with insects or insect proteins",
  "Go-to-market drivers for insect petfood",
  "Petfood companies with insect-based products, and their current market share",
  "Business models and sales channels for insect petfood",
  "How insect materials rank against soy, fishmeal and animal proteins",
  "Formulation strategies (optional add-on)",
];

const INSECT_DE = [
  "Zentrale gezüchtete Insektenarten, die Unternehmen dahinter und Produktionsmengen",
  "Katalog der auf dem Markt erhältlichen Insektenprodukte",
  "Globale und regionale Markttrends für Petfood mit Insekten oder Insektenproteinen",
  "Go-to-Market-Treiber für Insekten-Petfood",
  "Petfood-Unternehmen mit Produkten auf Insektenbasis und ihre aktuellen Marktanteile",
  "Geschäftsmodelle und Vertriebskanäle für Insekten-Petfood",
  "Wie Insektenproteine im Vergleich zu Soja, Fischmehl und Tierproteinen abschneiden",
  "Formulierungsstrategien (optionale Ergänzung)",
];

/* The old /projects/petcare-market/ page defined what the sector covers. The
   rebuild said only "trends and drivers". The 2022 growth figure is left out
   deliberately: republishing a four-year-old number as current would be wrong. */
const PETCARE_EN = {
  body: "Pet health, pet hotels, pet grooming and petcare, including smart devices and insurance: the forces shaping the industry and what they mean for innovators.",
  points: [
    "Global petcare market trends, drivers and growth",
    "Pet health, hotels, grooming, smart devices and insurance",
    "The shift from food security to protein security",
    "Implications for suppliers and innovators",
  ],
};

const PETCARE_DE = {
  body: "Tiergesundheit, Tierhotels, Tierpflege und Petcare, einschließlich smarter Geräte und Versicherungen: die Kräfte, die die Branche prägen, und was sie für Innovatoren bedeuten.",
  points: [
    "Globale Petcare-Markttrends, -treiber und -wachstum",
    "Tiergesundheit, Hotels, Pflege, smarte Geräte und Versicherungen",
    "Die Verschiebung von Ernährungssicherheit zu Proteinsicherheit",
    "Implikationen für Zulieferer und Innovatoren",
  ],
};

const patches = [
  ["report-insect-en", { points: INSECT_EN }],
  ["report-insect-de", { points: INSECT_DE }],
  ["report-petcare-en", PETCARE_EN],
  ["report-petcare-de", PETCARE_DE],
];

for (const [id, set] of patches) {
  if (DRY) {
    console.log(`would patch ${id}:`, Object.keys(set).join(", "));
    continue;
  }
  await client.patch(id).set(set).commit();
  console.log(`patched ${id}`);
}
