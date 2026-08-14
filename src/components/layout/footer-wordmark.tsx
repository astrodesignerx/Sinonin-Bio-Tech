"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/*
  The closing wordmark, and the elastic bottom edge that reveals it.

  At rest the page ends part-way down the letterforms. Keep scrolling once
  there is nothing left to scroll and the edge gives: the footer grows, the
  rest of the word comes up out of the fold, and letting go springs it back.

  Two things make that work, and both are the reason this is script rather
  than CSS.

  The first is that growing the footer alone reveals nothing. Adding height to
  the last element on a page extends it downward, below the viewport, while the
  reader stays exactly where they were; the new space is off-screen. So every
  change in height is matched by pinning the view to the document's new bottom.
  Growth plus pin is what reads as the edge stretching rather than the page
  simply getting longer.

  The second is resistance. A linear response to the wheel would fly open on
  one flick. The pull approaches its limit exponentially, so it moves freely at
  first and stiffens as it runs out, which is what makes it feel like a
  material rather than a slider.

  Guarded to fine pointers. Touch platforms have their own overscroll bounce
  and taking over their scrolling to imitate it would be worse than leaving it
  alone. Reduced-motion users keep the static crop.
*/

/** How far past the crop the pull can reach: the whole hidden quarter. */
const HIDDEN_EM = 0.32;
/** Wheel travel that gets roughly two thirds of the way open. */
const RESISTANCE = 1.6;
/*
  Quiet time after the last wheel event before it springs back. Not a duration
  from the motion scale: it is how long to wait before deciding the reader has
  stopped pulling, which is a property of trackpads rather than of the site.
*/
const RELEASE_MS = 140;
/** Fallback for the spring back; the real length is `--duration-large`. */
const RETURN_FALLBACK_MS = 700;
/** Fallback for the wordmark dimming; the real length is `--duration-epic`. */
const DIM_FALLBACK_MS = 1000;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/*
  Read one duration off the motion scale, in milliseconds.

  The unit has to be checked rather than assumed. The scale is written in `ms`,
  but the CSS is minified on the way out and `700ms` ships as `.7s`, so a plain
  `parseFloat` gets 0.7 and the spring finishes before it starts.
*/
const cssMs = (name: string, fallback: number) => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  if (raw.endsWith("ms")) return n;
  return raw.endsWith("s") ? n * 1000 : fallback;
};

export default function FooterWordmark() {
  const reduced = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const boxEl = box.current;
    const wordEl = word.current;
    if (!boxEl || !wordEl) return;


    /*
      Arrival. Held back until the footer is actually on screen, then released
      once and never again.

      The start state is set here rather than in CSS so the word can never be
      left invisible if this never runs: markup ships it visible, and script
      hides it only at the moment it also commits to bringing it back. And only
      when it is below the fold, since a page short enough to show the footer
      immediately has nothing to arrive from.
    */
    let disposeEnter = () => {};
    if (!reduced) {
      if (boxEl.getBoundingClientRect().top > window.innerHeight) {
        boxEl.style.opacity = "0";
      }
      const enterIO = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          boxEl.style.removeProperty("opacity");
          boxEl.classList.add("wordmark-enter");
          enterIO.disconnect();
        },
        { threshold: 0.15 },
      );
      enterIO.observe(boxEl);
      disposeEnter = () => enterIO.disconnect();
    }

    /*
      The elastic edge below is for fine pointers only: touch platforms have
      their own overscroll bounce, and taking over their scrolling to imitate
      it would be worse than leaving it alone. The arrival above still runs
      there, which is why it is set up first.
    */
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return disposeEnter;
    }

    /*
      Marks the footer as actually having an elastic edge. The resting dimness
      of the wordmark hangs off this: it is only right to hold brightness back
      for a pull if there is a pull to be had.
    */
    (boxEl.closest("footer") ?? boxEl).setAttribute("data-elastic", "on");

    /*
      Every custom property goes on the footer so its backdrop can read them
      too; the crop below inherits `--wm-open` from here.

      `--wm-pull` is how far the edge is currently pulled, in pixels, and
      `--wm-max` is how far it can go. Together they let the backdrop be laid
      out so it neither stretches nor runs short:

        bottom: calc(var(--wm-pull) - var(--wm-max))

      The first term walks the backdrop's bottom up in step with the footer
      growing, which keeps it still instead of being dragged taller. The second
      extends it past the resting edge by the full travel, so the strip the
      stretch opens is already covered. Height works out to resting + max at
      every point in the drag, which is a constant: the canvas is never
      resized, the pattern never scales, and there is no bare ground at the
      edge for it to run out into.
    */
    const vars = (boxEl.closest("footer") as HTMLElement | null) ?? boxEl;

    // The hidden strip, in px. Re-read on resize: the type is fluid.
    let max = 0;
    const measure = () => {
      max = parseFloat(getComputedStyle(wordEl).fontSize) * HIDDEN_EM;
      vars.style.setProperty("--wm-max", `${max.toFixed(2)}px`);
    };
    measure();

    let accum = 0;
    let open = 0;
    let raf = 0;
    let releaseTimer = 0;

    const docBottom = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const atBottom = () => window.scrollY >= docBottom() - 2;

    /*
      The spring's length, taken from the motion scale rather than written out
      again here: this is the same "entrance-sized" beat the rest of the site
      uses, and a second copy of the number is how the two drift apart. Read
      once, since it is a constant on `:root` and nothing changes it.
    */
    const returnMs = cssMs("--duration-large", RETURN_FALLBACK_MS);

    /*
      The wordmark's brightness, as a flag rather than a level: on while the
      edge is engaged, off once it is let go. The transition itself lives in
      CSS; the only part of its timing that belongs here is the way back down.

      That is the longest beat on the scale, and deliberately longer than the
      spring above it: the edge lands first and the light goes on leaving after
      it, so the two are a lead and a follow rather than one movement. Letting
      go is also the moment nobody is watching closely, which is where a slow
      fade costs nothing and a quick one reads as the word being switched off.

      Coming up has no such tie — it answers the pull, so it is quick — and
      that duration stays in the stylesheet.
    */
    const dimMs = cssMs("--duration-epic", DIM_FALLBACK_MS);

    const light = (on: boolean) => {
      if (on) {
        vars.style.removeProperty("--wm-lit-ms");
        vars.style.removeProperty("--wm-lit-ease");
      } else {
        vars.style.setProperty("--wm-lit-ms", `${dimMs}ms`);
        // Named, not spelled out: the curve stays defined in one place.
        vars.style.setProperty("--wm-lit-ease", "var(--ease-in-out-soft)");
      }
      vars.style.setProperty("--wm-lit", on ? "1" : "0");
    };

    const clear = () => {
      vars.style.setProperty("--wm-open", "0");
      vars.style.setProperty("--wm-pull", "0px");
      light(false);
    };

    /*
      Set the amount open, then put the view back on the document's bottom.
      Without the second half the footer would grow into space nobody can see.
    */
    const apply = (next: number) => {
      open = Math.min(1, Math.max(0, next));
      vars.style.setProperty("--wm-open", open.toFixed(4));
      vars.style.setProperty("--wm-pull", `${(open * max).toFixed(2)}px`);
      window.scrollTo(0, docBottom());
    };

    const springBack = () => {
      cancelAnimationFrame(raf);
      // Dim over the length of the spring, so the light and the edge leave together.
      light(false);
      const from = open;
      if (from === 0) return;
      const t0 = performance.now();
      const step = (now: number) => {
        // If they have scrolled away, drop it rather than yanking the page.
        if (!atBottom()) {
          clear();
          open = 0;
          accum = 0;
          return;
        }
        const k = Math.min(1, (now - t0) / returnMs);
        apply(from * (1 - easeOut(k)));
        if (k < 1) raf = requestAnimationFrame(step);
        else accum = 0;
      };
      raf = requestAnimationFrame(step);
    };

    const scheduleRelease = () => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(springBack, RELEASE_MS);
    };

    const onWheel = (e: WheelEvent) => {
      const pullingDown = e.deltaY > 0 && atBottom();
      const pushingBack = e.deltaY < 0 && open > 0;
      if (!pullingDown && !pushingBack) return;

      // We are driving the edge now, so the browser should not also scroll.
      e.preventDefault();
      cancelAnimationFrame(raf);
      light(true);
      accum = Math.max(0, accum + e.deltaY);
      // Approaches the limit instead of reaching it: freely at first, stiff at the end.
      apply(1 - Math.exp(-accum / (max * RESISTANCE)));
      scheduleRelease();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", measure);
    return () => {
      disposeEnter();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", measure);
      window.clearTimeout(releaseTimer);
      cancelAnimationFrame(raf);
      /*
        Hand back the flag as well as the listeners. This effect re-runs if the
        reader turns reduced motion on mid-visit, and the run that follows
        returns before it can set the flag again. Leaving it set would strand
        the wordmark at its resting dimness with the pull that brightens it now
        gone — the exact state the flag exists to prevent.
      */
      vars.removeAttribute("data-elastic");
      clear();
    };
  }, [reduced]);

  return (
    <div ref={box} className="wordmark-box mt-14">
      {/*
        `aria-hidden` because it says nothing new: the footer already names the
        company at the top of this same block, and a screen reader meeting
        "Sinonin" twice in one region learns nothing the second time. It is a
        graphic that happens to be made of letters.
      */}
      <p
        ref={word}
        aria-hidden="true"
        /*
          The brightness transition lives in `.wordmark-lift`, driven by the
          `--wm-lit` flag rather than by the live pull depth, so it can be
          eased without chasing the drag. See globals.css.

          The one step change, full to resting dimness when the elastic
          attaches on mount, happens while the footer is still below the fold,
          and the arrival fade then brings the word up to the dimmed value
          rather than from it.
        */
        className="wordmark-fill wordmark-sweep wordmark-crop wordmark-dissolve wordmark-lift brand-gradient block select-none bg-clip-text text-center font-display font-bold leading-none tracking-tighter text-transparent [-webkit-background-clip:text]"
      >
        Sinonin
      </p>
    </div>
  );
}
