import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy WordPress URLs → new structure (permanent, SEO-preserving)
      { source: "/about-us", destination: "/en/about", permanent: true },
      { source: "/contact-us", destination: "/en/contact", permanent: true },
      /*
        The report pages were served from the site root, not from /projects/.
        Verified against the live WordPress site before cutover: /market-reports
        and /insect-proteins both returned real pages. The /projects/ entries
        below are kept in case those paths were ever live earlier; an
        unmatched redirect costs nothing, a missing one costs the ranking.
      */
      { source: "/market-reports", destination: "/en/reports", permanent: true },
      { source: "/insect-proteins", destination: "/en/reports/insect-proteins", permanent: true },
      { source: "/vegan-palatants", destination: "/en/reports/vegan-palatants", permanent: true },
      { source: "/vegan-petfood", destination: "/en/reports/vegan-petfood", permanent: true },
      { source: "/petcare-market", destination: "/en/reports/petcare-market", permanent: true },
      { source: "/projects/market-reports", destination: "/en/reports", permanent: true },
      {
        source: "/projects/insect-proteins-market-report",
        destination: "/en/reports/insect-proteins",
        permanent: true,
      },
      { source: "/projects/vegan-palatants", destination: "/en/reports/vegan-palatants", permanent: true },
      { source: "/projects/vegan-petfood", destination: "/en/reports/vegan-petfood", permanent: true },
      { source: "/projects/petcare-market", destination: "/en/reports/petcare-market", permanent: true },
      {
        source: "/petfood-palatability-in-the-age-of-alternative-proteins",
        destination: "/en/blog/petfood-palatability-alternative-proteins",
        permanent: true,
      },
      {
        source: "/the-curtains-have-fallen-on-the-fifa-world-cup-lessons-for-alt-prot",
        destination: "/en/blog/fifa-world-cup-lessons-alt-prot",
        permanent: true,
      },
      { source: "/elementor-1739", destination: "/en/blog/interzoo-2026-learnings", permanent: true },
      {
        source: "/alternative-protein-industry-failures",
        destination: "/en/blog/alternative-protein-industry-failures",
        permanent: true,
      },
      {
        source: "/presentation-at-republica-2025-in-berlin-on-diaspora-remittances",
        destination: "/en/blog/republica-2025-diaspora-remittances",
        permanent: true,
      },
      /*
        Old posts lived under /blog/<slug>, not at the root. Slugs that survived
        the migration are handled by the catch-all below; the ones that were
        renamed need naming here, and must come first because the first match
        wins. Only one renamed slug is confirmed: the old site's own share
        buttons pointed at .../blog/alternative-protein-industry-failures-2026.
        If more turn up in Search Console as 404s, add them here.
      */
      {
        source: "/blog/alternative-protein-industry-failures-2026",
        destination: "/en/blog/alternative-protein-industry-failures",
        permanent: true,
      },
      { source: "/blog/page/:num*", destination: "/en/blog", permanent: true },
      { source: "/blog/:slug", destination: "/en/blog/:slug", permanent: true },

      /*
        Pages from the earlier version of the site, recovered from the Internet
        Archive's copy of the old sitemap. Each goes to the nearest equivalent
        rather than the homepage, so an old link still lands somewhere useful.
      */
      { source: "/our-products-services", destination: "/en/expertise", permanent: true },
      { source: "/what-do-you-know-about-proteins", destination: "/en/expertise", permanent: true },
      { source: "/insects-in-a-circular-economy", destination: "/en/expertise", permanent: true },
      { source: "/starch", destination: "/en/expertise", permanent: true },
      { source: "/request-meeting", destination: "/en/contact", permanent: true },
      { source: "/projects", destination: "/en/reports", permanent: true },

      // Legacy WordPress taxonomies and feeds → blog
      { source: "/tag/:path*", destination: "/en/blog", permanent: true },
      { source: "/category/:path*", destination: "/en/blog", permanent: true },
      { source: "/author/:path*", destination: "/en/blog", permanent: true },
      { source: "/feed", destination: "/en/blog", permanent: true },
      { source: "/comments/feed", destination: "/en/blog", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
