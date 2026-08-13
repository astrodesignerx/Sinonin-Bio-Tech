/**
 * The multicolour band from the logo, used as an opener mark.
 *
 * This is the site's one piece of full-spectrum colour, so it stays
 * structural rather than decorative: it marks where something *begins*, a
 * page, a section, the active nav item, the footer, and appears at most once
 * per surface. Adding it to cards or repeating it within a grid is what made
 * it read as noise rather than signature.
 */
export default function BrandRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[3px] w-16 rounded-full brand-gradient ${className}`}
    />
  );
}
