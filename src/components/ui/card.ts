/*
  Shared card surfaces. These class strings were duplicated across the home
  sections and the blog / reports index pages, which is how the resting shadow
  went missing in some places and not others. Keep new cards on these.

  CARD             static panel, surface, border, resting depth
  CARD_INTERACTIVE clickable card, adds the hover lift and a deeper shadow
  CARD_SURFACE     depth only, for cells that set their own background
                   (see the mist and forest cells in `pillars.tsx`)
*/

const SURFACE = "rounded-2xl shadow-card";

const MOTION =
  "transition motion-quick hover:-translate-y-0.5 hover:shadow-card-hover";

export const CARD_SURFACE = SURFACE;

export const CARD = `${SURFACE} border border-line bg-white`;

export const CARD_INTERACTIVE = `group ${CARD} ${MOTION}`;

/** Depth + hover for cells supplying their own background and border. */
export const CARD_INTERACTIVE_SURFACE = `group ${SURFACE} border ${MOTION}`;
