import Image from "next/image";
import { useTranslations } from "next-intl";

const SUPPORTERS = [
  { key: "bmwk", name: "Bundesministerium für Wirtschaft und Klimaschutz (BMWK)", width: 191, height: 64 },
  { key: "giz", name: "Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)", width: 323, height: 64 },
  { key: "euipo", name: "European Union Intellectual Property Office (EUIPO)", width: 354, height: 64 },
  { key: "bic", name: "Bio-based Industries Consortium (BIC)", width: 497, height: 64 },
  { key: "balpro", name: "BALPro", width: 261, height: 64 },
  { key: "futurepp", name: "Future of Protein Production", width: 191, height: 64 },
  { key: "kibois", name: "Kibois Breeders", width: 260, height: 64 },
] as const;

export default function Supporters() {
  const t = useTranslations("home");

  return (
    <section className="mt-24 border-y border-line sm:mt-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <p className="shrink-0 text-sm font-semibold text-ink-muted">
          {t("supportersTitle")}
        </p>
        <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:flex lg:flex-nowrap lg:justify-start">
          {SUPPORTERS.map((s) => (
            <li key={s.key}>
              <Image
                src={`/images/supporters/${s.key}.png`}
                alt={s.name}
                width={s.width}
                height={s.height}
                sizes={`${s.width}px`}
                className="h-8 w-auto opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-9"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}