import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const A = "C:/Users/Host/AppData/Local/Temp/opencode/assets/";
const O = "C:/Users/Host/Documents/Sinonin Bio Tech/public/images/";

const logos = {
  "sup-balpro.png": "balpro",
  "sup-bmwk.png": "bmwk",
  "sup-euipo.png": "euipo",
  "sup-futurepp.png": "futurepp",
  "sup-bic.png": "bic",
  "sup-giz.jpg": "giz",
  "sup-kibois.png": "kibois",
};

for (const [src, out] of Object.entries(logos)) {
  const buf = await readFile(A + src);
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const m = Math.min(data[i], data[i + 1], data[i + 2]);
    let a = 255;
    if (m >= 245) a = 0;
    else if (m > 232) a = Math.round((255 * (245 - m)) / 13);
    data[i + 3] = Math.min(data[i + 3], a);
  }
  const outBuf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 12 })
    .resize({ height: 64 })
    .png()
    .toBuffer();
  await writeFile(O + "supporters/" + out + ".png", outBuf);
}

await sharp("C:/Users/Host/AppData/Local/Temp/opencode/posts/palatability.md.txt")
  .resize(0)
  .toBuffer()
  .catch(() => {});

await sharp("C:/Users/Host/AppData/Local/Temp/opencode/assets/hero-bowls.png")
  .extract({ left: 0, top: 0, width: 1360, height: 620 })
  .resize(1200)
  .webp({ quality: 84 })
  .toFile(O + "blog-palatability.webp");

await sharp("C:/Users/Host/AppData/Local/Temp/opencode/assets/zest-launch.jpg")
  .extract({ left: 0, top: 180, width: 2048, height: 1280 })
  .resize(1280)
  .webp({ quality: 72 })
  .toFile(O + "zest-launch.webp");

console.log("assets reprocessed");
