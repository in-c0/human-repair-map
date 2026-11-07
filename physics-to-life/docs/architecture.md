# Architecture

## Principles

1. **Mechanistic simulators are teachers, constraints, evidence generators, adjudicators and
   fallbacks — not the master loop.** The master loop is: infer state → predict with
   uncertainty → decide what to compute → compute → update.
2. **Every important output exposes uncertainty** (predictive, model, numerical,
   parameter, initial-state, coupling), and every claim about a decision is scored against
   hidden ground truth where a virtual world makes that possible.
3. **No fashionable architecture by default.** Components are chosen by the experimental
   requirement; the simplest estimator that can be scored is used first (V0 uses a
   bootstrap MLP ensemble on hand-derived per-node features; a GNN or state-space model is
   introduced only when a rung requires it).
4. **Constraints are monitored, not assumed** (bounds, positivity, conservation where it
   exists, invariants of the fast subsystem).
5. **Costs are total and honest.** Every base simulation a controller needs for its
   features, every intermediate run of a sequential controller, and every adjoint solve is
   charged. Wall-clock is reported alongside nominal cost.

## Components (package map)

| package | role | V0 realisation |
|---|---|---|
| `state/` | system specifications, interventions, structural scaffold | slow-fast network generator; interventions (pulse, step, multi, negative); ancestor sets, influence, distances |
| `models/` | fidelity hierarchy and simulators | per-node fidelity 0/1/2 mixed integrator with sub-cycling; independent Radau reference |
| `inference/` | learned components producing probabilities with model uncertainty | bootstrap ensemble (MLP or GBM) → mean, disagreement |
| `uncertainty/` | calibration and uncertainty metrics | reliability, ECE, Brier |
| `routing/` | features + refinement policies (comparison conditions) | uniform, random, spatial, physics heuristic, adjoint heuristic, learned one-shot/sequential, oracles |
| `constraints/` | invariants monitored per simulation | finiteness, y and x bounds |
| `experiments/` | episode generation with hidden-ground-truth labels | minimal refinement set search, per-node gains, partial-state features |
| `evaluation/` | metrics, frontiers, figures, provenance, verdicts | Pareto tables, paired-bootstrap dominance, calibration, OOD, ablations |

## The compute controller

For candidate action a (V0: "refine node k to fine", or "stop"):

    V(a) = E[reduction in target-relevant uncertainty | a] / Cost(a)

V0 approximates the numerator by an ensemble's probability that k is in the minimal
refinement set plus an uncertainty bonus κ·std (optimism under model disagreement), with
all node costs equal. The sequential controller re-simulates after each refinement so that
cascades revealed by the improved trajectory can be acted on. Later rungs replace the
numerator with a learned value model and extend the action set (coarse model, fine model,
different simulator, MD, QM, literature, measurement).

## Hidden-ground-truth loop (the evaluation architecture)

```
high-fidelity virtual world X*  (reference solver; hidden thresholds)
        ├─ expose partial observations O  (noisy thresholds, scaffold, intervention)
        ▼
router infers which hidden subsystems matter  → chooses computation
        ▼
mixed simulation predicts intervention effect Ŷ
        ▼
compare with Y*  AND  compare chosen set with the minimal refinement set
```

Both prediction correctness and computation-selection correctness (precision, recall,
waste, miss) are first-class metrics.

## Data and provenance

Every run records git commit, branch, dirty flag, configuration, seed, package versions,
platform, CPU count, hostname, runtime, and writes tables and figures in a run directory.
Episode caches are reproducible from seed + config + commit and are not committed.

## Planned evolution

- V1: learned closure (neural residual on the medium model) and compiled surrogate of the
  fast subsystem with OOD detection (H5, H8); mass-action biochemical fast subsystem.
- V2/V3: ion-channel Markov models inside a conductance-based neuron; SBI for hidden
  channel parameters (H7 full form); Jaxley/NEURON as external reference simulators (H6).
- V4/V5: small circuits; Drosophila circuits with withheld perturbation outcomes.
- Inverse design: policy search on virtual damaged states once the forward model is
  reliable (H10).
