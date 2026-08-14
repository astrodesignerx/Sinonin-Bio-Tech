import { useTranslations } from "next-intl";
import { ArrowRight, CalendarCheck } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import BrandRule from "@/components/ui/brand-rule";
import Magnetic from "@/components/ui/magnetic";
import CellsCanvas from "@/components/home/cells-canvas";
import MoleculeCanvas from "@/components/home/molecule-canvas";

/*
  Hero V3. The media card is replaced by the molecule the business is actually
  about: E2D, the compound that tells a predator something is fresh prey, and
  the subject of The Friday Conversation No. 2.

  Two deliberate differences from V2:

  The cells recede to a faint texture. V2's cells were the focal point; here
  they are ground, because a rotating object and a moving background competing
  for the same attention is the same mistake as running V1's glow underneath
  V2's cells.

  There is no card around the molecule. Framing it would make it an
  illustration of the subject; unframed on the page ground it reads as the
  subject itself.
*/
export default function HeroV3() {
  const t = useTranslations("home");

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-16 lg:flex lg:min-h-[calc(100svh-var(--header-h))] lg:items-center lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Ground, not subject: paler fills and a near-invisible membrane. */}
        <div className="opacity-55">
          <CellsCanvas base="#f7faf5" alt="#eef4ec" edge="#cfe0d1" scale={3.2} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper" />
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
                  className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px"
                >
                  <CalendarCheck size={16} weight="bold" />
                  {t("primaryCta")}
                </Link>
              </Magnetic>
              <Link
                href="/expertise"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper/70 px-6 py-3 text-sm font-semibold text-ink backdrop-blur-sm transition motion-press hover:border-ink/40 hover:bg-paper active:translate-y-px"
              >
                {t("secondaryCta")}
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

          <figure className="hero-media lg:col-span-6">
            <div className="relative h-72 w-full sm:h-96 lg:h-[clamp(24rem,calc(100svh-22rem),34rem)]">
              <MoleculeCanvas label={t("heroMoleculeAlt")} />
            </div>
            {/*
              Named rather than left as decoration. A visitor who recognises
              E2D is exactly the visitor worth reaching, and one who does not
              gets told what they are looking at.
            */}
            <figcaption className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              {t("heroMoleculeCaption")}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
