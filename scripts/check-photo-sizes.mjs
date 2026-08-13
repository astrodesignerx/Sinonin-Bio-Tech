import sharp from "sharp";

for (let i = 1; i <= 10; i++) {
  const f = `D:/Design/Cheison/Sinonin Biotech/${i}.png`;
  try {
    const m = await sharp(f).metadata();
    const aspect = Math.round((m.width / m.height) * 100) / 100;
    console.log(`${i}.png  ${m.width}x${m.height}  aspect=${aspect}`);
  } catch (e) {
    console.log(`${i}.png  ERR ${e.message}`);
  }
}
