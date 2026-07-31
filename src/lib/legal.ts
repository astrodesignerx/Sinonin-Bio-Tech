import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/blog/mdx-components";

const LEGAL_DIR = path.join(process.cwd(), "src/content/legal");

export async function getLegalDoc(doc: "impressum" | "privacy", locale: string) {
  const source = fs.readFileSync(path.join(LEGAL_DIR, `${doc}.${locale}.mdx`), "utf8");
  const { content } = await compileMDX({ source, components: mdxComponents });
  return content;
}
