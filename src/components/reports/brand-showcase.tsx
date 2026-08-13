import Image from "next/image";

/*
  Products named in a report, shown as examples of what is already on shelf.

  These are third-party products, so the images are supplied by the client and
  dropped into `public/images/brands/`. A cell with no image yet degrades to a
  typographic card rather than a broken frame, so the section can ship before
  every licence is cleared.
*/
export type BrandExample = {
  brand: string;
  product: string;
  /** e.g. "/images/brands/green-petfood-insectdog.webp" */
  image?: string;
  imageAlt?: string;
};

export default function BrandShowcase({
  label,
  title,
  note,
  items,
}: {
  label: string;
  title: string;
  note?: string;
  items: BrandExample[];
}) {
  if (!items.length) return null;

  return (
    <section className="mt-14 border-t border-line pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
        {label}
      </p>
      <h2 className="heading-sub mt-3">{title}</h2>

      <ul className="reveal-stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={`${item.brand}-${item.product}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card"
          >
            <div className="relative aspect-[16/10] w-full bg-mist">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.imageAlt ?? `${item.brand} ${item.product}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="img-reveal object-contain p-4"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center font-display text-2xl font-semibold tracking-tight text-leaf/25"
                >
                  {item.brand.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="font-display text-sm font-semibold tracking-tight text-ink">
                {item.brand}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {item.product}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {note && (
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-ink-muted">
          {note}
        </p>
      )}
    </section>
  );
}
