# Adversarial novelty scan: the six-element conjunction

**Scan date:** 2026-09-14. **Scope:** an adversarial search for prior work that already performs
the *conjunction* now claimed by Physics-to-Life, or large parts of it:

1. **target-conditioned causal relevance** — refinement selected by expected effect on a *requested*
   observable / intervention outcome, not by unusual local state, novelty, or local error;
2. **selection correctness** — scoring, against hidden virtual ground truth, of whether the *right*
   missing physics was requested (precision / recall / waste / miss of the refined set), separately
   from prediction error;
3. **value of computation** — ranking computations by expected improvement of the *target* prediction
   per unit cost, including interactions between refinements;
4. **cross-scale intervention prediction** — predicting the effect of a perturbation, not reproducing
   a trajectory;
5. **inverse biological design / functional restoration** — searching the same learned world model for
   state-changing interventions (e.g. restoring a wild-type electrophysiological response after a
   virtual channel defect);
6. **validation progression** — synthetic hidden ground truth → experimentally grounded *Drosophila*
   biophysics → historical holdouts → prospective biology.

The programme does **not** claim novelty for "ML chooses simulation fidelity" (MuMMI) or "learned and
mechanistic multiscale simulators are coupled" (LED family). Those are settled prior art and are
treated here as baselines.

## Reachable hosts (this session)

Egress is severely restricted. Reachability was tested host by host; the result is unusually lopsided,
so every citation below carries an explicit status.

**Reachable and opened:** `github.com` and `raw.githubusercontent.com` only.

**Blocked by the egress proxy (each returned `EGRESS_BLOCKED` or a 403 CONNECT):** doi.org,
arxiv.org, export.arxiv.org, api.crossref.org, api.semanticscholar.org, api.openalex.org,
pubmed.ncbi.nlm.nih.gov, pmc.ncbi.nlm.nih.gov, www.ncbi.nlm.nih.gov, europepmc.org,
www.nature.com, www.pnas.org, www.science.org, www.sciencedirect.com, pubs.acs.org, link.springer.com,
dl.acm.org, ieeexplore.ieee.org, epubs.siam.org, royalsocietypublishing.org, academic.oup.com,
iopscience.iop.org, journals.plos.org, elifesciences.org, www.frontiersin.org, www.cambridge.org,
www.tandfonline.com, arc.aiaa.org, proceedings.mlr.press, proceedings.neurips.cc, openreview.net,
dblp.org, ui.adsabs.harvard.edu, www.osti.gov, www.pnnl.gov, zenodo.org, scholar.archive.org,
www.semanticscholar.org, paperswithcode.com, huggingface.co, web.archive.org, r.jina.ai, modeldb.science,
www.wikidata.org, escholarship.org, hal.science, orbi.uliege.be, aaltodoc.aalto.fi, papers.ssrn.com,
ouci.dntb.gov.ua, biorxiv.org, chemrxiv.org, researchgate.net, and every institutional host tried
(oden.utexas.edu, kiwi.oden.utexas.edu, cse-lab.seas.harvard.edu, www.cse-lab.ethz.ch,
projects.iq.harvard.edu, www.sci.utah.edu, sc19.supercomputing.org, auai.org, mir-group.github.io,
aiichironakano.github.io, www.llnl.gov, bbs.llnl.gov, computational.cancer.gov, as.tufts.edu,
mackelab.org, cs.ox.ac.uk, ora.ox.ac.uk, collaborate.princeton.edu, mlanthology.org, users.cs.utah.edu).

**Consequence for status labels:**
- **Verified: yes (URL)** — a page was opened that states title + authors + venue. In this session that
  means a GitHub repository or organisation page carrying the citation (often with DOI).
- **citation-only (unconfirmed)** — the record comes from search-result snippets only, with the matched
  URL given. Titles, authors, venues and DOIs recorded this way are *not* publisher-confirmed and must
  be re-verified from a session with publisher access before any manuscript use. No DOI or author list
  in this file was invented; where a snippet did not state a DOI, none is given.

---

## Part A — the direct comparators

### MuMMI-SC19 — Di Natale, F., Bhatia, H., Carpenter, T.S., Ingólfsson, H.I., et al. (2019). A massively parallel infrastructure for adaptive multiscale simulations: modeling RAS initiation pathway for cancer. SC '19 (Best Paper). doi:10.1145/3295500.3356197
- **What it does:** the MuMMI workflow infrastructure: a continuum macro model of a RAS–membrane system
  spawns coarse-grained (Martini) MD "patches" on demand, at Sierra scale, with in-situ analysis and an
  ML-based selection component choosing which patches to simulate.
- **Selection criterion:** **novelty / diversity**, not target relevance. The selection component is
  DynIm (below), whose importance score is dissimilarity from already-selected samples in a learned
  latent space — farthest-point sampling over phase space.
- **Interventions evaluated?** No. The scientific goal is exhaustive sampling of the phase space the
  macro model visits; no perturbation is applied and no intervention outcome is predicted.
- **Selection correctness scored?** No. Reported metrics are throughput, GPU occupancy, coverage of
  latent space and biological findings — not precision/recall of the selected set against a known
  "should have been refined" set.
- **Inverse design?** No.
- **Overlap with the conjunction:** none of 1–6 directly. It establishes *learned "where to spend
  micro-scale compute" in a biological multiscale simulation* plus micro→macro feedback, which is why
  the programme must not claim that as novel.
- **Verified:** yes (https://github.com/mummi-framework/mummi-core — README carries the full citation
  with DOI; https://github.com/mummi-framework)

### MuMMI-DynIm — Bhatia, H. & Moon, J.Y. (2020). DynIm (Dynamic-Importance Sampling), v0.1. LLNL-CODE-813147.
- **What it does:** the actual selection engine used by MuMMI. Ranks candidate samples for promotion to
  expensive simulation.
- **Selection criterion:** verbatim from the README: *"DynIm uses the notion of 'dissimilarity' from
  previously selected samples to define the importance of potential selections, and selects the ones
  that are most dissimilar"* — a **farthest-point sampling approach** using L2 distances (exact or
  approximate, via faiss) in the provided high-dimensional space. There is no observable, no target, no
  cost model and no error model in the criterion.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap with the conjunction:** none. This is the cleanest available evidence that MuMMI's
  "importance" is novelty, and it is directly quotable in Paper 0/1 to separate the claims.
- **Verified:** yes (https://github.com/LLNL/dynim)

### MuMMI-NMI — Bhatia, H., Carpenter, T.S., Ingólfsson, H.I., et al. (2021). Machine-learning-based dynamic-importance sampling for adaptive multiscale simulations. Nature Machine Intelligence 3:401–409. doi:10.1038/s42256-021-00327-w
- **What it does:** the method paper for MuMMI's ML selection: a learned latent representation of
  membrane patches drives dynamic-importance sampling of which macro states receive CG-MD, with
  automatic micro→macro feedback so macro-scale fidelity improves from the micro results.
- **Selection criterion:** **importance = novelty in a learned latent space** (dynamic importance
  sampling; DynIm). Not target-conditioned; no quantity of interest enters.
- **Interventions evaluated?** No. **Selection correctness scored?** No (validation is by phase-space
  coverage and agreement of macro with micro, not by a scored refinement set).
- **Inverse design?** No.
- **Overlap:** none of 1–6; establishes prior art for "learned fidelity choice + cross-scale feedback".
- **Verified:** citation-only (unconfirmed). The DOI, volume and page range are taken from the citation
  block on https://github.com/mummi-framework/mummi-ras (a page I opened); the article itself
  (www.nature.com) is blocked, so the abstract-level description above rests on the repository text and
  search snippets.

### MuMMI-PNAS — Ingólfsson, H.I., Bhatia, H., et al. (2022). Machine learning–driven multiscale modeling reveals lipid-dependent dynamics of RAS signaling proteins. PNAS 119(1). doi:10.1073/pnas.2113297119
- **What it does:** the biology application: >100,000 CG simulations of active wild-type KRAS on an
  asymmetric membrane, scale-bridged by the MuMMI selection machinery; reports lipid fingerprints
  correlated with RAS multimerisation.
- **Selection criterion:** as MuMMI-NMI (novelty-based importance sampling).
- **Interventions evaluated?** No — a mutant/perturbation *outcome* is not predicted; wild-type
  behaviour is characterised. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** none of 1–6.
- **Verified:** citation-only (unconfirmed) — citation and DOI read off
  https://github.com/mummi-framework/mummi-ras; www.pnas.org blocked.

### MuMMI-3scale — Ingólfsson, H.I., Bhatia, H., et al. (2023). Machine learning-driven multiscale modeling: bridging the scales with a next-generation simulation infrastructure. J. Chem. Theory Comput. 19(9):2658–2675. doi:10.1021/acs.jctc.2c01018. (Workflow paper: Bhatia, H., et al. (2021). Generalizable coordination of large multiscale workflows: challenges and learnings at scale. SC '21. doi:10.1145/3458817.3476210)
- **What it does:** three-scale MuMMI — continuum → coarse-grained → all-atom — with adjacent scales
  coupled pairwise by ML and in-situ feedback in both directions. **Note for Paper 0:** the brief's
  "Bhatia et al. 2023, Nature Computational Science" appears to be a mis-citation; the three-scale paper
  is Ingólfsson et al. 2023 in JCTC, and the 2021 scaling paper is Bhatia et al. at SC '21.
- **Selection criterion:** ML-based promotion between adjacent scales (same importance-sampling family);
  the MuMMI-RAS README describes ML models that "identify and quantify states from simulations" and
  "automatically signal change of resolution". No target observable; no cost/benefit ratio.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** none of 1–6; strongest prior art for hierarchical learned promotion with two-way feedback.
- **Verified:** citation-only (unconfirmed) — citations, DOIs, volume and pages read off
  https://github.com/mummi-framework/mummi-ras (opened); pubs.acs.org and dl.acm.org blocked.

### LED — Vlachas, P.R., Arampatzis, G., Uhler, C. & Koumoutsakos, P. (2022). Multiscale simulations of complex systems by learning their effective dynamics. Nature Machine Intelligence 4:359–366. doi:10.1038/s42256-022-00464-w
- **What it does:** autoencoder + probabilistic RNN propagate the system in a learned latent space
  ("macro" steps) interleaved with bursts of the original fine-scale solver ("micro" steps), in the
  equation-free spirit.
- **Selection criterion:** **a fixed schedule** (alternating T_micro / T_macro windows). No uncertainty
  trigger, no error trigger, no target. The LED repository README states the citation but contains no
  adaptive switching rule — consistent with the fixed-ratio design that AdaLED was written to replace.
- **Interventions evaluated?** No — trajectory/statistics reproduction. **Selection correctness scored?**
  No. **Inverse design?** No.
- **Overlap:** none of 1–6. This is the baseline the programme's routing must beat at matched compute;
  "adaptive" is only a contribution if it wins that comparison.
- **Verified:** yes for title/authors/venue/year (https://github.com/cselab/LED); DOI is citation-only
  (search snippet: www.nature.com/articles/s42256-022-00464-w).

### AdaLED — Kičić, I., Vlachas, P.R., Arampatzis, G., Chatzimanolakis, M., Guibas, L. & Koumoutsakos, P. (2023). Adaptive learning of effective dynamics for online modeling of complex systems. Computer Methods in Applied Mechanics and Engineering 415:116204.
- **What it does:** online adaptive version of LED — an autoencoder plus an **ensemble of probabilistic
  RNNs** as latent time-stepper, trained on the fly, alternating with the original solver.
- **Selection criterion:** **uncertainty and error on the state**, explicitly *not* a target. From the
  repository README (opened): *"AdaLED replaces the original simulator with the surrogate only when the
  prediction error is below a user-specified threshold"*, and the ensemble gives a confidence such that
  *"depending on the confidence, AdaLED will utilize the surrogate for more or fewer time steps"* before
  returning control. Search snippets add the formal rule: the macro-only stage ends once ensemble
  uncertainty σ exceeds a threshold σ_max.
- **Interventions evaluated?** No. **Selection correctness scored?** No — the reported metrics are
  speed-up and trajectory error, not the correctness of the switch decisions.
- **Inverse design?** No.
- **Overlap:** none of 1–6. It is the canonical *uncertainty-triggered* baseline (E-condition analogue).
- **Verified:** yes for title/authors and the switching rule (https://github.com/cselab/adaled);
  journal/volume/article number are citation-only (unconfirmed)
  (snippets: sciencedirect.com/science/article/abs/pii/S0045782523003286; ADS 2023CMAME.41516204K).

### iLED — Menier, E., Kaltenbach, S., Yagoubi, M., Schoenauer, M. & Koumoutsakos, P. (2025). Interpretable learning of effective dynamics for multiscale systems. Proceedings of the Royal Society A 481(2305):20240167.
- **What it does:** LED with a Mori–Zwanzig / Koopman-motivated latent propagator (explicit linear +
  nonlinear parts) for interpretability; benchmarks FitzHugh–Nagumo, Kuramoto–Sivashinsky, cylinder flow.
- **Selection criterion:** none relevant — the contribution is the propagator's structure, not a
  fidelity-routing rule.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** none of 1–6.
- **Verified:** citation-only (unconfirmed) (snippets: royalsocietypublishing.org/doi/10.1098/rspa.2024.0167;
  arXiv 2309.05812). Note the brief's guess of "Vlachas & Koumoutsakos" is wrong: first author is Menier.

### G-LED — Gao, H., Kaltenbach, S. & Koumoutsakos, P. (2024). Generative learning for forecasting the dynamics of high-dimensional complex systems. Nature Communications 15:8904. doi:10.1038/s41467-024-53165-w
- **What it does:** attention-based autoregressive propagation on a coarse manifold plus Bayesian
  diffusion models mapping back to the high-dimensional space; targets *statistics* of KS, backward-facing
  step and turbulent channel flow.
- **Selection criterion:** none — no adaptive call to the fine solver at all.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** none of 1–6.
- **Verified:** yes (https://github.com/cselab/G-LED — README citation block gives title, authors,
  journal, volume, article number and DOI).

### VlachasRNN2020 — Vlachas, P.R., Pathak, J., Hunt, B.R., Sapsis, T.P., Girvan, M., Ott, E. & Koumoutsakos, P. (2020). Backpropagation algorithms and reservoir computing in recurrent neural networks for the forecasting of complex spatiotemporal dynamics. Neural Networks 126:191–217. doi:10.1016/j.neunet.2020.02.016
- **What it does:** the forecasting backbone underlying LED; compares BPTT-trained gated RNNs against
  reservoir computing on Lorenz-96 and KS.
- **Selection criterion / interventions / correctness scoring / inverse design:** none.
- **Overlap:** none of 1–6.
- **Verified:** yes (https://github.com/pvlachas/RNN-RC-Chaos).

### GoalOriented-Classical — Oden, J.T. & Vemaganti, K.S. (2000). Estimation of local modeling error and goal-oriented adaptive modeling of heterogeneous materials I. J. Comput. Phys. 164(1):22–47. | Oden, J.T. & Prudhomme, S. (2002). Estimation of modeling error in computational mechanics. J. Comput. Phys. 182:496–515. | Braack, M. & Ern, A. (2003). A posteriori control of modeling errors and discretization errors. Multiscale Model. Simul. 1(2):221–238. doi:10.1137/S1540345902410482 | Becker, R. & Rannacher, R. (2001). An optimal control approach to a posteriori error estimation in finite element methods. Acta Numerica 10:1–102. doi:10.1017/S0962492901000010
- **What it does:** the dual-weighted-residual (DWR) framework and its *model*-adaptivity branch: solve an
  adjoint weighted by the quantity of interest, estimate each region's or submodel's contribution to the
  QoI error, and upgrade only those regions from the coarse model to the fine model.
- **Selection criterion:** **target-conditioned** — this is element 1, done in 2000–2003, by adjoint
  weighting rather than learning. Deterministic PDEs, differentiable operators, a linear-functional QoI.
- **Interventions evaluated?** No — the QoI is a functional of one solution, not the effect of a
  perturbation; no interventional semantics.
- **Selection correctness scored?** No — effectivity indices measure how well the *error estimate*
  matches the true QoI error, not whether the *set of upgraded submodels* was the right set.
- **Inverse design?** No.
- **Overlap:** element 1 (fully, in the adjoint setting). This, not MuMMI, is the sharpest threat to the
  "target-conditioned" half of the claim and must be the headline comparator in Paper 0/1.
- **Verified:** citation-only (unconfirmed) (snippets confirm titles/venues/years; the Braack–Ern DOI
  appears on explore.openaire.eu and the Becker–Rannacher DOI on cambridge.org, both blocked to me).

### GoalOriented-Extensions — van Opstal, T.M., Bauman, P.T., Prudhomme, S. & van Brummelen, E.H. (2015). Goal-oriented model adaptivity for viscous incompressible flows. Computational Mechanics 55(6):1181. | Li, H., Garg, V. & Willcox, K. (2017). Model adaptivity for goal-oriented inference using adjoints. Computer Methods in Applied Mechanics and Engineering 325. | Oden, J.T. (2018). Adaptive multiscale predictive modelling. Acta Numerica 27:353–450.
- **What it does:** van Opstal et al. locally replace a coarse Stokes boundary-integral model by the
  Navier–Stokes model wherever the estimated QoI error demands it — literally "which physics to compute
  where", QoI-driven. Li–Garg–Willcox extend model adaptivity to *goal-oriented inference*: the mixed-
  fidelity model is adapted so that the error in a QoI *computed from inferred parameters* is minimised —
  i.e. fidelity is allocated for a downstream target, through an inverse problem. Oden 2018 is the review.
- **Selection criterion:** target-conditioned, adjoint/error-estimator-driven.
- **Interventions evaluated?** No (a QoI-after-inference is still not an intervention outcome).
- **Selection correctness scored?** No. **Inverse design?** No (inference, not design).
- **Overlap:** element 1 fully; element 3 partially (error-per-upgrade ranking; cost usually implicit).
- **Verified:** citation-only (unconfirmed) (snippets: link.springer.com/article/10.1007/s00466-015-1146-1;
  sciencedirect.com/.../S0045782516318151; cambridge.org Acta Numerica 27:353–450).

### LearnedDWR — Roth, J., Schröder, M. & Wick, T. (2022). Neural network guided adjoint computations in dual weighted residual error estimation. SN Applied Sciences. (arXiv:2102.12450) | Wallwork, J.G. et al. (2022). E2N: error estimation networks for goal-oriented mesh adaptation. arXiv:2207.11233 | "Multigoal-oriented dual-weighted-residual error estimation using deep neural networks" (arXiv:2112.11360) and a 2025 PINN variant.
- **What it does:** learns the adjoint solve or the goal-oriented error indicator itself, to avoid solving
  the dual problem; then marks elements for refinement as DWR would.
- **Selection criterion:** target-conditioned (learned surrogate *of* the adjoint indicator).
- **Interventions evaluated?** No. **Selection correctness scored?** No — accuracy of the indicator is
  measured, not set-level precision/recall of refinement decisions. **Inverse design?** No.
- **Overlap:** element 1, with learning — this is the closest existing thing to "learned goal-oriented
  adaptivity", but it is *mesh/discretisation* refinement in differentiable PDEs, not model selection in
  stochastic, discrete biology, and never under intervention.
- **Verified:** citation-only (unconfirmed) (arXiv listings via search; arxiv.org blocked).

### FLARE — Vandermause, J., Torrisi, S.B., Batzner, S., Xie, Y., Sun, L., Kolpak, A.M. & Kozinsky, B. (2020). On-the-fly active learning of interpretable Bayesian force fields for atomistic rare events. npj Computational Materials 6:20. doi:10.1038/s41524-020-0283-z
- **What it does:** Bayesian (GP) force field run inside MD; when the GP's predictive uncertainty on
  forces exceeds a threshold, DFT is called, the frame is labelled and the model updated.
- **Selection criterion:** **uncertainty on the local prediction**. Not target-conditioned, no cost/benefit
  ratio, no notion of which physics matters for a downstream observable.
- **Interventions evaluated?** No. **Selection correctness scored?** No (DFT-call counts and force/energy
  errors are reported). **Inverse design?** No.
- **Overlap:** none of 1–6; canonical uncertainty-triggered fallback baseline.
- **Verified:** yes for title/authors/venue/DOI (https://github.com/mir-group/flare, README citation [2]).

### DPGEN — Zhang, Y., Wang, H., Chen, W., Zeng, J., Zhang, L., Wang, H. & E, W. (2020). DP-GEN: a concurrent learning platform for the generation of reliable deep learning based potential energy models. Computer Physics Communications 253:107206. doi:10.1016/j.cpc.2020.107206
- **What it does:** explore → label → train loop; candidate configurations are selected when the ensemble
  **model deviation** (max std of predicted atomic forces) falls between trust bounds (trust_lo/trust_hi).
- **Selection criterion:** ensemble disagreement (uncertainty), with hand-set trust levels. Not target-
  conditioned; no VoC ratio.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** none of 1–6.
- **Verified:** yes for title/authors/venue/DOI (https://github.com/deepmodeling/dpgen); the
  trust-level mechanics are citation-only (documented in dpgen docs/paper, not in the README).

### misoKG — Poloczek, M., Wang, J. & Frazier, P.I. (2017). Multi-information source optimization. NeurIPS 30.
- **What it does:** Bayesian optimisation across biased, noisy, cheaper information sources with a
  knowledge-gradient acquisition.
- **Selection criterion:** **expected incremental gain per unit cost** — the repository states misoKG
  works by "maximizing the expected incremental gain per unit cost". This *is* element 3's ratio form,
  for the target "find the optimum of f".
- **Interventions evaluated?** No. **Selection correctness scored?** No (regret/optimum-quality is scored,
  not which sources should have been queried). **Inverse design?** No.
- **Overlap:** element 3 (for optimisation targets). Element 3 alone is not novel and must not be claimed.
- **Verified:** yes (https://github.com/misokg/NIPS2017).

### MFGPUCB / DMFAL / BMFAL-BC / DNN-MFBO — Kandasamy, K., Dasarathy, G., Oliva, J., Schneider, J. & Póczos, B. (2016). Gaussian process bandit optimisation with multi-fidelity evaluations. NeurIPS 29. | Li, S., Wang, Z., Kirby, R. & Zhe, S. (2022). Deep multi-fidelity active learning of high-dimensional outputs. AISTATS 151. | Li, S., et al. (2022). Batch multi-fidelity active learning with budget constraints. NeurIPS 35. | Li, S., Xing, W., Kirby, R. & Zhe, S. (2020). Multi-fidelity Bayesian optimization via deep neural networks. NeurIPS 33.
- **What it does:** choose *both* the query point and the fidelity, using information-gain-per-cost
  acquisitions; BMFAL-BC additionally selects *batches* under a budget, i.e. accounts for interactions
  between simultaneously chosen evaluations.
- **Selection criterion:** information gain (or improvement) per unit cost toward a fixed learning or
  optimisation target. Not an intervention outcome; the "target" is the surrogate or the optimum.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** element 3, including the batch/interaction refinement.
- **Verified:** yes for MF-GP-UCB (https://github.com/kirthevasank/mf-gp-ucb), DMFAL
  (https://github.com/shib0li/DMFAL) and DNN-MFBO (https://github.com/shib0li/DNN-MFBO); BMFAL-BC is
  citation-only (unconfirmed).

### Metareasoning — Russell, S.J. & Wefald, E. (1991). Principles of metareasoning. Artificial Intelligence 49:361–395. | Hay, N., Russell, S., Tolpin, D. & Shimony, S.E. (2012). Selecting computations: theory and applications. UAI 2012:346–355. | Callaway, F., Gul, S., Krueger, P.M., Griffiths, T.L. & Lieder, F. (2018). Learning to select computations. UAI 2018. | Callaway, F., et al. (2022). Rational use of cognitive resources in human planning. Nature Human Behaviour 6:1112–1125.
- **What it does:** formalises the **value of computation** (expected improvement in decision quality
  minus/over cost) and learns meta-level policies that select which computations to perform (BMPS).
- **Selection criterion:** target-conditioned *by construction* — computations are valued by their effect
  on the decision at hand; but the "simulator" is an abstract metalevel MDP, not physics.
- **Interventions evaluated?** No. **Selection correctness scored?** Partially: in small metalevel MDPs
  learned policies are compared to the *optimal* meta-policy, which is the ancestor of the programme's
  "oracle refinement set" comparison — but the comparison is on meta-level return, not on precision/recall
  of a selected set. **Inverse design?** No.
- **Overlap:** element 3 fully; element 1 in the abstract sense; element 2 in spirit.
- **Verified:** citation-only (unconfirmed) (snippets: sciencedirect 000437029190015C; auai.org/uai2012
  paper 123; arXiv 1711.06892; nature.com/articles/s41562-022-01332-8).

### OCBA — Chen, C.-H., Lin, J., Yücesan, E. & Chick, S.E. (2000). Simulation budget allocation for further enhancing the efficiency of ordinal optimization. Discrete Event Dynamic Systems 10:251–270.
- **What it does:** allocates a fixed simulation budget across designs to maximise the probability of
  correct selection.
- **Selection criterion:** expected gain in decision confidence per replication.
- **Interventions / selection-correctness of *computations* / inverse design:** no, no, no. (Note: OCBA's
  "probability of correct selection" refers to picking the best *design*, not to having refined the right
  physics — do not conflate the two in Paper 0.)
- **Overlap:** element 3.
- **Verified:** citation-only (unconfirmed) (snippet: link.springer.com/article/10.1023/A:1008349927281).

---

## Part B — searching for the conjunction itself

### HyPER — Srikishan, B., O'Malley, D., Mehana, M., Lubbers, N. & Muralidhar, N. (2025). Model-agnostic knowledge guided correction for improved neural surrogate rollout. ICLR 2025. (arXiv:2503.10048)
- **What it does:** the closest existing "learned when to spend the expensive compute": an RL policy
  (REINFORCE) decides, at each rollout step, whether to advance with the neural surrogate or invoke the
  non-differentiable simulator to correct the surrogate's state; reported 47–78% reduction in
  in-distribution rollout error, with a cost parameter λ ("what percentage to use the simulator for each
  trajectory", default 0.3) trading accuracy against simulator calls.
- **Selection criterion:** **learned, cost-aware, state-error-driven** — the reward is built from rollout
  error against the full state plus a simulator-use penalty. It is *not* conditioned on a requested
  observable, and it is binary in time (call/don't call), not a choice of *which sub-model or which
  physics* to refine.
- **Interventions evaluated?** No (Navier–Stokes rollouts; adaptation to "changing physical conditions"
  is robustness, not intervention prediction).
- **Selection correctness scored?** No — error and cost are reported; whether the policy called the
  simulator at the *right* steps is never scored against a ground-truth "needed correction" set.
- **Inverse design?** No.
- **Overlap:** element 3 (partially: cost-aware learned allocation, no explicit E[ΔError]/cost);
  nothing of 1, 2, 4, 5, 6. **This is the mandatory baseline for "learned routing beats fixed/threshold
  routing"** and the closest competitor for the word "learned" in the claim.
- **Verified:** yes for title/authors/venue and the λ cost parameter (https://github.com/scailab/HyPER).

### MFCausalDiscovery — Zhang, Z., Li, C., Chen, X. & Xie, X. (2023). Bayesian active causal discovery with multi-fidelity experiments. NeurIPS 36.
- **What it does:** active causal structure learning where experiments can be run at multiple fidelities
  (cheaper/noisier vs. expensive/precise); a probabilistic model plus an acquisition trades fidelity cost
  against information about the causal graph.
- **Selection criterion:** value of information per cost, **with a causal target** (the graph).
- **Interventions evaluated?** Yes in the experimental-design sense (interventional experiments are the
  actions), but the object predicted is a graph, not a cross-scale intervention outcome.
- **Selection correctness scored?** The *scientific output* (edges) is scored against ground truth; the
  *computation selection* is not. **Inverse design?** No.
- **Overlap:** elements 3 + partially 4. The tightest existing pairing of multi-fidelity allocation with a
  causal target — cite it explicitly, since a reviewer will.
- **Verified:** citation-only (unconfirmed) (snippets: proceedings.neurips.cc .../c9d9659d...; dl.acm.org).

### RESCUE — Hossen, M.A., Javidian, M.A., Narayanan, V., O'Kane, J.M. & Jamshidi, P. (2026). Multi-objective multi-fidelity Bayesian optimization with causal priors. (arXiv:2602.00788)
- **What it does:** multi-fidelity BO in which a causal model learned from observational data supplies
  priors relating inputs and objectives across fidelities, to fix misaligned low-fidelity proxies.
- **Selection criterion:** acquisition per cost, causally informed. Not per-subsystem physics refinement.
- **Interventions evaluated?** No (causal structure is a prior, not the prediction target).
- **Selection correctness scored?** No. **Inverse design?** No (design optimisation, not biological repair).
- **Overlap:** element 3, weakly 1.
- **Verified:** citation-only (unconfirmed) (snippet: arxiv.org/abs/2602.00788).

### Dyer2024 — Dyer, J., Bishop, N., Felekis, Y., Zennaro, F.M., Calinescu, A., Damoulas, T. & Wooldridge, M. (2024). Interventionally consistent surrogates for complex simulation models. NeurIPS 2024.
- **What it does:** formalises, via causal abstraction, what it means for a surrogate to agree with its
  simulator *under interventions*, and trains surrogates for that property; shows conventionally trained
  surrogates misjudge intervention effects and mislead decision-makers.
- **Selection criterion:** none — no fidelity control at all. **Interventions evaluated?** Yes, centrally.
- **Selection correctness scored?** No. **Inverse design?** No (policy evaluation, not search).
- **Overlap:** element 4. The programme must not claim novelty for "surrogates must be interventionally
  consistent"; the open part is doing it *with* fidelity routing and scored selection.
- **Verified:** yes for title/authors/venue (https://github.com/joelnmdyer/neurips_ics4csm).

### StructHybrid — Meir, T., Linial, O., Eytan, D. & Shalit, U. (2026). Structured hybrid mechanistic models for robust estimation of time-dependent intervention outcomes. (arXiv:2602.11350)
- **What it does:** decomposes a dynamical system's transition operator into parametric (mechanistic) and
  nonparametric parts, and separates intervention-related from intervention-unrelated dynamics, to
  estimate time-dependent treatment effects out of distribution.
- **Selection criterion:** none (no compute allocation). **Interventions evaluated?** Yes.
- **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** element 4 in a hybrid mechanistic/learned setting — the nearest 2026 work to "intervention
  prediction with a mechanistic core", and therefore a likely reviewer comparison.
- **Verified:** citation-only (unconfirmed) (snippet: arxiv.org/abs/2602.11350v1).

### PartialSimulation — Bass, I., Smith, K.A., Bonawitz, E. & Ullman, T.D. (2021). Partial mental simulation explains fallacies in physical reasoning. Cognitive Neuropsychology 38(7–8):413–424. (+ Hamrick, J.B., Smith, K.A., Griffiths, T.L. & Vul, E. (2015). Think again? The amount of mental simulation tracks uncertainty in the outcome. CogSci 2015)
- **What it does:** models people as simulating forward only the parts of a scene deemed *relevant*, where
  an object's relevance is defined as **the difference that object makes to the predicted outcome** —
  computed by comparing the simulated outcome with the outcome had the object been removed or altered.
- **Selection criterion:** **target-conditioned causal relevance, defined as an interventional
  difference** — conceptually element 1 (and a leave-one-out/ablation estimate of it), fifteen years after
  the DWR version and in a completely different field.
- **Interventions evaluated?** Only internally, as the device for measuring relevance.
- **Selection correctness scored?** No (human judgements are the data). **Inverse design?** No.
- **Overlap:** element 1 (and a template for the programme's oracle: relevance = effect of ablating the
  fine physics). Paper 0 should cite this as the cognitive-science precedent rather than let a reviewer
  produce it.
- **Verified:** citation-only (unconfirmed) (snippets: tandfonline 10.1080/02643294.2022.2083950;
  pubmed 35654749).

### RL-AMR — Yang, J., Dzanic, T., Petersen, B., et al. (2023). Reinforcement learning for adaptive mesh refinement. AISTATS 206:5997–6014. | Freymuth, N., et al. (2023/2024). (Adaptive) swarm mesh refinement with deep RL. NeurIPS 36 / arXiv:2406.08440. | Dzanic, T., et al. (2024). DynAMO. J. Comput. Phys. 506:112924. | Foucart, C., Charous, A. & Lermusiaux, P.F.J. (2023). Deep reinforcement learning for adaptive mesh refinement. J. Comput. Phys. 491:112381.
- **What it does:** learns marking policies for mesh refinement with error-and-cost rewards, and — the
  methodologically relevant part — **benchmarks against oracle policies** (e.g. "GreedyOptimal", which
  one-step-looks-ahead over every possible refinement using the true error, and "TrueError"), explicitly
  noting these oracles need the fine reference solution and are unavailable at inference.
- **Selection criterion:** local/anticipatory error reduction per refinement; not target-conditioned
  (except in the learned-DWR variants above).
- **Interventions evaluated?** No. **Selection correctness scored?** **Partially** — performance is
  compared to oracle policies, but the metric is resulting error at budget, not precision/recall of the
  refined set. **Inverse design?** No.
- **Overlap:** element 2 in weak form; element 3 in the RL sense. The programme's "hidden ground truth
  oracle" is an evolution of this protocol, not a new idea — the *set-level* scoring is the new part.
- **Verified:** citation-only (unconfirmed) (snippets: proceedings.mlr.press/v206/yang23e; arXiv 2304.00818,
  2406.08440, 2103.01342, 2211.00801).

### SDM-PNNL — Tipireddy, R., Amatya, V.C., Rosenthal, W.S. & Subramanian, M. (2023). Sequential decision making (SDM) for mesh refinement and model selection in multiscale, multi-physics applications. PNNL-33338.
- **What it does:** an agenda report combining classifiers, reasoning and RL to automate mesh refinement,
  time-stepping, **model and algorithm selection**, and resource allocation in scientific computing;
  demonstrations are Lorenz-region classification, adaptive time-stepping, and 2-D AMR.
- **Selection criterion:** learned/RL, error- and stability-driven; the "model selection" ambition is
  stated but the demonstrations are numerics, not multiphysics model choice, and no QoI conditioning.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** none complete, but it stakes the *framing* "learn to select the model, not just the mesh" —
  cite it so the framing does not look unanticipated.
- **Verified:** citation-only (unconfirmed) (snippet: pnnl.gov/publications/... and PNNL-33338.pdf; blocked).

### OPAL — Farrell, K., Oden, J.T. & Faghihi, D. (2015). A Bayesian framework for adaptive selection, calibration, and validation of coarse-grained models of atomistic systems. J. Comput. Phys. 295:189–208. | Lima, E.A.B.F., Oden, J.T., et al. (2017). CMAME 327:277–305. | Tan, J., Liang, B., Singh, P.K., Farrell-Maupin, K.A. & Faghihi, D. (2022). Toward selecting optimal predictive multiscale models. CMAME 402.
- **What it does:** the Occam-Plausibility Algorithm — rank a family of candidate mechanistic models by
  posterior plausibility/simplicity, validate the surviving ones against data selected to expose the
  prediction QoI, and use the simplest adequate model for prediction (applied to coarse-grained polymers,
  tumour growth under radiation, discrete-continuum plasticity).
- **Selection criterion:** QoI-aware Bayesian model selection — but *offline, per model family*, not
  per-subsystem during a run, and not cost-ranked.
- **Interventions evaluated?** No. **Selection correctness scored?** No (model plausibility, not refinement
  set). **Inverse design?** No.
- **Overlap:** element 1 partially, element 6 partially (a validation methodology with held-out prediction
  scenarios).
- **Verified:** citation-only (unconfirmed) (snippets: sciencedirect S0021999115002430, S0045782517305893,
  S0045782522005229).

### Context-aware MF — Farcaş, I.-G., Peherstorfer, B., Neckel, T., Jenko, F. & Bungartz, H.-J. (2023). Context-aware learning of hierarchies of low-fidelity models for multi-fidelity uncertainty quantification. CMAME 406:115908. doi:10.1016/j.cma.2023.115908
- **What it does:** decides how much budget to spend *training* low-fidelity models versus *sampling* them,
  by minimising the MSE of the estimator the models will be used in — "context" = the downstream estimator.
- **Selection criterion:** downstream-task-aware cost/benefit — element 3, and a weak form of element 1
  (the target is an MC estimator, not a requested observable under intervention).
- **Interventions / selection-correctness / inverse design:** no, no, no.
- **Overlap:** element 3; a good precedent for "fidelity decisions should serve the downstream query".
- **Verified:** citation-only (unconfirmed) (snippets: sciencedirect S0045782523000312; nyuscholars).

### MFNPE / Cost-aware SBI — Krouglova, A.N., Johnson, H.R., Confavreux, B., Deistler, M. & Gonçalves, P.J. (2026). Multifidelity simulation-based inference for computationally expensive simulators. ICLR 2026 (arXiv:2502.08416). | Bharti, A., Huang, D., Kaski, S. & Briol, F.-X. (2025). Cost-aware simulation-based inference. AISTATS 2025.
- **What it does:** MFNPE transfers from cheap low-fidelity simulations to expensive high-fidelity ones for
  posterior estimation, with a sequential variant whose acquisition targets the density estimator's
  predictive uncertainty; cost-aware SBI prioritises parameter regions whose simulations are cheap
  (≈85% time saving) using rejection/self-normalised importance sampling.
- **Selection criterion:** uncertainty of the posterior estimator, and simulation cost. Not target-
  conditioned on an observable under intervention; the target is the posterior.
- **Interventions evaluated?** No. **Selection correctness scored?** No. **Inverse design?** No.
- **Overlap:** element 3.
- **Verified:** cost-aware SBI yes (https://github.com/huangdaolang/cost-aware-sbi); MFNPE citation-only
  (unconfirmed) (snippet: arxiv.org/abs/2502.08416).

### AdaptiveQMMM / QM-region selection — Heyden, A., Lin, H. & Truhlar, D.G. (2007). J. Phys. Chem. B 111(9):2231–2241. | Karelina, M. & Kulik, H.J. (2017). Systematic quantum mechanical region determination in QM/MM simulation. J. Chem. Theory Comput. 13(2):563–576. | Brandt, F., et al. (2022). Systematic QM region construction in QM/MM calculations based on uncertainty quantification. J. Chem. Theory Comput. 18(4):2584–2596.
- **What it does:** decides *which atoms need quantum treatment*. Adaptive partitioning reclassifies atoms
  on the fly (distance- or density-based). Karelina–Kulik choose the QM region by **charge shift analysis**
  and **Fukui shift analysis** — how much including a residue changes the electron density / frontier
  states relevant to the reaction. Brandt et al. choose it by sensitivity of the QM/MM reaction energy to
  MM point-charge variation.
- **Selection criterion:** *property-sensitivity* — the nearest chemistry analogue of element 1: include
  the expensive physics where it measurably changes the property of interest. But: static region
  construction (not per-query, not under intervention), hand-designed sensitivity probes, no cost ranking.
- **Interventions evaluated?** No. **Selection correctness scored?** Convergence of the property with
  region size is reported — closer to an effectivity index than to set precision/recall.
- **Inverse design?** No.
- **Overlap:** element 1 (hand-designed, property-sensitivity form).
- **Verified:** citation-only (unconfirmed) (snippets: pubs.acs.org/doi/10.1021/acs.jctc.6b01049;
  .../acs.jctc.1c01093; .../jp0673617).

### TestResourceAllocation — Sankararaman, S., McLemore, K., Mahadevan, S., Bradford, S.C. & Peterson, L.D. (2013). Test resource allocation in hierarchical systems using Bayesian networks. AIAA Journal 51(3):537–550.
- **What it does:** allocates *experimental* resources across components/subsystems of a hierarchical
  system so as to most reduce uncertainty in the system-level prediction, via a Bayesian network and
  sensitivity analysis.
- **Selection criterion:** sensitivity of the system QoI to each component's uncertainty, per unit test
  cost — elements 1+3 for *tests*, not for *computations*.
- **Interventions / selection-correctness / inverse design:** no, no, no.
- **Overlap:** elements 1 + 3 in a different currency (experiments). A reviewer from UQ will raise it.
- **Verified:** citation-only (unconfirmed) (snippet: arc.aiaa.org/doi/10.2514/1.J051542).

### Negative results worth citing — Thümmler, L. & Kuroda, T. (2026). When a neural surrogate cannot accelerate a solver: runtime share, closed-loop drift, and the economics of uncertainty gating in a stiff coupled simulation. (arXiv:2608.23075) | Duraisamy, K. (2026). Predictivity and utility of neural surrogates of multiscale PDEs. (arXiv:2604.20061)
- **What they do:** report controlled *negative* results on surrogate-in-the-loop acceleration —
  Amdahl-style runtime share, closed-loop drift, and the economics of uncertainty gating (a correct OOD
  gate cannot accelerate a loop that has left its training distribution).
- **Overlap:** none, but they are the strongest available statement of the failure mode the programme's
  compute-accounting must survive, and pre-empt the "did you actually save compute?" objection.
- **Verified:** citation-only (unconfirmed) (snippets: arxiv.org/abs/2608.23075, /abs/2604.20061).

**Queries run that returned nothing on target** (recorded so the negative result is auditable):
"target-aware adaptive fidelity", "quantity of interest driven surrogate refinement learned",
"value of computation simulation biology", "expected improvement per cost adaptive multiscale",
"decision-focused surrogate" (only decision-focused surrogates for *optimisation problems*, e.g. mixed-
integer programming), "goal-oriented active learning of simulators intervention", "which physics to
compute", "selection correctness refinement oracle", "hidden ground truth evaluation of adaptive
simulation", "missing physics identification precision recall", "intervention-conditioned adaptive
fidelity", "causal relevance which subsystem to simulate at high fidelity", "anytime prediction budget
allocation scientific ML", "learning to select numerical model per query RL quantity of interest".
None surfaced a work that conditions *simulator refinement* on a *requested intervention outcome*, and
none surfaced any work scoring refinement-set correctness against hidden ground truth.

---

## Part C — inverse design / functional restoration precedents

### Allam2021 — Allam, S.L., Rumbell, T.H., Hoang-Trong, T., Parikh, J. & Kozloski, J.R. (2021). Neuronal population models reveal specific linear conductance controllers sufficient to rescue preclinical disease phenotypes. iScience 24(11):103279.
- **What it does:** builds heterogeneous populations of striatal neuron models for Huntington's disease and
  wild-type, then uses evolutionary optimisation to find **coherent sets of ion-channel modulations —
  "virtual drugs" — that move the disease population's excitability profile back onto the wild-type
  profile**.
- **Overlap:** **element 5, done.** This is model-based search for a conductance-level intervention that
  restores wild-type electrophysiology, in a population-of-models setting, five years ago.
- **Interventions evaluated?** Yes (simulated channel modulation). **Selection correctness / fidelity
  selection?** None — a single fidelity throughout.
- **Verified:** citation-only (unconfirmed) (snippets: pubmed 34778727; sciencedirect S2589004221012487;
  bioRxiv 2020.06.01.128033).

### Moreno2019 — Moreno, J.D., et al. (2019). A molecularly detailed NaV1.5 model reveals a new class I antiarrhythmic target. JACC: Basic to Translational Science 4(6):736–751. (+ Moreno, J.D., et al. (2011). A computational model to predict the effects of class I anti-arrhythmic drugs on ventricular rhythms. Science Translational Medicine 3:98ra83)
- **What it does:** multiscale Na channel model in which a **"mexiletine booster" is designed in silico**
  and shown to rescue an LQT3 mutant otherwise resistant to mexiletine, by shifting DIII-VSD activation.
- **Overlap:** element 5 (pharmacological rescue of a channel variant, designed in a model), plus element 4
  (drug/mutation intervention outcome across molecule→cell→tissue scales).
- **Verified:** citation-only (unconfirmed) (snippets: pubmed 31709321; science.org scitranslmed.3002588).

### PopulationsOfModels — Britton, O.J., et al. (2013). Experimentally calibrated population of models predicts and explains intersubject variability in cardiac cellular electrophysiology. PNAS 110(23):E2098. | Passini, E., et al. (2017). Human in silico drug trials demonstrate higher accuracy than animal models in predicting clinical pro-arrhythmic cardiotoxicity. Frontiers in Physiology 8:668.
- **What it does:** calibrate a population of cell models to experimental variability; predict drug block
  effects; run "in silico trials" (62 compounds, >1,000 cell simulations) with reported 89% accuracy vs.
  ~75% for animal models.
- **Overlap:** element 4 (perturbation-outcome prediction with populations) and element 6 (calibration →
  validation → prospective-style qualification). Cardiac electrophysiology has already walked most of the
  programme's validation ladder in its own domain.
- **Verified:** citation-only (unconfirmed) (snippets: pnas.org/content/110/23/E2098.short;
  frontiersin.org 10.3389/fphys.2017.00668).

### Degeneracy — Prinz, A.A., Bucher, D. & Marder, E. (2004). Similar network activity from disparate circuit parameters. Nature Neuroscience 7(12):1345–1352. | O'Leary, T., Williams, A.H., Franci, A. & Marder, E. (2014). Cell types, network homeostasis, and pathological compensation from a biologically plausible ion channel expression model. Neuron 82:809–821. | Drion, G., O'Leary, T. & Marder, E. (2015). Ion channel degeneracy enables robust and tunable neuronal firing rates. PNAS 112(38):E5361. | Brandoit, J., Ernst, D., Drion, G. & Fyon, A. (2026). Fast reconstruction of degenerate populations of conductance-based neuron models from spike times. PLOS Comput. Biol. 22(5):e1014337.
- **What it does:** establishes that many parameter sets give the same activity (so "restoration" targets a
  manifold, not a point), that homeostatic regulation can produce *pathological* compensation, and (2026)
  that degenerate model populations consistent with observed spiking can be inferred in milliseconds.
- **Overlap:** the theoretical substrate for element 5. Any "we found the intervention that restores WT"
  claim must address degeneracy and report the solution set, not a single solution.
- **Verified:** citation-only (unconfirmed) (snippets: nature.com/articles/nn1352; cell.com Neuron
  S0896-6273(14)00292-X; pnas 10.1073/pnas.1516400112; journals.plos.org 10.1371/journal.pcbi.1014337).

### DynamicClampRescue — Städele, C., Heigele, S. & Stein, W. (2015). Neuromodulation to the rescue: compensation of temperature-induced breakdown of rhythmic motor patterns via extrinsic neuromodulatory input. PLoS Biology 13(9):e1002265. (+ Berecki, G., et al. (2018). Dynamic action potential clamp predicts functional separation in mild familial and severe de novo forms of SCN2A epilepsy. PNAS 115(24))
- **What it does:** dynamic clamp used to *rescue* function — adding leak stops the rhythm at low
  temperature and **subtracting the added leak at elevated temperature restores it**; dynamic action
  potential clamp separates SCN2A variants by their predicted effect on firing (R1882Q hyperexcitable,
  R853Q hypoexcitable).
- **Overlap:** element 5, in the closed hardware-in-the-loop form, and element 4 (variant → firing outcome).
- **Verified:** yes for Städele et al. title/authors/journal/year (https://github.com/ModelDBRepository/184404);
  Berecki et al. citation-only (unconfirmed) (snippet: pnas.org/doi/10.1073/pnas.1800077115).

### BioelectricRescue — Pai, V.P., et al. (2018). HCN2 rescues brain defects by enforcing endogenous voltage pre-patterns. Nature Communications 9. doi:10.1038/s41467-018-03334-5 | Pietak, A. & Levin, M. (2016). Exploring instructive physiological signaling with the bioelectric tissue simulation engine (BETSE). Frontiers in Bioengineering and Biotechnology 4:55. doi:10.3389/fbioe.2016.00055 | Lobo, D. & Levin, M. (2015). Inferring regulatory networks from experimental morphological phenotypes: a computational method reverse-engineers planarian regeneration. PLoS Comput. Biol. 11(6):e1004295.
- **What it does:** a biophysical bioelectric simulation (BETSE) explains a teratogen's effect as
  disruption of endogenous voltage pre-patterns and **predicts that exogenous HCN2 expression will restore
  them** — the prediction was then experimentally validated (rescued brain morphology, gene expression and
  learning). Lobo & Levin invert morphological phenotype data to a regulatory network that reproduces
  planarian regeneration under surgical, pharmacological and genetic manipulation.
- **Overlap:** elements 4 + 5, model-first, with wet-lab confirmation. BETSE itself is forward-only (the
  repository documents no inverse-design/optimisation capability); the inversion was done by the authors
  around the simulator, which is exactly the pattern the programme proposes.
- **Verified:** BETSE yes (https://github.com/betsee/betse, README gives Pietak & Levin 2016 with DOI);
  Pai et al. and Lobo & Levin citation-only (unconfirmed) (snippets: nature.com/articles/s41467-018-03334-5;
  journals.plos.org 10.1371/journal.pcbi.1004295).

### CellStateControl — Kamimoto, K., et al. (2023). Dissecting cell identity via network inference and in silico gene perturbation. Nature 614:742–751. doi:10.1038/s41586-022-05688-9 | Rackham, O.J.L., et al. (2016). A predictive computational framework for direct reprogramming between human cell types. Nature Genetics 48(3):331–335. | Zañudo, J.G.T., Yang, G., Albert, R. & Levine, H. (2017). Structure-based control of complex networks with nonlinear dynamics. PNAS 114(28):7234–7239. | Ronquist, S., et al. (2017). Algorithm for cellular reprogramming. PNAS 114(45):11832–11837.
- **What it does:** in silico perturbation of GRNs to predict cell-identity shifts (CellOracle), prediction
  of reprogramming factor sets (Mogrify), and structure-based control (feedback vertex sets) or data-guided
  control that steers a cell to a target attractor.
- **Overlap:** element 5 at the transcriptional scale — "search a learned/inferred model for the
  intervention that reaches a target state" is standard practice in cell biology.
- **Verified:** CellOracle yes (https://github.com/morris-lab/CellOracle, README gives Nature + DOI);
  others citation-only (unconfirmed) (snippets: nature.com/articles/ng.3487; pnas 10.1073/pnas.1617387114;
  pnas 10.1073/pnas.1712350114).

### ClosedLoopRecovery — Vlachos, I., Deniz, T., Aertsen, A. & Kumar, A. (2016). Recovery of dynamics and function in spiking neural networks with closed-loop control. PLoS Computational Biology 12(2):e1004720.
- **What it does:** delayed feedback control restores aberrant network dynamics *and* the computations the
  network performed — restoration measured at the functional, not just the dynamical, level.
- **Overlap:** element 5 at circuit scale, and a precedent for "score the restored *function*, not the
  restored trajectory" — which is the right metric design for the programme's V4/V5.
- **Verified:** citation-only (unconfirmed) (snippet: journals.plos.org 10.1371/journal.pcbi.1004720).

---

## Conjunction coverage matrix

Columns: 1 target-conditioned causal relevance · 2 selection correctness vs. hidden ground truth ·
3 value of computation (ΔError/cost, with interactions) · 4 cross-scale intervention prediction ·
5 inverse design / functional restoration · 6 validation progression.

| Work | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| MuMMI (SC'19 / NMI 2021 / PNAS 2022 / JCTC 2023) | no | no | no | no | no | no |
| DynIm (farthest-point importance) | no | no | no | no | no | no |
| LED (Nat Mach Intell 2022) | no | no | no | no | no | no |
| AdaLED (CMAME 2023) | no | no | partial (cost implicit in σ_max) | no | no | no |
| iLED (Proc R Soc A 2025) / G-LED (Nat Commun 2024) | no | no | no | no | no | no |
| Goal-oriented model adaptivity (Oden/Braack–Ern/van Opstal) | **yes** | no | partial | no | no | no |
| Li, Garg & Willcox 2017 (goal-oriented inference) | **yes** | no | partial | no | no | no |
| Learned DWR / E2N | **yes** | no | partial | no | no | no |
| OPAL (Farrell/Oden/Faghihi; Tan 2022) | partial | no | no | no | no | partial |
| FLARE / DP-GEN (uncertainty fallback) | no | no | no | no | no | no |
| HyPER (ICLR 2025) | no | no | **yes** (learned, cost-aware) | no | no | no |
| RL-AMR (Yang, ASMR, DynAMO, Foucart) | no | partial (oracle policies) | **yes** | no | no | no |
| misoKG / MF-GP-UCB / DMFAL / BMFAL-BC | no | no | **yes** | no | no | no |
| Metareasoning (Russell–Wefald; Hay; Callaway) | partial | partial | **yes** | no | no | no |
| Partial mental simulation (Bass et al. 2021) | **yes** | no | partial | partial | no | no |
| Adaptive QM/MM + QM-region selection (Kulik; Brandt) | partial | no | no | no | no | no |
| Zhang et al. 2023 (multi-fidelity active causal discovery) | partial | no | **yes** | partial | no | no |
| Dyer et al. 2024 (interventionally consistent surrogates) | no | no | no | **yes** | no | no |
| Meir et al. 2026 (structured hybrid, intervention outcomes) | no | no | no | **yes** | no | no |
| Allam et al. 2021 (virtual drugs, HD → WT) | no | no | no | **yes** | **yes** | no |
| Moreno et al. 2019 (in silico mexiletine booster) | no | no | no | **yes** | **yes** | partial |
| Pai/Levin 2018 + BETSE (HCN2 rescue) | no | no | no | **yes** | **yes** | partial |
| Britton 2013 / Passini 2017 (populations, in silico trials) | no | no | no | **yes** | no | **yes** |
| CellOracle / Mogrify / FVS control | no | no | no | **yes** | **yes** | no |

Maximum coverage by any single work: **two elements** (Allam 2021, Moreno 2019, Pai/Levin 2018 — each
4 + 5; Bass 2021 — 1 + partial 3/4). **No prior work found covers ≥ 4 of the 6.** But every element is
individually occupied, and three *pairs* are firmly occupied: (1+3) by goal-oriented model adaptivity,
(3+4) by multi-fidelity causal discovery, (4+5) by computational electrophysiology.

---

## Verdict

**What is already done.** All six elements exist separately, and several are mature. Element 1 —
refinement chosen by expected effect on a target — is *not* new: goal-oriented model adaptivity has done
exactly this since Oden & Vemaganti (2000), including the local replacement of a coarse physical model by
a fine one (van Opstal et al. 2015) and fidelity allocation for a QoI computed after inference (Li, Garg
& Willcox 2017); the learned-adjoint variants (E2N, Roth–Wick) already put a neural network in that loop;
QM-region selection by charge/Fukui-shift sensitivity is the same idea in chemistry; and Bass et al.
(2021) define relevance as the interventional difference an element makes to the outcome. Element 3 is
textbook: misoKG explicitly maximises "expected incremental gain per unit cost", BMFAL-BC handles batches
with interactions, and metareasoning (Russell–Wefald; Hay; Callaway) is the general theory. Element 4 is
occupied by Dyer et al. (2024) and by hybrid mechanistic intervention models (Meir et al. 2026). Element 5
is thoroughly done in electrophysiology: Allam et al. (2021) already search populations of neuron models
for conductance modulations that restore wild-type excitability from a disease phenotype — the programme's
headline "restore the wild-type response after a virtual channel defect" is, as a *goal*, prior art, as
are Moreno's in-silico drug booster and the BETSE-predicted, wet-lab-confirmed HCN2 rescue. Element 6 is
methodology, not novelty; cardiac in-silico trials already ran a comparable ladder. And the two things the
owner review already excluded — ML-chosen fidelity (MuMMI, whose criterion is verifiably farthest-point
novelty) and learned/mechanistic coupling (LED, AdaLED, HyPER) — are correctly excluded.

**What remains open.** Two things, and they are narrower than the six-element list implies. First, element
2: I found no work that scores, against hidden ground truth, *whether the right physics was requested* —
precision, recall, waste and miss over the refined set, reported separately from prediction error. RL-AMR
compares against oracle policies, but on error-at-budget, not set membership; DWR reports effectivity
indices for an estimator, not correctness of a decision set. Second, the *pairing* of element 1 with
element 4: nobody conditions refinement on a **requested intervention outcome** in a system where no
adjoint exists (stochastic, discrete, non-differentiable biology). Goal-oriented adaptivity needs a dual
solve; the causal-target work (Zhang 2023) allocates fidelity to learn a graph, not to answer an
intervention query; HyPER's target is the full state.

**Tightest defensible contribution statement.** *We show that a learned refinement policy which selects
which sub-models to compute at higher fidelity by their expected effect on a requested intervention
outcome — ranked by expected target-error reduction per unit cost — outperforms novelty-, uncertainty-,
proximity- and adjoint-based selection at matched compute in non-differentiable biological simulators,
and we introduce hidden-ground-truth scoring of computation-selection correctness (precision/recall/waste/
miss of the refined set) as a metric distinct from prediction error.* Everything after "and" is the only
part with no located precedent; everything before it is a competitive claim that must be won empirically,
not asserted.

**Baselines and framings Paper 0/1 must include.** Baselines, all at matched compute: (a) fixed-schedule
LED-style alternation; (b) AdaLED-style ensemble-uncertainty/error threshold; (c) MuMMI/DynIm farthest-point
novelty in a learned latent space; (d) FLARE/DP-GEN model-deviation trigger; (e) adjoint/DWR goal-oriented
model adaptivity where a dual exists, plus a finite-difference sensitivity surrogate where it does not
(this is the *real* competitor — do not soften it); (f) a misoKG-style information-gain-per-cost allocator
retargeted to refinement; (g) HyPER-style cost-aware RL with a full-state error reward, as the causal-blind
reward ablation; (h) oracle minimal refinement set and uniform/random bounds. Methodologically, adopt the
RL-AMR oracle protocol (GreedyOptimal/TrueError) and cite it as the ancestor of the hidden-ground-truth
scoring rather than presenting oracle comparison as new. Framing rules: never call multi-fidelity, VoI-per-
cost, uncertainty fallback, interventional surrogate consistency, or in-silico rescue novel; state
explicitly that element 5 is prior art (Allam 2021; Moreno 2019; Pai/Levin 2018) and that the programme's
claim there is only that the *same routed world model* serves prediction and repair; address degeneracy
(Prinz 2004; O'Leary 2014) whenever a restoration solution is reported; and pre-empt the acceleration
objection with the negative results (Thümmler & Kuroda 2026; Duraisamy 2026) by reporting end-to-end
wall-clock, not step counts.
