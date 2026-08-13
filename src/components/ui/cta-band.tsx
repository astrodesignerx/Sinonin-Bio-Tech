import { useTranslations } from "next-intl";
import { CalendarCheck } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";

export default function CtaBand({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const nav = useTranslations("nav");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
      <Reveal>
        <div className="flex flex-col gap-8 rounded-2xl bg-forest p-8 text-paper sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 max-w-xl leading-relaxed text-paper/75">{body}</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-paper px-6 py-3 text-sm font-semibold text-forest transition hover:bg-white active:translate-y-px lg:self-auto"
          >
            <CalendarCheck size={16} weight="bold" />
            {nav("cta")}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
