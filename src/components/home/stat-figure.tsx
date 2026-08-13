"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// Layout effect on the client, plain effect during SSR (where it is a no-op
// and React would otherwise warn).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/*
  A single statistic: the rule above it draws in, then the figure counts up.

  The figures are authored as display strings ("9 bn", "~2x", "1.3 bn t", and in
  German "1,3 Mrd. t"), so the numeric part is extracted, animated, and put back
  between its original prefix and suffix. That keeps the copy in the message
  files where translators can reach it, instead of splitting every stat into
  three fields.

  `parsed` is memoised deliberately. It used to be recomputed each render, which
  gave the effects a new dependency identity on every frame of the animation:
  each `setDisplay` re-ran them, the cleanup cancelled the pending frame, and
  the layout effect re-zeroed the figure. The counter sat at zero forever.
*/

const NUMERIC = /^([^\d]*)([\d]+(?:[.,][\d]+)?)(.*)$/;

function parse(value: string) {
  const m = value.match(NUMERIC);
  if (!m) return null;
  const [, prefix, digits, suffix] = m;
  // German uses a decimal comma; keep whichever separator the copy used.
  const separator = digits.includes(",") ? "," : ".";
  const target = Number(digits.replace(",", "."));
  const decimals = digits.split(/[.,]/)[1]?.length ?? 0;
  if (!Number.isFinite(target)) return null;
  return { prefix, suffix, target, decimals, separator };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function StatFigure({
  value,
  label,
  tone = "dark",
}: {
  value: string;
  label: string;
  tone?: "dark" | "light";
}) {
  const parsed = useMemo(() => parse(value), [value]);
  const ref = useRef<HTMLDivElement>(null);
  const zeroed = useRef(false);
  const [shown, setShown] = useState(false);
  // The real figure renders on the server: it is the content, and it belongs in
  // the HTML for crawlers and anyone without JavaScript. It is zeroed on the
  // client before first paint, and only when the animation will actually run.
  const [display, setDisplay] = useState(value);

  useIsomorphicLayoutEffect(() => {
    if (zeroed.current || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    zeroed.current = true;
    setDisplay(`${parsed.prefix}${(0).toFixed(parsed.decimals)}${parsed.suffix}`);
  }, [parsed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let timer = 0;

    const animate = () => {
      if (!parsed || reduced) {
        setDisplay(value);
        return;
      }
      const DURATION = 1100;
      let startedAt: number | null = null;
      const step = (now: number) => {
        startedAt ??= now;
        const t = Math.min(1, (now - startedAt) / DURATION);
        const n = easeOut(t) * parsed.target;
        setDisplay(
          `${parsed.prefix}${n
            .toFixed(parsed.decimals)
            .replace(".", parsed.separator)}${parsed.suffix}`,
        );
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        setShown(true);
        // Let the rule finish drawing before the figure starts moving.
        timer = window.setTimeout(animate, 220);
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [parsed, value]);

  const dark = tone === "dark";

  return (
    <div ref={ref}>
      {/* Rule draws left to right, leading the figure. */}
      <span
        className={`block h-[2px] w-full origin-left overflow-hidden rounded-full transition-transform duration-500 ease-out-soft ${
          dark ? "bg-white/25" : "bg-ink/15"
        } ${shown ? "scale-x-100" : "scale-x-0"}`}
      />
      <p
        className={`mt-5 font-display text-6xl font-semibold tracking-tight tabular-nums lg:text-7xl ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {display}
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          dark ? "text-paper/70" : "text-ink-muted"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
