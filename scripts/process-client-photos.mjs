import sharp from "sharp";

const A = "D:/Design/Cheison/Sinonin Biotech/";
const O = "C:/Users/Host/Documents/Sinonin Bio Tech/public/images/";

// [sourceNum, destRelative, targetW, targetH, note]
// Targets are chosen to match the aspect of the CSS container the image
// actually renders in, so `object-cover` crops as little as possible.
const jobs = [
  // 4:5 — about page portrait cell is aspect-[4/5]; source is already 4:5, no crop.
  [1, "about/founder.webp", 1200, 1500, "about page founder portrait"],
  // 16:9 — expertise cards are h-52/h-64 in a ~640px column (wide banner).
  [2, "expertise/insects.webp", 1600, 900, "expertise insects section"],
  // 21:9 — about page hero figure is aspect-[21/9].
  [3, "about/nandi.webp", 1600, 686, "about page landscape banner"],
  // 4:3 — home bento insects cell (replaces the old insect-powder.webp).
  [4, "expertise/insects-closeup.webp", 1200, 900, "home bento insects cell"],
  // 16:10 — report cards are aspect-[16/10] on home, aspect-[16/9] on detail.
  [4, "reports/insect-proteins.webp", 1600, 1000, "insect protein report cover"],
  // 16:9 — expertise cards.
  [5, "expertise/enzymes.webp", 1600, 900, "expertise enzymes section"],
  // 16:9 — training page is aspect-[21/9], home training is aspect-[7/6].
  [6, "training.webp", 1600, 900, "training page + home training"],
  // 3:1 — contact banner is aspect-[21/9] on mobile, aspect-[3/1] from sm up.
  [7, "about/lab.webp", 1800, 600, "contact page banner"],
  // 16:10 — report cards.
  [8, "reports/vegan-petfood.webp", 1600, 1000, "vegan petfood report cover"],
  [9, "reports/vegan-palatants.webp", 1600, 1000, "vegan palatants report cover"],
  [10, "reports/petcare-market.webp", 1600, 1000, "petcare market report cover"],
];

for (const [num, dest, tw, th, note] of jobs) {
  const src = `${A}${num}.png`;
  const buf = await sharp(src)
    .resize(tw, th, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
  await sharp(buf).toFile(O + dest);
  console.log(
    `${String(num).padStart(2)}.png -> ${dest.padEnd(34)} ${tw}x${th}  ${Math.round(buf.length / 1024)}KB  (${note})`,
  );
}
