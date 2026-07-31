"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-line bg-white/70 p-1 font-mono text-[11px] font-medium uppercase tracking-wider"
      aria-label={t("label")}
    >
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          aria-current={l === locale ? "true" : undefined}
          className={
            l === locale
              ? "rounded-full bg-ink px-3 py-2 text-paper"
              : "rounded-full px-3 py-2 text-ink-muted transition hover:text-ink"
          }
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
