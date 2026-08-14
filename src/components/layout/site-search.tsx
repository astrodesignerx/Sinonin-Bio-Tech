"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/navigation";

export type SearchDoc = {
  href: string;
  title: string;
  /** Shown as a small label on the right of a result, e.g. "Report". */
  kind: string;
};

/*
  Apple-style header search: the magnifier expands a field across the nav bar,
  the nav itself steps aside, and a panel drops with Quick Links until you type.

  Matching is deliberately plain (case-insensitive substring, prefix matches
  ranked first). The corpus is a few dozen pages, so anything cleverer would be
  weight without benefit, and a fuzzy matcher would surface odd results on a
  site where every title is a real phrase people search for.
*/
export default function SiteSearch({
  docs,
  labels,
  open,
  onClose,
}: {
  docs: SearchDoc[];
  labels: {
    search: string;
    placeholder: string;
    quick: string;
    empty: string;
    close: string;
    /** Pluralised count, e.g. "3 results". */
    results: (count: number) => string;
  };
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs.slice(0, 6);
    return docs
      .map((d) => ({ d, at: d.title.toLowerCase().indexOf(q) }))
      .filter((r) => r.at !== -1)
      .sort((a, b) => a.at - b.at || a.d.title.length - b.d.title.length)
      .slice(0, 8)
      .map((r) => r.d);
  }, [docs, query]);

  const close = () => {
    setQuery("");
    setCursor(0);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      const hit = results[cursor];
      if (hit) {
        e.preventDefault();
        close();
        router.push(hit.href);
      }
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Covers the nav row so the field reads as replacing the bar,
          the way Apple's does, rather than sitting on top of it. */}
          <div className="absolute inset-x-0 top-0 z-20 h-[var(--header-h)] bg-paper/95 backdrop-blur-md">
            <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
              <MagnifyingGlass
                size={18}
                weight="bold"
                aria-hidden="true"
                className="shrink-0 text-ink-muted"
              />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-label={labels.search}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onInputKey}
                placeholder={labels.placeholder}
                className="h-full flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/70"
              />
              <button
                type="button"
                onClick={close}
                aria-label={labels.close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition motion-quick hover:bg-mist hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          </div>

          <div
            id="search-results"
            className="mega-panel absolute inset-x-0 top-full z-20 border-b border-line bg-paper/95"
            data-open="true"
          >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
                {query.trim() ? labels.results(results.length) : labels.quick}
              </p>

              {results.length === 0 ? (
                <p className="mt-4 text-sm text-ink-muted">
                  {labels.empty} “{query.trim()}”
                </p>
              ) : (
                <ul className="mt-4 space-y-1">
                  {results.map((doc, i) => (
                    <li key={doc.href}>
                      <Link
                        href={doc.href}
                        onClick={close}
                        onMouseEnter={() => setCursor(i)}
                        aria-current={i === cursor ? "true" : undefined}
                        className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors motion-press ${
                          i === cursor ? "bg-mist text-ink" : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        <span className="font-medium">{doc.title}</span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted/70">
                          {doc.kind}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
    </>
  );
}
