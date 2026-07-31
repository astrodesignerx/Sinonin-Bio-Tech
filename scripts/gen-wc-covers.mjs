import sharp from "sharp";

const A = "C:/Users/Host/AppData/Local/Temp/opencode/wcimgs/";
const O = "C:/Users/Host/Documents/Sinonin Bio Tech/public/images/blog/";

// Each entry: [src, output, extractBox | null]
// extractBox = { left, top, width, height } to crop first, then resize to 1600x1000.
// null = use resize with cover+attention on the whole image.

const jobs = [
  // Football: center on the pitch + main players. Source 3200x2400.
  // Center 1600x1000 (x 800-2400, y 700-1700) keeps the action (blue #23, red #19, pitch) and trims the heavy roof.
  [
    "football.jpg",
    "fifa-world-cup-lessons.webp",
    { left: 800, top: 700, width: 1600, height: 1000 },
  ],
  ["sem.jpg", "alternative-protein-failures.webp", null],
  ["speaker.jpg", "republica-2025-diaspora.webp", null],
];

for (const [src, out, box] of jobs) {
  let pipeline = sharp(A + src);
  if (box) {
    pipeline = pipeline.extract(box);
  } else {
    pipeline = pipeline.resize(1600, 1000, { fit: "cover", position: "attention" });
  }
  const buf = await pipeline.resize(1600, 1000).webp({ quality: 80 }).toBuffer();
  await sharp(buf).toFile(O + out);
  console.log(out, Math.round(buf.length / 1024) + "KB");
}
