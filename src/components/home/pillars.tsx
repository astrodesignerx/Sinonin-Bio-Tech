import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Bug, Flask, Plant } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import SectionHeader from "@/components/ui/section-header";
import { CARD_INTERACTIVE_SURFACE } from "@/components/ui/card";
import MoleculeCanvas from "@/components/home/molecule-canvas";

/*
  No background or border colour here, each cell sets its own. Tailwind emits
  utilities of equal specificity, so a `bg-forest` appended after a shared
  `bg-white` does not reliably win; keeping the surface out of the shared string
  is what makes the mist and forest cells actually render.
*/
const CELL_LINK = `${CARD_INTERACTIVE_SURFACE} flex flex-col`;

const CELL_LIGHT = "border-line bg-white";

function CellCta({ label, tone = "light" }: { label: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${
        tone === "dark" ? "text-leaf-on-dark" : "text-leaf"
      }`}
    >
      {label}
      <ArrowRight
        size={15}
        weight="bold"
        className="transition group-hover:translate-x-0.5"
      />
    </span>
  );
}

export default function Pillars() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <SectionHeader
        eyebrow={t("pillarsEyebrow")}
        title={t("pillarsTitle")}
        intro={t("pillarsIntro")}
      />

      <div className="reveal-stagger mt-12 grid gap-5 sm:mt-14 lg:grid-cols-6">
        <div className="lg:col-span-4">
          <Link
            href="/expertise#proteins"
            data-molecule-host
            className={`${CELL_LINK} ${CELL_LIGHT} relative h-full overflow-hidden p-7 sm:p-8`}
          >
            {/*
              E2D, running down the diagonal toward the bottom right. It is the
              aroma compound that signals fresh prey to a predator, so it
              belongs against Proteins rather than in the fold: there it was
              the subject, here it is evidence sitting behind the claim.

              Drawn whole and at full strength, above the rest of the card
              rather than washed out behind it. It can sit on top because it
              was measured against the text and clears every glyph: nothing is
              obscured, so there is no reason to fade it.

              Sized and centred to sit wholly inside the card. Tilting a long
              chain costs height: at 32 degrees the molecule needs far more
              vertical room than its own thickness, so it is the card's height,
              not its width, that limits how big this can be.

              Still `pointer-events-none`. The card is a link, and a molecule
              that swallowed clicks in its own corner would be a trap; the
              pointer tracking works off cursor position instead, so hover and
              navigation behave exactly as they did before it was here.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 z-10 hidden h-56 w-[22rem] -translate-y-1/2 rotate-[32deg] sm:block"
            >
              <MoleculeCanvas speed={0.35} interactive />
            </div>

            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-mist text-leaf">
              <Plant size={20} />
            </span>
            <h3 className="relative mt-5 font-display text-2xl font-semibold tracking-tight">
              {t("pillars.proteins.title")}
            </h3>
            <p className="relative mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              {t("pillars.proteins.body")}
            </p>
            <ul className="relative mt-5 flex flex-wrap gap-2">
              {(t.raw("pillars.proteins.sources") as string[]).map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-line bg-white/70 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted backdrop-blur-[2px]"
                >
                  {s}
                </li>
              ))}
            </ul>
            <span className="relative mt-auto pt-6">
              <CellCta label={t("pillarsCta")} />
            </span>
          </Link>
        </div>

        <div className="lg:col-span-2">
          <Link
            href="/expertise#palatants"
            className={`${CELL_LINK} ${CELL_LIGHT} h-full overflow-hidden`}
          >
            <div className="relative h-36 w-full">
              <Image
                src="/images/expertise/palatants.webp"
                alt={t("pillars.palatants.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {t("pillars.palatants.title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t("pillars.palatants.body")}
              </p>
              <span className="mt-auto pt-6">
                <CellCta label={t("pillarsCta")} />
              </span>
            </div>
          </Link>
        </div>

        <div className="lg:col-span-2">
          <Link
            href="/expertise#enzymes"
            className={`${CELL_LINK} h-full border-transparent bg-mist p-6`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-leaf">
              <Flask size={20} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">
              {t("pillars.enzymes.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t("pillars.enzymes.body")}
            </p>
            <span className="mt-auto pt-6">
              <CellCta label={t("pillarsCta")} />
            </span>
          </Link>
        </div>

        <div className="lg:col-span-4">
          <Link
            href="/expertise#insects"
            className={`${CELL_LINK} h-full overflow-hidden border-transparent bg-forest sm:flex-row`}
          >
            <div className="flex flex-1 flex-col p-7 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-paper">
                <Bug size={20} />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-paper">
                {t("pillars.insects.title")}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/75">
                {t("pillars.insects.body")}
              </p>
              <span className="mt-auto pt-6">
                <CellCta label={t("pillarsCta")} tone="dark" />
              </span>
            </div>
            <div className="relative min-h-40 sm:w-2/5">
              <Image
                src="/images/expertise/insects-closeup.webp"
                alt={t("pillars.insects.imageAlt")}
                fill
                sizes="(max-width: 640px) 100vw, 500px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
