/*
  The motion scale, for the code that has to reason about it.

  Most motion on this site is declared in CSS and never needs this. A few
  behaviours have to *know* a duration rather than just apply one: the hero
  hands over to the next clip a dissolve-length before the current one runs
  out, and the footer's elastic edge drives its own spring back frame by frame.

  Those values are read from the CSS custom properties rather than copied here
  as numbers. A duplicated constant is the specific failure this module exists
  to prevent — the hero dissolve was already `FADE_MS = 1000` in TypeScript and
  `duration-1000` in a className, two clocks for one effect, and the race
  between them needed a workaround. Reading the token means the scale in
  `globals.css` stays the only place a duration is decided, and changing it
  there moves the behaviour with the animation.

  The fallbacks are what these were before the scale existed. They only apply
  if the stylesheet has not loaded, which for a duration means the animation is
  not running yet either.
*/

export type DurationToken =
  | "press"
  | "quick"
  | "panel"
  | "slow"
  | "large"
  | "epic";

const cache = new Map<string, number>();

/**
 * Milliseconds held in `--duration-<token>`, or `fallback` off the client.
 *
 * Call from an effect, not from render: it reads computed style, and a value
 * that differs between server and client would be a hydration mismatch.
 */
export function durationMs(token: DurationToken, fallback: number): number {
  if (typeof document === "undefined") return fallback;

  const key = `--duration-${token}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(key)
    .trim();

  // CSS time values are either `250ms` or `0.25s`; both are legal here.
  const n = parseFloat(raw);
  const ms = !Number.isFinite(n)
    ? fallback
    : raw.endsWith("ms")
      ? n
      : raw.endsWith("s")
        ? n * 1000
        : fallback;

  cache.set(key, ms);
  return ms;
}

/*
  Period of the hero's slow zoom, in seconds.

  Not a duration from the scale: it is an ambient loop, tuned to be long enough
  that no one catches it repeating. It lives here because the clip loop has to
  start each new video layer at the same point in the drift that the outgoing
  one had reached, which means knowing the period. Setting it on the element as
  a custom property is what keeps the CSS animation and that calculation on the
  same number.
*/
export const HERO_BREATHE_S = 24;
