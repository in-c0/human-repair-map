# Article 01 — spec

The first artefact of Human Repair Map. Not a website, not an organisation: one
article with one table, written to a standard, published under Ava's name.

Locked by the owner 2026-07-26 — see `decisions` section in
[assessment-owner-draft.md](assessment-owner-draft.md).

---

## Working title

**Getting into the brain: the state of CNS delivery, 2026**

Why this sub-capability first:

- It is #2 on the owner's own bottleneck ranking, so it is not a soft target.
- It is one cell of the capability grid — `pillar 3 (cellular access) × CNS` —
  so writing it *is* building the first record, not a detour.
- It is the blocker shared by three of the four lesions in the atlas slice
  ([design.md](design.md) §12).
- The "solved next door" contrast is vivid and true: delivery to liver is
  largely a solved engineering problem; delivery across the blood–brain barrier
  is not. Same pillar, opposite state. That contrast is the whole thesis of the
  map, demonstrated once, concretely.
- The literature is large, active and public. Nothing here requires access.

---

## The opening problem to fix first

The draft's conviction paragraph contradicts its own ranking. Owner's answer
(2026-07-26): **legibility is primary, but the other two are real and should be
named.** Replacement text, to use as the article's frame:

> There are three honest answers to why we do not have this yet.
>
> The first is that the science is not ready. We can describe a cell's state far
> better than we can say how to move it safely from one state to another.
>
> The second is that the framework is slow. Ethics, approvals and regulation
> were built around one product, one disease, one dose — and a general repair
> capability does not fit any of those boxes.
>
> Both are true. Neither is the one I can do anything about.
>
> There is a third. **No one can see the whole.** Every group working on this is
> solving a real piece — cell atlases, virtual cells, delivery, reprogramming,
> closed-loop devices — and each piece is hard enough to justify an entire
> institute. Because no one holds the full picture, nobody can say which piece
> is actually blocking the others, and attention and money go to the piece that
> is most visible rather than the one that is most binding.
>
> The first two need laboratories and legislators. The third needs a map, and
> there isn't one.

Adjust the wording to taste; keep the structure — name all three, concede two,
claim only the third.

---

## The rubric (write this before the table)

The scale must be anchored on **what was observed**, never on adjectives. Levels:

| Level | Anchor |
|---|---|
| L0 | proposed; no demonstration |
| L1 | in vitro, organoid, or ex vivo tissue |
| L2 | rodent, in vivo |
| L3 | large animal or non-human primate |
| L4 | human, one group |
| L5 | human, **independently replicated** by an unaffiliated group |

Independent replication is the anchor because it is the only one a lab cannot
award itself in a press release.

Every row also carries four flags, because level alone hides the important part:

- **specificity** — reaches a defined cell type, or bulk tissue?
- **invasiveness** — systemic / lumbar / burr hole / craniotomy?
- **repeatability** — can it be dosed again, or does immunity close the door?
- **readout** — functional outcome, or a surrogate (biodistribution, expression)?

And one prose field per row: **drift** — the distance between what was
demonstrated and what is being claimed. Six axes carried over unchanged from
[[ssmt-design]]: population, setting, comparator, outcome, magnitude,
independence.

---

## Candidate rows — to verify, not to assert

Roughly 10–14 rows. **Every one of these is written from memory and must be
checked before it appears in public.** They are a research list, not findings.

- systemic AAV9 (approved product exists for a paediatric indication — verify)
- engineered capsids selected in mice (e.g. PHP.eB) — *check the reported
  failure to translate to primates; if it holds up, this is the single best
  drift example in the whole field and should be the article's worked example*
- intrathecal antisense oligonucleotide (approved product exists — verify)
- intracerebroventricular enzyme replacement
- receptor-mediated transcytosis / transferrin-receptor shuttles (clinical?)
- focused ultrasound with microbubbles for transient BBB opening
- convection-enhanced delivery, direct intraparenchymal
- lipid nanoparticles to CNS (expect largely negative — say so)
- intranasal (expect weak evidence; say so plainly)
- engineered exosomes / EVs
- cell-based delivery (CAR-T and similar into CNS)
- direct stereotactic gene therapy injection

Rows where the honest answer is "no independent evidence located as of
<date>" are **the most valuable rows in the article.** They are what nobody else
publishes.

---

## Structure

1. The frame — three answers, claim only the third (above). ~300 words.
2. What "solved" would mean here, and the rubric. ~400 words.
3. **The table.** The artefact. Every cell sourced and dated.
4. Five or six rows read out in prose — the ones that carry the argument,
   including the drift worked example.
5. What would count as the next real demonstration — **conditional, never
   dated.** "X requires Y; Y has not been shown beyond rodent; therefore X is at
   minimum one demonstration away, and it would look like this."
6. What I could not establish. Explicit, listed, not hidden.
7. Method, and how to correct me — named, easy, and visibly welcome.

Target 2,000–3,000 words plus the table. Longer is not better; the table is the
product.

---

## Hard rules

- Every claim carries a citation **and a date**. The article must obey the map's
  own standard in public, or the standard is decorative.
- Empty cells stay visibly empty. Emptiness is data.
- No date forecasts, ever.
- Grade **claims**, never groups or companies. Phrase absence as "no independent
  evidence located as of <date>", never "false" and never "they are wrong".
  (Australian defamation exposure — same rule as [[ssmt-design]].)
- No clinical guidance of any kind. No route, dose, trial, or centre suggested
  to any individual. If a person with a CNS disease reads this — and one will —
  the article must not read as an option list.
- AI-assisted research is fine; **every row a human read the source for.** If a
  row was not verified by hand, it does not ship.

---

## Definition of done, and the kill criterion

**Done:** published, with every row either sourced-and-dated or explicitly
marked as not established, and sent directly to a short list of researchers
working on CNS delivery.

**The test:** does anyone with real expertise engage — correct a row, argue with
a level, ask for a change?

- **Substantive expert replies → the observatory thesis has support.** Those
  people are the first reviewers, and article 02 becomes the second grid cell.
- **Nothing in six weeks → the thesis is unsupported.** Not "market it harder".
  The claim was that a legible map is what's missing; if the people closest to
  the problem don't care about the map, that claim failed a cheap test. Stop.

This is deliberately falsifiable and deliberately cheap. It is the whole reason
to start with an article instead of an institution.

---

## Not in scope for article 01

No website, no registry schema, no database, no AI monitoring pipeline, no
governance charter, no nonprofit, no dashboard, no second pillar. All of it
waits for the reply test.
