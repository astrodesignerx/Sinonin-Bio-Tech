import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/blog/mdx-components";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  cover?: string;
  coverAlt?: string;
  coverCredit?: string;
};

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getPostMeta(slug: string): Promise<PostMeta> {
  const source = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8");
  const { frontmatter } = await compileMDX<PostMeta>({
    source,
    options: { parseFrontmatter: true },
  });
  return { ...frontmatter, slug };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(getPostSlugs().map(getPostMeta));
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string) {
  const source = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8");
  const { content, frontmatter } = await compileMDX<PostMeta>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
  });
  return { content, meta: { ...frontmatter, slug } };
}
