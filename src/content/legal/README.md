# These files are no longer the website's content

The imprint and privacy policy moved to Sanity. Nothing in this folder is read
at build time or at runtime, and editing a file here changes nothing on the
live site. It fails silently, which is why this note exists.

The live pages are `legalDoc` documents in Sanity, one per page per language.
Edit them in the Studio at <https://sinoninbio.tech/studio>, or read them in
code through `src/lib/legal.ts`.

These MDX files are kept as the record of what was migrated, and as the input
to `scripts/migrate-copy-to-sanity.mjs` if the migration ever needs re-running
against a fresh dataset. They are a snapshot as it stood at migration, not a
mirror.

Worth being deliberate here: these two pages carry legal weight in Germany, so
the version that matters is the one in Sanity, not the one in this folder.
