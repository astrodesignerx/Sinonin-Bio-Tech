import { revalidatePath } from "next/cache";
import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";

/*
  Sanity calls this when a document is published, so the client sees their edit
  on the live site in seconds rather than waiting for a redeploy.

  The signature is verified rather than trusted: the endpoint is public, and
  without the check anyone could force endless rebuilds. The shared secret is
  set in both sanity.io/manage (on the webhook) and the deployment's
  environment as SANITY_REVALIDATE_SECRET.

  The raw body text is read before parsing, because the signature covers the
  exact bytes Sanity sent. Re-serialising parsed JSON would change whitespace
  and key order and never match.

  Everything is revalidated rather than only the changed page. The site is 71
  pages, a post shows up in four places (its own page, the blog index, the home
  page and the header's menu), and a report in five. Enumerating those invites
  the bug where an edit appears in one place and not another, and the cost of
  being thorough is a few seconds of regeneration.
*/
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) {
    return Response.json({ message: "Missing signature" }, { status: 401 });
  }

  const payload = await request.text();
  if (!(await isValidSignature(payload, signature, secret))) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } } = {};
  try {
    body = JSON.parse(payload);
  } catch {
    // A valid signature over unparseable JSON still means Sanity called us, so
    // revalidate anyway rather than ignoring a real content change.
  }

  revalidatePath("/", "layout");

  return Response.json({
    revalidated: true,
    type: body._type ?? "unknown",
    slug: body.slug?.current ?? null,
    now: Date.now(),
  });
}
