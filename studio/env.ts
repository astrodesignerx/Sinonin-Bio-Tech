/*
  Connection values for the Studio.

  Written as literals rather than read from a .env file on purpose. Neither is
  a secret: both ship inside the deployed Studio bundle and are visible to
  anyone who opens it. Hardcoding them means `sanity deploy` works from a fresh
  checkout with no setup step, and the repo's blanket `.env*` gitignore rule
  cannot silently strip them.

  The website reads the same two values from .env.local, because Next needs
  them at build time in an environment the CLI never sees.
*/
export const projectId = "8kpnyqu2";
export const dataset = "production";
export const apiVersion = "2026-05-04";
