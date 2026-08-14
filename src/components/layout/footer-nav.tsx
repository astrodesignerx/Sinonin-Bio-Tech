"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";

type Href = ComponentProps<typeof Link>["href"];

/*
  A footer link list that knows which page you are on.

  Client-only for one reason: the current route. Everything else here is static,
  so the labels arrive already translated from the server rather than pulling
  the message catalogue across the boundary for six words.

  Active and hover share the same green instead of the active state getting a
  louder treatment of its own. In a footer the list is a map, not a control:
  hover says "this is what you are pointing at", current says "this is where
  you are", and both are the same kind of statement. `aria-current` is what
  carries the difference to anyone who cannot see the colour.
*/
export default function FooterNav({
  label,
  items,
}: {
  label: string;
  items: readonly { href: Href; label: string }[];
}) {
  const pathname = usePathname();

  const isActive = (href: Href) =>
    typeof href === "string" &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label={label}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-paper/60">
        {label}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={String(item.href)}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition hover:text-leaf-on-dark ${
                  active ? "text-leaf-on-dark" : "text-paper/75"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
