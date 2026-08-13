import sharp from "sharp";

const A = "C:/Users/Host/AppData/Local/Temp/opencode/wcimgs/";
const O = "C:/Users/Host/Documents/Sinonin Bio Tech/public/images/blog/";

// [srcFile, outputName, crop|null, targetW, targetH]
// targetW/targetH: 1600x1000 = 16:10 (cards), 1600x900 = 16:9 (about banner)
const jobs = [
  // Soybean harvest: 5985x3990 (~3:2). Cover the harvester right side + horizon.
  [
    "soybean-harvest.jpg",
    null,
    { left: 800, top: 200, width: 4500, height: 2800 },
    1600,
    1000,
  ],
  // Petfood aisle (Moscow, CC0): 2400x1800 (~4:3). Center.
  [
    "petfood-aisle.jpg",
    null,
    { left: 200, top: 0, width: 2000, height: 1250 },
    1600,
    1000,
  ],
  // Biofermentor: 3264x2448 (~4:3). Focus on the vessel + controls.
  [
    "biofermentor.jpg",
    null,
    { left: 600, top: 200, width: 2400, height: 1500 },
    1600,
    1000,
  ],
  // Kericho tea (Nandi): 4160x2080 (~2:1). For About banner: 16:9. Take lower 2/3 for landscape without too much sky.
  [
    "kericho-tea.jpg",
    null,
    { left: 0, top: 600, width: 4160, height: 1480 },
    1600,
    900,
  ],
  // Spices (Indonesian market): 1002x549 (~16:9). Resize only.
  [
    "spices.jpg",
    null,
    null,
    1600,
    1000,
  ],
  // BSF larvae (hermetia.jpg): 2592x4608 (portrait). Crop center band of larvae.
  [
    "hermetia.jpg",
    null,
    { left: 0, top: 1600, width: 2592, height: 1620 },
    1600,
    1000,
  ],
  // Dog bell pepper: 2811x1581 (~16:9). Crop sides for 16:10.
  [
    "dog-bell-pepper.jpg",
    null,
    { left: 140, top: 0, width: 2530, height: 1581 },
    1600,
    1000,
  ],
];

for (const [src, _null, box, tw, th] of jobs) {
  let p = sharp(A + src);
  if (box) p = p.extract(box);
  const buf = await p.resize(tw, th, { fit: "fill" }).webp({ quality: 82 }).toBuffer();
  const out = src.replace(/\.[^.]+$/, ".webp");
  await sharp(buf).toFile(O + out);
  const m = await sharp(buf).metadata();
  console.log(out, m.width + "x" + m.height, Math.round(buf.length / 1024) + "KB");
}
