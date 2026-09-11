# Assessment of the owner's draft (2026-07-26)

Raw draft: [owner-draft-2026-07-26.md](owner-draft-2026-07-26.md) — unedited.
Earlier lesion-atlas design: [design.md](design.md).

## Decisions locked by the owner, 2026-07-26

1. **Name = Human Repair Map.** "Human Repair Roadmap" was an older, incorrect
   name for the same project. One project, two faces.
2. **The conviction: legibility is primary — and the other two causes are real
   and get named, not denied.** The article's frame states all three (science not
   ready; framework slow; nobody sees the whole), concedes the first two as
   outside her reach, and claims only the third. §2 below is superseded by this:
   the contradiction is resolved in favour of legibility, with honest company.
3. **Start as one article, not an organisation.** Spec:
   [article-01-spec.md](article-01-spec.md). Nothing else gets built until it
   passes its reply test.
4. **Repair only.** "Better than they were ever before" comes out of the thesis
   and the hook. Enhancement survives as an open question inside the target-state
   section, where it belongs.

---

This draft is much bigger than what I designed this morning, and better in one
specific way: it derives the map from first principles instead of from anatomy.
The five pillars are a *capability* decomposition. My lesion atlas is a *damage*
decomposition. Those are the two axes of one matrix, and §6 argues they should
stay one project.

---

## 1. The strongest thing in it

**"Repair is possible when the relevant information still exists, can be
inferred, or has been backed up."**

That is a real thesis. It is close to falsifiable, it produces a boundary
condition rather than an aspiration, and it does the one thing no roadmap ever
does: it tells you what is *theoretically impossible* and why. Everything else
in the draft is downstream of it. If a single sentence survives to the published
version, it should be this one.

Second-strongest: the insistence that the primitive is a *state change*, not a
cell and not DNA. That is what stops the whole thing collapsing into "gene
therapy but more." It is correct and it is not the default framing.

Third: the target-state section. The autism question, "disability from
difference", "repair from unwanted alteration", consent as a component of the
target rather than a checkbox on the outside — that is careful thinking, and it
is what will make a hostile reader decide you are serious rather than a
transhumanist with a slide deck.

---

## 2. The conviction contradicts the draft — and this is the important one

> "We have everything we need out there. All we need to do is just connect the
> dots well. The main bottleneck is the framework: ethics, approvals,
> regulations, which are slow to catch up to technology."

Your own bottleneck ranking, four paragraphs earlier, puts:

1. causal biological models
2. delivery
3. safety control
4. sensing
…
8. **regulatory path**

You ranked regulation *last of eight* and then named it *the main bottleneck*.
Both cannot be true, and the ranking is the one I believe.

The empirical check: if regulation were binding, the most permissive
jurisdictions would already be producing partial universal repair. They are not.
They are producing unproven stem-cell clinics selling nothing to desperate
people. Permissiveness without causal models does not yield cures; it yields
fraud. Regulation is a *rate* constraint on translating capability we already
have. It is not the constraint on having it.

This matters far beyond the wording, because it is the project's theory of
change. **A map cannot fix a knowledge bottleneck.** If the binding constraint
is causal models, an observatory is a nice-to-have. So either the project has no
mechanism, or the conviction is stated wrong.

**The version I think is actually true, and which the map *does* fix:**

> The binding constraint is not knowledge and not regulation. It is
> **legibility**. Every piece of this is being worked on by someone who cannot
> see the whole, so nobody can tell which constraint is actually binding, and
> capital and attention are allocated to the visible constraint rather than the
> binding one. The map's job is to make the binding constraint *visible enough
> to argue about*.

That is defensible, it is not contradicted by your own ranking, and — unlike the
regulation claim — a public observatory is a direct, plausible mechanism for it.
Recommend replacing the conviction paragraph with this.

---

## 3. Capability is not scalar — the single biggest structural fix

"Delivery: maturity 4/9" is meaningless and would discredit the map on its first
contact with anyone who works on delivery. Delivery to liver via LNP is largely
solved. Delivery across the blood–brain barrier is not. Delivery into a fibrotic
solid tumour is not. These are not one capability at different confidence
levels; they are different capabilities.

So the capability record needs the same treatment the lesion node got:

```
capability record = (pillar sub-capability) × (tissue / context)
```

Not "cell-state editing" but "epigenetic partial reprogramming × hepatocyte ×
in vivo × non-human primate". That is a record you can score, source, date, and
argue with. A flat pillar score is a vibe.

This costs you: 5 pillars × ~8 sub-capabilities × ~10 contexts is a big grid.
Good — the grid's emptiness is data, and a mostly-empty grid is a much stronger
publication than a full one with mush in every cell.

---

## 4. Don't forecast dates

"Forecasts with uncertainty" is the riskiest promise in the draft. The base rate
for expert timeline forecasts in biology is bad, and a public wrong date is
permanent reputational damage for an organisation whose only asset is
credibility. Confident 2031 predictions made in 2026 will be quoted back in 2032.

Forecast **conditional structure** instead:

> X requires Y. Y has not been demonstrated beyond rodent. Therefore X is at
> minimum one demonstration away, and here is what that demonstration would
> look like.

Ordering claims and prerequisite claims stay true for decades and are *more*
useful to a funder than a date. It also converts the forecast from an opinion
into a queryable property of the bottleneck graph. Same intellectual product,
none of the liability.

---

## 5. The maturity rubric is where the project lives or dies, and it is one bullet

The draft treats "maturity scoring rubric" as a line item in v0.1. It is the
whole thing. Everything else — the site, the dashboard, the AI agents — is
plumbing around this one artefact.

Two lessons already on the shelf that apply directly:

- **[[ssmt-design]] Stage 0: hand-grade ten before writing code.** The rubric is
  a hypothesis and will reshape on contact with real literature. Automating an
  unvalidated rubric produces confident nonsense at scale — and here the
  nonsense is about medicine.
- **Anchor the scale on observables, not adjectives.** Not "level 4 of 9" but:
  demonstrated in vitro / in rodent / in large animal / in human / repeatedly /
  **by an independent group**. Independent replication is the one anchor that
  cannot be gamed by a lab's own press release.

And the SSMT convergence is real: a capability claim drifts exactly the way a
sports-tech claim drifts. "We achieved cell-specific delivery" (mouse, n=6,
one lab, surrogate readout) → "cell-specific delivery is solved". Population,
setting, comparator, outcome, magnitude, independence. **The six drift axes port
over unchanged.** HRR is instance #3 of the same claim→evidence engine
(SSMT #1, GOMIN #2).

Caveat against my own point: three planned instances of an engine with zero
validated instances is still fragmentation. Convergence only counts if SSMT
actually validates the engine first.

---

## 6. Where the lesion atlas fits — keep both, one project

The pillars and the blockers I derived independently line up almost 1:1:

| design.md blocker | Draft pillar |
|---|---|
| delivery (BBB, inner ear, intracellular) | 3 · universal cellular access |
| post-mitotic, fibrosis outcompetes, positional identity lost | 4 · cell-state editing |
| silent until irreversible | 1 · sensing |
| substrate is identity | 2 · target-state model |
| chronic driver persists | 5 · closed-loop verification |
| economically substituted | — *not covered by any pillar* |

Two things fall out of this.

**First, the decomposition is probably right.** Two independent derivations —
one from the technology down, one from the body up — landing on the same joints
is the best evidence either of us has that the joints are real.

**Second, the missing row is informative.** "Economically substituted" has no
pillar, because it is not a capability gap. It is the class of problem where a
good-enough B2 workaround removed the incentive to solve the real thing. A
capability-only map is structurally blind to it, and it is plausibly a large
fraction of why the frontier has not moved in some tissues. The atlas sees it;
the roadmap cannot.

**So: one project, two faces.** The roadmap is the *supply* side (what
technology can do). The atlas is the *demand* side (what in the body is still
unfixed, and what gates it). The join is the output neither produces alone:

> **Which capability, if delivered, moves the most lesions up a rung?**

That is a sentence a funder can act on, and no existing organisation can
produce it. It is also just Q5 from `design.md` with the pillars as the blockers
— the two designs were already the same question asked from opposite ends.

---

## 7. Two audiences, two doors — do not blend them

"A sick person walks in and comes out better than they ever were" is superb
recruiting copy and a serious liability in the same sentence. It will inspire
the public and repel exactly the funders, institutes and reviewers the
observatory needs. Your own risk #6 spots this; the countermeasure ("publicly
say AI-assisted") is cosmetic, because the problem isn't the AI framing, it's
the cure-machine framing.

The fix is ordering, not deletion:

- **Front door for institutions:** the capability observatory. Boring, sourced,
  dated. Leads with the grid and the bottleneck analysis.
- **Front door for the public:** the universal-repair thesis and the
  information-loss boundary. This is genuinely great writing and it is the
  desire-2 asset.

Same corpus, two entrances, and the essay does not open with the machine.

Two specific line edits regardless of which door:

- **"better than they were ever before"** is the sentence that gets screenshotted
  and used against you. Enhancement is not needed for the thesis — repair alone
  is enormous — and it imports the entire transhumanism argument on page one.
  Demote it to an open question inside the target-state section.
- **"reversing disability where desired"** — the qualifier is doing enormous
  work and it is not in the hook. Put the consent condition in the *first*
  sentence, not the fifth. As written, the opening reads as "disability is a
  defect to be removed", which is not what the rest of the draft says.

---

## 8. Missing: the adversary, and hope

Both were flagged for [[gomin-design]] and both apply here in different form.

**The adversary.** A public map that says "delivery is binding and underfunded
relative to X" is a resource-allocation claim, and someone is currently
receiving that allocation. Expect contest from incumbents, from field-specific
advocacy, and from labs whose maturity score you lowered. Design for it: every
score disputable in public, dispute history visible, reviewers named,
conflict-of-interest disclosure from day one, and — most importantly — the map
must be *pleasant to be corrected by*, or the first serious expert who engages
becomes an enemy instead of a reviewer.

**Hope is the material.** A public roadmap toward universal cure will be found by
people who are dying. Someone with ALS *will* read this, and the honest answer
the map gives them is "not in time." The "does not provide" list handles the
legal surface and does nothing about the human one. What the site says to that
person — on the page, not in a disclaimer — needs to be written *before* launch.
The lesion atlas resolves this structurally (no personal input surface, ever);
the roadmap needs the same rule stated as architecture, plus one honestly
written page.

---

## 9. Unpriced cost: review capacity

"AI proposes, humans review" is right, and the constraint is that AI proposal
throughput exceeds human review throughput within about a week. The backlog of
unreviewed proposals then *becomes* the map, and the review-state badge becomes
the thing nobody reads.

Consequences to price in now:

- Cap the *reviewed* core deliberately small. Ten sourced, dated, human-verified
  capability records beat 100 unreviewed ones, and the honest ratio should be on
  the front page.
- Recruiting **one credible domain reviewer per pillar** is a harder and more
  valuable v0.1 milestone than any software in the list. If five real
  researchers agree to review, the project exists. If none do, no amount of
  dashboard makes it real.
- Unreviewed must be visually dominant, not a small grey chip.

---

## 10. The commercial layer is seven products

Hosted dashboards, monitoring, forecast modelling, API, reports, custom modules,
challenge infrastructure, agent infrastructure. That is the spreading pattern
again, at the business-model layer.

The only one sellable before the commons exists is **capability landscape
reports** — and it doubles as the map's own content production, so the work is
not duplicated. Everything else is downstream of having an audience.

Also to state plainly so it is never evaluated on the wrong axis: **this is not
a desire-1 project.** Nonprofit commons plus consulting-shaped revenue on a
5–10 year horizon is desire-4 with a desire-2 surface. It should never be
compared to Sumzup on income, and it should not be started as a build while
Sumzup is unfinished. See [[operator-four-desires]].

---

## 11. v0.1 is a year of work

The listed v0.1 — site, rubric, 50–100 records, evidence registry, bottleneck
graph, AI proposals, review states, dashboard, monthly report, one deep module —
is a year with a team.

**The version that could exist in a weekend and tests more:**

> One essay. One sub-capability. Hand-graded. Published.
> *"State of cell-specific delivery to the CNS, 2026"* — the grid for one
> pillar × one context, every cell sourced and dated, the empty cells left
> visibly empty, and the conditional-structure forecast at the end.

That single artefact tests every load-bearing assumption: can you produce a
capability assessment a specialist respects; does anyone read it; does an expert
engage or tear it apart; does the rubric survive contact. If it lands, it is
the seed of the registry and you have your first reviewer. If it doesn't,
nothing was built and nothing was lost.

It is also, unmodified, the desire-2 asset.

---

## 12. Factual note

The specific claims (Casgevy and Lyfgenia approvals in 2023, Vyjuvek, Altos'
stated mission, NewLimit's liver/immune/vasculature programmes, Arc's virtual
cell atlas at >300M cells, HCA and BICAN scope) match my understanding and I did
not check any of them in this session. Every one needs a citation and a date
before publication — by the map's own standard, which the launch essay must
obey in public or the standard is decorative.

---

## 13. Open questions for the owner

1. ~~Is this the same project as `design.md`, or its parent?~~ **Resolved
   2026-07-26: same project.** "Human Repair Roadmap" was an older, incorrect
   name. One project, name = **Human Repair Map**, two faces (§6). Read every
   "the roadmap" in this document as "the capability face of the map".
2. **Capability face only, or both faces?** The damage face is the only one that
   can see "economically substituted" gaps (§6).
3. **Which conviction do you actually hold** — regulation-is-binding, or
   legibility-is-binding (§2)? The whole theory of change hangs on it.
4. **Essay or organisation?** §11 argues the essay comes first either way, and
   that it may be sufficient.
5. **Does enhancement stay in the thesis?** It multiplies the ethical surface
   and is not required.
