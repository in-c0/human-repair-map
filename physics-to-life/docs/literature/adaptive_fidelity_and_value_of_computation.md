# Adaptive fidelity, multi-fidelity, adaptive multiscale methods, and value of computation — novelty scan

**Scan date:** 2026-09-14. **Scope:** an adversarial literature scan for the Physics-to-Life programme's core claim — a *learned controller* that decides WHEN and WHERE to invoke an expensive mechanistic simulator versus a cheap coarse model or learned surrogate, in order to predict the effect of an *intervention* on a biological multiscale system, with refinement driven by *causal relevance to a target observable* and with *computation-selection correctness* scored against hidden ground truth. Ten threads were covered: multi-fidelity surrogates and model management; multi-fidelity Bayesian optimisation and active learning; RL for adaptive mesh refinement and adaptive numerics; goal-oriented (adjoint) adaptivity and model adaptivity; adaptive multiscale simulation in chemistry/physics; uncertainty-triggered fallback in machine-learned potentials; RL/bandit adaptive sampling in MD; rational metareasoning and value of computation; learned-surrogate/mechanistic hybrids with fallback; and 2023–2026 work combining learned fidelity allocation, intervention prediction and biology. **Verification caveat (important):** in this session the network egress proxy blocked every publisher, arXiv, PubMed, DOI, Crossref and preprint host; only github.com was reachable. Therefore "Verified: yes" below means an official code-repository README that carries the paper's citation was actually opened; all other entries are marked "citation-only (unconfirmed)" even when the search index returned the publisher/arXiv landing page with matching title, authors and DOI (the matched URL is given so a reader can confirm in one click). No DOI or author list below was invented; where a DOI could not be surfaced it is omitted or flagged "from memory".

## Headline threats found (read these first)

1. **MuMMI / dynamic-importance sampling (Bhatia et al. 2021; Ingólfsson et al. 2022)** — an ML model already decides *where* in a biological multiscale (RAS–membrane) macro simulation to launch expensive micro-scale (CG MD) simulations, with automatic micro→macro feedback. This is a *direct* precedent for "learned WHERE, in biology". It does **not** use causal relevance to a target observable, does not evaluate interventions, and does not score selection correctness.
2. **Goal-oriented model adaptivity (Oden & Vemaganti 2000; Braack & Ern 2003; Becker & Rannacher 2001)** — a hand-designed, adjoint-weighted criterion that already answers "in which subdomain does the fine model matter for *this* quantity of interest". It is the natural strong baseline for the "causal relevance" claim and must be included.
3. **Information-per-cost fidelity selection (misoKG 2017; MF-GP-UCB 2016/17; DMFAL/BMFAL-BC 2022; MF-HRL-IGM 2025; MF-NPE 2025)** — "WHEN to pay for high fidelity" is a solved problem for global optimisation/inference objectives, via one-step value-of-information per unit cost. Not spatially/subsystem-resolved and not intervention-specific, but any Physics-to-Life controller will be compared to these.
4. **RL for adaptive mesh refinement (Yang 2023; Foucart 2023; DynAMO 2024; ASMR 2023; Gillette 2024)** — learned spatial refinement policies with error-vs-cost rewards already exist, including anticipatory (temporal) refinement. They refine *discretisation*, not *model class*, and reward local/global error rather than target-causal error.
5. **Interventionally consistent surrogates (Dyer et al. 2024)** — the intervention axis of the programme has a direct precedent in causal-abstraction-based surrogate training, but with no fidelity control.

No single prior work combines (a) a learned controller, (b) a model-fidelity hierarchy with mechanistic fallback, (c) causal relevance to a target observable under intervention, (d) per-subsystem allocation in a biological multiscale system, and (e) scoring of selection correctness against hidden ground truth. Details and required baselines follow.

---

## Thread 1 — Multi-fidelity surrogate modelling and model management

### KO2000 — Kennedy, M.C. & O'Hagan, A. (2000). Predicting the output from a complex computer code when fast approximations are available. Biometrika 87(1):1–13. doi:10.1093/biomet/87.1.1
- **Key result:** Autoregressive co-kriging: the level-t code is modelled as ρ·(level t−1) plus an independent GP discrepancy; a Bayesian GP fuses a few expensive runs with many cheap runs, giving predictions with calibrated uncertainty and a principled way to decide how much information the cheap code carries about the expensive one.
- **Relevance:** The canonical fusion model for "cheap coarse model + expensive simulator"; the learned surrogate in Physics-to-Life is a (nonlinear, learned) descendant of this discrepancy structure.
- **Limitations:** Global, stationary, scalar-output GP; no notion of *where* fidelity matters, no interventions, no control policy; scales poorly with dimension.
- **Design implication for Physics-to-Life:** Use a KO-style discrepancy model as the *minimal* surrogate baseline; report whether gains come from the controller or merely from a better discrepancy model.
- **Novelty threat:** partial — fuses fidelities but does not select computations.
- **Verified:** citation-only (unconfirmed — page-open blocked by proxy; search index matched https://academic.oup.com/biomet/article-abstract/87/1/1/221217)

### PWG2018 — Peherstorfer, B., Willcox, K. & Gunzburger, M. (2018). Survey of multifidelity methods in uncertainty propagation, inference, and optimization. SIAM Review 60(3):550–591. doi:10.1137/16M1082469
- **Key result:** Organises multifidelity *model management* into three strategies — adaptation (improve the low-fidelity model on the fly), fusion (combine outputs, e.g. co-kriging, control variates), and filtering (use the low-fidelity model to decide *when* to invoke the high-fidelity model, e.g. importance sampling / multi-stage MCMC) — while keeping the high-fidelity model in the loop for accuracy guarantees.
- **Relevance:** "Filtering" is precisely the "when to run the expensive simulator" pattern; the survey is the standard taxonomy against which a learned controller must be positioned.
- **Limitations:** Methods are hand-designed and mostly aimed at expectations/optima of scalar outputs, not causal effects of interventions or per-subsystem choices.
- **Design implication for Physics-to-Life:** State explicitly which of adaptation/fusion/filtering the controller performs, and include one classical filtering baseline (e.g. surrogate-screened high-fidelity calls) in every experiment.
- **Novelty threat:** partial — taxonomy already covers "use LF to decide when to call HF"; the learned, causal, per-subsystem version is not in it.
- **Verified:** citation-only (unconfirmed — search index matched https://www.osti.gov/biblio/1500214 and the SIAM DOI)

### MFMC2016 — Peherstorfer, B., Willcox, K. & Gunzburger, M. (2016). Optimal model management for multifidelity Monte Carlo estimation. SIAM J. Sci. Comput. 38(5):A3163–A3194. doi:10.1137/15M1046472
- **Key result:** Given correlations and costs of a hierarchy of models, MFMC solves an optimisation problem for how many samples to draw from each model so that the estimator MSE is minimised at fixed budget (control-variate structure, unbiased w.r.t. the high-fidelity model). Follow-ups: adaptive MFMC (Peherstorfer 2019, SIAM/ASA J. Uncertainty Quantification 7:579–603) splits the budget between *improving* the low-fidelity models and sampling; a bandit-learning formulation (Xu, Keshavarzzadeh, Kirby & Narayan 2022, SIAM J. Sci. Comput. 44(1):A150–A175, adaptive Explore-Then-Commit) learns online which low-fidelity models to exploit.
- **Relevance:** This is the principled *non-learned* answer to "how much of the budget should go to the expensive model"; the bandit variant is a learned allocation policy in the same family.
- **Limitations:** Allocates *sample counts*, not spatial/subsystem fidelity; assumes a fixed QoI and linear/control-variate structure; no interventions.
- **Design implication for Physics-to-Life:** MFMC with optimal allocation for the target observable is a mandatory baseline at every compute budget; report the gap.
- **Novelty threat:** partial — solves budget allocation across fidelities for a fixed QoI; not causal/spatial.
- **Verified:** yes (https://github.com/pehersto/mfmc — official code README citing the SISC 2016 paper; publisher page blocked)

### Giles2008 — Giles, M.B. (2008). Multilevel Monte Carlo path simulation. Operations Research 56(3):607–617. DOI 10.1287/opre.1070.0496 (from memory; not confirmed in-session)
- **Key result:** Telescoping estimator over a hierarchy of discretisation levels reduces the cost of achieving RMS error ε from O(ε⁻³) to O(ε⁻²(log ε)²) for Euler-discretised SDEs, by putting most samples on cheap coarse levels and few on fine levels.
- **Relevance:** Foundational "coarse where variance allows, fine where needed" allocation; multilevel/multifidelity estimators are what a learned controller must beat for expectation-type observables.
- **Limitations:** Level selection by variance/cost, not by causal relevance; global not spatial; nothing learned.
- **Design implication for Physics-to-Life:** When the observable is an expectation over stochastic biology, MLMC/MLMF (see Fleeter 2020) is the strongest classical competitor.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://www.semanticscholar.org/paper/9011df67b7e93b0727162b0778517e068cfbf902)

## Thread 2 — Multi-fidelity Bayesian optimisation and active learning

### MFGPUCB — Kandasamy, K., Dasarathy, G., Oliva, J.B., Schneider, J. & Póczos, B. (2016). Gaussian process bandit optimisation with multi-fidelity evaluations. NeurIPS 29, pp. 992–1000. (+ Kandasamy et al. 2017, "Multi-fidelity Bayesian optimisation with continuous approximations" (BOCA), ICML, PMLR 70:1799–1808)
- **Key result:** MF-GP-UCB queries a cheap fidelity until its posterior uncertainty at the candidate falls below a fidelity-specific threshold, then escalates; regret bounds improve on single-fidelity GP-UCB. BOCA extends fidelity to a continuous variable.
- **Relevance:** The classic *rule* for "when is the cheap model good enough here"; conceptually identical to the programme's WHEN decision, for a global optimisation objective.
- **Limitations:** Sequential single-point queries; fidelities are cheaper *approximations of the same function*, not different physics per subsystem; no notion of intervention or of spatial/subsystem structure.
- **Design implication for Physics-to-Life:** Any learned WHEN-policy should be compared to a threshold-escalation rule of this type, tuned on the same budget.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/kirthevasank/mf-gp-ucb — official code README citing the NIPS 2016 paper)

### misoKG — Poloczek, M., Wang, J. & Frazier, P.I. (2017). Multi-information source optimization. NeurIPS 30. (+ Wu, Toscano-Palmerin, Frazier & Wilson 2019, "Practical multi-fidelity Bayesian optimization for hyperparameter tuning", UAI, pp. 788–798: trace-aware knowledge gradient)
- **Key result:** Treats cheap sources as biased and noisy, models them jointly with a GP whose kernel captures model discrepancy, and chooses the (source, point) maximising *expected improvement in decision quality per unit cost* (one-step knowledge-gradient). Reported to find higher-value designs at lower cost than prior MF-BO.
- **Relevance:** Explicit value-of-computation-per-cost acquisition over heterogeneous information sources — the same decision rule the programme wants to *learn*.
- **Limitations:** Myopic one-step lookahead; scalar objective; no spatial decomposition; no interventions or causal target.
- **Design implication for Physics-to-Life:** A misoKG-style per-cost acquisition over {surrogate, coarse, high-fidelity} for the *intervention-response function* is a required baseline; a learned controller must show benefit beyond one-step VOI.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/misokg/NIPS2017 — official code README citing the paper)

### DMFAL — Li, S., Wang, Z., Kirby, R. & Zhe, S. (2022). Deep multi-fidelity active learning of high-dimensional outputs. AISTATS, PMLR 151:1694–1711. (+ Li, Phillips, Yu, Kirby & Zhe 2022, "Batch multi-fidelity active learning with budget constraints" (BMFAL-BC), NeurIPS 35)
- **Key result:** A deep multi-fidelity model for high-dimensional (field) outputs plus an acquisition that selects (fidelity, input) pairs maximising mutual information with the target-fidelity function per unit cost; BMFAL-BC adds batch selection under a budget with a weighted-greedy (1−1/e)-approximation.
- **Relevance:** Closest active-learning analogue to "which simulator, on which input, for a field-valued output at fixed budget"; directly applicable to building the programme's surrogate.
- **Limitations:** Chooses global training queries, not run-time per-subsystem fidelity inside a coupled simulation; no causal targeting; assumes a fixed fidelity ladder of the *same* model.
- **Design implication for Physics-to-Life:** Use DMFAL/BMFAL-BC as the surrogate-training baseline; the controller's contribution must be measured *after* the surrogate has been trained this well.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/shib0li/BMFAL-BC — official code README citing NeurIPS 2022; DMFAL page blocked)

## Thread 3 — RL / learning for adaptive mesh refinement and adaptive numerics

### YangRLAMR — Yang, J., Dzanic, T., Petersen, B., Kudo, J., Mittal, K., Tomov, V., Camier, J.-S., Zhao, T., Zha, H., Kolev, T., Anderson, R. & Faissol, D. (2023). Reinforcement learning for adaptive mesh refinement. AISTATS, PMLR 206:5997–6014. (+ Yang, Mittal, Dzanic, Petrides, Keith, Petersen, Faissol & Anderson 2023, "Multi-agent reinforcement learning for adaptive mesh refinement", AAMAS 2023 — VDGN)
- **Key result:** Formulates AMR as an MDP (later a multi-agent MDP with a value-decomposition graph network); policies trained from simulation learn refinement decisions that trade error against cost and, in the MARL version, show *anticipatory* refinement ahead of moving features, outperforming error-threshold heuristics.
- **Relevance:** Learned WHERE-to-refine with an explicit error-vs-cost reward; the multi-agent formulation is a natural template for per-subsystem fidelity agents.
- **Limitations:** Refines discretisation of one PDE, not model class; reward is global/local discretisation error, not error in a target observable under an intervention; toy-to-moderate problems (linear advection).
- **Design implication for Physics-to-Life:** Re-implement the reward with (i) local error and (ii) target-observable error, and show the controller's selections differ and are better under (ii); otherwise the result is RL-AMR with a new name.
- **Novelty threat:** partial (direct on "learned where", not on causal/model-fidelity axis).
- **Verified:** yes (https://github.com/LLNL/marl-amr — official code README citing the AAMAS 2023 paper; AISTATS page blocked)

### Foucart2023 — Foucart, C., Charous, A. & Lermusiaux, P.F.J. (2023). Deep reinforcement learning for adaptive mesh refinement. J. Comput. Phys. 491:112381. doi:10.1016/j.jcp.2023.112381
- **Key result:** AMR as a POMDP solved with deep RL; policies are competitive with common AMR heuristics, generalise across problem classes, and often give higher accuracy per degree of freedom.
- **Relevance:** Shows that local, partially observed refinement decisions can be learned and transferred — the programme's controller faces the same partial observability.
- **Limitations:** Same as above: discretisation, not physics; reward is solution error, not a causal target; single-model setting.
- **Design implication for Physics-to-Life:** Reuse the POMDP framing; add the observable-conditioned state so policies are *goal-conditioned*.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://www.sciencedirect.com/science/article/abs/pii/S002199912300476X and arXiv:2209.12351)

### DynAMO — Dzanic, T., Mittal, K., Kim, D., Yang, J., Petrides, S., Keith, B. & Anderson, R. (2024). DynAMO: Multi-agent reinforcement learning for dynamic anticipatory mesh optimization with applications to hyperbolic conservation laws. J. Comput. Phys. 506:112924. doi:10.1016/j.jcp.2024.112924
- **Key result:** Multi-agent RL refinement policies that anticipate future solution states, delivering meshes that stay accurate for longer intervals and outperform instantaneous-indicator, threshold-based AMR on linear advection and compressible Euler (DG).
- **Relevance:** Learned *temporal* anticipation of where fidelity will be needed — the WHEN dimension inside a time-dependent simulation.
- **Limitations:** Hyperbolic PDE test cases; error-based reward; no biology, no interventions, no model switching.
- **Design implication for Physics-to-Life:** Include an "anticipatory" baseline that pre-refines subsystems predicted to become active; measure whether causal targeting adds anything on top of anticipation.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://www.sciencedirect.com/science/article/abs/pii/S0021999124001736 and arXiv:2310.01695)

### ASMR — Freymuth, N., Dahlinger, P., Würth, T., Reisch, S., Kärger, L. & Neumann, G. (2023). Swarm reinforcement learning for adaptive mesh refinement. NeurIPS 36. arXiv:2304.00818
- **Key result:** AMR as an Adaptive Swarm MDP (elements are agents that may split), message-passing policies with spatial rewards; reported >10× (README) to up to ~30× (paper) speed-up over uniform refinement while matching error-oracle AMR quality *without* access to the error signal at run time; outperforms learned baselines.
- **Relevance:** Demonstrates that a learned refinement policy can approximate an expensive error-estimator oracle cheaply — exactly the argument Physics-to-Life will make about approximating an adjoint/causal oracle.
- **Limitations:** Trained with oracle error available at training time; discretisation only; no target-observable weighting.
- **Design implication for Physics-to-Life:** Mirror the protocol: train with a hidden-ground-truth causal oracle, test without it, and report selection agreement with the oracle as the "computation-selection correctness" metric.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/niklasfreymuth/asmr — official code README citing the NeurIPS paper)

### Gillette2024 — Gillette, A., Keith, B. & Petrides, S. (2024). Learning robust marking policies for adaptive mesh refinement. SIAM J. Sci. Comput. (published Jan 2024). arXiv:2207.06339. (+ Dellnitz, Hüllermeier, Lücke, Ober-Blöbaum, Offen, Peitz & Pfannschmidt 2023, "Efficient time-stepping for numerical integration using reinforcement learning", SIAM J. Sci. Comput. 45(2):A579–A595, doi:10.1137/21M1412682)
- **Key result:** Recasts the marking step of AFEM as an MDP in which the marking parameter is chosen on the fly by an RL-trained policy, removing expert pre-tuning and generalising across problems; Dellnitz et al. learn step-size controllers for quadrature/ODE integration with RL.
- **Relevance:** Learned selection of *numerical control parameters* (how aggressively to refine, how large a step) — the scalar-knob version of learned adaptive computation.
- **Limitations:** Single global parameter per step; no model-fidelity choice, no causal target.
- **Design implication for Physics-to-Life:** The controller should also be tested against a "learned global knob" ablation (one fidelity level for the whole system chosen adaptively) to prove per-subsystem selection matters.
- **Novelty threat:** none–partial.
- **Verified:** citation-only (unconfirmed — head entry Gillette et al.: page-open blocked by proxy; search index matched https://www.osti.gov/pages/biblio/2315085). Companion Dellnitz et al.: yes (https://github.com/lueckem/quadrature-ML — official code README citing SISC 45(2):A579–A595)

## Thread 4 — Goal-oriented (adjoint / dual-weighted-residual) adaptivity and model adaptivity

### DWR2001 — Becker, R. & Rannacher, R. (2001). An optimal control approach to a posteriori error estimation in finite element methods. Acta Numerica 10:1–102. doi:10.1017/S0962492901000010
- **Key result:** The dual-weighted-residual (DWR) method: the error in a target functional J(u) is estimated as a sum of local residuals weighted by the solution of an adjoint (dual) problem driven by J; refining where residual×adjoint-weight is large yields meshes optimised for *that* quantity rather than for global error.
- **Relevance:** This is already "refine according to relevance to the target observable", hand-designed and with rigorous estimates; it captures sensitivity (a linearised causal influence) of the target to local errors.
- **Limitations:** Requires a differentiable, well-posed adjoint (hard for stochastic, discrete, agent-based or hybrid biology models); linearised around the current solution; discretisation error only (see model adaptivity next); cost of the dual solve; no learning, no interventions per se (though J can encode a contrast).
- **Design implication for Physics-to-Life:** DWR/adjoint-sensitivity allocation is the single most important hand-designed baseline: wherever an adjoint exists, the learned controller must match or beat it; where it does not (stochastic/discrete subsystems) the programme should show that the learned controller recovers DWR-like behaviour without an adjoint.
- **Novelty threat:** direct — for "where does fidelity matter for a target quantity" in differentiable models, the answer already exists; the learned/causal/intervention/biology combination is what remains.
- **Verified:** citation-only (unconfirmed — search index matched https://www.semanticscholar.org/paper/34a6f4386e8967efa7395ee591abf9a2da548c9a and the Cambridge DOI)

### ModelAdaptivity — Oden, J.T. & Vemaganti, K.S. (2000). Estimation of local modeling error and goal-oriented adaptive modeling of heterogeneous materials: I. Error estimates and adaptive algorithms. J. Comput. Phys. 164:22–47. (+ Oden & Prudhomme 2002, "Estimation of modeling error in computational mechanics", J. Comput. Phys.; Braack, M. & Ern, A. 2003, "A posteriori control of modeling errors and discretization errors", Multiscale Model. Simul. 1(2):221–238)
- **Key result:** Goal-oriented a posteriori estimates of *modelling* error (fine-scale heterogeneous model vs homogenised/coarse model) in local quantities of interest, with adaptive algorithms that switch subdomains from the coarse to the fine model only where the estimated effect on the QoI exceeds tolerance; Braack & Ern control model and discretisation error jointly within one DWR framework.
- **Relevance:** This is *per-region model-fidelity selection driven by a target QoI* — the non-learned, non-biological version of the programme's core mechanism.
- **Limitations:** Nested/hierarchical models of the same physics with computable residuals; linear elasticity / reaction–diffusion-type PDEs; no learned surrogates, no stochastic or agent-based scales, no interventions, no run-time learning.
- **Design implication for Physics-to-Life:** Frame the programme as *learned goal-oriented model adaptivity for non-differentiable, stochastic, multiscale biology under interventions*; include an Oden–Vemaganti-style estimator (or its adjoint-free surrogate) as a baseline on any virtual system where it is computable.
- **Novelty threat:** direct on the mechanism, partial on the setting.
- **Verified:** citation-only (unconfirmed — search index matched https://ui.adsabs.harvard.edu/abs/2000JCoPh.164...22O/abstract; Braack & Ern matched via ProQuest/SIAM listing)

### LearnedDWR — Wallwork, J.G. et al. (2022). E2N: Error estimation networks for goal-oriented mesh adaptation. arXiv:2207.11233. (+ Roth et al. 2022, "Neural network guided adjoint computations in dual weighted residual error estimation", arXiv:2102.12450; "Multigoal-oriented dual-weighted-residual error estimation using deep neural networks", arXiv:2112.11360)
- **Key result:** Neural networks trained to predict DWR-type goal-oriented error indicators (or to supply the adjoint) so that goal-oriented adaptivity can run without the expensive dual solve.
- **Relevance:** Shows the "learn the adjoint-weighted indicator" step has been attempted; it is the most direct route by which a learned controller can inherit goal-orientation.
- **Limitations:** Supervised on DWR targets for single PDEs; still discretisation-focused; no model switching, no biology, no interventions.
- **Design implication for Physics-to-Life:** A supervised "learn the causal indicator from the hidden-truth oracle" baseline (E2N-style) should be run before any RL; if it suffices, RL is unnecessary.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://arxiv.org/pdf/2207.11233 and https://arxiv.org/abs/2102.12450; author lists beyond first author not confirmed)

## Thread 5 — Adaptive multiscale simulation in chemistry/physics

### AdaptiveQMMM — Heyden, A., Lin, H. & Truhlar, D.G. (2007). Adaptive partitioning in combined quantum mechanical and molecular mechanical calculations of potential energy functions for multiscale simulations. J. Phys. Chem. B 111(9):2231–2241. doi:10.1021/jp0673617. (+ Bulo, Ensing, Sikkema & Visscher 2009, "Toward a practical method for adaptive QM/MM simulations", J. Chem. Theory Comput. 5(9):2212–2221, doi:10.1021/ct900148e; Watanabe, H.C. & Cui, Q. 2019, "Quantitative analysis of QM/MM boundary artifacts and correction in adaptive QM/MM simulations", J. Chem. Theory Comput. 15(7):3917–3928, doi:10.1021/acs.jctc.9b00180; review: Duster et al. 2017, WIREs Comput. Mol. Sci., doi:10.1002/wcms.1310)
- **Key result:** The QM "active zone" is redefined as a function of time using distance-based buffer regions and permuted/interpolated partitioning so molecules can flow between QM and MM treatment with smooth energies; Bulo et al. give a practical scheme; Watanabe & Cui quantify boundary artifacts and propose corrections.
- **Relevance:** A mature, rule-based "which subsystem gets the expensive physics right now" machinery in molecular simulation; the programme's controller is the learned, target-driven analogue.
- **Limitations:** Criterion is *spatial proximity* to a fixed centre (exactly the heuristic the programme claims to go beyond); no learning, no target observable, no intervention logic; boundary artifacts are a known cost.
- **Design implication for Physics-to-Life:** Use a distance/proximity-based adaptive partition as the explicit "proximity, not causality" control; design virtual systems where proximity and causal relevance disagree.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://pubs.acs.org/doi/10.1021/jp0673617, https://pubs.acs.org/doi/10.1021/acs.jctc.9b00180)

### AdResS — Praprotnik, M., Delle Site, L. & Kremer, K. (2005). Adaptive resolution molecular-dynamics simulation: changing the degrees of freedom on the fly. J. Chem. Phys. 123:224106. doi:10.1063/1.2132286. (+ Praprotnik, Delle Site & Kremer 2008, Annu. Rev. Phys. Chem. 59:545–571, doi:10.1146/annurev.physchem.59.032607.093707; Wagoner, J.A. & Pande, V.S. 2018, "Communication: Adaptive boundaries in multiscale simulations", J. Chem. Phys. 148:141104, doi:10.1063/1.5025826)
- **Key result:** Spatially adaptive resolution: atomistic in a region of interest, coarse-grained elsewhere, coupled through a hybrid zone with a switching function so molecules change degrees of freedom on the fly; Wagoner & Pande derive the Hamiltonian/distribution for high-resolution regions whose size and shape adapt during the run.
- **Relevance:** Establishes that fidelity can be varied *in space and time* within one consistent simulation; adaptive boundaries are the physics-side precedent for "WHERE".
- **Limitations:** Region defined geometrically or by user/physics heuristics; thermodynamic consistency is the concern, not target-observable accuracy; nothing learned.
- **Design implication for Physics-to-Life:** Borrow the consistency machinery (buffer/switching zones) when the controller changes a subsystem's fidelity mid-run, and test for artifacts at fidelity boundaries.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://pubs.aip.org/aip/jcp/article-abstract/123/22/224106/776313 and https://pubs.aip.org/aip/jcp/article/148/14/141104/196377)

### HMM — E, W. & Engquist, B. (2003). The heterogeneous multiscale methods. Commun. Math. Sci. 1(1):87–132.
- **Key result:** A macro solver whose missing constitutive data are estimated on demand from short, localised micro-scale simulations; the micro model is invoked only where and when the macro scheme needs data.
- **Relevance:** General framework for on-demand invocation of an expensive micro model inside a cheap macro model — the structural skeleton of the programme's simulator stack.
- **Limitations:** Invocation pattern is dictated by the macro discretisation (every quadrature point/time step), not by relevance to an observable; scale separation assumed; nothing learned.
- **Design implication for Physics-to-Life:** Treat HMM-style "always call micro" as the uniform-high-fidelity reference, and learned selective invocation as the intervention on that pattern.
- **Novelty threat:** none–partial.
- **Verified:** citation-only (unconfirmed — search index matched https://projecteuclid.org/journals/communications-in-mathematical-sciences/volume-1/issue-1/The-Heterognous-Multiscale-Methods/cms/1118150402.full)

### EquationFree — Kevrekidis, I.G., Gear, C.W., Hyman, J.M., Kevrekidis, P.G., Runborg, O. & Theodoropoulos, C. (2003). Equation-free, coarse-grained multiscale computation: enabling microscopic simulators to perform system-level analysis. Commun. Math. Sci. 1(4):715–762.
- **Key result:** Coarse time-steppers built from short bursts of micro simulation (lifting → micro run → restriction), enabling projective integration, patch dynamics and coarse bifurcation analysis; micro simulators are called only for short times and small patches.
- **Relevance:** Patch dynamics is an early "simulate the expensive model only on selected patches" scheme; directly relevant to biology (used for stochastic/agent-based systems).
- **Limitations:** Patch placement and burst length are fixed by numerical-analysis arguments (gap-tooth), not by target relevance; no learning; assumes a low-dimensional slow manifold.
- **Design implication for Physics-to-Life:** Equation-free patch dynamics with uniform patches is a fair "non-learned adaptive multiscale" control for agent-based virtual systems.
- **Novelty threat:** none–partial.
- **Verified:** citation-only (unconfirmed — search index matched https://projecteuclid.org/journals/communications-in-mathematical-sciences/volume-1/issue-4/.../cms/1119655353.full)

### HybridSRN — Hepp, B., Gupta, A. & Khammash, M. (2015). Adaptive hybrid simulations for multiscale stochastic reaction networks. J. Chem. Phys. 142(3):034118. (+ Haseltine, E.L. & Rawlings, J.B. 2002, "Approximate simulation of coupled fast and slow reactions for stochastic chemical kinetics", J. Chem. Phys. 117(15):6959–6969; Smith, C.A. & Yates, C.A. 2018, "Spatially extended hybrid methods: a review", J. R. Soc. Interface 15:20170931)
- **Key result:** Species/reactions are partitioned *adaptively at run time* into discrete-stochastic (SSA) and continuous-deterministic (ODE/PDMP) subsets based on abundance/propensity criteria, yielding "considerable performance enhancements" over SSA and fixed hybrid schemes on systems-biology models; Haseltine & Rawlings introduced the fast/slow partition; Smith & Yates review spatial hybrid (PDE ↔ compartment ↔ Brownian) methods with interface regions.
- **Relevance:** These are *existing per-subsystem fidelity selectors in biology*: cheap deterministic vs expensive stochastic treatment chosen per species/reaction/region on the fly.
- **Limitations:** Criteria are local (molecule counts, propensities, noise magnitude), not target-observable- or intervention-driven; rules are hand-designed; no learning; no scoring of whether the partition was the one that mattered.
- **Design implication for Physics-to-Life:** The abundance/propensity-threshold hybrid is a mandatory baseline for stochastic reaction-network virtual systems; the programme must show that causal targeting changes the partition and improves intervention prediction at matched cost.
- **Novelty threat:** partial (direct on "adaptive per-subsystem fidelity in biology", none on learning/causality).
- **Verified:** citation-only (unconfirmed — search index matched https://pubmed.ncbi.nlm.nih.gov/25612700/ and arXiv:1402.3523; review matched https://royalsocietypublishing.org/rsif/article/15/139/20170931)

### LearnedBreakdown — Xiao, T., Schotthöfer, S. & Frank, M. (2023). Predicting continuum breakdown with deep neural networks. J. Comput. Phys. 489:112278. arXiv:2203.02933
- **Key result:** A neural classifier, trained on Boltzmann solutions with labels from the Chapman–Enskog deviation, decides per cell whether the cheap Navier–Stokes model is valid or the expensive kinetic (Boltzmann) model is needed; used inside a hybrid solver with adaptive regime partition and validated on a 1D Riemann problem, shear layer and hypersonic cylinder flow.
- **Relevance:** A *learned* "which physics to use, per region" selector — the closest physics-side precedent to a learned model-fidelity controller.
- **Limitations:** Supervised classification of local model validity (a learned error indicator), not a decision about value for a target observable; no cost/benefit trade-off, no interventions.
- **Design implication for Physics-to-Life:** Include a "learned local validity classifier" baseline; the programme's claim is that *validity* is not the same as *relevance* — demonstrate cases where the coarse model is invalid but irrelevant to the target, and vice versa.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://www.sciencedirect.com/science/article/abs/pii/S002199912300373X)

## Thread 6 — On-the-fly active learning of interatomic potentials with fallback to DFT

### FLARE — Vandermause, J., Torrisi, S.B., Batzner, S., Xie, Y., Sun, L., Kolpak, A.M. & Kozinsky, B. (2020). On-the-fly active learning of interpretable Bayesian force fields for atomistic rare events. npj Comput. Mater. 6:20. doi:10.1038/s41524-020-0283-z
- **Key result:** A GP force field runs the MD; when its predictive uncertainty exceeds a threshold, a DFT call is made and the model updated. Reported: for multi-phase aluminium fewer than 100 DFT calls over 10 ps of dynamics, concentrated at the start and immediately after melting; for vacancy diffusion no DFT calls needed after the first ~400 ps.
- **Relevance:** The cleanest existing instance of "learned surrogate with uncertainty-triggered fallback to the mechanistic solver" — the WHEN mechanism in Physics-to-Life's surrogate tier.
- **Limitations:** Trigger is epistemic uncertainty of the surrogate, not value to a target observable; every uncertain configuration is refined regardless of whether it affects the quantity of interest; no interventions.
- **Design implication for Physics-to-Life:** Uncertainty-threshold fallback is a mandatory baseline; the programme's "decoy" test (high surrogate uncertainty in an irrelevant subsystem) is the experiment that separates VOC from pure uncertainty triggering.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/mir-group/flare — official code README citing npj Comput. Mater. 6:20)

### DPGEN — Zhang, Y., Wang, H., Chen, W., Zeng, J., Zhang, L., Wang, H. & E, W. (2020). DP-GEN: A concurrent learning platform for the generation of reliable deep learning based potential energy models. Comput. Phys. Commun. 253:107206. doi:10.1016/j.cpc.2020.107206
- **Key result:** Exploration–labelling–training loop: an ensemble of deep potentials explores; configurations whose ensemble force deviation falls in a trust window are labelled by DFT; the README states DP-GEN samples "more than tens of million structures and select[s] only a few for first principles calculation".
- **Relevance:** Ensemble-disagreement-gated invocation of the expensive solver at scale; the practical template for a fallback policy with hysteresis (lower/upper trust bounds).
- **Limitations:** Offline data generation for a *uniformly accurate* model, not run-time selective fidelity for a target; trust bounds hand-set.
- **Design implication for Physics-to-Life:** Reuse the two-threshold trust-window idea for the fallback tier; report DFT/HF-call fractions as a cost metric exactly as DP-GEN does.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/deepmodeling/dpgen — official code README citing CPC 253:107206)

### MLIPUncertainty — Podryabinkin, E.V. & Shapeev, A.V. (2017). Active learning of linearly parametrized interatomic potentials. Comput. Mater. Sci. 140:171–180. arXiv:1611.09346. (+ Schran, C., Brezina, K. & Marsalek, O. 2020, "Committee neural network potentials control generalization errors and enable active learning", J. Chem. Phys. 153:104105, doi:10.1063/5.0016004)
- **Key result:** D-optimality/MaxVol "extrapolation grade" flags configurations outside the training hull so that no extrapolation is attempted — "completely reliable atomistic simulation without significant decrease in accuracy"; committee NNPs use disagreement as a generalisation-error estimate that enables active learning.
- **Relevance:** Two alternative fallback triggers (geometric extrapolation grade; ensemble disagreement) that a Physics-to-Life surrogate could use for OOD detection.
- **Limitations:** Same as FLARE/DP-GEN: OOD-ness ≠ relevance; no cost–benefit reasoning about the target.
- **Design implication for Physics-to-Life:** Offer at least two OOD triggers (extrapolation grade, committee disagreement) as ablations of the fallback tier.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — head entry Podryabinkin & Shapeev: page-open blocked by proxy; search index matched https://arxiv.org/abs/1611.09346). Companion Schran et al.: yes (https://github.com/MarsalekGroup/paper-c-nnp — official data README citing JCP 153:104105, doi:10.1063/5.0016004)

## Thread 7 — RL/bandit-driven adaptive sampling in molecular dynamics

### REAP — Shamsi, Z., Cheng, K.J. & Shukla, D. (2018). Reinforcement learning based adaptive sampling: REAPing rewards by exploring protein conformational landscapes. J. Phys. Chem. B 122(35):8386–8395. doi:10.1021/acs.jpcb.8b06521. (+ Zimmerman, M.I. & Bowman, G.R. 2015, "FAST conformational searches by balancing exploration/exploitation trade-offs", J. Chem. Theory Comput. 11(12):5747–5757, doi:10.1021/acs.jctc.5b00737)
- **Key result:** REAP learns weights over order parameters as it samples, rewarding restarts along directions that expand exploration; compared to long MD and least-counts on model landscapes, alanine dipeptide and Src kinase. FAST balances exploitation of a target property gradient with exploration (goal-oriented sampling).
- **Relevance:** Learned/goal-oriented decisions about *which simulations to run next* in a biological simulator; FAST is explicitly target-property-driven.
- **Limitations:** Chooses restart states within one fidelity; no fidelity hierarchy, no surrogate fallback, no intervention effect estimation; objectives are exploration or a scalar property, not intervention-contrast accuracy.
- **Design implication for Physics-to-Life:** Where the controller allocates high-fidelity *trajectories*, compare to FAST/REAP-style goal-oriented restart selection at equal wall-clock.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/ShuklaGroup/REAP-ReinforcementLearningBasedAdaptiveSampling — official code README citing JPCB 122:8386, doi:10.1021/acs.jpcb.8b06521). FAST: citation-only (repo https://github.com/bowman-lab/fast exists but README content was not returned)

### AdaptiveBandit — Pérez, A., Herrera-Nieto, P., Doerr, S. & De Fabritiis, G. (2020). AdaptiveBandit: A multi-armed bandit framework for adaptive sampling in molecular simulations. J. Chem. Theory Comput. 16(7):4685–4693. doi:10.1021/acs.jctc.0c00205
- **Key result:** Recasts adaptive sampling as a multi-armed bandit over conformational states (UCB-type policy) and derives a new adaptive sampling algorithm within the framework.
- **Relevance:** Bandit formalism for compute allocation across simulation "arms" — the same formalism as OCBA/misoKG and a candidate formalism for per-subsystem fidelity allocation.
- **Limitations:** Single fidelity; reward is exploration of state space; no target observable, intervention, or surrogate.
- **Design implication for Physics-to-Life:** A contextual-bandit controller (subsystems as arms, fidelity as action, reward = reduction in target-observable error per cost) is a simpler alternative to full RL and should be an ablation.
- **Novelty threat:** none–partial.
- **Verified:** citation-only (unconfirmed — search index matched https://pubs.acs.org/doi/10.1021/acs.jctc.0c00205)

### DeepDriveMD — Lee, H., Turilli, M., Jha, S., Bhowmik, D., Ma, H. & Ramanathan, A. (2019). DeepDriveMD: Deep-learning driven adaptive molecular simulations for protein folding. IEEE/ACM 3rd Workshop on Deep Learning on Supercomputers (DLS, at SC19), pp. 12–19. (+ Casalino, L., Dommer, A.C., Gaieb, Z., et al. 2021, "AI-driven multiscale simulations illuminate mechanisms of SARS-CoV-2 spike dynamics", Int. J. High Perform. Comput. Appl. 35(5):432–451, doi:10.1177/10943420211006452)
- **Key result:** A DL model (autoencoder) learns a latent representation from running MD; outlier/novel states in the latent space are used to spawn new simulations; reported ≥2.3× gain in sampling folded states. Casalino et al. scaled the pattern to a heterogeneous HPC workflow steering spike-protein simulations (Gordon Bell special-prize work).
- **Relevance:** AI-steered decisions about *which* simulations to run, on biological systems, at supercomputer scale — an operational precedent for the programme's controller infrastructure.
- **Limitations:** Steering is novelty/outlier-driven in a learned latent space, not value-driven for a target; single fidelity per workflow (multiscale only via separate stages); no interventions.
- **Design implication for Physics-to-Life:** Novelty-driven steering must be an explicit control; the programme's distinct claim is that relevance to the target, not novelty, should drive refinement.
- **Novelty threat:** partial.
- **Verified:** yes (https://github.com/radical-collaboration/DeepDriveMD — official repo README citing the DLS 2019 paper). Casalino et al.: citation-only (search index matched https://journals.sagepub.com/doi/10.1177/10943420211006452)

### MuMMI — Bhatia, H., Carpenter, T.S., Ingólfsson, H.I., et al. (2021). Machine-learning-based dynamic-importance sampling for adaptive multiscale simulations. Nature Machine Intelligence 3:401–409. doi:10.1038/s42256-021-00327-w. (+ Ingólfsson, H.I., Bhatia, H., et al. 2022, "Machine learning–driven multiscale modeling reveals lipid-dependent dynamics of RAS signaling proteins", PNAS, doi:10.1073/pnas.2113297119)
- **Key result:** In a coupled macro (continuum membrane) / micro (CG MD, later AA) simulation of RAS on a plasma membrane, an ML model scores macro-scale patches by dynamic importance (novelty in a learned latent space) and launches micro simulations for the most important ones; micro results feed back to the macro model ("self-healing"); run as a multi-day campaign on Sierra. The PNAS paper reports the resulting biology.
- **Relevance:** **The closest existing system to Physics-to-Life**: a learned component decides WHERE (which patches) and implicitly WHEN to spend expensive micro-scale compute inside a *biological* multiscale simulation, with feedback to the coarse model.
- **Limitations:** Selection criterion is *coverage/novelty of macro configurations* (importance sampling of phase space), not causal relevance to a target observable; no intervention/counterfactual question is posed; no hidden-ground-truth scoring of whether selected patches mattered; requires bespoke HPC infrastructure.
- **Design implication for Physics-to-Life:** MuMMI-style novelty-driven patch selection is a mandatory baseline; the programme must show (i) different patches are selected under a causal-relevance criterion and (ii) intervention predictions improve at equal micro-simulation budget. Cite MuMMI prominently as prior art for "learned where, in biology".
- **Novelty threat:** direct on "learned selection of where to run expensive micro-scale simulation in a biological multiscale model"; none on causal/intervention/selection-scoring.
- **Verified:** yes (https://github.com/mummi-framework/mummi-ras — official framework README describing ML-based dynamic-importance patch selection and citing Bhatia et al., Nat. Mach. Intell. 2021 and Ingólfsson et al., PNAS 2022)

## Thread 8 — Rational metareasoning, value of computation, adaptive computation

### RussellWefald1991 — Russell, S.J. & Wefald, E. (1991). Principles of metareasoning. Artificial Intelligence 49:361–395.
- **Key result:** Formalises the *value of computation*: a computation is worth doing if its expected improvement in decision quality exceeds its cost; introduces myopic (single-step) estimates and applies them to search control.
- **Relevance:** The conceptual foundation for "decide whether to run the expensive simulator" as a decision problem in its own right.
- **Limitations:** Myopic approximations; estimating the value of a computation requires a model of what the computation will reveal; no learning of the metalevel policy.
- **Design implication for Physics-to-Life:** State the controller as a metalevel decision problem in these terms so that the reward is provably value-of-computation for the target observable.
- **Novelty threat:** none (framework), but the programme should not claim the VOC framing as new.
- **Verified:** citation-only (unconfirmed — search index matched https://www.sciencedirect.com/science/article/abs/pii/000437029190015C)

### Hay2012 — Hay, N., Russell, S., Tolpin, D. & Shimony, S.E. (2012). Selecting computations: theory and applications. UAI 2012, pp. 346–355.
- **Key result:** Metalevel MDP for choosing which simulations (rollouts) to run when a decision is approximated by sampling; computations are selected by expected improvement in decision quality; yields improved Monte Carlo tree search selection policies.
- **Relevance:** "Which simulation to run next, given that simulations are the computations" is exactly the programme's controller problem, in the abstract.
- **Limitations:** Abstract computations (samples of a value), not heterogeneous-fidelity physical simulators; no spatial structure; no learning of the metalevel policy.
- **Design implication for Physics-to-Life:** Use the metalevel-MDP formulation to define the state (current beliefs about the target under intervention), actions (which subsystem, which fidelity) and reward (expected improvement in intervention-prediction quality per cost).
- **Novelty threat:** partial (framework already exists; instantiation for simulators with fidelity hierarchy in biology does not).
- **Verified:** citation-only (unconfirmed — search index matched https://auai.org/uai2012/papers/123.pdf)

### Callaway2018 — Callaway, F., Gul, S., Krueger, P.M., Griffiths, T.L. & Lieder, F. (2018). Learning to select computations. UAI 2018. arXiv:1711.06892. (+ Callaway, F., van Opheusden, B., Gul, S., et al. 2022, "Rational use of cognitive resources in human planning", Nature Human Behaviour 6:1112–1125, doi:10.1038/s41562-022-01332-8; Lieder, F. & Griffiths, T.L. 2020, "Resource-rational analysis", Behav. Brain Sci. 43:e1, doi:10.1017/S0140525X1900061X)
- **Key result:** Bayesian metalevel policy search (BMPS): a domain-general learning algorithm approximating the optimal selection of computations; the 2022 NHB paper shows humans strike a near-optimal reward-vs-computation-cost balance; resource-rational analysis formalises cognition as optimal use of limited computation.
- **Relevance:** "Learning to select computations" is the literal phrase for Physics-to-Life's controller; BMPS is a candidate learning algorithm and a naming precedent.
- **Limitations:** Small discrete planning tasks with known computation semantics; no physical simulators, fidelity hierarchies, spatial structure, or interventions.
- **Design implication for Physics-to-Life:** Position the programme as resource-rational metareasoning over simulators; run BMPS-style policy search as a controller ablation.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://arxiv.org/abs/1711.06892 and https://www.nature.com/articles/s41562-022-01332-8)

### ACT — Graves, A. (2016). Adaptive computation time for recurrent neural networks. arXiv:1603.08983. (+ Banino, A., Balaguer, J. & Blundell, C. 2021, "PonderNet: Learning to ponder", arXiv:2107.05407)
- **Key result:** Networks learn how many computation steps to spend per input (halting unit with a ponder cost); PonderNet adapts computation to problem complexity with a probabilistic halting policy and improves extrapolation.
- **Relevance:** Learned *amount* of computation per instance — the WHEN/how-much axis for a purely learned surrogate.
- **Limitations:** Homogeneous computation (more steps of the same network), not heterogeneous fidelities; no mechanistic fallback; no target-observable structure.
- **Design implication for Physics-to-Life:** If the surrogate is iterative, an ACT-style ponder cost is a cheap baseline for "spend more surrogate compute" versus "call the mechanistic model".
- **Novelty threat:** none–partial.
- **Verified:** citation-only (unconfirmed — search index matched https://arxiv.org/abs/1603.08983 and https://arxiv.org/abs/2107.05407)

### OCBA — Chen, C.-H., Lin, J., Yücesan, E. & Chick, S.E. (2000). Simulation budget allocation for further enhancing the efficiency of ordinal optimization. Discrete Event Dynamic Systems 10:251–270. doi:10.1023/A:1008349927281
- **Key result:** Optimal Computing Budget Allocation: allocate simulation replications across competing designs to maximise the probability of correctly selecting the best; reported speed-up factor above 20 beyond ordinal optimisation on a 210-design example.
- **Relevance:** The simulation-community's canonical value-of-computation allocation; if the programme's "intervention" is a choice among candidate interventions, OCBA-style allocation of high-fidelity runs across candidates is the classical answer.
- **Limitations:** Allocates replications, not fidelity or subsystems; assumes i.i.d. noisy evaluations; no learning, no structure.
- **Design implication for Physics-to-Life:** For "which intervention is best" tasks include OCBA (and its multi-fidelity ranking-and-selection descendants) as a baseline.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://link.springer.com/article/10.1023/A:1008349927281)

## Thread 9 — Learned surrogates with mechanistic hybrids / fallback, and learned fidelity selection in RL

### Kochkov2021 — Kochkov, D., Smith, J.A., Alieva, A., Wang, Q., Brenner, M.P. & Hoyer, S. (2021). Machine learning–accelerated computational fluid dynamics. PNAS 118(21):e2101784118. doi:10.1073/pnas.2101784118. (+ Stachenfeld, K., Fielding, D.B., Kochkov, D., Cranmer, M., Pfaff, T., Godwin, J., Cui, C., Ho, S., Battaglia, P. & Sanchez-Gonzalez, A. 2022, "Learned coarse models for efficient turbulence simulation", ICLR 2022, arXiv:2112.15275)
- **Key result:** Learned corrections inside a coarse classical solver match baseline solvers with 8–10× finer resolution per dimension, i.e. 40–80× speed-ups, for 2D turbulence (DNS and LES), generalising beyond training data; Stachenfeld et al. train fully learned coarse simulators that beat classical solvers at equal low resolution.
- **Relevance:** State of the art for the "cheap learned coarse model" tier; shows learned coarse models can replace fine physics uniformly — the programme's controller must beat *uniform* learned coarsening, not just uniform high fidelity.
- **Limitations:** No fallback/switching to the high-fidelity model at run time; no uncertainty gating; failure modes out of distribution are known but not controlled; no interventions.
- **Design implication for Physics-to-Life:** "Uniform learned coarse model" is a required baseline; the programme's gains must be reported relative to it, not only relative to uniform high fidelity.
- **Novelty threat:** none (no selection), but sets the bar.
- **Verified:** yes (https://github.com/google/jax-cfd — official code README citing PNAS 118(21)). Stachenfeld et al.: citation-only (search index matched https://arxiv.org/abs/2112.15275v3)

### MFHRL-IGM — Sifaou, H. & Simeone, O. (2025). Multi-fidelity hybrid reinforcement learning via information gain maximization. arXiv:2509.14848. (+ Cutler, M., Walsh, T.J. & How, J.P. 2015, "Real-world reinforcement learning via multifidelity simulators", IEEE Trans. Robotics 31(3):655–671, doi:10.1109/TRO.2015.2419431)
- **Key result:** A hybrid offline–online RL algorithm that trains multiple hybrid policies for uncertainty quantification and *dynamically selects the simulator fidelity level by maximising information gain per unit cost*. Cutler et al. (2015) earlier let an agent choose to run trajectories in the lowest-fidelity simulator that still yields useful information, with sample-complexity proofs and RC-car experiments.
- **Relevance:** Learned/adaptive fidelity selection with an explicit information-per-cost criterion, 2025 — the most recent general-purpose instance of "learned WHEN to pay for high fidelity".
- **Limitations:** Fidelity chosen globally per episode/batch for policy learning, not per subsystem of a coupled simulation; objective is policy return, not intervention-effect prediction; no biology, no causal targeting.
- **Design implication for Physics-to-Life:** Implement an information-gain-per-cost fidelity selector as a baseline for the WHEN decision; the programme's added value must be the WHERE (subsystem) and target-causal components.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://arxiv.org/abs/2509.14848 and https://ieeexplore.ieee.org/document/7106543/)

### Dyer2024 — Dyer, J., Bishop, N., Felekis, Y., Zennaro, F.M., Calinescu, A., Damoulas, T. & Wooldridge, M. (2024). Interventionally consistent surrogates for complex simulation models. NeurIPS 37. (arXiv:2312.11158, "Interventionally consistent surrogates for agent-based simulators")
- **Key result:** Using causal abstraction, trains surrogates of expensive (agent-based) simulators to be consistent with the simulator *under interventions*; shows conventionally trained surrogates can misjudge intervention effects and misguide decision-makers, whereas interventionally consistent surrogates closely mimic the simulator under the interventions of interest. Code evaluates ODE-, ODE+RNN- and latent-RNN-based surrogate families.
- **Relevance:** Direct precedent for the programme's *intervention* axis: a learned cheap model that is correct about intervention effects, not just observational fit.
- **Limitations:** No fidelity control, no run-time decision about when to call the simulator, no spatial/subsystem allocation; consistency is enforced for a pre-specified intervention set.
- **Design implication for Physics-to-Life:** Train the cheap tier for interventional consistency (Dyer-style) *before* adding the controller; otherwise improvements may be attributable to fixing an interventionally inconsistent surrogate rather than to fidelity selection.
- **Novelty threat:** partial (direct on interventional surrogates; none on fidelity selection).
- **Verified:** yes (https://github.com/joelnmdyer/neurips_ics4csm — official code README with the NeurIPS 2024 citation)

## Thread 10 — 2023–2026: multi-fidelity inference and allocation in biomedical / biological settings

### MFNPE — Krouglova, A.N., Johnson, H.R., Confavreux, B., Deistler, M. & Gonçalves, P.J. (2025). Multifidelity simulation-based inference for computationally expensive simulators. arXiv:2502.08416 (listed as ICLR 2026)
- **Key result:** Multifidelity neural posterior estimation: pre-train the density estimator on cheap low-fidelity simulations, refine with few high-fidelity ones; a *sequential* variant uses an acquisition targeting the estimator's predictive uncertainty to choose which high-fidelity parameters to simulate. Reported up to two orders of magnitude fewer high-fidelity simulations on benchmark and neuroscience tasks.
- **Relevance:** A 2025 learned "when to run the expensive simulator" scheme in a neuroscience context; shows the community is converging on adaptive HF-call selection for biological simulators.
- **Limitations:** Objective is posterior estimation of parameters, not intervention prediction; global (which parameter settings), not which subsystem; no causal targeting.
- **Design implication for Physics-to-Life:** For any calibration step, MF-NPE is the baseline; make sure the programme's evaluation is on intervention prediction, where MF-NPE does not directly apply.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://arxiv.org/abs/2502.08416)

### Fleeter2020 — Fleeter, C.M., Geraci, G., Schiavazzi, D.E., Kahn, A.M. & Marsden, A.L. (2020). Multilevel and multifidelity uncertainty quantification for cardiovascular hemodynamics. Comput. Methods Appl. Mech. Eng. doi:10.1016/j.cma.2020.113030
- **Key result:** Multilevel-multifidelity Monte Carlo over three cardiovascular model fidelities (3D, 1D, 0D) accelerates convergence of hemodynamic QoI statistics by 10–100×, working best for global QoIs and still effective for local ones.
- **Relevance:** Multi-fidelity allocation on a *biological* multiscale system with a real fidelity hierarchy; the best documented biology-side MLMF baseline.
- **Limitations:** Allocation is by variance/cost per level (classical), fixed across the domain; not learned; no interventions beyond parameter uncertainty; no per-region choice.
- **Design implication for Physics-to-Life:** Any cardiovascular-type virtual system should include an MLMF estimator with optimal allocation as the classical competitor.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://pubmed.ncbi.nlm.nih.gov/32336811/ and https://arxiv.org/abs/1908.04875)

### SensSurrogate2025 — Cangelosi, J.R. & Heinkenschloss, M. (2025). Sensitivity-driven adaptive surrogate modeling for simulation and optimization of dynamical systems. arXiv:2509.04651 (SIAM J. Sci. Comput., doi:10.1137/25M1813469 listed)
- **Key result:** Adaptive refinement of component-function surrogates inside a dynamical-system simulation, choosing new evaluation points by combining *solution sensitivity* information with pointwise error estimates — i.e. refine the surrogate where errors matter for the solution/objective.
- **Relevance:** A sensitivity-weighted (adjoint-like) criterion for *where to refine a learned/component surrogate*, 2025 — the closest recent hand-designed analogue to causal-relevance-driven refinement of a surrogate.
- **Limitations:** Requires sensitivities of a smooth dynamical system; not learned, not stochastic/agent-based, no fidelity hierarchy beyond surrogate-vs-true component, no interventions.
- **Design implication for Physics-to-Life:** Include a sensitivity×error refinement rule as a baseline for the surrogate tier; demonstrate benefit on systems where sensitivities are unavailable or misleading (discrete, stochastic).
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed — search index matched https://arxiv.org/abs/2509.04651)

---

## Novelty verdict for this cluster

**Already done.** (1) Optimal budget allocation across a fidelity hierarchy for a fixed quantity of interest: MLMC/MFMC and adaptive/bandit variants (Giles 2008; Peherstorfer et al. 2016/2019; Xu et al. 2022; Fleeter et al. 2020 in biology, 10–100×). (2) Deciding *when* to buy a high-fidelity evaluation by value-of-information per unit cost: MF-GP-UCB, misoKG/taKG, DMFAL/BMFAL-BC, and 2025 RL/SBI instances (MF-HRL-IGM; MF-NPE, up to 100× fewer HF runs). (3) Learned *where*-to-refine policies with error-vs-cost rewards, including anticipatory refinement: RL-AMR (Yang 2023; Foucart 2023; DynAMO 2024; ASMR 2023, >10–30× vs uniform). (4) Refinement by *relevance to a target quantity*: goal-oriented DWR and goal-oriented model adaptivity (Becker & Rannacher 2001; Oden & Vemaganti 2000; Braack & Ern 2003), with learned DWR indicators (E2N 2022). (5) Uncertainty-triggered fallback from surrogate to mechanistic solver (FLARE, DP-GEN, MTP, committee NNPs) and learned per-region physics-validity classifiers (Xiao 2023). (6) Rule-based per-subsystem fidelity in biology (adaptive hybrid SSA/ODE, Hepp 2015; spatial hybrids, Smith & Yates 2018). (7) **MuMMI** (Bhatia 2021; Ingólfsson 2022): ML already selects which patches of a biological macro-model get expensive micro-simulation, with feedback, at scale. (8) Interventionally consistent surrogates (Dyer 2024). (9) The metareasoning/VOC framing (Russell & Wefald 1991; Hay 2012; Callaway 2018).

**Still open.** No located work (a) learns a *per-subsystem* fidelity policy over {learned surrogate, coarse mechanistic, high-fidelity mechanistic}; (b) selects by *causal relevance to a target observable under a specified intervention* (existing criteria: uncertainty, novelty, local error, proximity, abundance, observational adjoint sensitivity); (c) scores *computation-selection correctness* against hidden ground truth separately from prediction error; or (d) shows causal-relevance selection differs from and beats uncertainty/novelty/proximity selection at matched compute. The combination is open; every component exists. Framing: "learned goal-oriented model adaptivity for intervention prediction in stochastic, non-differentiable biological multiscale systems", positioned explicitly against MuMMI and goal-oriented model adaptivity.

**Mandatory baselines.** Uniform high fidelity; uniform learned coarse model (Kochkov-style); MFMC/MLMF with optimal allocation for the target; misoKG/MF-GP-UCB information-per-cost WHEN-selector; RL-AMR policy with local-error reward (ASMR/Yang protocol); adjoint/DWR allocation and Oden–Vemaganti model adaptivity wherever an adjoint exists; FLARE/DP-GEN uncertainty-threshold fallback; MuMMI/DeepDriveMD novelty-driven selection; proximity-based partitioning (adaptive QM/MM-style); Hepp-style abundance/propensity hybrid partitioning; Dyer-style interventionally consistent surrogate as the cheap tier.

**Adversarial controls.**
1. *Causal-blind ablation:* same controller, reward swapped for local error, surrogate uncertainty, or latent novelty; if any ties on prediction *and* selection correctness, the causal criterion is idle.
2. *Adjoint-oracle control:* on differentiable virtual systems give a DWR/adjoint allocator the same budget; the controller must match it there and beat it on stochastic/discrete systems where adjoints fail.
3. *Proximity–causality dissociation:* build systems where the causally relevant subsystem is far from both intervention site and observable while a nearby subsystem has large local error but no causal effect; report selection accuracy versus a proximity heuristic.
4. *Decoy-uncertainty test:* inject high surrogate uncertainty into an irrelevant subsystem; a VOC controller should not refine it, FLARE/DP-GEN triggers will — score both.
5. *Surrogate-fix confound (2×2):* conventional vs interventionally consistent surrogate × with/without controller, at matched total compute including controller inference, plus transfer to a new target observable without surrogate retraining.
