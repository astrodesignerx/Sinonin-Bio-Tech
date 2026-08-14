"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

/*
  The modal shell: scrim, panel, and the mechanics that are easy to skip and
  should not be. Focus moves in on open and returns to the trigger on close, Tab
  is trapped inside, Escape and a scrim click dismiss, and the page behind is
  scroll-locked without shifting as the scrollbar goes.

  Extracted from the video lightbox when a second one was needed for product
  packshots. The two differ only in what sits inside the panel; duplicating the
  focus trap to get there is how one copy of it quietly stops working.

  Both the scrim and the panel animate in on `.lightbox` and `.lightbox-panel`,
  which run on the shared motion scale — see globals.css.
*/
export default function Lightbox({
  title,
  closeLabel,
  onClose,
  children,
  panelClassName = "max-w-5xl",
  /*
    Rendered beside the close button. The video passes its title here; the
    packshot passes brand and product, so the panel names what is on screen
    without the caller having to build its own header row.
  */
  heading,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  heading?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<Element | null>(null);

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
        className={`lightbox-panel relative z-10 w-full ${panelClassName}`}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0">{heading}</div>
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

        {children}
      </div>
    </div>
  );
}
