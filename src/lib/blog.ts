import type { PortableTextBlock } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  allPostsQuery,
  postBySlugQuery,
  postSlugsQuery,
} from "@/sanity/lib/queries";

/*
  Posts come from Sanity rather than src/content/blog.

  The exported shape is otherwise unchanged from the MDX version, so the blog
  index, the post page and the header's search index keep working. The one
  difference is that `getPost` returns the body as data instead of rendered
  markup: Portable Text is rendered by components/blog/portable-text.tsx, which
  a .ts module cannot construct.

  `cover` is an absolute cdn.sanity.io URL rather than a path under /public.
  next.config.ts allows that host for next/image.

  Translations are paired by slug. A German post is a separate document with
  the same slug as its English counterpart, which is the rule the client has to
  follow when writing one; nothing enforces it, so it belongs in the training
  notes. Where no translation exists the English post is served, which is why
  every returned post carries the `language` it was actually written in.
*/

const FALLBACK_LANGUAGE = "en";

export type PostMeta = {
  slug: string;
  /** The language this document was written in, not the one requested. */
  language: string;
  title: string;
  date: string;
  category: string;
  tags?: string[];
  excerpt: string;
  cover?: string;
  coverAlt?: string;
  coverCredit?: string;
  coverLqip?: string;
  author?: string;
  readingMinutes?: number;
};

export type Post = PostMeta & { body: PortableTextBlock[] };

/**
 * Of the documents sharing one slug, the one in the requested language, or the
 * English original when there is no translation.
 */
function preferred<T extends { language: string }>(
  candidates: T[],
  language: string,
): T | undefined {
  return (
    candidates.find((c) => c.language === language) ??
    candidates.find((c) => c.language === FALLBACK_LANGUAGE) ??
    candidates[0]
  );
}

export async function getPostSlugs(): Promise<string[]> {
  return client.fetch<string[]>(postSlugsQuery);
}

export async function getAllPosts(language: string): Promise<PostMeta[]> {
  const all = await client.fetch<PostMeta[]>(allPostsQuery);

  const bySlug = new Map<string, PostMeta[]>();
  for (const post of all) {
    const group = bySlug.get(post.slug);
    if (group) group.push(post);
    else bySlug.set(post.slug, [post]);
  }

  return [...bySlug.values()]
    .map((group) => preferred(group, language))
    .filter((post): post is PostMeta => Boolean(post))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Returns null rather than throwing when nothing matches, so callers can hand
 * an unknown slug to notFound() without a try/catch around every read.
 */
export async function getPost(
  slug: string,
  language: string,
): Promise<Post | null> {
  const candidates = await client.fetch<Post[]>(postBySlugQuery, { slug });
  return preferred(candidates, language) ?? null;
}
