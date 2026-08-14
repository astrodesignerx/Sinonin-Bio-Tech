"use client";

import { useSyncExternalStore } from "react";

/*
  Whether the reader has asked for reduced motion.

  One place, because there were six, and they did not agree. Every one of them
  was `window.matchMedia(...).matches` read once inside an effect, which answers
  the question at mount and then never again: a reader who turns the setting on
  while the page is open keeps whatever was decided before they asked. On this
  site that meant a canvas still spinning and a hero still cutting between clips
  after the request to stop.

  Read as an external store rather than synced into state by an effect. That
  matters for more than tidiness: an effect-synced value is false on the first
  render, so anything gated on it starts animating for a frame or two before
  being told not to. Here the first render already has the answer, and the
  subscription keeps it current if the preference changes mid-session.

  The server snapshot is `false` — "no preference expressed" — which is the same
  default the CSS takes with `@media (prefers-reduced-motion: no-preference)`.
  Markup rendered on the server cannot know, and guessing `true` would ship a
  still page to everyone and then start it moving on hydration.

  Consumers should list the result in their effect's dependencies. That is what
  turns a change in the preference into a teardown of whatever was running.
*/

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
