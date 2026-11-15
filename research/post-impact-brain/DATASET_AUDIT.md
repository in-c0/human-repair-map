# Concussion / mTBI dataset access audit — 2026-11-15

Scope: post-impact neural-state observability research. **Metadata verified from provider pages; no raw EEG signal downloaded or independently inspected.** Dataset size and count refer to provider-reported metadata, not reproduced measurements.

| Candidate | Provider | Public license | Subjects / reported size | Paradigm / injury timing | Fit / limitation | Status |
|---|---|---|---|---|---|---|
| `on003522` (OpenNeuro `ds003522`) | [NEMAR](https://nemar.org/dataset/on003522) | CC0 | 96 / 25.4 GB | 3-stimulus auditory oddball + resting EEG; controls, subacute mTBI, chronic TBI; 3 sessions for controls and subacute cohort | **First candidate** for within-dataset evoked vs resting analysis; not collision-minute data | Published metadata/license confirmed; raw bytes not verified |
| `on005114` (OpenNeuro `ds005114`) | [NEMAR](https://nemar.org/dataset/on005114) | CC0 | 91 / 56.5 GB | DPX cognitive control EEG; first session **3–14 days post injury**; follow-ups ~2 and 4 months | Tests cognitive control response and trajectory; attrition; no immediate post-impact test | Published metadata/license confirmed; raw bytes not verified |
| `on003523` (OpenNeuro `ds003523`) | [NEMAR](https://nemar.org/dataset/on003523) | CC0 | 91 / 37.5 GB | Visual working memory, healthy vs subacute mTBI; **3–14 days** and follow-up ~4 months | Different task, potentially shared participants with other Cavanagh datasets; verify IDs before pooling | Published metadata/license confirmed; raw bytes not verified |
| TRACK-TBI / FITBIR | [TRACK-TBI](https://tracktbinet.ucsf.edu/track-tbi), [FITBIR](https://fitbir.nih.gov/content/access-data) | Controlled access, noncommercial research terms | TRACK-TBI ~3,000 across injury spectrum | Clinical history, CT/MRI, biospecimens, outcomes at weeks/months | Strong clinical phenotyping, but **not open raw data** and **not sideline seconds** | Public metadata only; PI-level institutional access approval required |

## Source and policy cautions
- NEMAR dataset pages report CC0 licensing and available CLI/manifest downloads. We attempted to obtain a small NEMAR metadata file in the current runtime but were unable to retrieve it; **availability on the website != local byte-level access confirmed**.
- Dataset labels usually refer to clinical mTBI categories. They are not proof of microscopic tissue damage. Healthy control vs mTBI classification must not be called biological ground truth.
- Count of distinct individuals across the three NEMAR sets is **unknown**; they may overlap. Verify subject IDs and acquisition details, and split by individual across *all* datasets before claiming external generalization.
- The NEMAR data do **not** validate seconds-to-minutes post-hit diagnosis, sport-specific field deployment or safety of return-to-play decisions.
- TRACK-TBI FITBIR access requires research use, institutional PI/authorized signatory and data-use review; current FITBIR policy lists a non-commercial research constraint. [FITBIR Access](https://fitbir.nih.gov/content/access-data).
- NINDS TBI CDE page notes FITBIR closing operations as of **2026-12-31**; FITBIR itself lists restrictions on non-NIH data as of 2026-08-24. Plan alternative preservation and provenance; access not assumed. [NINDS](https://www.commondataelements.ninds.nih.gov/Traumatic%20Brain%20Injury), [FITBIR](https://fitbir.nih.gov/).

## Actual data readiness gates before any clinical-model training
- [x] Identify three public EEG data candidates with explicit license and tasks
- [x] Verify provider-reported cohort counts, modalities and broad acquisition windows
- [x] Distinguish open CC0 vs controlled-access clinical repository
- [ ] Download and verify checksum / actual raw signal for at least a small subject subset
- [ ] Audit participants.tsv, session attrition, event codes, participant-level matching, missingness
- [ ] Document clinical reference labels vs mechanistic/functional endpoints separately
- [ ] Pre-register held-out-participant analysis; report uncertainty and domain-shift failure
- [ ] Acquire collision-minute measurements with independent ethics/clinical oversight if future study feasible

## Recommended next low-cost execution
1. Obtain `on003522` subset using NEMAR CLI, pin version and hashes; do not pull full >25GB unless needed.
2. Compare within-subject resting vs evoked spectral/ERP metrics with controls for time-since-injury, fatigue and session.
3. Treat all models as retrospective exploratory research, not real-time concussion detectors.

Tracked in [Human Repair Map #41](https://github.com/in-c0/human-repair-map/issues/41).
