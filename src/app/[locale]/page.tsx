import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/hero";
import Supporters from "@/components/home/supporters";
import Pillars from "@/components/home/pillars";
import ProteinSecurity from "@/components/home/protein-security";
import Reports from "@/components/home/reports";
import Training from "@/components/home/training";
import InsectStories from "@/components/home/insect-stories";
import Founder from "@/components/home/founder";
import LatestBlog from "@/components/home/latest-blog";
import CtaBand from "@/components/ui/cta-band";
import { getReports } from "@/lib/reports";
import { getAllPosts } from "@/lib/blog";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const reports = await getReports(locale);
  // Newest three, same source as the blog index, so the cards stay current.
  const posts = (await getAllPosts(locale)).slice(0, 3);

  return (
    <>
      <Hero />
      <Pillars />
      <ProteinSecurity />
      <Reports reports={reports} />
      <Training />
      <Founder />
      <Supporters />
      <InsectStories />
      <LatestBlog posts={posts} />
      <CtaBand title={t("closeCtaTitle")} body={t("closeCtaBody")} />
    </>
  );
}
