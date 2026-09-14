# ADR-0004 — Adaptive policies refine on top of the medium (quasi-static) closure

Date: 2026-09-14 · Status: accepted

## Context
Sanity runs showed the constant (coarse) closure is wrong even without any switching
(sub-threshold modulation of the fast variable is comparable to network coupling), while
the quasi-static closure is essentially exact until a node switches. Routing between
coarse and fine would mostly measure the coarse model's sub-threshold bias, not the
interesting question of where switching physics is needed.

## Decision
Adaptive policies choose per node between medium (default) and fine. Coarse remains
condition A for the uniform comparison. Whether the adaptive benefit depends on the
quality of the cheap default is a follow-up ablation (`base_level: 0`).

## Consequences
- The "interesting" error is the switching error; the routing problem is "predict which
  switches matter".
- Three-level per-node routing (coarse/medium/fine) is a later extension.
