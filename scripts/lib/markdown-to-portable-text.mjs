/**
 * Shared markdown-to-Portable-Text machinery for the migration scripts.
 *
 * Split out when the legal pages needed the same walker as the blog: one
 * converter means the two cannot drift into rendering the same markdown in
 * two different ways.
 *
 * The node types handled here are exactly the ones the real content contains,
 * audited before this was written. Anything else is pushed onto `skips` and
 * reported by the caller rather than silently dropped.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const PUBLIC_DIR = "public";

export const skips = [];
export const processor = unified().use(remarkParse).use(remarkGfm);

export function makeClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2026-05-04",
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });
}

/* Frontmatter in this repo is flat: one `key: value` per line, strings
   double-quoted, numbers bare. A YAML dependency would buy nothing. */
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim().replace(/^"([\s\S]*)"$/, "$1");
    meta[kv[1]] = /^\d+$/.test(value) ? Number(value) : value;
  }
  return { meta, body: m[2] };
}

/* Keys must be unique within a document and stable across runs, so they are
   counted per document rather than randomised. */
export function makeKeyer() {
  let n = 0;
  return () => `k${n++}`;
}

const assetCache = new Map();

export function makeImageUploader(client, { dry = false } = {}) {
  return async function uploadImage(src) {
    if (assetCache.has(src)) return assetCache.get(src);
    const abs = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
    if (!fs.existsSync(abs)) {
      skips.push(`missing image on disk: ${src}`);
      return null;
    }
    if (dry) {
      assetCache.set(src, `image-DRY-${path.basename(abs)}`);
      return assetCache.get(src);
    }
    const asset = await client.assets.upload("image", fs.createReadStream(abs), {
      filename: path.basename(abs),
    });
    assetCache.set(src, asset._id);
    return asset._id;
  };
}

export const uploadedAssetCount = () => assetCache.size;

function imageBlock(assetId, key, extra = {}) {
  return {
    _type: "figure",
    _key: key,
    asset: { _type: "reference", _ref: assetId },
    ...extra,
  };
}

/* Inline nodes flatten into spans. `marks` carries decorators (strong, em) and
   annotation keys (links) together, which is how Portable Text stores both. */
function inlineSpans(nodes, key, markDefs, marks = []) {
  const spans = [];
  for (const node of nodes) {
    if (node.type === "text") {
      spans.push({ _type: "span", _key: key(), text: node.value, marks: [...marks] });
    } else if (node.type === "strong") {
      spans.push(...inlineSpans(node.children, key, markDefs, [...marks, "strong"]));
    } else if (node.type === "emphasis") {
      spans.push(...inlineSpans(node.children, key, markDefs, [...marks, "em"]));
    } else if (node.type === "link") {
      const defKey = key();
      markDefs.push({ _type: "link", _key: defKey, href: node.url });
      spans.push(...inlineSpans(node.children, key, markDefs, [...marks, defKey]));
    } else if (node.type === "inlineCode") {
      spans.push({ _type: "span", _key: key(), text: node.value, marks: [...marks] });
    } else if (node.children) {
      spans.push(...inlineSpans(node.children, key, markDefs, marks));
    } else if (node.value) {
      spans.push({ _type: "span", _key: key(), text: node.value, marks: [...marks] });
    }
  }
  return spans;
}

function textBlock(children, key, style = "normal", listItem) {
  const markDefs = [];
  const spans = inlineSpans(children, key, markDefs);
  const block = { _type: "block", _key: key(), style, markDefs, children: spans };
  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }
  return block;
}

/* The WordPress import left h5 and h6 behind. h6 nodes are genuine subheadings
   (interview questions, section titles) and become h3; h5 nodes are lede
   sentences and become paragraphs. Both render as unstyled browser defaults
   today, so neither is a regression. */
function headingStyle(depth) {
  if (depth <= 2) return "h2";
  if (depth === 5) return "normal";
  return "h3";
}

function parseFigureAttrs(html) {
  const attr = (name) => {
    const m = html.match(new RegExp(`${name}="([^"]*)"`));
    return m ? m[1] : undefined;
  };
  return { src: attr("src"), alt: attr("alt"), caption: attr("caption") };
}

function cellText(cell) {
  const walk = (n) => n.value ?? (n.children ?? []).map(walk).join("");
  return (cell.children ?? []).map(walk).join("");
}

export async function toPortableText(tree, key, uploadImage) {
  const out = [];
  for (const node of tree.children) {
    switch (node.type) {
      case "heading":
        out.push(textBlock(node.children, key, headingStyle(node.depth)));
        break;

      case "paragraph": {
        const flat = node.children.map((c) => c.value ?? "").join("").trim();
        if (flat === "❦") {
          out.push({ _type: "divider", _key: key(), style: "ornament" });
          break;
        }
        /* A lone image in a paragraph is a figure, not a line of text. */
        if (node.children.length === 1 && node.children[0].type === "image") {
          const img = node.children[0];
          const assetId = await uploadImage(img.url);
          if (assetId) {
            out.push(
              imageBlock(assetId, key(), {
                alt: img.alt || "",
                ...(img.title ? { caption: img.title } : {}),
              }),
            );
          }
          break;
        }
        out.push(textBlock(node.children, key));
        break;
      }

      case "blockquote":
        for (const child of node.children) {
          out.push(textBlock(child.children ?? [], key, "blockquote"));
        }
        break;

      case "list":
        for (const item of node.children) {
          for (const child of item.children ?? []) {
            out.push(
              textBlock(
                child.children ?? [],
                key,
                "normal",
                node.ordered ? "number" : "bullet",
              ),
            );
          }
        }
        break;

      case "thematicBreak":
        out.push({ _type: "divider", _key: key(), style: "line" });
        break;

      case "table":
        out.push({
          _type: "table",
          _key: key(),
          rows: node.children.map((row) => ({
            _type: "row",
            _key: key(),
            cells: row.children.map(cellText),
          })),
        });
        break;

      case "html": {
        if (!node.value.includes("<Figure")) {
          skips.push(`unhandled html: ${node.value.slice(0, 60).replace(/\s+/g, " ")}`);
          break;
        }
        const { src, alt, caption } = parseFigureAttrs(node.value);
        const assetId = await uploadImage(src);
        if (assetId) {
          out.push(
            imageBlock(assetId, key(), {
              alt: alt || "",
              ...(caption ? { caption } : {}),
            }),
          );
        }
        break;
      }

      case "image": {
        const assetId = await uploadImage(node.url);
        if (assetId) out.push(imageBlock(assetId, key(), { alt: node.alt || "" }));
        break;
      }

      default:
        skips.push(`unhandled node: ${node.type}`);
    }
  }
  return out;
}

export function reportSkips() {
  if (!skips.length) return;
  console.log("\nskipped:");
  for (const s of [...new Set(skips)]) console.log("  " + s);
}
