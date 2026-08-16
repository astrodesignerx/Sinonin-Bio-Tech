import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

/*
  The last-resort 404.

  Next reaches for this one whenever a URL matches no route at all — a typo, a
  dead link, an old bookmark. `/en/tarining` lands here, not at the locale 404,
  because nothing under `[locale]` matches it; so does `/logo.png`, which the
  proxy's matcher skips for having an extension.

  `app/[locale]/not-found.tsx` is the other half, and the two are easy to mix
  up: that one renders when a route *does* match and its page calls
  `notFound()` — an unknown blog or report slug. It has a locale and a layout
  around it, so it gets the header, the footer and the right language. This one
  has neither.

  It renders its own `<html>` and `<body>` because the root layout is a
  pass-through: the real document shell lives in the locale layout, and nothing
  on this path has run it. Without these tags Next throws "Missing <html> and
  <body> tags in the root layout" and the visitor meets a crash overlay instead
  of a 404.

  Deliberately plain by comparison. There is no locale to translate against and
  no request context to read one from, so the copy is English. No header or
  footer either: both are built from translated navigation this page cannot
  ask for.
*/

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
  No `metadata` export: Next ignores one on `not-found`, so the title here is
  whatever the app resolves by default. It already sends `noindex` on any 404
  of its own accord, which is the part that actually matters.
*/
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {/*
          Centred in the whole viewport, not `100svh - header`: there is no
          header on this page to subtract.
        */}
        <div className="mx-auto flex min-h-dvh max-w-7xl flex-col justify-center px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          {/*
            Same numeral treatment as the locale 404 — display size from the
            footer wordmark, brand gradient sweeping across the glyphs, and
            `aria-hidden` because the heading below says it in words.
          */}
          <div className="wordmark-box">
            <p
              aria-hidden="true"
              className="wordmark-fill wordmark-sweep brand-gradient block select-none bg-clip-text font-display font-bold leading-none tracking-tighter text-transparent [-webkit-background-clip:text]"
            >
              404
            </p>
          </div>
          <h1 className="mt-6 heading-page">Page not found</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            The page you are looking for does not exist or has moved.
          </p>
          <div className="mt-8">
            {/*
              A real anchor, and a full page load on purpose — which is why the
              Next lint rule is silenced here rather than obeyed.

              `next/link` renders and prefetches fine, but clicking it does
              nothing: this page lives in the router's error tree, and a
              client-side navigation out of it never commits. Tested both ways
              — the anchor leaves the tree and lands on the homepage, the
              `Link` leaves the visitor sitting on the 404.

              `/` rather than `/en`: the proxy reads the visitor's language and
              redirects, so a German speaker is not sent to the English site by
              the one button on the page.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex items-center rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px"
            >
              Back to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
