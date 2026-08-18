import { defineField, defineType } from "sanity";

/*
  A market report's marketing copy.

  The four reports and their URLs stay defined in code (src/lib/reports.ts):
  the routes are fixed, and the brand showcase on each page is keyed to the
  same slugs. What lives here is everything the client was promised they could
  change themselves, which is the wording and the cover image.

  One document per report per language, matched on `key` and `language`.
*/
export const report = defineType({
  name: "report",
  title: "Market report",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Report",
      type: "string",
      description: "Which report this copy belongs to. Do not change.",
      options: {
        list: [
          { title: "Insect Proteins", value: "insect" },
          { title: "Vegan Palatants", value: "palatants" },
          { title: "Vegan Petfood", value: "petfood" },
          { title: "Petcare Market", value: "petcare" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "German", value: "de" },
        ],
        layout: "radio",
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "One or two sentences, shown on the reports index and at the top of the report page.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "points",
      title: "What's inside",
      type: "array",
      of: [{ type: "string" }],
      description: "The bulleted list of what the report covers.",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "credit", title: "Photo credit", type: "string" }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", language: "language", media: "cover" },
    prepare: ({ title, language, media }) => ({
      title,
      subtitle: language === "de" ? "German" : "English",
      media,
    }),
  },
});
