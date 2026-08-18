import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Post covers and in-body figures are served by Sanity's image CDN now,
    // so next/image has to be told the host is allowed.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
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
        The three palatability posts below were migrated under shorter slugs.
        They are the newest and most linked writing on the old site, so these
        three matter more than anything else in this list.

        The full old URL set was recovered after cutover by reading the old
        WordPress sitemaps straight off the Bluehost origin (67.222.38.76) with
        a Host header, since DNS had already moved. If the old hosting is ever
        cancelled, that recovery route disappears with it.
      */
      {
        source: "/petfood-palatability-why-replacing-meat-is-more-than-replacing-protein",
        destination: "/en/blog/petfood-palatability-replacing-meat",
        permanent: true,
      },
      {
        source: "/petfood-palatability-and-the-fresh-kill-signal-cats-read-as-prey",
        destination: "/en/blog/petfood-palatability-fresh-kill-signal",
        permanent: true,
      },
      {
        source: "/petfood-palatability-why-fat-is-the-signal-alternative-proteins-forget",
        destination: "/en/blog/petfood-palatability-fat-is-the-signal",
        permanent: true,
      },

      /*
        The remaining old posts, recovered from the WordPress REST API on the
        Bluehost origin after cutover and rewritten as MDX. Each now points at
        its own migrated page rather than at the blog index.
      */
      {
        source: "/global-protein-demand-pressure-from-a-healthy-and-wealthy-population-that-continues-to-grow",
        destination: "/en/blog/global-protein-demand",
        permanent: true,
      },
      {
        source:
          "/fermentation-or-pharmentation-a-proposal-to-disambiguate-carbohydrate-metabolism-vs-protein-production-using-precision-technology",
        destination: "/en/blog/fermentation-or-pharmentation",
        permanent: true,
      },
      {
        source: "/why-are-insects-considered-sustainable-a-protein-production-inputs-resource-justification",
        destination: "/en/blog/why-insects-are-sustainable",
        permanent: true,
      },
      { source: "/insects-used-in-aquafeed", destination: "/en/blog/insects-in-aquafeed", permanent: true },
      { source: "/approval-of-fourth-insect-as-a-novel-food-by-the-eu", destination: "/en/blog/eu-fourth-novel-food-insect", permanent: true },
      {
        source: "/our-ceo-interview-with-the-future-of-protein-summit-organiser-nick-bradley",
        destination: "/en/blog/future-of-protein-summit-interview",
        permanent: true,
      },
      { source: "/elementor-1646", destination: "/en/blog/widu-africa-visit", permanent: true },
      { source: "/zestproject-executive-board-virtual-meeting", destination: "/en/blog/zest-executive-board-meeting", permanent: true },
      { source: "/zestproject-official-launch", destination: "/en/blog/zest-project-launch", permanent: true },
      { source: "/interview-10-questions-for-sinonin-biotech-by-zest", destination: "/en/blog/zest-interview-ten-questions", permanent: true },
      {
        source: "/honoured-at-the-inaugural-jamhuri-diaspora-awards-ceremony-2024",
        destination: "/en/blog/jamhuri-diaspora-awards-2024",
        permanent: true,
      },

      /*
        The old site also answered on /blog/<slug> for some posts: its own share
        buttons pointed at .../blog/alternative-protein-industry-failures-2026.
        Keep both shapes. The renamed one must precede the catch-all, because
        the first matching rule wins.
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
      { source: "/insects-in-a-circular-economy", destination: "/en/blog/insects-in-a-circular-economy", permanent: true },
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
