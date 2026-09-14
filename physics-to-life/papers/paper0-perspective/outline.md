# Paper 0 — Physics-to-Life: Learning the Physical Resolution Required to Predict and Repair Living Systems

**Proposition (v3, after the adversarial conjunction scan, 2026-09-14):** Physics-to-Life
is a target-conditioned framework for deciding which unresolved physical degrees of freedom
are worth computing for a *requested intervention outcome* in biological systems where no
adjoint is available, with the decision itself scored against hidden ground truth. The
only element without located precedent is hidden-ground-truth scoring of
computation-selection correctness (precision/recall/waste/miss of the refined set) as a
metric distinct from prediction error; everything else is a competitive claim to be won
empirically against goal-oriented model adaptivity (Oden & Vemaganti 2000; van Opstal
2015; Li, Garg & Willcox 2017; learned DWR indicators), novelty-driven selection (MuMMI /
DynIm), uncertainty/error-triggered alternation (LED, AdaLED, FLARE, DP-GEN), cost-aware
learned invocation (HyPER, ICLR 2025), and value-of-information allocators (misoKG,
BMFAL-BC). Functional restoration by model search is prior art (Allam 2021; Moreno 2019;
Pai/Levin 2018) and is claimed only as a downstream use of the same routed world model,
with degeneracy (Prinz 2004; O'Leary 2014) addressed whenever a solution is reported.
Source of record: `docs/literature/novelty_conjunction_scan.md` (verification limited to
GitHub-hosted pages in this environment).

## Abstract (target 200 words; to be written last)
Frame the question (how much physical detail is necessary to predict and control living
systems), the paradigm (learned multiscale world model + value-of-computation controller
with mechanistic simulators as teachers/constraints/fallbacks), the falsifiable
hypotheses, the validation ladder with hidden ground truth, and the first worked example
with its actual outcome. No claims beyond what V0 shows.

## 1. The question
- Uniform high-fidelity simulation of biology is impossible and, we conjecture, unnecessary.
- The unit of the question is a *prediction or intervention*, not a system: fidelity
  requirements are query-dependent and time-dependent.
- Distinguish: spatial refinement (AMR), model refinement (goal-oriented model adaptivity),
  fidelity selection (multi-fidelity BO/MC), and *causal* refinement toward a target
  observable under intervention — the last is the object of this programme.

## 2. What exists (from `docs/literature/`)
- Multi-fidelity model management and MF Bayesian optimisation: solve *when* globally.
- RL for adaptive mesh refinement: learned *where* for discretisation error.
- Goal-oriented (DWR) error estimation and model adaptivity: hand-designed *where* for a
  target quantity; needs adjoints.
- Adaptive QM/MM, AdResS, HMM, equation-free: rule-based multiscale coupling.
- On-the-fly active learning of ML potentials (FLARE, DP-GEN): uncertainty-triggered
  fallback to the fine model — physics compilation in practice.
- MuMMI: ML-selected micro-simulations inside a biological macro model (closest prior
  work; selection by novelty/importance, not causal relevance; no selection scoring).
- Neural closures, UDEs, SBI, virtual-cell efforts, connectome-constrained fly models.
- Honest statement: the components exist; what is untested is a learned per-subsystem
  policy whose criterion is causal relevance to a target under intervention, scored for
  selection correctness against hidden ground truth, across simulators, in biology.

## 3. The paradigm
- Multiscale state model, causal world model, compute controller, evidence loop (figure).
- Mechanistic simulators as teachers/constraints/adjudicators/fallbacks.
- Value of computation V(a) = E[target-relevant uncertainty reduction | a] / cost(a).
- Causal, not spatial, refinement (behaviour → circuit → neuron → conductance → channel
  state → mutation).
- Physics compilation and its failure modes.
- Constraints and uncertainty types that must be exposed.

## 4. Falsifiable hypotheses
H1–H10 with measurable outcomes, baselines, falsification criteria and confounders
(`docs/hypotheses.md`), and the required comparison conditions A–F + oracle.

## 5. Validation ladder and hidden-ground-truth evaluation
V0–V6; scoring both prediction and computation-selection correctness; cross-simulator
falsification; historical prospective validation as a no-wet-lab external test.

## 6. Worked example: V0 (what actually happened — run `v0_main`, 2026-09-14)
- System, conditions, Pareto frontier, calibration, refinement maps, OOD, ablations
  (`experiments/v0_toy/results/v0_main/RESULTS.md`).
- Outcome to report verbatim: the seven testable hypotheses *passed their preregistered V0
  criteria within one synthetic model family, under sparse, causally concentrated closure
  error* — and failed completely when the cheap model's error was uniformly distributed
  (`v0_base0`), which is reported as a central finding; adaptivity exists (oracle at 33 % of fine cost, 79 % of episodes need no fine
  physics); a learned router finds most of it (tolerance at 38 % of fine cost, ECE 0.007,
  AUROC 0.993) but the frontiers cross — the router buys *selectivity* (low waste,
  order-of-magnitude gains at low budgets) while the physics-aware rule buys *coverage*
  (recall 1.0, numerical floor at 59 % of fine cost); the uncertainty bonus contributes
  nothing and ensemble spread does not detect a sustained-input shift.
- Framing consequence for the paper: "learned vs heuristic" becomes "selectivity vs
  coverage, and when a learned router should defer to a known rule"; the claim about
  learned routing is reserved for systems where no failure rule is available, with a
  hybrid (rule-derived candidates, learned ranking) as the default design.

## 7. Toward Drosophila and the miniature Human Repair Map
- Connectome as scaffold, missing biology as uncertainty.
- Inverse design levels 0–9; the computational claim only.
- Aging as multidimensional state restoration, not time reversal.

## 8. Risks and what would make the programme wrong
Adaptivity gives little benefit; routing cannot detect error; coarse models suffice for
interventions; non-identifiability; compiled physics fails silently; repair policies do
not transfer.

## 9. Open problems
Learned intermediate abstractions vs human scale boundaries; value models for compute;
OOD detection for compiled physics; leakage-free historical benchmarks.

## Figures (planned)
F1 architecture loop · F2 causal vs spatial refinement schematic · F3 validation ladder ·
F4 V0 Pareto frontier · F5 V0 refinement-location map · F6 hypothesis/falsification table.

## Source map
See `source_map.md` (built from `docs/literature/*.md`; every citation carries its
verification status).
