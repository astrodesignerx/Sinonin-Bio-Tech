import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import SectionHeader from "@/components/ui/section-header";
import { CARD_INTERACTIVE } from "@/components/ui/card";
import { BLUR } from "@/lib/blur-data";

const POSTS = [
  {
    key: "palatability",
    slug: "petfood-palatability-alternative-proteins",
    image: "/images/blog-palatability.webp",
    coverAlt: "Two side-by-side bowls of petfood for dogs and cats",
  },
  {
    key: "fifa",
    slug: "fifa-world-cup-lessons-alt-prot",
    image: "/images/blog/fifa-world-cup-lessons.webp",
    coverAlt:
      "Football match under floodlights at Priestfield Stadium, players in blue and red kits on the pitch, a stand full of spectators in the background.",
  },
  {
    key: "interzoo",
    slug: "interzoo-2026-learnings",
    image: "/images/blog/interzoo-2026.webp",
    coverAlt: "Visitors entering Interzoo 2026 at the entrance in Nuremberg",
  },
] as const;

export default function LatestBlog() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeader
        title={t("blogTitle")}
        action={
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf transition hover:gap-2.5 sm:inline-flex"
          >
            {t("blogCta")}
            <ArrowRight size={15} weight="bold" />
          </Link>
        }
      />

      <div className="reveal-stagger mt-12 grid gap-5 sm:mt-14 md:grid-cols-3">
        {POSTS.map((post) => (
          <Link
            key={post.key}
            href={`/blog/${post.slug}`}
            className={`${CARD_INTERACTIVE} flex h-full flex-col overflow-hidden`}
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={post.image}
                  placeholder={BLUR[post.image] ? "blur" : "empty"}
                  blurDataURL={BLUR[post.image]}
                alt={post.coverAlt}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="img-reveal object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-leaf">
                {t(`blogPosts.${post.key}.category`)}
              </p>
              <h3 className="mt-2 line-clamp-3 font-display text-lg font-semibold leading-snug tracking-tight">
                {t(`blogPosts.${post.key}.title`)}
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