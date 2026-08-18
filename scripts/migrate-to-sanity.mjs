/**
 * One-off migration: the MDX posts in src/content/blog become Sanity documents.
 *
 *   node scripts/migrate-to-sanity.mjs --dry     write JSON to a file, touch nothing
 *   node scripts/migrate-to-sanity.mjs           upload images and create documents
 *
 * Safe to re-run. Document ids are derived from the slug and written with
 * createOrReplace, and Sanity deduplicates uploaded images by content hash, so
 * a second run overwrites rather than duplicating.
 *
 * Ids are `post-<slug>`, not `post.<slug>`. A dot makes the id a multi-segment
 * path, and the public read grant on a public dataset is `_id in path("*")`,
 * which matches single-segment ids only. Dotted ids are readable with a token
 * and invisible to the website, which is a confusing way to find out.
 *
 * The markdown walker lives in scripts/lib/markdown-to-portable-text.mjs and is
 * shared with the report and legal page migration, so the two cannot drift
 * into rendering the same markdown differently.
 */
import fs from "node:fs";
import path from "node:path";
import {
  makeClient,
  makeImageUploader,
  makeKeyer,
  parseFrontmatter,
  processor,
  reportSkips,
  toPortableText,
  uploadedAssetCount,
} from "./lib/markdown-to-portable-text.mjs";

const BLOG_DIR = "src/content/blog";
const DRY = process.argv.includes("--dry");

process.loadEnvFile(".env.local");

const client = makeClient();
const uploadImage = makeImageUploader(client, { dry: DRY });
const notes = [];
const docs = [];

for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx")).sort()) {
  const slug = file.replace(/\.mdx$/, "");
  const { meta, body } = parseFrontmatter(
    fs.readFileSync(path.join(BLOG_DIR, file), "utf8"),
  );
  const key = makeKeyer();

  const coverAsset = meta.cover ? await uploadImage(meta.cover) : null;
  const portable = await toPortableText(processor.parse(body), key, uploadImage);

  docs.push({
    _id: `post-${slug}`,
    _type: "post",
    title: meta.title,
    slug: { _type: "slug", current: slug },
    language: "en",
    date: meta.date,
    category: meta.category,
    excerpt: meta.excerpt,
    ...(coverAsset
      ? {
          cover: {
            _type: "image",
            asset: { _type: "reference", _ref: coverAsset },
            alt: meta.coverAlt ?? "",
            ...(meta.coverCredit ? { credit: meta.coverCredit } : {}),
          },
        }
      : {}),
    ...(meta.author ? { author: meta.author } : {}),
    ...(meta.readingMinutes ? { readingMinutes: meta.readingMinutes } : {}),
    body: portable,
  });

  notes.push(`${slug}: ${portable.length} blocks`);
}

if (DRY) {
  fs.writeFileSync("migration-preview.json", JSON.stringify(docs, null, 2));
  console.log(`dry run: ${docs.length} documents written to migration-preview.json`);
} else {
  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();
  console.log(`committed ${docs.length} documents, ${uploadedAssetCount()} images`);
}

for (const n of notes) console.log("  " + n);
reportSkips();
