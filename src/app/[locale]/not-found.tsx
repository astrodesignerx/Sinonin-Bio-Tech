import { useTranslations } from "next-intl";
import Magnetic from "@/components/ui/magnetic";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
        404
      </p>
      <h1 className="mt-3 heading-page">
        {t("title")}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-muted">{t("body")}</p>
      <Magnetic className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest active:translate-y-px"
        >
          {t("backHome")}
        </Link>
      </Magnetic>
    </div>
  );
}
