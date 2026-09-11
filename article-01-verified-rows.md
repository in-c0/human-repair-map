# Article 01 — verified rows (CNS delivery, as of 2026-07-27)

Verification run 2026-07-27 by five parallel web-search agents against primary
sources (peer-reviewed papers, regulator announcements, ClinicalTrials.gov).
This file is the evidence base for [article-01-spec.md](article-01-spec.md).

**Every claim below still needs a human to open the cited source before it ships
in public.** The agents searched and quoted primary sources, but agent output is
itself a claim, not a citation. Treat this as a strong, sourced draft — not
verified-to-publish. Where an agent wrote "no independent evidence located",
that phrasing is preserved verbatim and is a finding, not a gap.

Rubric (from the spec): L0 proposed · L1 in vitro/organoid · L2 rodent in vivo ·
L3 large animal/NHP · L4 human single group · L5 human, independently replicated
by an unaffiliated group.

---

## The headline finding

**Not a single route achieves L5 for broad, cell-typed CNS delivery. Nothing on
the map is both broad and proven-in-humans.** Two things reach L5, and both are
narrow:

- **FUS + microbubbles reaches L5 for *opening* the barrier** — reversibly,
  repeatably, safely, replicated by ≥6 unaffiliated groups. But L5 is for the
  *opening*, not for a drug-delivery *outcome*: no randomised trial has yet shown
  FUS drug delivery improves a clinical endpoint (SONOBIRD, n=560 RCT, reads out
  ~end-2026).
- **Locoregional CAR-T (into the ventricle/cavity) reaches L5 for the route** —
  four unaffiliated centres, 300+ infusions, real functional responses. But the
  *route* is replicated, not the *efficacy* per target, and every response-
  generating programme delivers directly into CSF/cavity. IV dosing is what
  produced the dose-limiting toxicity, not the responses.

Everything else that is "approved" is approved on a **spinal-cord target**
(nusinersen), a **surrogate biomarker** (tofersen NfL; tividenofusp CSF heparan
sulfate; trontinemab amyloid PET), or an **anatomically-favourable single
target** (Brineura periventricular; Kebilidi one nucleus). **No approved product
demonstrates broad, uniform CNS biodistribution in humans.**

That sentence is the article. Everything below supports it.

---

## The worked example — the capsid drift (this is the centrepiece)

The claim I flagged from memory is **confirmed, and stronger than I stated.**

- **PHP.B/PHP.eB cross the BBB and broadly transduce CNS after IV in mice** —
  confirmed, **L2**, independently replicated (Hordeaux/UPenn, Batista/UMass,
  both unaffiliated with the Gradinaru/Caltech originators).
- **The mechanism is the LY6A receptor** — confirmed, L2. **LY6A has no human
  ortholog.** The receptor the whole effect runs through does not exist in people.
- **Strain-specific** — confirmed, L2. Permissive in C57BL/6J and several others;
  fails in BALB/c, A/J, C3H and more. The determinant is the *Ly6a* allele, not
  the strain name — a correction worth making precisely.
- **Failed to translate to primates by the IV route** — confirmed, **L3, by
  three mutually unaffiliated NHP groups** (Gunma marmoset; UPenn rhesus; Oregon
  NPRC macaque). Important nuance that makes the map *more* credible, not less:
  Liguore 2019 found PHP.B *does* give broad macaque CNS transduction by the
  **intrathecal** route — so "PHP.B doesn't work in primates" over-generalises a
  *route-specific* (intravascular) failure. State it precisely or not at all.

**The part memory did not have, and the reason this is the centrepiece:**

- The *next*-generation capsids built to fix this (CAP-B10/B22, AAV-F, PHP.eB)
  **failed to reproduce** in a standardised 10-year marmoset IV panel (Matsuzaki,
  bioRxiv Dec 2025 — preprint, not peer-reviewed; flag that).
- Human-receptor-targeted capsids (BI-hTFR1, Deverman/Broad, *Science* 2024) work
  in **humanised-TfR mice** (L2) and human brain endothelial cells (L1); **cannot
  be tested in wild-type NHP; no independent replication located as of
  2026-07-27.**
- **As of 2026-07-27, no engineered BBB-crossing AAV capsid is in an active human
  trial.** Exactly one human was ever IV-dosed with one (Capsida CAP-002,
  STXBP1; NCT06983158, n=1 actual). **That patient died** (~Sept 2025); Capsida
  announced a **voluntary** pause 2025-09-11; the trial was **terminated** (CT.gov
  updated 2026-06-10, reason "stopping rule met"); the Jan-2026 autopsy gave
  cerebral edema, underlying cause not established. Precision note, corroborated
  by a second independent sweep: whether the late-Sept-2025 clinical hold was
  **FDA-imposed or sponsor-imposed is not established in any primary source** —
  do not write "FDA clinical hold". The sister program CAP-003 (GBA1 Parkinson's,
  NCT07011771) was **withdrawn, never dosed**, after the death.

So the worked example is: *a capability demonstrated four-log-strong in a mouse,
running through a receptor humans don't have, that has failed every primate IV
test by independent groups, and whose one human exposure ended in death and
termination — is routinely described in reviews and press as "an AAV that
crosses the blood-brain barrier."* That is drift, measured, with a body count.
No other row makes the point this hard.

---

## The rows

### Systemic / BBB-crossing (the hard problem)

| Route | State | Level | Independent replication? | Drift |
|---|---|---|---|---|
| Engineered AAV capsid, IV (PHP.B family) | broad in permissive mice; failed primate IV; 0 in active human trials; 1 human dosed → died | L2 mouse / L3 NHP-negative | **yes** (mouse effect; and NHP failure by 3 groups) | "an AAV that crosses the BBB" — via a receptor humans lack |
| Human-TfR-targeted capsid (BI-hTFR1) | humanised-mouse only | L2 (+L1) | no | promising engineering, zero human data |
| Systemic AAV9 (Zolgensma) | approved SMA; human CNS transduction shown | **L4** | **no** — one sponsor-affiliated n=2 autopsy | "proves IV AAV9 transduces human CNS" rests on 2 deceased infants, liver 300–1000× > CNS |
| TfR receptor-mediated transcytosis (Denali tividenofusp) | **FDA approved Mar 2026** (MPS II) | L4 | no (concept cross-confirmed by JCR) | approval is on **CSF heparan sulfate**, a surrogate; no proven cognitive benefit; no human measurement of enzyme in parenchyma |
| TfR fusion (JCR pabinafusp) | approved **Japan only** 2021 | L4 | no | cognitive claim is post-hoc subgroup, open-label, n=28 |
| Brainshuttle (Roche trontinemab) | Phase 3 ongoing; not approved | L4 | no | amyloid PET cleared; **zero evidence it slows decline**; "10–50× brain uptake" is a mouse/NHP number |
| LNP to brain, systemic | rodent only | **L2** | yes (rodent) | "LNPs cross the BBB" = reporter mRNA in mouse brain; the one human GBM trial delivers immune signalling, not cargo |
| Intranasal / nose-to-brain | trace, variable human CSF access; functional trial null | L4 access | contested; strongest independent human attempt **negative** | esketamine (systemic) is miscounted as proof; intranasal insulin for AD (SNIFF, n=289) **P=.98** |
| RMT brain-exposure fraction, human | **not established** | — | **no L5 anywhere** | field says "10–50× delivery"; only human number is one 0.8% CSF ratio, and CSF ≠ parenchyma |

### Direct-access (bypass the BBB surgically or via CSF)

| Route | State | Level | Independent replication? | Drift |
|---|---|---|---|---|
| Intrathecal ASO (nusinersen) | approved 2016; real functional benefit | **L5** (function) | **yes** | benefit is on a **spinal-cord** disease; human autopsy shows steep caudo-rostral gradient, little in cortex — not "CNS-wide delivery" |
| Intrathecal ASO (tofersen) | **accelerated** approval 2023 | L4 | no | approved on **NfL surrogate**; Phase 3 **missed** the clinical endpoint |
| ICV enzyme replacement (Brineura) | approved 2017; slows decline | **L5** (real-world cohorts) | **yes** | periventricular reach only — **retinal degeneration continues unchanged**, the cleanest human proof of incomplete distribution |
| Direct intraputaminal gene therapy (Kebilidi/Upstaza) | EU 2022 / FDA 2024 | L4 | route yes (Bankiewicz n=7), product no | covers one nucleus + projections; **one-shot, not repeatable**; zero distal distribution |
| FUS + microbubbles, BBB opening | opening confirmed in humans, safe, repeatable | **L5** (opening) | **yes** (≥6 unaffiliated groups) | "FUS gets drugs into the brain and extends survival" — opening is proven; the **outcome RCT does not yet exist** (SONOBIRD reads ~end-2026) |
| Convection-enhanced delivery (CED) | delivers intraparenchymally; both powered outcome trials **negative** | L4/L5 negative | outcome not replicated positive | "CED delivers drug to the target" — bypass is real, **verified coverage is the unsolved problem**; PRECISE catheters half-misplaced; GDNF RCT missed endpoint |
| Locoregional CAR-T (ICV / intracavitary) | real functional responses; strongest human readouts on the map | **L5** (route) | **yes** (4 unaffiliated centres) | "CAR-T reaches brain tumours" omits that every responding programme injects into ventricle/cavity; **IV dosing caused the DLTs, not the responses** |
| Engineered exosomes / EVs | rodent only; registry-only clinical footprint | **L2** | no (NHP attempt **negative**) | "clinical-stage platform" — entirely preclinical; FDA safety notice on unapproved products |

---

## What changed versus the spec's guesses

- **Nusinersen and tofersen are not one row.** One has real function (L5), one is
  a surrogate approval with a failed clinical endpoint (L4). Splitting them is
  itself a demonstration of the rubric working.
- **The best "solved next door" contrast is not liver-vs-brain.** It is
  *opening the barrier* (FUS, L5, solved) vs *delivering a molecule through it to
  a clinical outcome* (not established anywhere). Same physical act, opposite
  evidence state. Consider leading with this.
- **Two 2026 approvals I did not have: tividenofusp (Denali, Mar 2026) and the
  high-dose nusinersen regimen (Mar 2026).** Both real, both to verify.
- **LNP-to-brain and intranasal and exosomes are as weak as suspected** —
  intranasal is the sharpest, because the null trial (SNIFF, P=.98) and the
  miscounting of esketamine are both crisp, citable, and honest.

---

## Sources to open by hand before publishing (highest-value first)

1. Capsida community letter (the human death + termination) — capsida.com/stx-community-letter-5-9-2026/
2. Hordeaux 2018 *Mol Ther* (strain limit) + Liguore 2019 *Mol Ther* (the IT-vs-IV nuance)
3. Huang/Deverman *Science* 2024 (BI-hTFR1) and Matsuzaki bioRxiv 2025 (the failed replication — confirm it is still preprint)
4. Thomsen *Nat Med* 2021 (the n=2 Zolgensma human autopsy)
5. FDA tividenofusp approval + the CSF-HS surrogate designation language
6. Ramos *JCI* 2019 (nusinersen human autopsy gradient); tofersen VALOR primary-endpoint result
7. Brineura retinal-degeneration finding (the incomplete-distribution proof)
8. Lipsman *Nat Commun* 2018 + Woodworth *Lancet Oncol* 2025 (FUS) ; Kunwar *Neuro-Oncol* 2010 + Whone *Brain* 2019 (CED negatives)
9. Monje *Nature* 2025 + Brown *Nat Med* 2024 (locoregional CAR-T)
10. Craft SNIFF *JAMA Neurol* 2020 (the null intranasal insulin trial)
