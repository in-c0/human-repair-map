# Literature scan — Drosophila as a scaffold + historical prospective validation

**Scan date:** 2026-09-14. **Cluster:** Drosophila as the first organism-scale test environment for the Physics-to-Life learned multiscale world model (connectome as structural scaffold; missing biology as explicit uncertainty; damaged/aged virtual states with repair-policy search; regeneration/morphogenesis hidden-target benchmarks; historical prospective validation with knowledge cutoffs). This scan covers eight threads: connectomics; connectome-constrained whole-brain models and their critics; body/biomechanics and whole-brain imaging in behaving flies; fly electrophysiology, biophysical neuron models and transcriptomic atlases; aging; development/regeneration/homeotic transformations; genetic perturbation resources and neuron–behaviour maps; and time-cutoff (retrodiction) benchmarks and leakage methodology. **Verification caveat (important):** the session's network egress policy denied every publisher and index host tried (nature.com, science.org, cell.com, sciencedirect.com, elifesciences.org, biorxiv.org, arxiv.org, doi.org, pubmed/PMC/eutils, api.crossref.org, semanticscholar.org, europepmc.org, openalex, ADS, annualreviews.org, pubs.acs.org, academic.oup.com, journals.plos.org, pnas.org, jneurosci.org, flybase.org, janelia.org, modeldb.science, datadryad.org, readthedocs.io, wikipedia). The only host that could be opened was github.com. Therefore **"Verified: yes (URL)" is used only where I actually opened a page carrying the citation — in practice the paper's official code/data repository (which for several 2023–2025 papers cites the preprint rather than the journal version; this is stated per entry)**. Every other entry is marked **"citation-only (unconfirmed)"** even when web-search result metadata (title/authors/venue/year/DOI) matched; bibliographic details in those entries come from search-engine result records and snippets and should be re-checked against the DOI page before being quoted in a paper. Author lists are shown only as far as they appeared in search records or repository pages, with "et al." marking truncation; issue numbers and page ranges not shown in those records were omitted. No DOI below was invented: where a DOI was not displayed in a search record, a URL is given instead or the field is marked "DOI not seen". Three corrections to the brief's own citations surfaced during the scan: Hariharan & Serras 2017 is in *Current Opinion in Cell Biology* (not *Genetics & Development*); the Schaffer whole-brain-imaging study is Schaffer et al. 2023 *Nature Communications* (Flygenvectors preprint 2021); Brezovec et al. 2024 is in *Current Biology*, not *Nature*.

---

## Thread 1 — Connectomics (scaffold datasets)

### flywire-wiring — Dorkenwald S, Matsliah A, Sterling AR, et al. (FlyWire Consortium) (2024). Neuronal wiring diagram of an adult brain. Nature 634(8032):124–138. DOI 10.1038/s41586-024-07558-y
- **Key result:** Whole-brain synaptic wiring diagram of one adult female *D. melanogaster*: 139,255 proofread neurons and ~5 × 10^7 chemical synapses, with annotations for cell class, nerve, hemilineage and predicted neurotransmitter; open data ecosystem (FlyWire/Codex). Citizen scientists proofread ~18,000 neurons and labelled >38,000.
- **Relevance:** This is the primary adult-brain structural scaffold for Physics-to-Life; the graph (nodes = neurons, edges = synapse counts) is the object into which biophysics will be embedded.
- **Limitations:** Single female individual; synapse counts are not synaptic strengths; no gap junctions; neurotransmitter is *predicted* (see Eckstein 2024), receptors unknown; no glia, neuropeptides or volume transmission; retina/lamina and VNC absent; static snapshot (age ~1 week; no plasticity).
- **Design implication for Physics-to-Life:** Treat every edge weight as a prior with explicit uncertainty (count → conductance mapping unknown) and version-pin the release (630 vs 783 — see Shiu entry) so that scaffold provenance is reproducible.
- **Novelty threat:** none — it is a data resource, not a modelling programme.
- **Verified:** yes (https://github.com/flyconnectome/flywire_annotations — README cites Dorkenwald et al. 2024 Nature, DOI 10.1038/s41586-024-07558-y; volume/pages from https://github.com/sjcabs/fly_connectome_data_tutorial, whose README carries a DOI typo for this paper).

### flywire-celltypes — Schlegel P, Yin Y, Bates AS, Dorkenwald S, Eichler K, Brooks P, et al. (2024). Whole-brain annotation and multi-connectome cell typing of Drosophila. Nature 634(8032):139–152. DOI 10.1038/s41586-024-07686-5
- **Key result:** Hierarchical annotation of the ~140,000-neuron FlyWire brain into 8,453 cell types (3,643 previously proposed in the hemibrain, 4,581 new), plus classes, hemilineages and cross-connectome matching that quantifies connectivity stereotypy between hemispheres and between two individuals (FlyWire vs hemibrain).
- **Relevance:** Provides the "parts list" that maps connectome nodes to genetic driver lines and transcriptomic cell types — the join key for perturbation ground truth and for channel/receptor assignment.
- **Limitations:** Cell typing is partly morphological/connectivity-based rather than molecular; inter-individual comparison rests on two brains; types outside the hemibrain volume have weaker cross-validation.
- **Design implication for Physics-to-Life:** Use cell type (not individual neuron) as the unit for parameter sharing and uncertainty pooling; keep a versioned crosswalk hemibrain ↔ FlyWire ↔ BANC ↔ male CNS types.
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/flyconnectome/flywire_annotations — README cites Schlegel et al. 2024 Nature, DOI 10.1038/s41586-024-07686-5).

### hemibrain — Scheffer LK, Xu CS, Januszewski M, et al. (2020). A connectome and analysis of the adult Drosophila central brain. eLife 9:e57443. DOI 10.7554/eLife.57443
- **Key result:** Dense EM reconstruction of a large portion of the central brain ("hemibrain") of a 5-day-old female: ~25,000 neurons and ~20 million synapses, semi-automatically reconstructed and proofread; freely available via neuPrint.
- **Relevance:** Second independent adult brain sample; enables individual-to-individual comparison (with FlyWire) that bounds how "stereotyped" any scaffold can be; source of hemibrain cell-type nomenclature used across the field.
- **Limitations:** Covers roughly half the central brain plus parts of the optic lobe only; one individual; no gap junctions/neuromodulators; some cut-off neurons.
- **Design implication for Physics-to-Life:** Use hemibrain-vs-FlyWire divergence as the empirical floor on scaffold uncertainty (a model tuned to one brain must not fit the other worse than inter-individual variability allows).
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/sjcabs/fly_connectome_data_tutorial — README cites Scheffer et al. 2020 eLife 9:e57443 and states ~25,000 neurons).

### manc — Takemura S, et al. (2024). A Connectome of the Male Drosophila Ventral Nerve Cord. eLife (2024). DOI 10.7554/eLife.97769 (companion: Marin et al. (2024) Systematic annotation of a complete adult male Drosophila nerve cord connectome reveals principles of functional organisation. eLife 13:RP97766, DOI 10.7554/eLife.97766)
- **Key result:** First dense VNC connectome (male): >23,000 neurons, >10 million presynapses and 74 million postsynapses, 44 m of arbour. Search-record snippets report that proofreading captured ~42% of overall VNC synaptic connectivity (33–62% by neuropil). Marin et al. add hierarchical annotations, left–right/serial homologues and systematic cell types for intrinsic and sensory neurons (available in neuPrint/Clio).
- **Relevance:** Motor side of the scaffold (descending → premotor → motor neurons → legs/wings); required for any embodied (NeuroMechFly-type) closure of the sensorimotor loop.
- **Limitations:** Male (brain datasets are female — sex mismatch); incomplete synapse capture (~42%); no brain; muscle/receptor identities absent.
- **Design implication for Physics-to-Life:** Model synapse-capture incompleteness explicitly (edge-existence probabilities, not just weights); cross-sex integration needs the male-CNS/BANC crosswalk.
- **Novelty threat:** none.
- **Verified:** yes for Takemura (https://github.com/sjcabs/fly_connectome_data_tutorial — README cites Takemura et al. 2024 eLife, DOI 10.7554/eLife.97769, ~23,000 neurons); Marin et al. 2024: citation-only (unconfirmed).

### banc — Bates AS, Phelps JS, Kim M, Yang HH, … (2026). Distributed control circuits across a brain-and-cord connectome. Nature (open access), DOI 10.1038/s41586-026-10735-w; preprint bioRxiv 2025.07.31.667571 (v3)
- **Key result:** First synapse-resolution connectome uniting brain, SEZ, cervical connective and the entire VNC of one adult female: ~188,000 neurons and ~199 million predicted synapses (7,010 serial sections, 4 × 4 × 45 nm³, GridTape TEM), annotated for cell type, neurotransmitter, hemilineage, behavioural function and cross-dataset identity; data deposited (Harvard Dataverse DOI 10.7910/DVN/7WTH1N). Note: an independent tutorial README quotes "~114,000 neurons, ~108 million synaptic connections" for the BANC — likely an earlier proofread subset; the discrepancy must be resolved against the paper before quoting.
- **Relevance:** This is the *whole-CNS* scaffold the programme describes; it removes the brain/VNC sex mismatch and provides the only single-individual female brain+cord graph.
- **Limitations:** Lamina/retina and first optic relay missing (per tutorial README); predicted (not measured) synapses and transmitters; one individual; no gap junctions, peptides, glia, muscles.
- **Design implication for Physics-to-Life:** Adopt BANC as the default CNS scaffold, with FlyWire (brain) and MANC (cord) as replicate-individual checks; record proofreading state as a versioned uncertainty layer.
- **Novelty threat:** partial — the paper itself analyses "distributed control circuits" across brain and cord, overlapping with any purely connectomic circuit-level claims the programme might make; it does not build a physical/biophysical world model.
- **Verified:** yes (https://github.com/htem/BANC-project — README quoted verbatim: "approximately 188,000 neurons and 199 million predicted synapses", "Bates, Phelps, Kim, Yang et al., *Nature* 2026 — open access", "doi = {10.1038/s41586-026-10735-w}", "Preprint: bioRxiv 2025.07.31.667571 (v3)"; the Nature page itself could not be opened).

### male-cns — Berg S, Beckett IR, Costa M, … (2025). Sexual dimorphism in the complete connectome of the Drosophila male central nervous system. bioRxiv 2025.10.09.680999 (journal version reported as Cell, 2026)
- **Key result:** Complete male CNS connectome: 166,691 neurons (brain + VNC), fully proofread, 11,691 cell types, annotated for *fruitless*/*doublesex* expression. Of 7,319 cross-matched central-brain types, 114 are dimorphic with 262 male- and 69 female-specific types (4.8% of male neurons, 2.4% of female neurons). Search records indicate a Cell publication (S0092-8674(26)00942-6) on 2026-09-03 and a bioRxiv v2 on 2025-10-30.
- **Relevance:** Second whole-CNS individual (male) — the first opportunity to quantify whole-CNS inter-individual and sex-specific scaffold variance; dimorphic circuits are natural "hidden transformation" targets.
- **Limitations:** Male vs female comparison confounds sex with individual; same EM-derived gaps as other datasets.
- **Design implication for Physics-to-Life:** Build the scaffold as a *distribution over individuals* (BANC, male CNS, FlyWire, hemibrain) rather than a single graph; use the 4.8%/2.4% dimorphic fraction to set priors on how much of a circuit may be individual-specific.
- **Novelty threat:** none.
- **Verified:** yes for the preprint (https://github.com/flyconnectome/flywire_annotations and https://github.com/sjcabs/fly_connectome_data_tutorial — READMEs cite Berg et al. 2025 bioRxiv 10.1101/2025.10.09.680999 and 166,691 neurons); Cell 2026 version: citation-only (unconfirmed).

### larval-connectome — Winding M, Pedigo B, Barnes C, et al. (2023). The connectome of an insect brain. Science 379(6636). DOI 10.1126/science.add9330
- **Key result:** Complete synaptic-resolution connectome of a *Drosophila* larval brain: 3,016 neurons and 548,000 synapses; pervasive multisensory and interhemispheric integration, highly recurrent architecture, abundant feedback from descending neurons, and novel circuit motifs.
- **Relevance:** The only *complete* insect brain small enough for exhaustive whole-brain biophysical simulation and for exhaustive perturbation ground truth (Vogelstein 2014 activation atlas); ideal first organism-scale sandbox before the adult.
- **Limitations:** Larva ≠ adult (different body, no flight/walking legs); single individual; larval neurons are still growing; no gap junctions/neuromodulators captured.
- **Design implication for Physics-to-Life:** Use the larval brain as the "V0" scaffold where full parameter uncertainty can be enumerated and where whole-brain activity constraints are cheapest to obtain.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) — official analysis repositories (mwinding/connectome_analysis, neurodata/maggot_models) were opened but do not print the citation.

### nt-prediction — Eckstein N, Bates AS, Champion A, Du M, Yin Y, Schlegel P, … Funke J (2024). Neurotransmitter classification from electron microscopy images at synaptic sites in Drosophila melanogaster. Cell 187(10):2574–2594.e23. DOI 10.1016/j.cell.2024.03.016
- **Key result:** A CNN predicts one of six transmitters (ACh, glutamate, GABA, serotonin, dopamine, octopamine) from EM images of presynapses with 87% accuracy per synapse and 94% per neuron; used to assign transmitter to FlyWire/BANC neurons.
- **Relevance:** Supplies the sign (excitatory/inhibitory) of scaffold edges — the single most important non-structural quantity a connectome lacks — but as a *prediction with known error rates*.
- **Limitations:** Six classes only (no peptides, co-transmission, histamine, tyramine); postsynaptic receptor type (e.g., excitatory nAChR vs inhibitory mAChR; GABA-A vs GABA-B; inhibitory GluCl) is *not* predicted; per-neuron 6% error compounds along pathways.
- **Design implication for Physics-to-Life:** Represent edge sign as a categorical distribution (confidence from the classifier), and treat receptor identity as a separate latent to be inferred from transcriptomes (Davis 2020; Li 2022).
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/sjcabs/fly_connectome_data_tutorial — README cites Eckstein et al. 2024 Cell 187(10):2574–2594.e23, DOI 10.1016/j.cell.2024.03.016; https://github.com/funkelab/synister cites the bioRxiv version and lists the six transmitter classes).

---

## Thread 2 — Connectome-constrained whole-brain models and critical assessments

### lif-whole-brain — Shiu PK, et al. (2024). A Drosophila computational brain model reveals sensorimotor processing. Nature 634:210– (issue of 2024-10-02). DOI 10.1038/s41586-024-07763-9; preprint bioRxiv 2023.05.02.539144
- **Key result:** Leaky integrate-and-fire model of the entire adult brain connectome (>125,000 neurons, ~50 million synaptic connections) with synaptic weights proportional to synapse counts and signs from predicted transmitters; computational activation of sugar/water gustatory neurons predicts neurons that respond to taste and are required for feeding initiation, and activation of mechanosensory subtypes reproduces the antennal grooming circuit response; predictions validated experimentally.
- **Relevance:** The closest existing instantiation of "connectome as scaffold + minimal physics" at whole-brain scale; establishes two circuits (feeding initiation, antennal grooming) with matched in-silico and in-vivo perturbation outcomes.
- **Limitations:** Identical neurons (no morphology, channel diversity or receptor dynamics); no gap junctions, non-spiking neurons, neuromodulation, internal state or peptides; accuracy bounded by synapse and transmitter prediction; weights = counts is an untested assumption.
- **Design implication for Physics-to-Life:** Use this LIF model as the *baseline* level of the multiscale ladder and measure what added biophysics buys on the same two ground-truth circuits.
- **Novelty threat:** partial — demonstrates whole-brain connectome-constrained prediction of perturbation outcomes, but with a fixed, non-learned, single-scale neuron model and no body.
- **Verified:** yes for the preprint (https://github.com/philshiu/Drosophila_brain_model — README cites bioRxiv 10.1101/2023.05.02.539144 and describes LIF simulation on FlyWire releases 630/783); Nature 2024 metadata from search records only.

### flyvis — Lappalainen JK, et al. (2024). Connectome-constrained networks predict neural activity across the fly visual system. Nature 634:1132–1140. DOI 10.1038/s41586-024-07939-3
- **Key result:** A deep mechanistic network with connectivity fixed to the optic-lobe connectome for 64 cell types (motion pathways) and unknown single-neuron/synapse parameters optimised by deep learning on a motion-detection task predicts neural responses at single-neuron resolution, agreeing with measurements across 26 studies (including direction selectivity of T4/T5).
- **Relevance:** Template for "learned parameters inside a fixed structural scaffold" — exactly the programme's embedding strategy, with the ensemble-over-solutions idea as an uncertainty representation.
- **Limitations:** Requires a task objective; solutions are non-unique (ensembles disagree on some cell types); rate-based, no spikes/biophysics; visual system only; optimisation via BPTT does not scale to whole brain (per FlyGM critique).
- **Design implication for Physics-to-Life:** Adopt task-constrained parameter inference plus ensembles as the standard way to represent "missing biology as uncertainty"; define held-out physiology as the evaluation, not the training signal.
- **Novelty threat:** partial — same scaffold-plus-learned-parameters logic, but restricted to one subsystem and one scale.
- **Verified:** yes (https://github.com/TuragaLab/flyvis — README cites Lappalainen et al. 2024 Nature, DOI 10.1038/s41586-024-07939-3).

### teacher-student — Beiran M & Litwin-Kumar A (2025). Prediction of neural activity in connectome-constrained recurrent networks. Nature Neuroscience 28:2561–2574. DOI 10.1038/s41593-025-02080-4
- **Key result:** Theory in which a "student" RNN with the *same connectivity* as a ground-truth "teacher" but different biophysical parameters is trained to reproduce activity; shows that connectome data alone are generally insufficient to predict activity, but pairing connectivity with recordings from a subset of neurons yields accurate predictions for unrecorded neurons.
- **Relevance:** Formalises the programme's premise — the scaffold constrains but does not determine dynamics — and quantifies how many recordings are needed to close the gap.
- **Limitations:** Idealised (rate) networks; assumes perfect connectivity; real data have connectome errors and unmodelled modulation.
- **Design implication for Physics-to-Life:** Budget for *targeted* physiology (which neurons to record to maximally reduce parameter uncertainty) as an active-learning loop inside the world model.
- **Novelty threat:** none — supportive critical theory.
- **Verified:** citation-only (unconfirmed).

### strong-connections — Currier TA & Clandinin TR (2025). Infrequent strong connections constrain connectomic predictions of neuronal function. Cell (2025), S0092-8674(25)00518-5; preprint bioRxiv 2025.03.06.641774
- **Key result:** Visual responses of 43 fly cell types compared quantitatively with connectome-based predictions: predictions are accurate for some properties (orientation tuning) but surprisingly poor for others (receptive-field size); strong synaptic inputs are more functionally homogeneous than chance and dominate postsynaptic responses.
- **Relevance:** The most direct empirical audit of "what connectome models can and cannot predict"; justifies weighting schemes that emphasise rare strong edges.
- **Limitations:** Visual system only; calcium imaging as ground truth; single-property metrics.
- **Design implication for Physics-to-Life:** Calibrate count→weight mappings so that strong connections are not diluted; report per-property prediction accuracy rather than aggregate correlation.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### flygm — (authors not confirmed; Tsinghua University group) (2026). Whole-Brain Connectomic Graph Model Enables Whole-Body Locomotion Control in Fruit Fly. arXiv 2602.17997 (v1 2026-02-20, v2 2026-03-08); a NeurIPS 2025 listing "Whole-Brain Connectomic Graph Neural Networks Enable Whole-Body Locomotion Control in Drosophila" appears to be the same work
- **Key result:** The whole-brain connectome is instantiated as a graph-structured neural controller (message passing over the connectome) trained by deep RL to drive a simulated biomechanical fly (walking, turning, flying); reports stable performance and better sample efficiency than graph and non-graph baselines, and emergent sensory/central/motor functional segregation. Its motivation states that BPTT-trained connectome models (flyvis-style) do not scale to whole brain.
- **Relevance:** Closest published work to "connectome scaffold + embodied body model"; directly overlaps the programme's embodiment goal.
- **Limitations:** RL objective, not biological fidelity — the trained "neurons" are not constrained to match physiology; no biophysics, no uncertainty representation, no damage/aging/repair; authorship and venue not verifiable here.
- **Design implication for Physics-to-Life:** Differentiate explicitly: the programme's controllers must be scored against neural recordings and perturbation phenotypes, not only task reward; consider FlyGM as an ablation baseline (scaffold without physics).
- **Novelty threat:** direct — a whole-brain connectome graph controlling a whole-body fly simulator is already published, so novelty must rest on biophysical embedding, uncertainty, and repair/aging objectives.
- **Verified:** citation-only (unconfirmed).

---

## Thread 3 — Body, biomechanics and whole-brain imaging in behaving flies

### neuromechfly-v1 — Lobato-Rios V, Ramalingasetty ST, Özdil PG, Arreguit J, Ijspeert AJ, Ramdya P (2022). NeuroMechFly, a neuromechanical model of adult Drosophila melanogaster. Nature Methods 19(5):620–627. DOI 10.1038/s41592-022-01466-7
- **Key result:** Open-source, morphologically realistic (micro-CT-derived) exoskeleton with joints, muscle models and neural controllers in a PyBullet physics environment; replaying 3D-tracked walking/grooming predicts unmeasured joint torques and ground-reaction forces; optimisation discovers neural/muscle parameters for fast, stable gaits.
- **Relevance:** Provides the body-physics layer for closing the loop with the VNC scaffold; establishes the "predict unmeasured mechanical quantities" evaluation style.
- **Limitations:** Muscles are phenomenological; no sensory organs in v1; no soft tissue/haemolymph; controllers are CPG-like, not connectomic.
- **Design implication for Physics-to-Life:** Define body-level hidden targets (torques, contact forces, gait phase relations) as physical validation quantities independent of neural data.
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/NeLy-EPFL/NeuroMechFly — README cites Lobato-Rios et al. 2022 Nature Methods 19(5):620–627, DOI 10.1038/s41592-022-01466-7).

### neuromechfly-v2 — Wang-Chen S, Stimpfling VA, Lam TKC, Özdil PG, Genoud L, Hurtak F, Ramdya P (2024). NeuroMechFly v2: simulating embodied sensorimotor control in adult Drosophila. Nature Methods (published 2024-11-12). DOI 10.1038/s41592-024-02497-y
- **Key result:** Adds compound-eye vision (hexagonal ommatidial lattice), olfaction, leg adhesion, ascending motor feedback and complex terrain in MuJoCo (FlyGym); demonstrates path integration and head stabilisation from ascending feedback, RL-trained multimodal navigation, odour-plume tracking and fly-following using a *connectome-constrained visual network* (flyvis).
- **Relevance:** Already couples a connectome-constrained neural module to a body — a working prototype of the programme's multiscale embedding at the periphery.
- **Limitations:** Brain-level control is hand-designed or RL-trained, not connectomic; no whole-CNS scaffold; no biophysical neurons; no aging/damage states.
- **Design implication for Physics-to-Life:** Reuse FlyGym as the embodiment layer; add damage/aging as parametrised perturbations to body and sensor models so that "virtual damaged/aged fly states" are physically explicit.
- **Novelty threat:** partial — embodied sensorimotor simulation with connectome-constrained vision exists; whole-CNS biophysical embedding does not.
- **Verified:** yes (https://github.com/NeLy-EPFL/flygym — README cites the NeuroMechFly v2 paper, DOI 10.1038/s41592-024-02497-y, and lists vision/olfaction/adhesion/MuJoCo features).

### flybody — Vaxenburg R, Siwanowicz I, Merel J, Robie AA, Morrow C, Novati G, Stefanidi Z, Both G-J, Card GM, Reiser MB, Botvinick MM, Branson KM, Tassa Y, Turaga SC (2025). Whole-body physics simulation of fruit fly locomotion. Nature 643:1312–1320. DOI 10.1038/s41586-025-09029-4
- **Key result:** Anatomically detailed whole-body MuJoCo fly (high-resolution imaging-derived) with a phenomenological wing aerodynamics model and adhesion actuators; deep-RL controllers imitate real walking and flight trajectories (walking imitation uses a 59-D action space); open model and datasets.
- **Relevance:** Second, independently built body model (DeepMind/Janelia) — a cross-check for body-physics uncertainty and the substrate FlyGM used.
- **Limitations:** RL imitation, not neural control; aerodynamics phenomenological; no muscles or proprioceptors at biophysical detail.
- **Design implication for Physics-to-Life:** Use two body models (flybody, FlyGym) to bound "body-model uncertainty" the way two connectomes bound scaffold uncertainty.
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/TuragaLab/flybody — README cites Vaxenburg et al. 2025 Nature 643:1312–1320, DOI 10.1038/s41586-025-09029-4, full author list).

### whole-brain-imaging — Aimon S, Katsuki T, Jia T, Grosenick L, Broxton M, Deisseroth K, Sejnowski TJ, Greenspan RJ (2019). Fast near-whole-brain imaging in adult Drosophila during responses to stimuli and behavior. PLoS Biology 17(2):e2006732. DOI 10.1371/journal.pbio.2006732
- **Key result:** Light-field microscopy records near-whole-brain calcium and voltage activity at high speed in behaving flies; walking produces a global increase in activity relative to rest, grooming only a small local increase. Follow-ups: Aimon et al. 2023 eLife 12:e85202 (global brain-state change during spontaneous vs forced walk decomposed by neuron class); Schaffer et al. 2023 Nature Communications (DOI 10.1038/s41467-023-41261-2; SCAPE imaging, most neurons correlated with running/flailing over seconds-to-minute timescales, high-dimensional residual activity in small spatially organised clusters); Brezovec et al. 2024 Current Biology 34(4):710–726 (volumetric two-photon maps of forward/angular-velocity signals across the brain); a 2026 Nature Communications light-beads-microscopy study (first author Gauthey, per search record; 28 vol/s whole brain, 60 vol/s central brain) reports fast auditory responses missed by conventional volumetric imaging.
- **Relevance:** These are the whole-brain activity datasets against which any scaffold-embedded model must be scored, and the empirical basis for "behavioural state" as a global latent.
- **Limitations:** Calcium/voltage indicators at cellular-to-regional (not single-neuron across the whole brain) resolution; head-fixed preparations; registration to the connectome is approximate (no per-neuron identity).
- **Design implication for Physics-to-Life:** Build the activity-evaluation pipeline around region/cell-class-level summaries registered to a common template, with explicit registration uncertainty; single-neuron identity should be reserved for genetically targeted subsets.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for Aimon 2019, Schaffer 2023, Brezovec 2024 and the 2026 study; Aimon et al. 2023 eLife 12:e85202 is verified: yes (https://github.com/sophie63/FlyLFM — README cites it).

### behaviour-atlas — Berman GJ, Choi DM, Bialek W, Shaevitz JW (2014). Mapping the stereotyped behaviour of freely moving fruit flies. Journal of the Royal Society Interface 11(99):20140672. DOI 10.1098/rsif.2014.0672
- **Key result:** Unsupervised embedding of postural dynamics reveals >100 distinguishable stereotyped behavioural states; flies spend ~50% of time in stereotyped actions.
- **Relevance:** Defines a low-dimensional behavioural state space that perturbation screens (Cande 2018) and body simulators can share as a common output metric.
- **Limitations:** Single-fly, tethered-free arena; embedding is dataset-specific; state boundaries are not mechanistic.
- **Design implication for Physics-to-Life:** Use a fixed, versioned behavioural embedding as the phenotype space for repair-policy search (a "repair" should move an aged/damaged fly's occupancy distribution toward the young/intact one).
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/gordonberman/MotionMapper — README cites Berman et al. 2014 J R Soc Interface 11(99):20140672).

---

## Thread 4 — Electrophysiology, biophysical neuron models, ion channels, transcriptomic atlases

### pn-passive — Gouwens NW & Wilson RI (2009). Signal propagation in Drosophila central neurons. Journal of Neuroscience 29(19):6239–6249. (ModelDB accession 118662) (conductance-based companion: Günay C, Sieling F, Dharmar L, Lin W-H, Wolfram V, Marley R, Baines RA, Prinz AA (2015) Distal spike initiation zone location estimation by morphological simulation of ionic current filtering demonstrated in a novel model of an identified Drosophila motoneuron. PLoS Computational Biology, DOI 10.1371/journal.pcbi.1004189; ModelDB accession 152028)
- **Key result:** Passive membrane properties of antennal-lobe projection neurons deduced from morphology and whole-cell recordings; compartmental model shows PNs are electrotonically extensive (somatic electrode controls voltage imperfectly), spikes initiate in the proximal axon, the true resting potential is more hyperpolarised than measured (seal and leak-Na conductances), and unitary inputs likely involve multiple release sites across dendrites. Günay 2015 is the reference *conductance-based* fly neuron: a multicompartmental Hodgkin–Huxley model of the larval aCC/MN1-Ib motoneuron with Na⁺, slow K⁺ and fast K⁺ currents fitted to recordings, using morphology-dependent current filtering to locate a distal spike-initiation zone and to quantify somatic-recording artefacts.
- **Relevance:** One of very few quantified compartmental parameter sets for an adult central fly neuron — the seed for embedding cable physics into connectome morphologies. Together they are essentially the entire quantified biophysical parameter base for identified fly central neurons — one adult passive model and one larval active model.
- **Limitations:** One cell type; passive only (no active conductances); parameters have wide posterior uncertainty; recordings are somatic and unipolar morphology makes somatic data weakly informative about neurites. The aCC model is larval, single-neuron, with channel kinetics from limited data.
- **Design implication for Physics-to-Life:** Treat per-type Rm/Cm/Ra and spike-initiation location as latent variables with priors from this study, and prioritise dendritic/axonal recordings in the active-learning loop. Expect conductance-based models for only a handful of the ~8,000 adult types, so channel parameters must be shared hierarchically (type → class → lineage) with transcriptome-informed priors.
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/ModelDBRepository/118662 — README cites Gouwens & Wilson 2009 J Neurosci 29(19):6239–6249; https://github.com/ModelDBRepository/152028 — README lists the Günay/Prinz author group and the aCC model but predates publication, so the PLoS Comput Biol 2015 citation is from search records only).

### channel-genetics — Papazian DM, Schwarz TL, Tempel BL, Jan YN, Jan LY (1987). Cloning of genomic and complementary DNA from Shaker, a putative potassium channel gene from Drosophila. Science 237(4816):749–753. (companion: Loughney K, Kreber R, Ganetzky B (1989) Molecular analysis of the para locus, a sodium channel gene in Drosophila. Cell 58:1143–1154)
- **Key result:** Cloning of *Shaker* (A-type K⁺ channel) and *para* (voltage-gated Na⁺ channel) — the founding molecular identifications of fly ion channels from behavioural/electrophysiological mutants.
- **Relevance:** Defines the channel gene families whose per-cell-type expression must be read from transcriptomes; classic "prediction from mutant phenotype to molecule" examples for the historical-prospective benchmark (pre-1987 cutoff).
- **Limitations:** Gene identity ≠ channel density or subcellular distribution; splice-variant and auxiliary-subunit diversity (Shaker has multiple products) complicates transcript→conductance mapping.
- **Design implication for Physics-to-Life:** Encode channel families as latent conductance classes with transcript-informed priors rather than one-to-one gene→conductance maps.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### tapin-seq — Davis FP*, Nern A*, Picard S, Reiser MB, Rubin GM, Eddy SR, Henry GL (2020). A genetic, genomic, and computational resource for exploring neural circuit function. eLife 9:e50901 (preprint bioRxiv 2018, DOI 10.1101/385476)
- **Key result:** TAPIN-seq transcriptomes for 100 driver lines covering 67 visual-system cell types with a probabilistic expression model; combined with connectomes to infer neurotransmitters and receptors expressed by identified neurons.
- **Relevance:** The best available bridge from connectome cell types to channel/receptor repertoires — exactly the "receptor identity" gap in Thread 1.
- **Limitations:** Visual system only; bulk (driver-line) resolution; transcript ≠ protein ≠ conductance; GAL4 lines are not perfectly type-specific.
- **Design implication for Physics-to-Life:** Use TAPIN-seq (+ Fly Cell Atlas) to set per-type priors on receptor/channel presence, with explicit transcript-to-function uncertainty.
- **Novelty threat:** none.
- **Verified:** yes for the preprint (https://github.com/fredpdavis/opticlobe — README cites Davis, Nern et al., bioRxiv 2018, doi.org/10.1101/385476); eLife 2020 metadata from search records only.

### fly-cell-atlas — Li H, Janssens J, De Waegeneer M, et al. (2022). Fly Cell Atlas: A single-nucleus transcriptomic atlas of the adult fruit fly. Science 375(6584):eabk2432. DOI 10.1126/science.abk2432 (preprint bioRxiv 2021.07.04.451050). Related: Davie K, Janssens J, Koldere D, et al. (2018). A Single-Cell Transcriptome Atlas of the Aging Drosophila Brain. Cell 174(4):982–998.e20 (URL https://www.cell.com/cell/fulltext/S0092-8674(18)30720-7; DOI not seen)
- **Key result:** 580,000 nuclei from 15 dissected sexed tissues plus whole head and body, >250 annotated cell types, sexual dimorphism and rare types, with open portals. Davie 2018: single-cell atlas of the whole adult brain across lifespan, 87 initial clusters refined by subclustering, SCENIC regulatory networks, and an exponential decline of RNA content with age without loss of neuronal identity.
- **Relevance:** Whole-organism molecular parts list (channels, receptors, peptides, metabolic state) for every scaffold cell type; Davie 2018 additionally gives the molecular trajectory of brain aging.
- **Limitations:** Nuclear RNA; neuron types under-resolved relative to 8,453 connectome types; no spatial registration to EM; age series in Davie is coarse.
- **Design implication for Physics-to-Life:** Establish a probabilistic transcriptome↔connectome type matching with confidence scores as a first-class scaffold layer; use the age-dependent transcript decline as an aging-state parameter.
- **Novelty threat:** none.
- **Verified:** yes for the FCA preprint (https://github.com/flycellatlas/data_processing — README cites bioRxiv 2021.07.04.451050); Science 2022 metadata and Davie 2018: citation-only (unconfirmed).

---

## Thread 5 — Aging

### fly-aging-review — Piper MDW & Partridge L (2018). Drosophila as a model for ageing. Biochimica et Biophysica Acta – Molecular Basis of Disease 1864(9):2707–2717. DOI 10.1016/j.bbadis.2017.09.016
- **Key result:** Review establishing the fly's role in demonstrating evolutionary conservation of reduced insulin/IGF-1 signalling in healthy aging, and that precise nutritional and genetic interventions extend lifespan without obvious detrimental side effects. (Locomotor-senescence methodology reference: Gargano JW, Martin I, Bhandari P, Grotewiel MS (2005) RING assay, Experimental Gerontology 40(5):386–395, DOI 10.1016/j.exger.2005.02.005 — negative geotaxis declines with age, is genotype-sensitive, and senescence is delayed in *Indy* and *chico* mutants.)
- **Relevance:** Defines the canonical intervention set (DR, IIS, TOR) and the healthspan readouts (climbing, sleep, fecundity, gut integrity) that a "virtual aged fly" must reproduce and that repair policies must move.
- **Limitations:** Review-level; lifespan effects are genotype- and diet-context dependent; few mechanistic links to neural circuits.
- **Design implication for Physics-to-Life:** Represent aging as a multi-organ state vector (neural, gut, fat body, muscle) with interventions as known displacement vectors; use RING/climbing and sleep fragmentation as behavioural validation targets.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### aging-fly-cell-atlas — Lu T-C, Brbić M, Park Y-J, … Li H (2023). Aging Fly Cell Atlas identifies exhaustive aging features at cellular resolution. Science 380:eadg0934. DOI 10.1126/science.adg0934 (preprint bioRxiv 2022.12.06.519355)
- **Key result:** 868,000 single-nucleus transcriptomes of head and body at 5, 30, 50 and 70 days; 163 cell types; cell-type-specific aging clocks predict age, with ribosomal gene expression a conserved predictor; four aging features combined to rank aging rates across cell types; down-regulated translation, up-regulated lipid metabolism, adipose metabolic remodelling and altered neuronal signal transduction.
- **Relevance:** The molecular definition of "aged state" per cell type and a ready-made *aging clock* to score virtual aged/repaired states.
- **Limitations:** Four time points; transcriptome only (no physiology/connectivity with age); clocks trained on this dataset risk circularity if reused as the repair objective.
- **Design implication for Physics-to-Life:** Use AFCA clocks as an *external* scorer of virtual aged states, with strict train/test separation from any data used to fit the world model's aging dynamics.
- **Novelty threat:** none.
- **Verified:** yes for the preprint (https://github.com/hongjie-lab/AFCA — README cites Lu et al., bioRxiv DOI 10.1101/2022.12.06.519355 and GEO GSE218661); Science 2023 metadata from search records only.

### rapamycin — Bjedov I, Toivonen JM, Kerr F, Slack C, Jacobson J, Foley A, Partridge L (2010). Mechanisms of life span extension by rapamycin in the fruit fly Drosophila melanogaster. Cell Metabolism 11(1):35–46. DOI 10.1016/j.cmet.2009.11.010
- **Key result:** Rapamycin fed to adults extends lifespan comparably to TOR mutants, increases starvation and paraquat resistance, acts via TORC1 through autophagy and translation (S6K), and further extends lifespan of weak IIS mutants and of DR-maximised flies.
- **Relevance:** A pharmacological "repair/maintenance policy" with a mechanistic pathway that a molecular-level layer must encode; a candidate retrodiction target (predict rapamycin lifespan extension from pre-2010 TOR genetics).
- **Limitations:** Lifespan, not neural function; dose/diet interactions; sex differences.
- **Design implication for Physics-to-Life:** Include a nutrient-signalling (IIS/TOR) module as the minimal molecular physics for aging interventions; score policies on both lifespan and healthspan proxies.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### chico-inr — Clancy et al. (2001). Extension of life-span by loss of CHICO, a Drosophila insulin receptor substrate protein. Science 292(5514):104–106. DOI 10.1126/science.1057991 (companion: Tatar M, Kopelman A, Epstein D, Tu MP, Yin CM, Garofalo RS (2001) A mutant Drosophila insulin receptor homolog that extends life-span and impairs neuroendocrine function. Science 292(5514):107–110, DOI 10.1126/science.1057987; cautionary companion: Rogina, Reenan, Nilsen & Helfand (2000) Extended life-span conferred by cotransporter gene mutations in Drosophila. Science 290:2137–2140, DOI 10.1126/science.290.5499.2137)
- **Key result:** *chico* mutation extends median lifespan up to 48% (homozygotes) and 36% (heterozygotes), independent of impaired oogenesis or dwarfism; *InR* heteroallelic dwarf females live up to 85% longer and a juvenile-hormone analogue restores wild-type life expectancy, implicating neuroendocrine control. Contrast *Indy* (Rogina 2000): five P-element insertions in a Na⁺-dicarboxylate cotransporter homologue (fat body, midgut, oenocytes) nearly doubled average lifespan, but a later PLoS Genetics study ("No Influence of Indy on Lifespan in Drosophila after Correction for Genetic and Cytoplasmic Background Effects", https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.0030095) found no effect after background correction.
- **Relevance:** The canonical conserved-pathway aging result — a clean historical-prospective target (cutoff 2000: given *C. elegans* IIS longevity genetics, predict the fly orthologue result) and a genotype-level "aged vs young" contrast.
- **Limitations:** Genetic-background sensitivity (cf. the *Indy* story below); whole-organism lifespan without circuit-level phenotypes. The *Indy* history shows lifespan phenotypes can be background artefacts.
- **Design implication for Physics-to-Life:** Encode IIS state as a global modulator of the aging state vector; use JH/IIS neuroendocrine coupling as an explicit brain–body link in the multiscale model. Require ≥2 independent replications with background controls before any intervention is admitted as repair-policy ground truth.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for all three.

### sleep-aging — Koh K, Evans JM, Hendricks JC, Sehgal A (2006). A Drosophila model for age-associated changes in sleep:wake cycles. PNAS 103:13843–13847. DOI 10.1073/pnas.0605903103
- **Key result:** Sleep:wake cycle strength decreases and sleep becomes more fragmented with age; changes scale with temperature-manipulated lifespan (physiological, not chronological, age) and are phenocopied by paraquat-induced oxidative stress.
- **Relevance:** A quantitative neural-aging phenotype (fragmentation index vs age) that a circuit-level aged-state model must reproduce and a repair policy must reverse.
- **Limitations:** Behavioural readout only; sleep circuits (e.g., dorsal fan-shaped body, clock neurons) not mapped in this paper.
- **Design implication for Physics-to-Life:** Include sleep fragmentation alongside RING climbing as the two primary neural-aging endpoints; couple oxidative-stress state to synaptic/neuronal parameters.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### gut-aging — Biteau B, Hochmuth CE, Jasper H (2008). JNK activity in somatic stem cells causes loss of tissue homeostasis in the aging Drosophila gut. Cell Stem Cell 3(4):442–455. URL https://www.sciencedirect.com/science/article/pii/S1934590908003925 (DOI not seen)
- **Key result:** Cytoprotective JNK signalling drives intestinal stem cell proliferation after stress and, in old guts, promotes accumulation of mis-differentiated ISC daughters (dysplasia) — a mechanistic link between stress signalling and age-related loss of tissue homeostasis. Builds on the discovery of adult midgut ISCs (Micchelli CA & Perrimon N (2006) Nature 439:475–479; Ohlstein B & Spradling A (2006) Nature 439, same issue — DOIs not seen).
- **Relevance:** The best-characterised *adult* regenerative tissue in the fly and the clearest example of regeneration turning maladaptive with age — a model system for "repair policy" search (restore homeostasis without dysplasia).
- **Limitations:** Non-neural; single signalling axis; interacts with microbiota and diet.
- **Design implication for Physics-to-Life:** Represent gut aging as a stochastic stem-cell lineage model with age-dependent JNK bias; repair objectives must penalise dysplastic over-proliferation, not just restore proliferation rate.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for all three.

---

## Thread 6 — Development, regeneration and hidden-target transformations

### disc-regeneration-review — Hariharan IK & Serras F (2017). Imaginal disc regeneration takes flight. Current Opinion in Cell Biology 48:10–16. DOI 10.1016/j.ceb.2017.03.005 (background review: Worley MI, Setiawan L, Hariharan IK (2012) Regeneration and transdetermination in Drosophila imaginal discs. Annual Review of Genetics 46:289–310, DOI 10.1146/annurev-genet-110711-155637)
- **Key result:** Imaginal discs regenerate after damage; genetic ablation systems now damage precisely defined regions without surgery; during regeneration discs can transdetermine into structures appropriate to a different disc; Worley 2012 covers the classical transplantation/fragmentation literature, blastema formation, and the "weak point" logic of transdetermination.
- **Relevance:** Defines the regeneration/morphogenesis benchmark space: known transformations (wound → regenerated pattern; disc-type switches) that can be hidden as rediscovery targets.
- **Limitations:** Larval tissue, not adult; regeneration measured mostly by adult wing/leg phenotype; molecular maps incomplete.
- **Design implication for Physics-to-Life:** Choose wing-disc regeneration (ablation-driven) as the first morphogenesis benchmark with pattern-gene expression and adult size/pattern as scored outputs.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### disc-ablation-system — Smith-Bolton RK, Worley MI, Kanda H, Hariharan IK (2009). Regenerative growth in Drosophila imaginal discs is regulated by Wingless and Myc. Developmental Cell 16(6):797–809. URL https://www.cell.com/developmental-cell/fulltext/S1534-5807(09)00177-4 (DOI not seen)
- **Key result:** Non-surgical, spatially and temporally controlled apoptotic ablation in the wing disc (GAL4/GAL80ts-driven pro-apoptotic expression); damage induces localised regenerative proliferation, altered patterning-gene expression and temporary loss of fate-commitment markers; Wingless and Myc are induced and required, and ectopic Myc enhances regeneration when other growth drivers do not.
- **Relevance:** The canonical controlled-damage experiment — provides input (defined ablation) → output (regenerated pattern) pairs for the benchmark, and a specific hidden target (Wg/Myc necessity).
- **Limitations:** Ablation kinetics and residual GAL4 activity vary; readouts are endpoint-based.
- **Design implication for Physics-to-Life:** Use the ablation paradigm as the standard "damage operator" in the virtual disc and score both regenerated geometry and gene-expression trajectories.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### drms-enhancer — Harris RE, Setiawan L, Saul J, Hariharan IK (2016). Localized epigenetic silencing of a damage-activated WNT enhancer limits regeneration in mature Drosophila imaginal discs. eLife 5:e11588. DOI 10.7554/eLife.11588 (follow-up: Harris RE, Stinchfield MJ, Nystrom SL, McKay DJ, Hariharan IK (2020) Damage-responsive, maturity-silenced enhancers regulate multiple genes that direct regeneration in Drosophila. eLife 9:e58305, DOI 10.7554/eLife.58305)
- **Key result:** Discs regenerate efficiently early in L3 but progressively lose the ability; damage-responsive *wg*/*Wnt6* expression requires a bipartite enhancer whose damage-responsive module stays active throughout L3 while an adjacent silencing element nucleates increasing Polycomb-type epigenetic silencing — a molecular mechanism for age-dependent loss of regenerative competence. Harris 2020 generalises this: additional damage-responsive, maturity-silenced (DRMS) enhancers are found genome-wide (including near *Mmp1*), and two DRMS-associated genes act in opposite directions — *apontic* curtails and *CG9752/asperous* promotes regeneration.
- **Relevance:** The clearest fly example of "regenerative competence lost with maturity" and a natural hidden target: predict that maturity-dependent enhancer silencing (not loss of damage signalling) explains the decline. The 2020 set of loci and effect directions gives a *family* of hidden targets for a rediscovery benchmark with a 2016–2019 cutoff.
- **Limitations:** One enhancer/locus; larval maturation ≠ adult aging. The 2020 enhancer calls derive from chromatin accessibility with phenotypes for a subset of genes.
- **Design implication for Physics-to-Life:** Model regenerative competence as a maturity-gated enhancer-accessibility variable; repair policies may target de-silencing (a testable "state restoration" lever). Use the 2016→2020 progression as a two-stage historical benchmark (mechanism at one locus → genome-wide generalisation).
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### antennapedia-homeosis — Schneuwly, Klemenz & Gehring (1987). Redesigning the body plan of Drosophila by ectopic expression of the homoeotic gene Antennapedia. Nature 325:816–818. URL https://www.nature.com/articles/325816a0
- **Key result:** Heat-shock-driven expression of Antennapedia cDNA at defined larval stages transforms antennae into second legs and dorsal head into second-thoracic (scutum) structures — ectopic expression of one selector gene redesigns the body plan.
- **Relevance:** A canonical "known transformation" for the morphogenesis benchmark (input: gene × time window; output: organ identity switch) and a historical target with a pre-1987 cutoff.
- **Limitations:** Heat-shock timing coarse; only certain windows transform; not a regeneration per se.
- **Design implication for Physics-to-Life:** Represent organ identity as a selector-gene state in the morphogenesis layer so that homeotic switches are expressible outputs; hide the antenna→leg mapping as a rediscovery target.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### eyeless-ectopic-eyes — Halder G, Callaerts P, Gehring WJ (1995). Induction of ectopic eyes by targeted expression of the eyeless gene in Drosophila. Science 267:1788–1792. DOI 10.1126/science.7892602
- **Key result:** Targeted (GAL4/UAS) expression of *eyeless* (Pax-6 homologue) in imaginal disc primordia induces ectopic compound-eye structures on wings, legs and antennae, establishing *eyeless* as a master control gene for eye morphogenesis.
- **Relevance:** Second canonical hidden-target transformation; a cross-species retrodiction test (given mouse *Small eye*/human *Aniridia* homology, predict sufficiency in the fly).
- **Limitations:** Ectopic eyes are incomplete; sufficiency depends on competence of the target tissue.
- **Design implication for Physics-to-Life:** Include tissue competence as a state variable so that "sufficiency" predictions are conditional; use the 1994–1995 cutoff as a benchmark case.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### adult-brain-injury — Fernández-Hernández I, Rhiner C, Moreno E (2013). Adult Neurogenesis in Drosophila. Cell Reports 3(6):1857–1865. DOI 10.1016/j.celrep.2013.05.034
- **Key result:** Improved lineage labelling shows adult neurogenesis in the medulla cortex of the optic lobes, and acute stab injury stimulates it (reactivation of quiescent Deadpan⁺ progenitors). Search records indicate later work on glial reactivity, glial lineage conversion and insulin-dependent neuron–glia signalling in the injured adult CNS (2021–2026; not verified here).
- **Relevance:** The adult fly *brain* injury paradigm — the substrate for "virtual damaged fly states" and for repair-policy targets (progenitor reactivation) within the connectome-scaffolded organism.
- **Limitations:** Small numbers of new neurons; integration into circuits unproven; optic lobe only; no adult appendage (leg/wing) regeneration exists in *Drosophila*, so adult regenerative benchmarks are limited to gut, brain injury and wound healing.
- **Design implication for Physics-to-Life:** Define damage operators on the scaffold (neuron removal, glial state change) and score repair policies on restored function, not neuron count.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

---

## Thread 7 — Genetic perturbation resources and neuron–behaviour ground truth

### flybase — Öztürk-Çolak A, Marygold SJ, Antonazzo G, Attrill H, Goutte-Gattat D, Jenkins VK, Matthews BB, Millburn G, dos Santos G, Tabone CJ, FlyBase Consortium (2024). FlyBase: updates to the Drosophila genes and genomes database. Genetics 227(1):iyad211. URL https://academic.oup.com/genetics/article/227/1/iyad211/7596147 (related resource: Perkins LA et al. (2015) The Transgenic RNAi Project at Harvard Medical School: Resources and Validation. Genetics 201(3):843–852, DOI 10.1534/genetics.115.180208 — 11,491 TRiP lines covering 71% of genes, with RSVP validation data)
- **Key result:** FlyBase integrates genes, alleles, phenotypes, expression (now including single-cell data), orthology and stocks; TRiP provides genome-scale, validated RNAi lines distributed via stock centres.
- **Relevance:** The phenotype knowledge base and perturbation-reagent catalogue for ground truth; also the largest *leakage hazard* for a historical benchmark because curated phenotype annotations encode later discoveries.
- **Limitations:** Phenotype annotations are free-text/ontology summaries with heterogeneous evidence; curation dates ≠ discovery dates.
- **Design implication for Physics-to-Life:** Snapshot FlyBase by release date and strip post-cutoff annotations before conditioning a model; log the release ID as part of the benchmark manifest.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### split-gal4-resource — FlyLight Project Team et al. (first author reported as Meissner GW in the brief; author list not confirmed in this scan) (2025). A split-GAL4 driver line resource for Drosophila neuron types. eLife (published 2025-01-24), article 98405. URL https://elifesciences.org/articles/98405 (foundational method: Brand AH & Perrimon N (1993) Targeted gene expression as a means of altering cell fates and generating dominant phenotypes. Development 118(2):401–415)
- **Key result:** 3,060 split-GAL4 lines targeting adult CNS cell types and 1,373 characterised in larvae, selected from >77,000 split combinations examined (2013–2023), enabling targeted functional, transcriptomic and proteomic studies; GAL4/UAS (Brand & Perrimon) is the underlying binary expression system.
- **Relevance:** The reagent layer that maps connectome cell types to controllable populations — the practical route to closed-loop perturbation ground truth for V5.
- **Limitations:** Coverage of ~3,000 lines vs 8,453 brain types; off-target expression; line-to-type matching is imaging-based.
- **Design implication for Physics-to-Life:** Prioritise V5 circuits whose neurons have clean split-GAL4 coverage and published activation/silencing phenotypes.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### behaviour-activation-atlas — Robie AA, Hirokawa J, Edwards AW, Umayam LA, Lee A, Phillips ML, Card GM, Korff W, Rubin GM, Simpson JH, Reiser MB, Branson K (2017). Mapping the Neural Substrates of Behavior. Cell 170(2):393–406.e28. URL https://www.cell.com/cell/fulltext/S0092-8674(17)30716-X (larval analogue: Vogelstein JT et al. (2014) Discovery of brainwide neural-behavioral maps via multiscale unsupervised structure learning. Science, DOI 10.1126/science.1250298 — 1,054 lines, 37,780 larvae, 29 behavioural phenotypes)
- **Key result:** Thermogenetic activation of 2,204 GAL4 populations, ~400,000 flies, with machine-vision behaviour classifiers, yielding anatomy–behaviour maps (BABAM browser: 2,205 lines). Vogelstein 2014 provides the equivalent optogenetic atlas for the larva.
- **Relevance:** The largest neuron-population → behaviour perturbation datasets; with connectome cell-type matching these become in-silico activation benchmarks (predict behavioural phenotype from scaffold + activation).
- **Limitations:** Broad GAL4 lines (many neuron types per line); thermogenetic activation is slow and non-physiological; phenotypes are population-level statistics.
- **Design implication for Physics-to-Life:** Construct "activation → behaviour" test cases only where line expression has been registered to connectome types; treat line broadness as label noise.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for the papers; dataset scale corroborated on https://github.com/kristinbranson/BABAM (2,205 GAL4 lines, thermogenetic activation), which does not print the citation.

### descending-control — Braun J, Hurtak F, Wang-Chen S, Ramdya P (2024). Descending networks transform command signals into population motor control. Nature 630:686– (issue of 2024-06-20). DOI 10.1038/s41586-024-07523-9 (preprint bioRxiv 2023.09.11.557103). Companion screen: Cande et al. (2018) Optogenetic dissection of descending behavioral control in Drosophila. eLife (2018) e34275, DOI 10.7554/eLife.34275
- **Key result:** Command-like descending neurons (DNs) recruit networks of additional DNs; connectome analysis plus experimental manipulation shows direct excitatory DN→DN connections explain the recruitment, supporting a model in which behaviours are composed from motor subroutines via increasingly large DN populations. Cande 2018 systematically activated individual DN lines in freely walking flies: most DNs drive stereotyped behaviours, several DNs converge on similar behaviours, and effects are state-dependent.
- **Relevance:** The best example of connectome-derived prediction (DN–DN recruitment) confirmed by perturbation — a top V5 candidate circuit spanning brain scaffold and body.
- **Limitations:** Subset of DNs; behaviour in tethered/ball or arena contexts; VNC side still at MANC-level resolution (male).
- **Design implication for Physics-to-Life:** Use DN recruitment (identity and order of recruited DNs) as a hidden target derivable from the scaffold and testable with existing lines.
- **Novelty threat:** none.
- **Verified:** yes for the preprint (https://github.com/NeLy-EPFL/dn_networks — README cites Braun, Hurtak, Wang-Chen & Ramdya 2023 bioRxiv 10.1101/2023.09.11.557103); Nature 2024 metadata and Cande 2018: citation-only (unconfirmed).

---

## Thread 8 — Historical prospective validation, time-split evaluation and leakage

### mat2vec-retrodiction — Tshitoyan V, Dagdelen J, Weston L, Dunn A, Rong Z, Kononova O, Persson KA, Ceder G, Jain A (2019). Unsupervised word embeddings capture latent knowledge from materials science literature. Nature 571:95–98. DOI 10.1038/s41586-019-1335-8
- **Key result:** Word2vec embeddings trained on ~3 million materials-science abstracts encode periodic-table structure and structure–property relations; in a retrospective test with year cutoffs, materials recommended as thermoelectrics were reported as such several years before their discovery, at rates far above baseline.
- **Relevance:** The canonical "condition on literature before year Y, predict discoveries after Y" design; the template for the programme's historical prospective benchmark.
- **Limitations:** Ranking, not mechanism; literature-only signal; abstracts corpus dated by publication year (preprints/patents ignored); baseline choice drives significance.
- **Design implication for Physics-to-Life:** Reproduce the year-by-year cutoff sweep and report discovery-lag curves against random and citation-count baselines; extend from ranking to mechanistic, quantitative predictions.
- **Novelty threat:** partial — the retrodiction paradigm exists; not applied to organism-scale physical models or to biology with data-release cutoffs.
- **Verified:** yes (https://github.com/materialsintelligence/mat2vec — README cites Tshitoyan et al. 2019 Nature 571:95–98, DOI 10.1038/s41586-019-1335-8).

### brainbench — Luo X, et al. (2025). Large language models surpass human experts in predicting neuroscience results. Nature Human Behaviour 9:305–315. DOI 10.1038/s41562-024-02046-9 (arXiv 2403.03230)
- **Key result:** BrainBench — 200 test cases built by altering abstracts of recent neuroscience papers so the model must choose the version with the actual result — shows general LLMs outperform 171 human experts (1,011 trials) in every subfield; BrainGPT (LoRA-tuned on neuroscience literature) does better; confidence is calibrated.
- **Relevance:** Establishes "forward-looking" result prediction as an evaluable task and the human-expert baseline protocol.
- **Limitations:** Two-alternative forced choice on textual abstracts, not quantitative or mechanistic prediction; test cases are post-cutoff *publications*, which does not exclude preprint/data leakage; abstract-editing may leave stylistic cues.
- **Design implication for Physics-to-Life:** Keep the expert-baseline protocol but replace abstract-choice with quantitative predictions scored against data; audit memorisation explicitly.
- **Novelty threat:** partial — prospective prediction of neuroscience results exists as an LLM benchmark; organism-scale physical models with data-level cutoffs do not.
- **Verified:** yes (https://github.com/braingpt-lovelab/BrainBench — README cites Luo et al., Nature Human Behaviour, DOI 10.1038/s41562-024-02046-9).

### time-split-cv — Sheridan RP (2013). Time-Split Cross-Validation as a Method for Estimating the Goodness of Prospective Prediction. Journal of Chemical Information and Modeling 53(4):783–790. DOI 10.1021/ci400084k
- **Key result:** For QSAR, holding out compounds by *time* (train on earlier, test on later) estimates true prospective performance far better than random or scaffold splits, which are over-optimistic; time-split has since become the accepted standard in medicinal-chemistry ML.
- **Relevance:** The established statistical justification for temporal splits; provides the expected magnitude of random-vs-temporal optimism.
- **Limitations:** Chemistry-specific; assumes the time stamp is the only leakage channel.
- **Design implication for Physics-to-Life:** Report random-split vs time-split performance side by side; treat the gap as a leakage/novelty diagnostic.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### leakage-taxonomy — Kapoor S & Narayanan A (2023). Leakage and the reproducibility crisis in machine-learning-based science. Patterns 4(9):100804. DOI 10.1016/j.patter.2023.100804
- **Key result:** Survey of 17 fields finds leakage in 294 papers; eight leakage types (no train/test separation, preprocessing on full data, feature selection on full data, duplicates, illegitimate features, temporal leakage, non-independence, sampling bias); proposes "model info sheets" to prevent each; civil-war-prediction case study shows ML advantage disappears after leakage correction.
- **Relevance:** The reference taxonomy for the benchmark's leakage audit; temporal leakage and illegitimate features (e.g., later-stabilised terminology) are the relevant classes.
- **Limitations:** Generic; does not cover LLM pretraining contamination.
- **Design implication for Physics-to-Life:** Publish a model info sheet per benchmark release covering all eight types plus pretraining-corpus provenance.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed).

### dream-challenges — Saez-Rodriguez J, et al. (2016). Crowdsourcing biomedical research: leveraging communities as innovation engines. Nature Reviews Genetics (2016). URL https://www.nature.com/articles/nrg.2016.69 (exemplar: Marbach et al. (2012; first author per memory, not confirmed in this scan) Wisdom of crowds for robust gene network inference. Nature Methods (2012), URL https://www.nature.com/articles/nmeth.2016)
- **Key result:** DREAM challenges evaluate systems-biology predictions against *blinded, held-out gold standards* scored by an independent organiser, with community aggregation ("wisdom of crowds") often outperforming any single method (DREAM5 network inference).
- **Relevance:** The operational model for prospective validation in biology: sequestered ground truth, pre-registered scoring, independent adjudication.
- **Limitations:** Most challenges use held-out *contemporaneous* data, not historical cutoffs; retrodiction of literature-level discoveries is rare.
- **Design implication for Physics-to-Life:** Run the hidden-target and historical benchmarks in DREAM style (sequestered targets, external scorer), adding a knowledge-cutoff manifest.
- **Novelty threat:** none.
- **Verified:** citation-only (unconfirmed) for both.

### scipredict — (authors not confirmed; Scale AI) (2026). SciPredict: Can LLMs Predict the Outcomes of Scientific Experiments in Natural Sciences? arXiv 2604.10718 (repository: scaleapi/scipredict)
- **Key result:** 405 expert-curated prediction questions (physics, biology, chemistry) derived from empirical studies published after 2025-03-31 to sit beyond model cutoffs; frontier models reach accuracy comparable to domain experts on multiple-choice but degrade on free-form and numerical formats and are poorly calibrated relative to experts. Related 2026 preprints (not verified): a dynamic, temporally separated benchmark for biological knowledge discovery (arXiv 2603.03322) and ForeSci (arXiv 2606.00644).
- **Relevance:** Shows the current state of post-cutoff scientific outcome prediction and its failure modes (calibration, numerical prediction) — directly relevant to designing the historical benchmark's scoring.
- **Limitations:** Publication-date cutoff only (no data-release or preprint cutoff); short shelf-life as models update; authorship/venue not verifiable here.
- **Design implication for Physics-to-Life:** Score numerical/mechanistic predictions with calibration metrics, not accuracy alone; define cutoffs at the level of data release.
- **Novelty threat:** partial — post-cutoff outcome prediction benchmarks exist for LLMs; none target organism-scale physical models or Drosophila circuits.
- **Verified:** yes (https://github.com/scaleapi/scipredict — README states 405 questions, post-2025-03-31 studies, three domains; the arXiv ID is from search records because the README's arXiv link is a placeholder).

### oracleproto — Ma Y, Ruan C, Huang K, Yang Z, Zhou L (2026). OracleProto: A Reproducible Framework for Benchmarking LLM Native Forecasting via Knowledge Cutoff and Temporal Masking. arXiv 2605.03762. (Related: "Simulated Ignorance Fails: A Systematic Study of LLM Behaviors on Forecasting", arXiv 2601.13717, authors not confirmed — reports that instructing a model to ignore post-cutoff knowledge does not reliably constrain it.)
- **Key result:** Combines each model's documented knowledge cutoff with *temporal masking* of event descriptions to reconstruct historical events as time-bounded forecasting tasks; reports a residual leakage rate of ~1% and discriminates six models on accuracy, stability and cost. "Simulated ignorance" work shows prompt-level cutoffs are insufficient.
- **Relevance:** Provides the two practical leakage-control mechanisms (cutoff selection + masking) and the negative result that motivates *corpus-level* rather than prompt-level cutoffs.
- **Limitations:** Event forecasting, not science; relies on vendor-declared cutoffs; ~1% leakage still material for small target sets.
- **Design implication for Physics-to-Life:** Do not rely on prompting; train or select models with verifiable pretraining cutoffs and mask post-cutoff nomenclature in all conditioning inputs.
- **Novelty threat:** none.
- **Verified:** yes (https://github.com/MaYiding/OracleProto — README cites Ma, Ruan, Huang, Yang & Zhou 2026, arXiv 2605.03762); "Simulated Ignorance Fails": citation-only (unconfirmed).

---

## Synthesis for this cluster

**(a) What the connectome does and does not give.** Four adult synapse-resolution graphs now exist (FlyWire brain, 139,255 neurons/~50 M synapses; hemibrain, ~25,000/~20 M; MANC cord, >23,000 neurons; BANC whole female CNS, ~188,000/~199 M predicted; male CNS, 166,691 neurons) plus the complete larval brain (3,016/548,000). They supply node identity, morphology, cell type (8,453 brain types), lineage and a *predicted* transmitter (87% per synapse, 94% per neuron). Missing: (1) synaptic conductances and short-term dynamics — counts are proxies and rare strong edges dominate (Currier & Clandinin); (2) postsynaptic receptor identity (excitatory vs inhibitory ACh/GABA/Glu receptor classes); (3) gap junctions; (4) neuromodulators, peptides and volume transmission; (5) glia and extracellular space; (6) per-type passive/active membrane parameters (only PN passive and larval aCC active models are quantified); (7) spike-initiation sites and non-spiking status; (8) synapse-capture completeness (MANC ~42%); (9) inter-individual and sex variance (4.8%/2.4% dimorphic neurons); (10) dynamics — single-age snapshots without plasticity, development or aging; (11) periphery — retina/lamina absent in BANC; no muscles, sensors, hormones or gut. Beiran & Litwin-Kumar show the graph constrains but does not determine activity, and recordings from a neuron subset are needed to pin the rest. Each item should be an explicit uncertainty layer, and each added physics layer scored by error reduction on the same circuits as the LIF baseline.

**(b) Best V5 candidate circuits.** (1) Sugar/water gustatory → feeding initiation and (2) antennal mechanosensory → grooming: in-silico and in-vivo activation/silencing agreement in Shiu et al. 2024. (3) Command-like descending neurons and DN-network recruitment: Braun et al. 2024 (connectome-predicted DN→DN recruitment confirmed by imaging and manipulation) plus the Cande et al. 2018 single-DN activation screen; spans brain, MANC/BANC cord and the body models. (4) Optic-lobe motion pathway (T4/T5; 43 characterised types): physiological ground truth from Lappalainen 2024's 26-study compendium and Currier & Clandinin 2025 — the best test of learned single-neuron parameters. (5) Larval whole brain: complete connectome (Winding 2023) plus the 1,054-line activation atlas (Vogelstein 2014), the only exhaustive whole-brain perturbation ground truth.

**(c) Feasible historical rediscovery targets** (cutoffs must precede *data release*, not just publication): antenna→leg by ectopic *Antennapedia* (cutoff 1986); ectopic eyes by *eyeless* (1994; transfer from Pax-6); *chico*/*InR* lifespan extension (2000; transfer from *C. elegans* IIS genetics); rapamycin (2009; from TOR genetics); Wg/Myc in disc regeneration (2008); maturity-silenced damage-responsive enhancers (2015) and their genome-wide generalisation (2019); JNK-driven gut dysplasia with age (2007); injury-induced adult neurogenesis (2012); and connectome-era targets such as DN-network recruitment, where the cutoff must precede the FlyWire/FAFB data release rather than the 2024 paper. *Indy* shows why only replicated results qualify.

**(d) Requirements for a leakage-free historical prospective benchmark.** (i) Corpus-level cutoff: models trained or verifiably restricted to pre-cutoff text and data — prompt-level "simulated ignorance" fails. (ii) Cutoffs on data releases and preprints, with versioned snapshots (FlyWire 630/783, hemibrain, MANC, FlyBase release IDs) and post-cutoff annotations stripped. (iii) Temporal masking of later-stabilised vocabulary (cell-type and gene names) in all conditioning inputs. (iv) Kapoor–Narayanan audit across all eight leakage types, published as a model info sheet. (v) DREAM-style sequestration: pre-registered targets, independent scorer, no target-derived tuning. (vi) Time-split vs random-split reporting (Sheridan) and cutoff sweeps with discovery-lag curves against base-rate baselines (Tshitoyan). (vii) Quantitative, mechanistic scoring with calibration rather than two-alternative choice (BrainBench/SciPredict limitations). (viii) Memorisation probes and residual-leakage estimates (OracleProto ≈1%) with target sets large enough to absorb them. (ix) Replication of every admitted ground truth.
