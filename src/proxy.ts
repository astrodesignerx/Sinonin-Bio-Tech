import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, /studio, Next internals, and files with an extension.
  // The Studio is a separate application on a sanity.studio subdomain; /studio
  // is reserved for the redirect that sends the client there. Without it here,
  // next-intl claims the path first and rewrites it to /en/studio.
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};
