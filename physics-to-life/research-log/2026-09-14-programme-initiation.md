# 2026-09-14 — Programme initiation and V0 build

## Objective
Stand up the Physics-to-Life research platform and obtain the first trustworthy answer to:
can a learned system determine when additional physical detail is worth computing?

## What was done (chronological)
1. Repository scaffold under `physics-to-life/` (ADR-0001), Python 3.11 + numpy/scipy/
   scikit-learn/matplotlib/pandas/networkx; unit tests.
2. Four parallel literature scans launched (adaptive fidelity & value of computation;
   SciML core; molecular–cellular multiscale; Drosophila + historical validation).
3. V0 system designed (ADR-0002): slow network, hidden bistable fast subsystems with fold +
   hysteresis; fidelity hierarchy constant closure / quasi-static closure / full fast ODE.
4. Sanity runs. First run found a bug: the lower-branch root solver used the wrong
   initial guess and sometimes converged to the upper branch, corrupting the baseline
   (non-fixed-point starts, NaN overflows). Fixed with bracketed bisection + Newton polish
   and a Newton→bisection fallback near the fold (test added).
5. Sub-step validation of the fine simulator against the independent Radau reference over
   30 episodes: n_sub = 5 → mean |ΔY| 4.5e-3, max 0.11 (mistimed jumps); n_sub = 10 →
   mean 7e-4, max 4e-3; n_sub = 20 → same as 10. Chosen n_sub = 10 → fine cost 10
   (ADR-0003).
6. Observation that drove ADR-0004: with no switching, the quasi-static closure error is
   4e-4 (≈ numerical floor) whereas the constant closure error is 3.5e-2 (sub-threshold
   modulation is not small). With switching: medium 6.3e-2, coarse 1.6e-1. Half the
   episodes have ≥ 1 switch, mean 1.17 switches of 12 nodes. Adaptive policies therefore
   route between medium and fine.
7. Hypothesis registry and V0 specification pre-registered before any result.
8. Pipeline smoke test (24 train / 12 test / 2 OOD families).

## Decisions
ADR-0001 … ADR-0004.

## Literature scan 1 (adaptive fidelity) — headline
Direct novelty threats: MuMMI (ML-selected micro-scale simulations inside a biological
macro model; selection by novelty/importance, no intervention or selection-correctness
scoring) and goal-oriented model adaptivity (Oden–Vemaganti; Braack–Ern; DWR). Partial:
misoKG / MF-GP-UCB / DMFAL (when, globally), RL-AMR (learned where, for discretisation),
FLARE / DP-GEN (uncertainty-triggered fallback), Hepp–Gupta–Khammash (rule-based hybrid
SSA/ODE per subsystem), Dyer 2024 (interventionally consistent surrogates). Mandatory
baselines: adjoint/DWR heuristic (added as E3), multi-fidelity MC, MF-BO, RL-AMR-style
learned marking. Caveat: proxy blocked publisher sites; 26/39 entries citation-only.

## Next
Full V0 run; results entry; STATUS.md; decision on V1.
