# Researcher Pilot v0.4 — Does Human Repair Map improve research decisions?

## Purpose

Human Repair Map succeeds only if it causes better scientific work to happen sooner.

This pilot tests one narrow claim:

> **For a real biomedical frontier, Human Repair Map can reduce the time required to identify the important evidence, blockers and next questions without reducing scientific accuracy — and may surface useful structure a conventional literature workflow misses.**

The proving ground is scarless functional repair of adult human skin.

This is a product/scientific-validity pilot, not a clinical study. If results are later collected for formal publication or institutional research, use the appropriate ethics / human-participant review process.

## Participants

Initial target: 3–5 domain researchers with relevant expertise in at least one of:

- wound healing / fibrosis;
- skin regeneration;
- regenerative medicine;
- tissue engineering / vascularisation;
- fibroblast biology;
- cutaneous innervation;
- translational dermatology.

At least one participant should be sufficiently senior to challenge the capability decomposition itself, not merely citation details.

Do not optimize for sample size in the first round. Optimize for high-quality falsification.

## Core tasks

Each participant completes two matched research questions. Randomise which one is answered with conventional tools first and which one with HRM first.

Candidate task A:

> What are the main biological and translational blockers preventing scarless, fully functional regeneration of adult human skin after a full-thickness wound?

Candidate task B:

> Which unresolved question in adult mammalian skin regeneration is most likely to change the current research path if answered, and why?

A future round should use questions the participant is actively working on rather than benchmark questions selected by HRM maintainers.

## Condition 1 — normal workflow

Participant uses their ordinary research process: PubMed, Google Scholar, institutional tools, reference managers, review articles, personal knowledge, or other usual resources.

Record:

- start/end time;
- sources opened;
- important claims identified;
- blockers identified;
- contradictions / failed approaches identified;
- unanswered questions identified;
- confidence in the resulting answer;
- what they would read or test next.

## Condition 2 — Human Repair Map

Participant may use the website, REST API, MCP endpoint, graph exports, or an AI connected to HRM.

Record the same outcomes plus:

- HRM nodes visited;
- graph assertions they believe are wrong;
- missing nodes / edges;
- unsupported or overstated claims;
- useful evidence they did not encounter in the normal condition;
- whether the critical-path / blocker structure changed their reasoning;
- whether the ranked question list changed what they would investigate next.

## Primary success metrics

The initial pilot is descriptive; do not claim statistical significance from 3–5 participants.

### 1. Time to defensible research state

Measure time until the researcher says they have enough evidence to state:

- the key blockers;
- the evidence behind them;
- major uncertainty / disagreement;
- what they would investigate next.

Report normal workflow and HRM workflow separately.

### 2. Scientific error rate

After the task, adjudicate each material claim against primary evidence where possible.

Classify errors:

- unsupported;
- context omitted;
- animal → human overgeneralisation;
- biomarker → function overgeneralisation;
- replication overstated;
- contradiction omitted;
- dependency overstated;
- source does not support claim.

HRM is not useful if it is faster only because it produces confident errors.

### 3. Decision change

Ask:

> Did using HRM change what you would read, model, measure, collaborate on, or experiment on next?

Record the exact change and why.

### 4. Novel useful information

Count only information the researcher judges both:

- previously unknown / missed in the normal workflow; and
- relevant enough to affect their understanding or next action.

### 5. Graph falsification yield

Count:

- incorrect claims;
- missing important claims;
- wrong dependency edges;
- missing blockers;
- bad capability grades;
- misleading question rankings;
- duplicated or badly scoped nodes.

A high number in the first pilot is useful evidence. The point is to expose failure quickly.

## Secondary metrics

- number of primary sources opened;
- number of contradictory/null results found;
- number of claims with explicit provenance;
- calibration: confidence vs adjudicated correctness;
- perceived cognitive load (1–7);
- perceived trust (1–7);
- perceived usefulness (1–7);
- likelihood of using HRM in current research (1–7).

## Blinding / bias controls

HRM maintainers should not coach participants toward a preferred answer during the timed task.

Do not tell participants that a particular blocker or question is expected to rank highly.

Where practical, have a second reviewer adjudicate factual errors without knowing which condition produced the claim.

Preserve all criticism. Do not edit the graph before recording the participant's original verdict.

## Researcher debrief

Ask these questions verbatim:

1. What is scientifically wrong in the map?
2. What important thing is missing?
3. Which dependency is least defensible?
4. Which capability boundary feels artificial or badly scoped?
5. Which node was genuinely useful?
6. Did HRM surface a paper, failure, contradiction or connection you would probably have missed?
7. Did it change what you would do next?
8. What would make you trust this enough to use it during real research?
9. What would make you contribute your own results, including null results?
10. Would you recommend it to another researcher today? Why or why not?

## Pass / fail criteria for the first round

Do **not** expand aggressively to additional diseases merely because the UI is compelling.

Advance the platform if the pilot shows all three:

1. no material increase in scientific error compared with normal workflow;
2. at least some researchers report a concrete reduction in search/synthesis effort;
3. at least one credible case where HRM changes a next research action or exposes a useful missed dependency/evidence item.

Pause coverage expansion and repair the model if experts repeatedly reject the same capability decomposition, evidence semantics, or prioritisation logic.

## Output

Publish an auditable pilot record containing:

- graph snapshot hash used by each participant;
- task and condition order;
- timing;
- anonymised answers if requested;
- adjudicated errors;
- graph corrections generated;
- decision changes;
- failures and negative feedback;
- modifications made to HRM as a result.

Do not publish a marketing-only summary. The failure modes are part of the scientific product.

## Immediate review queue

Begin with records that can materially change the scarless-skin critical path rather than reviewing alphabetically.

Suggested first packet:

- `hrm:capability/dermal-architecture-regeneration-without-scar`
- `hrm:capability/fibrogenic-fibroblast-lineage-control`
- `hrm:capability/organised-microvascular-network-in-regenerated-dermis`
- `hrm:capability/hair-follicle-neogenesis-after-wounding`
- `hrm:capability/cutaneous-sensory-reinnervation`
- `hrm:capability/native-ecm-organisation-reconstruction`
- `hrm:question/what-limits-regeneration-in-mus-and-human`
- `hrm:question/en1-inhibition-translates-to-human-skin`
- `hrm:question/organised-microvasculature-in-thick-regenerated-tissue`
- `hrm:question/wound-induced-hair-neogenesis-in-human-skin`

The first goal is not to turn 326 records green. It is to find out whether the **highest-leverage branch of the graph is scientifically defensible**.
