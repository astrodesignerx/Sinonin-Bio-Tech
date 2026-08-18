import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import PageHeader from "@/components/ui/page-header";
import { getLegalDoc } from "@/lib/legal";
import PostBody from "@/components/blog/portable-text";
import type { PortableTextBlock } from "@portabletext/react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.privacy" });
  return seoMetadata({ locale, path: "/privacy", title: t("title"), description: t("description") });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getLegalDoc("privacy", locale);

  return <LegalContent content={content} />;
}

function LegalContent({ content }: { content: PortableTextBlock[] | null }) {
  const t = useTranslations("footer");

  return (
    <>
      <PageHeader title={t("privacy")} />
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-24">
        {content && <PostBody value={content} />}
      </div>
    </>
  );
}
