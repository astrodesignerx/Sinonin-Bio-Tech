/*
  Sanity connection values, read once and validated here.

  Project ID and dataset are public by design: they ship in the browser bundle
  because the embedded Studio runs client-side and needs them. The write token
  is deliberately absent from this file, so nothing that imports it can leak a
  secret into the client.

  `apiVersion` is a date, not a semver. Sanity treats it as "behave as the API
  did on this day", so pinning it means a future API change cannot silently
  alter query results. Bump it deliberately, never automatically.
*/
export const apiVersion = "2026-05-04";

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy it from sanity.io/manage into .env.local.`,
    );
  }
  return value;
}

export const projectId = required(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset = required(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET",
);
