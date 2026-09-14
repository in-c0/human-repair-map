# Drosophila voltage-gated ion-channel electrophysiology — resource base for V1

**Scope.** Resource base for a bounded computational experiment ("V1") on *Drosophila* voltage-gated ion-channel dynamics, starting from the **Shaker** K⁺ channel and embedding it in a *Drosophila* membrane/neuron model. Target fidelity hierarchy: experimental voltage-clamp observations → rich Markov/kinetic channel model → Hodgkin–Huxley (HH) gating model → reduced/phenomenological current model; embedding: channel state → ionic current → membrane voltage → spiking/response. This file inventories (1) Shaker Markov/kinetic gating models with published rate constants; (2) HH-type formulations of *Drosophila* channels (Shaker/Shal/Shab/Shaw/para); (3) public model **code** we can read and reuse; (4) held-out experimental observations with numbers; (5) candidate interventions with mechanistic mappings.

**Date:** 2026-09-14.

**Reachable-hosts note (verified this session).** The egress proxy blocked **every** publisher, preprint, index and mirror host tried: `modeldb.science`, `senselab.med.yale.edu`, `doi.org`, `arxiv.org`, `pubmed.ncbi.nlm.nih.gov`, `www.ncbi.nlm.nih.gov`, `pmc.ncbi.nlm.nih.gov`, `rupress.org` (J Gen Physiol), `journals.physiology.org`, `www.jneurosci.org`, `elifesciences.org`, `journals.plos.org`, `biorxiv.org`, `api.semanticscholar.org`, `api.crossref.org`, `europepmc.org`, `www.ebi.ac.uk`, `api.openalex.org`, `nature.com`, `science.org`, `cell.com`, `link.springer.com`, `onlinelibrary.wiley.com`, `royalsocietypublishing.org`, `journals.biologists.com`, `frontiersin.org`, `tandfonline.com`, `researchgate.net`, `zenodo.org`, `figshare.com`, `osf.io`, `gitlab.com`, `web.archive.org`/`archive.org`, `core.ac.uk`, `flybase.org`, `wikipedia.org`, `channelpedia.epfl.ch` (all 403 CONNECT / EGRESS_BLOCKED). **Reachable:** `github.com` (WebFetch returns content; `git clone` works through the proxy), `raw.githubusercontent.com`, `gist.github.com`, `bitbucket.org`, `pypi.org`, `objects.githubusercontent.com`. The GitHub MCP `search_repositories`/`search_code` tools work across all public GitHub; `get_file_contents` is restricted to this session's own repo, so **model code was read by `git clone` of the public `ModelDBRepository` / author mirrors into the scratchpad and reading the files locally** — exactly the channel the brief predicted. `WebSearch` works and returns rich snippets (with numbers), but those snippets are **secondary** and are marked "citation-only" below unless I read the artifact.

**Verification convention.**
- **Verified: yes (URL)** = I opened/cloned the actual artifact (a GitHub repo, or the Günay 2015 full-text XML that a corpus-mirror repo hosts on GitHub) and read the numbers/equations quoted.
- **citation-only (unconfirmed)** = bibliographic details and any numbers come from WebSearch result snippets; the DOI/publisher page itself could not be opened. Numbers in these entries must be re-checked against the source before use in a manuscript.
- **No parameter value in this file was invented.** Where I could not read a rate constant, I say so and point to where it lives (paper + table/figure).

**One full text was machine-readable.** Günay et al. 2015 (PLoS Comput Biol) is mirrored as JATS XML inside the GitHub repo `biosimulations/biosimulations-modeldb` (`…/thumbnails/PMC4433181/…/pcbi.1004189.nxml`); I fetched it via `raw.githubusercontent.com` and extracted its tables verbatim. Those numbers are **Verified: yes**.

---

## Thread 1 — Shaker Markov / kinetic gating models with published rate constants

> **Honest limitation up front (applies to every entry in this thread).** The primary Shaker gating papers (ZHA I–III 1994; Schoppa–Sigworth I–III 1998; Bezanilla–Perozo–Stefani 1994; Ledwell–Aldrich 1999) live on `rupress.org` / `pmc.ncbi.nlm.nih.gov` / `biophysj`, **all blocked**. I recovered each paper's model *structure*, charge counts, and several summary numbers from search snippets, **but the full per-transition rate-constant tables (α, β, γ, δ zero-voltage values and their partial charges) were NOT readable this session.** I did **not** find a public code re-implementation of any of these Markov schemes on GitHub (searched org:ModelDBRepository and general GitHub for "Zagotta"/"Schoppa"/Shaker+Markov+mod/py/m — no hits with actual rate equations). To obtain the rate constants you must open the JGP PDFs (exact table locations named per entry) from a session with publisher access, or a library.

### zha-gating-III — Zagotta WN, Hoshi T, Aldrich RW (1994). Shaker potassium channel gating. III: Evaluation of kinetic models for activation. J Gen Physiol 103(2):321–362. DOI 10.1085/jgp.103.2.321 (PMC2216839; PMID 8189208)
- **Key result / content:** The canonical activation-scheme paper. Systematically tests classes of gating models for N-type-inactivation-removed Shaker (ShB Δ6–46) in *Xenopus* oocytes against steady-state P_open, single-channel, macroscopic ionic and macroscopic gating currents **with a single parameter set**. Conclusion: models with four *identical single-step* activations fail, and concerted-opening models fail; the adequate scheme requires **two conformational changes in each of the four subunits before a final opening step** — the scheme routinely cited as ZHA "Scheme 3" / the "3+2′"-family ancestor. This is the standard reference kinetic model to target as the "rich Markov" tier for Shaker activation.
- **Usable quantities:** Model topology (per-subunit two-step activation ×4 + concerted opening); the paper's Tables give the fitted forward/backward rate constants and their voltage dependences (partial charges) — **table body not readable this session** (JGP blocked). Companion charge budget from Gating II (below): ~12–16 e₀ total, ~3.5 e₀ per elementary transition.
- **Limitations:** Xenopus oocyte expression at room temperature (not native neuron, not 25 °C fly body); N-type inactivation deliberately removed (Δ6–46); does not describe C-type/slow inactivation.
- **Use in V1:** **rich Markov tier** for Shaker activation (top of fidelity ladder). Fit target once rate table is retrieved.
- **Verified:** citation-only (unconfirmed) — abstract/structure confirmed via search; rate table not read. Matched: https://rupress.org/jgp/article/103/2/321/26310/ and https://pmc.ncbi.nlm.nih.gov/articles/PMC2216839/ (blocked); index https://pubmed.ncbi.nlm.nih.gov/8189208/

### zha-gating-II — Zagotta WN, Hoshi T, Dittman J, Aldrich RW (1994). Shaker potassium channel gating. II: Transitions in the activation pathway. J Gen Physiol 103(2):279–319. DOI 10.1085/jgp.103.2.279 (PMC2216838; PMID 8189207)
- **Key result / content:** Quantifies the charge and step count of Shaker activation. Steady-state P_open voltage dependence ⇒ **12–16 equivalent electronic charges** move across the membrane during activation; sigmoidal kinetics maintained to ≥ +100 mV ⇒ **≥ 5 sequential conformational changes before opening**; gating-charge voltage dependence ⇒ **≈ 3.5 e₀ per elementary transition** (numbers from search snippet of the abstract).
- **Usable quantities:** total charge 12–16 e₀; ≥5 sequential steps; ~3.5 e₀/transition. These constrain any Markov or HH surrogate's total gating charge.
- **Limitations:** as ZHA III (oocyte, ShBΔ6–46, room temp).
- **Use in V1:** charge/step budget the reduced models must reproduce; hold-out check on total gating charge.
- **Verified:** citation-only (unconfirmed). Matched: https://rupress.org/jgp/article/103/2/279/26311/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC2216838/

### zha-gating-I — Hoshi T, Zagotta WN, Aldrich RW (1994). Shaker potassium channel gating. I: Transitions near the open state. J Gen Physiol 103(2):249–278. DOI 10.1085/jgp.103.2.249 (PMC2216835; PMID 8189206)
- **Key result / content:** Single-channel analysis (ShBΔ6–46, oocyte). Activation time course and its voltage dependence are set by transitions **before first opening**; open dwell-times consistent with **a single kinetically distinguishable open state**; from the open state the channel enters ≥2 closed states rarely visited during activation; rate constants among open and near-open closed states are **nearly voltage-independent at V > −30 mV**; deactivation can close directly to an activation-pathway closed state, voltage-dependently.
- **Usable quantities:** single open state; near-open transitions voltage-independent > −30 mV (constrains the last steps of any scheme). Rate values in the paper's tables — not read.
- **Limitations:** as above.
- **Use in V1:** structural constraints on the open-state neighborhood of the Markov model.
- **Verified:** citation-only (unconfirmed). Matched: https://rupress.org/jgp/article-abstract/103/2/249/26312/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC2216835/

### schoppa-sigworth-III — Schoppa NE, Sigworth FJ (1998). Activation of Shaker potassium channels. III: An activation gating model for wild-type and V2 mutant channels. J Gen Physiol 111(2):313–342. DOI 10.1085/jgp.111.2.313 (PMC2222769; PMID 9450946)
- **Key result / content:** The other standard Shaker activation model, an explicit **multi-state ("3+2′") scheme**: three independent voltage-dependent charge-moving transitions per subunit (×4 subunits) **plus two concerted transitions** preceding opening, adding a third charge-translocating step and cooperative final steps. Constrained simultaneously by macroscopic ionic + gating currents and single-channel data from WT and the V2 (L382V) mutant (Papers I & II). This is the model usually meant by "Schoppa–Sigworth 15-state".
- **Usable quantities:** scheme topology (3 per-subunit steps + 2 concerted); WT and V2 mutant parameter sets in the paper's tables (**not readable this session**).
- **Limitations:** oocyte, room temp; large state count; identifiability of a 15-state model from macroscopic data is delicate.
- **Use in V1:** alternative "rich Markov" tier; useful because it explicitly separates per-subunit vs concerted steps (maps cleanly to the ILT intervention below).
- **Verified:** citation-only (unconfirmed). Matched: https://rupress.org/jgp/article/111/2/313/53968/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC2222769/ ; Papers I & II: https://rupress.org/jgp/article/111/2/271/ (I), https://pmc.ncbi.nlm.nih.gov/articles/PMC2222768/ (II).

### bezanilla-perozo-stefani-II — Bezanilla F, Perozo E, Stefani E (1994). Gating of Shaker K⁺ channels: II. The components of gating currents and a model of channel activation. Biophys J 66(4):1011–1021. (companion I: Stefani, Toro, Perozo, Bezanilla 1994, Biophys J 66:996–1010) PMID 8038375 (PMC1275808)
- **Key result / content:** Gating-current-based **sequential (eight-state) model** of Shaker activation. Q–V has two components: first near **V₁/₂ ≈ −63 mV**, second (larger apparent valence) near **V₁/₂ ≈ −44 mV**; two kinetic (exponential) decay components match the two charge components (numbers from snippet).
- **Usable quantities:** Q–V two-component midpoints (−63 mV, −44 mV); 8-state sequential topology. Full rate table not read.
- **Limitations:** oocyte cut-open clamp; sequential (non-Monod) topology differs from ZHA/Schoppa allosteric-ish schemes.
- **Use in V1:** third candidate Markov structure; Q–V midpoints are a hold-out target.
- **Verified:** citation-only (unconfirmed). Matched: https://pmc.ncbi.nlm.nih.gov/articles/PMC1275808/ ; https://pubmed.ncbi.nlm.nih.gov/8038375/

### ledwell-aldrich-ILT — Ledwell JL, Aldrich RW (1999). Mutations in the S4 region isolate the final voltage-dependent cooperative step in potassium channel activation. J Gen Physiol 113(3):389–414. DOI 10.1085/jgp.113.3.389 (PMID 10051516)
- **Key result / content:** The **ILT** triple mutant (V369I, I372L, S376T) in S4 separates the final cooperative opening step from the earlier per-subunit charge movements: activation V-dependence is **shallower and right-shifted**, kinetics slow/single-exponential, and the **final gating transition carries ≈ 1.8 e₀ (~10–13 % of total charge)** (snippet). Cleanly isolates the concerted opening step of the ZHA/Schoppa schemes.
- **Usable quantities:** final-step charge ≈ 1.8 e₀; qualitative shift/shallowing of the ILT G–V. Exact V₁/₂ shift and rate in paper tables (not read).
- **Limitations:** oocyte; a mutant, so it's an *intervention* target rather than a WT parameter source.
- **Use in V1:** **intervention mapping** (isolate/alter the final concerted step) with a defensible molecular correlate; also validates whether a reduced model even *has* a separable final step.
- **Verified:** citation-only (unconfirmed). Matched: https://rupress.org/jgp/article/113/3/389/32519/ ; https://pubmed.ncbi.nlm.nih.gov/10051516/

### hoshi-1990-Ntype — Hoshi T, Zagotta WN, Aldrich RW (1990). Biophysical and molecular mechanisms of Shaker potassium channel inactivation. Science 250(4980):533–538. DOI 10.1126/science.2122519 (PMID 2122519)
- **Key result / content:** Defines **N-type ("ball-and-chain") inactivation**: the cytoplasmic N-terminus of each subunit occludes the open pore; deletions in the N-terminus remove fast inactivation. Foundational for the inactivation module of any Shaker model.
- **Usable quantities:** mechanism (open-channel block by tethered ball); N-terminal deletion (Δ6–46) removes it — the construct used in all ZHA gating papers. Quantitative τ values are in later papers (see hold-out section).
- **Use in V1:** structure of the N-type inactivation state (one extra state off the open state); the Δ6–46 construct is the "inactivation-removed" reference.
- **Verified:** citation-only (unconfirmed). Matched: https://www.science.org/doi/10.1126/science.2122519 ; https://pubmed.ncbi.nlm.nih.gov/2122519/

### zagotta-1990-peptide — Zagotta WN, Hoshi T, Aldrich RW (1990). Restoration of inactivation in mutants of Shaker potassium channels by a peptide derived from ShB. Science 250(4980):568–571. DOI 10.1126/science.2122520 (PMID 2122520)
- **Key result / content:** A free synthetic ShB N-terminal peptide restores fast inactivation to N-deletion channels — direct proof of the ball-and-chain / open-channel-blocker model; the peptide acts as a diffusible blocker whose on-rate is concentration-dependent.
- **Usable quantities:** peptide block is bimolecular (on-rate ∝ [peptide]); off-rate sets recovery. Establishes N-type inactivation as an open-channel block (kon·[B], koff) module.
- **Use in V1:** motivates modeling N-type inactivation as a blocking reaction O ⇌ I; **intervention**: peptide concentration ↔ inactivation on-rate.
- **Verified:** citation-only (unconfirmed). Matched: https://www.science.org/doi/10.1126/science.2122520

### demo-yellen-1991 — Demo SD, Yellen G (1991). The inactivation gate of the Shaker K⁺ channel behaves like an open-channel blocker. Neuron 7(5):743–753. DOI 10.1016/0896-6273(91)90277-7 (PMID 1742023)
- **Key result / content:** Shows N-type inactivation has the hallmarks of open-channel block: the channel must open before it inactivates, and recovery requires reopening/deactivation coupling. Supports an **O→I** transition (not C→I).
- **Usable quantities:** kinetic constraint — inactivation is reached from the open state; recovery is coupled to deactivation (see Kuo 1997). Rate values in figures (not read).
- **Use in V1:** fixes the inactivation state's connectivity (off O, not off closed states).
- **Verified:** citation-only (unconfirmed). Matched: https://www.cell.com/neuron/abstract/0896-6273(91)90277-7 ; https://pubmed.ncbi.nlm.nih.gov/1742023/

### hoshi-1991-Ctype — Hoshi T, Zagotta WN, Aldrich RW (1991). Two types of inactivation in Shaker K⁺ channels: effects of alterations in the carboxy-terminal region. Neuron 7(4):547–556. DOI 10.1016/0896-6273(91)90367-9 (PMID 1931050)
- **Key result / content:** Distinguishes **N-type** (fast, N-terminal, ms) from **C-type** (slow, pore/S6, seconds) inactivation. C-type is largely **voltage-independent over −25 to +50 mV**, does not require N-type but is partially coupled to it, and its rate differs between C-terminal splice variants (ShA vs ShB) via a single S6 residue.
- **Usable quantities:** C-type is slow (seconds) and ~voltage-independent −25→+50 mV; splice-variant dependence localizes to one S6 residue. Time constants read from later K⁺-dependence work (Lopez-Barneo 1993).
- **Use in V1:** motivates a **separate slow C-type inactivation state**; the external-K⁺ and splice-variant dependences are two interventions.
- **Verified:** citation-only (unconfirmed). Matched: https://pubmed.ncbi.nlm.nih.gov/1931050/

### lopezbarneo-1993-Ctype-K — López-Barneo J, Hoshi T, Heinemann SH, Aldrich RW (1993). Effects of external cations and mutations in the pore region on C-type inactivation of Shaker potassium channels. Receptors Channels 1(1):61–71. (PMID 8081712)
- **Key result / content:** External K⁺ (and Rb⁺; less potently Na⁺, Cs⁺, NH₄⁺) **slows C-type inactivation** — ions bound near the external pore mouth impede the C-type conformational change; pore mutations (e.g. at position 449) tune the rate. Snippet quotes a downstream figure: C-type τ ≈ **1.4 s** in low external K⁺ rising to ≈ **2.6 s** in ~140 mM K⁺ (re-verify against the primary paper).
- **Usable quantities:** external-K⁺ dependence of C-type τ (~1.4 → ~2.6 s across low→high K⁺, snippet-sourced); ionic potency order K⁺≈Rb⁺ > Na⁺,Cs⁺,NH₄⁺.
- **Limitations:** oocyte; exact τ vs [K⁺]ₒ curve not read; the 1.4/2.6 s figure is snippet-sourced and possibly from a citing paper.
- **Use in V1:** **intervention** — extracellular [K⁺] ↔ C-type inactivation rate; a hold-out (K⁺-dependence direction is robust even if the exact τ is re-checked).
- **Verified:** citation-only (unconfirmed). Matched: https://pubmed.ncbi.nlm.nih.gov/8081712/

### iverson-rudy-1990-splice — Iverson LE, Rudy B (1990). The role of the divergent amino and carboxyl domains on the inactivation properties of potassium channels derived from the Shaker gene of Drosophila. J Neurosci 10(9):2903–2916. (PMID 2201060; DOI 10.1523/JNEUROSCI.10-09-02903.1990)
- **Key result / content:** Nine ShA/ShB/ShD N- × C-terminal chimeras expressed in oocytes; **macroscopic inactivation rate is set mainly by the N-terminal (amino) domain**, with a modest C-terminal contribution. Six of nine constructs give currents inactivating at distinct rates; one essentially non-inactivating except over many seconds.
- **Usable quantities:** ordering of inactivation rates by N-terminal variant; identifies which splice variant maps to which native current (ShA/ShB relevant to muscle vs neuron IA). Per-variant τ values in tables (not read).
- **Use in V1:** justifies **splice-variant** as an intervention axis for N-type inactivation rate.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/10/9/2903 ; https://pubmed.ncbi.nlm.nih.gov/2201060/

### kuo-1997-recovery — Kuo CC (1997). Deactivation retards recovery from inactivation in Shaker K⁺ channels. J Neurosci 17(10):3436–3444. (PMID 9133369)
- **Key result / content:** Recovery from N-type inactivation begins with **no delay** on repolarization; hyperpolarization speeds the initial (fast) component but the overall time course has fast + slow components because deactivation (closing the activation gate) must occur for full recovery. Snippet: recovery τ ≈ **23 ± 3 ms at −90 mV** over the first 100 ms; recoveries at −120 and −90 mV are similar, and gating charge recovers more slowly than ionic current at −70/−50 mV.
- **Usable quantities:** recovery τ ≈ 23 ms at −90 mV (fast component); recovery is multi-exponential and coupled to deactivation. This is the "Kuo & Bean-type recovery kinetics" the brief asked for (Kuo, Shaker-specific).
- **Limitations:** oocyte; the 23 ms figure is snippet-sourced — confirm the exact holding-potential dependence in the paper.
- **Use in V1:** hold-out for recovery-from-inactivation kinetics; **intervention** — recovery holding potential.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/17/10/3436 ; https://pubmed.ncbi.nlm.nih.gov/9133369/

### rodriguez-sigg-bezanilla-1998-temp — Rodríguez BM, Sigg D, Bezanilla F (1998). Voltage gating of Shaker K⁺ channels: the effect of temperature on ionic and gating currents. J Gen Physiol 112(2):223–242. (PMID 9689029; PMC-linked)
- **Key result / content:** Temperature (2–22 °C, cut-open oocyte, non-inactivating Shaker H4) dependence of Shaker gating. Main ionic-current component **Q₁₀ > 4** and only mildly voltage-dependent (z ≈ 0.2–0.3 e₀); the C→O opening step is weakly temperature-dependent and ~voltage-independent (Eₐ ≈ 5 kcal/mol) while channel **closing is strongly temperature-dependent (Q₁₀ > 4, Eₐ ≈ 24–25 kcal/mol)**; gating-charge reactivation Q₁₀ > 4 (0 mV) vs 1.2 (−90 to −50 mV).
- **Usable quantities:** Q₁₀ > 4 for ionic-current kinetics and for closing; asymmetric temperature dependence of opening vs closing. Directly parameterizes the temperature/Q₁₀ intervention.
- **Limitations:** low-temperature range (2–22 °C), extrapolation to 25 °C fly body needed; Shaker H4 (non-inactivating).
- **Use in V1:** **temperature/Q₁₀ intervention** with per-transition asymmetry; hold-out for temperature scaling.
- **Verified:** citation-only (unconfirmed). Matched: https://rupress.org/jgp/article/112/2/223/11025/ ; https://pubmed.ncbi.nlm.nih.gov/9689029/

### nobile-1997-fastinact-temp — Nobile M, Olcese R, Toro L, Stefani E (1997). Fast inactivation of Shaker K⁺ channels is highly temperature dependent. Exp Brain Res 114(1):138–142. (PMID 9125459)
- **Key result / content:** Shaker H4, 20 °C → 5 °C: peak amplitude **Q₁₀ ≈ 1.51**, activation τ **Q₁₀ ≈ 3.14**, inactivation-decay τ **Q₁₀ ≈ 7.20**, recovery-from-inactivation **Q₁₀ ≈ 1.57** (snippet). Fast (N-type) inactivation installation is strongly temperature-dependent; recovery much less so.
- **Usable quantities:** the four Q₁₀ values above — a compact, quantitative temperature-scaling dataset for a Shaker HH model.
- **Limitations:** 5–20 °C; Shaker H4; note journal is Exp Brain Res (a couple of secondary sources mis-cite as Pflügers Arch — flagged).
- **Use in V1:** primary **Q₁₀** source for the HH-tier temperature intervention; multiple hold-out numbers.
- **Verified:** citation-only (unconfirmed). Matched: https://pubmed.ncbi.nlm.nih.gov/9125459/ ; also BioNumbers BNID 100374/100378/100382 index (blocked).

---

## Thread 2 — HH-type formulations of *Drosophila* channels (parameters)

### gunay-2015-aCC — Günay C, Sieling FH, Dharmar L, Lin W-H, Wolfram V, Marley R, Baines RA, Prinz AA (2015). Distal spike-initiation-zone location estimation … in a novel model of an identified Drosophila motoneuron. PLoS Comput Biol 11(5):e1004189. DOI 10.1371/journal.pcbi.1004189
- **Key result / content:** Isopotential, two-compartment and full-morphology HH models of the identified 3rd-instar larval **aCC/MN1-Ib motoneuron**. Channels: **NaT** (transient Na, from O'Dowd & Aldrich 1988 cultured neurons), **NaP** (persistent Na, from DmNav10 oocyte expression, Lin/Marley), **Ks** (slow non-inactivating K, "Shab-like" delayed rectifier, fit to *in vivo* aCC), **Kf** (fast A-type K with two inactivation time constants, the **Shaker+Shal composite** IA, fit to *in vivo* aCC). **These are the readable, reusable HH parameters** (full text mirrored on GitHub; tables extracted verbatim below). Passive/morphology parameters also tabulated.
- **Usable quantities (Verified verbatim from the mirrored full-text XML, Table 5 & Table 6):**

  HH form: m∞ = 1/(1+exp((V−V₁/₂,ₘ)/kₘ)); channels use gᵢ·mᵖ·h. Voltages in mV, τ in ms.

  | Current | p | V₁/₂,m | kₘ | τₘ(V) [ms] | V₁/₂,h | k_h | τ_h(V) [ms] |
  |---|---|---|---|---|---|---|---|
  | NaT | 3 | −29.13 | −8.92 | 0.13 + 3.43/(1+exp((V+45.35)/5.98)) | −47 | 5 | 0.36 + exp((V+20.65)/−10.47) |
  | NaP | 1 | −48.77 | −3.68 | 1 | — | — | — |
  | Ks (Shab-like) | 4 | −12.85 | −19.91 | 2.03 + 1.96/(1+exp((V−29.83)/3.32)) | — | — | — (non-inactivating) |
  | Kf (Shaker/Shal IA) | 4 | −17.55 | −7.27 | 1.94 + 2.66/(1+exp((V−8.12)/7.96)) | −45 | 6 | 1.79 + 515.8/(1+exp((V+147.4)/28.66)) |

  Kf inactivation is a weighted **two-τ** process: h = 0.95·h₁ + 0.05·h₂, with h₁ using V₁/₂,h=−45, k_h=6, τ_h above; h₂ using V₁/₂=−44.2, k=−1.5, **τ₂ = 116 ms fixed** (from the NeuroML2/XPP files). E_K = −80 mV, E_Na = +45 mV.

  Maximal conductances / capacitance (Table 6): **isopotential model** — g_Ks=50 nS, g_Kf=24.1 nS, g_NaT=100 nS, g_NaP=0.8 nS, g_leak=6.8 nS, E_leak=−55 mV, C=4 pF. **Two-compartment** — soma: g_Ks=1, g_Kf=1 nS, g_leak=0.05 nS, C=10 pF, g_axon=1.3 nS; axon: g_Ks=700, g_Kf=200, g_NaT=180, g_NaP=0.01, g_leak=0.63 nS, C=1.8 pF.

  Passive/morphology (Table 1–2): total membrane area 4660 µm², total C_m ≈ 29.7 pF; fitted R_a=212.5 Ω·cm, C_m=0.77 µF/cm², g_leak=38.0 µS/cm², electrode g_seal=0.20 nS, C_e=1.28 pF, R_e=41.5 MΩ (n=5).
- **Limitations:** Kf lumps Shaker+Shal (not gene-separated); Ks/Kf fit to *in vivo* aCC (space-clamp-imperfect, hence the two-compartment fix); NaT from a different cell (cultured), NaP from oocyte. Room-temperature recordings.
- **Use in V1:** **primary reusable HH channel set + neuron embedding** for a larval motoneuron. The Kf A-type is the natural "HH Shaker(+Shal)" tier; Ks is the "HH Shab-like" tier.
- **Verified:** yes — full text XML read at https://raw.githubusercontent.com/biosimulations/biosimulations-modeldb/master/biosimulations_modeldb/source/thumbnails/PMC4433181/PMC4433181/pcbi.1004189.nxml ; code Verified below (gunay-code).

### vahasoyrinki-2006-photoreceptor — Vähäsöyrinki M, Niven JE, Hardie RC, Weckström M, Juusola M (2006). Robustness of neural coding in Drosophila photoreceptors in the absence of slow delayed rectifier K⁺ channels. J Neurosci 26(10):2652–2660. DOI 10.1523/JNEUROSCI.3316-05.2006
- **Key result / content:** Combines genetics + electrophysiology + an **isopotential HH photoreceptor model** with three voltage-gated K⁺ conductances: **Shaker (fast-inactivating IA, g_KA)**, **Shab (slow delayed rectifier IKs)**, and a **non-inactivating "novel" conductance**. Shab loss (mutant) drops input resistance proportionally and the cell homeostatically compensates; R1–R6 information rates up to ~200 bits/s.
- **Usable quantities:** the model's Shaker/Shab/novel HH Boltzmann parameters are the same lineage encoded in the readable Li 2019 dynamic-clamp code (see photoreceptor-code below — that is the concrete, readable version). Photoreceptor C_body area 1.57×10⁻⁵ cm² (from code). Actual per-channel V₁/₂/slope table in the 2006 paper not readable here (JNeurosci blocked) but is reproduced in code.
- **Limitations:** native photoreceptor (in situ), 20–25 °C; "novel" conductance is of unknown molecular identity.
- **Use in V1:** the **photoreceptor embedding** (channel → current → graded voltage) alternative to the spiking motoneuron; gene-separated Shaker vs Shab.
- **Verified:** citation-only for the paper (unconfirmed); the equivalent parameters are **Verified: yes** in the Li 2019 code (photoreceptor-code). Matched: https://www.jneurosci.org/content/26/10/2652

### niven-2003-shaker-photoreceptor — Niven JE, Vähäsöyrinki M, Kauranen M, Hardie RC, Juusola M, Weckström M (2003). The contribution of Shaker K⁺ channels to the information capacity of Drosophila photoreceptors. Nature 421(6923):630–634. DOI 10.1038/nature01384
- **Key result / content:** Recording WT vs Shaker-mutant (Sh¹⁴) photoreceptors + HH modelling: **loss of Shaker reduces signal-to-noise and drops information capacity by ~50 %** in light-adapted cells; Shaker inactivation amplifies voltage signals and lets photoreceptors use their voltage range more effectively; compensatory impedance changes follow.
- **Usable quantities:** ~50 % information-capacity drop on Shaker loss (behavioral/coding hold-out); qualitative "selective amplifier" role. HH parameters shared with vahasoyrinki-2006 / Li-2019 code.
- **Use in V1:** **intervention** (Shaker genetic loss) with a quantitative downstream (information-capacity) hold-out at the response tier.
- **Verified:** citation-only (unconfirmed). Matched: https://www.nature.com/articles/nature01384 ; https://pubmed.ncbi.nlm.nih.gov/12571596/

### niven-2003b-metaboliccost — Niven JE, Vähäsöyrinki M, Juusola M (2003). Shaker K⁺-channels are predicted to reduce the metabolic cost of neural information in Drosophila photoreceptors. Proc R Soc B 270(Suppl 1):S58–S61. DOI 10.1098/rsbl.2003.0010
- **Key result / content:** Circuit HH model incorporating photoreceptor ion channels, pumps and exchangers; predicts Shaker channels reduce the ATP cost of information transfer in WT vs Shaker-mutant photoreceptors.
- **Usable quantities:** metabolic-cost estimates tied to the same photoreceptor HH model (energy tier hold-out).
- **Use in V1:** optional energy-cost readout downstream of the channel model.
- **Verified:** citation-only (unconfirmed). Matched: https://pmc.ncbi.nlm.nih.gov/articles/PMC1698034/ (blocked); https://royalsocietypublishing.org/rspb/article-abstract/270/suppl_1/S58/

### niven-2004-interactions / kauranen-weckstrom-2004 — Niven JE, Vähäsöyrinki M, Juusola M, French AS (2004). Interactions between light-induced currents, voltage-gated currents, and input signal properties in Drosophila photoreceptors. J Neurophysiol 91:2696–2706. DOI 10.1152/jn.01163.2003 · and · Kauranen M, Weckström M (2004). K⁺ channels and their modulation by 5-HT in Drosophila photoreceptors: a modelling study. Ann Biomed Eng 32:1580–1595. DOI 10.1114/B:ABME.0000049041.73308.63
- **Key result / content:** Two HH photoreceptor modelling studies. Niven 2004: WT vs Sh¹⁴ responses to naturalistic stimuli with HH simulation; Shaker mutation changes the light-dependent current and increases the delayed rectifier. Kauranen & Weckström 2004: isopotential HH model with **g_KA (Shaker)** and **g_Ks (delayed rectifier)** and their 5-HT modulation.
- **Usable quantities:** further HH photoreceptor parameter sets (in-paper tables, not read); confirm the Shaker/delayed-rectifier two-conductance structure.
- **Use in V1:** cross-checks / alternative parameterizations of the photoreceptor embedding.
- **Verified:** citation-only (unconfirmed). Matched: https://journals.physiology.org/doi/full/10.1152/jn.01163.2003 ; https://link.springer.com/article/10.1114/B:ABME.0000049041.73308.63

### heras-2018-photoreceptor — Heras FJH, Vähäsöyrinki M, Niven JE (2018). Modulation of voltage-dependent K⁺ conductances in photoreceptors trades off investment in contrast gain for bandwidth. PLoS Comput Biol 14(6):e1006566. DOI 10.1371/journal.pcbi.1006566
- **Key result / content:** Analytic + HH photoreceptor model with **Shaker and Shab** conductances; quantifies the gain/bandwidth trade-off of K⁺-conductance modulation. PLoS Comput Biol ⇒ likely open supplementary parameters.
- **Usable quantities:** HH Shaker/Shab parameter values in supplementary tables (not read; PLoS blocked). Worth retrieving — same lineage as Vähäsöyrinki 2006.
- **Use in V1:** modern, likely-open re-parameterization of the photoreceptor Shaker/Shab HH model.
- **Verified:** citation-only (unconfirmed). Matched: https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1006566 ; preprint https://www.biorxiv.org/content/10.1101/344325v2

### hardie-1991-photoreceptor — Hardie RC (1991). Voltage-sensitive potassium channels in Drosophila photoreceptors. J Neurosci 11(10):3079–3095. (PMID 1941075)
- **Key result / content:** The **primary source of the photoreceptor K⁺ biophysics** used by all the Juusola-lab models. Dissociated R1–R6: three classes — **Shaker IA** (rapidly inactivating, coded by Shaker, half-inactivated ≈ **−70 mV**, activation threshold ≈ **−90 mV**, needs holding ≤ −100 mV to fully de-inactivate); **IKs** slow delayed rectifier (half-inactivated ≈ **−40 mV**, inactivation τ ≈ **500 ms**); **IKf** faster-inactivating delayed rectifier (~30 % of cells, half-inactivated ≈ **−80 mV**).
- **Usable quantities:** IA half-inact ≈ −70 mV, threshold ≈ −90 mV; IKs half-inact ≈ −40 mV, τ_inact ≈ 500 ms; IKf half-inact ≈ −80 mV (snippet-sourced but internally consistent with the code below).
- **Limitations:** native photoreceptor; the photoreceptor Shaker operates ~50 mV more negative than oocyte-expressed Shaker (β-subunit / splice / native context) — do **not** transfer oocyte V₁/₂ to photoreceptor.
- **Use in V1:** experimental anchor for the photoreceptor HH parameters; hold-out numbers.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/11/10/3079 ; https://pubmed.ncbi.nlm.nih.gov/1941075/

### smith-2019-LNv — Smith P, Buhl E, Tsaneva-Atanasova K, Hodge JJL (2019). Shaw and Shal voltage-gated potassium channels mediate circadian changes in Drosophila clock neuron excitability. J Physiol 597(23):5707–5722. DOI 10.1113/JP278826 (ModelDB 263199)
- **Key result / content:** Conductance-based HH model of the **lateral ventral clock neuron (LNv)** with **four Kv channels explicitly separated: Shaker (Kv1/I1), Shab (Kv2/I2), Shaw (Kv3/I3), Shal (Kv4/I4)** plus Na, Ca, leak. Shaw and Shal conductances oscillate circadianly (g scaled by cos(2π·ZT/24)). **This is the readable MATLAB model with a full 4-Kv parameter set** (extracted below).
- **Usable quantities (Verified from `MODEL.mat`; index map from `LNVmodel.m`):** each channel is a 13-element vector [V₁/₂,act, k_act, A_τm, b_τm, c_τm, V₁/₂,inact, k_inact, A_τh, b_τh, c_τh, gmax, m-power(=4), h-power]. m∞=1/(1+exp(−(V−V₁/₂)/k)); τ_m=A·exp(−((V−b)/c)); analogous for h.

  | Kv | gene | V₁/₂,act | k_act | V₁/₂,inact | k_inact | gmax | h-power |
  |---|---|---|---|---|---|---|---|
  | KV1 | **Shaker** | −34.18 | 9.75 | −93.19 | 54.49 | 2.35 | 1 |
  | KV2 | **Shab** | −29.69 | 10.49 | −54.11 | 22.48 | 0.86 | **0 (non-inactivating)** |
  | KV32 | **Shaw** | −57.30 | 14.63 | −25.82 | 2.50 | 1.40 | 1 |
  | KV4 | **Shal** | −48.63 | 7.65 | −43.06 | 1.73 | 1.25 | 1 |

  (τ coefficients and human-Kv9 variants also in the file.) C=3.7 pF; E_Na=52, E_K=−90, E_leak=−7, E_Ca=132 mV. Note KV2/Shab h-power=0 ⇒ non-inactivating delayed rectifier — a **cross-check** consistent with Tsunoda & Salkoff 1995 ("native Shab shows no observable inactivation").
- **Limitations:** phenomenological fits (some values, e.g. Shaker k_inact=54 mV, are shallow/composite and should not be read as clean biophysics); LNv-specific; no explicit license in the repo.
- **Use in V1:** the **only readable model that separates all four Kv genes** — ideal reference for a gene-resolved HH tier and for the clock-neuron embedding.
- **Verified:** yes — cloned https://github.com/ModelDBRepository/263199 and decoded `MODEL.mat`.

### smith-2018-tremor — Smith P, Arias R, Sonti S, … Hodge JJL, Clark LN (2018). A Drosophila model of essential tremor. Sci Rep 8:7625. DOI 10.1038/s41598-018-25949-w (ModelDB 263196)
- **Key result / content:** Same LNv HH model as smith-2019 (identical `MODEL.mat` KV1–KV4 vectors; verified by diff) applied to essential-tremor Kv9 variants; adds a **particle-swarm HH fitter** (`particleswarm.m`) and a cost-function comparison to Kv2/Kv9 voltage-clamp data.
- **Usable quantities:** identical Shaker/Shab/Shaw/Shal vectors as smith-2019; **reusable HH-fitting code** (particle swarm) for fitting our own voltage-clamp data to the 13-parameter HH form.
- **Use in V1:** reusable fitting harness; second citation for the same parameter set.
- **Verified:** yes — cloned https://github.com/ModelDBRepository/263196 (README + code read; MODEL.mat identical to 263199).

### megwa-2023-motoneuron — Megwa OF, Pascual LM, Günay C, Pulver SR, Prinz AA (2023). Temporal dynamics of Na/K pump-mediated memory traces … (single-compartment Drosophila larval motor neuron). Front Neurosci 17:1154549. DOI 10.3389/fnins.2023.1154549 (ModelDB 267620)
- **Key result / content:** Single-compartment Python model of the larval **crawl motor neuron** reusing the Günay-2015/Lin-2012 channel set: **Kf** (fast A-type, Shaker/Shal composite), **Ks** (slow, Shab-like), **NaT**, **NaP**, Na/K pump with dynamic [Na]ᵢ and E_Na. Exact same Kf/Ks Boltzmann + τ equations as Günay 2015 (verified in the code).
- **Usable quantities (Verified from the Python source):** g_Ks=50, g_Kf=15.1, g_NaP=0.8, g_NaT=100, g_leak_Na=1.2, g_leak_K=3.75 nS; C_m=4 pF; E_K=−80 mV; cell volume 549 µm³; pump I_max=75 pA, [Na]ᵢ half-act 40 mM, slope 10 mM. Kf/Ks/NaT/NaP gating functions identical to Günay 2015 Table 5.
- **Use in V1:** clean, dependency-light **Python** re-implementation of the larval-motoneuron HH channel set + a Na/K-pump extension (channel→current→voltage→spiking, single compartment). Easiest starting simulator.
- **Verified:** yes — cloned https://github.com/ModelDBRepository/267620 and read `FlyMotoneuronWithPump_Megwa2023_version230129.PY`.

### tsunoda-salkoff-1995a — Tsunoda S, Salkoff L (1995). Genetic analysis of Drosophila neurons: Shal, Shaw, and Shab encode most embryonic potassium currents. J Neurosci 15(3):1741–1754. (PMID 7891132)
- **Key result / content:** In *embryonic neurons*, Shaker current is **not** detectable; **Shal** dominates the neuronal A-current (as Shaker dominates in muscle). Single-channel: **Shal ≈ 4 pS transient**, **Shaw ≈ 42 pS non-inactivating with very low voltage sensitivity**, **Shab ≈ 11 pS slowly inactivating**.
- **Usable quantities:** single-channel conductances (Shal 4 pS, Shaw 42 pS, Shab 11 pS); which gene carries which native neuronal current (critical for assigning the Günay "Kf" A-type to Shal vs Shaker by cell type).
- **Use in V1:** gene-to-current assignment for *neurons*; caution that "IA" in a fly neuron is often **Shal**, not Shaker.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/15/3/1741 ; https://pubmed.ncbi.nlm.nih.gov/7891132/

### tsunoda-salkoff-1995b — Tsunoda S, Salkoff L (1995). The major delayed rectifier in both Drosophila neurons and muscle is encoded by Shab. J Neurosci 15(7):5209–5221. (PMID 7623146)
- **Key result / content:** **Shab** is the major delayed rectifier (IK) in both neurons and muscle; a Shab mutation removes essentially all delayed-rectifier current, leaving the Shaker (muscle) / Shal (neuron) A-current intact. Native Shab shows **little/no inactivation** (unlike oocyte-expressed Shab, which inactivates slightly); relatively 4-AP-resistant, slow activation.
- **Usable quantities:** Shab = delayed rectifier, non-inactivating natively, 4-AP-resistant; Shab-null removes IK. Supports the "Ks non-inactivating" choice in Günay 2015 and the KV2 h-power=0 in Smith 2019.
- **Use in V1:** justifies the HH "Shab-like Ks" structure and a **Shab-loss intervention** that removes IK selectively.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/15/7/5209 ; https://pubmed.ncbi.nlm.nih.gov/7623146/

### covarrubias-1991 — Covarrubias M, Wei A, Salkoff L (1991). Shaker, Shal, Shab, and Shaw express independent K⁺ current systems. Neuron 7(5):763–773. (PMID 1742024)
- **Key result / content:** The four *Drosophila* Kv genes express **independent, non-heteromultimerizing** current systems in oocytes; establishes the canonical functional split — Shaker & Shal → fast transient A-type; Shab → delayed rectifier; Shaw → slow, weakly voltage-dependent non-inactivating.
- **Usable quantities:** qualitative per-gene current phenotypes; independence justifies modeling each Kv as a separate HH conductance.
- **Use in V1:** taxonomy underpinning the gene-resolved HH tier.
- **Verified:** citation-only (unconfirmed). Matched: https://pubmed.ncbi.nlm.nih.gov/1742024/

### ryglewski-duch-2009-MN5 — Ryglewski S, Duch C (2009). Shaker and Shal mediate transient calcium-independent potassium current in a Drosophila flight motoneuron. J Neurophysiol 102(6):3673–3688. DOI 10.1152/jn.00693.2009 (PMID 19828724)
- **Key result / content:** In the adult flight motoneuron **MN5** *in situ*, the transient Ca²⁺-independent A-current is **jointly Shaker + Shal**: **α-dendrotoxin** blocks the Shaker portion, **phrixotoxin-2** the Shal portion; a Shaker dominant-negative transgene leaves an α-DTX-insensitive (Shal) remainder. MN5 has four K⁺ currents (2 transient, 2 sustained; one of each Ca²⁺-activated).
- **Usable quantities:** pharmacological separation (α-DTX → Shaker; PaTx-2 → Shal); Shaker-DN as a genetic intervention. Per-current V₁/₂ in the paper (not read).
- **Use in V1:** **native, gene-resolved IA** and three clean interventions (α-DTX, PaTx-2, Shaker-DN); the natural target if MN5 is the neuron.
- **Verified:** citation-only (unconfirmed). Matched: https://journals.physiology.org/doi/full/10.1152/jn.00693.2009 ; https://pubmed.ncbi.nlm.nih.gov/19828724/

### peng-wu-2007 — Peng IF, Wu CF (2007). Differential contributions of Shaker and Shab K⁺ currents to neuronal firing patterns in Drosophila. J Neurophysiol 97(1):780–794. DOI 10.1152/jn.01012.2006 (PMID 17079336)
- **Key result / content:** *Drosophila* "giant" neuron culture; correlates firing classes (delayed, tonic, adaptive, damping) with K⁺-current profiles. Sh mutation removes part of IA (revealing Shal); Shab mutation removes part of IK (revealing Shaw); **4-AP removes Sh+Shal IA** (delayed→damping) and **quinidine blocks Shab IK** (tonic→damping).
- **Usable quantities:** channel→firing-pattern map; pharmacology (4-AP → IA, quinidine → Shab IK); current densities comparable to cultured giant neurons.
- **Use in V1:** links channel-level interventions to **spiking-pattern** hold-outs at the response tier.
- **Verified:** citation-only (unconfirmed). Matched: https://journals.physiology.org/doi/full/10.1152/jn.01012.2006

### gasque-2005-MB — Gasque G, Labarca P, Reynaud E, Darszon A (2005). Shal and Shaker differential contribution to the K⁺ currents in the Drosophila mushroom body neurons. J Neurosci 25(9):2348–2358. DOI 10.1523/JNEUROSCI.4384-04.2005 (PMID 15745961)
- **Key result / content:** In **Kenyon cells** (mushroom body), both Shaker and Shal contribute A-type current; Shal dominates the inactivating outward current. Transcripts for all four Kv genes present. Supplement with per-current voltage dependence.
- **Usable quantities:** MB-neuron IA gene split (Shal-dominant); supplementary V₁/₂ tables (not read; JNeurosci blocked).
- **Use in V1:** mushroom-body Kenyon-cell embedding option; relates to the honeybee Kenyon models below.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/25/9/2348

### pelz-1999-kenyon — Pelz C, Jander J, Rosenboom H, Hammer M, Menzel R (1999). IA in Kenyon cells of the mushroom body of honeybees resembles Shaker currents: kinetics, modulation by K⁺, and simulation. J Neurophysiol 81(4):1749–1759. (PMID 10200210) — code ModelDB 34560
- **Key result / content:** Honeybee Kenyon-cell **A-current** with an explicit HH simulation (SNNAP). **Half-activation −0.7 ± 2.9 mV; half-inactivation −54.7 ± 2.4 mV** (WebSearch-confirmed and matching the code file values exactly); activation τ ≈ **0.4 ± 0.1 ms** and inactivation τ ≈ **3.0 ± 1.6 ms at +45 mV**; 4-AP-sensitive; "resembles Shaker".
- **Usable quantities (Verified from the SNNAP `.vdg`/`.A`/`.B` files in ModelDB 34560):** IA (Ka): m^1·h, g=0.028 µS, E=−85 mV; **m∞: V₁/₂=−0.7, s=16.1**; **h∞: V₁/₂=−54.7, s=7.0**; activation τ 0.35–1.65 ms range; inactivation τ 2.5–90 ms range. Also a delayed rectifier (Kv, m⁴, V₁/₂=−24.6, s=19.3) and Na channel.
- **Limitations:** honeybee (not *Drosophila*), cultured Kenyon cells — a Shaker-*like* insect A-current, useful as an independent HH exemplar and cross-species check.
- **Use in V1:** a fully readable, self-contained HH A-current with matching published numbers — good sanity target for the HH tier.
- **Verified:** yes — cloned https://github.com/ModelDBRepository/34560 (SNNAP files) and confirmed V₁/₂ against WebSearch snippet of the paper.

### wustenberg-2004-kenyon — Wüstenberg DG, Boytcheva M, Grünewald B, Byrne JH, Menzel R, Baxter DA (2004). Current- and voltage-clamp recordings and computer simulations of Kenyon cells in the honeybee. J Neurophysiol 92(4):2589–2603. DOI 10.1152/jn.01259.2003 — code ModelDB 42022
- **Key result / content:** Fuller honeybee Kenyon-cell HH model: fast transient Na (INa), delayed rectifier (I_K,V), fast transient K (I_K,A, "Shaker-like"), with two A-current variants (fast KaF, slow KaS). SNNAP implementation.
- **Usable quantities (Verified from ModelDB 42022 files):** KaF (m³·h, g=0.0581 µS, E=−85): m∞ V₁/₂=−20.7 s=16.1, h∞ V₁/₂=−74.7 s=7.0, τ_act 0.35–1.65 ms, τ_inact 2.5–90 ms; KaS (slower τ); Kv (m⁴, V₁/₂=−37.6 s=27.24, E=−80). Na, Na2 channels present.
- **Use in V1:** second, more complete honeybee Kenyon-cell HH exemplar with explicit fast/slow A-current split.
- **Verified:** yes — cloned https://github.com/ModelDBRepository/42022 (SNNAP files).

### berger-crook-2015 / herreravaldez-2013 — Berger SD, Crook SM (2015). Modeling the influence of ion channels on neuron dynamics in Drosophila. Front Comput Neurosci 9:139. DOI 10.3389/fncom.2015.00139 · and · Herrera-Valdez MA, McKiernan EC, Berger SD, Ryglewski S, Duch C, Crook S (2013). Relating ion channel expression, bifurcation structure, and diverse firing patterns in a model of an identified motor neuron. J Comput Neurosci 34:211–229. DOI 10.1007/s10827-012-0416-6
- **Key result / content:** Minimal conductance-based *Drosophila* (MN5-oriented) HH models using thermodynamic/Boltzmann channel formulations; channel densities switch firing patterns and integrator↔resonator behavior; 3-D extension shows Na inactivation gives delayed-first-spike + high-frequency firing. Front Comput Neurosci ⇒ open text; **no ModelDB/GitHub code found this session** (searched org:ModelDBRepository + general GitHub — no hit).
- **Usable quantities:** thermodynamic-form channel parameters in the papers' tables (not read); MN5 channel-density regimes. Herrera-Valdez 2013 uses the same MN5 currents (Ryglewski–Duch data).
- **Use in V1:** alternative minimal HH parameterization and bifurcation analysis; **code availability to be confirmed** (likely author site / not on the reachable hosts).
- **Verified:** citation-only (unconfirmed). Matched: https://pmc.ncbi.nlm.nih.gov/articles/PMC4649037/ (blocked) ; https://link.springer.com/article/10.1007/s10827-012-0416-6

### lin-2012-splice — Lin W-H, Günay C, Marley R, Prinz AA, Baines RA (2012). Activity-dependent alternative splicing increases persistent sodium current and promotes seizure. J Neurosci 32(21):7267–7277. DOI 10.1523/JNEUROSCI.6042-11.2012 (PMID 22623672)
- **Key result / content:** Mutually-exclusive DmNav exons (K/L, domain-III voltage sensor); exon L → large non-inactivating **persistent Na current (INaP)** and seizure. This is the source of the NaP parameterization reused by Günay 2015 / Megwa 2023 (the para/Na side of the model).
- **Usable quantities:** NaP splice-variant biophysics (the DmNav10 oocyte fit reused as `NaP` in the readable code); an activity-dependent-splicing **intervention** on INaP.
- **Use in V1:** the Na (para) channel provenance for the motoneuron embedding; a mechanistic Na intervention (splicing → INaP → seizure-like firing).
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/32/21/7267 ; https://pubmed.ncbi.nlm.nih.gov/22623672/

### salkoff-wyman-1981 — Salkoff L, Wyman R (1981). Genetic modification of potassium channels in Drosophila Shaker mutants. Nature 293(5829):228–230. DOI 10.1038/293228a0 (PMID 6268986)
- **Key result / content:** Original demonstration that **Shaker mutations alter the fast transient K⁺ current (IA, "A-current")** in *Drosophila* flight/DLM muscle, leaving the delayed IK intact — the founding genotype↔current link for Shaker.
- **Usable quantities:** genetic identity IA=Shaker in muscle (qualitative).
- **Use in V1:** historical anchor for the Shaker-loss intervention in muscle.
- **Verified:** citation-only (unconfirmed). Matched: https://www.nature.com/articles/293228a0 ; https://pubmed.ncbi.nlm.nih.gov/6268986/

### wu-haugland-1985 — Wu CF, Haugland FN (1985). Voltage clamp analysis of membrane currents in larval muscle fibers of Drosophila: alteration of potassium currents in Shaker mutants. J Neurosci 5(10):2626–2640. (PMID 2413182)
- **Key result / content:** Larval body-wall muscle voltage clamp: outward K⁺ = early transient **IA** + delayed steady **IK**, separable by activation/inactivation rate and voltage dependence; **all Sh mutations specifically alter IA** without changing IK or the Ca current. In **Sh⁵**, IA activation is shifted to more positive potentials (with a smaller inactivation shift and faster recovery).
- **Usable quantities:** IA vs IK separation criteria; Sh⁵ → depolarizing shift of IA activation. Numerical V₁/₂/slope in the paper's tables/figures (**not readable this session**).
- **Limitations:** larval muscle (not neuron); numbers not extractable here.
- **Use in V1:** the classic muscle IA=Shaker recordings; **Sh⁵** as a "shifted-V₁/₂" intervention.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/5/10/2626 ; https://pubmed.ncbi.nlm.nih.gov/2413182/

### haugland-wu-1990 — Haugland FN, Wu CF (1990). A voltage-clamp analysis of gene-dosage effects of the Shaker locus on larval muscle potassium currents in Drosophila. J Neurosci 10(4):1357–1371. (PMID 2158527)
- **Key result / content:** Sh⁺ gene dosage sets **IA amplitude** (reduced when dosage < normal; not increased by extra copies) — quantitative genotype→conductance-density link.
- **Usable quantities:** IA amplitude scales with Sh⁺ dosage (saturating) — supports a **channel-density (gmax) intervention** with a genetic correlate.
- **Use in V1:** maps "Shaker gene dosage" ↔ g_Shaker (density) intervention.
- **Verified:** citation-only (unconfirmed). Matched: https://www.jneurosci.org/content/10/4/1357

### lichtinghagen-1990 — Lichtinghagen R, Stocker M, Wittka R, Boheim G, Stühmer W, Ferrus A, Pongs O (1990). Molecular basis of altered excitability in Shaker mutants of Drosophila melanogaster. EMBO J 9(13):4399–4407. (PMID 2265611)
- **Key result / content:** Molecular lesions of three Sh alleles. **Sh^KS133**: missense in a conserved Kv motif → **loss of IA** (functionally null A-current). **Sh⁵**: missense in **S5** → altered activation/inactivation voltage dependence + faster recovery from inactivation. **Sh^E62**: another point mutant. Mutations reproduced by in-vitro mutagenesis + oocyte expression.
- **Usable quantities:** allele→mechanism map: Sh^KS133 = IA loss; Sh⁵ = S5 gating shift + faster recovery. Directly parameterizes genetic interventions.
- **Use in V1:** **intervention mapping** — Sh^KS133 → g_Shaker=0; Sh⁵ → activation/inactivation V₁/₂ shift + recovery-rate change, each with a molecular correlate.
- **Verified:** citation-only (unconfirmed). Matched: https://www.embopress.org/doi/pdf/10.1002/j.1460-2075.1990.tb07890.x ; https://pubmed.ncbi.nlm.nih.gov/... (FlyBase FBrf0051669)

### gouwens-wilson-2009 — Gouwens NW, Wilson RI (2009). Signal propagation in Drosophila central neurons. J Neurosci 29(19):6239–6249. DOI 10.1523/JNEUROSCI.0764-09.2009 (ModelDB 118662; OSB)
- **Key result / content:** Passive compartmental model of adult antennal-lobe **projection neurons (PNs)**; deduces passive membrane properties, shows PNs are electrotonically extensive, spikes initiate in the proximal axon, true resting potential more hyperpolarized than measured (electrode seal artifact), a **leak Na** conductance contributes to rest.
- **Usable quantities (Verified from ModelDB 118662 `fit_params.hoc`):** R_i=80 Ω·cm, C_m=1 µF/cm², R_m=10000 Ω·cm² (leak), plus an electrode model (R_e=30 MΩ, C_e=0.001). NeuroML2 port on OpenSourceBrain.
- **Use in V1:** the **passive/electrotonic embedding** for an adult central neuron (channel-free baseline for the cable/morphology tier).
- **Verified:** yes — cloned https://github.com/ModelDBRepository/118662 and https://github.com/OpenSourceBrain/Drosophila_Projection_Neuron (readme + hoc read).

### augustin-2019-GFS — Augustin H, Zylbertal A, Partridge L (2019). A computational model of the escape response latency in the Giant Fiber System of Drosophila melanogaster. eNeuro 6(2):ENEURO.0423-18.2019. DOI 10.1523/ENEURO.0423-18.2019 (ModelDB 245415)
- **Key result / content:** NEURON conductance-based model of the multi-neuron **Giant Fiber System** (GF, TTMn, PSI, DLMn) with rectifying gap junctions; reproduces age-associated escape-latency slowing. Active channels: transient Na (nat), persistent Na (nap), voltage-gated K (k) — **k.mod, nat.mod, nap.mod explicitly "Adapted from Günay et al., 2015."**
- **Usable quantities (Verified from ModelDB 245415 `.mod` + `gfpn.py`):** k channel (Shaker/Ks-lineage) m∞ V₁/₂=−12.85, k=−19.91 (i.e. the Günay **Ks** delayed rectifier), τ=1; nat V₁/₂,m=−29.13, V₁/₂,h=−47; default densities gnatbar=0.3, gnapbar=1.1e-4, gkbar=0.01 S/cm², g_gap=135 nS, temp 25 °C.
- **Use in V1:** a **multi-neuron circuit** embedding reusing the Günay channel lineage; gap-junction + density parameter scans; an **ageing** intervention (gap-junction conductance).
- **Verified:** yes — cloned https://github.com/ModelDBRepository/245415 (mod files + Python read).

### wicher-2001-review — Wicher D, Walther C, Wicher C (2001). Non-synaptic ion channels in insects — basic properties of currents and their modulation in neurons and skeletal muscles. Prog Neurobiol 64(5):431–525. DOI 10.1016/S0301-0082(00)00066-6 (PMID 11301158)
- **Key result / content:** Comprehensive review of insect (incl. *Drosophila*) non-synaptic ion channels and currents; a secondary source that tabulates many channel properties and pharmacology across insect preparations.
- **Usable quantities:** review-level cross-references and property ranges (use only to locate primary sources).
- **Use in V1:** orientation / gap-filling reference; not a primary parameter source.
- **Verified:** citation-only (unconfirmed). Matched: https://pubmed.ncbi.nlm.nih.gov/11301158/

---

## Thread 3 — Public model code (what we can clone and read)

All rows below were **cloned into the scratchpad and read locally** this session (GitHub reachable; ModelDB/OSB/senselab blocked). GitHub MCP `get_file_contents` is limited to this session's own repo, so use `git clone https://github.com/<org>/<repo>` for any of these.

| key | repo (clone URL) | accession | paper | language | license | channel mechanisms (readable) |
|---|---|---|---|---|---|---|
| gunay-code | github.com/cengique/drosophila-aCC-L3-motoneuron-model (= github.com/ModelDBRepository/152028) | ModelDB 152028 | Günay 2015 PLoS CB | XPP + NEURON(hoc) + **NeuroML2** + MATLAB | **none stated** | Kf (Shaker/Shal A-type, m⁴·(0.95h₁+0.05h₂)), Ks (Shab-like, m⁴), NaT, NaP (O'Dowd; Lin) |
| smith-LNv-code | github.com/ModelDBRepository/263199 | ModelDB 263199 | Smith 2019 J Physiol | MATLAB | **none stated** | **Shaker(KV1), Shab(KV2), Shaw(KV3), Shal(KV4)**, Na, Ca, leak — all 4 Kv genes separated |
| smith-tremor-code | github.com/ModelDBRepository/263196 | ModelDB 263196 | Smith 2018 Sci Rep | MATLAB | **none stated** | same 4-Kv set + **particle-swarm HH fitter** |
| megwa-code | github.com/ModelDBRepository/267620 | ModelDB 267620 | Megwa 2023 Front Neurosci | **Python** | **none stated** | Kf, Ks, NaT, NaP + Na/K pump (single compartment) |
| photoreceptor-code | github.com/JuusolaLab/SK_Slo_Paper (= github.com/ModelDBRepository/263042) | ModelDB 263042 | Li … Juusola 2019 J Neurosci | MATLAB (dynamic clamp) | **GPL-3.0** | **Shaker (m³·h, 2-component h), Shab (n²·h), "novel" non-inactivating K**, Cl leak — explicit Boltzmann + τ, Hardie-1991 fits, Q10=1.35 |
| gouwens-code | github.com/ModelDBRepository/118662 ; github.com/OpenSourceBrain/Drosophila_Projection_Neuron | ModelDB 118662 | Gouwens & Wilson 2009 | NEURON(hoc/mod) + NeuroML2 | **none stated** | passive (LeakConductance.mod) + electrode model; R_i=80, C_m=1, R_m=10000 |
| augustin-code | github.com/ModelDBRepository/245415 | ModelDB 245415 | Augustin 2019 eNeuro | **Python** + NEURON(mod) | **none stated** | nat, nap, k (all "adapted from Günay 2015"), gap2 (rectifying gap junction) |
| kenyon-pelz-code | github.com/ModelDBRepository/34560 | ModelDB 34560 | Pelz 1999 (honeybee) | SNNAP | **none stated** | IA (Shaker-like), Kv, Na — full Boltzmann/τ |
| kenyon-wust-code | github.com/ModelDBRepository/42022 | ModelDB 42022 | Wüstenberg 2004 (honeybee) | SNNAP | **none stated** | KaF, KaS (Shaker-like A), Kv, Na, Na2 |
| jrieke-analysis | github.com/jrieke/drosophila-dynamics | — | (bachelor thesis on Günay model) | Python (notebooks) | check repo | bifurcation analysis of the Günay aCC model (no new channels) |

Notes:
- **License caveat:** only the JuusolaLab photoreceptor code carries an explicit license (**GPL-3.0**). All the ModelDB-mirror repos with "none stated" are governed by ModelDB's terms (research/academic use; cite the paper) — treat as read/reference-only and re-derive rather than redistribute if licensing matters.
- **NeuroML/OSB:** `github.com/cengique/…` and `github.com/OpenSourceBrain/Drosophila_Projection_Neuron` provide **NeuroML2 + LEMS** ports (validated against the originals via OMV) — the cleanest simulator-agnostic form of the Günay channels and PN morphology.
- **No Markov/Shaker (ZHA/Schoppa) code** was found on GitHub or in `org:ModelDBRepository` (searched "Zagotta", "Schoppa", "Shaker"+Markov, NMODL). The rich-Markov tier will have to be implemented from the JGP papers.
- **`ModelDBRepository`** hosts ~2011 repos total (repo name = accession); the full-text mirror `github.com/biosimulations/biosimulations-modeldb` additionally carries some papers' JATS XML (that is how Günay 2015 was read).

---

## Thread 4 — Held-out experimental observations (numbers, with sources and confidence)

Confidence key: **[V]** cross-checked (read in code and/or two consistent sources); **[s]** single WebSearch snippet (re-verify against primary); **[!]** could not verify a number, pointer only.

**Shaker activation (heterologous / oocyte, room temp):**
- Total gating charge **12–16 e₀** per channel [s] (ZHA-II); independent measures **12.3 e₀** (Schoppa 1992), **13.6 e₀** (Aggarwal & MacKinnon 1996), **12–14 e₀** (Seoh 1996) [s]. **≥5 sequential steps**, **~3.5 e₀/transition** [s] (ZHA-II).
- Half-activation V₁/₂ of oocyte Shaker H4 ≈ **−14.4 ± 3.9 mV** (n=22) [s]; note strong construct/prep dependence (Q–V component midpoints −63/−44 mV from gating currents, Bezanilla 1994 [s]). **Slope**: not cleanly extractable this session **[!]** — read from ZHA/Schoppa G–V tables.
- **Photoreceptor** (native) Shaker operates far more negative: activation threshold ≈ **−90 mV**, half-inactivation ≈ **−70 mV** [s] (Hardie 1991) — do not equate with oocyte values.
- **Larval-motoneuron HH A-type (Kf)** V₁/₂,act = **−17.55 mV**, k=−7.27; inactivation V₁/₂ = **−45 mV** (+ a −44.2 mV/1.5 slope second component) [V] (Günay 2015, read from full-text XML + code).

**Shaker inactivation kinetics:**
- **N-type** macroscopic inactivation τ ≈ **3–10 ms** (≈3–5 ms at 0 mV) for ShH4 [s]; a "few ms" mechanism (Hoshi 1990). Fast component highly temperature-dependent (Q₁₀ ≈ 7.2, 5–20 °C) [s] (Nobile 1997).
- **Recovery** from N-type inactivation τ ≈ **23 ± 3 ms at −90 mV** (fast component; multi-exponential, deactivation-coupled) [s] (Kuo 1997).
- **C-type** inactivation: slow (**seconds**), ~voltage-independent −25→+50 mV [s] (Hoshi 1991); external-K⁺-dependent, τ ≈ **1.4 s (low K⁺) → 2.6 s (~140 mM K⁺)** [s] (Lopez-Barneo 1993, snippet — re-verify).

**Temperature / Q₁₀ (Shaker, 5–20 °C unless noted):**
- Activation τ **Q₁₀ ≈ 3.14**; inactivation-decay τ **Q₁₀ ≈ 7.20**; peak amplitude **Q₁₀ ≈ 1.51**; recovery **Q₁₀ ≈ 1.57** [s] (Nobile 1997). Ionic-current kinetics **Q₁₀ > 4**; opening step weakly T-dependent, closing strongly T-dependent (Q₁₀ > 4) [s] (Rodríguez 1998). (Photoreceptor models use a lumped Q₁₀ ≈ **1.35** for 20→25 °C [V], Li 2019 code.)

**Pharmacology (Shaker, oocyte):**
- **External TEA**: IC₅₀ ≈ **27 mM** for WT (Thr449); T449Y ⇒ Kd ≈ **0.59 mM** [s] (Heginbotham & MacKinnon 1992/MacKinnon-Yellen 1990). Voltage-dependent block with Thr449.
- **4-AP**: IC₅₀ ≈ **170 µM** (WT Shaker) [s]; binds an inner-pore hydrophobic cavity (S5/S6), stabilizes closed state (recent closed-state modelling). (Older insect-tissue work uses mM 4-AP to remove IA.)
- **Charybdotoxin**: Kd ≈ **3.6 nM** (Shaker H4, oocyte); blocks open and closed states, no gating change; block enhanced at low ionic strength [s] (MacKinnon, Reinhart & White 1988).
- **α-Dendrotoxin**: blocks the **Shaker** portion of native fly MN5 IA (the Shal portion is α-DTX-insensitive) [s] (Ryglewski & Duch 2009); mammalian Kv1.1/1.2 IC₅₀ 0.4–12 nM for scale.

**Single-channel conductance:**
- Native/expressed Shaker A-channel: sublinear, saturating conductance (~ up to ~20 pS regime in physiological K⁺; ~ saturating by 0.6 M) [s] (Heginbotham & MacKinnon 1993). A "126 pS in symmetric K⁺" figure surfaced in one snippet but is **ambiguous/possibly a different channel** — **[!] do not use without the primary.** Fly neuronal single-channel: **Shal ≈ 4 pS, Shaw ≈ 42 pS, Shab ≈ 11 pS** [s] (Tsunoda & Salkoff 1995a).

**Whole-cell current amplitudes / passive props (native fly cells):**
- Larval aCC/RP2 motoneuron capacitance ≈ **12 pF** (11.9–12.1) [s] (Marley & Baines 2011); Günay 2015 morphology total C ≈ **29.7 pF**, R_a=212 Ω·cm, C_m=0.77 µF/cm² [V].
- aCC/RP2 carry two K⁺ conductances **IKfast (Shaker/Shal-type) + IKslow (Shab-type)** plus Na, Ca [s] (Baines & Bate 1998; Rohrbough & Broadie 2002).
- Photoreceptor IKs half-inact ≈ **−40 mV**, τ_inact ≈ **500 ms**; IA half-inact ≈ **−70 mV** [s] (Hardie 1991).
- Kenyon-cell (honeybee, Shaker-like IA): half-act **−0.7 mV**, half-inact **−54.7 mV**, τ_act ≈ **0.4 ms**, τ_inact ≈ **3.0 ms** at +45 mV [V] (Pelz 1999, code + snippet).

**Downstream (response-tier) hold-outs:**
- Shaker loss → **~50 %** drop in photoreceptor information capacity (light-adapted) [s] (Niven 2003).
- Firing-class switches on channel block: 4-AP (IA) delayed→damping; quinidine (Shab IK) tonic→damping [s] (Peng & Wu 2007).

---

## Thread 5 — Candidate interventions → parameter mapping

Each row: the real experiment, the model parameter it maps to, and a source. Preferred first targets are the ones with a **readable** parameter/code anchor.

| Intervention (real experiment) | Maps to (model parameter) | Fidelity tier(s) touched | Source(s) |
|---|---|---|---|
| **Voltage-clamp protocol change** (holding V, step V, prepulse) | driving input V(t); prepulse sets inactivation state occupancy | all tiers | Günay 2015 (−90/−10 mV prepulses isolate Kf) [V]; ZHA/Schoppa protocols |
| **Current injection / step** (f–I, rheobase) | I_inj(t) into membrane eq. | HH neuron, response | Günay 2015; Megwa 2023 code [V] |
| **Channel density change** (Sh⁺ gene dosage; over/under-expression) | g_Shaker (gmax) scaling | HH, current | Haugland & Wu 1990 (dosage↔IA amplitude) [s]; Günay Table 6 g's [V] |
| **Shaker genetic loss** (Sh^KS133, Sh¹⁴, Sh^rKO, RNAi/DN) | g_Shaker → 0 (remove A-type / its Shaker fraction) | all | Lichtinghagen 1990 (Sh^KS133=IA loss) [s]; Niven 2003 (Sh¹⁴) [s]; Ryglewski 2009 (Shaker-DN) [s] |
| **Shaker activation shift** (Sh⁵, S5 missense) | ΔV₁/₂,act (depolarizing) + Δk | Markov (per-subunit steps), HH | Wu & Haugland 1985; Lichtinghagen 1990 (Sh⁵) [s] |
| **Isolate final concerted step** (ILT: V369I/I372L/S376T) | right-shift + shallow G–V; separate final ~1.8 e₀ step | Markov (concerted opening) | Ledwell & Aldrich 1999 [s] |
| **Alter N-type inactivation** (Δ6–46 removal; ShB peptide; splice ShA/ShB/ShD) | k_on/k_off of O⇌I (or remove h) | Markov, HH inactivation | Hoshi 1990; Zagotta 1990 (peptide); Iverson & Rudy 1990 [s] |
| **Alter recovery from inactivation** (Sh⁵ faster recovery; holding V) | recovery rate (I→C), deactivation coupling | Markov, HH | Kuo 1997; Lichtinghagen 1990 [s] |
| **Extracellular [K⁺] change** | E_K (Nernst) **and** C-type inactivation rate (slowed by high K⁺ₒ) | current, Markov C-type | Lopez-Barneo 1993 [s]; Nernst |
| **Temperature / Q₁₀** | scale all rate constants by Q₁₀^((T−T₀)/10), per-transition (opening vs closing asymmetric) | Markov, HH | Nobile 1997; Rodríguez 1998 [s]; Li 2019 code Q₁₀=1.35 [V] |
| **4-AP block** (IA / Shaker+Shal) | open-/closed-state block; reduce g_A (IC₅₀ ~170 µM) | current, HH | Peng & Wu 2007; 4-AP IC₅₀ [s] |
| **External TEA block** | pore block; reduce g (IC₅₀ ~27 mM WT; 0.59 mM T449Y) | current | Heginbotham & MacKinnon 1992 [s] |
| **Charybdotoxin block** | open+closed pore block, Kd ~3.6 nM | current | MacKinnon 1988 [s] |
| **α-Dendrotoxin / phrixotoxin-2** (native fly) | selectively remove Shaker (α-DTX) vs Shal (PaTx-2) fraction of IA | current, HH | Ryglewski & Duch 2009 [s] |
| **Shab loss / block** (Shab mutant; quinidine) | g_Shab (delayed rectifier) → 0/reduced | current, HH, response | Tsunoda & Salkoff 1995b; Peng & Wu 2007; Vähäsöyrinki 2006 [s] |
| **Ageing** (GFS gap-junction decline) | g_gap reduction (+ latency) | circuit | Augustin 2019 [V, code] |
| **Combinations** (e.g. Sh⁻ + high K⁺ + 4-AP) | joint parameter edits | all | as above |

---

## V1 resource shortlist

### (a) Model code we can reuse (repo, accession, license, mechanisms)
1. **Larval motoneuron, Python, single compartment — best first simulator.** `github.com/ModelDBRepository/267620` (ModelDB 267620, Megwa 2023; license: none stated / ModelDB terms). Kf (Shaker/Shal A-type), Ks (Shab-like), NaT, NaP, Na/K pump. Channel→current→voltage→spiking in one readable Python file. **[Verified]**
2. **Larval motoneuron, full channel provenance + NeuroML2 — parameter source.** `github.com/cengique/drosophila-aCC-L3-motoneuron-model` (ModelDB 152028, Günay 2015; no license). XPP + NEURON + **NeuroML2/LEMS** ports; Kf/Ks/NaT/NaP. Full HH tables read from the mirrored paper (below). **[Verified]**
3. **Gene-separated 4-Kv clock neuron — the only Shaker/Shab/Shaw/Shal-resolved model.** `github.com/ModelDBRepository/263199` (+ `/263196` with a particle-swarm HH fitter) (Smith 2019/2018; no license). MATLAB. **[Verified]**
4. **Photoreceptor, GPL-3.0, gene-separated Shaker/Shab/novel — best-licensed.** `github.com/JuusolaLab/SK_Slo_Paper` (= ModelDB 263042, Li 2019). Explicit Boltzmann + τ equations, Q₁₀. Graded-potential (non-spiking) embedding. **[Verified]**
5. **Adult PN passive/electrotonic embedding.** `github.com/ModelDBRepository/118662` + `github.com/OpenSourceBrain/Drosophila_Projection_Neuron` (Gouwens & Wilson 2009). NEURON + NeuroML2. **[Verified]**
6. **Circuit + ageing.** `github.com/ModelDBRepository/245415` (Augustin 2019). Python/NEURON, gap junctions, Günay-lineage channels. **[Verified]**
7. **Honeybee Kenyon-cell Shaker-like IA (cross-species HH check).** `github.com/ModelDBRepository/34560` (Pelz 1999), `…/42022` (Wüstenberg 2004). SNNAP. **[Verified]**
- **Gap:** no public **Markov** (ZHA/Schoppa) Shaker code found — implement from the JGP papers.

### (b) Parameter tables

**(b1) Shaker Markov model — structure known, rate table NOT readable this session.** Target: **ZHA "Scheme 3"** (two per-subunit activation steps ×4 + concerted opening; ~12–16 e₀ total, ~3.5 e₀/step, single open state) [ZHA I–III] **or** **Schoppa–Sigworth "3+2′"** (3 per-subunit charge steps ×4 + 2 concerted). **The α/β/γ/δ zero-voltage values and partial charges must be read from:** Zagotta 1994 III (JGP 103:321, Tables of the "adequate" model), Zagotta 1994 II (JGP 103:279), and Schoppa–Sigworth 1998 III (JGP 111:313, WT + V2 parameter tables). Inactivation add-ons: N-type O⇌I block (Hoshi 1990; recovery τ≈23 ms/−90 mV, Kuo 1997); C-type slow state (Hoshi 1991; K⁺ₒ-dependent, Lopez-Barneo 1993). **Do not fabricate — these tables are the one missing piece; retrieve from a publisher-enabled session or library.**

**(b2) HH Shaker / Shab / Shal — readable parameter sets (Verified).**

*Larval motoneuron (Günay 2015; E_K=−80, E_Na=+45 mV; V in mV, τ in ms):*
| Current (gene) | p | V₁/₂,m | kₘ | τₘ(V) | V₁/₂,h | k_h | τ_h(V) | gmax (isopotential) |
|---|---|---|---|---|---|---|---|---|
| **Kf = Shaker/Shal IA** | 4 | −17.55 | −7.27 | 1.94+2.66/(1+exp((V−8.12)/7.96)) | −45 | 6 | 1.79+515.8/(1+exp((V+147.4)/28.66)); + 2nd comp. V₁/₂=−44.2,k=−1.5,τ=116 ms; h=0.95h₁+0.05h₂ | 24.1 nS |
| **Ks = Shab-like IK** | 4 | −12.85 | −19.91 | 2.03+1.96/(1+exp((V−29.83)/3.32)) | — | — | non-inactivating | 50 nS |
| NaT | 3 | −29.13 | −8.92 | 0.13+3.43/(1+exp((V+45.35)/5.98)) | −47 | 5 | 0.36+exp((V+20.65)/−10.47) | 100 nS |
| NaP | 1 | −48.77 | −3.68 | 1 | — | — | — | 0.8 nS |
(C=4 pF, g_leak=6.8 nS, E_leak=−55 mV.)

*Clock neuron, gene-separated (Smith 2019; E_K=−90, E_Na=52, E_Ca=132, E_leak=−7 mV; m∞=1/(1+exp(−(V−V₁/₂)/k))):*
| Kv (gene) | V₁/₂,act | k_act | V₁/₂,inact | k_inact | gmax | m/h powers |
|---|---|---|---|---|---|---|
| **Shaker (KV1)** | −34.18 | 9.75 | −93.19 | 54.49 | 2.35 | m⁴h¹ |
| **Shab (KV2)** | −29.69 | 10.49 | (−54.11) | (22.48) | 0.86 | m⁴h⁰ (non-inact.) |
| **Shaw (KV3)** | −57.30 | 14.63 | −25.82 | 2.50 | 1.40 | m⁴h¹ |
| **Shal (KV4)** | −48.63 | 7.65 | −43.06 | 1.73 | 1.25 | m⁴h¹ |
(τ_m=A·exp(−((V−b)/c)), coefficients in `MODEL.mat`; treat shallow k_inact values as phenomenological.)

*Photoreceptor, gene-separated (Li 2019, GPL; Boltzmann [g/gmax]=1/(1+exp((V₅₀−V)/s)); E_K=−85 mV; Q₁₀=1.35):*
| Conductance (gene) | V₅₀,act | s_act | V₅₀,inact | s_inact | gmax (S/cm²) | powers |
|---|---|---|---|---|---|---|
| **Shaker** | −23.7 | 12.8 | −55.3 (80 %) / −74.8 (20 %) | −3.9 / −10.7 | 0.8e-3 (+0.087e-3 non-inact. fraction) | m³h |
| **Shab (delayed rect.)** | −1.0 | 9.1 | −25.7 | −6.4 | 3e-3 | n²h; τ_inact≈1200 ms |
| **"novel" K** | −14.0 | 10.6 | — | — | 0.11e-3 | non-inactivating |
(Cell-body area 1.57e-5 cm²; fits from Hardie 1991, Hevers & Hardie 1995.)

*Honeybee Kenyon-cell Shaker-like IA (Pelz 1999, cross-species; E_K=−85 mV):* m∞ V₁/₂=−0.7, s=16.1; h∞ V₁/₂=−54.7, s=7.0; g=0.028 µS; m¹h¹; τ_act 0.35–1.65 ms, τ_inact 2.5–90 ms.

### (c) Held-out experimental observations (5–10, with numbers)
1. Shaker total gating charge **12–16 e₀** (ZHA); ~**3.5 e₀**/transition; ≥5 steps [s].
2. Oocyte Shaker H4 half-activation ≈ **−14 mV** [s]; photoreceptor Shaker threshold ≈ **−90 mV**, half-inact ≈ **−70 mV** [s].
3. N-type inactivation τ ≈ **3–10 ms** (0 mV, 3–5 ms) [s]; recovery τ ≈ **23 ms at −90 mV** [s].
4. C-type inactivation **seconds**, ~V-independent −25→+50 mV; **slowed by high external K⁺** (≈1.4→2.6 s) [s].
5. Q₁₀ (5–20 °C): activation **3.14**, inactivation-decay **7.2**, amplitude **1.51**, recovery **1.57** [s].
6. External **TEA IC₅₀ ≈ 27 mM** (WT), **4-AP IC₅₀ ≈ 170 µM**, **charybdotoxin Kd ≈ 3.6 nM** [s].
7. Neuronal single-channel: **Shal 4 pS, Shaw 42 pS, Shab 11 pS** [s]; Kenyon IA half-act −0.7 / half-inact −54.7 mV, τ 0.4/3.0 ms [V].
8. Shaker loss → **~50 %** photoreceptor information-capacity drop [s]; larval aCC/RP2 capacitance ≈ **12 pF** [s].

### (d) Intervention → parameter mapping
See the Thread-5 table above (17 mapped interventions, each with parameter and source; readable-anchor interventions preferred: current injection, density scaling, Shaker loss, temperature/Q₁₀, gap-junction ageing).

### (e) Best result to reproduce first, and what "reproduced" means
**Primary recommendation — Günay 2015 aCC/MN1-Ib larval motoneuron f–I and voltage-clamp responses**, because it is the one target where **both the HH parameters and runnable code are readable and license-free-enough to reuse**, and the paper's full text (with figures/tables) was machine-readable this session.
- **"Reproduced" quantitatively:** implement the isopotential HH model (Table 5 gating + Table 6 conductances, C=4 pF) and (i) match the paper's simulated voltage-clamp K⁺-current traces for the −90 mV / −10 mV prepulse protocol (Fig 1D) — the fast (Kf) component should inactivate after the −10 mV prepulse; (ii) reproduce the isopotential f–I curve and the two-compartment model's spike-height/voltage-offset signature; (iii) confirm the NeuroML2 port matches the XPP/NEURON output (the repo's own OMV tests already assert this — a built-in reproduction check). Success metric: RMS deviation of the K⁺ current I–V and the f–I curve within the paper's plotted spread. Cross-validate the Python Megwa 2023 build (same channels) as an independent implementation.
- **Secondary target — the honeybee Kenyon Shaker-like IA (Pelz 1999)**: reproduce **half-act −0.7 mV, half-inact −54.7 mV, τ_act ≈0.4 ms, τ_inact ≈3.0 ms at +45 mV** — a small, fully specified, self-consistent HH fit (numbers match between paper and code), ideal as a first end-to-end sanity check of the HH tier.
- **Stretch target (rich-Markov tier)** — once the ZHA/Schoppa rate tables are retrieved, reproduce the ShBΔ6–46 macroscopic activation time course and steady-state P_open(V) with a single parameter set (ZHA III's own success criterion). This cannot be started until the rate constants are read from JGP.

### (f) Caveats
- **Temperature:** oocyte Shaker gating characterized at ~room temp / 2–22 °C (ZHA, Rodríguez, Nobile); native fly recordings ~20–25 °C. Any transfer needs Q₁₀ scaling (Q₁₀ ~3 activation, ~7 inactivation; or the lumped 1.35 used in photoreceptor code). State Q₁₀ per transition, not globally.
- **Cell type & gene identity:** "IA" is **Shaker** in muscle, but predominantly **Shal** in embryonic/central neurons and **Shaker+Shal** in MN5/Kenyon cells. Do not assume a fly-neuron A-current is Shaker. The Günay "Kf" is a Shaker/Shal composite, not pure Shaker.
- **Expression system vs native:** oocyte-expressed Shaker (V₁/₂ ≈ −14 mV) operates ~50 mV positive to native photoreceptor Shaker (threshold ≈ −90 mV) — β-subunits (Hyperkinetic), splice variant, phosphorylation and lipid environment shift gating. Markov rate constants from oocytes are a starting prior, not the native truth.
- **Splice variants:** ShA/ShB/ShC/ShD differ mainly in N- and C-termini → different N-type inactivation and C-type rates (Iverson & Rudy 1990; Hoshi 1991). Fix the variant when comparing to a specific dataset.
- **Space clamp / recording artifacts:** native fly neurons are electrotonically extensive with high input resistance; somatic voltage clamp of distal (axonal) channels is imperfect (Gouwens 2009; Günay 2015 explicitly models electrode seal + a second compartment). Whole-cell "V₁/₂" from these cells carries space-clamp error — prefer oocyte biophysics for gating shape, native data for densities and embedding.
- **Verification debt:** every **[s]** number and every Thread-1 rate reference is snippet-sourced because publishers were blocked; re-verify against the primary PDFs before manuscript use. The Lopez-Barneo 1.4/2.6 s C-type figures and the "126 pS" single-channel value are specifically flagged as unconfirmed.

---

### Retrieval appendix (how to get the missing Markov rate tables when publisher access returns)
- ZHA III rate table: **J Gen Physiol 103(2):321–362**, the "adequate" scheme's parameter table (PMC2216839). ZHA II charge/step: **103(2):279–319** (PMC2216838).
- Schoppa–Sigworth III WT+V2 parameters: **J Gen Physiol 111(2):313–342** (PMC2222769); Papers I (111:271) & II (111:295) give the constraining data.
- Bezanilla–Perozo–Stefani sequential model: **Biophys J 66(4):1011–1021** (PMC1275808).
- ILT final-step charge: **Ledwell & Aldrich 1999, J Gen Physiol 113(3):389–414**.
- Temperature scaling: **Rodríguez 1998, JGP 112(2):223–242**; **Nobile 1997, Exp Brain Res 114(1):138–142** (BioNumbers BNID 100374/100378/100382).
- All are also mirrored (JATS XML for some) under `github.com/biosimulations/biosimulations-modeldb` — worth a targeted `git clone` + grep for the exact PMC IDs if that repo carries them (only Günay 2015 / pcbi.1004189 confirmed present this session).
