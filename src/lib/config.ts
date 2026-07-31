export const site = {
  email: "contact@sinoninbio.tech",
  baseUrl: "https://www.sinoninbio.tech",
  // FormSubmit AJAX endpoint — delivers submissions to the address above.
  // The first-ever submission triggers a one-time confirmation email to the
  // owner; after confirming once, all submissions arrive directly.
  formsEndpoint: "https://formsubmit.co/ajax/contact@sinoninbio.tech",
  // TODO(client): replace with the real calendar booking URL (Calendly/Cal.com).
  bookingUrl:
    "mailto:contact@sinoninbio.tech?subject=Meeting%20request%20—%20Sinonin%20Biotech",
} as const;
