import type { BrandExample } from "@/components/reports/brand-showcase";

/*
  Products named in the legacy market reports.

  Only these two reports carried product examples on the old site; Vegan
  Palatants and Petcare Market did not.

  The imagery is the same set the old WordPress site published, re-taken from
  the full-size originals in its media library rather than the resized copies
  it actually served — several of those were being delivered at thumbnail size
  and scaled up in the browser, one of them at 71px wide. Each is capped at
  800px on its long edge and converted to WebP, which is the size the showcase
  tile asks for at 2x.

  These are third-party packshots, shown as market examples under the note the
  showcase prints beneath them. `imageAlt` describes the pack rather than
  repeating the product name, which the card already prints in text directly
  underneath.
*/
export const REPORT_BRANDS: Record<string, BrandExample[]> = {
  "insect-proteins": [
    {
      brand: "Ofrieda",
      product: "Recipe Dry Food For Allergy",
      image: "/images/brands/ofrieda-recipe-allergy.webp",
      imageAlt:
        "A kraft-paper bag of Ofrieda Patentrezept dry dog food, with sliced sweet potato, flaxseed and peas arranged in front of it.",
    },
    {
      brand: "Green Petfood",
      product: "InsectDog sensitive",
      image: "/images/brands/green-petfood-insectdog-sensitive.webp",
      imageAlt:
        "A pale blue bag of Green Petfood InsectDog Sensitive, labelled as 100% insect protein with rice.",
    },
    {
      brand: "Exclusion",
      product: "Hypoallergenic Insect & Pea",
      image: "/images/brands/exclusion-hypoallergenic-insect-pea.webp",
      imageAlt:
        "A white and grey bag of Exclusion Hypoallergenic Insect & Pea veterinary diet food for medium and large breed dogs.",
    },
    {
      brand: "Greenwoods",
      product: "Insects with potatoes, peas and fava beans",
      image: "/images/brands/greenwoods-insects-potatoes-peas-fava.webp",
      imageAlt:
        "A black 1.5kg bag of Greenwoods Insects grain-free dog food, illustrated with black soldier fly larvae and peas.",
    },
    {
      brand: "MERA",
      product: "Vital Hund, dietary dry food to reduce nutrient intolerance",
      image: "/images/brands/mera-vital-hund.webp",
      imageAlt:
        "A white 10kg bag of MERAVITAL Insect Pro dietary dry dog food, marked as a rare protein source.",
    },
  ],
  "vegan-petfood": [
    {
      brand: "ami",
      product: "ami Cat dry catfood",
      image: "/images/brands/ami-cat-dry.webp",
      imageAlt:
        "A white bag of ami One Planet complete dry cat food, photographed on white-painted boards.",
    },
    {
      brand: "Forza10",
      product: "Forza10 Vegan dry catfood",
      image: "/images/brands/forza10-vegan-cat.webp",
      imageAlt:
        "A green and cream 400g bag of Forza10 Bio Logic Vegetal organic feline formula with algae.",
    },
    {
      brand: "Naftie",
      product: "Naftie bio wet petfood",
      image: "/images/brands/naftie-bio-wet.webp",
      imageAlt:
        "Six 800g tins of Naftie organic vegan wet dog food stacked in a pyramid, in three varieties.",
    },
    {
      brand: "Lukullus",
      product: "Lukullus Veggie cold-pressed",
      image: "/images/brands/lukullus-veggie-cold-pressed.webp",
      imageAlt:
        "A kraft-paper 1.5kg bag of Lukullus Veggie cold-pressed adult dog food, illustrated with peas, carrot and apple.",
    },
    {
      brand: "Green Petfood",
      product: "Green Petfood VeggieDog",
      image: "/images/brands/green-petfood-veggiedog.webp",
      imageAlt:
        "A green and white 10kg bag of Green Petfood VeggieDog Origin adult dry dog food with red lentil.",
    },
  ],
};
