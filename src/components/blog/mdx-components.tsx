import type { ElementType } from "react";
import Figure from "./figure";

export const mdxComponents: Record<string, ElementType> = {
  Figure,
  h2: (props) => (
    <h2
      className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-10 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl"
      {...props}
    />
  ),
  h4: (props) => (
    <h4
      className="mt-8 font-display text-lg font-semibold tracking-tight text-ink"
      {...props}
    />
  ),
  p: (props) => {
    if (typeof props.children === "string" && props.children.trim() === "❦") {
      return (
        <p className="my-10 text-center text-lg text-leaf" {...props} />
      );
    }
    return <p className="mt-5 leading-relaxed text-ink/85" {...props} />;
  },
  a: (props) => (
    <a
      className="font-medium text-leaf underline decoration-leaf/40 underline-offset-2 transition motion-press hover:decoration-leaf"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-6 leading-relaxed text-ink/85 marker:text-leaf"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-5 list-decimal space-y-2 pl-6 leading-relaxed text-ink/85"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-8 border-l-[3px] border-leaf bg-mist/60 px-6 py-5 font-display text-lg font-medium leading-relaxed text-ink sm:text-xl [&_p]:mt-0 [&_p]:text-inherit [&_p+p]:mt-3"
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-line" />,
  table: (props) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => (
    <thead className="bg-mist text-left text-ink" {...props} />
  ),
  th: (props) => <th className="px-4 py-3 font-semibold" {...props} />,
  td: (props) => (
    <td className="border-t border-line px-4 py-3 align-top text-ink/85" {...props} />
  ),
};
