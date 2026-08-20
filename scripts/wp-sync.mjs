/**
 * WordPress -> Sanity fallback sync. One-way, on a schedule.
 *
 *   node scripts/wp-sync.mjs --dry     report actions, write wp-sync-preview.json
 *   node scripts/wp-sync.mjs           create/update Sanity documents
 *
 * Sanity is the source of truth; the legacy WordPress on the old Bluehost
 * origin is the fallback the client reaches for when Sanity misbehaves. This
 * script lets that fallback actually work: a post published on WordPress
 * appears on the site (via Sanity) within one schedule tick, at the same slug
 * WordPress gave it. The publish webhook Sanity already has then revalidates
 * the site, so no extra deploy step exists here.
 *
 * Rules, in order, per WordPress post:
 *
 *   1. Published before the site cutover -> ignored. Those posts were migrated
 *      by hand under new slugs, and next.config.ts redirects their old URLs.
 *   2. A Sanity post with the same slug that this sync did not create ->
 *      skipped. Hand-authored content always wins.
 *   3. Created by this sync and WordPress has not been edited since -> skipped.
 *   4. Otherwise created or replaced, id `post-wp-<wp id>`. Replacing means a
 *      Studio edit to a synced post survives only until the WordPress copy is
 *      edited again; once a post is in Sanity, edit it there.
 *
 * The old origin is reached by IP with the Host header pinned, because the
 * domain's DNS now points at Vercel. If Bluehost is ever cancelled, this
 * script loses its source and every run will fail loudly.
 */
import fs from "node:fs";
import https from "node:https";
import { createClient } from "@sanity/client";
import {
  makeKeyer,
  processor,
  reportSkips,
  toPortableText,
} from "./lib/markdown-to-portable-text.mjs";
import { decodeEntities, essayToMarkdown } from "./lib/wp-essay-html.mjs";

const ORIGIN_IP = "67.222.38.76";
const WP_HOST = "sinoninbio.tech";
const CUTOVER = "2026-08-18";
const AUTHOR = "Dr. Seronei Chelulei Cheison";
const CATEGORIES = [
  "Alternative Proteins",
  "Analysis",
  "Events",
  "Insects",
  "Interview",
  "Palatability",
  "Speaking",
  "Technology",
];
const DRY = process.argv.includes("--dry");

try {
  process.loadEnvFile(".env.local");
} catch {
  // CI passes the environment directly.
}

if (!DRY && !process.env.SANITY_API_WRITE_TOKEN) {
  console.error(
    "SANITY_API_WRITE_TOKEN is not set. Create an Editor token in " +
      "sanity.io/manage and export it (locally: .env.local; CI: repository secret).",
  );
  process.exit(1);
}

/** GET from the legacy origin, or any absolute URL on the same host. */
function originGet(pathname, binary = false, redirects = 3) {
  return new Promise((resolve, reject) => {
    https
      .request(
        {
          host: ORIGIN_IP,
          servername: WP_HOST,
          path: pathname,
          headers: { host: WP_HOST, "user-agent": "sinonin-wp-sync/1.0" },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
            res.resume();
            const next = new URL(res.headers.location, `https://${WP_HOST}`);
            return resolve(originGet(next.pathname + next.search, binary, redirects - 1));
          }
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`${res.statusCode} ${pathname}`));
          }
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () =>
            resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString("utf8")),
          );
        },
      )
      .on("error", reject)
      .end();
  });
}

/** Fetch an image wherever it lives; the site's own domain resolves to Vercel now, so those go via the origin IP. */
async function fetchImage(src) {
  const url = new URL(src);
  if (url.hostname === WP_HOST || url.hostname === `www.${WP_HOST}`) {
    return originGet(url.pathname + url.search, true);
  }
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${res.status} ${src}`);
  return Buffer.from(await res.arrayBuffer());
}

const plain = (html) => decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const wpPosts = JSON.parse(
  await originGet("/wp-json/wp/v2/posts?per_page=50&_embed=wp:term,wp:featuredmedia"),
);

const candidates = wpPosts.filter((p) => p.status === "publish" && p.date >= CUTOVER);
console.log(`${wpPosts.length} WordPress posts, ${candidates.length} after the cutover`);

/* No token in dry mode: the dataset is public, reads need none, and a stale
   token in .env.local would otherwise fail a run that writes nothing. */
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-05-04",
  token: DRY ? undefined : process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
const existing = await client.fetch(
  `*[_type == "post" && slug.current in $slugs]{_id, "slug": slug.current, wpId, wpModified}`,
  { slugs: candidates.map((p) => p.slug) },
);
const bySlug = new Map(existing.map((d) => [d.slug, d]));

const docs = [];
for (const wp of candidates) {
  const prior = bySlug.get(wp.slug);
  if (prior && !prior.wpId) {
    console.log(`  skip   ${wp.slug} (authored in Sanity)`);
    continue;
  }
  if (prior && prior.wpModified === wp.modified) {
    console.log(`  skip   ${wp.slug} (up to date)`);
    continue;
  }

  const { markdown, deck, heroSrc, heroAlt } = essayToMarkdown(wp.content.rendered);
  const key = makeKeyer();
  const body = await toPortableText(processor.parse(markdown), key, async () => null);

  // Cover: the essay's first image, else the featured image if one is set.
  const featured = wp._embedded?.["wp:featuredmedia"]?.[0];
  const coverSrc = heroSrc ?? featured?.source_url ?? null;
  const coverAlt = heroAlt || featured?.alt_text || "";
  let coverAssetId = null;
  if (coverSrc) {
    if (DRY) {
      coverAssetId = `image-DRY-${coverSrc.split("/").pop()}`;
    } else {
      try {
        const buf = await fetchImage(coverSrc);
        const asset = await client.assets.upload("image", buf, {
          filename: coverSrc.split("/").pop(),
        });
        coverAssetId = asset._id;
      } catch (e) {
        console.log(`  !! cover failed for ${wp.slug}: ${e.message}`);
      }
    }
  }

  const terms = (wp._embedded?.["wp:term"] ?? []).flat();
  const wpCategory = terms.find((t) => t.taxonomy === "category")?.name;
  const tags = terms.filter((t) => t.taxonomy === "post_tag").map((t) => t.name);

  const excerpt = (deck ?? plain(wp.excerpt.rendered)).slice(0, 320);
  const words = (markdown.match(/\S+/g) || []).length;

  docs.push({
    _id: prior?._id ?? `post-wp-${wp.id}`,
    _type: "post",
    wpId: wp.id,
    wpModified: wp.modified,
    title: decodeEntities(wp.title.rendered),
    slug: { _type: "slug", current: wp.slug },
    language: "en",
    date: wp.date.slice(0, 10),
    category: CATEGORIES.includes(wpCategory) ? wpCategory : "Analysis",
    ...(tags.length ? { tags } : {}),
    excerpt,
    ...(coverAssetId
      ? {
          cover: {
            _type: "image",
            asset: { _type: "reference", _ref: coverAssetId },
            alt: coverAlt,
          },
        }
      : {}),
    author: AUTHOR,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    body,
  });
  console.log(`  ${prior ? "update" : "create"} ${wp.slug} (${body.length} blocks)`);
}

if (DRY) {
  fs.writeFileSync("wp-sync-preview.json", JSON.stringify(docs, null, 2));
  console.log(`dry run: ${docs.length} document(s) written to wp-sync-preview.json`);
} else if (docs.length) {
  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();
  console.log(`committed ${docs.length} document(s)`);
} else {
  console.log("nothing to sync");
}
reportSkips();
