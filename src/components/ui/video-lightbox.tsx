"use client";

import Lightbox from "@/components/ui/lightbox";

/*
  Modal video player. Nothing is requested from YouTube until this mounts, so
  the click-to-load promise on the stories section still holds.

  The modal mechanics — focus trap, Escape, scrim dismiss, scroll lock — live in
  `Lightbox`, which this and the packshot viewer share.
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
  const src = (() => {
    const p = new URLSearchParams({ autoplay: "1", rel: "0" });
    if (start) p.set("start", String(start));
    return `https://www.youtube-nocookie.com/embed/${videoId}?${p}`;
  })();

  return (
    <Lightbox
      title={title}
      closeLabel={closeLabel}
      onClose={onClose}
      heading={
        <p className="font-display text-sm font-semibold leading-snug text-paper sm:text-base">
          {title}
        </p>
      }
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-forest shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </Lightbox>
  );
}
