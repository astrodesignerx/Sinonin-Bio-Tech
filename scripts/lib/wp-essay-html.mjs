/**
 * WordPress essay HTML -> markdown, for the fallback sync.
 *
 * The client writes posts on WordPress as self-contained styled HTML with an
 * `sbt-essay` wrapper: a style block, an inner display title, a deck, a
 * byline, a hero image with a caption paragraph, kicker labels above the
 * section headings, pull quotes, and `<hr class="sbt-rule">` section breaks.
 *
 * This module reduces that to the markdown the migration pipeline already
 * understands, following the conventions the client used when recreating the
 * same post by hand in Sanity:
 *
 *   - the deck becomes the excerpt, not a body paragraph
 *   - the first image becomes the cover; its caption paragraph stays as the
 *     first body paragraph
 *   - a kicker merges into the heading after it ("Movement I · The Heading")
 *   - pull quotes become blockquotes
 *   - tables become markdown tables, first row as the header
 *   - `sbt-rule` breaks become the ornament divider the body schema has
 *   - the inner h1, the byline and the eyebrow are dropped: the post's own
 *     title and author fields carry them
 *
 * The inline/block walkers descend from scripts/port-legacy-posts.mjs, which
 * scraped the same markup off the rendered legacy pages.
 */

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
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

export const decodeEntities = decode;

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

/*
  An HTML table -> a markdown (GFM) table, which the converter turns into the
  body schema's `table` block. The first row becomes the header, as the site
  renders it, whether WordPress marked it up as <th> or <td>. Rows are padded
  to the widest row, because a markdown table needs the same number of cells
  on every line. Cells are plain text in Sanity, so bold and links reduce to
  their words. Returns null when there is nothing to keep, so the caller can
  report the table instead of dropping it silently.
*/
function tableToMarkdown(raw) {
  if (/<table\b/i.test(raw)) return null; // a table inside a table: no safe reading
  const rows = [...raw.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((tr) =>
    [...tr[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
      inline(cell[1].replace(/<\/(p|div|li)>/gi, " ")).replace(/\|/g, "\\|"),
    ),
  );
  const width = Math.max(0, ...rows.map((r) => r.length));
  if (width === 0 || rows.every((r) => r.every((c) => !c))) return null;
  const line = (cells) =>
    `| ${[...cells, ...Array(width - cells.length).fill("")].join(" | ")} |`;
  const [head, ...body] = rows;
  return [line(head), line(Array(width).fill("---")), ...body.map(line)].join("\n");
}

function blocksToMarkdown(section, badTables) {
  const out = [];
  const blockRe =
    /<(table|h2|h3|h4|p|blockquote|ul|ol|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = blockRe.exec(section))) {
    const tag = m[1].toLowerCase();
    const raw = m[2];

    if (tag === "table") {
      const table = tableToMarkdown(raw);
      if (table) out.push(table);
      else badTables.push(inline(raw).slice(0, 60) || "(empty table)");
      continue;
    }

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

/** Match a block element carrying a given class, e.g. `<p class="... sbt-deck ...">`. */
const byClass = (tag, cls) =>
  new RegExp(`<${tag}\\b[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");

/**
 * The full reduction. Returns markdown plus the pieces that become fields
 * rather than body content.
 */
export function essayToMarkdown(contentHtml) {
  let html = extractEssay(contentHtml) ?? contentHtml;

  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "");
  html = html.replace(byClass("p", "sbt-byline"), "");
  html = html.replace(byClass("p", "sbt-eyebrow"), "");

  let deck = null;
  html = html.replace(byClass("p", "sbt-deck"), (_, t) => {
    deck ??= inline(t);
    return "";
  });

  /* Images. The first one with a real address becomes the cover; every later
     one stays in the body as a figure, with its figcaption as the caption.
     An image whose address is not a URL (an unfilled placeholder such as
     "SWOT_IMAGE_URL") is dropped and reported, so the run can flag it. */
  let heroSrc = null;
  let heroAlt = null;
  const badImages = [];
  const imgAttr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
  const asFigure = (imgTag, captionHtml = "") => {
    const src = imgAttr(imgTag, "src");
    const alt = decode(imgAttr(imgTag, "alt"));
    if (!isImageUrl(src)) {
      badImages.push(src || "(empty src)");
      return "";
    }
    if (heroSrc === null) {
      heroSrc = src;
      heroAlt = alt;
      // The cover's caption stays as the first body paragraph, as before.
      return captionHtml ? `<figcaption>${captionHtml}</figcaption>` : "";
    }
    const caption = inline(captionHtml).replace(/["\\]/g, "\\$&");
    const safeAlt = alt.replace(/[[\]\\]/g, "\\$&");
    const safeSrc = src.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
    // Its own paragraph, so the markdown converter sees a lone image: a figure.
    return `<p>![${safeAlt}](${safeSrc}${caption ? ` "${caption}"` : ""})</p>`;
  };
  html = html.replace(
    /<figure\b[^>]*>([\s\S]*?)<\/figure>/gi,
    (whole, inner) => {
      const img = inner.match(/<img\b[^>]*>/i)?.[0];
      if (!img) return whole;
      const caption = inner.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] ?? "";
      return asFigure(img, caption);
    },
  );
  html = html.replace(/<img\b[^>]*>/gi, (tag) => asFigure(tag));

  html = html.replace(/<hr\b[^>]*class="[^"]*sbt-rule[^"]*"[^>]*\/?>/gi, "<p>❦</p>");

  // Kicker + heading pairs collapse into one heading, the client's own
  // convention. A kicker with no heading after it is dropped. The kicker
  // capture is `[^<]*` on purpose: `[\s\S]*?` can lazily grow across whole
  // sections until some later </p> happens to precede an <h2>.
  html = html.replace(
    /<p\b[^>]*class="[^"]*\bsbt-(?:kicker|num)\b[^"]*"[^>]*>([^<]*)<\/p>\s*<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (_, kicker, attrs, heading) => `<h2${attrs}>${kicker.trim()} · ${heading.trim()}</h2>`,
  );
  html = html.replace(byClass("p", "sbt-kicker"), "");
  html = html.replace(byClass("p", "sbt-num"), "");

  html = html.replace(byClass("p", "sbt-pull"), (_, t) => `<blockquote>${t}</blockquote>`);

  const badTables = [];
  const markdown = blocksToMarkdown(html, badTables);
  return { markdown, deck, heroSrc, heroAlt, badImages, badTables };
}

/** True for an address the sync can actually fetch: http(s) or site-relative. */
export function isImageUrl(src) {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return ["http:", "https:"].includes(new URL(src).protocol);
  } catch {
    return false;
  }
}
