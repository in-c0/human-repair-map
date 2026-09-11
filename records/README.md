# records/ — the canonical data

**This directory is the only source of truth.** The website, the MCP server, the
simulator and the visualisations are all generated from it. Nothing else may be
edited by hand.

```
records/
  rubrics.json                 the ladders and legends every record is graded against
  capabilities/*.json          the five v0.1 capabilities (kept; scored, not graded)
  cns-delivery/*.json          one file per CNS delivery route (v0.1) — become hrm:route/* nodes
  cells/*.json                 the v0.2 repairability grid — each becomes hrm:cell/* plus five derived capabilities
  graph/                       the v0.3 graph, one file per record, validated against ../schema/
    goals/  capabilities/  questions/  claims/  experiments/  sources/
```

Schemas live in `../schema/`, the vocabularies in `../ontology/`. A relation is
stored on one side only (see `ontology/relationships.json`); the build derives
the inverse, so two records can never disagree about the same edge.

## Why one file per record

So that two people can change two records without touching the same file. A
single big JSON serialises every contribution through merge conflicts; per-record
files let review happen in parallel, which is the only way this scales past one
maintainer.

## Changing a record

1. Edit the one file.
2. Run `node scripts/build.mjs` — it validates every record, checks references and
   cycles, and regenerates `content/records.js`, `mcp/src/generated.js` and
   `public/graph/*`. Then `node mcp/test.mjs`.
3. Commit **both** the record and the regenerated files.

CI re-runs the build and fails if the generated output differs from what you
committed, so the site and the API cannot drift from the data again. That failure
mode was real: on 2026-07-27 the website said Brineura was disputed while the MCP
server was still telling AI agents it was independently replicated, because the
records lived in three hand-maintained copies.

## Adding a record

Copy the closest existing file, change the `id` (it must match the filename), and
fill in every required field. A claim with no `evidence`, a capability whose grade
has no claim behind it, or a `reviewed` record without a named human all fail
validation — that is deliberate. New sources: add the DOI and run
`node scripts/resolve-sources.mjs --write` so the metadata comes from Crossref,
not from memory.

## Fields that carry the integrity of the map

- `rung` — how far it has been shown, L0–L5. See `rubrics.json`.
- `grounding` — how the claim is anchored, G0–G4.
- `measured` — whether it changed **a life**, **a biomarker**, or nothing yet.
- `replication` — prose, and it must say plainly when replication does *not* hold.
- `review` — `ai-proposed` until a human opens the sources. Only a human may set
  `reviewed`.
- `drift` — the distance between what was demonstrated and what is commonly
  claimed. This is the field the map exists for.
