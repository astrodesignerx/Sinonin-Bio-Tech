import { defineField, defineType } from "sanity";

/*
  The imprint and the privacy policy, one document per page per language.

  These carry legal weight and are the two pages a German company is obliged to
  keep accurate, so they are editable without a developer. The body uses the
  same rich text as blog posts.
*/
export const legalDoc = defineType({
  name: "legalDoc",
  title: "Legal page",
  type: "document",
  fields: [
    defineField({
      name: "docType",
      title: "Page",
      type: "string",
      options: {
        list: [
          { title: "Imprint", value: "impressum" },
          { title: "Privacy policy", value: "privacy" },
        ],
        layout: "radio",
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
      name: "body",
      title: "Body",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { docType: "docType", language: "language" },
    prepare: ({ docType, language }) => ({
      title: docType === "privacy" ? "Privacy policy" : "Imprint",
      subtitle: language === "de" ? "German" : "English",
    }),
  },
});
