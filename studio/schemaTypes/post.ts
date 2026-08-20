import { defineField, defineType } from "sanity";

/*
  A blog post. The fields mirror the frontmatter in src/content/blog/*.mdx so
  the migration is a straight copy and PostMeta in src/lib/blog.ts keeps its
  shape.

  `language` is a plain field rather than the document-internationalization
  plugin: it is the same field name the plugin uses, so adopting the plugin
  later is additive and does not rewrite existing documents.
*/
export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        "The address of the post. Changing this breaks existing links, so leave it alone once published.",
      options: { source: "title", maxLength: 96 },
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
      name: "date",
      title: "Publication date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Alternative Proteins",
          "Analysis",
          "Events",
          "Insects",
          "Interview",
          "Palatability",
          "Speaking",
          "Technology",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Free-form keywords, shown at the end of the post. Optional.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description:
        "One or two sentences. Used on the blog index, on the home page and as the description search engines show.",
      validation: (rule) => rule.required().max(320),
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
          description:
            "Describe the image for someone who cannot see it. Required.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "credit",
          title: "Photo credit",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      initialValue: "Dr. Seronei Chelulei Cheison",
    }),
    defineField({
      name: "readingMinutes",
      title: "Reading time (minutes)",
      type: "number",
      description:
        "Optional. Shown beside the post in the site's search results.",
      validation: (rule) => rule.min(1).max(120),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "date", media: "cover" },
  },
});
