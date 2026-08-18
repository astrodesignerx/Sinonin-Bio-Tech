import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

/*
  The read client used by pages.

  `@sanity/client` rather than `next-sanity`: the website only reads published
  documents, and next-sanity exists mainly to host the Studio and drive visual
  editing. Neither happens here now that the Studio is its own application, and
  skipping it keeps the Studio's dependency tree out of the site bundle.

  `useCdn: false` on purpose, despite this being a statically generated site
  where the cache would normally be free money.

  The API CDN can serve stale data for a short window after a mutation, and the
  publish webhook fires immediately. With the CDN on, a page could regenerate
  from pre-edit content and then be cached that way, with nothing scheduled to
  correct it until the next publish. An editor sees their change land once and
  silently fail the next time.

  Pages are generated at build time and on webhook, not per visitor, so the
  number of uncached requests this costs is tiny.

  No token. The dataset is public, so published documents need no credentials.
  Draft previews will need a separate tokened client, added when draft mode is.
*/
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});
