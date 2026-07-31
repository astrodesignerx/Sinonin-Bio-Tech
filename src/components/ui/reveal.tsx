import type { ReactNode } from "react";

/**
 * CSS-only scroll reveal. Applies the `.reveal` class defined in globals.css.
 * No JavaScript: content is visible by default and only animates in browsers
 * that support scroll-driven animations with motion enabled.
 *
 * `delay` is accepted for API stability with previous JS-based versions and is
 * currently ignored — scroll-driven animations can't stagger cleanly.
 */
export default function Reveal({
  children,
  className = "",
  delay: _delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}