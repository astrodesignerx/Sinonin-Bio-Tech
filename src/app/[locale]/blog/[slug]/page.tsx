import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPost, getPostSlugs } from "@/lib/blog";
import { seoMetadata } from "@/lib/meta";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getPostSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const { meta } = await getPost(slug);
    return seoMetadata({
      locale,
      path: `/blog/${slug}`,
      title: `${meta.title} | Sinonin Biotech`,
      description: meta.excerpt,
      image: meta.cover,
    });
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "blogPage" });
  const format = await getFormatter({ locale });
  const dateStr = format.dateTime(new Date(post.meta.date), {
    dateStyle: "long",
  });

  return <PostContent post={post} backLabel={t("backToBlog")} coverCreditLabel={t("coverCreditLabel")} dateStr={dateStr} />;
}

function PostContent({
  post,
  backLabel,
  coverCreditLabel,
  dateStr,
}: {
  post: Awaited<ReturnType<typeof getPost>>;
  backLabel: string;
  coverCreditLabel: string;
  dateStr: string;
}) {
  const { meta, content } = post;

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
        {meta.category} | {dateStr}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {meta.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-muted">{meta.excerpt}</p>

      {meta.cover && (
        <figure className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={meta.cover}
              alt={meta.coverAlt ?? meta.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              className="img-reveal object-cover"
            />
          </div>
          {meta.coverCredit && (
            <figcaption className="mt-2 text-xs leading-relaxed text-ink-muted">
              <span className="font-medium text-ink">{coverCreditLabel}</span>{" "}
              {meta.coverCredit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-10">{content}</div>
    </article>
  );
}
