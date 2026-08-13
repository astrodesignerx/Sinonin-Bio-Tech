import type { CSSProperties, ReactNode } from "react";

/**
 * CSS-only scroll reveal. Applies the `.reveal` class defined in globals.css.
 * No JavaScript: content is visible by default and only animates in browsers
 * that support scroll-driven animations with motion enabled.
 *
 * `order` places this element later in the sequence when several reveal
 * together, 0 leads, 1 follows, and so on. Scroll-driven animations ignore
 * `animation-delay`, so the offset is applied to the scroll range instead;
 * see the `--reveal-order` rules in globals.css.
 *
 * For a grid whose children should cascade, put `reveal-stagger` on the
 * container instead of wrapping each child, the ordering is handled in CSS.
 */
export default function Reveal({
  children,
  className = "",
  order = 0,
}: {
  children: ReactNode;
  className?: string;
  order?: number;
}) {
  return (
    <div
      className={`reveal ${className}`}
      style={
        order ? ({ "--reveal-order": order } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
