import type { PortableTextBlock } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { legalDocQuery } from "@/sanity/lib/queries";

/*
  The imprint and the privacy policy.

  Returns the body as data rather than rendered markup, the same way the blog
  does, because a .ts module cannot construct components. The pages render it
  with components/blog/portable-text.tsx.

  German falls back to English if a translation is missing. That is the wrong
  answer for a legal page in Germany, but a wrong language beats a blank page,
  and both translations exist today.
*/
export async function getLegalDoc(
  doc: "impressum" | "privacy",
  locale: string,
): Promise<PortableTextBlock[] | null> {
  const docs = await client.fetch<{ language: string; body: PortableTextBlock[] }[]>(
    legalDocQuery,
    { docType: doc },
  );

  const match =
    docs.find((d) => d.language === locale) ?? docs.find((d) => d.language === "en");
  return match?.body ?? null;
}
