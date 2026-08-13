import { readFile, writeFile } from "node:fs/promises";

const FILES = [
  { path: "C:/Users/Host/Documents/Sinonin Bio Tech/src/messages/en.json", lang: "en" },
  { path: "C:/Users/Host/Documents/Sinonin Bio Tech/src/messages/de.json", lang: "de" },
];

const REPLACEMENTS = {
  // The two "Insect protein meal" occurrences both describe the home pillars / expertise
  // insects cell. The new photo is the Kenya insect farm interior (#2).
  en: [
    ["Insect protein meal", "Interior of a small-scale African insect farm: rows of trays with black soldier fly larvae, a farm worker inspecting a tray in warm morning light."],
  ],
  de: [
    ["Insektenprotein-Mehl", "Innenansicht einer kleinen afrikanischen Insektenfarm: Reihen von Tabletts mit Schwarzen Soldatenfliegenlarven, ein Farmarbeiter prüft ein Tablett im warmen Morgenlicht."],
  ],
  // Training image alts: the new photo is a scientist presenting to a small adult
  // training group (#6).
  enTrain: [
    ["ZEST project consortium at Teknologisk Institut", "A scientist presenting to a small adult training group around a table, with a laptop and printed slides."],
  ],
  deTrain: [
    ["ZEST-Projektkonsortium am Teknologisk Institut", "Ein Wissenschaftler präsentiert vor einer kleinen Erwachsenen-Schulungsgruppe an einem Tisch, mit Laptop und ausgedruckten Folien."],
  ],
  // About page Nandi caption (in the JSX, not in messages.json — the strings live in
  // the component file). We'll update those separately via direct edits.
};

for (const { path, lang } of FILES) {
  let txt = await readFile(path, "utf8");
  const reps = lang === "en"
    ? [...REPLACEMENTS.en, ...REPLACEMENTS.enTrain]
    : [...REPLACEMENTS.de, ...REPLACEMENTS.deTrain];
  let count = 0;
  for (const [from, to] of reps) {
    let idx = 0;
    while ((idx = txt.indexOf(from, idx)) !== -1) {
      txt = txt.slice(0, idx) + to + txt.slice(idx + from.length);
      idx += to.length;
      count++;
    }
  }
  await writeFile(path, txt, "utf8");
  console.log(`${path}  (${count} replacement${count === 1 ? "" : "s"})`);
}
