# Literature map and novelty assessment

Scan date: 2026-09-14. Four cluster files, each with per-entry key result, relevance,
limitations, design implication, novelty-threat call and verification status — plus
`novelty_conjunction_scan.md`, the adversarial scan of the *narrowed* novelty claim
(the six-element conjunction: target-conditioned causal relevance, scored selection
correctness, value of computation, intervention prediction, inverse design, validation ladder):

| file | cluster | entries |
|---|---|---|
| `adaptive_fidelity_and_value_of_computation.md` | multi-fidelity methods, RL-AMR, goal-oriented adaptivity, adaptive QM/MM & AdResS, uncertainty-triggered MLIP fallback, adaptive MD sampling, metareasoning | 39 |
| `sciml_core_methods.md` | neural operators, closures, hybrid/UDE, differentiable simulators, UQ, SBI, active learning, symbolic regression, causal representation learning, model-based RL, inverse design in biology | 53 |
| `molecular_cellular_multiscale.md` | MLIPs, QM/MM, coarse-graining, MSMs/physics compilation, stochastic biochemistry, whole-cell and virtual-cell models, tissue platforms, ion channels, hybrid mechanistic–neural | 48 |
| `drosophila_and_historical_validation.md` | connectomes, connectome-constrained models, body models, electrophysiology and atlases, aging, regeneration and homeosis, perturbation resources, historical prospective validation | 45 |
| `novelty_conjunction_scan.md` | adversarial test of the six-element conjunction: MuMMI/DynIm, LED/AdaLED/iLED/G-LED, goal-oriented model adaptivity, uncertainty fallback, VoI-per-cost, metareasoning, HyPER, interventional surrogates, in-silico rescue precedents; coverage matrix + verdict | 30 |

**Verification caveat.** The execution environment's egress proxy blocked every publisher,
preprint, DOI and index host during the scans; only GitHub was reachable. Entries marked
"Verified: yes" were confirmed through an official code/data repository page carrying the
citation; the rest are "citation-only (unconfirmed)" or "search-confirmed, page not
opened", with the matched URL given. No DOI or author list was invented. **A verification
pass from a session with publisher access is required before any of these citations are
used in a manuscript.** `papers/paper0-perspective/source_map.md` lists every entry with
its status.

## Novelty assessment (what is already done; what is open)

### Already done — must be cited and used as baselines
1. **Learned "where" in a biological multiscale simulation:** MuMMI (Bhatia et al. 2021;
   Ingólfsson et al. 2022) uses an ML importance/novelty model to decide which patches of a
   RAS–membrane macro simulation receive expensive micro-scale MD, with micro→macro
   feedback. Selection criterion is novelty/importance, not causal relevance to a target
   under intervention; no selection-correctness scoring.
2. **Goal-oriented (adjoint) allocation for a target quantity:** dual-weighted-residual
   error estimation (Becker & Rannacher 2001) and goal-oriented *model* adaptivity
   (Oden & Vemaganti 2000; Braack & Ern 2003), including learned DWR indicators. A
   hand-designed "where does the fine model matter for this QoI" that needs an adjoint.
3. **Information-per-cost "when" selection:** MF-GP-UCB, misoKG, DMFAL/BMFAL-BC,
   MF-NPE (2025); multilevel/multifidelity Monte Carlo allocation (Giles; Peherstorfer,
   Willcox, Gunzburger).
4. **Learned spatial refinement with error/cost rewards:** RL-AMR (Yang 2023; Foucart
   2023; DynAMO 2024; ASMR 2023).
5. **Uncertainty-triggered fallback to the fine model (physics compilation in practice):**
   FLARE, DP-GEN, MTP D-optimality; MSM construction with adaptive sampling; on-demand
   QM in classical MD (LOTF); resolution switching (AdResS, adaptive QM/MM).
6. **Rule-based per-subsystem fidelity in biology:** adaptive hybrid SSA/ODE partitioning
   (Hepp, Gupta, Khammash 2015).
7. **Interventionally consistent surrogates** (Dyer et al. 2024) without fidelity control.
8. **Connectome-constrained whole-brain fly models** (Shiu 2024; Lappalainen 2024) and a
   whole-brain graph model driving a whole-body simulator (FlyGM, 2026) — the
   scaffold-plus-body idea is not novel; novelty must come from biophysical embedding with
   explicit uncertainty and from repair/aging objectives.
9. **Cell-tier perturbation prediction is at the linear-baseline floor** (Ahlmann-Eltze
   2025; PerturBench): any cellular rung must beat additive/linear baselines first.
10. **Alternating learned latent dynamics with bursts of the fine simulator:** LED
    (Vlachas et al. 2022, *Nat. Mach. Intell.*) already does this on a *fixed* schedule.
    The programme's routing must be shown to beat a fixed LED-style schedule at matched
    compute; "adaptive" is only a contribution if it wins that comparison.
11. **Method defaults recommended by the SciML scan:** UDE-style residual closures trained
    a posteriori (with memory where needed); amortised neural posterior estimation with
    misspecification checks for hidden state (identifiability needs intervention-labelled
    trajectories); heteroscedastic ensembles + conformal calibration for routing-grade
    uncertainty (not evidential regression); attractor/feedback-vertex-set enumeration →
    uncertainty-aware MPC with mechanistic re-simulation for inverse design. Not by
    default: free-running operator/world-model rollouts, PINN forward solvers, vanilla
    SINDy on noisy partially observed biology.

### Open (the programme's defensible claims)
- A **learned per-subsystem fidelity policy** over {surrogate, coarse mechanistic, fine
  mechanistic} whose selection criterion is **causal relevance to a target observable
  under a specified intervention**, evaluated for **computation-selection correctness
  against hidden ground truth**, across simulators, in biological systems where no adjoint
  is available (stochastic, discrete, non-differentiable).
- Whether such a policy differs from and beats uncertainty/novelty/proximity/adjoint
  selection at matched compute — V0 tests exactly this against the physics-aware and
  adjoint heuristics.
- The validation ladder with hidden-ground-truth selection scoring, cross-simulator
  falsification and historical prospective validation as a *combined* methodology.

### Consequences for the research question (recorded 2026-09-14)
- **Owner review (2026-09-14):** the programme must not claim novelty for "using ML to
  dynamically choose simulation fidelity" or "coupling learned and mechanistic multiscale
  simulators" — MuMMI and the LED family (LED, AdaLED, iLED, G-LED) already cover those.
  The candidate novelty is the *conjunction* of target-conditioned causal relevance,
  selection correctness, value of computation, cross-scale intervention prediction,
  inverse design, and the validation progression. A fresh adversarial scan against that
  conjunction is recorded in `novelty_conjunction_scan.md`; if prior work covers it, the
  contribution narrows again.
- The framing is **learned goal-oriented model adaptivity for intervention prediction**,
  positioned explicitly against MuMMI and goal-oriented model adaptivity. The word "novel"
  is reserved for the combination, never for a component.
- The adjoint/DWR heuristic (E3) was added to the V0 conditions as a mandatory baseline.
- Adversarial controls adopted from the scan: causal-blind reward ablation; adjoint-oracle
  control; proximity–causality dissociation (V0's readout-ancestor structure already does
  this); decoy-uncertainty test; surrogate-fix 2×2 confound (V1).
- Physics compilation (H5) must be tested against *biased* OOD failure (softening-type
  errors that feature-distance OOD detection misses), not only distance-based OOD.
- For V5, the candidate circuits with published perturbation ground truth are: sugar/water
  gustatory → feeding initiation and antennal mechanosensory → grooming (Shiu 2024),
  descending-neuron network recruitment (Braun 2024; Cande 2018), the optic-lobe motion
  pathway (Lappalainen 2024; Currier & Clandinin 2025), and the larval whole brain
  (Winding 2023; Vogelstein 2014).
- Historical prospective validation requires corpus-level cutoffs on *data releases*, not
  prompt-level "simulated ignorance"; see the requirements list in the Drosophila file.
