/*
  Queries for the blog.

  Image assets are dereferenced here rather than in the components, so a page
  renders from one round trip. `asset->url` follows the reference; the metadata
  carries the intrinsic dimensions and a base64 preview Sanity generates on
  upload, which replaces what scripts/gen-blur-placeholders.mjs did by hand for
  the file-based covers.

  Only English posts exist so far. `language` is already a field on every
  document, so adding German later is a parameter change, not a schema change.
*/

const POST_META = /* groq */ `
  "slug": slug.current,
  language,
  title,
  date,
  category,
  excerpt,
  author,
  readingMinutes,
  "cover": cover.asset->url,
  "coverAlt": cover.alt,
  "coverCredit": cover.credit,
  "coverLqip": cover.asset->metadata.lqip
`;

/*
  Every post in every language, newest first. The caller picks one document per
  slug, preferring the visitor's language. Twenty short records is one small
  request, and doing the choosing in JavaScript keeps the fallback rule in one
  readable place instead of spread across three queries.
*/
export const allPostsQuery = `
  *[_type == "post"] | order(date desc) {
    ${POST_META}
  }
`;

/* Unique, because a translated post shares its slug with the original. */
export const postSlugsQuery = `
  array::unique(*[_type == "post"].slug.current)
`;

/*
  The body projection spreads each block unchanged and then adds resolved image
  fields to figures only. Without the spread, every block would come back as an
  empty object; without the conditional, non-image blocks would carry null
  asset fields.
*/
export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug] {
    ${POST_META},
    body[] {
      ...,
      _type == "figure" => {
        ...,
        "url": asset->url,
        "dimensions": asset->metadata.dimensions,
        "lqip": asset->metadata.lqip
      }
    }
  }
`;

/*
  Reports, legal pages and settings.

  All eight report documents come back in one request: they are four short
  records in two languages, so filtering by language in the query would cost a
  second round trip on the pages that need a fallback, and save nothing.
*/
export const allReportsQuery = `
  *[_type == "report"] {
    key,
    language,
    title,
    body,
    points,
    "cover": cover.asset->url,
    "coverAlt": cover.alt,
    "coverCredit": cover.credit,
    "coverLqip": cover.asset->metadata.lqip
  }
`;

export const legalDocQuery = `
  *[_type == "legalDoc" && docType == $docType] {
    language,
    body
  }
`;

export const siteSettingsQuery = `
  *[_id == "siteSettings"][0] {
    email,
    bookingUrl
  }
`;
