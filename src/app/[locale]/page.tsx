import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/hero";
import Supporters from "@/components/home/supporters";
import Pillars from "@/components/home/pillars";
import ProteinSecurity from "@/components/home/protein-security";
import Reports from "@/components/home/reports";
import Training from "@/components/home/training";
import Founder from "@/components/home/founder";
import LatestBlog from "@/components/home/latest-blog";
import CtaBand from "@/components/ui/cta-band";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <>
      <Hero />
      <Supporters />
      <Pillars />
      <ProteinSecurity />
      <Reports />
      <Training />
      <Founder />
      <LatestBlog />
      <CtaBand title={t("closeCtaTitle")} body={t("closeCtaBody")} />
    </>
  );
}
