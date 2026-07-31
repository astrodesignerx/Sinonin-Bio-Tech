import sharp from "sharp";

const logo = await sharp("public/brand/logo.png").resize(240).png().toBuffer();
const logoMeta = await sharp(logo).metadata();

const svg = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f7faf5"/>
  <circle cx="210" cy="315" r="190" fill="#ecf2e9"/>
  <text x="470" y="282" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="700" fill="#101f38" letter-spacing="-1">Sinonin Biotech</text>
  <text x="470" y="348" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#45546a">Alternative proteins &amp; palatants,</text>
  <text x="470" y="388" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#45546a">advanced by applied science.</text>
  <text x="470" y="462" font-family="Consolas, monospace" font-size="21" fill="#157a3c" letter-spacing="4">PROTEINS · ENZYMES · PALATANTS · TRAINING</text>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f97316"/><stop offset="0.22" stop-color="#c9e22a"/><stop offset="0.45" stop-color="#22c55e"/><stop offset="0.68" stop-color="#2dd4bf"/><stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect x="0" y="618" width="1200" height="12" fill="url(#g)"/>
</svg>`);

const base = await sharp(svg).png().toBuffer();

await sharp(base)
  .composite([
    {
      input: logo,
      left: Math.round(210 - (logoMeta.width || 240) / 2),
      top: Math.round(315 - (logoMeta.height || 240) / 2),
    },
  ])
  .png()
  .toFile("public/images/og-image.png");

console.log("og-image.png created");
