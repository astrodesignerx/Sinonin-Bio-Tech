import type { PortableTextBlock } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  allPostsQuery,
  postBySlugQuery,
  postSlugsQuery,
} from "@/sanity/lib/queries";

/*
  Posts come from Sanity rather than src/content/blog.

  The exported shape is deliberately unchanged from the MDX version, so the
  blog index, the post page and the header's search index all keep working. The
  one difference is that `getPost` returns the body as data instead of rendered
  markup: Portable Text is rendered by components/blog/portable-text.tsx, which
  a .ts module cannot construct.

  `cover` is now an absolute cdn.sanity.io URL instead of a path under /public.
  next.config.ts allows that host for next/image.
*/

/** Only English posts exist so far; German is a document field, not a fork. */
const DEFAULT_LANGUAGE = "en";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  cover?: string;
  coverAlt?: string;
  coverCredit?: string;
  coverLqip?: string;
  author?: string;
  readingMinutes?: number;
};

export type Post = PostMeta & { body: PortableTextBlock[] };

export async function getPostSlugs(): Promise<string[]> {
  return client.fetch<string[]>(postSlugsQuery, { language: DEFAULT_LANGUAGE });
}

export async function getAllPosts(): Promise<PostMeta[]> {
  return client.fetch<PostMeta[]>(allPostsQuery, {
    language: DEFAULT_LANGUAGE,
  });
}

/**
 * Returns null rather than throwing when nothing matches, so callers can hand
 * an unknown slug to notFound() without a try/catch around every read.
 */
export async function getPost(slug: string): Promise<Post | null> {
  return client.fetch<Post | null>(postBySlugQuery, {
    slug,
    language: DEFAULT_LANGUAGE,
  });
}
