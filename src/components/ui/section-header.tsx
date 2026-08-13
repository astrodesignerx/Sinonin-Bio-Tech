import type { ReactNode } from "react";
import Reveal from "@/components/ui/reveal";
import BrandRule from "@/components/ui/brand-rule";

/**
 * Two-column section header: heading on the left, supporting intro on the
 * right, bottom-aligned. A single left-aligned column leaves the right half of
 * the 7xl container empty on desktop; the split gives that space something to
 * hold without inventing new copy.
 *
 * `action` takes the intro's place for sections that link onward rather than
 * explain themselves. `tone="dark"` recolours for `forest` surfaces.
 */
export default function SectionHeader({
  eyebrow,
  title,
  intro,
  action,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <Reveal>
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <BrandRule />
          {eyebrow && (
            <p
              className={`eyebrow-shimmer mt-6 font-mono text-[11px] uppercase tracking-[0.22em] ${
                dark ? "eyebrow-shimmer-dark text-leaf-on-dark" : "text-leaf"
              }`}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={`heading-section ${eyebrow ? "mt-3" : "mt-6"} ${
              dark ? "text-paper" : ""
            }`}
          >
            {title}
          </h2>
        </div>

        {intro ? (
          <p
            className={`leading-relaxed lg:col-span-5 lg:col-start-8 ${
              dark ? "text-paper/70" : "text-ink-muted"
            }`}
          >
            {intro}
          </p>
        ) : (
          action && (
            <div className="lg:col-span-5 lg:col-start-8 lg:flex lg:justify-end">
              {action}
            </div>
          )
        )}
      </div>
    </Reveal>
  );
}
