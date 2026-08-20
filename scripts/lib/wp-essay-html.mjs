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

function blocksToMarkdown(section) {
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

  let heroSrc = null;
  let heroAlt = null;
  html = html.replace(/<img\b[^>]*>/i, (tag) => {
    heroSrc = tag.match(/src="([^"]+)"/i)?.[1] ?? null;
    heroAlt = decode(tag.match(/alt="([^"]*)"/i)?.[1] ?? "");
    return "";
  });

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

  return { markdown: blocksToMarkdown(html), deck, heroSrc, heroAlt };
}
