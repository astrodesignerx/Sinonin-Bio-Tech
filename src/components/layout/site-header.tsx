"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CalendarCheck, List, X } from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "./locale-switcher";

const NAV_ITEMS = [
  { key: "expertise", href: "/expertise" },
  { key: "training", href: "/training" },
  { key: "reports", href: "/reports" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export default function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/logo.png"
            alt="Sinonin Biotech"
            width={34}
            height={34}
            priority
            className="h-[34px] w-auto"
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            Sinonin Biotech
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 xl:flex"
          aria-label={t("ariaLabel")}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={
                isActive(item.href)
                  ? "text-sm font-semibold text-ink"
                  : "text-sm text-ink-muted transition hover:text-ink"
              }
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <LocaleSwitcher />
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest active:translate-y-px"
          >
            <CalendarCheck size={15} weight="bold" />
            {t("cta")}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full p-2 text-ink xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={t("toggleMenu")}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper xl:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
            aria-label={t("ariaLabel")}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={
                  isActive(item.href)
                    ? "rounded-lg bg-mist px-3 py-3 text-base font-semibold text-ink"
                    : "rounded-lg px-3 py-3 text-base text-ink-muted transition hover:bg-mist hover:text-ink"
                }
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-4">
              <LocaleSwitcher />
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest active:translate-y-px"
              >
                <CalendarCheck size={15} weight="bold" />
                {t("cta")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
