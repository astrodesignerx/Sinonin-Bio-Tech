import Image from "next/image";
import { useTranslations } from "next-intl";
import { CARD } from "@/components/ui/card";

/*
  The Sinonin Group, carried over from the legacy site's "Our Family of
  Businesses" strip.

  That version was four bare logos with no names and no copy, which told a
  visitor nothing. Here each mark gets the company's name and one line on what
  it does, because the point of the section is the shape of the group, not the
  artwork.

  It sits on About rather than the home page for two reasons: the founder
  paragraph directly above it already calls Sinonin Biotech "part of the
  Sinonin Group of companies", so this is where the claim gets evidence; and
  the home page already ends on a supporters logo strip, which a second row of
  logos would blur into.

  This is the one section on the page that breaks the sticky-rail layout its
  neighbours use. Four companies read as a set, and a set wants one row: the
  rail would squeeze them into a 2x2 block in the right-hand column, which
  reads as two pairs. Heading goes on top instead so the cards get full width.

  `height` is per-mark on purpose. These four lockups run from a 2.7:1 wordmark
  to a 1:1 badge, and a single shared height would make the square marks tower
  over the wide ones. The values below are set by eye so each reads at about
  the same visual weight, inside a fixed-height cell so the names below them
  still line up across the row.
*/
const COMPANIES = [
  { key: "tea", src: "/images/group/tea.webp", width: 656, height: 245, className: "h-10" },
  { key: "food", src: "/images/group/food.webp", width: 656, height: 656, className: "h-20" },
  { key: "kipkenda", src: "/images/group/kipkenda.webp", width: 579, height: 656, className: "h-20" },
  { key: "vlavour", src: "/images/group/vlavour.webp", width: 580, height: 386, className: "h-14" },
] as const;

export default function GroupCompanies() {
  const t = useTranslations("aboutPage");

  return (
    <section className="border-t border-line py-14 sm:py-16">
      <div className="max-w-2xl">
        <h2 className="heading-sub">{t("groupTitle")}</h2>
        <p className="mt-4 leading-relaxed text-ink-muted">{t("groupIntro")}</p>
      </div>

      <ul className="reveal-stagger mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COMPANIES.map((c) => (
          <li key={c.key}>
            {/*
              The marks are flattened onto white by
              `scripts/gen-group-logos.mjs`, so the card's own white surface is
              what they sit on: no tile, no rule, nothing drawn around them.
              The fixed-height cell is invisible and does one job, holding the
              baseline of the names steady across a row of very different
              lockups.
            */}
            <div className={`${CARD} flex h-full flex-col p-6`}>
              <div className="flex h-24 items-center justify-center">
                <Image
                  src={c.src}
                  alt=""
                  width={c.width}
                  height={c.height}
                  sizes="280px"
                  className={`${c.className} w-auto max-w-full object-contain`}
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {t(`group.${c.key}.name`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {t(`group.${c.key}.note`)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
