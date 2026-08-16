/*
  Sinonin Group brand marks for the About page.

  The four sibling-company logos come from the legacy WordPress site, where
  they sat in the "Our Family of Businesses" strip as raw uploads: mixed
  formats, one 2560px square that was mostly empty white, and no consistent
  margin. This pulls them from source and normalises them.

  Each mark is flattened onto white, trimmed so it is bound by its own ink,
  then given a uniform 8px of breathing room back. Flattening rather than
  cutting an alpha channel is deliberate — three of the four have soft edges or
  a light-grey badge behind them, and thresholding those to transparent chews
  holes in the artwork. They render on a white tile in `group-companies.tsx`,
  so a white matte is invisible there.

    node scripts/gen-group-logos.mjs
*/
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "public/images/group");
const LEGACY = "https://www.sinoninbio.tech/wp-content/uploads/2025/04";

const MARKS = [
  ["tea", `${LEGACY}/Sinonin-Tea.jpg`],
  ["food", `${LEGACY}/SFI-Profile-1.png`],
  ["kipkenda", `${LEGACY}/Watermark-scaled.png`],
  ["vlavour", `${LEGACY}/Logo-VlavourTM.png`],
];

for (const [name, url] of MARKS) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: ${res.status} ${url}`);
  const src = Buffer.from(await res.arrayBuffer());

  const trimmedBuf = await sharp(src)
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 12 })
    .toBuffer();

  const trimmed = await sharp(trimmedBuf).metadata();

  const out = await sharp(trimmedBuf)
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: "#ffffff" })
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92 })
    .toFile(path.join(OUT, `${name}.webp`));

  console.log(
    `${name}.webp  trimmed ${trimmed.width}x${trimmed.height}  ->  ${out.width}x${out.height}  ${(out.size / 1024).toFixed(1)}kB  ratio ${(out.width / out.height).toFixed(2)}`,
  );
}
