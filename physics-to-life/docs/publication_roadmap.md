# Publication roadmap

Publications are outputs of validated milestones, not marketing goals. No paper is
drafted past an outline until the milestone it reports has a review package in
`research-log/` and the pre-registered criteria have been evaluated (supported or not).

| paper | working title | gate | status |
|---|---|---|---|
| 0 | Physics-to-Life: when is explicit physics worth computing for a biological intervention? A framework, a hidden-ground-truth benchmark, and two negative results (perspective/framework) | narrowed novelty conjunction verified against MuMMI, LED/AdaLED/iLED/G-LED, SciML closures, goal-oriented adaptive modelling, uncertainty-triggered MLIP fallback, active/multifidelity simulation; V0 worked example with its conditional result and the constant-closure negative result; **V1 result: the target-conditioned VoC controller falsified on the published Günay 2015 cell (H1-V1), beaten by calibrated ensemble disagreement; H5 falsified; H9 ranking-transfer precursor passes** | outline + source map in `papers/paper0-perspective/`; **reframed 2026-09-15 around the negative result and the machinery — no manuscript may claim "target-conditioned value of computation" (final report §6)** |
| 1 | Adaptive-fidelity benchmark: does target-conditioned learned refinement improve the accuracy/compute frontier under hidden ground truth, and does it survive real biological parameterisations? | V0 (conservative H9 reading; negative result prominent) + V1 Drosophila channel/membrane results with preregistered criteria, three adjudication levels, OOD detector comparison with `false_safe_rate`, measured compute | V0 results in; **V1 results in (`research-log/2026-09-15-v1-main-run.md`; six preregistered verdicts: H1 falsified, H3 not passed, H5 falsified, H8 not passed, H9 passes as a precursor, H10 not testable) — the benchmark paper reports the negative result and the incumbent (ensemble disagreement per cost); a data-constrained fine level (final report §6, option 1) is the gate for any positive claim** |
| 2 | Drosophila virtual validation | V5 with withheld perturbation outcomes | not started |
| 3 | Inverse biological design on virtual damaged/aged systems | Level 0–2 repair tasks under model-family variation | not started |
| 4 | Historical prospective prediction | leakage-free cutoff benchmark, multiple cases, predefined scoring | not started |

Do not overclaim. A negative V0/V1 result is reported as such in Paper 1 and changes the
framing of Paper 0. **The V1 result is negative for the controller and positive for the
benchmark method (2026-09-15): Paper 0's proposition is now "which signal decides where physics
is worth computing, and how to test it against hidden ground truth", not "a learned VoC router
does". Papers 2–4 stay gated on a rung the owner has not yet chosen.**
