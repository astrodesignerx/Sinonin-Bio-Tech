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
    <footer className="bg-forest text-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-paper/70 transition hover:border-white/40 hover:text-paper active:translate-y-px"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label={t("explore")}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-paper/60">
              {t("explore")}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm text-paper/75 transition hover:text-paper"
                  >
                    {nav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-paper/60">
              {t("contactTitle")}
            </h2>
            <a
              href={`mailto:${t("email")}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-paper/75 transition hover:text-paper"
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
              className="mt-6 inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-paper transition hover:border-white/50 active:translate-y-px"
            >
              {nav("cta")}
            </Link>
          </div>

          <nav aria-label={t("legalTitle")}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-paper/60">
              {t("legalTitle")}
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-paper/75 transition hover:text-paper"
                >
                  {t("impressum")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-paper/75 transition hover:text-paper"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-paper/50">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
            {t("specialties")}
          </p>
        </div>
      </div>
    </footer>
  );
}
