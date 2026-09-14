# Paper 1 — Does learned adaptive refinement improve the accuracy/compute frontier under hidden ground truth?

Type: benchmark / methods. Gate: V0 and V1 complete with all conditions, OOD families,
ablations, seed replicates and a cross-simulator test. Status: outline (2026-09-14).

## Claims this paper may make (only if the evidence supports them)
1. An adaptive mixture of cheap closure and fine physics exists that matches uniform fine
   accuracy at a fraction of its cost (oracle bound; H1).
2. A router trained on hidden-ground-truth labels finds that mixture before seeing the
   answer, with calibrated probabilities (H3, H7).
3. Learned routing dominates / does not dominate hand-designed physics-aware and
   adjoint heuristics at matched cost (H9) — report either way.
4. Routing decisions transfer / do not transfer across fast-subsystem formulations,
   timescale ratios and stochasticity (H6).
5. Sequential (re-simulate, re-score) routing handles cascades but its cost grows
   quickly; the regime where it pays off is characterised.

## Sections
1. Introduction: fidelity requirements are query-dependent; causal vs spatial refinement;
   why hidden ground truth.
2. Related work: MuMMI; goal-oriented model adaptivity; MF-BO/MFMC; RL-AMR; FLARE/DP-GEN;
   hybrid SSA/ODE; interventionally consistent surrogates.
3. Benchmark design: V0 slow-fast network; V1 biochemical cascade; labels (minimal
   refinement set); conditions A–F + oracle; cost model; metrics incl. selection
   correctness; OOD families; adversarial controls.
4. Results (V0): frontier; calibration; refinement maps; OOD; ablations; seeds.
5. Results (V1): physics compilation (H5) and learned closure (H8); cross-simulator.
6. Negative results and failure analysis.
7. Limitations: cost ratio; known failure condition at V0; synthetic families.
8. Reproducibility: seeds, provenance, one-command reruns.

## Figures
F1 system + fidelity hierarchy · F2 Pareto frontiers V0/V1 · F3 calibration + OOD
disagreement · F4 refinement-location maps · F5 OOD panel · F6 ablations · F7 frontier
differences with CIs.
