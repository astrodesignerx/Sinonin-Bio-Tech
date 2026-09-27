import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Newspaper } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import SectionHeader from "@/components/ui/section-header";
import { CARD_INTERACTIVE } from "@/components/ui/card";
import type { PostMeta } from "@/lib/blog";

/*
  The three newest posts, fetched from Sanity by the home page and passed in,
  so a post published in the Studio shows up here without a code change. An
  earlier version hardcoded the three cards and had to be edited by hand every
  time the blog moved on.
*/
export default function LatestBlog({ posts }: { posts: PostMeta[] }) {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeader
        title={t("blogTitle")}
        action={
          // Arrow, not gap — see the note on the same pattern in founder.tsx.
          <Link
            href="/blog"
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf sm:inline-flex"
          >
            {t("blogCta")}
            <ArrowRight
              size={15}
              weight="bold"
              className="transition-transform motion-press group-hover:translate-x-0.5"
            />
          </Link>
        }
      />

      <div className="reveal-stagger mt-12 grid gap-5 sm:mt-14 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`${CARD_INTERACTIVE} flex h-full flex-col overflow-hidden`}
          >
            <div className="relative aspect-[16/10] w-full">
              {post.cover ? (
                <Image
                  src={post.cover}
                  placeholder={post.coverLqip ? "blur" : "empty"}
                  blurDataURL={post.coverLqip}
                  alt={post.coverAlt ?? post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="img-reveal object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-mist"
                  role="img"
                  aria-label={t("blogFallbackAlt")}
                >
                  <Newspaper size={48} className="text-leaf/50" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-leaf">
                {post.category}
              </p>
              <h3 className="mt-2 line-clamp-3 font-display text-lg font-semibold leading-snug tracking-tight">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
        >
          {t("blogCta")}
          <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
