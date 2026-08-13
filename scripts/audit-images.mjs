/**
 * Reports images that exist on disk but are never referenced, and references
 * that point at files which do not exist. Run after any batch of asset swaps.
 */
import fs from "node:fs";
import path from "node:path";

function read(dir, test, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next"].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) read(p, test, onFile);
    else if (test.test(entry.name)) onFile(p);
  }
}

let source = "";
read("src", /\.(tsx|ts|mdx|json|css)$/, (p) => {
  source += fs.readFileSync(p, "utf8");
});

const onDisk = [];
read("public", /\.(webp|png|jpe?g|svg)$/i, (p) => {
  onDisk.push("/" + path.relative("public", p).split(path.sep).join("/"));
});

/*
  Directories whose files are referenced through a template literal rather than
  a literal path (e.g. `/images/supporters/${key}.png`), so a substring search
  would wrongly report every one of them as unused.
*/
const DYNAMIC_DIRS = ["/images/supporters/", "/images/brands/"];
const isDynamic = (f) => DYNAMIC_DIRS.some((d) => f.startsWith(d));

const unused = onDisk.filter((f) => !source.includes(f) && !isDynamic(f));

// Strip block and line comments first: doc examples are not real references.
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^[ \t]*\/\/.*$/gm, "");

const referenced = [
  ...new Set(code.match(/\/images\/[A-Za-z0-9._/-]+\.(?:webp|png|jpe?g|svg)/g) ?? []),
];
const missing = referenced.filter((f) => !fs.existsSync(path.join("public", f)));

const kb = (f) => (fs.statSync(path.join("public", f)).size / 1024).toFixed(0);

console.log(`on disk: ${onDisk.length}   referenced: ${referenced.length}`);
console.log(`\nUNUSED (${unused.length})`);
for (const f of unused) console.log(`  ${kb(f).padStart(5)} KB  ${f}`);
console.log(`\nMISSING (${missing.length})`);
for (const f of missing) console.log(`  ${f}`);
