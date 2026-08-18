# These files are no longer the website's content

The blog moved to Sanity. Nothing in this folder is read at build time or at
runtime, and editing a file here changes nothing on the live site. It fails
silently, which is why this note exists.

The live articles are documents in Sanity. Edit them in the Studio at
<https://sinoninbio.tech/studio>, or read them in code through
`src/lib/blog.ts`.

These MDX files are kept as the record of what was migrated, and as the input
to `scripts/migrate-to-sanity.mjs` if the migration ever needs re-running
against a fresh dataset. They are a snapshot of the content as it stood at
migration, not a mirror of it: every edit made in the Studio since then makes
them more out of date.

Safe to delete once you no longer want that record. Git keeps the history
either way.
