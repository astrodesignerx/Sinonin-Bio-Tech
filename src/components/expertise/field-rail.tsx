"use client";

import { useEffect, useState } from "react";

/*
  Sticky progress rail for the Expertise page.

  The active field is derived from which section is closest to a reading line a
  third of the way down the viewport, rather than from raw intersection ratios:
  the four sections differ a lot in height, and ratio-based spies flip to the
  short section too early.
*/
export default function FieldRail({
  label,
  items,
}: {
  label: string;
  items: { key: string; number: string; title: string }[];
}) {
  const [active, setActive] = useState(items[0]?.key ?? "");

  useEffect(() => {
    const pick = () => {
      const line = window.innerHeight / 3;
      let best = items[0]?.key ?? "";
      let bestDist = Infinity;
      for (const item of items) {
        const el = document.getElementById(item.key);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        const dist = Math.abs(top - line);
        // Prefer sections at or above the reading line.
        if (top <= line + 8 && dist < bestDist) {
          bestDist = dist;
          best = item.key;
        }
      }
      setActive(best);
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [items]);

  return (
    <nav aria-label={label} className="lg:sticky lg:top-28">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
        {label}
      </p>
      <ul className="mt-5 space-y-1">
        {items.map((item) => {
          const on = active === item.key;
          return (
            <li key={item.key}>
              <a
                href={`#${item.key}`}
                aria-current={on ? "true" : undefined}
                className="group flex items-center gap-3 rounded-lg py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
              >
                {/* The rule fills with the brand gradient for the active field:
                    the indicator encodes position, it isn't decoration. */}
                <span className="relative h-[2px] w-8 shrink-0 overflow-hidden rounded-full bg-line">
                  <span
                    className={`absolute inset-0 origin-left brand-gradient transition-transform motion-panel ${
                      on ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </span>
                <span
                  className={`font-mono text-[11px] tracking-[0.14em] transition-colors motion-quick ${
                    on ? "text-ink-muted" : "text-ink-muted/60"
                  }`}
                >
                  {item.number}
                </span>
                <span
                  className={`text-sm transition-colors motion-quick ${
                    on
                      ? "font-semibold text-ink"
                      : "text-ink-muted group-hover:text-ink"
                  }`}
                >
                  {item.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
