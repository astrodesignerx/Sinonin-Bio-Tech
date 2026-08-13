import Image from "next/image";
import { useTranslations } from "next-intl";

const SUPPORTERS = [
  { key: "bmwk", name: "Bundesministerium für Wirtschaft und Klimaschutz (BMWK)", url: "https://www.bmwk.de/", width: 191, height: 64 },
  { key: "giz", name: "Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)", url: "https://www.giz.de/", width: 323, height: 64 },
  { key: "euipo", name: "European Union Intellectual Property Office (EUIPO)", url: "https://euipo.europa.eu/", width: 354, height: 64 },
  { key: "bic", name: "Bio-based Industries Consortium (BIC)", url: "https://biconsortium.eu/", width: 497, height: 64 },
  { key: "balpro", name: "BALPro", url: "https://balpro.eu/", width: 261, height: 64 },
  { key: "futurepp", name: "Future of Protein Production", url: "https://www.futureofproteinproduction.com/", width: 191, height: 64 },
  { key: "kibois", name: "Kibois Breeders", url: "https://kibois.co.ke/", width: 260, height: 64 },
] as const;

export default function Supporters() {
  const t = useTranslations("home");

  // Paper with rules, not a mist band: this now sits directly above the mist
  // stories section, and two tinted bands in a row would read as one block.
  return (
    <section className="border-y border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <p className="shrink-0 text-sm font-semibold text-ink">
          {t("supportersTitle")}
        </p>
        <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:flex lg:flex-nowrap lg:justify-start">
          {SUPPORTERS.map((s) => (
            <li key={s.key}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="inline-block transition"
              >
                <Image
                  src={`/images/supporters/${s.key}.png`}
                  alt={s.name}
                  width={s.width}
                  height={s.height}
                  sizes={`${s.width}px`}
                  className="h-9 w-auto grayscale transition duration-200 ease-out-soft hover:grayscale-0 sm:h-10"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}