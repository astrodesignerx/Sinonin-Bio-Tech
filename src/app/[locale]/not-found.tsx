import { useTranslations } from "next-intl";
import Magnetic from "@/components/ui/magnetic";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  /*
    The page is sized to the fold: one screen below the header, with the
    content centred in it, so the footer starts exactly where the viewport
    ends.

    The same `100svh - header` measure the hero uses. This page has less to say
    than any other on the site, and the numeral is the whole of what it has; a
    strip of footer showing under it turns a deliberate blank page into one
    that looks like it ran out of content.

    `justify-center` rather than `items-center`: the children have to keep
    their full width, because the numeral is sized in container query units and
    a shrink-to-fit parent would leave it measuring itself.

    Padding is small on purpose — the min-height does the spacing now, and the
    old `py-32` on top of it was enough to push the block past the fold on a
    laptop screen, which is the exact thing this is here to prevent.
  */
  return (
    <div className="mx-auto flex min-h-[calc(100svh-var(--header-h))] max-w-7xl flex-col justify-center px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
      {/*
        The number, given the closing wordmark's treatment: the same display
        size and the same brand gradient sweeping slowly across the glyphs.

        `wordmark-box` is here for its container query — `wordmark-fill` is
        sized in `cqw` and needs a container to measure. What it borrows is the
        size, not the fit: 30.79cqw is the number that makes "Sinonin" exactly
        fill this width, and three digits at that size land well short of it.
        Matching the footer's height is the point; a "404" stretched to the
        gutters would be a different, much louder thing.

        `aria-hidden` for the same reason the wordmark is: the heading directly
        below says "page not found" in words, and a screen reader meeting the
        status code first learns nothing it is not about to be told properly.
      */}
      <div className="wordmark-box">
        <p
          aria-hidden="true"
          className="wordmark-fill wordmark-sweep brand-gradient block select-none bg-clip-text font-display font-bold leading-none tracking-tighter text-transparent [-webkit-background-clip:text]"
        >
          404
        </p>
      </div>
      <h1 className="mt-6 heading-page">
        {t("title")}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-muted">{t("body")}</p>
      <Magnetic className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px"
        >
          {t("backHome")}
        </Link>
      </Magnetic>
    </div>
  );
}
