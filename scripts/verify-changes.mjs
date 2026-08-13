import { readFile } from "node:fs/promises";

async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  return res.text();
}

const en = await fetchText("http://localhost:3011/en");
const exp = await fetchText("http://localhost:3011/en/expertise");
const about = await fetchText("http://localhost:3011/en/about");
const contact = await fetchText("http://localhost:3011/en/contact");
const rep = await fetchText("http://localhost:3011/en/reports/insect-proteins");
const train = await fetchText("http://localhost:3011/en/training");

const checks = {
  "HOME insects cell (expertise/insects)": en.includes("/images/expertise/insects.webp"),
  "HOME insect-powder removed": !en.includes("/images/insect-powder.webp"),
  "EXPERTISE insects new": exp.includes("/images/expertise/insects.webp"),
  "EXPERTISE enzymes new": exp.includes("/images/expertise/enzymes.webp"),
  "EXPERTISE no old biofermentor": !exp.includes("biofermentor"),
  "EXPERTISE no old insect-powder": !exp.includes("insect-powder"),
  "TRAINING new image": train.includes("/images/training.webp"),
  "TRAINING no old zest-launch": !train.includes("zest-launch"),
  "ABOUT founder portrait": about.includes("/images/about/founder.webp"),
  "ABOUT no old kericho CC credit": !about.includes("Carter.Maina"),
  "CONTACT lab image": contact.includes("/images/about/lab.webp"),
  "REPORT insect-proteins new cover": rep.includes("insect-proteins.webp"),
  "REPORT no Wikimedia CC credit":
    !rep.includes("Wikimedia Commons") && !rep.includes("ShaunRomero") && !rep.includes("Bart Speelman"),
  "SUPPORTERS target blank + noopener": en.includes('target="_blank"') && en.includes('rel="noopener noreferrer"'),
  "SUPPORTERS 7 external hrefs": (en.match(/href="https?:\/\/[^"]*"/g) || []).length >= 7,
  "ABOUT founder portrait in <img>": /src="\/images\/about\/founder\.webp"/.test(about),
  "ABOUT no duplicate founderBody":
    (about.match(/\{t\("founderBody"\)\}/g) || []).length === 1,
};

for (const [k, v] of Object.entries(checks)) {
  console.log(`${v ? "PASS" : "FAIL"}  ${k}`);
}

// Check a few status codes
for (const path of ["/en", "/de", "/en/about", "/en/contact"]) {
  try {
    const r = await fetch(`http://localhost:3011${path}`, { signal: AbortSignal.timeout(15000) });
    console.log(`STATUS ${path} = ${r.status}`);
  } catch (e) {
    console.log(`STATUS ${path} ERR ${e.message}`);
  }
}
