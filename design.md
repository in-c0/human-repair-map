# Human Repair Map — design

Status: **design only, time-boxed, shelved on completion.** No repo, no build, no
schedule. Sumzup remains the vessel. This document exists so the idea stops
costing attention to hold in your head.

Owner decisions on record (2026-07-26): domain = the body; scope = design only.
Raw brief in [brief.md](brief.md).

---

## 1. Thesis

> Medicine is organised around **diseases**. Repair is a property of **tissues**.
> Because no one has ever laid the whole body out on one surface keyed by
> *repair capability*, nobody can see the pattern of what is solved next door to
> what is not — and that pattern is where the frontier actually is.

The deliverable is not an encyclopedia of the human body. The deliverable is a
**ranked, defensible list of leverage points**, produced mechanically from a
structured survey. The atlas is the substrate; the gap list is the product.

The one-sentence pitch: *a map of everything that breaks in a human body,
coloured by whether we can actually fix it — and it is mostly amber.*

---

## 2. What it is not

Naming these up front kills 80% of the scope creep:

- **Not a patient tool.** No treatment recommendations, no "ask your doctor
  about", no dosing, no protocols, no supplements, no clinic referrals, ever.
  It maps *research state*, not care.
- **Not a longevity product.** The moment it reads as biohacker material it
  loses the only audience that can act on it.
- **Not an encyclopedia.** Coverage is not the goal; contrast is.
- **Not a disease database.** Those exist and are better funded (MONDO, ICD-11,
  Orphanet, Open Targets). Duplicating them is the failure mode.

---

## 3. Prior art, and the specific hole

| Exists | What it does | What it does not do |
|---|---|---|
| ICD-11, SNOMED, MONDO, Orphanet | Classify disease | Say nothing about repairability |
| UBERON, FMA, Cell Ontology | Classify anatomy & cell types | No damage or repair axis |
| Open Targets, ClinicalTrials.gov | Target/trial evidence | Organised by drug programme, not by tissue outcome |
| Cochrane, UpToDate | Does treatment X work | Treatment ≠ repair; can't answer "was tissue restored" |
| Lifespan.io Rejuvenation Roadmap | Tracks anti-ageing interventions by trial phase | Scoped to ageing hallmarks; intervention-centric, not lesion-centric |
| Hallmarks-of-ageing framework | Mechanistic axes of decline | Ageing only; not trauma, not congenital, not acute |
| Tech-tree artefacts in research policy | The *form* — dependency graph as coordination device | Not applied to the body |

**The hole:** there is no surface where *the failure* is the primary object and
*the state of repair* is a first-class, comparable field. Every existing
resource is organised by the thing we are selling (a drug, a diagnosis, a
trial). This one is organised by the thing we are failing at.

Consequence: nobody can currently answer, from data, *"which single unsolved
mechanism, if solved, would move the most of the body up a rung?"* That question
is the product.

---

## 4. The unit of the map

Not organs. Not diseases. The atomic node is a **lesion**:

```
lesion = (anatomical structure) × (mode of failure)
```

Why this and not "disease": "knee cartilage" has no single repair state. A
full-thickness focal chondral defect in a 22-year-old and diffuse
osteoarthritic loss in a 70-year-old share a tissue and share nothing else —
different innate capacity, different blockers, different frontier. Disease
codes blur site, cause and stage together, which is exactly the blur that hides
the pattern.

**Node fields:**

| Field | Type | Note |
|---|---|---|
| `structure` | UBERON ref | do not hand-author anatomy |
| `failure_mode` | controlled vocab | loss, tear, degeneration, fibrosis, denervation, malformation, depletion, transformation |
| `innate` | axis A (below) | what the body does alone |
| `best_achieved` | axis B (below) | best proven human result |
| `frontier` | axis B + phase | best result anywhere, incl. animal/preclinical |
| `blockers[]` | controlled vocab | the load-bearing field |
| `burden` | DALYs / prevalence | for ranking; from GBD |
| `evidence[]` | tier + citation + date | every state claim is sourced |
| `verified_by` | person + date | or explicitly `unverified` |

`blockers[]` being a *controlled vocabulary* rather than prose is the single
decision that turns this from a wiki into a queryable instrument. Everything in
§6 falls out of it.

---

## 5. Two axes, not one ladder

A single "how fixed is it" scale conflates two different facts. Split them.

**Axis A — innate capacity.** What the body does with no help.
`none` · `partial` (heals, but wrong) · `full` (restores itself)

**Axis B — best achieved.** The best *proven* human outcome, worst to best:

| Rung | Name | Meaning | Example |
|---|---|---|---|
| B0 | **Nothing** | no proven way to repair, replace, or halt | complete spinal cord transection; ALS motor neurons |
| B1 | **Halted** | progression stopped or slowed; nothing lost returns | glaucoma pressure control; most MS DMTs |
| B2 | **Substituted** | function replaced by device, drug or donor; native tissue not restored; dependency permanent | dialysis; insulin; arthroplasty; cochlear implant |
| B3 | **Repaired imperfectly** | real tissue heals, wrong tissue or wrong architecture; degrades later | microfracture → fibrocartilage; myocardial scar; skin scar |
| B4 | **Assisted restoration** | we create conditions, the body restores properly | fracture reduction and fixation |
| B5 | **Restored** | native tissue, architecture and function; no dependency | corneal epithelium via limbal stem cells; liver after partial resection |

The distinction that gives the map its voice is **B2 vs B3+**. Modern medicine
is extraordinarily good at B1–B2 and this is invisible in every other
resource, because from a patient's or a payer's point of view a working hip is
a working hip. From a repair point of view, an arthroplasty is an admission of
defeat with a very good outcome. The map is the only place that difference is
recorded as a fact.

**A ≠ B is where the map gets interesting.** The tragedies live at
`A=none, B≤2`. The wins are at `A=full` (medicine never had to solve it).

---

## 6. The blocker vocabulary

Fixed, small, revisable by explicit amendment only. ~12 entries. Everything in
§7 is a query over this field.

1. **Avascular** — no blood supply, so no repair signalling or cell delivery
   (articular cartilage, inner meniscus, intervertebral disc, corneal stroma)
2. **Post-mitotic** — the cell is terminally differentiated and cannot divide
   (cardiomyocyte, cochlear hair cell, most CNS neurons, photoreceptor)
3. **No resident progenitor pool** — nothing left to recruit
4. **Fibrosis outcompetes** — scar forms faster than regeneration; the repair
   response itself blocks repair (heart, glial scar, cirrhosis, IPF, kidney)
5. **Architecture** — cells alone do not re-derive a 3-D pattern (nephron,
   alveolus, limb, cortical column)
6. **Positional identity lost** — cells no longer know where they are; the thing
   the axolotl still has and we do not
7. **Delivery** — we plausibly know the fix and cannot get it to the tissue
   (blood-brain barrier, inner ear, intracellular targets)
8. **Silent until irreversible** — no detection window, so any future repair
   arrives too late anyway (β-cell mass at diagnosis; glaucoma; CKD; hearing)
9. **Chronic driver persists** — repair is pointless while the cause runs
   (autoimmunity, mechanical load, hyperglycaemia)
10. **Immune barrier** — rejection, or immune privilege cutting both ways
11. **Substrate is identity** — repairing it may not preserve the person. Unique
    to CNS; the only blocker that is not a biology problem
12. **Economically substituted** — an acceptable B2 exists, so B3+ research is
    unfunded. Not a biological blocker at all, which is the point

Entries 11 and 12 are what stop this being a literature summary. No existing
database will ever record "we stopped trying because the workaround sells."

---

## 7. The gap engine — the actual product

Five queries. All mechanical, all run over the fields above, all producing
*ranked lists* rather than browsing experiences.

**Q1 — Sibling gap.** Two lesions share a blocker set; one reached B4–B5, the
other sits at B0–B2. *The mechanism has been beaten once. Why did it not
transfer?* This is the "solved next door" query.

**Q2 — Species gap.** `A` is `full` in another organism and `none` in us.
Zebrafish regenerate heart muscle and retina; birds regenerate cochlear hair
cells; axolotls regenerate limbs; deer regrow antlers, which is complex
mammalian regeneration. *The biology exists in the clade. What did we lose, and
is it lost or suppressed?*

**Q3 — Ontogeny gap.** `A` was higher earlier in life. Fetal wounds heal without
scar; young children regrow fingertips past the nail bed; neonatal mouse heart
regenerates for about a week after birth. *We had it and switched it off.* The
most tractable class of gap, because the machinery is still in the genome.

**Q4 — Substitution trap.** Lesions where B2 is good enough that the frontier
has not moved in decades. Ranked by burden. *This is a funding gap wearing a
biology costume.*

**Q5 — Blocker leverage (the headline).** Invert the map: rank **blockers** by
`(number of lesions gated) × (burden gated) × (1 / current research intensity)`.
Output: *"solve fibrosis and N lesions covering M DALYs move up at least one
rung."* Fibrosis alone plausibly dominates this list, and that claim being
computable rather than asserted is the whole reason to build the thing.

Q5 is the map's reason to exist. Q1–Q4 are how you populate and sanity-check it.

---

## 8. The name — settled

**Human Repair Map.** "Human Repair Roadmap" was an earlier, incorrect name for
the same thing (owner, 2026-07-26). There is one project. Nothing to re-litigate.

The map/roadmap *distinction* is still useful internally, just not as two names:
the map is the survey of the present, and the route — blockers ordered by
leverage (Q5) with pipeline state attached — is a **view computed from it**, not
a separate object. Call it the route view, not the roadmap.

---

## 9. Surfaces

Three, in priority order.

**1. The silhouette.** A human body form, every region coloured by axis B, worst
lesion wins. The image is the argument: a body that is mostly amber. It should
be uncomfortable to look at. This is simultaneously the product's front door and
its entire distribution strategy — it is one screenshot, it needs no
explanation, and it is the rare desire-4 artefact with a natural desire-2
payload.

**2. The lesion card.** Drill-in. Both axes, blockers, the frontier claim, the
evidence with dates, the sibling/species/ontogeny links. Every claim visibly
sourced and visibly dated. A card with stale evidence should *look* stale.

**3. The blocker view.** The inversion, and the one that will get cited: blockers
as primary objects, lesions as their consequences, ranked by leverage. This is
where a funder or a researcher lands.

Deliberately absent: search-as-primary-navigation, a symptom checker, anything
that accepts a personal detail. If someone can enter their own condition, the
map has become a patient tool and inherits a duty of care it cannot discharge.

---

## 10. Audience, in order

1. **The outsider who wants to see the frontier** — you, and people like you. The
   map's whole value proposition is that the pattern is invisible to specialists
   precisely *because* they are specialists. Nobody holds the whole surface.
2. **Researchers and funders** hunting underfunded leverage — the Q5 list is
   directly actionable for them.
3. **Science writers, students, the curious** — the silhouette carries this.

Explicitly not: patients, clinicians at point of care, anyone making a decision
about their own body.

---

## 11. Integrity design

A map of medicine that is wrong is worse than no map. Non-negotiables:

- **Every state claim carries evidence tier + citation + last-checked date.**
- **`unverified` is a visible state, not a hidden one.** AI-assisted extraction
  is how the map gets populated at all; a node that no human has checked must
  say so on its face. The credibility of the whole rests on never blurring this.
- **`contested` is a first-class state** with the strongest counter-claim stored
  alongside.
- **Staleness decays visibly.** A 2019 frontier claim in a fast-moving area
  should look wrong before you read it.
- **Open to correction by construction.** Publish incomplete and say so. A
  clinician who finds an error should have a one-click path to say so, and their
  correction should be visible. The map's authority comes from being correctable,
  not from being finished.
- **Sells nothing.** No supplements, no clinics, no affiliate anything, forever.
  The moment there is a product attached, Q4 and Q5 become unbelievable.

---

## 12. If it were ever built: the vertical slice

Do not attempt the body. Attempt one slice that proves the entire thesis, then
stop and look at it.

**Recommended slice: "the four that don't come back."**
Cardiomyocytes · cochlear hair cells · retinal photoreceptors and RGCs · CNS
axons.

Why this slice:
- All four share blockers 2 (post-mitotic) and 4 (fibrosis/glial scar); three
  share 7 (delivery). The sibling-gap query has something to chew on immediately.
- All four have a **species gap** (zebrafish heart, avian hair cells, zebrafish
  retina via Müller glia, lamprey/zebrafish cord) and at least one has an
  **ontogeny gap** (neonatal mouse heart). Q2 and Q3 both demonstrate on day one.
- Combined burden is enormous and instantly legible: heart failure, deafness,
  blindness, paralysis.
- The emotional line writes itself: *four tissues, one shared reason, and every
  one of them is solved in some other animal.*

~30–60 lesion nodes. Skeleton seeded from UBERON + MONDO so no anatomy is
hand-authored; the human work is only axes, blockers and evidence. That is a
few weeks of real work, not a life's work — and if the slice does not produce a
striking Q1/Q5 output, the thesis is wrong and the project should be killed
cheaply.

Explicitly deferred: full-body coverage, contribution workflow, API, anything
non-English, and the roadmap view.

---

## 13. Pre-mortem

| How it dies | Guard |
|---|---|
| Becomes an encyclopedia, dies of scope | Vertical slice; coverage is never a goal |
| Becomes a *wrong* encyclopedia; clinicians shred it | Visible `unverified`, dated evidence, correctable by design, publish incomplete on purpose |
| Reads as longevity-bro material | Sells nothing; trauma and congenital nodes present from day one; no ageing framing |
| Nobody maintains it; rots silently | Staleness is visible rather than hidden; a rotting map that *looks* rotten is still honest |
| Interesting to look at, useless to act on | Q5 is the product. If the slice's Q5 output is not actionable, kill it |
| Quietly becomes a patient tool | No personal input surface, ever |
| Becomes your second deep push | This document is the containment. It is shelved on completion |

---

## 14. Open questions — not resolved, for you

1. **Trauma and congenital in, or degeneration only?** Recommend all three in
   scope (it is what separates this from ageing frameworks) but the slice is
   degeneration-heavy either way.
2. **Does the mind belong on this map?** Blocker 11 ("substrate is identity")
   is a door into psychiatric and cognitive nodes. Recommend: door left visible,
   not walked through.
3. **Public from day one, or private until the slice holds?** Recommend public
   *when the slice is done*, not before — the silhouette is a one-shot first
   impression.
4. **Solo artefact or open atlas?** Affects everything about the data layer.
   Recommend solo through the slice, open only if the slice lands.
5. **Is this a project or an essay?** A very good long essay containing the
   silhouette and the Q5 list might capture 80% of the value at 5% of the cost —
   and would be a desire-2 asset outright. Worth considering before ever
   treating it as a build.

---

## 15. Accuracy note

The biological exemplars throughout (zebrafish cardiac regeneration, avian hair
cell regeneration, Müller glia, neonatal mouse heart window, fetal scarless
healing, paediatric fingertip regrowth, limbal stem cell grafts) are written from
general knowledge and are, to the best of my knowledge, well established — but
**none have been sourced in this session.** Every one is a claim the map itself
would require a citation and a date for. Treat them as illustrative until
checked.
