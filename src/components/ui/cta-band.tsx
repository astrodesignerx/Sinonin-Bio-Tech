import { useTranslations } from "next-intl";
import { CalendarCheck } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";
import Magnetic from "@/components/ui/magnetic";

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
          {/*
            The layout classes live on the wrapper, not the link: `Magnetic`
            renders the element that is actually the flex item here, so leaving
            `shrink-0`/`self-start` on the link inside would apply them to a
            child of the flex container instead of to the item itself.
          */}
          <Magnetic className="shrink-0 self-start lg:self-auto">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-forest transition motion-press hover:bg-white active:translate-y-px"
            >
              <CalendarCheck size={16} weight="bold" />
              {nav("cta")}
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  );
}
