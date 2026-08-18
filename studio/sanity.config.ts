import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./env";
import { schemaTypes } from "./schemaTypes";

/*
  The Studio, as its own application.

  It lived inside the Next app first, at /studio. That worked in production but
  made local development unusable: Turbopack spent thirteen minutes and five
  gigabytes on the route without ever serving it, and webpack needed ninety
  seconds a compile. Standalone, the Studio builds with Vite and the website
  keeps Turbopack, because neither one's bundler has to swallow the other.

  The cost is a second address. `sanity deploy` publishes to a sanity.studio
  subdomain, and the website redirects /studio there so the client still only
  has to remember their own domain.
*/
export default defineConfig({
  name: "sinonin-biotech",
  title: "Sinonin Biotech",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    // Query playground. It reads with the signed-in user's own permissions,
    // so leaving it enabled grants nothing they did not already have.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
