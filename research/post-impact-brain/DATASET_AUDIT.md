# Concussion / mTBI dataset access audit — 2026-11-15

Scope: post-impact neural-state observability research. **Provider pages and public GitHub participants.tsv / participants.json metadata inspected; no raw EEG waveform downloaded.** Dataset storage sizes are provider-reported; participant-row counts independently checked.

| Candidate | Provider | Public license | Subjects / reported size | Paradigm / injury timing | Fit / limitation | Status |
|---|---|---|---|---|---|---|
| `on003522` (OpenNeuro `ds003522`) | [NEMAR](https://nemar.org/dataset/on003522) | CC0 | 96 / 25.4 GB | 3-stimulus auditory oddball + resting EEG; controls, subacute mTBI, chronic TBI; 3 sessions for controls and subacute cohort | **First candidate** for within-dataset evoked vs resting analysis; not collision-minute data | Published metadata/license confirmed; raw bytes not verified |
| `on005114` (OpenNeuro `ds005114`) | [NEMAR](https://nemar.org/dataset/on005114) | CC0 | 91 / 56.5 GB | DPX cognitive control EEG; first session **3–14 days post injury**; follow-ups ~2 and 4 months | Tests cognitive control response and trajectory; attrition; no immediate post-impact test | Published metadata/license confirmed; raw bytes not verified |
| `on003523` (OpenNeuro `ds003523`) | [NEMAR](https://nemar.org/dataset/on003523) | CC0 | 91 / 37.5 GB | Visual working memory, healthy vs subacute mTBI; **3–14 days** and follow-up ~4 months | Different task, **all 91 URSI identifiers shared with on005114**; never treat as independent validation | Published metadata/license confirmed; raw bytes not verified |
| TRACK-TBI / FITBIR | [TRACK-TBI](https://tracktbinet.ucsf.edu/track-tbi), [FITBIR](https://fitbir.nih.gov/content/access-data) | Controlled access, noncommercial research terms | TRACK-TBI ~3,000 across injury spectrum | Clinical history, CT/MRI, biospecimens, outcomes at weeks/months | Strong clinical phenotyping, but **not open raw data** and **not sideline seconds** | Public metadata only; PI-level institutional access approval required |

## Source and policy cautions
- NEMAR dataset pages report CC0 licensing and available CLI/manifest downloads. NEMAR direct download could not be completed in this runtime, but public GitHub repository metadata files `participants.tsv` and `participants.json` were read. **Raw EEG signal byte access is not verified**.
- Dataset labels usually refer to clinical mTBI categories. They are not proof of microscopic tissue damage. Healthy control vs mTBI classification must not be called biological ground truth.
- Cross-dataset overlap is **confirmed** by matching `URSI` fields: 71 matching IDs for on003522 vs either other dataset; 91 matching IDs between on005114 and on003523. There are 116 unique URSI values across 278 rows. Each file has one repeated `Original_ID` despite unique URSI values, so **distinct-person counts remain uncertain**. Participant-local `sub-xxx` identifiers differ between on003522 and other files for 66 of the 71 overlaps; never join by local participant ID alone. Split by cross-dataset matched identity before evaluating generalization.
- The NEMAR data do **not** validate seconds-to-minutes post-hit diagnosis, sport-specific field deployment or safety of return-to-play decisions.
- TRACK-TBI FITBIR access requires research use, institutional PI/authorized signatory and data-use review; current FITBIR policy lists a non-commercial research constraint. [FITBIR Access](https://fitbir.nih.gov/content/access-data).
- NINDS TBI CDE page notes FITBIR closing operations as of **2026-12-31**; FITBIR itself lists restrictions on non-NIH data as of 2026-08-24. Plan alternative preservation and provenance; access not assumed. [NINDS](https://www.commondataelements.ninds.nih.gov/Traumatic%20Brain%20Injury), [FITBIR](https://fitbir.nih.gov/).

## Verified cross-dataset participant metadata audit (public GitHub source files)

The counts below were calculated from the three `participants.tsv` files and group code definitions from `participants.json` on 2026-11-15. Identifiers are **not** copied into this repository.

| Dataset | Rows | Group 0 = mTBI | Group 1 = control | Group 2 = chronic TBI | Duplicate Original_ID values |
|---|---:|---:|---:|---:|---:|
| on003522 | 96 | 44 | 27 | 25 | 1 |
| on005114 | 91 | 57 | 34 | 0 | 1 |
| on003523 | 91 | 57 | 34 | 0 | 1 |

| Dataset pair | Matching URSI values | Group mismatches among matches | Different local participant IDs among matches |
|---|---:|---:|---:|
| on003522 : on005114 | 71 | 0 | 66 |
| on003522 : on003523 | 71 | 0 | 66 |
| on005114 : on003523 | 91 | 0 | 0 |

Union: **116 unique URSI IDs**; *not independently verified as 116 separate biological individuals* because `Original_ID` duplicates occur within datasets.

Source files: [on003522 participants.tsv](https://github.com/nemarDatasets/on003522/blob/main/participants.tsv), [on005114 participants.tsv](https://github.com/nemarDatasets/on005114/blob/main/participants.tsv), [on003523 participants.tsv](https://github.com/nemarDatasets/on003523/blob/main/participants.tsv). Repository `main` paths should be pinned to immutable revisions before publication. Run `participant_overlap_audit.py` on local TSV files for aggregate-only reproducibility.

## Actual data readiness gates before any clinical-model training
- [x] Identify three public EEG data candidates with explicit license and tasks
- [x] Verify provider-reported cohort counts, modalities and broad acquisition windows
- [x] Distinguish open CC0 vs controlled-access clinical repository
- [ ] Download and verify checksum / actual raw signal for at least a small subject subset
- [x] Audit public participants.tsv rows, group counts and cross-dataset URSI matching (metadata only)
- [ ] Resolve repeated Original_ID records and confirm distinct biological individuals
- [ ] Audit session attrition, event codes, recordings, missingness
- [ ] Document clinical reference labels vs mechanistic/functional endpoints separately
- [ ] Pre-register held-out-participant analysis; report uncertainty and domain-shift failure
- [ ] Acquire collision-minute measurements with independent ethics/clinical oversight if future study feasible

## Recommended next low-cost execution
1. Obtain `on003522` subset using NEMAR CLI, pin version and hashes; do not pull full >25GB unless needed.
2. Compare within-subject resting vs evoked spectral/ERP metrics with controls for time-since-injury, fatigue and session.
3. Treat all models as retrospective exploratory research, not real-time concussion detectors.

Tracked in [Human Repair Map #41](https://github.com/in-c0/human-repair-map/issues/41).
