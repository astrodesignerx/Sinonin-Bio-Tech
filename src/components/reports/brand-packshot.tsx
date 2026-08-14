"use client";

import { useState } from "react";
import Image from "next/image";
import { MagnifyingGlassPlus } from "@phosphor-icons/react";
import Lightbox from "@/components/ui/lightbox";
import type { BrandExample } from "@/components/reports/brand-showcase";

/*
  Brand and product as one phrase, without saying the brand twice.

  Several products are recorded with the brand already in the name — "ami Cat
  dry catfood" under the brand "ami" — so a plain join announced "ami ami Cat
  dry catfood" to a screen reader. Handled here rather than by editing the
  product names, which are the client's own copy and are what the card prints.
*/
function fullName({ brand, product }: BrandExample) {
  return product.toLowerCase().startsWith(brand.toLowerCase())
    ? product
    : `${brand} ${product}`;
}

/*
  A product packshot that opens full size on click.

  These are the one thing in the showcase worth a closer look: the whole claim
  of the section is that the material is already on shelf, and the evidence for
  that is printed on the pack in six point type. At tile size it is a coloured
  bag; opened, it is a label you can actually read.

  Only this cell is a client component. The section around it stays on the
  server, so the list, its copy and the disclaimer all ship as static markup and
  the interactive part is the part that had to be.
*/
export default function BrandPackshot({
  item,
  viewLabel,
  closeLabel,
}: {
  item: BrandExample & { image: string };
  viewLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const name = fullName(item);
  const alt = item.imageAlt ?? name;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${viewLabel}: ${name}`}
        className="group relative block aspect-[16/10] w-full cursor-zoom-in bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
      >
        {/*
          The hover scale sits on this wrapper rather than on the image, and it
          has to. The image carries `img-reveal`, whose keyframes end on
          `transform: scale(1)` with a fill mode of `both` — a finished
          animation keeps applying its last frame, and an animation outranks a
          transition, so a hover transform on the same element would simply be
          ignored once the reveal had run.
        */}
        <div className="absolute inset-0 transition-transform motion-quick group-hover:scale-[1.03]">
          <Image
            src={item.image}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="img-reveal object-contain p-4"
          />
        </div>

        {/*
          The affordance. Held back until hover or keyboard focus, because a
          magnifier printed on every cell would read as part of the packaging.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper opacity-0 backdrop-blur-sm transition-opacity motion-quick group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <MagnifyingGlassPlus size={15} weight="bold" />
        </span>
      </button>

      {open && (
        <Lightbox
          title={name}
          closeLabel={closeLabel}
          onClose={() => setOpen(false)}
          panelClassName="max-w-3xl"
          heading={
            <p className="font-display text-sm font-semibold leading-snug text-paper sm:text-base">
              {item.brand}
              <span className="block font-sans text-xs font-normal text-paper/70">
                {item.product}
              </span>
            </p>
          }
        >
          {/*
            White, because every one of these is cut out on white and a packshot
            on a dark panel would show as a bright rectangle floating in it.

            A fixed viewport-relative height rather than the image's own aspect:
            the packs run from square tins to tall narrow bags, and a panel that
            resized to each one would jump around as you moved between them.
            `object-contain` centres whatever shape arrives inside it.
          */}
          <div className="relative h-[68vh] w-full overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]">
            <Image
              src={item.image}
              alt={alt}
              fill
              sizes="(max-width: 768px) 92vw, 768px"
              className="object-contain p-6 sm:p-10"
            />
          </div>
        </Lightbox>
      )}
    </>
  );
}
