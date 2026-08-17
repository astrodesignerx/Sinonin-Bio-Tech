export const site = {
  email: "info@sinoninbio.tech",
  baseUrl: "https://www.sinoninbio.tech",
  // FormSubmit AJAX endpoint, delivers submissions to the address above.
  // The first-ever submission triggers a one-time confirmation email to the
  // owner; after confirming once, all submissions arrive directly.
  formsEndpoint: "https://formsubmit.co/ajax/info@sinoninbio.tech",
  // TODO(client): replace with the real calendar booking URL (Calendly/Cal.com).
  bookingUrl:
    "mailto:info@sinoninbio.tech?subject=Meeting%20request%20%E2%80%93%20Sinonin%20Biotech",
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

export type HeroClip = {
  webm: string;
  mp4: string;
  poster: string;
  /** Key under `home.heroClips` for this clip's caption and alt text. */
  key: string;
};

/*
  The V2 hero cycles these instead of looping one clip.

  Ordered for the cut, not for the argument. An earlier version alternated bowl
  and bench to state the proposition in miniature, but every junction then put
  two unrelated images against each other. This order pairs each clip with the
  one it physically resembles: a dog lowering its head into a bowl hands over
  to a cat doing the same thing, and a gloved hand at a microscope hands over
  to gloved hands at a bench. Two of the three junctions are near match cuts,
  and the one real jump is parked at the loop point where it reads as a restart
  rather than a stumble.

  The cost is that the bowl/bench alternation is gone; swapping the middle two
  entries brings it back if the argument matters more than the joins.

  Each is trimmed to eight seconds at 720p (the microscope source runs out at
  seven), so the whole cycle costs about what a single unclipped 1080p loop
  would. Only the first is fetched on load, the rest are pulled in one ahead as
  the loop advances, so the fold still starts on one file.
*/
export const HERO_CLIPS: HeroClip[] = [
  {
    key: 'bowl',
    webm: '/videos/hero-bowl.webm',
    mp4: '/videos/hero-bowl.mp4',
    poster: '/images/hero-bowl-poster.webp',
  },
  {
    key: 'cat',
    webm: '/videos/cat-bowl.webm',
    mp4: '/videos/cat-bowl.mp4',
    poster: '/images/cat-bowl-poster.webp',
  },
  {
    key: 'scope',
    webm: '/videos/microscope.webm',
    mp4: '/videos/microscope.mp4',
    poster: '/images/microscope-poster.webp',
  },
  {
    key: 'flasks',
    webm: '/videos/lab-flasks.webm',
    mp4: '/videos/lab-flasks.mp4',
    poster: '/images/lab-flasks-poster.webp',
  },
];

/*
  Which hero variant renders on the home page. Each lives in its own file under
  components/home, so switching is a one-line change and no version has to be
  reconstructed from history to compare them.
*/
export const HERO_VERSION: "v1" | "v2" | "v3" = "v2";
