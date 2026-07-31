import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";

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
      "Football match under floodlights at Priestfield Stadium — players in blue and red kits on the pitch, a stand full of spectators in the background.",
  },
  {
    key: "interzoo",
    slug: "interzoo-2026-learnings",
    image: "/images/blog-interzoo.webp",
    coverAlt: "Visitors entering Interzoo 2026 at the entrance in Nuremberg",
  },
] as const;

export default function LatestBlog() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("blogTitle")}
          </h2>
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf transition hover:gap-2.5 sm:inline-flex"
          >
            {t("blogCta")}
            <ArrowRight size={15} weight="bold" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {POSTS.map((post) => (
          <Link
            key={post.key}
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(16,31,56,0.18)]"
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={post.image}
                alt={post.coverAlt}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
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