# ADR-0007 — V1 system: the published Günay 2015 aCC motoneuron model as the medium level, with constructed Markov fine levels fitted to it

Date: 2026-09-14 · Status: accepted (implements ADR-0006 §1–5; precedes the V1 preregistration)

## Context
ADR-0006 fixed the V1 design: a Drosophila ion-channel → membrane bridge with a
Markov → HH → reduced hierarchy, published measurements wherever possible, three
adjudication levels, and "reproduce at least one published electrophysiology result"
before freezing the preregistration. The resource scan
(`docs/literature/drosophila_channel_electrophysiology.md`) found exactly one *Drosophila*
neuron model whose complete equations, parameters, stimulus protocol and initial state are
readable in this environment and whose authors report quantitative behaviour: the
isopotential aCC/MN1-Ib larval motoneuron model of Günay et al. 2015 (PLoS Comput Biol
11:e1004189; XPP + NeuroML2 code at github.com/cengique/drosophila-aCC-L3-motoneuron-model
= ModelDB 152028; channel set reused verbatim by Megwa et al. 2023, ModelDB 267620; an
independent third-party XPP reproduction with quantitative rheobase/hysteresis numbers at
github.com/jrieke/drosophila-dynamics). The primary Shaker Markov papers (Zagotta–Hoshi–
Aldrich 1994; Schoppa–Sigworth 1998) are cited only by structure: their rate tables live
behind publisher hosts that this environment cannot reach.

## Decision
1. **System.** V1's membrane is the Günay 2015 isopotential model, ported verbatim
   (`src/physics_to_life/v1/systems/gunay2015.py`): C = 4 pF; leak 6.8 nS / −55 mV;
   E_K = −80, E_Na = +45 mV; Ks (Shab-like, m⁴, 50 nS), Kf (A-type, m⁴(0.95 h₁ + 0.05 h₂),
   24.1 nS), NaT (O'Dowd & Aldrich 1988 kinetics, m³h, 100 nS), NaP (DmNav10, m, 0.8 nS);
   stimulus: −12 pA hold, 500 ms pulse from t = 10 ms. The XPP file's `hinfK2` is kept as
   written (the file's own comment calls it a mistake; the NeuroML port and Megwa 2023 keep
   it, so the *published* model is the one with it).
2. **Medium level = the published model.** This is the level whose biological fidelity is
   documented by the authors (reproduces the f–I relation, delay to first spike and firing
   regularity; misses spike amplitude and the inter-spike voltage offset). Nothing in the
   medium level is fitted by us.
3. **Fine level = constructed Markov schemes with more kinetic structure, fitted to the
   published HH currents on a declared fitting protocol family**
   (`gunay2015_fine.py`, parameters in `experiments/v1_channel/hierarchy/gunay2015_fine.json`
   with fit diagnostics and provenance):
   - Kf: sequential four-subunit activation + concerted opening step (Zagotta–Hoshi–Aldrich
     topology), N-type inactivation from the open state, a slow C-type component, and a
     state-dependent open-channel block state (block rates constructed, used only by the
     block intervention family);
   - NaT: three-subunit activation with inactivation coupled to the open state and recovery
     through a closed state (Kuo–Bean-type coupling), cycle-consistent by microscopic
     reversibility;
   - Ks and NaP: the chain *exactly equivalent* to the HH gates (5 and 2 states). Fine ==
     medium for these two by construction; they are negative-control channels — a correct
     router must learn never to refine them, and any measured "gain" from refining them is
     the numerical noise floor (the V0 lesson about oracles exploiting solver noise).
   The declared fit family is: activation steps from −90 mV, 200-ms prepulse inactivation,
   twin-pulse recovery, and steady-state holds at rest-like potentials (−70…−50 mV) with a
   test step; residuals are normalised per protocol by the peak current and the number of
   active samples (a first version without the holds and with whole-trace RMS admitted a
   degenerate "inactivated at rest" solution and was discarded; research log 2026-09-14 §6).
   Every fine-level rate constant is **CONSTRUCTED** (fitted to the published HH currents on
   the fit family), never a measurement; the docstrings and the JSON say so. Fine-vs-medium
   differences therefore appear where the added kinetic structure matters — outside the fit
   family and under interventions that engage it — which is the routing question, and are
   not biological claims.
4. **Coarse level = reduced model:** instantaneous activation for every channel (m = m∞(V)),
   dynamic inactivation gates only, Kf's slow inactivation component dropped. State
   dimension 2 (h_Kf, h_NaT) against 7 (medium) and 35 (fine, with the exact chains;
   ~24 with the constructed ones).
5. **Additions that leave the published model unchanged at reference conditions:** a Q10
   (default 3, applied to every rate at every level; the published kinetics are assigned to
   25 °C) for the temperature family, and a Nernst shift of the published E_K for the
   extracellular-K⁺ family (E_K(K_o) = −80 mV + (RT/F) ln(K_o / 5 mM)). Both are inert at
   25 °C / 5 mM (tested).
6. **Interventions map to the same physical rate at every level** through shared scale keys
   (activation, inactivation, recovery, C-type, opening step, density, block), so the
   levels remain descriptions of one cell. The one intervention the cheap levels cannot
   represent faithfully — the concerted-opening-step change (ILT-like) — is mapped at the
   cheap levels to the best-faith surrogate (τ_m scaled) and is an OOD family. Instance
   variability (inter-cell kinetic/conductance jitter) is applied through the same keys.
   (This replaced the pilot machinery's per-level independent jitter, which had made the
   provisional "exact" channel inexact; and a pilot bug in which the constructed block
   transition was active without a drug is fixed. Neither affected any reported claim: the
   pilot on provisional parameters was a machinery check only.)
7. **Adjudication.** Level A = the fine model at tight tolerance (hidden truth); Level B =
   an independently formulated fine model (alternate Markov topologies for Kf and NaT
   fitted to the same family; to be built before the preregistration is frozen); Level C =
   the published/independent observations of the medium level (below) plus the recorded
   aCC features the paper reports the model misses.
8. **What "reproduced a published result" means here** (`experiments/v1_channel/results/
   gunay2015_reproduction/RESULTS.md`): the port matches (i) the settled state quoted in the
   XPP file to solver precision, (ii) the reported CV(ISI) ≈ 0.002 and ~50 Hz firing, (iii)
   the reported large delays to first spike near rheobase, (iv) the independently reported
   rheobase hysteresis (silence→tonic between −1.91 and −1.90 pA; tonic→silence between
   −2.72 and −2.73 pA) exactly, (v) the authors' Euler integration, and (vi) the −10 mV
   prepulse inactivation of Kf. One ambiguity is recorded, not resolved: the paper's "10 pA"
   stimulus gives ~50 Hz only if read as a step of +12 pA from the −12 pA hold (0 pA
   absolute); read as +10 pA absolute it gives 91 Hz.

## Consequences
- The V1 preregistration names this system, these three levels, the fit family (which is
  *excluded* from evaluation protocols where it would make fine ≈ medium trivially), and
  the negative-control channels.
- Channel naming: the A-type current is "Kf" (Shaker/Shal composite in this cell type per
  the source), so the loss-of-function family is "Kf loss", not "Shaker loss".
- Biological-fidelity claims are limited to what the medium level reproduces per the
  authors; fine-level behaviour under interventions is simulation fidelity only.
- If the fits of the constructed fine levels cannot reach a small residual on the fit
  family (target: normalised RMS ≲ 5 % of the peak current per protocol), the hierarchy is
  reported as such and the tolerance in the preregistration is set relative to that floor.

## Amendment 2026-09-15 — level A/B assignment by fit floor; anchored rate forms
The constructed Kf schemes were refitted with HH-anchored rates (every rate with an HH
counterpart is the published HH rate × a fitted multiplier × an exponential tilt; only the
structure without an HH counterpart — concerted step, second step type, coupling factors,
C-type, slow state, closed-state recovery — has free rate functions), on the corrected fit
family and objective (research log 2026-09-14 §6). Floors (RMS over active samples):
sequential two-step Kf topology 5.1 %; ZHA concerted-opening Kf topology 9.5 %; NaT coupled
with closed-state recovery 5.9 %; NaT open-state-only with slow state 6.0 %.
**Decision:** level A (the hidden truth) is the formulation with the smaller fit floor for
each channel — Kf: the sequential two-step topology; NaT: the coupled scheme with
closed-state recovery — so that fine-vs-medium closure error on the fit family is as small
as the constructions allow and the error the router faces comes from structure engaged by
interventions and evaluation protocols. The ZHA concerted-opening Kf scheme and the
open-state-only NaT scheme are level B. Both remain constructed; the earlier statement
that level A is the ZHA topology is superseded. Both NaT forms converge to nearly the same
solution (the closed-state recovery path is driven to negligible rates), so the NaT
cross-formulation contrast is weaker than the Kf one; this is recorded, not hidden.

## Amendment 2026-09-15 (2) — NaT fine level: coupling fixed by design; AP-clamp constraint
Two further findings changed the NaT construction. (i) With the step families alone (even with
rest-state holds), the constructed fine levels fired at 50 % higher rates than the published
model at the same current: step protocols from −90 mV do not constrain the currents along a
spike trajectory. An **action-potential clamp** trace (the published model's own voltage
trajectory under the 10 pA step) was added to both fit families. (ii) The open-state-coupled
NaT schemes remained far too excitable (47 vs 17 spikes at −1 pA), because a scheme that
cannot inactivate closed channels carries much more current near threshold than the
published independent gate; and a Kuo–Bean-type coupled chain with *free* coupling collapses
onto the HH gate exactly (a richer model constrained only by the reduced model's outputs
recovers it). **Decision:** level-A NaT is the coupled chain with the coupling **fixed by
design**: inactivation from activation state j at kon·3^j (closed channels inactivate 3×
more slowly per activation step; recovery state-independent), anchored rates refitted. Fit
floor 2.5 % (2.6 % under the spike waveform); baseline firing differs from the published
model moderately and in both directions (24 vs 17 spikes at −1 pA, 43 vs 45 at 10 pA, 61 vs
67 at 40 pA), which is the informative regime for the routing question. The coupling constant
is a design choice, not a measurement; a = 2 and a = 5 variants are fitted and kept as
robustness checks. Level-B NaT stays the open-state-only formulation (a strong alternative).
