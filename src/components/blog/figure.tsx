import Image from "next/image";
import { CARD } from "@/components/ui/card";

export default function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: string;
  // MDX attribute expressions ({653}) are stripped at compile time, so
  // dimensions arrive as strings and are coerced here.
  width: number | string;
  height: number | string;
}) {
  const w = Number(width);
  const h = Number(height);

  return (
    <figure className="reveal my-10">
      <div className={`${CARD} overflow-hidden`}>
        <Image
          src={src}
          alt={alt}
          width={w}
          height={h}
          sizes="(max-width: 768px) 100vw, 720px"
          className="img-reveal h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-xs leading-relaxed text-ink-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
