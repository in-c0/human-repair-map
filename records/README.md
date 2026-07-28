# records/ — the canonical data

**This directory is the only source of truth.** The website, the MCP server, the
simulator and the visualisations are all generated from it. Nothing else may be
edited by hand.

```
records/
  rubrics.json                 the ladders and legends every record is graded against
  schema/record.schema.json    what a valid record must contain
  capabilities/*.json          the five enabling capabilities
  cns-delivery/*.json          one file per delivery route
```

## Why one file per record

So that two people can change two records without touching the same file. A
single big JSON serialises every contribution through merge conflicts; per-record
files let review happen in parallel, which is the only way this scales past one
maintainer.

## Changing a record

1. Edit the one file.
2. Run `node scripts/build.mjs` — it validates against the schema and regenerates
   `content/records.js` and `mcp/src/generated.js`.
3. Commit **both** the record and the regenerated files.

CI re-runs the build and fails if the generated output differs from what you
committed, so the site and the API cannot drift from the data again. That failure
mode was real: on 2026-07-27 the website said Brineura was disputed while the MCP
server was still telling AI agents it was independently replicated, because the
records lived in three hand-maintained copies.

## Adding a record

Copy the closest existing file, change the `id` (it must match the filename), and
fill in every required field. A record with no `citations` will fail validation —
that is deliberate.

## Fields that carry the integrity of the map

- `rung` — how far it has been shown, L0–L5. See `rubrics.json`.
- `grounding` — how the claim is anchored, G0–G4.
- `measured` — whether it changed **a life**, **a biomarker**, or nothing yet.
- `replication` — prose, and it must say plainly when replication does *not* hold.
- `review` — `ai-proposed` until a human opens the sources. Only a human may set
  `reviewed`.
- `drift` — the distance between what was demonstrated and what is commonly
  claimed. This is the field the map exists for.
