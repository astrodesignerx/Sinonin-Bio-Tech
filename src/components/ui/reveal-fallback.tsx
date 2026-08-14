"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/*
  The second trigger for the reveal animations, for engines without scroll
  timelines. See the long note above the `.reveal` rules in globals.css for why
  there are two and how they divide.

  This renders nothing. It exists to make one decision — is a scroll timeline
  available? — and, if not, to drive the same keyframes from an
  IntersectionObserver instead.

  Three rules keep it from being able to hide content:

  It only ever touches elements that were below the fold at the moment it ran.
  Anything the reader can already see is left exactly as the server sent it,
  which also matches what the scroll-driven path does: an element already past
  its entry range renders at the end of the animation, not the start.

  It sets the start state and the observer together. There is no window in which
  an element is hidden but nothing is watching to bring it back.

  Everything it relies on is an attribute it sets itself. If this never runs,
  the selectors in the stylesheet find nothing and the page is simply the page.
*/

/*
  `.reveal-stagger > *` rather than the stagger container, because the children
  are what animate; the container only supplies their order.
*/
const TARGETS = ".reveal, .reveal-stagger > *, .img-reveal";

/*
  Fire a little before the element's top edge reaches the bottom of the
  viewport, so the animation is under way by the time it is properly in view
  rather than starting the instant it appears.
*/
const ROOT_MARGIN = "0px 0px -12% 0px";

export default function RevealFallback() {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;

    /*
      The whole decision, in one place. Where this is true the stylesheet's
      scroll-driven block is already handling every one of these elements, and
      running the observer as well would mean two animations on one arrival.
    */
    if (CSS.supports("animation-timeline", "view()")) return;

    const root = document.documentElement;
    root.setAttribute("data-reveal-driver", "js");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          // Once only: this is an arrival, not a state the element returns to.
          io.unobserve(entry.target);
        }
      },
      { rootMargin: ROOT_MARGIN },
    );

    for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
      // Already arrived, or already waiting, from an earlier run on this page.
      if (el.dataset.reveal) continue;
      // In view at load: it has nowhere to arrive from, so leave it alone.
      if (el.getBoundingClientRect().top < window.innerHeight) continue;
      el.dataset.reveal = "wait";
      io.observe(el);
    }

    return () => {
      io.disconnect();
      /*
        Dropping the attribute un-hides anything still waiting. That matters on
        the reduced-motion path in particular: this effect re-runs when the
        preference changes, and the run that follows returns before it can set
        the attribute again, so without this an element that had not yet
        arrived would be left at `opacity: 0` with nothing left to observe it.
      */
      root.removeAttribute("data-reveal-driver");
    };
    /*
      Re-runs per navigation, since a client-side route change swaps the whole
      page under a layout that never unmounts. Elements carried across keep
      their `in` and are skipped above, so nothing replays.
    */
  }, [reduced, pathname]);

  return null;
}
