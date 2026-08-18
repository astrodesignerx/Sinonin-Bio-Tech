import type { SchemaTypeDefinition } from "sanity";
import { blockContent } from "./block-content";
import { legalDoc } from "./legal-doc";
import { post } from "./post";
import { report } from "./report";
import { siteSettings } from "./site-settings";

/* Every type the Studio knows about. */
export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  report,
  legalDoc,
  siteSettings,
  blockContent,
];
