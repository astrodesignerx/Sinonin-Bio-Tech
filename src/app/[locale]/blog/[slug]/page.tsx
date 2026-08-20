import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPost, getPostSlugs, type Post } from "@/lib/blog";
import PostBody from "@/components/blog/portable-text";
import { seoMetadata } from "@/lib/meta";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);
  if (!post) return {};
  return seoMetadata({
    path: `/blog/${slug}`,
    title: `${post.title} | Sinonin Biotech`,
    description: post.excerpt,
    image: post.cover,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPost(slug, locale);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blogPage" });
  const format = await getFormatter({ locale });
  const dateStr = format.dateTime(new Date(post.date), { dateStyle: "long" });

  return (
    <PostContent
      post={post}
      backLabel={t("backToBlog")}
      coverCreditLabel={t("coverCreditLabel")}
      dateStr={dateStr}
    />
  );
}

function PostContent({
  post,
  backLabel,
  coverCreditLabel,
  dateStr,
}: {
  post: Post;
  backLabel: string;
  coverCreditLabel: string;
  dateStr: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition motion-press hover:text-ink"
      >
        <ArrowLeft size={15} weight="bold" />
        {backLabel}
      </Link>

      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-leaf">
        {post.category} | {dateStr}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {post.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>

      {post.cover && (
        <figure className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={post.cover}
              alt={post.coverAlt ?? post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              placeholder={post.coverLqip ? "blur" : "empty"}
              blurDataURL={post.coverLqip}
              className="img-reveal object-cover"
            />
          </div>
          {post.coverCredit && (
            <figcaption className="mt-2 text-xs leading-relaxed text-ink-muted">
              <span className="font-medium text-ink">{coverCreditLabel}</span>{" "}
              {post.coverCredit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-10">
        <PostBody value={post.body} />
      </div>

      {post.tags && post.tags.length > 0 && (
        <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
