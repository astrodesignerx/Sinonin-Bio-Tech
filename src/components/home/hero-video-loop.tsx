"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import type { HeroClip } from "@/lib/config";

/*
  Cycles the hero clips with a dissolve instead of looping a single file.

  Double-buffered: two <video> layers, one visible and playing, the other
  holding the next clip already decoded. Swapping between two ready elements is
  what makes the change a dissolve rather than a black flash, which is what a
  single element re-pointed at a new src would give.

  The dissolve is "A over B", not a symmetric crossfade. Fading the outgoing
  clip out while fading the incoming one in looks correct in a timeline and is
  wrong on screen: at the midpoint both sit near half opacity, their combined
  coverage falls short of solid, and the page behind shows through the middle
  of every transition. So the outgoing clip holds at full opacity underneath
  and only the incoming one fades up on top of it. Nothing behind is ever
  visible, and the outgoing frame is only replaced once it is fully covered.

  That is also why the layer leaving is not re-pointed to its next clip
  immediately. It has to keep showing the old clip for the length of the
  dissolve; only when the incoming layer is opaque does it get re-pointed and
  hidden, invisibly, behind it.

  The dissolve starts before the outgoing clip ends, not on `ended`. Waiting
  for `ended` meant fading away from a frozen final frame, which is the one
  thing that reads as a join; overlapping means both clips are still moving
  through the blend.

  The second file is not requested until the first is actually playing, so the
  fold still costs one video on load no matter how many clips are in the list.
*/

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/*
  Read as an external store rather than synced into state by an effect, so the
  first render already knows the answer and no playback starts before a
  reduced-motion preference can cancel it.
*/
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const q = window.matchMedia(REDUCE_QUERY);
      q.addEventListener("change", onChange);
      return () => q.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  );
}

/** Dissolve length, and how long the outgoing layer is held underneath. */
const FADE_MS = 1000;
const FADE_S = FADE_MS / 1000;

/*
  Full cycle of the `hero-breathe` drift: 24s, doubled because it alternates.
  Each layer starts its copy of that animation offset by however long the loop
  has already been running, so every layer is at the same point in the drift.
  Without it a new layer restarts the slow zoom from the beginning and the
  camera visibly snaps back to wide in the middle of the dissolve.
*/
const BREATHE_PERIOD_S = 48;

export default function HeroVideoLoop({ clips }: { clips: HeroClip[] }) {
  const t = useTranslations("home");
  const reduced = usePrefersReducedMotion();

  const layers = useRef<(HTMLVideoElement | null)[]>([null, null]);
  const wrap = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  // Origin for the shared drift phase, set by whichever layer mounts first.
  const phase0 = useRef<number | null>(null);
  // Guards the handover so a burst of timeupdate events can only fire it once.
  const handing = useRef(false);

  const [cur, setCur] = useState(0);
  // True while the outgoing clip is still being held underneath the incoming.
  const [fading, setFading] = useState(false);
  // The next file stays unrequested until the first clip is genuinely playing.
  const [armed, setArmed] = useState(false);

  const activeLayer = cur % 2;
  const clip = clips[cur];
  /*
    Mid-dissolve the spare layer must keep showing the clip we are leaving;
    once settled it goes back to holding the one we are heading for.
  */
  const spareIndex = fading
    ? (cur - 1 + clips.length) % clips.length
    : (cur + 1) % clips.length;

  const advance = useCallback(() => {
    if (handing.current) return;
    handing.current = true;
    setFading(true);
    setCur((c) => (c + 1) % clips.length);
  }, [clips.length]);

  /*
    Hand over once the clip is within a dissolve of its end. `ended` is kept as
    a backstop for the case where the last timeupdate lands late and the clip
    runs out before the handover fires.
  */
  const onProgress = useCallback(
    (el: HTMLVideoElement) => {
      if (!Number.isFinite(el.duration)) return;
      if (el.duration - el.currentTime <= FADE_S) advance();
    },
    [advance],
  );

  /** Mount a layer already in phase with the shared drift. */
  const attach = useCallback(
    (layer: number) => (el: HTMLVideoElement | null) => {
      layers.current[layer] = el;
      if (!el) return;
      phase0.current ??= performance.now();
      const elapsed = (performance.now() - phase0.current) / 1000;
      el.style.animationDelay = `-${(elapsed % BREATHE_PERIOD_S).toFixed(2)}s`;
    },
    [],
  );

  // Start whichever layer just became visible; retire the one leaving.
  useEffect(() => {
    if (reduced) return;
    handing.current = false;
    const el = layers.current[activeLayer];
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {});

    /*
      Backstop only. The outgoing layer is normally released by the incoming
      layer's own `transitionend`, because a timer and a CSS transition are
      separate clocks: if this one won the race the clip underneath would be
      pulled away while the one on top was still partly transparent, and the
      page would show through for a frame. This fires late enough to lose that
      race, and exists for the case where no transition runs at all and so no
      `transitionend` ever arrives.
    */
    const id = window.setTimeout(() => {
      setFading(false);
      layers.current[1 - activeLayer]?.pause();
    }, FADE_MS + 400);
    return () => window.clearTimeout(id);
  }, [cur, activeLayer, reduced]);

  /*
    A short dip into softness across the blend. Restarting a CSS animation
    needs the class removed, layout flushed, and the class re-added; keying the
    element instead would remount the videos inside it and defeat the whole
    double buffer.
  */
  useEffect(() => {
    if (reduced || cur === 0) return;
    const el = stack.current;
    if (!el) return;
    el.classList.remove("hero-dissolve");
    void el.offsetWidth;
    el.classList.add("hero-dissolve");
  }, [cur, reduced]);

  // Pause off-screen and in background tabs; an unseen hero should cost nothing.
  useEffect(() => {
    if (reduced) return;
    const node = wrap.current;
    if (!node) return;

    const setPlaying = (on: boolean) => {
      const el = layers.current[activeLayer];
      if (!el) return;
      if (on) void el.play().catch(() => {});
      else el.pause();
    };

    const io = new IntersectionObserver(
      ([e]) => setPlaying(e.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    io.observe(node);
    const onVis = () => setPlaying(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activeLayer, reduced]);

  const alt = t(`heroClips.${clip.key}.alt`);

  return (
    <div ref={wrap} className="absolute inset-0">
      {reduced ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={clip.poster}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div ref={stack} className="absolute inset-0">
          {[0, 1].map((layer) => {
            const isActive = layer === activeLayer;
            if (!isActive && !armed) return null;
            const shown = clips[isActive ? cur : spareIndex];
            return (
              <video
                key={`${layer}-${shown.key}`}
                ref={attach(layer)}
                className={`hero-breathe absolute inset-0 h-full w-full object-cover ${
                  isActive
                    ? "z-20 opacity-100 transition-opacity duration-1000 ease-in-out"
                    : fading
                      ? "z-10 opacity-100"
                      : "z-10 opacity-0"
                }`}
                poster={shown.poster}
                /*
                  Deliberately no `autoPlay`. Playback is started only by the
                  effect above, which catches the rejection the browser raises
                  when it declines or interrupts a play request. The attribute
                  would start a second, unhandled path to the same thing.
                */
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                onPlaying={isActive ? () => setArmed(true) : undefined}
                /*
                  The moment the incoming layer is genuinely opaque is the only
                  safe moment to let go of the one underneath.
                */
                onTransitionEnd={
                  isActive
                    ? (e) => {
                        if (e.propertyName === "opacity") setFading(false);
                      }
                    : undefined
                }
                onTimeUpdate={
                  isActive ? (e) => onProgress(e.currentTarget) : undefined
                }
                onEnded={isActive ? advance : undefined}
              >
                <source src={shown.webm} type="video/webm" />
                <source src={shown.mp4} type="video/mp4" />
              </video>
            );
          })}
        </div>
      )}

      {/*
        The clips carry no visible label, so this is the only thing describing
        the fold to a screen reader. One live region rather than a label per
        layer, which would announce the hidden one too.
      */}
      <p className="sr-only" aria-live="polite">
        {alt}
      </p>
    </div>
  );
}
