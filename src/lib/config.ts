export const site = {
  email: "contact@sinoninbio.tech",
  baseUrl: "https://www.sinoninbio.tech",
  // FormSubmit AJAX endpoint, delivers submissions to the address above.
  // The first-ever submission triggers a one-time confirmation email to the
  // owner; after confirming once, all submissions arrive directly.
  formsEndpoint: "https://formsubmit.co/ajax/contact@sinoninbio.tech",
  // TODO(client): replace with the real calendar booking URL (Calendly/Cal.com).
  bookingUrl:
    "mailto:contact@sinoninbio.tech?subject=Meeting%20request%20%E2%80%93%20Sinonin%20Biotech",
} as const;

/*
  Optional hero video. Set to null to fall back to the still image.

  WebM is listed first so browsers that support VP9 take the smaller file. The
  poster is a frame from the video itself, not the pulses still: swapping
  between two different subjects on load would read as a glitch.
*/
export const HERO_VIDEO: { webm: string; mp4: string; poster: string } | null = {
  webm: '/videos/hero-bowl.webm',
  mp4: '/videos/hero-bowl.mp4',
  poster: '/images/hero-bowl-poster.webp',
};

/*
  Which hero variant renders on the home page. Each lives in its own file under
  components/home, so switching is a one-line change and no version has to be
  reconstructed from history to compare them.
*/
export const HERO_VERSION = "v1" as const;
