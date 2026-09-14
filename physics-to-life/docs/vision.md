# Vision

## The question

How much physical detail is actually necessary to predict and control living systems?

Biology is multiscale in a way that defeats uniform simulation: electronic structure sets
chemistry, chemistry sets molecular interactions, molecules build proteins, membranes and
ion channels, reaction networks make cells, cells make tissues, tissues make organisms and
their behaviour, and aging, damage, repair, regeneration and rejuvenation play out across
all of these at once. Brute-forcing every scale everywhere is impossible and, we
conjecture, unnecessary: for a given prediction or intervention, most of the physical
detail is either irrelevant or safely compressible, and only a small, changing subset of
the system needs high fidelity at any moment.

Physics-to-Life is a programme to find out whether that conjecture is true, and if it is,
to build the machine that exploits it.

## The object we are building

A learned multiscale world model that

- maintains a probabilistic **multiscale state** P(hidden state | evidence);
- carries a **causal world model** producing predictions with uncertainty;
- has a **compute controller** that decides, per query, whether to trust a surrogate, run a
  coarse mechanistic model, run a fine one, refine a specific subsystem, query another
  simulator, or request an experiment;
- feeds the resulting evidence back to update the model.

```
OBSERVATIONS / PRIOR KNOWLEDGE
            │
            ▼
   MULTISCALE STATE MODEL      P(hidden state | evidence)
            │
            ▼
     CAUSAL WORLD MODEL        prediction + uncertainty
            │
            ▼
     COMPUTE CONTROLLER        V(a) = E[relevant uncertainty reduction | a] / Cost(a)
            │
  ┌─────────┼───────────┐
  ▼         ▼           ▼
surrogate   mechanistic  experiment /
model       simulator    information query
            │
            ▼
        new evidence → update model ↺
```

Mechanistic simulators are not the master architecture. They are teachers, constraints,
generators of high-fidelity evidence, adjudicators, and fallbacks where learned
approximations become unreliable.

## What the learned model must solve

Coarse-to-fine reconstruction · fine-to-coarse compression · closure terms · missing
physics · hidden-state inference · uncertainty estimation · fidelity allocation ·
simulator disagreement · amortisation of expensive calculations · cross-scale causal
relevance.

## Core hypothesis (falsifiable)

A learned hierarchical world model can predict biological dynamics and interventions
efficiently by querying explicit lower-level physics only where uncertainty, causal
relevance, or out-of-distribution conditions require it.

Operational form: for a target observable and error tolerance there exists a substantially
cheaper adaptive mixture of learned and mechanistic models than uniform high-fidelity
simulation, preserving intervention-relevant accuracy — and a learned controller can find
it. The registry in `hypotheses.md` decomposes this into H1–H10 with explicit
falsification criteria. **We do not build under the assumption that it is true.**

## Why start with virtual systems

Virtual worlds with fully known hidden state let us score not only *what* the model
predicts but *how it decided what to compute*: did it refine the subsystem that mattered,
did it avoid irrelevant expensive simulation, was its uncertainty calibrated, did it detect
when its surrogate was out of distribution. We are not building an emulator; we are testing
whether a system can learn to do efficient scientific reasoning over a physical system.

## Why Drosophila

Whole-CNS connectomics gives a near-complete structural scaffold for a complex organism,
with a century of genetics, electrophysiology, development, regeneration, aging and
behaviour behind it. The connectome is not the organism and not a physical brain state; it
is a scaffold into which progressively richer physical models are embedded, with missing
biology (neuromodulation, gap junctions, channel identities, glia, synapse strengths)
treated as explicit uncertainty, never hand-waved.

## The validation ladder

V0 analytically tractable dynamical system → V1 small synthetic biochemical system →
V2 ion channel / membrane → V3 conductance-based neuron → V4 small circuit → V5 Drosophila
circuit → V6 broader CNS context. Rungs are not skipped when skipping would make
scientific validity hard to debug.

## Physics compilation

Fine simulation should not run forever. Metastable states become Markov models; QM/MD
runs become surrogates with OOD detection that returns to the fine model when needed. The
platform tracks where compilation succeeds and where it fails.

## Causal refinement, not spatial refinement

"Zoom in" does not mean spatially nearby. The relevant chain may run behaviour → motor
circuit → specific neuron → specific conductance → specific channel state → specific
mutation. Refinement follows causal relevance to the target observable. The system should
eventually answer: *which hidden state variable is limiting my ability to predict this
outcome?*

## The miniature Human Repair Map

Forward: state + intervention → future state. Inverse: damaged/aged state + healthy target
→ intervention policy. Target health is a region, not a point. A repair objective balances
distance to target, risk, off-target change, intervention complexity and cost. Virtual
repair tasks run from Level 0 (restore equilibrium) to Level 9 (arbitrary-state repair
within physical constraints). **No claim of biological repair is made without external
validation.** The computational claim is only ever: the policy repairs the specified
virtual organism under the tested model family.

## What would make this programme wrong

- Adaptive fidelity provides little benefit over uniform simulation (H1 false).
- Neural routing cannot detect model error before the answer is known (H3/H9 false).
- Coarse models already carry the causal structure needed for interventions (H2 false).
- Cross-scale inference is non-identifiable from coarse observations (H7 false).
- Learned abstractions do not survive simulator changes (H6 false).
- Virtual repair policies fail under simulator variation (H10 false).

Each of these is a publishable negative result. We will preserve them.

## Discipline

For every result: interpolation or causal prediction? simulator imitation or transferable
structure? genuine uncertainty or confidence-like output? biological mechanism or model
artefact? optimisation success or exploitation of simulator bugs? Always consider leakage,
distribution shift, confounding, circular validation, survivorship bias, benchmark gaming,
underdetermination, identifiability and misspecification. Run adversarial controls. Try to
break the result. Do not optimise for a journal.
