/**
 * One-off migration: pull the three palatability essays that only exist on the
 * legacy WordPress site and write them as MDX.
 *
 * The content root on those pages is `div.sbt-essay`. Everything outside it
 * (tag list, author box, related posts) is site chrome we already render.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import sharp from "sharp";

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "accept-encoding": "identity",
};

const POSTS = [
  {
    url: "https://www.sinoninbio.tech/petfood-palatability-and-the-fresh-kill-signal-cats-read-as-prey/",
    slug: "petfood-palatability-fresh-kill-signal",
    title: "Petfood Palatability and the Fresh-Kill Signal Cats Read as Prey",
    date: "2026-07-30",
    category: "Palatability",
    excerpt:
      "Why the cat at the bowl is not smelling meat. It is smelling a fresh kill, and the single molecule that tells it so is one the flavour industry has spent twenty-five years trying to bottle.",
  },
  {
    url: "https://www.sinoninbio.tech/petfood-palatability-why-replacing-meat-is-more-than-replacing-protein/",
    slug: "petfood-palatability-replacing-meat",
    title: "Petfood Palatability: Why Replacing Meat Is More Than Replacing Protein",
    date: "2026-08-06",
    category: "Palatability",
    excerpt:
      "A legume may provide the vocabulary of nutrition. Meat provides the grammar of recognition, and species identity lives in the phospholipids.",
  },
  {
    url: "https://www.sinoninbio.tech/petfood-palatability-why-fat-is-the-signal-alternative-proteins-forget/",
    slug: "petfood-palatability-fat-is-the-signal",
    title: "Petfood Palatability: Why Fat Is the Signal Alternative Proteins Forget",
    date: "2026-08-12",
    category: "Palatability",
    excerpt:
      "Protein research dominates alternative protein development, but fat is the only nutrient that carries its own timestamp, and animals read it.",
  },
];

const AUTHOR = "Dr. Seronei Chelulei Cheison";
const OUT_DIR = "src/content/blog";
const IMG_DIR = "public/images/blog";

function get(url, binary = false) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: HEADERS }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(get(res.headers.location, binary));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode} ${url}`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString("utf8")),
        );
      })
      .on("error", reject);
  });
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, ", ")
    .replace(/&#8230;|&hellip;/g, "...")
    // Named entities that survive in the source: Turkish and Spanish names in
    // the citations, plus a maths minus.
    .replace(/&Idot;/g, "İ")
    .replace(/&Scedil;/g, "Ş")
    .replace(/&scedil;/g, "ş")
    .replace(/&gbreve;/g, "ğ")
    .replace(/&aacute;/g, "á")
    .replace(/&minus;/g, "−")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/** Inline HTML -> markdown. Block tags are handled by the caller. */
function inline(html) {
  return decode(
    html
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${t.trim()}**`)
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${t.trim()}*`)
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) =>
        `[${t.trim()}](${href})`,
      )
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .trim();
}

function toMarkdown(section) {
  const out = [];
  const blockRe =
    /<(h2|h3|h4|p|blockquote|ul|ol|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = blockRe.exec(section))) {
    const tag = m[1].toLowerCase();
    const raw = m[2];

    if (tag === "ul" || tag === "ol") {
      const items = [...raw.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li, i) => {
          const text = inline(li[1]);
          return text ? (tag === "ul" ? `- ${text}` : `${i + 1}. ${text}`) : "";
        })
        .filter(Boolean);
      if (items.length) out.push(items.join("\n"));
      continue;
    }

    const text = inline(raw);
    if (!text) continue;

    if (tag === "h2") out.push(`## ${text}`);
    else if (tag === "h3") out.push(`### ${text}`);
    else if (tag === "h4") out.push(`#### ${text}`);
    else if (tag === "blockquote") out.push(text.split("\n").map((l) => `> ${l}`).join("\n"));
    // Captions are italicised as a whole, so any emphasis already inside them
    // has to switch delimiter or the nesting breaks the markdown.
    else if (tag === "figcaption") out.push(`*${text.replace(/\*([^*]+)\*/g, "_$1_")}*`);
    else out.push(text);
  }
  return out.join("\n\n");
}

/** Grab the innermost `div.sbt-essay` by walking div depth from its opening tag. */
function extractEssay(html) {
  const start = html.search(/<div[^>]*class="[^"]*sbt-essay[^"]*"[^>]*>/i);
  if (start === -1) return null;
  const openTag = html.slice(start).match(/^<div[^>]*>/i)[0];
  let i = start + openTag.length;
  let depth = 1;
  const tagRe = /<(\/?)div\b[^>]*>/gi;
  tagRe.lastIndex = i;
  let m;
  while (depth > 0 && (m = tagRe.exec(html))) {
    depth += m[1] ? -1 : 1;
    i = tagRe.lastIndex;
  }
  return html.slice(start + openTag.length, i - "</div>".length);
}

const yaml = (s) => `"${String(s).replace(/"/g, '\\"')}"`;

for (const post of POSTS) {
  const html = await get(post.url);
  const essay = extractEssay(html);
  if (!essay) {
    console.log("!! no sbt-essay in", post.slug);
    continue;
  }

  // Hero image: self-host it rather than hotlinking Blogger's CDN.
  let cover = null;
  let coverAlt = null;
  const fig = essay.match(/<img\b[^>]*>/i);
  if (fig) {
    const src = fig[0].match(/src="([^"]+)"/i)?.[1];
    coverAlt = fig[0].match(/alt="([^"]*)"/i)?.[1];
    if (src) {
      try {
        const buf = await get(src, true);
        const file = `${post.slug}.webp`;
        await sharp(buf)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 84 })
          .toFile(path.join(IMG_DIR, file));
        cover = `/images/blog/${file}`;
      } catch (e) {
        console.log("   image failed:", e.message);
      }
    }
  }

  const body = toMarkdown(essay);
  const words = (body.match(/\S+/g) || []).length;
  const minutes = Math.max(1, Math.round(words / 220));

  const fm = [
    "---",
    `title: ${yaml(post.title)}`,
    `date: ${yaml(post.date)}`,
    `category: ${yaml(post.category)}`,
    `excerpt: ${yaml(post.excerpt)}`,
    cover ? `cover: ${yaml(cover)}` : null,
    coverAlt ? `coverAlt: ${yaml(decode(coverAlt))}` : null,
    `author: ${yaml(AUTHOR)}`,
    `readingMinutes: ${minutes}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  fs.writeFileSync(path.join(OUT_DIR, `${post.slug}.mdx`), `${fm}\n\n${body}\n`);
  console.log(
    `${post.slug.padEnd(42)} ${words} words, ${minutes} min, cover: ${cover ? "yes" : "NO"}`,
  );
}
