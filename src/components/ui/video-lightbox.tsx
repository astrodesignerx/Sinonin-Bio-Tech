"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

/*
  Modal video player. Nothing is requested from YouTube until this mounts, so
  the click-to-load promise on the stories section still holds.

  Modal mechanics that are easy to skip and shouldn't be: focus moves in on
  open and returns to the trigger on close, Tab is trapped inside, Escape and
  a scrim click dismiss, and the page behind is scroll-locked.
*/
export default function VideoLightbox({
  videoId,
  title,
  start = 0,
  onClose,
  closeLabel,
}: {
  videoId: string;
  title: string;
  start?: number;
  onClose: () => void;
  closeLabel: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<Element | null>(null);

  const src = (() => {
    const p = new URLSearchParams({ autoplay: "1", rel: "0" });
    if (start) p.set("start", String(start));
    return `https://www.youtube-nocookie.com/embed/${videoId}?${p}`;
  })();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, iframe, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    restoreTo.current = document.activeElement;
    closeRef.current?.focus();

    const { overflow, paddingRight } = document.body.style;
    // Compensate for the vanishing scrollbar so the page doesn't jump.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      (restoreTo.current as HTMLElement | null)?.focus?.();
    };
  }, [onKeyDown]);

  return (
    <div
      className="lightbox fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="lightbox-scrim absolute inset-0 cursor-default"
      />

      <div
        ref={panelRef}
        className="lightbox-panel relative z-10 w-full max-w-5xl"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <p className="font-display text-sm font-semibold leading-snug text-paper sm:text-base">
            {title}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-paper transition motion-quick hover:border-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-forest shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]">
          <iframe
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
