"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/*
  A short looping clip standing in for a still inside a card.

  Three things it does that a bare `<video autoplay loop muted>` does not.

  It costs nothing until it is looked at. `preload="none"` plus starting
  playback only once the card is on screen means the file is not fetched by
  someone who never scrolls that far; the poster is a 60KB still and carries
  the card until then.

  It stops when it is not being watched, on scroll and on tab change, so a
  decorative loop in the middle of a page is not decoding frames behind a
  spreadsheet.

  And it honours reduced motion by rendering the poster instead. That cannot be
  done in CSS: a media query can stop an animation but not a video, so the
  decision has to be made where the element is built.

  No `autoplay` attribute anywhere. Playback is started only by the effect
  below, which catches the rejection browsers raise when they decline or
  interrupt a play request; the attribute would open a second, unhandled path
  to the same thing.
*/
export default function CardVideo({
  mp4,
  webm,
  poster,
  label,
  className = "",
}: {
  mp4: string;
  /** Optional: only worth shipping when VP9 actually beats H.264 on the clip. */
  webm?: string;
  poster: string;
  /*
    Description for assistive tech, replacing the alt text of the still this
    stands in for. Omit to leave it decorative.
  */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const setPlaying = (on: boolean) => {
      if (on) void el.play().catch(() => {});
      else el.pause();
    };

    const io = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    io.observe(el);

    const onVisibility = () => setPlaying(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.pause();
    };
  }, [reduced]);

  const fill = `absolute inset-0 h-full w-full object-cover ${className}`;

  if (reduced) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={poster} alt={label ?? ""} className={fill} />;
  }

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={fill}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
