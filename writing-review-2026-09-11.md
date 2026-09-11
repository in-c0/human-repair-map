# Writing review — humanrepairmap.com (11 September 2026)

Reviewed against the writing rulebook at https://github.com/in-c0/writing-skill
(now installed at `~/.claude/skills/writing/` and applied to all future content work).

Scope: every string a visitor reads on the live site (`index.html`, `content/thesis.js`,
`content/collaboration.js`, `content/leverage.js`, meta tags), the MCP docs page
(`mcp/src/docs.js`), and the README. Records themselves (`records/`) were not rewritten;
they are data and carry their own review state.

The rulebook's own test: *the reader should notice the idea before they notice the prose.*
On this site the reader often notices the prose first. The ideas are good. The writing
keeps stopping to tell you so.

---

## 1. What already works (keep this)

These are the voice. The rewrite preserves them.

- **Honesty on the face of the record.** "0 of 326 records have been reviewed by a human",
  "Resolved is not reviewed", the drift box ("demonstrated vs claimed"). This is the
  project's real distinction and it is written plainly.
- **Concrete examples doing the arguing.** Brineura reaching the brain but not the retina.
  The Capsida death. SNIFF, n=289, P=.98. The PRECISE catheter audit. These teach more
  than any pull-quote on the site.
- **The standing note.** "Written by an independent builder, not a neuroscientist or
  clinician. No lab, no funding, no position in the field." This is rule 14 done right:
  the narrator is useful, not grand.
- **The conviction section's structure.** Three explanations, two conceded as true, the
  third marked as a hypothesis the author has an incentive to believe. Good reasoning,
  visibly shown. It only needs its clinchers trimmed.
- **Plain UI labels.** "in a rodent", "in humans, once", "in humans, independently".
  Readers do not need to decode these.

## 2. Site-wide problems

### 2.1 The reader cannot tell what the site is about (rules 1, 10, 18)

The front door is the cell-type grid with the headline "We can watch the body fail in high
resolution, and do almost nothing about it." The sidebar says "evidence commons · v0.1".
The thesis masthead says "0 of 16 records reviewed". Methods says "domain covered: CNS
delivery (16 routes)". The grid says v0.2. The README and the MCP endpoint describe a
v0.3 graph with 326 records and two public maps that the website does not show anywhere.

A first-time reader is asked to admire a finding before being told what they are looking
at, what the two maps are, or how to read a grade. The owner's brief is explicit: the
website should let the reader choose Universal Repair or Rejuvenation. Nothing on the
site mentions either.

**Fix:** a plain entrance page that says what this is, offers the two maps and the full
graph, and tells the reader how to read a record before they open one. Version and
counts read from the graph manifest, not hard-coded.

### 2.2 Nearly every paragraph ends with a clincher (rules 2, 11, 27, 30)

A sample, one per page, all from the live site:

| Page | Clincher |
|---|---|
| Thesis | "Not a gene. Not a molecule. Not the cell itself." |
| Thesis | "a normative problem wearing a technical costume" |
| AI + human | "Verification is becoming cheap. Judgment is not." |
| AI + human | "Sensors do not adjudicate causal attribution." |
| AI + human | "an evidence commons with nobody accountable is just a confident website." |
| AI + human | "A map that has been publicly right is the only kind worth consulting." |
| AI + human | "An evidence commons dies if it is a website people are supposed to visit. It lives if it becomes infrastructure other systems reach for." |
| Leverage | "That is the whole finding, and it is what the toggles let you attack." |
| Corrections | "A commons that only logs typos is not being audited." |
| Corrections | "The map's authority comes from being correctable in public, not from being finished." |
| Methods | "Two jumps carry the weight." |
| Grid | "Seeing and verifying are largely solved. Changing anything is not." |

Any two of these would land. Twelve in a row is a register, and the register is
keynote. The rulebook calls this "prose that is repeatedly staging importance". Each
one is individually defensible; the cluster is the problem.

**Fix:** keep the two or three that carry information a plain sentence cannot ("Resolved
is not reviewed" earns its place; so does the drift box). Let the rest end when the
thought is finished.

### 2.3 "Not X but Y" and triads (rule 11)

"Not a gene. Not a molecule. Not the cell itself." · "routing, not authority" · "This is a
model, not a measurement" · "Measured, not claimed" · "Ordered by dependency, not by
date" · "described by what becomes possible, not when it arrives" · "Errors are
published, not quietly patched" · "Cite the record, not the map" · "not a verdict on a
company". The contrast form appears roughly thirty times across the site. Several are
useful distinctions. Their density makes the useful ones read as tics.

### 2.4 Metaphor hopping (rule 12)

Within the thesis and collaboration pages: the system has "organs"; the future arrives
"as fragments" through "narrow doors"; editing power "walks into the territory cancer
exploits"; grounding is a "pyramid" with a "base" and an "apex"; the commons is a
"navigational instrument" and elsewhere "infrastructure other systems reach for"; the
rungs are a "ladder" that things "die" on. Each is fine alone. Together they ask the
reader to change picture every few paragraphs. The ladder metaphor is load-bearing
(L0–L5 are literally called rungs) so it stays; the rest go.

### 2.5 Three grading vocabularies on one site (rule 7)

- v0.1 capabilities: "maturity 38/100 · emerging · interval 30–46 · rubric v0.1"
- v0.1 routes and v0.2 grid: "rung L2"
- v0.3 graph: "grade.rung L2 · measured · blocked by science/framework"

A reader who learns one has to relearn the others. The graph's vocabulary (rung, measured,
blocked) is the one the machine interface uses, so the site should use it everywhere and
retire the 0–100 score from public view.

### 2.6 The caveat is right but phrased nine different ways (rules 7, 8)

The non-clinical warning appears in the sidebar, the overview banner, governance, the
thesis "is not" list, the route record, the methods page, the MCP docs, the manifest and
the README, each with different wording. Repeating it is correct. Rewording it each time
makes the reader re-parse it each time. One sentence, reused verbatim.

### 2.7 Em dashes as the default joint (rule 21)

The live copy uses an em dash roughly every second sentence, including inside table
cells and button labels. Most are doing the job of "because", "which", "so", or a full
stop. The rewrite uses ordinary connectives and keeps dashes where a real aside needs one.

### 2.8 Broken colour tokens in inline styles

Not a writing problem, but it affects reading: `index.html` uses `var(--bone)`,
`var(--teal)`, `var(--amber)`, `var(--red)`, `var(--green)`, `var(--card)`,
`var(--line)`, `var(--teal-line)`, `var(--red-dim)` in inline styles. None are defined in
`app.css` (the palette is `--ink`, `--accent`, `--warn`, `--bad`, `--ok`, `--surface`,
`--rule`). Those spans currently render in inherited colour. Fixed with aliases in
`app.css`.

## 3. Page by page

### Grid (`#/grid`, the current front door)

- Headline "We can watch the body fail in high resolution, and do almost nothing about
  it." is quotable and true, but it is the first sentence a visitor reads and it tells
  them nothing about what the page is. Move it below an orientation line and let the
  numbers state it.
- "the six things that aren't cells" reads as a riddle. Say what they are (matrix, scar,
  bone mineral, microbiome, neural wiring, spatial organisation).
- Good: the five column questions ("Can we measure this in a living person?"). Plain,
  concrete, reader-facing. Keep verbatim.
- The detail panel says "Select any cell in the grid to see the graded claim and its
  source." Good recovery instruction. Keep.

### Thesis (`#/thesis`)

- Hook: "Imagine a technology where a sick, injured, or disabled person walks in — and
  whatever happened to them, if they choose it, can be repaired." This is the owner's own
  frame and it works. Keep, without the dash.
- "This is possible in theory." as a stand-alone pull is dramatic typography (rule 21).
  Fold it into the lede.
- Lede packs seven conditions into one sentence. Split into a short list; a reader
  should be able to lose the thread and recover.
- "Not a gene. Not a molecule. Not the cell itself." Replace with the plain statement of
  what the unit is and why.
- The "Are these even possible?" verdicts are good content in an over-styled wrapper.
  Keep the verdicts, drop "a normative problem wearing a technical costume".
- The conviction section: keep the three-part structure and the "hypothesis, not a
  finding" line. Trim "which is a reason to be suspicious of how attractive it looks
  from here" to "which is a reason to be suspicious of it".
- The masthead says "0 of 16". The graph has 326 records. Read from the manifest.
- The v0.1 "five capabilities" with 0–100 maturity scores no longer match the graph's
  185 graded capabilities. Reframe them as the five questions the grid asks (see, model,
  reach, edit, verify), which is what they became in v0.2 and v0.3.

### Overview (`#/overview`)

Duplicates the thesis and the grid with a third layout. Its lede ("Medicine advances
through thousands of separate projects. This is the top-down question...") is the best
one-paragraph description on the site and belongs on the entrance page. The rest can go;
the map views replace it.

### Capability map, dependency graph (`#/capabilities`, `#/graph`)

Five nodes with 0–100 scores. Superseded by the graph. The loop diagram (sense → model →
reach → edit → verify) is worth keeping as an explanation of the five column questions.

### Leverage simulator (`#/leverage`)

- Premise is fine. "what it would take before anything is both broad and proven in
  humans" is the one useful compression on the page.
- The insight texts stage each step ("Start here.", "The headline just flipped.", "This is
  the world the map is arguing for."). Tone down to what happened and what it needed.
- Keep "This is a model, not a measurement" — it is a necessary distinction, said once.

### Evidence registry, open tasks (`#/evidence`, `#/tasks`)

Nine hard-coded evidence rows and six hard-coded tasks from July. The graph has 24 claims,
34 sources and 20 ranked open questions. Replace with views over the graph; the open
questions *are* the open tasks.

### AI + human (`#/collaboration`)

The most over-written page. It is also the page whose ideas matter most for the owner's
brief (AI-native infrastructure). Specific edits:

- "The bet" section opens by correcting an earlier version of itself. Interesting to the
  author; the reader has not seen the earlier version. State the position, note in one
  clause that it changed.
- The grounding ladder table is good. The three notes under it each end on an aphorism
  ("A mechanism that knows its own expiry date is more honest than one that assumes
  permanence."). Say what the mechanism is and when it stops being needed.
- "What is actually true today" — keep the can/cannot lists; they are concrete. The
  "proof" paragraph is a real example (agents correcting a regulatory-hold claim) and
  should stay, minus "and — the important part —".
- Phases A/B/C: dense, but the content is the plan. Cut clinchers; keep the Verification
  Packet, the calibration ledger, the prediction registry.
- "How it breaks" — the best table on the site. Six failure modes, each with a
  countermeasure. Keep verbatim except the intro ("a governance model that only describes
  success is decoration").
- "The adoption path" — this section is now false: it says the machine interface is
  "later" in the build order while the live box says it is "built, not planned". Rewrite
  as the "For models and agents" page, present tense, listing what actually exists (MCP
  tools, REST, OpenAPI, bulk exports, schemas, proposals, predictions, hash-chained log).

### Governance (`#/governance`)

Mostly tables; the tables are fine. The "Explicit exclusions" banner ends "Identity,
consent, and reversibility are system requirements — not an ethics appendix." Keep the
sentence, lose the dash. Merge with Methods: a reader looking for "how do I read a
grade" and "who can change a grade" is asking one question.

### Contribution queue (`#/queue`)

Good, procedural, plain. "Nothing is filtered out of view." is fine. Keep. Update the
record link so it resolves graph node ids, not only route ids.

### Methods (`#/methods`)

Mostly good. Edits: masthead counts from the manifest; "Two jumps carry the weight"
becomes a plain explanation of why L2→L3 and L4→L5 matter; the citation block says v0.1
and CNS delivery and needs the graph version and snapshot date.

### Corrections (`#/corrections`)

- "The map is wrong somewhere — every map of a moving field is." Good; keep.
- Drop "A commons that only logs typos is not being audited." and "The map's authority
  comes from being correctable in public, not from being finished." Say: two of the
  corrections changed a rung; here they are; here is how to file one.

### Route record (`#/route/…`)

"How to read this" is the right idea and should exist on every record, not only routes.
The v0.3 node view carries it.

### Meta tags

Three different descriptions (head description, og:description, twitter:description),
two of them about CNS delivery only. One description, used three times.

### MCP docs (`/mcp`)

Title "A research graph your AI can inspect, challenge and act on" is fine. Body is
already close to plain. Align the caveat sentence with the site's single version and add
the two projection ids so an agent knows what to pass.

### README

Has both a "What's in v0.1" heading (empty) and "What's in v0.3". Remove the stale
heading; align the caveat sentence; point to the site's entrance.

## 4. What the rewrite does

1. Adds an entrance page (`#/start`, the new default) that says what the site is, offers
   **Universal Repair**, **Rejuvenation**, and **Full research graph**, and explains how
   to read a record in four lines.
2. Adds map views rendered from `/graph/graph.json`: goals in the chosen projection, the
   binding constraints per goal from the structural analysis, ranked open questions, and
   every capability grouped by the five questions. Adds a node page for every graph
   record with "how to read this" and the propose-a-change form.
3. Adds a **For models and agents** page describing the machine interface as it exists.
4. Rewrites every prose string on the remaining pages to the rules above, preserving the
   examples, the standing note, the failure-mode table and the drift device.
5. Uses one grading vocabulary (rung · measured · blocked) and one caveat sentence.
6. Reads version, snapshot, counts and the human-reviewed number from the manifest.
7. Keeps the v0.2 grid and the v0.1 CNS module reachable as what they are: the body-wide
   grid, and a worked example of one capability graded route by route.

Not done, and why: the records' own `note`, `drift`, `why` and `description` fields were
left as written. They are data with provenance and a review state; editing them is a
proposal, not a copy-edit.

## 5. Addendum: files that arrived during this review

While this review was in progress, a ChatGPT agent merged two v0.4 pull requests to
`main` (PRs #4 and #5): `CONTRIBUTING.md`, `docs/researcher-pilot-v0.4.md`,
`docs/reviewer-brief-v0.4.md`, a scientific-review issue template, and a README section.
They were not rewritten here. Read against the rulebook they are mostly plain and
procedural, which is right for their genre. Two things to watch if they are edited later:

- `CONTRIBUTING.md` opens with a "not X; it is Y" sentence and a boxed slogan
  ("Humans and AI may propose. Evidence decides. Human review gates scientific
  acceptance."). The slogan is accurate and may be worth keeping as the one line a
  contributor remembers; the opening contrast is not needed.
- The reviewer brief's three-question split (source fidelity, scientific interpretation,
  capability implication) is the most useful instruction in either document and the
  website's Contribute page now points to it.

The README section for v0.4 was rewritten into the same register as the rest of the
README and links to all three documents.
