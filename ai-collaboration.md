# How AI and humans build this together

*A projection of AI capability 2026 → 2030, and the mechanisms that let an
AI-assisted observatory stay trustworthy as that capability grows.*

Written 2026-07-27. This is design, not prediction with dates — the phases below
are ordered by dependency, and each one is described by *what becomes possible*,
not *when it will arrive*.

---

## 1. The strategic bet

The obvious worry: "if AI gets good enough, why would anyone need a map — won't
you just ask a model?"

An earlier draft of this document answered with a neat line: *AI makes claims
cheap, it does not make trust cheap.* That is **wrong as stated**, and the
correction matters enough to record.

**The challenge (raised by the project owner, 2026-07-27):** advancing computer
vision, AR, and government/institutional AI integration will wire real-world
instruments directly into the record — GPS, satellite imagery, lab output,
camera footage. That *does* make trustworthy knowledge scalable. Trust stops
being a human bottleneck and becomes infrastructure.

That is right, and it is the larger half of the picture. A satellite image with
capture-time signing, a sequencer writing straight into a registry, an
instrument chain that never passes through a person's summary — none of these
need anyone's word. Capture-time content credentials already ship. Image
forensics already catch duplicated figures at a scale no reviewer could match.
All of that is AI making trust *cheaper*.

**The refined claim, which survives the challenge:**

> **Verification is becoming cheap. Judgment is not.**

Instrument grounding collapses the cost of establishing *what happened*. It does
not touch the cost of deciding *what it means*. The records on this map are
mostly the second kind: does a 91% drop in a CSF biomarker predict cognitive
benefit; does a rodent result transfer to a primate; is a route ready for a
human. The Capsida case is the clean test — the trial was registered, the
patient instrumented, the autopsy performed. Every measurement existed. What was
contested was whether the cerebral edema was *attributable* to the capsid, and
which body imposed the hold. Sensors do not adjudicate causal attribution or
institutional fact.

Two caveats worth stating rather than arguing: spoofing follows value, so
synthetic imagery makes camera evidence an arms race that capture-time signing
must keep winning; and instrument/government integration is jurisdictionally
uneven, so a *global* map that leans on state data channels imports their
politics along with their data.

**Why this strengthens the design rather than undermining it.** The owner's
mechanism is not a refutation of the bottleneck — it is the path by which the
bottleneck actually breaks. Review load per record should fall as grounding
rises. So the map must be built to *consume* grounding, which means recording it
explicitly (§2), and the commons ends up with fewer humans reviewing
higher-level things across vastly more records.

A second bet, unchanged: **review capacity is the binding constraint of any
evidence commons.** AI attacks it from two sides — by making each remaining
human review cheap (the Verification Packet, §4), and by removing the need for
review entirely wherever grounding is high enough.

---

## 2. The grounding ladder

If instrument grounding is what collapses review cost, the map has to record it.
So every record carries a **grounding class** alongside its evidence rung — they
are orthogonal, and together they determine how much human attention a record
needs.

| | Grounding | What it means | Human review needed |
|---|---|---|---|
| **G0** | Assertion | Someone said it; no source attached | Cannot enter the map |
| **G1** | Cited text | A paper or report says it | Full Verification Packet + human |
| **G2** | Structured record | Registry entry, regulatory filing, trial record | Automated cross-check; human spot-audit |
| **G3** | Primary data | Deposited dataset that can be re-analysed | Automated re-analysis; human reviews method choice |
| **G4** | Instrument-signed | Data signed at capture, provenance chain intact | None for the *fact*; human only for the inference |

Two consequences worth stating plainly:

- **The Verification Packet is transitional.** It is the right tool for G1, which
  is where nearly all of today's biomedical evidence sits. As the corpus migrates
  to G3–G4, the packet becomes unnecessary for those records. A mechanism that
  knows its own expiry date is more honest than one that assumes permanence.
- **Judgment does not migrate.** A maturity score sits on top of any grounding
  class. Even in a fully instrument-wired world, someone decides the rubric, what
  counts as a demonstration, and whether primate evidence transfers. G4 makes the
  *base* of the pyramid nearly free; it does not touch the apex.

**The capture risk this creates.** Once trust rests on instrument pipelines,
whoever controls the instruments and the signing keys controls the substrate.
Government and platform integration sharpens this rather than softening it. The
countermeasure is the same one that governs the rest of the commons — multiple
independent grounding sources for any high-stakes record, and a public dispute
path that does not require permission from the party holding the keys.

---

## 3. What is actually true today (2026)

Stated plainly, because the phases only make sense against a real baseline.

**Agents can, right now:**
- Search broadly and in parallel across literature, trial registries, and
  regulatory records.
- Extract structured claims into a fixed schema, reliably enough to be useful.
- Fan out and **check each other adversarially** — independent agents attacking
  the same claim surface different failure modes.
- Sustain a multi-step research task over tens of minutes without losing the
  thread.

*Demonstrated in this project:* six agents in parallel graded sixteen CNS
delivery routes, cross-corroborated a safety finding, and — the important part —
**corrected each other**. One agent's claim of an FDA clinical hold was reduced
by a second sweep to "the pause was voluntary; the hold's origin is not publicly
established." That correction is the system working.

**Agents cannot, right now:**
- Be trusted on a citation that no human has opened. Mis-attribution and
  confident paraphrase of a source that says something subtly different remain
  the dominant failure mode.
- Judge whether a surrogate endpoint means anything clinically.
- Decide what matters.

**Therefore the v0.1 rule, which is not temporary humility but architecture:**
every AI contribution enters as a *proposal* and can never self-promote to
*reviewed*. The public map shows the unreviewed state on the record's face.

---

## 3. Capability phases, and what each one unlocks

### Phase A — standing attention *(the near edge)*

*Capability:* agents that run for hours to days without supervision; grounded
citation with verifiable spans (exact quote + locator); schema-enforced output;
reliable parsing of figures, tables, and supplementary data rather than
abstracts.

*What it unlocks:*

- **Continuous monitoring instead of episodic scans.** A standing agent per
  capability watches literature, trials, and regulatory records and files
  *change-proposals* — never edits. The monthly "What changed" report becomes an
  auto-drafted, human-signed artifact.
- **The Verification Packet** — the single most important mechanism in this
  document. An agent proposing a claim must deliver:

  ```
  claim · exact quote · locator (page/figure/table) · population & N ·
  comparator · what was measured (function vs surrogate) · stated limitations ·
  contradicting sources found · confidence + why
  ```

  The human reviewer's job stops being "read this paper" and becomes "does this
  quote support this claim — yes/no/dispute." That is the ~40× throughput gain
  on the binding constraint.

### Phase B — adversarial and reproducible *(the middle)*

*Capability:* agents that re-run computational analyses and statistics from
supplementary data; contradiction detection across an entire corpus; persistent
agent identity, so a given agent accrues a track record.

*What it unlocks:*

- **Reproducibility checks as a routine task type.** "Does the reported effect
  survive re-analysis of the deposited data?" becomes a standing, automatable
  question — and a rung on the ladder in its own right.
- **Conflicts populate themselves.** The evidence registry's `conflicts` view
  stops being hand-curated; corpus-wide contradiction detection surfaces
  disagreements no individual reviewer would have noticed.
- **Calibration ledgers.** Every proposer — agent *or* human — carries a public
  record: proposals accepted, overturned, disputed. Crucially this buys
  **routing, not authority**: a high-calibration proposer's work enters a faster
  lane; a low-calibration one draws more refuters. Nobody's score lets them skip
  human acceptance.

### Phase C — closed loops *(the far edge)*

*Capability:* domain models that predict perturbation outcomes well enough to be
scored; automated labs that can run a cheap experiment end to end; AI systems
proposing and executing their own studies.

*What it unlocks:*

- **A prediction registry with resolution.** The map records conditional
  forecasts in the form we committed to — *"X requires Y; Y is unproven beyond
  rodent; therefore X is at minimum one demonstration away"* — with explicit
  resolution criteria. Predictions resolve as evidence lands, and the map
  accumulates a public calibration record for itself. A map that has been
  publicly right is the only kind worth consulting.
- **Commissioning, not just observing.** Once the bottleneck graph knows which
  gate blocks the most downstream capability, the highest-value output stops
  being a report and becomes a *specification for the cheapest experiment that
  would move a rung*. The observatory starts pointing at work, not just
  describing it.
- **The claim explosion.** This is also where the danger peaks: AI-generated
  claims citing AI-generated claims, at a volume no human corpus can absorb. A
  commons with a years-long provenance track record is the navigational
  instrument. One without it is noise.

---

## 4. The division of labour

The line has to be constitutional, not a policy that erodes under throughput
pressure.

| Fully automatable | Human-gated, permanently |
|---|---|
| Source discovery and deduplication | Accepting any record as **reviewed** |
| Structured extraction into schema | Setting or changing a **maturity score** |
| Translation and normalisation | **Target-state and ethics** content — what counts as repair vs. difference |
| Staleness flagging, dead-link repair | **Dispute resolution** |
| Link and contradiction proposals | Anything touching **safety claims** |
| Draft "what changed" reports | Deciding **what matters** |

**Why the right column never moves:** each item is a value judgment or an
accountability act. A maturity score is a claim about what humanity knows; it
needs a human who can be *wrong in public*. Automating it removes the person who
can be held to it, and an evidence commons with nobody accountable is just a
confident website.

---

## 5. How it breaks, and the countermeasure

Named up front, because a governance model that only describes success is
decoration.

| Failure | Countermeasure |
|---|---|
| **Model monoculture** — every agent shares a base model, so errors correlate and adversarial review rubber-stamps itself | Refutation must use **diverse models/providers**; log which model produced each verdict; treat single-model consensus as one vote |
| **Citation laundering** — AI cites AI citing AI, and provenance dissolves | Every record requires a **primary-source locator**; secondary sources are labelled and cannot alone support a rung change |
| **Review theatre** — humans rubber-stamp packets to clear the queue | **Sample-audit the reviewers**; publish per-reviewer overturn rates; disputes are a healthy metric, not a failure |
| **Proposal flooding** — agents outproduce review capacity and the backlog *becomes* the map | Reviewed core stays deliberately small; unreviewed is visually dominant; publish the ratio on the front page |
| **Capture** — a funder or lab shapes scores | No funding from any party with a product, trial, or clinic that appears in the map; COI disclosure per reviewer; disputes public |
| **Automation drift** — the human-gated column quietly shrinks under load | The division of labour is versioned and changes only by public protocol amendment |

---

## 6. The adoption path

An evidence commons dies if it is a website people are supposed to visit. It
lives if it becomes infrastructure other systems reach for.

The concrete move: **expose the map as a tool other agents call** — a stable,
machine-readable interface (MCP server / API) answering:

- what is the evidence state of capability X?
- what supports this claim, and who disputes it?
- what would move this rung?

Then any agent, anywhere, answering a question about biological repair can check
the commons instead of guessing — and can file a proposal back. The map becomes
the thing an AI reaches for when it needs to know *whether something is actually
proven*, which is precisely the question models are worst at and most confident
about.

That is also the answer to "why would anyone contribute?" They contribute
because they are already querying it.

---

## 7. What this means for the build order

1. **Now:** provenance envelope + review states on every record *(v0.1 — done)*.
2. **Next:** the Verification Packet format, and hand-verify the delivery module
   to prove the human lane works at all.
3. **Then:** adversarial pre-review — N diverse refuters before the human queue.
4. **Then:** calibration ledger for proposers; standing monitors per capability.
5. **Later:** machine interface (MCP/API); prediction registry with resolution.
6. **Much later:** commissioning — the map specifying experiments.

Steps 1–3 are buildable with today's capability. Nothing above requires a
breakthrough to start; it requires the discipline to keep the right column of
§4 human while everything left of it accelerates.
