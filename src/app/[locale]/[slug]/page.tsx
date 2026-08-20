import { notFound, permanentRedirect } from "next/navigation";
import { getPostSlugs } from "@/lib/blog";
import { findReport } from "@/lib/reports";

/*
  Old-WordPress-shaped URLs: the previous site served posts at the domain root
  (sinoninbio.tech/<slug>), and inbound links shaped that way still circulate.
  The redirect map in next.config.ts covers the posts that existed at cutover,
  but a post published after it has no entry there and its root-level URL used
  to 404.

  This route catches any unknown single-segment path under a locale, asks
  Sanity whether a post with that slug exists, and permanently redirects to its
  real home under /blog. Report slugs get the same treatment. Anything else is
  a genuine 404.

  It renders per request, not at build time: the whole point is slugs that did
  not exist when the site was last built. Static routes (about, contact, ...)
  take precedence over this dynamic segment, so it only ever sees leftovers.
*/
export default async function RootSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (findReport(slug)) {
    permanentRedirect(`/${locale}/reports/${slug}`);
  }

  const postSlugs = await getPostSlugs();
  if (postSlugs.includes(slug)) {
    permanentRedirect(`/${locale}/blog/${slug}`);
  }

  notFound();
}
