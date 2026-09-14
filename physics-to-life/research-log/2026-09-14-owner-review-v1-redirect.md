# 2026-09-14 — Owner review of the V0 handoff; V1 redirected to Drosophila channel/membrane

## What the review said (summary; PR #37 comments to the agent)
- V0 accepted as a methodological scaffold. Its hypotheses are **not** broadly established:
  they "passed the preregistered V0 criteria within this synthetic model family", under
  sparse, causally concentrated closure error.
- The constant-closure negative result is a **central** finding: adaptive fidelity is
  useful only when approximation error has exploitable structure. Elevate it.
- The 79 % "no refinement required" figure is a generator property, not biology.
- Novelty must be narrowed: MuMMI and LED/AdaLED/iLED/G-LED already provide ML-driven
  dynamic multiscale coupling, adaptive surrogate/solver alternation, uncertainty-triggered
  fallback and learned closure. The candidate novelty is the conjunction of
  target-conditioned causal relevance, selection correctness, value of computation,
  cross-scale intervention prediction, inverse design, and the validation progression.
  Search for that conjunction adversarially before defending it.
- The synthetic enzymatic cascade is not the main V1 (too far from the objective); keep
  it as supporting benchmark V1a. Main V1: Drosophila ion-channel → membrane bridge,
  Shaker-first, published parameters, three adjudication levels, multiple targets,
  mechanistically interpretable interventions, continuous VoC routing target, OOD detection
  as a first-class experiment with `false_safe_rate`, measured compute, strengthened H5/H8,
  a minimal functional-restoration inverse task, and a frozen preregistration before the
  main run. Separate one-shot and sequential conditions statistically.
- Do not merge PR #37 merely to move quickly; update novelty, wording, ADRs and the
  preregistration first, keep CI green, report back only on fundamental ambiguity.

## Actions taken today
1. Two scans launched: adversarial novelty search against the six-part conjunction with
   verified comparator sources (`docs/literature/novelty_conjunction_scan.md`), and a
   Drosophila Shaker/channel electrophysiology resource scan targeting reusable published
   models (ModelDB code mirrored on GitHub) and held-out measurements
   (`docs/literature/drosophila_channel_electrophysiology.md`).
2. V0 wording tightened in `STATUS.md`, `docs/hypotheses.md` (status vocabulary changed
   to `Vn-passed`), `RESULTS.md` (§0 added), `README.md`, paper outlines, roadmap.
3. ADR-0005 amended; ADR-0006 written; validation ladder and vision updated; the
   biochemical outline renamed to V1a.

## Next
Design the V1 hierarchy from the resource scan, reproduce a published result, validate
each level numerically, then freeze the preregistration.
