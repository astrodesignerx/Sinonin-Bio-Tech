"use client";

import { useRef, type ReactNode } from "react";

/*
  Drifts its child a few pixels toward the cursor, springing back on leave.

  Guarded to fine pointers: on touch there is no cursor to lean toward, and the
  handlers would only cost work. Reduced-motion users get nothing, since this is
  decoration rather than feedback, and the site already signals hover in other
  ways (colour, shadow, the arrow nudge).
*/
export default function Magnetic({
  children,
  strength = 0.18,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  /*
    The one place that still asks the media queries directly rather than going
    through `usePrefersReducedMotion`, and deliberately so: this is called on
    every pointer move, so it is already re-reading the answer continuously.
    A subscription would buy nothing here except a re-render per preference
    change on an element whose whole job is to not re-render while it moves.

    The pointer-type test has to be live for the same reason — a laptop with a
    touchscreen can switch between fine and coarse input mid-session.
  */
  const allowed = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || !allowed()) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onBlur={reset}
      className={`inline-block transition-transform motion-panel ${className}`}
    >
      {children}
    </span>
  );
}
