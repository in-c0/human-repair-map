# ADR-0006 — Main V1 is the Drosophila ion-channel → membrane bridge; the synthetic enzymatic cascade becomes supporting benchmark V1a

Date: 2026-09-14 · Status: accepted (owner decision on review of the V0 handoff)

## Context
ADR-0005 proposed a second fully synthetic milestone (QSSA enzymatic cascade). The owner
review judged that another synthetic rung creates too much distance from the actual
objective — predicting and controlling living systems — and that the architecture must
now meet real biological parameterisations. V0's methodological result (adaptivity
requires exploitable error structure; learned selectivity vs written coverage; confident
OOD failure of ensemble spread) is exactly what needs testing outside a generator we
control.

## Decision
1. **V1 = Drosophila voltage-gated ion-channel → membrane bridge**, Shaker-first, using
   published measurements and models wherever possible:
   experimental voltage-clamp observations → rich Markov/kinetic channel model → HH gating
   model → reduced/phenomenological current model, embedded in a Drosophila membrane/neuron
   model (channel state → ionic current → membrane voltage → spiking/response).
2. **Primary V1 question:** can a target-conditioned learned controller determine when a
   reduced Drosophila electrophysiology model is insufficient for predicting an
   intervention, selectively invoke richer channel physics, and outperform uniform
   high-fidelity computation on the accuracy–cost frontier? **Secondary:** can expensive
   channel dynamics be compiled into a reusable learned effective model without silently
   failing on unseen interventions?
3. **Interventions** only with a defensible mechanistic interpretation (protocol change,
   current injection, channel density, Shaker loss/reduction, activation / inactivation /
   recovery rate changes tied to known mutants, extracellular K+, temperature/Q10,
   pharmacological block, combinations), with deliberately OOD families. Arbitrary
   parameter noise is not called a mutation.
4. **Multiple targets** (peak current, time-to-peak, recovery from inactivation, voltage
   trajectory, spike latency, spike count, refractory behaviour, ionic-charge proxy) so
   that "which physics matters" is target-dependent.
5. **Three adjudication levels:** A hidden simulator truth; B an independently formulated
   simulator; C published experimental observations; with fit/hold-out separation of
   protocols and perturbation classes, cross-formulation training/evaluation, and
   parameter-uncertainty sensitivity. "Simulation fidelity" and "biological fidelity" are
   reported as different things.
6. **Routing target becomes continuous:** value of computation
   VoC(a) = E[ΔError(a) | evidence] / cost(a), with interaction effects (marginal,
   pairwise, sequential, Shapley-style where tractable) measured rather than assumed;
   the V0 hard "necessary" label is retained only for comparison.
7. **OOD handling is a first-class experiment:** feature/support-range guard,
   representation-space density/distance, conformal nonconformity (assumptions stated),
   residual/discrepancy monitoring against a sampled mechanistic model, and ensemble
   disagreement as the failed baseline; planted shifts where each should and should not
   work; report OOD AUROC, `false_safe_rate` (confident use of the cheap model when
   expensive physics was necessary — a primary reliability metric), coverage, error
   conditional on "safe", cost of fallback.
8. **Measured compute** alongside nominal cost: CPU time, inference overhead, memory,
   solver calls, fine-model calls, training cost separately from amortised inference;
   single-query and amortised many-query regimes.
9. **H5 and H8 strengthened** (amortised speed-up, preserved intervention accuracy,
   calibrated distrust, successful fallback, unseen intervention classes; hybrid vs
   black-box extrapolation, constraint preservation, validity detection). Try to falsify.
10. **H10 precursor:** the smallest functional-restoration task (damaged model → search
    minimal intervention → restored WT waveform / spike timing / firing response),
    evaluated against the fine simulator, the alternate formulation and held-out
    observations; called functional restoration, never cure.
11. **Preregistration frozen before the main run** (hierarchy, protocol families, OOD
    families, fitting vs evaluation observations, tolerance, cost definitions,
    `false_safe_rate`, H5/H8 falsification criteria, comparison policies, seeds, minimum
    effect sizes, failed-run treatment, cross-model tests, V2 advancement criteria).
    One-shot and sequential routers are separate preregistered conditions.
12. The synthetic enzymatic cascade is **V1a**: integration test, closure benchmark, H5/H8
    unit experiment. Not a graduation rung.

## Consequences
- Execution order: verify/update novelty literature → tighten V0 wording → design V1 →
  identify published datasets/models → reproduce at least one published
  electrophysiology result → establish and numerically validate the hierarchy → freeze
  preregistration → implement VoC and hybrid routers, OOD detector comparison, H5
  compiled surrogate, H8 neural closure → pilot → audit → freeze corrections → main run →
  falsification → functional-restoration task → review package.
- Report back before the main run only if the preregistration reveals a fundamental
  scientific ambiguity.
- The programme's claims about V0 stay conditional ("passed the preregistered V0
  criteria within this synthetic model family").
