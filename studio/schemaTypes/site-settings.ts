import { defineField, defineType } from "sanity";

/*
  The handful of site-wide values the client may need to change without a
  developer. A singleton: exactly one document, id `siteSettings`.

  Deliberately small. The base URL and the form endpoint stay in
  src/lib/config.ts because they are deployment wiring, not content, and
  getting one wrong takes the site or the contact form down.
*/
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Contact email address",
      type: "string",
      description: "Shown on the contact page.",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "bookingUrl",
      title: "Booking link",
      type: "url",
      description:
        "Where 'Request a Meeting' points. A calendar booking page, or a mailto: address.",
      validation: (rule) =>
        rule.required().uri({ scheme: ["http", "https", "mailto"] }),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
