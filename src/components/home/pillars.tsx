import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Bug, Flask, Plant } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";

const CELL_LINK =
  "group flex flex-col rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(16,31,56,0.18)]";

function CellCta({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
          {t("pillarsEyebrow")}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("pillarsTitle")}
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-6">
        <div className="lg:col-span-4">
          <Link href="/expertise#proteins" className={`${CELL_LINK} h-full p-7 sm:p-8`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-leaf">
              <Plant size={20} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">
              {t("pillars.proteins.title")}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
              {t("pillars.proteins.body")}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {(t.raw("pillars.proteins.sources") as string[]).map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted"
                >
                  {s}
                </li>
              ))}
            </ul>
            <span className="mt-auto pt-6">
              <CellCta label={t("pillarsCta")} />
            </span>
          </Link>
        </div>

        <div className="lg:col-span-2">
          <Link href="/expertise#palatants" className={`${CELL_LINK} h-full overflow-hidden`}>
            <div className="relative h-36 w-full">
              <Image
                src="/images/bowls.webp"
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
                <CellCta label={t("pillarsCta")} />
              </span>
            </div>
            <div className="relative min-h-40 sm:w-2/5">
              <Image
                src="/images/insect-powder.webp"
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
