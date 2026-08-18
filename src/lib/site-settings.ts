import { client } from "@/sanity/lib/client";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import { site } from "@/lib/config";

export type SiteSettings = {
  email: string;
  bookingUrl: string;
};

/*
  The two site-wide values the client can change without a developer.

  Falls back to the literals in lib/config.ts if the singleton is missing or a
  field is blank, so an accidental deletion in the Studio cannot leave the
  contact page without an address.
*/
export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await client.fetch<Partial<SiteSettings> | null>(
    siteSettingsQuery,
  );

  return {
    email: settings?.email || site.email,
    bookingUrl: settings?.bookingUrl || site.bookingUrl,
  };
}
