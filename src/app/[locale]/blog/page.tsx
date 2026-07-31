import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import { Newspaper } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import PageHeader from "@/components/ui/page-header";
import Reveal from "@/components/ui/reveal";
import { getAllPosts, type PostMeta } from "@/lib/blog";

const POST_COVERS: Record<string, { src: string; alt: string }> = {
  "fifa-world-cup-lessons-alt-prot": {
    src: "/images/blog/fifa-world-cup-lessons.webp",
    alt: "Football match under floodlights at Priestfield Stadium — players in blue and red kits on the pitch, a stand full of spectators in the background.",
  },
  "alternative-protein-industry-failures": {
    src: "/images/blog/alternative-protein-failures.webp",
    alt: "A scientist in a white coat working at the controls of a JEOL scanning electron microscope, with a monitor displaying a micrograph at the right.",
  },
  "republica-2025-diaspora-remittances": {
    src: "/images/blog/republica-2025-diaspora.webp",
    alt: "A speaker in a brown blazer at a microphone, addressing an audience with a blue presentation screen behind.",
  },
};

function FallbackCover({ slug, label }: { slug: string; label: string }) {
  const cover = POST_COVERS[slug];
  if (cover) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-mist"
      role="img"
      aria-label={label}
    >
      <Newspaper size={48} className="text-leaf/50" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.blog" });
  return seoMetadata({ locale, path: "/blog", title: t("title"), description: t("description") });
}
function PostDate({ date }: { date: string }) {
  return <>{date}</>;
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = await getAllPosts();
  const format = await getFormatter({ locale });

  return <BlogContent posts={posts} format={format} />;
}

function BlogContent({
  posts,
  format,
}: {
  posts: PostMeta[];
  format: Awaited<ReturnType<typeof getFormatter>>;
}) {
  const t = useTranslations("blogPage");
  const [featured, ...rest] = posts;

  const formatDate = (iso: string) =>
    format.dateTime(new Date(iso), { dateStyle: "long" });

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />
      {t("englishNote") && (
        <div className="mx-auto -mt-6 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <p className="text-sm italic text-ink-muted">{t("englishNote")}</p>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        {featured && (
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(16,31,56,0.18)] md:flex-row"
            >
              <div className="relative aspect-[16/10] w-full md:aspect-auto md:w-2/5">
                {featured.cover ? (
                  <Image
                    src={featured.cover}
                    alt={featured.coverAlt ?? featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="object-cover"
                  />
                ) : (
                  <FallbackCover slug={featured.slug} label={featured.title} />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-leaf">
                  {featured.category} · <PostDate date={formatDate(featured.date)} />
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
                  {featured.excerpt}
                </p>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={0.05 + i * 0.05} className="h-full">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(16,31,56,0.18)]"
              >
                <div className="relative aspect-[16/9] w-full">
                  {post.cover ? (
                    <Image
                      src={post.cover}
                      alt={post.coverAlt ?? post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 620px"
                      className="object-cover"
                    />
                  ) : (
                    <FallbackCover slug={post.slug} label={post.title} />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-leaf">
                    {post.category} · <PostDate date={formatDate(post.date)} />
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-snug tracking-tight">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
