"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { PlayCircle } from "@phosphor-icons/react";
import SectionHeader from "@/components/ui/section-header";
import { CARD_INTERACTIVE } from "@/components/ui/card";
import VideoLightbox from "@/components/ui/video-lightbox";

/*
  Click-to-load facade rather than a live embed. Dropping three YouTube iframes
  onto the page would contact Google and set cookies before the visitor has
  agreed to anything, which this site (a German company with a GDPR privacy
  notice) should not do. Thumbnails are self-hosted; nothing leaves the site
  until the visitor presses play, and `youtube-nocookie` is used even then.

  Video titles stay in their original language: they are the publishers' titles,
  not our copy.
*/
const VIDEOS = [
  {
    id: "iUhSPuZgans",
    thumb: "/images/stories/kiambu-bsf.webp",
    title: "Kiambu farmers turn into black soldier fly farming",
    start: 0,
  },
  {
    id: "MFu6qVQmAVs",
    thumb: "/images/stories/smart-farm-bsf.webp",
    title: "SMART FARM | Focus on the black soldier fly",
    start: 0,
  },
  {
    id: "FabptZnNsg8",
    thumb: "/images/stories/bsf-startup-testimony.webp",
    title: "BSF: Startup Testimony by Roseanne Mwangi",
    start: 55,
  },
] as const;

export default function InsectStories() {
  const t = useTranslations("home");
  const [playing, setPlaying] = useState<string | null>(null);
  const active = VIDEOS.find((v) => v.id === playing);

  return (
    /* Tinted band: sits between the paper Founder and Blog sections so the
       page keeps alternating rather than running three paper sections together. */
    <section className="bg-mist">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <SectionHeader
        eyebrow={t("storiesEyebrow")}
        title={t("storiesTitle")}
        intro={t("storiesIntro")}
      />

      <ul className="reveal-stagger mt-12 grid gap-5 sm:mt-14 md:grid-cols-3">
        {VIDEOS.map((v) => (
          <li key={v.id} className="flex">
            <figure
              className={`${CARD_INTERACTIVE} flex w-full flex-col overflow-hidden`}
            >
              <div className="relative aspect-video w-full bg-forest">
                <button
                  type="button"
                  onClick={() => setPlaying(v.id)}
                  aria-label={`${t("storiesPlay")}: ${v.title}`}
                  className="group/play absolute inset-0 h-full w-full cursor-pointer"
                >
                  <Image
                    src={v.thumb}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="img-reveal object-cover"
                  />
                  <span className="absolute inset-0 bg-forest/25 transition motion-quick group-hover/play:bg-forest/10" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle
                      size={56}
                      weight="fill"
                      className="text-paper drop-shadow-md transition motion-quick group-hover/play:scale-110"
                    />
                  </span>
                </button>
              </div>
              <figcaption className="flex flex-1 flex-col p-5">
                <p className="font-display text-base font-semibold leading-snug tracking-tight">
                  {v.title}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-4 text-sm font-semibold text-leaf transition motion-press hover:text-forest"
                >
                  {t("storiesWatch")}
                </a>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      </div>

      {active && (
        <VideoLightbox
          videoId={active.id}
          title={active.title}
          start={active.start}
          closeLabel={t("storiesClose")}
          onClose={() => setPlaying(null)}
        />
      )}
    </section>
  );
}
