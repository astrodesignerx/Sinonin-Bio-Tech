import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import CellsCanvas from "@/components/home/cells-canvas";
import FooterWordmark from "./footer-wordmark";
import FooterNav from "./footer-nav";

const EXPLORE_ITEMS = [
  { key: "expertise", href: "/expertise" },
  { key: "training", href: "/training" },
  { key: "reports", href: "/reports" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

const SOCIALS = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/sinoninbiotech/",
    Icon: LinkedinLogo,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@SinoninBiotech",
    Icon: YoutubeLogo,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/SinoninBiotech",
    Icon: FacebookLogo,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/sinoninbiotech/",
    Icon: InstagramLogo,
  },
  {
    name: "X",
    href: "https://www.twitter.com/SinoninBiotech",
    Icon: XLogo,
  },
] as const;

export default function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="relative isolate overflow-hidden bg-forest text-paper">
      {/* Full-bleed brand band: the site's closing mark. */}
      <div aria-hidden="true" className="gradient-breathe h-[3px] w-full brand-gradient" />

      {/*
        The hero's cell backdrop, brought down here at a fraction of its
        strength so the page opens and closes on the same texture.

        Retuned rather than reused: the hero's palette is paper on mist, which
        on `forest` would be a bright rash across the whole footer. These are
        three near-neighbours of the footer's own green, so the pattern reads
        as the surface having a grain rather than as a second image behind the
        text. Larger cells too, because at this size the hero's density would
        turn to noise behind small type.

        It runs past the resting edge by the full travel of the elastic pull,
        and its bottom walks up in step with the footer growing. Those two
        together keep its height constant through the drag, so the texture
        neither stretches with the stretch nor runs out before the edge: the
        pull uncovers more of the same pattern at the same scale. Constant
        height also means the canvas is never resized mid-drag, so it is not
        reallocating a drawing buffer sixty times a second either.

        With no script running (coarse pointer, or reduced motion) both
        properties are unset and this falls back to a plain `inset-0`.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-30"
        style={{ bottom: "calc(var(--wm-pull, 0px) - var(--wm-max, 0px))" }}
      >
        <CellsCanvas base="#0a2a1a" alt="#0d3421" edge="#1d5c3c" scale={2.6} />
      </div>

      {/* `pt` only: any bottom padding here would sit under the wordmark and
          stop the page edge from being what cuts it. */}
      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">
                <Image
                  src="/brand/logo.png"
                  alt="Sinonin Biotech"
                  width={28}
                  height={28}
                  className="h-7 w-auto"
                />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Sinonin Biotech
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70">
              {t("tagline")}
            </p>
            <div className="mt-6 flex items-center gap-2" aria-label={t("followUs")}>
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-paper/70 transition motion-press hover:border-white/40 hover:text-paper active:translate-y-px"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <FooterNav
            label={t("explore")}
            items={EXPLORE_ITEMS.map((item) => ({
              href: item.href,
              label: nav(item.key),
            }))}
          />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-paper/60">
              {t("contactTitle")}
            </h2>
            <a
              href={`mailto:${t("email")}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-paper/75 transition motion-press hover:text-leaf-on-dark"
            >
              <EnvelopeSimple size={15} />
              {t("email")}
            </a>
              <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-paper/60">
                {t("hoursTitle")}
              </span>
            <p className="mt-2 text-sm text-paper/75">{t("hoursDays")}</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-paper transition motion-press hover:border-white/50 active:translate-y-px"
            >
              {nav("cta")}
            </Link>
          </div>

          <FooterNav
            label={t("legalTitle")}
            items={[
              { href: "/impressum", label: t("impressum") },
              { href: "/privacy", label: t("privacy") },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/*
            paper/65, not /50. At /50 this line was already the thinnest
            contrast on the site at 4.70:1, and the cell texture behind it
            takes that to 4.25:1, under the 4.5:1 floor for text this size.
            Raising the one line that was close to the edge costs nothing and
            keeps the texture.
          */}
          <p className="text-xs text-paper/65">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
            {t("specialties")}
          </p>
        </div>

        {/*
          Closing wordmark, filling the content width and running off the
          bottom of the page.

          The crop is a negative margin that trims the line box to the point
          three quarters of the way down the letterforms; the footer's own
          `overflow-hidden` clips whatever then sits below the edge. Measured
          from the font rather than eyeballed: with line-height 1 the baseline
          sits 0.845em down the box, ink runs 0.125em to 0.865em, so the
          three-quarter line is 0.68em and the remaining 0.32em is what gets
          pulled off the bottom.

          Its own component because the edge is elastic, and that needs to run
          on the client.
        */}
        <FooterWordmark />
      </div>
    </footer>
  );
}
