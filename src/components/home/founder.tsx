import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";

export default function Founder() {
  const t = useTranslations("home");
  const credentials = t.raw("founderCredentials") as string[];

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <h2 className="max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("founderTitle")}
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-muted">
            {t("founderBody")}
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {credentials.map((c) => (
              <li
                key={c}
                className="rounded-full bg-mist px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink"
              >
                {c}
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf transition hover:gap-2.5"
          >
            {t("founderCta")}
            <ArrowRight size={15} weight="bold" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
