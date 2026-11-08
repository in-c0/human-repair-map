# ADR-0001 — Physics-to-Life lives as `physics-to-life/` inside the Human Repair Map repository

Date: 2026-09-14 · Status: accepted

## Context
The brief asked for a clean research repository. The session is scoped to
`in-c0/human-repair-map`, whose long-term application (a computational precursor to the
Human Repair Map) is the stated destination of this programme.

## Decision
Create the programme as a self-contained top-level directory `physics-to-life/` with its
own `pyproject.toml`, tests, docs and experiments. The repository's existing Node-based
validation and Cloudflare deploy only touch specific paths, so the Python programme does
not interfere with them.

## Consequences
- The programme can be split into its own repository later by moving one directory.
- The Human Repair Map's `validate` workflow does not test Python; a separate CI job is a
  follow-up (see STATUS.md).
