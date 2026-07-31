import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy WordPress URLs → new structure (permanent, SEO-preserving)
      { source: "/about-us", destination: "/en/about", permanent: true },
      { source: "/contact-us", destination: "/en/contact", permanent: true },
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
      // Legacy WordPress taxonomies → blog
      { source: "/tag/:path*", destination: "/en/blog", permanent: true },
      { source: "/category/:path*", destination: "/en/blog", permanent: true },
      { source: "/author/:path*", destination: "/en/blog", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
