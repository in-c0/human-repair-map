# Molecular-to-cellular multiscale modelling — literature scan (Physics-to-Life)

**Scan date:** 2026-09-14. **Cluster:** molecular-to-cellular multiscale modelling (brief threads 1–11).

**Scope.** This scan covers the chain of "compiled physics" between electronic structure and tissue: learned interatomic potentials and their out-of-distribution (OOD) failure modes; QM/MM and ML/MM embedding; bottom-up and top-down coarse-graining and its transferability problem; Markov state models (MSMs) as the canonical compiled kinetic model, with adaptive sampling and non-Markovian corrections; exact and approximate stochastic biochemical simulation (SSA, tau-leaping, hybrid, spatial); whole-cell models and their compute cost; the AI-virtual-cell agenda and the critical benchmarks that bound it; multiscale cell/tissue platforms and learned emulators of them; ion-channel models from Hodgkin–Huxley to MD-derived conductance and ensemble allostery; hybrid mechanistic+neural modelling in biology and pharmacology; and prior work on adaptively switching resolution or calling fine-scale physics on demand. For each entry the question asked is the programme's: what does this tell us about when a coarse/compiled model is sufficient, when it fails, and whether the "compile fine physics into a reusable effective model with an OOD-triggered return to the fine model" idea is already occupied.

**Verification protocol — read before using any citation.** The brief asked that every citation be verified by opening a DOI/arXiv/journal/Semantic Scholar page. In this session that was impossible: the network egress proxy blocked every domain tried (arxiv.org, export.arxiv.org, nature.com, pubs.acs.org, pubs.aip.org, pubs.rsc.org, cell.com, sciencedirect.com, science.org, pnas.org, journals.aps.org, journals.plos.org, biorxiv.org, link.springer.com, *.biomedcentral.com, onlinelibrary.wiley.com, academic.oup.com, annualreviews.org, royalsocietypublishing.org, embopress.org, pubmed/pmc/ncbi.nlm.nih.gov, europepmc.org, doi.org, api.crossref.org, api.openalex.org, semanticscholar.org, huggingface.co, alphaxiv.org, osti.gov, zenodo.org, jcvi.org), and the session's web-search budget was exhausted after 14 queries. Consequently **no entry below carries "Verified: yes"**. Three labels are used instead:

- `search-confirmed (URL)` — a web-search result returned the publisher/PubMed/arXiv record with matching title, authors and venue (and, where quoted, the key numbers); the page itself was **not opened**. 12 entries.
- `citation-only (unconfirmed)` — from the scanner's prior knowledge only. DOIs/volumes are given only where recall confidence is high, but they were not checked in this session and **must be verified before reuse**. 36 entries.
- Inline secondary references marked "— unconfirmed" are also from memory and are unverified.

Quantitative figures are flagged "recalled" when they come from memory rather than from a search result. Author lists are truncated with "et al." wherever the full list could not be confirmed; no author list or DOI has been invented — where uncertain, it is omitted.

---

## 1. Learned molecular potentials (MLIPs) and their failure modes

### ANI-1 — Smith JS, Isayev O, Roitberg AE (2017). ANI-1: an extensible neural network potential with DFT accuracy at force field computational cost. Chem. Sci. 8, 3192–3203. DOI 10.1039/C6SC05720A
- **Key result:** Behler–Parrinello-style atomic neural network with modified symmetry functions, trained on ~17 M DFT (ωB97X/6-31G(d)) conformations of ~57 k small organic molecules (H, C, N, O; ≤8 heavy atoms; figures recalled). Reproduces DFT energies at roughly 1 kcal/mol-scale RMSE on held-out molecules, transfers to molecules larger than the training set, and runs at force-field-like cost (orders of magnitude cheaper than DFT).
- **Relevance:** the first demonstration that a fine-scale calculation (DFT) can be "compiled" into a reusable surrogate for a whole chemical family rather than one system — the prototype of physics compilation at the electronic-structure→chemistry interface.
- **Limitations:** H/C/N/O only, neutral closed-shell molecules, no explicit long-range electrostatics or charge, no built-in uncertainty (added later via ensembles in ANI-1x/ANI-2x); accuracy degrades outside the GDB-like chemical/conformational distribution.
- **Design implication for Physics-to-Life:** every compiled potential must ship with a declared domain of validity (elements, charge states, energy window) and an OOD detector; ensemble disagreement is the cheap default. ANI-2x (H,C,N,O,F,S,Cl) is a reusable drop-in for organic-ligand chemistry.
- **Novelty threat:** partial — it already realises "compile QM into a reusable surrogate" for small organics, but with no adaptive fallback to QM.
- **Verified:** citation-only (unconfirmed)

### SchNet — Schütt KT, Sauceda HE, Kindermans P-J, Tkatchenko A, Müller K-R (2018). SchNet – A deep learning architecture for molecules and materials. J. Chem. Phys. 148, 241722. DOI 10.1063/1.5019779 (conference version: Schütt et al., NeurIPS 2017, arXiv:1706.08566 — unconfirmed)
- **Key result:** continuous-filter convolutional message passing over atom positions gives ~0.3 kcal/mol energy MAE on QM9 and force-field-quality forces on MD17 when trained with energy-conserving (gradient) forces; also applied to bulk-material formation energies (figures recalled).
- **Relevance:** established the graph message-passing template that all later MLIPs — and CGSchNet at the coarse-grained tier — build on; energy conservation via gradient forces is a design principle the programme should keep.
- **Limitations:** invariant (scalar) features only, hence far less data-efficient than later equivariant models; per-molecule training on MD17; no uncertainty estimate.
- **Design implication for Physics-to-Life:** use equivariant successors (NequIP/MACE) for new atomistic surrogates, but SchNet-style continuous filters remain the right baseline for coarse-grained beads that carry only positions.
- **Novelty threat:** none — an architecture, not a multiscale control scheme.
- **Verified:** citation-only (unconfirmed)

### NequIP — Batzner S, Musaelian A, Sun L, Geiger M, Mailoa JP, Kornbluth M, Molinari N, Smidt TE, Kozinsky B (2022). E(3)-equivariant graph neural networks for data-efficient and accurate interatomic potentials. Nat. Commun. 13, 2453. DOI 10.1038/s41467-022-29939-5
- **Key result:** E(3)-equivariant tensor features reach state-of-the-art force/energy accuracy on MD17, liquid water, LiPS electrolyte and catalytic-surface benchmarks with up to three orders of magnitude fewer training configurations than invariant models (e.g., ~1,000 reference frames; recalled).
- **Relevance:** data efficiency is the property that makes physics compilation affordable — the fine model (DFT) is called O(10^3) times per system rather than O(10^6).
- **Limitations:** higher per-step cost than invariant models; per-system training in the paper; no guarantee outside the training distribution (see Fu 2023, Deng 2025 below).
- **Design implication for Physics-to-Life:** budget ~10^3 fine-scale calls for the compile step of any new molecular subsystem, with active learning choosing which calls (see FLARE, thread 11).
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### MACE — Batatia I, Kovács DP, Simm GNC, Ortner C, Csányi G (2022). MACE: Higher order equivariant message passing neural networks for fast and accurate force fields. Adv. Neural Inf. Process. Syst. 35 (NeurIPS 2022). arXiv:2206.07697
- **Key result:** many-body (4-body) equivariant messages built from the atomic cluster expansion; only two message-passing layers are needed, giving state-of-the-art accuracy on rMD17, 3BPA (including extrapolation to higher-temperature configurations) and acetylacetone at better speed/accuracy trade-off than NequIP (recalled).
- **Relevance:** current default architecture for compiled molecular surrogates; basis of the MACE-MP-0 and MACE-OFF (organic) foundation models.
- **Limitations:** strictly short-range (cutoff); no explicit long-range electrostatics or charge transfer; inherits the softening bias when trained on near-equilibrium data (Deng 2025).
- **Design implication for Physics-to-Life:** reuse MACE (and MACE-OFF for organic/biomolecular fragments) as the DFT→surrogate compiler; do not build a new MLIP architecture.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### MACE-MP-0 — Batatia I, Benner P, Chiang Y, Elena AM, Kovács DP, Riebesell J, et al. (~60 authors) (2023/2024). A foundation model for atomistic materials chemistry. arXiv:2401.00096
- **Key result:** a single MACE model trained on the Materials Project trajectory set (~1.5 M DFT configurations, 89 elements; recalled) runs stable MD out of the box across ~30 qualitatively different applications (solids, liquids, MOFs, catalysis, batteries, aqueous systems), usually qualitatively right and quantitatively imperfect; fine-tuning fixes most cases.
- **Relevance:** the first "universal" compiled potential; shows that a pre-trained surrogate can serve as the default fine-scale stand-in and be specialised on demand.
- **Limitations:** trained on PBE-level relaxation trajectories, hence systematically soft (Deng 2025); dispersion added post hoc (D3); weak for molecules and charged species; the authors themselves present many failure cases.
- **Design implication for Physics-to-Life:** treat foundation MLIPs as priors to be fine-tuned per subsystem, never as ground truth; store a training-domain descriptor with every compiled model so OOD can be measured.
- **Novelty threat:** partial — the "foundation surrogate + fine-tune" pattern is established; the adaptive-fallback control loop is not.
- **Verified:** citation-only (unconfirmed) — arXiv blocked in this session; ID recalled.

### UMA — Wood BM, et al. (Meta FAIR / Carnegie Mellon; ~30 authors) (2025). UMA: A family of universal models for atoms. arXiv:2506.23971
- **Key result:** models trained on ~0.5 billion unique 3D atomic structures spanning molecules, materials and catalysts; a mixture-of-linear-experts design raises capacity without inference-speed loss; empirical scaling laws relate capacity, data and accuracy (search-confirmed summary).
- **Relevance:** the current scale frontier of compiled QM; the OMol25-style molecular data include charged species and metals missing from earlier organic potentials. Orb (Neumann et al. 2024, arXiv:2410.22570 — unconfirmed) is the main speed-oriented, non-equivariant alternative.
- **Limitations:** accuracy for condensed-phase biomolecular dynamics (explicit solvent, ions, µs sampling) is not established; no native uncertainty output; inference cost remains far above classical force fields; closed training pipelines.
- **Design implication for Physics-to-Life:** benchmark UMA/Orb/MACE-OFF on the V2 ion-channel fragment set (ion–carbonyl coordination, water wires) before committing; the compile target for whole channels stays classical/coarse-grained.
- **Novelty threat:** partial — universal potentials cover "compile QM once, reuse everywhere" but stop at the atomistic scale.
- **Verified:** search-confirmed (https://arxiv.org/abs/2506.23971) — page not opened (egress block)

### Deng-softening — Deng B, Choi Y, Zhong P, Riebesell J, Anand S, Li Z, Jun K, Persson KA, Ceder G (2025). Systematic softening in universal machine learning interatomic potentials. npj Comput. Mater. 11, 9. DOI 10.1038/s41524-024-01500-6
- **Key result:** three universal MLIPs (M3GNet, CHGNet, MACE-MP-0) systematically under-predict energies and forces for surfaces, defects, solid-solution energetics, phonons, ion-migration barriers and high-energy states; the cause is under-predicted PES curvature from near-equilibrium-biased pre-training data (search-confirmed). The abstract reports the bias is systematic and correctable by fine-tuning with very little data — a single additional data point in their tests (recalled).
- **Relevance:** the clearest documented OOD failure mode of compiled potentials: not random error but a *biased* error concentrated at barriers — exactly the quantities a coarse kinetic model (MSM, channel Markov model) consumes as rates.
- **Limitations:** materials benchmarks only; untested whether the same bias holds for OMol25/UMA-generation models or for biomolecular systems.
- **Design implication for Physics-to-Life:** OOD detection must include physics checks (curvature/phonon or barrier sanity tests), not only feature-space distance; every compile pipeline should include a small fine-tuning set at the transition states relevant to the downstream coarse model.
- **Novelty threat:** none — a diagnosis, not a control scheme.
- **Verified:** search-confirmed (https://www.nature.com/articles/s41524-024-01500-6) — page not opened

### Forces-not-enough — Fu X, Wu Z, Wang W, Xie T, Keten S, Gómez-Bombarelli R, Jaakkola T (2023). Forces are not enough: Benchmark and critical evaluation for machine learning force fields with molecular simulations. Trans. Mach. Learn. Res. (2023); arXiv:2210.07237
- **Key result:** across MD17, water, alanine dipeptide, LiPS and polymer benchmarks, force MAE is a poor predictor of simulation quality: models with the lowest force error can blow up within nanoseconds, and none reproduced the alanine-dipeptide free-energy surface; proposes stability horizon, RDF, diffusivity and free-energy-surface errors as simulation-based metrics (recalled). Related: Stocker et al. 2022, Mach. Learn.: Sci. Technol. 3, 045010 — unconfirmed — on GNN-potential robustness in long, hot MD.
- **Relevance:** defines what "the surrogate is correct" must mean for physics compilation — observables of the *coarse* model (stability, rates, ensembles), not the fine-scale regression loss.
- **Limitations:** 2022-era models; small systems; the stability criterion is heuristic.
- **Design implication for Physics-to-Life:** every compiled model should ship with a simulation-level validation suite (stability horizon, RDF/FES error) in addition to regression metrics, used as the acceptance gate on the validation ladder.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

## 2. QM/MM and ML/MM

### Warshel-Levitt — Warshel A, Levitt M (1976). Theoretical studies of enzymic reactions: dielectric, electrostatic and steric stabilization of the carbonium ion in the reaction of lysozyme. J. Mol. Biol. 103, 227–249. DOI 10.1016/0022-2836(76)90311-9
- **Key result:** first hybrid model treating the reacting region quantum-mechanically and the protein/solvent classically with explicit electrostatic and polarisation coupling; showed the enzyme environment electrostatically stabilises the lysozyme carbonium-ion intermediate.
- **Relevance:** the founding instance of "spend fine-scale physics only where it matters" — the programme's central heuristic in its original chemical form (2013 Nobel Prize in Chemistry).
- **Limitations:** semi-empirical QM; static, hand-chosen partition; no dynamics or sampling.
- **Design implication for Physics-to-Life:** partitioning by chemical necessity (bond breaking, charge transfer) is a solved problem; the open problem is dynamic, error-driven partitioning (thread 11).
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Senn-Thiel — Senn HM, Thiel W (2009). QM/MM methods for biomolecular systems. Angew. Chem. Int. Ed. 48, 1198–1229. DOI 10.1002/anie.200802019
- **Key result:** definitive methodological review: mechanical/electrostatic/polarised embedding, boundary treatments (link atoms, boundary atoms, frozen orbitals), QM/MM free-energy and reaction-path methods, and validation practice; catalogues systematic error sources at the QM/MM boundary (over-polarisation, charge leakage, cutoff artefacts).
- **Relevance:** the catalogue of coupling problems any learned fine/coarse interface will inherit.
- **Limitations:** pre-ML; the sampling limitation of QM/MM (ps–ns) is described, not solved.
- **Design implication for Physics-to-Life:** specify every fine/coarse interface in the same terms (embedding type, boundary conditions, conserved quantities) and validate it with the same tests.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### NNP/MM — Galvelis R, Varela-Rial A, Doerr S, Fino R, Eastman P, Markland TE, Chodera JD, De Fabritiis G (2023). NNP/MM: Accelerating molecular dynamics simulations with machine learning potentials and molecular mechanics. J. Chem. Inf. Model. 63, 5701–5708. DOI 10.1021/acs.jcim.3c00773 (arXiv:2201.08110)
- **Key result:** an optimised OpenMM implementation embedding an ANI-2x ligand in an MM protein/solvent environment; ~5× speed-up over the previous implementation and 1 µs aggregate sampling per protein–ligand complex, reported as the longest simulations of this class (search-confirmed).
- **Relevance:** the practical ML/MM template (mechanical embedding) for the molecular tier. Electrostatic embedding of ML potentials is provided by emle-engine (Zinovjev et al. 2024, J. Chem. Theory Comput. — unconfirmed); ML inside QM/MM for condensed phases by Böselt, Thürlemann, Riniker 2021, J. Chem. Theory Comput. 17, 2641 — unconfirmed.
- **Limitations:** mechanical embedding ignores environmental polarisation of the ligand; ANI-2x is limited to neutral H/C/N/O/F/S/Cl molecules; the NNP region still dominates cost.
- **Design implication for Physics-to-Life:** reuse OpenMM + openmm-torch/NNPOps as the execution substrate for mixed-fidelity molecular simulation rather than writing a new engine.
- **Novelty threat:** none — fixed partition, no learned switching.
- **Verified:** search-confirmed (https://pubs.acs.org/doi/10.1021/acs.jcim.3c00773; https://arxiv.org/abs/2201.08110) — pages not opened

## 3. Coarse-graining: MARTINI, ML coarse-graining, transferability

### MARTINI — Marrink SJ, Risselada HJ, Yefimov S, Tieleman DP, de Vries AH (2007). The MARTINI force field: coarse grained model for biomolecular simulations. J. Phys. Chem. B 111, 7812–7824. DOI 10.1021/jp071097f
- **Key result:** ~4 heavy atoms per bead with 18 bead types parameterised top-down on oil/water partitioning free energies of small molecules; reproduces lipid bilayer structural and thermodynamic properties; with 20–40 fs time steps and ~4× faster effective dynamics it yields roughly 2–3 orders of magnitude speed-up over atomistic MD (recalled).
- **Relevance:** the de facto standard coarse model for membranes and the ion-channel environment (V2); its transferable bead "chemistry" is a worked example of top-down compilation to thermodynamic targets.
- **Limitations:** no sub-bead electrostatics (ions and water are crude), kinetics accelerated by an ill-defined factor, and systematic over-stickiness of proteins (see Martini 3 entry).
- **Design implication for Physics-to-Life:** Martini is the right coarse layer for lipid environments but not for ion permeation itself — the selectivity filter must stay atomistic or use a purpose-built compiled model.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Martini3 — Souza PCT, Alessandri R, Barnoud J, Thallmair S, Faustino I, Grünewald F, et al.; Marrink SJ (2021). Martini 3: a general purpose force field for coarse-grained molecular dynamics. Nat. Methods 18, 382–388. DOI 10.1038/s41592-021-01098-3
- **Key result:** full re-parameterisation with more bead types and sizes and a rebalanced interaction matrix; corrects the systematic errors documented by the same group in "Pitfalls of the Martini model" (Alessandri R, Souza PCT, Thallmair S, Melo MN, de Vries AH, Marrink SJ, 2019, J. Chem. Theory Comput. 15, 5448–5460, DOI 10.1021/acs.jctc.9b00473 — unconfirmed): excessive protein–protein and aromatic-stacking interactions, spurious aggregation of soluble proteins and dimerisation of transmembrane helices; validated on protein–ligand binding and membrane systems.
- **Relevance:** shows that a top-down compiled model can accumulate *systematic* errors for a decade before broad benchmarking exposes them — a direct argument for continuous validation infrastructure around any compiled model.
- **Limitations:** fixed resolution; limited charge/polarisation physics; kinetics still not quantitative; chemistry outside the bead table (unusual lipids, PTMs) needs new parameters.
- **Design implication for Physics-to-Life:** adopt Martini 3 for the lipid tier of V2; make the OOD monitor flag chemistry outside the bead-type table instead of trusting extrapolation.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### CGnet — Wang J, Olsson S, Wehmeyer C, Pérez A, Charron NE, de Fabritiis G, Noé F, Clementi C (2019). Machine learning of coarse-grained molecular dynamics force fields. ACS Cent. Sci. 5, 755–767. DOI 10.1021/acscentsci.8b00913
- **Key result:** a neural network plus physical prior terms, trained by force matching to all-atom trajectories, learns the many-body CG free-energy surface; reproduces the folding/unfolding free-energy landscapes of alanine dipeptide and the mini-protein chignolin at Cα resolution where pairwise CG models fail.
- **Relevance:** bottom-up physics compilation of MD into a CG potential with an explicit variational statement (the CG force field approximates the mean force) — the template for a molecule→protein compile step.
- **Limitations:** single-system (trained and tested on the same molecule); needs prior repulsion/bond terms for stability; CG kinetics not preserved; no uncertainty estimate.
- **Design implication for Physics-to-Life:** reuse force matching to the mean force as the compile objective; assume non-transferability by default and plan per-system compilation with OOD monitoring.
- **Novelty threat:** partial — implements compile-MD-into-CG, but with no transferability or fallback.
- **Verified:** citation-only (unconfirmed)

### CGSchNet — Husic BE, Charron NE, Lemm D, Wang J, Pérez A, Majewski M, et al.; Clementi C (2020). Coarse graining molecular dynamics with graph neural networks. J. Chem. Phys. 153, 194101. DOI 10.1063/5.0026133
- **Key result:** replaces CGnet's hand-crafted features with a SchNet graph network, improving accuracy on alanine dipeptide and chignolin and making the architecture in principle transferable across sequences; states the requirements for transferable ML-CG models.
- **Relevance:** the architectural bridge from thread 1 to CG; the same group's later transferable protein CG model (Charron et al., "Navigating protein landscapes with a machine-learned transferable coarse-grained model", arXiv:2310.18278; journal version 2025 — unconfirmed) is the first evidence of cross-protein transfer, trained on very large all-atom datasets.
- **Limitations:** still single-system in the paper; sensitive to coverage of unfolded states in the training set; stability requires priors; reference-data sampling is the bottleneck.
- **Design implication for Physics-to-Life:** a transferable CG protein model is a data-intensive compile whose cost is dominated by the reference all-atom data, so reuse public trajectory sets rather than generating new ones.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed)

### Noid-CG — Noid WG (2013). Perspective: Coarse-grained models for biomolecular systems. J. Chem. Phys. 139, 090901. DOI 10.1063/1.4818908
- **Key result:** formalises bottom-up (structure/force matching to the many-body potential of mean force) versus top-down (fit to experiment) coarse-graining; the multiscale coarse-graining theory (Noid WG et al. 2008, J. Chem. Phys. 128, 244114, DOI 10.1063/1.2938860 — unconfirmed) shows the optimal CG force field is the gradient of the many-body PMF; identifies representability (a pair potential cannot reproduce all observables) and transferability (the PMF is state-point dependent) as the fundamental limits. A modern restatement is Jin, Pak, Durumeric, Loose, Voth 2022, J. Chem. Theory Comput. 18, 5759 — unconfirmed.
- **Relevance:** gives the precise theoretical reason compiled coarse models fail OOD: the effective potential is a free energy that depends on temperature, composition and environment.
- **Limitations:** perspective; solutions to transferability remain open.
- **Design implication for Physics-to-Life:** every compiled coarse model should carry its state-point metadata (T, ionic strength, composition), and OOD detection should trigger on state-point drift as well as configuration drift.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

## 4. Markov state models and physics compilation of kinetics

### Prinz-MSM — Prinz J-H, Wu H, Sarich M, Keller B, Senne M, Held M, Chodera JD, Schütte C, Noé F (2011). Markov models of molecular kinetics: Generation and validation. J. Chem. Phys. 134, 174105. DOI 10.1063/1.3565032
- **Key result:** rigorous theory of MSMs as discretised transfer operators: the error in implied timescales is bounded by the projection error of the state partition and decays with lag time; supplies validation tools (implied-timescale convergence, Chapman–Kolmogorov test).
- **Relevance:** the canonical, mathematically grounded compilation of MD into a reusable kinetic model with an explicit error theory — the model of what the programme's compile step should guarantee.
- **Limitations:** the bound is tight only for good partitions; needs local equilibrium within states; assumes memory is lost within the lag time; silent about unsampled regions.
- **Design implication for Physics-to-Life:** adopt MSM validation (CK test, timescale convergence) as V0/V1 acceptance tests for any compiled kinetic model, and use projection error as one OOD signal.
- **Novelty threat:** direct — for the MD→kinetics step, MSMs already are compiled physics with error control; the programme must position itself as generalising this across scales, not inventing it.
- **Verified:** citation-only (unconfirmed)

### Husic-Pande — Husic BE, Pande VS (2018). Markov state models: From an art to a science. J. Am. Chem. Soc. 140, 2386–2396. DOI 10.1021/jacs.7b12191
- **Key result:** reviews how the MSM pipeline became systematic — featurisation → tICA → clustering → estimation — with the variational approach (VAC/VAMP, GMRQ cross-validation) providing objective hyperparameter selection; summarises successes on folding, ligand binding and conformational change, and the remaining sampling/discretisation/error-estimation problems.
- **Relevance:** the inventory of what tooling exists (PyEMMA, MSMBuilder, deeptime) and which decisions remain heuristic (lag time, state count).
- **Limitations:** perspective; error estimation from finite data is still open.
- **Design implication for Physics-to-Life:** reuse deeptime/PyEMMA for estimation; the programme's contribution should be the decision layer (when to trust, when to resample), not the estimator.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed)

### VAMPnets — Mardt A, Pasquali L, Wu H, Noé F (2018). VAMPnets for deep learning of molecular kinetics. Nat. Commun. 9, 5. DOI 10.1038/s41467-017-02388-1
- **Key result:** an end-to-end neural network trained with the VAMP-2 score replaces featurisation/tICA/clustering, learning a soft state assignment and Koopman matrix directly; recovers metastable states and timescales of alanine dipeptide and NTL9 folding from long reference trajectories.
- **Relevance:** learned compilation of MD into a kinetic model with a variational objective — the closest existing analogue of a "learned world model" at the protein scale.
- **Limitations:** requires long equilibrium trajectories; no calibrated uncertainty on the learned assignment; interpretability of states is post hoc.
- **Design implication for Physics-to-Life:** use the VAMP score as the training objective for compiled kinetic surrogates at V1–V3, and its degradation on new data as a cheap OOD trigger.
- **Novelty threat:** partial.
- **Verified:** citation-only (unconfirmed)

### Adaptive-sampling — Bowman GR, Ensign DL, Pande VS (2010). Enhanced modeling via network theory: Adaptive sampling of Markov state models. J. Chem. Theory Comput. 6, 787–794. DOI 10.1021/ct900620b
- **Key result:** iteratively building an MSM and launching new short simulations from states chosen by statistical uncertainty (or low visitation) reduces error in equilibrium populations and timescales faster per unit of aggregate simulation time than uniform sampling. The strategy underlies distributed aggregation on Folding@home (Shirts & Pande 2000, Science 290, 1903 — unconfirmed), culminating in the ~0.1 s aggregate SARS-CoV-2 proteome simulations of Zimmerman et al. (2021, Nat. Chem. 13, 651–659, DOI 10.1038/s41557-021-00707-0 — unconfirmed).
- **Relevance:** this *is* an adaptive fine-scale call policy driven by the coarse model's uncertainty — the MD-scale precedent for the programme's "return to the fine model when uncertain" loop.
- **Limitations:** uncertainty is statistical (counts), not model-form; cannot detect never-visited states; naive aggregation of short trajectories can bias kinetics.
- **Design implication for Physics-to-Life:** formulate the OOD-triggered fine-scale call as adaptive sampling with a value-of-information criterion and reuse the MSM literature's estimators.
- **Novelty threat:** direct — for the MD→MSM loop, uncertainty-driven fine-scale calls already exist; novelty must lie in cross-scale generalisation.
- **Verified:** citation-only (unconfirmed)

### qMSM-memory — Cao S, Montoya-Castillo A, Wang W, Markland TE, Huang X (2020). On the advantages of exploiting memory in Markov state models for biomolecular dynamics. J. Chem. Phys. 153, 014105. DOI 10.1063/5.0010787
- **Key result:** quasi-MSMs built on the generalised master equation with an explicit memory kernel describe protein conformational dynamics exactly in principle at short and long times, without the lag-time restriction of MSMs, and can be constructed from MD trajectories 5–10× shorter than those an MSM of equal accuracy requires (search-confirmed).
- **Relevance:** quantifies non-Markovianity as a real limit of the standard compiled kinetic model and shows a fix (memory terms) that reduces fine-scale cost; complements the analysis of which observables MSMs cannot reproduce (Suárez et al. 2021, J. Chem. Theory Comput. 17, 3119 — unconfirmed).
- **Limitations:** memory-kernel estimation is noisy and needs a memory-cutoff choice; demonstrated on a handful of systems.
- **Design implication for Physics-to-Life:** learned coarse models should allow history dependence (delay embeddings, GLE terms) rather than assuming Markovian state dynamics at every scale.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://pubs.aip.org/aip/jcp/article/153/1/014105/199076; https://pubmed.ncbi.nlm.nih.gov/32640825/) — pages not opened

## 5. Reaction–diffusion and stochastic biochemical simulation

### Gillespie-SSA — Gillespie DT (1977). Exact stochastic simulation of coupled chemical reactions. J. Phys. Chem. 81, 2340–2361. DOI 10.1021/j100540a008
- **Key result:** the stochastic simulation algorithm generates exact sample paths of the chemical master equation for well-stirred systems; cost scales with the number of reaction events, which becomes prohibitive at high copy number or with fast reactions — motivating tau-leaping (Gillespie 2001, J. Chem. Phys. 115, 1716, DOI 10.1063/1.1378322 — unconfirmed), which leaps over many events under a "leap condition" at the price of controlled error.
- **Relevance:** the exact fine model of the biochemical tier; tau-leaping, the linear-noise approximation and moment closures are its compiled approximations with well-studied validity conditions (tutorial review: Schnoerr, Sanguinetti, Grima 2017, J. Phys. A 50, 093001 — unconfirmed).
- **Limitations:** well-stirred; no spatial structure; exactness makes it the reference, not the workhorse.
- **Design implication for Physics-to-Life:** V1 should use SSA as ground truth and tau-leaping/LNA/ODE as the tiered coarse models, so the compile/OOD logic is tested where exact answers exist.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Hybrid-fast-slow — Haseltine EL, Rawlings JB (2002). Approximate simulation of coupled fast and slow reactions for stochastic chemical kinetics. J. Chem. Phys. 117, 6959–6969. DOI 10.1063/1.1505860
- **Key result:** partitions a network into fast reactions (deterministic or Langevin) and slow reactions (exact SSA), evolving the slow subsystem conditioned on the fast one; large speed-ups with small error when time scales separate.
- **Relevance:** the biochemical analogue of QM/MM — a static fidelity partition; dynamic re-partitioning by copy number/propensity was added later (Salis & Kaznessis 2005, J. Chem. Phys. 122, 054103 — unconfirmed), and the same hybrid CME/ODE idea underlies whole-cell models (Thornburg 2022).
- **Limitations:** partition criteria are heuristic; error unbounded when time scales overlap; deterministic fast species lose noise-induced effects.
- **Design implication for Physics-to-Life:** the V1 testbed should include regimes where the fast/slow partition breaks (bursty low-copy species, overlapping time scales) so a learned OOD monitor can be validated against known hybrid-method failures.
- **Novelty threat:** partial — adaptive hybrid partitioning exists; learned, error-driven partitioning does not.
- **Verified:** citation-only (unconfirmed)

### STEPS — Hepburn I, Chen W, Wils S, De Schutter E (2012). STEPS: efficient simulation of stochastic reaction–diffusion models in realistic morphologies. BMC Syst. Biol. 6, 36. DOI 10.1186/1752-0509-6-36
- **Key result:** a spatial SSA on tetrahedral meshes of realistic cell morphologies with membrane reactions, validated against analytical reaction–diffusion solutions; later parallelised for large neuronal geometries. Particle-based alternatives: Smoldyn (Andrews et al. 2010, PLoS Comput. Biol. 6, e1000705 — unconfirmed) and MCell (Kerr et al. 2008, SIAM J. Sci. Comput. 30, 3126 — unconfirmed).
- **Relevance:** the spatial-stochastic fine model for the cell tier and synapse/dendrite signalling; the natural fine-model partner for compiled reaction–diffusion surrogates at V1–V3.
- **Limitations:** cost grows with copy number and mesh resolution; subvolume-size constraints are a discretisation error source analogous to MSM state discretisation.
- **Design implication for Physics-to-Life:** reuse STEPS/Smoldyn/MCell as reference simulators; document mesh-resolution error as a discretisation term.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### UDE — Rackauckas C, Ma Y, Martensen J, Warner C, Zubov K, Supekar R, Skinner D, Ramadhan A, Edelman A (2020). Universal differential equations for scientific machine learning. arXiv:2001.04385
- **Key result:** embeds neural networks as unknown terms inside ODE/SDE/PDE models trained by adjoint sensitivities; recovers a missing reaction term in a Fisher–KPP reaction–diffusion model and terms of epidemiological/ecological ODEs, then converts the learned term into an interpretable expression by sparse (SINDy-style) regression (recalled).
- **Relevance:** the general recipe for "learn only the unknown part of the reaction–diffusion dynamics while keeping known physics"; also the technical basis of hybrid QSP+ML (thread 10). A biology-specific sparse-regression variant is Abubaker-Sharif, Devreotes, Iglesias (2024), "Machine learning sparse reaction-diffusion models from stochastic dynamics and spatiotemporal patterns", bioRxiv 10.1101/2024.10.02.616367 (search-confirmed URL only).
- **Limitations:** preprint; identifiability of the learned term is not guaranteed; stiff/stochastic training is fragile; learned terms extrapolate poorly outside observed states.
- **Design implication for Physics-to-Life:** build learned reaction–diffusion surrogates as UDEs with conservation laws hard-coded, and use disagreement between the learned term and re-simulated fine-scale (SSA/STEPS) data as the OOD trigger.
- **Novelty threat:** partial — hybrid mechanistic/learned dynamics is established; multiscale switching is not.
- **Verified:** citation-only (unconfirmed)

## 6. Whole-cell models and their cost

### Karr-WCM — Karr JR, Sanghvi JC, Macklin DN, Gutschow MV, Jacobs JM, Bolival B Jr, Assad-Garcia N, Glass JI, Covert MW (2012). A whole-cell computational model predicts phenotype from genotype. Cell 150, 389–401. DOI 10.1016/j.cell.2012.05.044
- **Key result:** 28 sub-models of different formalisms (ODE, flux balance, stochastic, Boolean) covering all 525 genes of *Mycoplasma genitalium*, integrated at 1 s time steps; predicted single-gene essentiality with ~79% agreement with experiment (recalled). Each simulated cell cycle took ~10 h of compute (figure reported on the SimTK project page and secondary sources — search-confirmed; not checked against the paper).
- **Relevance:** first full whole-cell integration; establishes both the feasibility and the cost of heterogeneous-formalism coupling, and the "hours per cell cycle" figure a compiled cell model must beat.
- **Limitations:** ~1,900 parameters (recalled) drawn from disparate sources and organisms; sub-model coupling by operator splitting without error control; minimal organism; no spatial resolution; hard to reuse.
- **Design implication for Physics-to-Life:** whole-cell models are integration scaffolds, not fine models; reuse Vivarium/wcEcoli-style process interfaces to plug compiled surrogates into a cell-scale integrator.
- **Novelty threat:** partial — multi-formalism integration exists; error-driven fidelity control across sub-models does not.
- **Verified:** search-confirmed (title and ~10 h figure via https://simtk.org/projects/wholecell and secondary sources) — page not opened; DOI/volume recalled

### syn3A-WCM — Thornburg ZR, Bianchi DM, Brier TA, Gilbert BR, Earnest TM, et al.; Luthey-Schulten Z (2022). Fundamental behaviors emerge from simulations of a living minimal cell. Cell 185, 345–360.e28. PII S0092-8674(21)01488-4 (DOI 10.1016/j.cell.2021.12.025 recalled)
- **Key result:** a fully dynamical kinetic whole-cell model of JCVI-syn3A (493 genes) combining stochastic (CME) genetic-information processes with deterministic (ODE) metabolism over a full cell cycle, showing how the minimal cell balances metabolism, gene expression and growth (search-confirmed abstract). The group's 2026 follow-up, "Bringing the genetically minimal cell to life on a computer in 4D" (Cell 2026, https://www.cell.com/cell/fulltext/S0092-8674(26)00174-1 — search-confirmed; authors not confirmed), adds full spatial resolution (Lattice Microbes, GPU) and reports ~6 days of multi-GPU compute for one 105-min cell cycle, with DNA replication on a dedicated GPU (phys.org/UIUC news, search-confirmed).
- **Relevance:** the reference point for "how much detail is necessary": even a 493-gene cell in 4D runs ~10^2–10^3× slower than real time on GPUs — the cost that compiled surrogates must remove.
- **Limitations:** kinetic parameters largely from other organisms; minimal cell has almost no regulation; spatial model validated mainly against growth/ribosome/proteomics data.
- **Design implication for Physics-to-Life:** use syn3A (public code, GitHub Luthey-Schulten-Lab/Minimal_Cell_4DWCM) as the cell-tier reference for testing compiled reaction–diffusion surrogates against a full-detail simulator.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://www.cell.com/cell/fulltext/S0092-8674(21)01488-4; https://pubmed.ncbi.nlm.nih.gov/35063075/) — pages not opened

### Ecoli-WCM — Macklin DN, Ahn-Horst TA, Choi H, Ruggero NA, et al.; Covert MW (2020). Simultaneous cross-evaluation of heterogeneous E. coli datasets via mechanistic simulation. Science 369, eaav3751. DOI 10.1126/science.aav3751
- **Key result:** an *E. coli* whole-cell model integrating transcription, translation, metabolism (FBA), replication and division, parameterised from many heterogeneous datasets; the model exposes inconsistencies between datasets (e.g., mRNA half-lives versus protein abundances) that no single dataset reveals and provides a framework for reconciling them.
- **Relevance:** shows the "world model as data-consistency checker" role that Physics-to-Life also claims; parameter provenance and dataset conflict are first-order problems at the cell scale.
- **Limitations:** no spatial resolution; sub-models coupled by operator splitting; compute cost per generation not confirmed in this scan (order of hours per generation is commonly quoted — unconfirmed).
- **Design implication for Physics-to-Life:** reuse the open-source wcEcoli/Vivarium infrastructure as the cell-tier integrator rather than rebuilding it.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

## 7. AI virtual cell and perturbation prediction

### AIVC — Bunne C, Roohani Y, Rosen Y, Gupta A, Zhang X, Roed M, et al. (2024). How to build the virtual cell with artificial intelligence: Priorities and opportunities. Cell 187, 7045–7063. DOI 10.1016/j.cell.2024.11.015
- **Key result:** agenda paper proposing an "AI virtual cell" built from universal multiscale representations (molecule → cell → tissue), "virtual instruments" that decode them, and an experiment–model loop driven by perturbation data; sets priorities for data generation, benchmarks and community organisation.
- **Relevance:** the mainstream data-driven counterpart to Physics-to-Life — the same multiscale question, answered with learned representations rather than physics; defines the community the programme will be compared against.
- **Limitations:** no mechanistic grounding, error theory or cost model; the predictive core (perturbation prediction) is not yet beyond linear baselines (see Linear-baselines entry).
- **Design implication for Physics-to-Life:** position the programme as supplying the mechanistic prior and error control the AIVC agenda lacks; adopt its benchmark culture (Virtual Cell Challenge) for the cell tier.
- **Novelty threat:** partial — overlapping vision, different method; the compile-with-OOD-fallback idea is absent.
- **Verified:** citation-only (unconfirmed)

### VCC — Roohani Y, et al. (Arc Institute) (2025). Virtual Cell Challenge: Toward a Turing test for the virtual cell. Cell 188 (2025). https://www.cell.com/cell/fulltext/S0092-8674(25)00675-0 (PubMed 40578317)
- **Key result:** an annual open benchmark modelled on CASP for predicting single-cell transcriptomic responses to held-out genetic perturbations; the first round covers CRISPR perturbations in a single cell type with purpose-built datasets and metrics (differential-expression and perturbation-discrimination scores plus an error metric; recalled), and drew >5,000 registrants from 114 countries and >1,200 teams (Arc reports, search-confirmed).
- **Relevance:** the only standing, community-accepted benchmark at the cell tier; the programme's cell-scale claims should be scored on it.
- **Limitations:** transcriptome-only end-point readout; one cell line; no dynamics, space or mechanism; metrics reward matching mean effects.
- **Design implication for Physics-to-Life:** add a VCC-style held-out perturbation test to the validation ladder at the cell level, supplemented by dynamical/mechanistic tests VCC cannot express.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://www.cell.com/cell/fulltext/S0092-8674(25)00675-0; https://pubmed.ncbi.nlm.nih.gov/40578317/) — pages not opened

### scGPT — Cui H, Wang C, Maan H, Pang K, Luo F, Duan N, Wang B (2024). scGPT: toward building a foundation model for single-cell multi-omics using generative AI. Nat. Methods 21, 1470–1480. DOI 10.1038/s41592-024-02201-0
- **Key result:** a transformer pre-trained on ~33 M cells, fine-tuned for cell typing, batch integration, gene-network inference and perturbation prediction, reporting gains over GEARS/CPA on Perturb-seq benchmarks (Pearson correlation of expression changes; recalled).
- **Relevance:** the representative "foundation cell model"; its perturbation claims are those later benchmarks found not to exceed linear baselines.
- **Limitations:** metrics dominated by mean-expression structure; no mechanism, dynamics or dose; independent re-evaluation shows baseline parity for perturbation prediction.
- **Design implication for Physics-to-Life:** reuse scGPT-class embeddings as state descriptors where useful, but do not treat them as a cell world model; any cell-scale surrogate must first beat the additive/linear baseline.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### GEARS — Roohani Y, Huang K, Leskovec J (2024). Predicting transcriptional outcomes of novel multigene perturbations with GEARS. Nat. Biotechnol. 42, 927–935. DOI 10.1038/s41587-023-01905-6
- **Key result:** a graph neural network over a gene-ontology-derived knowledge graph predicts transcriptional outcomes of single and two-gene perturbations, including genes never perturbed in training; reported ~40% higher precision than prior methods at classifying genetic-interaction subtypes on the Norman et al. combinatorial dataset (recalled). Its main deep-learning comparator is CPA (Lotfollahi M, Klimovskaia Susmelj A, De Donno C, et al.; Theis FJ, 2023, Predicting cellular responses to complex perturbations in high-throughput screens, Mol. Syst. Biol. 19, e11517, DOI 10.15252/msb.202211517 — unconfirmed), an autoencoder with additive perturbation/covariate latent effects supporting dose and combination extrapolation.
- **Relevance:** the strongest "prior-knowledge-graph + learning" design at the cell tier — analogous in spirit to physics priors, except the prior is ontological rather than mechanistic.
- **Limitations:** independent re-evaluations (next entry) find GEARS and CPA do not beat additive/linear baselines on held-out perturbations; the original metrics favoured mean-effect prediction.
- **Design implication for Physics-to-Life:** expect cell-tier gains to come from dynamics and mechanism (absent here), and report against the same simple baselines.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Linear-baselines — Ahlmann-Eltze C, Huber W, Anders S (2025). Deep-learning-based gene perturbation effect prediction does not yet outperform simple linear baselines. Nat. Methods 22, 1657–1661. DOI 10.1038/s41592-025-02772-6
- **Key result:** five foundation models and two other deep-learning models were compared with deliberately simple baselines (an additive model for double perturbations; a linear model on gene embeddings for unseen single perturbations) on Perturb-seq data; none outperformed the baselines (search-confirmed; preprint Oct 2024, published Aug 2025). Consistent findings: Kernfeld, Yang, Weinstock, Battle, Cahan, "A systematic comparison of computational methods for expression forecasting" (bioRxiv 10.1101/2023.07.28.551039 — search-confirmed URL; 11 large-scale perturbation datasets; methods rarely beat simple baselines) and PerturBench (Wu Y, et al. 2024, arXiv:2408.10609 — unconfirmed), which standardises perturbation benchmarks and reports simple baselines as competitive.
- **Relevance:** the critical-evaluation result that reframes the cell tier: current data-driven cell models sit near the linear/additive floor, so mechanistic structure is where headroom plausibly lies — but that has to be demonstrated, not assumed.
- **Limitations:** transcriptome-only, few datasets, static end-point readouts; the baselines exploit dataset structure (mean effects) and say nothing about dynamics or dose.
- **Design implication for Physics-to-Life:** make "beats the additive/linear baseline on held-out perturbations" a hard gate for any cell-scale surrogate, and design cell-tier tests with dynamic, dose-dependent readouts where linear baselines are expected to fail.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://www.nature.com/articles/s41592-025-02772-6; https://pubmed.ncbi.nlm.nih.gov/40759747/) — pages not opened

## 8. Multiscale cell/tissue platforms and learned emulators

### PhysiCell — Ghaffarizadeh A, Heiland R, Friedman SH, Mumenthaler SM, Macklin P (2018). PhysiCell: An open source physics-based cell simulator for 3-D multicellular systems. PLoS Comput. Biol. 14, e1005991. DOI 10.1371/journal.pcbi.1005991
- **Key result:** off-lattice, force-based agent simulator coupled to the BioFVM diffusion solver; OpenMP-parallel, simulating 10^5–10^6 cells on a desktop (recalled); demonstrated on tumour spheroids, hanging-drop cultures and immune–tumour interactions. The lattice (Cellular Potts) alternative is CompuCell3D (Swat MH, Thomas GL, Belmonte JM, Shirinifard A, Hmeljak D, Glazier JA, 2012, Multi-scale modeling of tissues using CompuCell3D, Methods Cell Biol. 110, 325–366, DOI 10.1016/B978-0-12-388403-9.00013-8 — unconfirmed).
- **Relevance:** the workhorse coarse layer at the tissue tier; its per-cell intracellular sub-models (Boolean/ODE via PhysiBoSS, libRoadRunner) are exactly where compiled cell-scale surrogates would plug in.
- **Limitations:** phenomenological cell mechanics; intracellular models are user-supplied and largely unvalidated; no formal error control across the cell/tissue interface.
- **Design implication for Physics-to-Life:** reuse PhysiCell (and CompuCell3D for Potts-type problems) as the tissue integrator; contribute validated per-cell surrogates and an error-driven policy for when to run them at full fidelity.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Chaste — Mirams GR, Arthurs CJ, Bernabeu MO, et al.; Gavaghan DJ (2013). Chaste: an open source C++ library for computational physiology and biology. PLoS Comput. Biol. 9, e1002970. DOI 10.1371/journal.pcbi.1002970
- **Key result:** verified, test-driven C++ library spanning cardiac electrophysiology (monodomain/bidomain with CellML ion-channel models) and cell-based tissue models (vertex, overlapping-spheres, Potts); emphasises software verification and reproducibility. Morpheus (Starruß J, de Back W, Brusch L, Deutsch A, 2014, Bioinformatics 30, 1331–1332, DOI 10.1093/bioinformatics/btt772 — unconfirmed) is the declarative (MorpheusML) alternative coupling CPM, ODE and PDE layers.
- **Relevance:** the one platform that already links ion-channel Markov/HH models (V2–V3) to tissue-scale PDEs in a single verified codebase.
- **Limitations:** fidelity fixed per simulation; steep learning curve; no learned components.
- **Design implication for Physics-to-Life:** use the Chaste cardiac stack as the V3 reference for conductance-based neuron/tissue tests and as the harness for plugging compiled channel models in via CellML.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Walpole-review — Walpole J, Papin JA, Peirce SM (2013). Multiscale computational models of complex biological systems. Annu. Rev. Biomed. Eng. 15, 137–154. DOI 10.1146/annurev-bioeng-071811-150104
- **Key result:** surveys multiscale modelling in systems biology — continuum, discrete/agent-based and hybrid approaches across molecular, cellular and tissue scales — and the recurring challenges of parameter estimation, scale bridging, validation and computational cost.
- **Relevance:** documents that "multiscale" in biology has meant hand-built scale couplings; names the missing piece (systematic scale bridging with error control) the programme targets.
- **Limitations:** pre-deep-learning; no treatment of learned surrogates or uncertainty quantification.
- **Design implication for Physics-to-Life:** use its taxonomy to make the programme's claim specific — the novelty is learned, error-controlled coupling, not multiscale modelling per se.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### ABM-surrogate — Comlekoglu T, et al. (2025). Surrogate modeling of Cellular-Potts agent-based models as a segmentation task using the U-Net neural network architecture. PLoS Comput. Biol. (2025), e1013626. DOI 10.1371/journal.pcbi.1013626 (arXiv:2505.00316)
- **Key result:** a U-Net trained on Cellular-Potts vascular-morphogenesis simulations predicts the next configuration as an image-segmentation task, ~562× faster than single-core CPM execution, capturing sprouting, anastomosis and lacuna contraction over short horizons (search-confirmed). Related: active-learning-driven exploration of PhysiCell immune–tumour models on HPC (Ozik et al. 2019, Mol. Syst. Des. Eng. 4, 747 — unconfirmed) and a 2025 review of ABM surrogates (https://pmc.ncbi.nlm.nih.gov/articles/PMC12675620/ — search-confirmed URL only).
- **Relevance:** a direct example of physics compilation at the tissue tier (stochastic ABM → learned emulator) with a quantified speed-up and a documented horizon of validity.
- **Limitations:** short-horizon fidelity only; error accumulates in rollouts; no uncertainty estimate or fallback; trained per model/parameter regime.
- **Design implication for Physics-to-Life:** tissue-tier surrogates should be rollout-validated with an explicit horizon and paired with an OOD trigger that re-invokes the ABM — the missing piece in this line of work.
- **Novelty threat:** partial — compile ABM→emulator exists; adaptive fallback does not.
- **Verified:** search-confirmed (https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1013626) — page not opened; author list beyond first author not confirmed

## 9. Ion channels and membranes

### HH — Hodgkin AL, Huxley AF (1952). A quantitative description of membrane current and its application to conduction and excitation in nerve. J. Physiol. 117, 500–544. DOI 10.1113/jphysiol.1952.sp004764
- **Key result:** four coupled ODEs with empirically fitted voltage-dependent gating variables (m, h, n) reproduce the squid-axon action potential and predict its propagation velocity to within ~10% (18.8 m/s predicted vs 21.2 m/s measured; recalled), decades before channel proteins were known.
- **Relevance:** the archetype of a compiled effective model — a low-dimensional empirical description of an ensemble of molecular machines that stays predictive without molecular detail; the endpoint of the V2→V3 ladder.
- **Limitations:** gating variables are phenomenological independent gates, which fails for channels with coupled/allosteric gating and state-dependent drug action; parameters are preparation- and temperature-specific.
- **Design implication for Physics-to-Life:** define V3 success as reproducing HH-level observables (AP shape, conduction velocity, f–I curves) from compiled channel models, with HH itself as the minimal-detail baseline any deeper model must beat.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Channel-Markov — Fink M, Noble D (2009). Markov models for ion channels: versatility versus identifiability and speed. Phil. Trans. R. Soc. A 367, 2161–2179. DOI 10.1098/rsta.2008.0301
- **Key result:** Markov (state) models generalise HH gating and can represent single-channel, gating-current and state-dependent drug data, but in the cardiac examples studied parameter unidentifiability was found in 9 of 13 models, preventing determination of the correct model layout; their higher computational cost relative to HH is quantified (search-confirmed). The underlying single-channel stochastic theory is Colquhoun & Hawkes 1981, Proc. R. Soc. B 211, 205 — unconfirmed.
- **Relevance:** the channel Markov model is the natural compiled intermediate between MD and HH; this paper documents its central failure mode — non-identifiability from electrophysiology alone — which molecular simulation could in principle resolve.
- **Limitations:** identifiability analysis is protocol-specific; pre-dates modern optimal-experimental-design and uncertainty-quantification work on channel models.
- **Design implication for Physics-to-Life:** at V2, use MD-derived structural priors on state topology to break identifiability degeneracies, and treat identifiability as a first-class diagnostic for compiled channel models.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://royalsocietypublishing.org/rsta/article-abstract/367/1896/2161/17591/) — page not opened

### MD-to-conductance — Jensen MØ, Borhani DW, Lindorff-Larsen K, Maragakis P, Jogini V, Eastwood MP, Dror RO, Shaw DE (2010). Principles of conduction and hydrophobic gating in K+ channels. Proc. Natl Acad. Sci. USA 107, 5833–5838. DOI 10.1073/pnas.0911734107
- **Key result:** multi-microsecond all-atom MD (Anton) of a Kv1.2 pore under applied voltage captured hundreds of spontaneous K+ permeation events, giving current–voltage relations and a hydrophobic-gating mechanism directly from structure (recalled). Computational-electrophysiology protocols were generalised by Kutzner et al. 2011, Biophys. J. 101, 809 — unconfirmed. Earlier continuum-versus-particle tests (Corry, Kuyucak, Chung 2000, Biophys. J. 78, 2364 — unconfirmed) showed Poisson–Nernst–Planck theory fails in narrow channels where Brownian dynamics remains valid.
- **Relevance:** shows the fine model can reach the coarse observable (conductance) — but only with µs-scale special-purpose compute — and that the intermediate continuum model (PNP) has a known validity boundary: the two-level structure the programme's OOD logic must encode.
- **Limitations:** computed conductances depend strongly on force-field ion parameters and applied voltage; later work reports systematic under-estimation relative to experiment (magnitude unconfirmed); µs simulations remain too expensive for routine use.
- **Design implication for Physics-to-Life:** V2 should compile MD permeation into a Markov/BD intermediate with force-field sensitivity quantified, and use PNP only where its validity conditions (pore radius vs Debye length) hold.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### Ensemble-allostery — Motlagh HN, Wrabl JO, Li J, Hilser VJ (2014). The ensemble nature of allostery. Nature 508, 331–339. DOI 10.1038/nature13001
- **Key result:** frames allostery statistically-mechanically as a ligand-induced redistribution of the conformational ensemble rather than a fixed mechanical pathway; explains allostery without conformational change, the role of intrinsic disorder, and context dependence of allosteric coupling.
- **Relevance:** allosteric regulation of channels and receptors is an ensemble (free-energy) property, so a compiled protein model must preserve population shifts, not just structures — the same requirement the CG and MSM literature articulates.
- **Limitations:** conceptual; quantitative prediction of allosteric coupling from sequence/structure remains unsolved.
- **Design implication for Physics-to-Life:** validate compiled protein/channel models on population-shift observables (binding-induced ΔΔG between states), which MSM-type surrogates can express and static structure predictors cannot.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

## 10. Hybrid mechanistic + neural modelling in biology

### SBINN — Yazdani A, Lu L, Raissi M, Karniadakis GE (2020). Systems biology informed deep learning for inferring parameters and hidden dynamics. PLoS Comput. Biol. 16, e1007575. DOI 10.1371/journal.pcbi.1007575
- **Key result:** physics-informed neural networks with ODE-residual losses infer kinetic parameters and unobserved species from sparse, noisy measurements of a few observables in yeast glycolysis, apoptosis and glucose–insulin models (recalled).
- **Relevance:** a hybrid mechanistic+learned identification tool for the biochemical tier, usable at V1 for calibrating compiled models from partial observations.
- **Limitations:** requires the correct model structure; PINN training is fragile for stiff/oscillatory dynamics; no handling of structural uncertainty.
- **Design implication for Physics-to-Life:** use SBINN-style inference where mechanism is known; where it is not, prefer UDEs with learned residual terms.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### P-NET — Elmarakeby HA, Hwang J, Arafeh R, Crowdis J, et al.; Van Allen EM (2021). Biologically informed deep neural network for prostate cancer discovery. Nature 598, 348–352. DOI 10.1038/s41586-021-03922-4
- **Key result:** a sparse network whose layers map genes → Reactome pathways → higher-level processes predicts metastatic versus primary prostate cancer with far fewer parameters than dense networks, and its attributions nominated mechanisms (e.g., MDM4) subsequently validated experimentally. Precedent: DCell (Ma et al. 2018, Nat. Methods 15, 290 — unconfirmed), a GO-hierarchy-structured network predicting yeast genetic-interaction phenotypes.
- **Relevance:** "biologically informed" here means an ontology structure prior, not physics; demonstrates the interpretability and generalisation benefit of priors without dynamical fidelity.
- **Limitations:** static classification; ontology priors are incomplete and biased; no dynamics or intervention semantics.
- **Design implication for Physics-to-Life:** reserve ontology-structured networks for cell/tissue tiers where physics priors are unavailable; keep mechanistic priors wherever they exist.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed)

### PHOENIX — Hossain I, et al. (Quackenbush lab) (2024). Biologically informed NeuralODEs for genome-wide regulatory dynamics. Genome Biol. 25 (2024). DOI 10.1186/s13059-024-03264-0
- **Key result:** neural ODEs with Hill-function-like structure and prior-knowledge (TF–target) regularisation learn genome-scale gene-regulatory dynamics; recover oscillatory expression in synchronised yeast and scale to breast-cancer and rituximab-treated B-cell datasets while yielding sparse, interpretable regulatory terms (search-confirmed summary; code at github.com/QuackenbushLab/phoenix).
- **Relevance:** the neural-ODE-with-mechanistic-prior pattern applied to gene regulation — the cell-tier analogue of UDEs and a candidate compiled model for the GRN component of a virtual cell.
- **Limitations:** bulk time-course data; identifiability of learned regulation is limited; no stochasticity or space.
- **Design implication for Physics-to-Life:** reuse PHOENIX-style priors for GRN surrogates; validate against SSA-level stochastic simulators (V1) before trusting on real data.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://link.springer.com/article/10.1186/s13059-024-03264-0) — page not opened; author list beyond first author not confirmed

### QSP+ML — Zhang T, Androulakis IP, Bonate P, Cheng L, Helikar T, Parikh J, Rackauckas C, Subramanian K, et al. (2022). Two heads are better than one: current landscape of integrating QSP and machine learning. J. Pharmacokinet. Pharmacodyn. 49, 5–18. DOI 10.1007/s10928-022-09805-z
- **Key result:** ISoP working-group white paper mapping how ML is combined with quantitative systems pharmacology models — ML for parameter estimation and virtual populations, ML emulators of QSP models, ML-assisted model reduction, and hybrid (UDE-style) models — and naming validation, interpretability and data sharing as the blockers (search-confirmed).
- **Relevance:** pharmacology is where "mechanistic + learned" is already accepted practice with regulatory-grade credibility standards; directly relevant to the programme's control/intervention use cases.
- **Limitations:** survey; few quantitative head-to-head comparisons; most hybrids are single-scale.
- **Design implication for Physics-to-Life:** adopt QSP-style credibility practice (verification, validation, uncertainty quantification) for compiled models and reuse existing QSP emulator work.
- **Novelty threat:** none.
- **Verified:** search-confirmed (https://link.springer.com/article/10.1007/s10928-022-09805-z; https://pubmed.ncbi.nlm.nih.gov/35103884/) — pages not opened

## 11. Adaptive resolution and on-demand fine-scale calls

### LOTF — Csányi G, Albaret T, Payne MC, De Vita A (2004). "Learn on the fly": A hybrid classical and quantum-mechanical molecular dynamics simulation. Phys. Rev. Lett. 93, 175503. DOI 10.1103/PhysRevLett.93.175503
- **Key result:** a classical potential is continuously re-fitted during the run to QM forces computed only in a small region where the classical model is judged inadequate (e.g., a crack tip), with a predictor–corrector scheme keeping the dynamics smooth; QM is called on demand rather than everywhere.
- **Relevance:** the earliest explicit "on-demand fine-scale call inside a running coarse simulation" — a direct antecedent of the programme's physics-compilation loop, with a hand-defined trigger. Conceptual relatives: equation-free coarse projective integration (Kevrekidis et al. 2003, Commun. Math. Sci. 1, 715 — unconfirmed) and the heterogeneous multiscale method (E & Engquist 2003, Commun. Math. Sci. 1, 87 — unconfirmed), which run microscopic simulators only in short bursts to estimate coarse time derivatives.
- **Limitations:** region selection is geometric/heuristic; the refitted potentials are local and short-lived; no learned uncertainty.
- **Design implication for Physics-to-Life:** replace LOTF's hand-picked region with a learned-uncertainty criterion, but keep its predictor–corrector integration to avoid discontinuities when fidelity switches.
- **Novelty threat:** direct — establishes "coarse model with on-demand fine calls" in molecular simulation; novelty must be the learned trigger and cross-scale scope.
- **Verified:** citation-only (unconfirmed)

### AdResS — Praprotnik M, Delle Site L, Kremer K (2005). Adaptive resolution molecular-dynamics simulation: Changing the degrees of freedom on the fly. J. Chem. Phys. 123, 224106. DOI 10.1063/1.2132286
- **Key result:** molecules switch between atomistic and coarse-grained representations as they cross a spatial transition region, with force interpolation ensuring free exchange and thermodynamic consistency; extended to Hamiltonian AdResS (Potestio et al. 2013, Phys. Rev. Lett. 110, 108301 — unconfirmed) and paralleled by adaptive QM/MM partitioning (Heyden, Lin, Truhlar 2007, J. Phys. Chem. B 111, 2231 — unconfirmed).
- **Relevance:** solves the *mechanics* of switching resolution within one simulation — what must be conserved and what is lost (momentum/energy bookkeeping, matched pressure and density) — a prerequisite for any adaptive-fidelity scheme.
- **Limitations:** the trigger is spatial, not error-driven; requires a CG model already matched to the atomistic one at the same state point; biomolecular applications remain limited.
- **Design implication for Physics-to-Life:** reuse AdResS-style coupling for the spatial interface; put the programme's novelty in the when/where decision (learned error), not in the interpolation mechanics.
- **Novelty threat:** partial — adaptive resolution exists; learned, uncertainty-driven adaptivity across biological scales does not.
- **Verified:** citation-only (unconfirmed)

### FLARE — Vandermause J, Torrisi SB, Batzner S, Xie Y, Sun L, Kolpak AM, Kozinsky B (2020). On-the-fly active learning of interpretable Bayesian force fields for atomistic rare events. npj Comput. Mater. 6, 20. DOI 10.1038/s41524-020-0283-z
- **Key result:** a sparse Gaussian-process force field with calibrated predictive uncertainty drives MD and calls DFT only when the uncertainty of a local environment exceeds a threshold, updating itself on the fly; captures rare events (diffusion, defect migration) with only hundreds of DFT calls (recalled). The committee-disagreement analogue is DP-GEN (Zhang, Lin, Wang, Car, E 2019, Phys. Rev. Mater. 3, 023804 — unconfirmed).
- **Relevance:** the closest existing realisation of "compiled fine model + uncertainty-triggered return to the fine model" — the programme's core loop — at the atomistic scale.
- **Limitations:** uncertainty is epistemic in descriptor space and misses model-form error (e.g., absent long-range physics); GP cost grows with data; thresholds are hand-set; materials-focused.
- **Design implication for Physics-to-Life:** adopt FLARE/DP-GEN-style uncertainty-gated fine calls as the reference implementation at the molecular tier and generalise the trigger design (calibration, thresholds, cost-aware policies) upward to CG, kinetic and cellular tiers.
- **Novelty threat:** direct — at the atomistic level the loop exists; the programme's claim must be its cross-scale, biology-specific generalisation.
- **Verified:** citation-only (unconfirmed)

---

## Synthesis for this cluster

**Where physics compilation already works.** Two tiers have mature compiled models. (1) MD → kinetics: MSMs (Prinz 2011) come with a discretisation-error theory, validation tests (Chapman–Kolmogorov, implied timescales), a learned variant (VAMPnets) and an uncertainty-driven fine-call policy (adaptive sampling, Bowman 2010) that scaled to exascale aggregation on Folding@home; memory corrections (qMSM) cut the fine-scale data needed by 5–10×. (2) QM → forces: MLIPs (ANI → NequIP → MACE) compile DFT into reusable potentials with ~10^3 fine calls per system, foundation potentials (MACE-MP-0, UMA) push toward "compile once", and uncertainty-gated fine calls already exist (FLARE, DP-GEN), as do on-demand QM inside classical MD (LOTF) and spatial resolution switching (AdResS, adaptive QM/MM). At the cell/tissue tier, hybrid CME/ODE whole-cell models and ABM emulators (~560× speed-up over short horizons) show the pattern, without error control.

**Where it is known to fail.** *Transferability:* bottom-up CG potentials are state-point-dependent free energies (Noid) and single-system in practice (CGnet/CGSchNet); top-down CG (Martini) accumulated systematic biases for a decade before broad benchmarking caught them. *OOD:* universal MLIPs are systematically soft (Deng 2025) — a biased error concentrated at barriers, i.e., exactly the rates a compiled kinetic model consumes — and low force error does not imply stable or correct simulation (Fu 2023). Kinetic compilation fails through unsampled states, discretisation and non-Markovianity. Ion-channel Markov models are often non-identifiable from electrophysiology alone (9 of 13 models, Fink & Noble) and continuum PNP fails in narrow pores. At the cell tier, data-driven perturbation models have not beaten additive/linear baselines (Ahlmann-Eltze 2025; Kernfeld; PerturBench), and full-detail cells cost ~10 h (Karr 2012) to ~6 GPU-days per cycle (2026 4D syn3A).

**Implications for the validation ladder.** *V0 (toy):* reproduce the MSM/adaptive-sampling loop on a low-dimensional potential with a learned surrogate and require (a) CK-test pass, (b) calibrated uncertainty that triggers fine calls at deliberately planted OOD regions, and (c) detection of *biased* softening-type errors, which feature-distance OOD misses. *V1 (synthetic biochemical):* SSA/STEPS as ground truth, tau-leaping/LNA/ODE as tiered coarse models, UDE surrogates between them; the test is whether the error-driven policy recovers the known failure regimes of hybrid partitioning (low-copy bursts, overlapping time scales) at lower cost than the fine model. *V2 (channel/membrane):* Martini 3 for the lipid environment, atomistic selectivity filter; compile MD permeation/gating into a Markov model whose topology is constrained by structure (breaking identifiability degeneracy); validate against I–V curves with force-field sensitivity reported; allow PNP only inside its validity conditions. *V3 (conductance neuron):* compiled channel models inside HH/Chaste-type frameworks must reproduce AP shape, velocity and state-dependent pharmacology at least as well as hand-fitted Markov models, with HH as the minimal-detail baseline to beat.

**Reuse rather than rebuild.** MACE/MACE-OFF, UMA/Orb (potentials); OpenMM + openmm-torch/NNPOps (ML/MM execution); FLARE/DP-GEN (uncertainty-gated learning); deeptime/PyEMMA (MSM/VAMP); Martini 3 (membranes); SSA/tau-leaping libraries and STEPS/Smoldyn/MCell (stochastic reaction–diffusion); wcEcoli/Vivarium and the syn3A models (cell integrators); PhysiCell/CompuCell3D/Chaste/Morpheus (tissue); CellML-based channel-model toolchains; the Virtual Cell Challenge plus additive/linear baselines (cell-tier benchmark). The programme's defensible novelty is the cross-scale, learned, error-controlled switching policy and its validation ladder — not any single compiled model, since every tier has one.
