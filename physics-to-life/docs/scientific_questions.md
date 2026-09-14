# Scientific questions

Ordered by dependency: each question is only worth asking if the ones above it have
usable answers. The rung of the validation ladder at which each becomes testable is noted.

## Q1. Is physical importance sparse and dynamic? (V0→)
For a target observable, how many subsystems need fine treatment, and does that set change
with the intervention and with time? If importance is dense, adaptive fidelity cannot win.
V0 measures the minimal refinement set directly (H4).

## Q2. Can the important set be identified before the answer is known? (V0→)
From cheap information (coarse trajectory, structural scaffold, noisy prior knowledge),
can a router predict which subsystems will break the coarse closure *and* matter causally
for the target? Against what baselines: random, spatial proximity, a hand-written
failure condition, an adjoint sensitivity? (H3, H9)

## Q3. Is the routing uncertainty honest? (V0→)
Are routing probabilities calibrated, and does model disagreement rise under distribution
shift so that the controller can recognise when it should not trust itself? (H7, OOD)

## Q4. Does fine physics carry intervention-specific information? (V0→)
Can coarse models interpolate baselines yet fail on interventions? Where exactly? (H2)

## Q5. Do learned routing decisions transfer across simulators? (V0 partial → V2/V3)
Different fast-subsystem formulations, timesteps, solvers, seeds, and later force fields
and channel models. A router that only learned one simulator's transient signature is
imitation, not structure. (H6)

## Q6. When does physics compilation fail? (V1→)
Compiled surrogates / Markov models of fine subsystems: in-distribution accuracy is easy;
does the compiled model *know* when a new intervention takes it out of its domain? (H5)

## Q7. Can learned closures beat hand-derived ones on interventions? (V1→)
Not on baseline trajectories — on held-out interventions and under simulator change. (H8)

## Q8. Can hidden mechanistic state be inferred from coarse data? (V1/V3)
Posterior over channel parameters, thresholds, rate constants from coarse observations;
identifiability limits stated, not hidden. (H7 full form)

## Q9. Does any of this survive contact with real biology? (V2→V5)
Ion-channel/membrane models with published parameters; conductance-based neurons; small
Drosophila circuits with known perturbation outcomes as withheld targets.

## Q10. Can a predictive forward model be inverted for repair? (≥V1)
Level 0 (restore equilibrium) onward. What is the health manifold, what is the cost, does
the policy transfer across model families?

## Q11. Can the system rediscover known biology from pre-discovery knowledge? (V5+)
Historical prospective validation with strict cutoffs and audited provenance.

## Meta-question
Which of the above are answered "no"? A "no" to Q1–Q3 in the simplest system is the most
important possible early result, because it stops the programme before it becomes
expensive.
