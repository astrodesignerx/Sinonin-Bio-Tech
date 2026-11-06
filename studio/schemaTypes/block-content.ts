import { defineArrayMember, defineField, defineType } from "sanity";

/*
  The rich text used by post and legal bodies.

  Portable Text is stored as structured data, not HTML or markdown, which is
  why the renderer on the site decides how each block looks. The block types
  listed here are the ones the existing MDX actually uses: headings two and
  three, blockquote, lists, bold, italic and links. Nothing more, so the client
  cannot invent a style the site has no design for.

  `figure` is the one custom block, matching the <Figure> component in
  src/components/blog/mdx-components.tsx.
*/
export const blockContent = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (rule) =>
                  rule.required().uri({ scheme: ["http", "https", "mailto", "tel"] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      name: "divider",
      title: "Divider",
      type: "object",
      description: "A horizontal rule between sections.",
      fields: [
        defineField({
          name: "style",
          title: "Style",
          type: "string",
          options: {
            list: [
              { title: "Line", value: "line" },
              { title: "Ornament", value: "ornament" },
            ],
            layout: "radio",
          },
          initialValue: "line",
        }),
      ],
      preview: { select: { title: "style" } },
    }),
    // Registered by the @sanity/table plugin in sanity.config.ts, which gives
    // the editor a grid with add/remove row and column buttons. The site
    // treats the first row as the header.
    defineArrayMember({ type: "table", title: "Table" }),
    defineArrayMember({
      name: "figure",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Shown under the image. Optional.",
        }),
      ],
    }),
  ],
});
