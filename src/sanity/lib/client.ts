import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

/*
  The read client used by pages.

  `@sanity/client` rather than `next-sanity`: the website only reads published
  documents, and next-sanity exists mainly to host the Studio and drive visual
  editing. Neither happens here now that the Studio is its own application, and
  skipping it keeps the Studio's dependency tree out of the site bundle.

  `useCdn: true` serves from Sanity's cache, which is what a statically
  generated site wants. Pages are built once and rebuilt by webhook, so a few
  seconds of cache lag costs nothing and the requests are free.

  No token. The dataset is public, so published documents need no credentials.
  Draft previews will need a separate tokened client, added when draft mode is.
*/
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
