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
 * WordPress lives on the old Bluehost server, kept alive after the main domain
 * moved to Vercel. It is reachable two ways, and wpGet below explains which one
 * this script leads with and why. If Bluehost is ever cancelled, this script
 * loses its source and every run will fail loudly.
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

const WP_BASE = "https://wp.sinoninbio.tech";
/* Hostnames that mean "the WordPress server" in content the client writes
   there: the old pre-Vercel address, the wp subdomain itself, and Bluehost's
   temporary URL for the account. Images under any of them are fetched from
   WP_BASE; links to them are rewritten to the live site. */
const WP_HOSTS = [
  "sinoninbio.tech",
  "www.sinoninbio.tech",
  "wp.sinoninbio.tech",
  "tde.qtb.mybluehost.me",
];
const SITE_BASE = "https://www.sinoninbio.tech";
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

/* A browser user-agent, not an honest bot one: the host 403s unfamiliar agents
   from datacenter IPs (GitHub runners included), and this is our own server
   telling us about our own content. The legacy port script needed the same. */
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  accept: "application/json,text/html,*/*",
  "accept-language": "en-US,en;q=0.9",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Both routes fail intermittently rather than cleanly, so every request gets a
   few goes with a widening gap before it counts as a failure. */
const ATTEMPTS = 4;

/* The server's raw address. Bluehost still serves WordPress here directly. */
const ORIGIN_IP = "67.222.38.76";
const ORIGIN_HOST = "sinoninbio.tech";

/** Straight to the server IP, presenting the main domain, whose vhost the
    host's protection leaves alone. One attempt; the retry loop is in wpGet. */
function originGet(path, binary = false) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: ORIGIN_IP,
        servername: ORIGIN_HOST,
        path,
        headers: { ...BROWSER_HEADERS, host: ORIGIN_HOST },
        timeout: 30_000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode} ${path} (origin route)`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("error", reject);
        res.on("end", () =>
          resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString("utf8")),
        );
      },
    );
    req.on("timeout", () => req.destroy(new Error(`timeout ${path} (origin route)`)));
    req.on("error", reject);
    req.end();
  });
}

/** The wp subdomain, through whatever the CDN in front of it decides. */
async function subdomainGet(path, binary = false) {
  const res = await fetch(`${WP_BASE}${path}`, { headers: BROWSER_HEADERS });
  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(`${res.status} ${path} (${WP_BASE})`);
  }
  return binary ? Buffer.from(await res.arrayBuffer()) : res.text();
}

/** GET a path from WordPress, origin IP first.
 *
 *  The wp subdomain used to be the primary route, but the host has since put a
 *  CDN bot challenge in front of it that answers Node's fetch with a 403 no
 *  matter the headers or cookies it carries. The origin IP answers the same
 *  request with a 200, so that is the route we lead with; the subdomain stays
 *  as the last resort, because DNS is the only way to find the server again if
 *  the account is ever moved to a new IP.
 *
 *  Both routes drop connections now and then (ECONNRESET on large images,
 *  ECONNREFUSED from some datacenter IPs), so each gets several attempts before
 *  we give up on it. */
async function wpGet(path, binary = false) {
  const failures = [];
  for (const [label, route] of [
    ["origin IP", originGet],
    [WP_BASE, subdomainGet],
  ]) {
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      try {
        return await route(path, binary);
      } catch (e) {
        if (attempt === ATTEMPTS) failures.push(`${label}: ${e.message}`);
        else await sleep(attempt * 500);
      }
    }
    console.log(`  (${label} failed for ${path}, trying the other route)`);
  }
  throw new Error(`could not fetch ${path}\n    ${failures.join("\n    ")}`);
}

/** Fetch an image wherever it lives. Uploads under any name the WordPress
    server has answered to are fetched from WordPress: the old domain now
    points at Vercel, which no longer serves them. */
async function fetchImage(src) {
  const url = new URL(src);
  if (WP_HOSTS.includes(url.hostname)) {
    return wpGet(url.pathname + url.search, true);
  }
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${res.status} ${src}`);
  return Buffer.from(await res.arrayBuffer());
}

/* Links the client writes on WordPress point at wherever he was working:
   the wp subdomain or Bluehost's temporary URL. On the live site those must
   land on the live site, so rewrite them; www links already do. */
const rewriteLinks = (markdown) =>
  markdown.replace(
    /https?:\/\/(?:wp\.sinoninbio\.tech|tde\.qtb\.mybluehost\.me)/g,
    SITE_BASE,
  );

const plain = (html) => decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const wpPosts = JSON.parse(
  await wpGet("/wp-json/wp/v2/posts?per_page=50&_embed=wp:term,wp:featuredmedia"),
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
  const body = await toPortableText(processor.parse(rewriteLinks(markdown)), key, async () => null);

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
