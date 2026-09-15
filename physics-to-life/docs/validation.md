# Validation

## Ladder

| rung | system | ground truth | what it validates | status |
|---|---|---|---|---|
| V0 | slow-fast network with hidden bistable subsystems | independent stiff solver | H1–H4, H6 (partial), H7 (partial), H9 | implemented; see `experiments/v0_toy/results/` |
| V1 | **Drosophila ion-channel → membrane bridge** on the published Günay 2015 aCC/MN1-Ib motoneuron model (ADR-0007 + amendments): medium = the published HH model; fine = constructed non-nested Markov levels (Kf: sequential two-step activation with coupled inactivation; NaT: Kuo–Bean coupled chain, coupling fixed by design) with HH-anchored rates fitted on a declared family incl. an AP-clamp trace; level B alternate topologies; Ks/NaP exact chains as negative controls; reduced coarse level | Level A hidden simulator truth (LSODA 1e-9); Level B alternate formulation (`cross_formulation.py`); Level C published/independent observations of the medium level — **reproduced** (`results/gunay2015_reproduction/`) | H1, H3, H5, H8, H9 precursor, H10 precursor | hierarchy validated (`results/hierarchy_validation/`); pilot audited; preregistration frozen v1.1 (`32a39d1`); **main run complete** (`results/v1_gunay_main/`): H1-V1 falsified, H3-V1 not passed (research log 2026-09-15); H5/H8/H9/H10 verdicts from `verdicts_extended.py` as the post-main chain completes |
| V1a | small synthetic biochemical network (mass-action vs QSSA closure) — supporting benchmark, integration test, H5/H8 unit experiment | full mass-action / SSA | H5, H8 unit tests | outline only |
| V2 | ion channel / membrane (Markov channel models vs Hodgkin-Huxley-style gating) | full Markov model | H6 across channel formulations, H7 | planned |
| V3 | conductance-based neuron | high-resolution multicompartment / external simulator | routing across compartments and channels | planned |
| V4 | small neural circuit | full circuit simulation | causal routing across neurons | planned |
| V5 | Drosophila circuit (connectome scaffold + published physiology) | withheld published perturbation outcomes | external adjudication | planned |
| V6 | broader CNS context | withheld experiments; historical cutoffs | H10, prospective validation | planned |

Rungs are not skipped when skipping would make scientific validity hard to debug.

## Comparison conditions (every adaptive-fidelity experiment)

A uniform coarse · B uniform medium · C uniform fine · D random refinement · E hand-designed
heuristic refinement (spatial; physics-aware; adjoint/goal-oriented) · F learned
uncertainty-driven refinement · O oracle (hidden truth) as the upper bound.

## Primary output

Prediction error vs computational cost, as a Pareto frontier with bootstrap confidence
intervals over episodes, never single cherry-picked runs.

## Additional measures

Wall-clock; nominal compute (node-steps weighted by fidelity; FLOPs where practical);
memory (later rungs); number of fine-model calls; calibration (ECE, reliability); selection
precision/recall/F1, waste and miss against the minimal refinement set; intervention
accuracy on held-out families; OOD robustness and OOD detectability (ensemble
disagreement); stability; bound/conservation violations; cross-simulator generalisation.

## Cross-simulator falsification

Never validate a learned model only against the simulator that trained it. V0 varies the
fast-subsystem functional form (cubic vs sigmoidal switch with identical fold thresholds),
the timescale separation ε, determinism (stochastic fast subsystem), the reference
integrator (Radau vs sub-cycled RK4), and the system size. Later rungs vary solvers,
force fields, channel models, discretisation and implementations. Real experimental data
is the final adjudicator.

## Hidden-ground-truth evaluation

Because the virtual world's hidden state is known, every experiment evaluates both
(1) prediction correctness and (2) computation-selection correctness: did the router
refine the subsystem that mattered, did it avoid irrelevant expensive simulation, was its
uncertainty calibrated, did it detect OOD.

## Reproducibility requirements

Every experiment records git commit, configuration, seed, dependency versions,
machine/device, runtime, outputs, metrics and generated figures (`provenance.json`).
