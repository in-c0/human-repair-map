# Human Repair Map v0.2 — the repairability atlas

Design settled 2026-07-28 from the core vision reset. Supersedes `design.md`
(lesion atlas) and the capability-pillar structure. Verbatim vision and all
owner answers: [vision-core-2026-07-28.md](vision-core-2026-07-28.md).

---

## 1. Purpose — read this before anything else

**The purpose is to see, not to change.**

> *"our goal isn't trying to change anyone's behaviour. We're trying to SEE the
> full picture, because it's difficult."* — owner, 2026-07-28

This is an instrument, not a campaign. It follows that:

- Adoption is **not** the success criterion. A telescope doesn't justify itself
  by attendance.
- No contribution flywheel is required for it to be worth building.
- The test is: **is the picture true, and complete enough to be worth looking at.**
- Every prior argument about growth loops, contribution protocols and audience
  is set aside. They were answers to a question this project isn't asking.

Everything below is in service of one sentence: *make the whole of human
repairability visible on one surface.*

---

## 2. The spine — cells, and the six things that aren't

The atomic unit is the **cell type**. This is the owner's answer and it is right:
it is what repair actually acts on, it is finite, and it is already being
enumerated authoritatively by others.

Plus a **short fixed list** of non-cellular nodes, because the body is also
*"construction history, spatial organisation, learned neural information, immune
memory, mechanical structure"* and a pure cell map would silently drop them:

| Non-cellular node | Why it can't be a cell |
|---|---|
| Extracellular matrix | collagen, elastin, basement membrane — secreted, not cellular |
| Tissue architecture | alveoli, nephrons, cortical columns — a 3-D pattern, not a cell |
| Neural connectivity | the wiring and its weights, not the neurons |
| Immune memory | distributed across a repertoire, located in no single cell |
| Mineralised structure | bone mineral, enamel — largely acellular |
| Microbiome | not human cells at all |

The list is **fixed**. Adding a seventh requires an explicit decision, because an
open-ended "other" category is how the boundary dissolves.

### Granularity: start coarse, split on demand

Begin at **lineage/functional family** level — roughly 20–30 nodes covering the
whole body:

> neurons (CNS) · neurons (PNS) · glia · cardiomyocytes · hepatocytes · islet
> β-cells · nephron epithelium · alveolar epithelium · haematopoietic stem cells ·
> lymphocytes · myeloid cells · keratinocytes · melanocytes · gut epithelium ·
> skeletal muscle · smooth muscle · osteoblast/osteoclast · chondrocytes ·
> endothelium · fibroblasts · cochlear hair cells · photoreceptors · adipocytes ·
> germline · thyroid/adrenal endocrine

**A node splits only when the evidence genuinely differs between its subtypes.**
Not before. This is the containment rule and it is the whole reason the project
is now finishable.

---

## 3. The grid — what the picture actually is

Rows = nodes (§2). Columns = **both** capabilities and failures.

**Capability columns** — the five, finally concrete. They were too abstract as
five standalone nodes; as five columns against ~25 rows they become ~125 graded,
sourced claims:

| Column | The question it answers |
|---|---|
| **See** | Can we measure the state of this cell in a living person? |
| **Model** | Do we know what a healthy target state for it is? |
| **Reach** | Can we deliver something to it, specifically and repeatedly? |
| **Edit** | Can we repair, replace, reprogram or clear it? |
| **Verify** | Can we confirm afterwards that it worked, and stayed working? |

**Failure column** — what actually goes wrong with this cell type: what damages
it, whether it renews, and how its failure presents.

Each graded cell carries:

- an **evidence rung** (L0–L5, existing rubric — survives unchanged)
- a **grounding class** (G0–G4, existing rubric — survives unchanged)
- **what blocks it**: `science` (we don't know how) or `framework` (we do, and it
  isn't reaching people — approvals, ethics, economics, access). This is the
  owner's conviction made structural: a property of every graded claim, not a
  separate map.
- sources, and a review state

**The empty regions of this grid are the picture.** Not an argument about the
picture — the picture.

---

## 4. What it looks like — three surfaces, one core

Owner's answer: all three.

1. **The image.** The whole grid on one screen, graded by density. You should be
   able to see, in one glance, that we can *see* a lot and *edit* almost nothing.
   This is the artifact that travels.
2. **The graph.** Traverse from a cell type to what damages it, what reaches it,
   what blocks it. For depth, not for shape.
3. **The lists.** Derived and ranked: biggest capability gaps, cell types nobody
   can reach, claims blocked by framework rather than science.

One data core, three renderings. Never three datasets.

---

## 5. How it gets filled — import, then grade

Owner's answer: import + AI on top.

- **Import the skeleton** from Cell Ontology / Human Cell Atlas / Human Protein
  Atlas. Real IDs, real provenance, zero invention. The rows are not authored.
- **AI grades the columns** — this is the original contribution and the only part
  that doesn't exist anywhere. HCA maps what cells *are*. Nobody maps what we can
  *do* to each one.
- **Every grade enters `ai-proposed`** and says so on its face. The review-state
  and grounding machinery already built carries over unchanged.
- Existing CNS-delivery work is **not discarded**: those 16 routes become the
  `Reach` column for CNS neurons, cochlear hair cells, photoreceptors and
  cardiomyocytes. The most-researched column of the new grid is already done.

---

## 6. Completion

**Every node in §2 has a grade in every column of §3, with a source or an
explicit "no evidence located".**

That is a finish line, it is measurable, and at coarse granularity it is
reachable by one person. ~25 rows × 6 columns ≈ 150 graded claims for a complete
first picture of the entire human body's repairability.

Compare with what exists today: 16 records inside one narrow subdomain, which
can never feel whole. **Coarse-and-complete beats fine-and-partial** for an
instrument whose entire purpose is seeing the whole.

---

## 7. Deferred, deliberately

- **The mortality / 120 link.** Build the grid first; attach causes of death as a
  second layer once the spine holds.
- **Individual actionability.** "What can be done today" for a *person* is gated
  behind years of maturity and expert validation. Contributor- and funder-facing
  actionability is pushed only weakly.
- **Contribution protocol.** Not required by an instrument. The existing intake
  form can stay as a correction channel; nothing more is built.

---

## 8. Honest risks

| Risk | Guard |
|---|---|
| **Splitting explodes the rows** | A node splits only when evidence differs between subtypes. The rule is the boundary. |
| **The non-cell list grows** | It is fixed at six. A seventh is an explicit decision, logged. |
| **~150 AI-graded claims, none human-checked** | Same as today: visible review states, `ai-proposed` by default, no record reaches `reviewed` without a named human. The grid must show its own unreviewed ratio. |
| **Coarse grading is too vague to be true** | Every grade needs a source and a specific claim, or it says "no evidence located". Vagueness shows up as an honest blank, not a confident dot. |
| **It looks like a longevity project** | The framing is the gap between average lifespan and the demonstrated human maximum. No claim that humans should live forever. Trauma and congenital failure are in scope from day one. |
| **Duplicating Lifespan.io / HCA** | HCA maps what cells are; Lifespan.io tracks interventions by ageing hallmark. Neither grades per-cell-type repairability across see/model/reach/edit/verify. Check this stays true before building. |

---

## 9. Still open

1. The exact coarse row list (§2 is a first draft, not settled).
2. How `science` vs `framework` blocking gets graded — needs its own small rubric.
3. Whether the five capability columns are the right five at cell granularity, or
   whether `Reach` and `Edit` collapse together in practice.
4. Whether "Human Repair Map" is still the name. It fits better now than it ever
   has: it is literally a map of what can be repaired.
