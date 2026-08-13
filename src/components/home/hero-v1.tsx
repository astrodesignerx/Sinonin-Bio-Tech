import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarCheck } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import BrandRule from "@/components/ui/brand-rule";
import Magnetic from "@/components/ui/magnetic";
import { HERO_VIDEO } from "@/lib/config";

/*
  Hero V1 (shipped). Split layout: copy left, media right with a right-edge
  bleed, entrance choreography, slow breathe, leaf glow behind the type.

  Preserved verbatim so V2 can be built alongside and compared. Switch between
  them with HERO_VERSION in lib/config.
*/
export default function HeroV1() {
  const t = useTranslations("home");

  // On lg+ the hero occupies the fold exactly: 100svh minus the sticky
  // header, with the content centred inside it. That stops the next section
  // peeking above the fold, which made the page read as having a gap rather
  // than a first screen. Below lg the hero is stacked and naturally tall, so
  // no minimum is imposed.
  return (
    <section className="relative overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-16 lg:flex lg:min-h-[calc(100svh-var(--header-h))] lg:items-center lg:py-12">
      {/*
        Depth behind the type: a soft leaf-tinted glow on its own slow cycle.
        Purely atmospheric, so it is hidden from assistive tech and sits under
        everything. `blur-3xl` keeps it a wash rather than a visible shape.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="hero-glow absolute -left-32 -top-40 h-[38rem] w-[38rem] rounded-full bg-leaf/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <BrandRule className="hero-rule-in" />
            <p
              style={{ "--hero-step": 1 } as React.CSSProperties}
              className="hero-step mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-leaf"
            >
              {t("eyebrow")}
            </p>
            <h1
              style={{ "--hero-step": 2 } as React.CSSProperties}
              className="hero-step heading-page mt-4"
            >
              {t("title")}
            </h1>
            <p
              style={{ "--hero-step": 3 } as React.CSSProperties}
              className="hero-step mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
            >
              {t("subtitle")}
            </p>
            <div
              style={{ "--hero-step": 4 } as React.CSSProperties}
              className="hero-step mt-8 flex flex-wrap items-center gap-4"
            >
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest active:translate-y-px"
                >
                  <CalendarCheck size={16} weight="bold" />
                  {t("primaryCta")}
                </Link>
              </Magnetic>
              <Link
                href="/expertise"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink/40 active:translate-y-px"
              >
                {t("secondaryCta")}
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

          {/*
            Right-edge bleed. The negative margin is the exact gap between the
            container's content edge and the viewport edge, so on lg+ the image
            runs off the right of the screen and the hero breaks the container
            line that every other section shares. The section's `overflow-hidden`
            absorbs the overhang, so no horizontal scrollbar appears.
          */}
          <figure className="lg:col-span-6 lg:mr-[calc(-1*((100vw-min(100vw,80rem))/2+2rem))]">
            {/* Scales with the fold rather than sitting at a fixed height, so
                tall screens don't leave a band of empty paper under it. */}
            <div className="hero-media relative h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-[clamp(26rem,calc(100svh-18rem),40rem)] lg:rounded-r-none">
              {HERO_VIDEO ? (
                /*
                  The poster is a frame of this same video, so the fold paints
                  immediately and Largest Contentful Paint never waits on the
                  file. Muted + playsInline are what allow autoplay at all on
                  mobile Safari.
                */
                <video
                  className="hero-breathe absolute inset-0 h-full w-full object-cover"
                  poster={HERO_VIDEO.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={t("heroVideoAlt")}
                >
                  <source src={HERO_VIDEO.webm} type="video/webm" />
                  <source src={HERO_VIDEO.mp4} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src="/images/hero-pulses.webp"
                  alt={t("heroImageAlt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="hero-breathe object-cover"
                />
              )}
              <figcaption className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-paper/85 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink backdrop-blur-sm">
                {t(HERO_VIDEO ? "heroVideoCaption" : "heroCaption")}
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
