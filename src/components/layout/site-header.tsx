"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarCheck,
  CaretDown,
  List,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import SiteSearch, { type SearchDoc } from "./site-search";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "expertise", href: "/expertise" },
  { key: "training", href: "/training" },
  { key: "reports", href: "/reports" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

/** The four expertise fields, in the order the page presents them. */
const EXPERTISE_FIELDS = [
  { key: "proteins", image: "/images/expertise/proteins.webp" },
  { key: "palatants", image: "/images/expertise/palatants.webp" },
  { key: "enzymes", image: "/images/expertise/enzymes.webp" },
  { key: "insects", image: "/images/expertise/insects.webp" },
] as const;

/**
 * One cell of a mega panel: cover image, title, and an optional meta line.
 * Reports show the title alone; blog posts add date, read length and author.
 */
export type MegaItem = {
  href: string;
  title: string;
  image?: string;
  meta?: string;
};

/** Which nav item owns the open panel, or null when nothing is open. */
type MegaKey = "expertise" | "reports" | "blog" | null;

export default function SiteHeader({
  posts = [],
  reportItems = [],
  searchDocs = [],
}: {
  posts?: MegaItem[];
  /* Built on the server: the cover images come from Sanity, which a client
     component cannot fetch. */
  reportItems?: MegaItem[];
  searchDocs?: SearchDoc[];
}) {
  const t = useTranslations("nav");
  const fields = useTranslations("expertisePage.sections");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState<MegaKey>(null);
  const [searching, setSearching] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  const expertiseItems: MegaItem[] = EXPERTISE_FIELDS.map((f) => ({
    href: `/expertise#${f.key}`,
    title: fields(`${f.key}.title`),
    image: f.image,
  }));

  const MENUS: Record<Exclude<MegaKey, null>, MegaItem[]> = {
    expertise: expertiseItems,
    reports: reportItems,
    blog: posts.slice(0, 4),
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd+K on macOS, Ctrl+K elsewhere. Browsers bind Ctrl+K to the address
      // bar, so the default has to be prevented for the shortcut to land.
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(false);
        setMega(null);
        setSearching(true);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setMega(null);
        setSearching(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close the panel once focus leaves it entirely, so keyboard users tabbing
  // past the last card don't leave it hanging open.
  const handleMegaBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!megaRef.current?.contains(e.relatedTarget as Node | null)) setMega(null);
  };

  // Menus are dismissed from the links themselves (see `closeMenus` below)
  // rather than from a pathname effect, which would cause a cascading render.
  const closeMenus = () => {
    setOpen(false);
    setMega(null);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <header
      className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md"
      onMouseLeave={() => setMega(null)}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
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
          aria-hidden={searching ? true : undefined}
          className={`hidden items-center gap-7 transition-opacity motion-quick xl:flex ${searching ? "pointer-events-none opacity-0" : "opacity-100"}`}
          aria-label={t("ariaLabel")}
        >
          {NAV_ITEMS.map((item) => {
            const hasMenu =
              (item.key === "expertise" || item.key === "reports" || item.key === "blog") &&
              MENUS[item.key].length > 0;
            const base = isActive(item.href)
              ? "text-sm font-semibold text-ink"
              : "text-sm text-ink-muted transition hover:text-ink";

            /*
              The link still navigates to its index page; hover and keyboard
              focus open the panel alongside it, so the item keeps working for
              people who just want the overview.
            */
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                aria-expanded={hasMenu ? mega === item.key : undefined}
                aria-controls={hasMenu ? "site-mega" : undefined}
                onMouseEnter={() =>
                  setMega(hasMenu ? (item.key as MegaKey) : null)
                }
                onFocus={() => setMega(hasMenu ? (item.key as MegaKey) : null)}
                onClick={closeMenus}
                className={hasMenu ? `inline-flex items-center gap-1 ${base}` : base}
              >
                {t(item.key)}
                {hasMenu && (
                  <CaretDown
                    size={12}
                    weight="bold"
                    aria-hidden="true"
                    className={`transition motion-quick ${
                      mega === item.key ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <button
            type="button"
            onClick={() => setSearching(true)}
            aria-label={t("search")}
            aria-expanded={searching}
            aria-keyshortcuts="Meta+K Control+K"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition motion-quick hover:bg-mist hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
          >
            <MagnifyingGlass size={18} weight="bold" />
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px"
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

      {/* Mounted once, shared by the desktop trigger, the mobile menu row and
          the Cmd/Ctrl+K shortcut. */}
      <SiteSearch
        docs={searchDocs}
        open={searching}
        onClose={() => setSearching(false)}
        labels={{
          search: t("search"),
          placeholder: t("searchPlaceholder"),
          quick: t("searchQuick"),
          empty: t("searchEmpty"),
          close: t("searchClose"),
          results: (count: number) => t("searchResults", { count }),
        }}
      />

      {/*
        Full-bleed mega panel. Kept mounted and toggled with opacity/visibility
        rather than conditionally rendered, so the open and close both animate on
        composited properties. `invisible` (not just opacity-0) keeps the links
        out of the tab order while closed.
      */}
      <div
        id="site-mega"
        ref={megaRef}
        onMouseEnter={() => mega && setMega(mega)}
        onBlur={handleMegaBlur}
        data-open={mega ? "true" : "false"}
        className="mega-panel absolute inset-x-0 top-full hidden border-b border-line bg-paper/95 xl:block"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Keyed on the open menu so switching Reports <-> Blog remounts the
              cells and replays the stagger instead of hard-swapping content. */}
          <ul key={mega ?? "idle"} className="grid grid-cols-4 gap-5">
            {(mega ? MENUS[mega] : reportItems).map((entry) => (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  tabIndex={mega ? undefined : -1}
                  onClick={closeMenus}
                  className="mega-card group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-mist">
                    {entry.image && (
                      <Image
                        src={entry.image}
                        alt=""
                        fill
                        sizes="300px"
                        className="object-cover transition motion-panel group-hover:scale-[1.04]"
                      />
                    )}
                  </span>
                  <span className="mt-3 flex items-start gap-1.5 font-display text-base font-semibold leading-snug tracking-tight text-ink">
                    <span className="line-clamp-2">{entry.title}</span>
                    <ArrowRight
                      size={14}
                      weight="bold"
                      className="mt-1 shrink-0 text-leaf transition motion-quick group-hover:translate-x-0.5"
                    />
                  </span>
                  {entry.meta && (
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                      {entry.meta}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-paper xl:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
            aria-label={t("ariaLabel")}
          >
            {/* Search leads the mobile menu: a hover mega-panel has no touch
                equivalent, so this is the way in on a phone. */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSearching(true);
              }}
              className="mb-2 flex items-center gap-3 rounded-lg border border-line px-3 py-3 text-base text-ink-muted transition motion-press hover:border-ink/30 hover:text-ink"
            >
              <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
              {t("search")}
            </button>

            {NAV_ITEMS.map((item) => {
              const sub =
                item.key === "expertise" || item.key === "reports" || item.key === "blog"
                  ? MENUS[item.key]
                  : [];
              return (
                <div key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block ${
                      isActive(item.href)
                        ? "rounded-lg bg-mist px-3 py-3 text-base font-semibold text-ink"
                        : "rounded-lg px-3 py-3 text-base text-ink-muted transition hover:bg-mist hover:text-ink"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                  {/* Same destinations as the desktop panel, as a plain
                      indented list: a hover mega menu has no touch equivalent. */}
                  {sub.length > 0 && (
                    <ul className="mb-1 ml-3 border-l border-line pl-3">
                      {sub.map((entry) => (
                        <li key={entry.href}>
                          <Link
                            href={entry.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm text-ink-muted transition motion-press hover:text-ink"
                          >
                            {entry.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            <div className="mt-3 border-t border-line pt-4">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px"
              >
                <CalendarCheck size={15} weight="bold" />
                {t("cta")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>

    {/*
      Sibling of <header>, not a child, so `fixed` resolves against the viewport.
      Starts below the 4rem header so the bar itself stays sharp. Click or hover
      dismisses, which also covers touch devices that fire a hover first.
    */}
    <div
      aria-hidden="true"
      data-open={mega || searching ? "true" : "false"}
      onMouseEnter={() => setMega(null)}
      onClick={() => setMega(null)}
      className={`mega-backdrop fixed inset-x-0 bottom-0 top-[var(--header-h)] z-30 ${
        searching ? "block" : "hidden xl:block"
      }`}
    />
    </>
  );
}
