import type { BrandExample } from "@/components/reports/brand-showcase";

/*
  Products named in the legacy market reports, kept as data so the showcase can
  be filled in as licensed imagery arrives. Drop files into
  `public/images/brands/` and add the `image` field.

  Only these two reports carried product examples on the old site; Vegan
  Palatants and Petcare Market did not.
*/
export const REPORT_BRANDS: Record<string, BrandExample[]> = {
  "insect-proteins": [
    { brand: "Ofrieda", product: "Recipe Dry Food For Allergy" },
    { brand: "Green Petfood", product: "InsectDog sensitive" },
    { brand: "Exclusion", product: "Hypoallergenic Insect & Pea" },
    { brand: "Greenwoods", product: "Insects with potatoes, peas and fava beans" },
    { brand: "MERA", product: "Vital Hund, dietary dry food to reduce nutrient intolerance" },
  ],
  "vegan-petfood": [
    { brand: "ami", product: "ami Cat dry catfood" },
    { brand: "Forza10", product: "Forza10 Vegan dry catfood" },
    { brand: "Naftie", product: "Naftie bio wet petfood" },
    { brand: "Lukullus", product: "Lukullus Veggie cold-pressed" },
    { brand: "Green Petfood", product: "Green Petfood VeggieDog" },
  ],
};
