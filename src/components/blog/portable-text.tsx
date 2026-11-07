import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { PortableTable } from "@/components/PortableTable";
import { CARD } from "@/components/ui/card";

/*
  Renders a Sanity post body.

  Every class here is lifted from mdx-components.tsx so a migrated post looks
  identical to the MDX it replaced. That file is still in use for the legal
  pages, which remain MDX; when those move too, the two can be reconciled.

  Portable Text names things differently from markdown: paragraph styles are
  `block`, bold and italic are `marks`, links are `marks` backed by a markDef,
  and anything that is not text is a `type`.
*/

type FigureValue = {
  url?: string;
  alt?: string;
  caption?: string;
  lqip?: string;
  dimensions?: { width: number; height: number };
};

type DividerValue = { style?: "line" | "ornament" };

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-5 leading-relaxed text-ink/85">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-[3px] border-leaf bg-mist/60 px-6 py-5 font-display text-lg font-medium leading-relaxed text-ink sm:text-xl">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2 pl-6 leading-relaxed text-ink/85 marker:text-leaf">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2 pl-6 leading-relaxed text-ink/85">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      // Anything not pointing at our own site opens in a new tab, and carries
      // noreferrer so the destination cannot see where it was linked from.
      const external = /^https?:\/\//.test(href) && !href.includes("sinoninbio.tech");
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-medium text-leaf underline decoration-leaf/40 underline-offset-2 transition motion-press hover:decoration-leaf"
        >
          {children}
        </a>
      );
    },
  },

  types: {
    figure: ({ value }: { value: FigureValue }) => {
      if (!value.url) return null;
      const width = value.dimensions?.width ?? 1600;
      const height = value.dimensions?.height ?? 900;
      return (
        <figure className="reveal my-10">
          <div className={`${CARD} overflow-hidden`}>
            <Image
              src={value.url}
              alt={value.alt ?? ""}
              width={width}
              height={height}
              sizes="(max-width: 768px) 100vw, 720px"
              placeholder={value.lqip ? "blur" : "empty"}
              blurDataURL={value.lqip}
              className="img-reveal h-auto w-full"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-xs leading-relaxed text-ink-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    divider: ({ value }: { value: DividerValue }) =>
      value.style === "ornament" ? (
        <p className="my-10 text-center text-lg text-leaf">❦</p>
      ) : (
        <hr className="my-12 border-line" />
      ),

    table: PortableTable,
  },
};

export default function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={portableTextComponents} />;
}
