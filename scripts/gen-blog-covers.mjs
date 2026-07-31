import sharp from "sharp";

const O = "C:/Users/Host/Documents/Sinonin Bio Tech/public/images/blog/";

const svg = (content) => Buffer.from(`
<svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${content.c1}"/>
      <stop offset="1" stop-color="${content.c2}"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <circle cx="40" cy="40" r="1.5" fill="${content.dot}" fill-opacity="0.5"/>
    </pattern>
  </defs>
  <rect width="1600" height="1000" fill="url(#g)"/>
  <rect width="1600" height="1000" fill="url(#dots)"/>
  ${content.svg}
</svg>`);

const fifa = svg({
  c1: "#0a2a1a",
  c2: "#1d3a6e",
  dot: "#ffffff",
  svg: `
    <g transform="translate(800,500)" fill="none" stroke="#22c55e" stroke-width="3">
      <circle r="180" stroke-dasharray="20 14" stroke-opacity="0.6"/>
      <path d="M-60 -10 L-30 -80 L40 -60 L80 -90 L100 0" stroke-linecap="round" stroke-width="4"/>
      <circle r="14" fill="#f7faf5" stroke="none"/>
    </g>
    <text x="800" y="850" font-family="Consolas, monospace" font-size="22" letter-spacing="6" fill="#f7faf5" fill-opacity="0.55" text-anchor="middle">PROTEIN × FOOTBALL · EIGHT LESSONS</text>
  `,
});

const failures = svg({
  c1: "#101f38",
  c2: "#0a2a1a",
  dot: "#ffffff",
  svg: `
    <g transform="translate(800,480)" fill="none" stroke="#157a3c" stroke-width="3" stroke-linecap="round">
      <polyline points="-220,120 -120,80 -20,30 80,-20 180,-90 260,-130" stroke-opacity="0.8"/>
      <line x1="-220" y1="-150" x2="220" y2="-150" stroke="#157a3c" stroke-opacity="0.25" stroke-dasharray="6 10"/>
    </g>
    <g transform="translate(800,480)">
      <circle r="9" fill="#f7faf5"/>
    </g>
    <text x="800" y="850" font-family="Consolas, monospace" font-size="22" letter-spacing="6" fill="#f7faf5" fill-opacity="0.55" text-anchor="middle">HEADWINDS IN ALTERNATIVE PROTEIN</text>
  `,
});

const republica = svg({
  c1: "#157a3c",
  c2: "#0a2a1a",
  dot: "#ffffff",
  svg: `
    <g transform="translate(800,500)" fill="none" stroke="#f7faf5" stroke-width="3" stroke-linecap="round">
      <rect x="-50" y="-90" width="100" height="140" rx="55" stroke-opacity="0.7"/>
      <line x1="0" y1="-200" x2="0" y2="-90" stroke-opacity="0.6"/>
      <line x1="-26" y1="-180" x2="-26" y2="-130" stroke-opacity="0.4"/>
      <line x1="26" y1="-180" x2="26" y2="-130" stroke-opacity="0.4"/>
    </g>
    <text x="800" y="850" font-family="Consolas, monospace" font-size="22" letter-spacing="6" fill="#f7faf5" fill-opacity="0.55" text-anchor="middle">RE:PUBLICA 2025 · BERLIN</text>
  `,
});

await sharp(fifa).webp({ quality: 82 }).toFile(O + "fifa-world-cup-lessons.webp");
await sharp(failures).webp({ quality: 82 }).toFile(O + "alternative-protein-failures.webp");
await sharp(republica).webp({ quality: 82 }).toFile(O + "republica-2025-diaspora.webp");
console.log("blog covers generated");
