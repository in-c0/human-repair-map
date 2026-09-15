# 2026-09-14 — V1: the published Günay 2015 aCC motoneuron model ported; reproduction; constructed fine levels

Owner execution order (ADR-0006): identify usable published models → reproduce at least one
published electrophysiology result → establish the fine/medium/coarse hierarchy → validate
each level numerically → freeze the preregistration. This entry covers the first four.

## 1. Published model chosen and ported (ADR-0007)
The Günay et al. 2015 isopotential aCC/MN1-Ib larval motoneuron model is the only
*Drosophila* neuron model whose complete equations, parameters, stimulus protocol, initial
state **and** reported behaviour were readable here (XPP file + NeuroML2 port in the authors'
GitHub repository; JATS full text mirrored on GitHub; Megwa 2023 Python reimplementation of
the same channel set; an independent third-party XPP reproduction with quantitative numbers,
jrieke/drosophila-dynamics). Ported verbatim to `src/physics_to_life/v1/systems/gunay2015.py`.
Channels: Ks (Shab-like, m⁴), Kf (A-type, m⁴(0.95h₁+0.05h₂)), NaT (m³h), NaP (m); C = 4 pF.

## 2. Reproduction (`experiments/v1_channel/results/gunay2015_reproduction/RESULTS.md`)
| anchor | result |
|---|---|
| settled state at −12 pA quoted in the XPP file (V + 7 gates, 17 digits) | reproduced to 7e-8 |
| reported CV(ISI) = 0.002 at ~50 Hz | CV 0.0010–0.0023 across 0–10 pA; 49.5 Hz for a +12 pA step from the −12 pA hold (0 pA absolute); 91.5 Hz for +10 pA absolute — the paper's stimulus convention is not stated in the readable text: **ambiguity recorded, not resolved** |
| large delays to first spike near rheobase (Fig 2C, qualitative) | 326 ms at −1.8 pA, 147 at −1.5, 89 at −1, 54 at 0, 13 at +10 pA |
| independent XPP staircases (jrieke README): silence→tonic between −1.91/−1.90 pA; tonic→silence between −2.72/−2.73 pA | **reproduced exactly at 0.01 pA resolution** with both the port (LSODA) and a forward-Euler re-integration of the XPP equations (dt = 0.001 ms) |
| authors' integrator (Euler, dt 0.001) vs port | first spikes agree to 0.05 ms; the 2 mV end-of-train phase drift is the published integrator's own error (Euler 1e-3 vs 2e-4: 1.7 mV; Radau vs Euler 2e-4: 0.4 mV) |
| −10 mV prepulse inactivates Kf (Methods) | Kf peak after −10 mV / after −90 mV = 0.056 |

Biological features the paper says the isopotential model misses (recorded CV 0.076 at ~35 Hz;
spike amplitude; inter-spike voltage offset) are recorded as the *biological-fidelity* limit of
the medium level and are not touched by V1's fine-vs-medium ("simulation fidelity") question.

## 3. Hierarchy (ADR-0007)
- **Medium = the published model** (nothing fitted).
- **Fine = constructed Markov schemes fitted to the published HH currents** on a declared fit
  family (activation steps −40…+40 mV from −90; 200-ms prepulse inactivation; twin-pulse
  recovery). Kf: Zagotta–Hoshi–Aldrich topology (4 subunit steps + concerted opening) +
  N-type inactivation from O + C-type component + open-channel block state. NaT:
  activation chain with inactivation coupled to the open state and recovery through a
  closed state (cycle-consistent). Ks, NaP: exact HH-equivalent chains (fine == medium) —
  negative-control channels.
- **Coarse = reduced model**: instantaneous activation, Kf slow inactivation dropped (2 states).
- Level B (alternate formulation for cross-model tests): Kf-B sequential 8-step chain with
  two step types, closed-state inactivation, C-type after N-type; NaT-B open-state-only
  inactivation with a slow inactivated state.
- Fit results: see §5 (appended when the fits finished).

## 4. Two pilot-machinery bugs found and fixed while generalising the system
Both affected only the pilot on provisional placeholder parameters (a machinery check; no
claim was made from it):
1. Instance variability was applied *independently* to the Markov transitions and the HH
   gates, so the levels were no longer descriptions of the same cell (the "exact" channel
   became inexact per instance). Now: per-cell kinetic multipliers by shared scale key,
   applied identically at every level (`sample_instance` → `intrinsic_scales`).
2. The constructed open-channel block transition was active (concentration 1) whenever
   no block intervention was present, because a missing scale key defaulted to 1. Now the
   drug concentration key is always set (0 = no drug).
Also fixed: the per-split RNG stream used Python's salted `hash(str)` (non-deterministic
across processes); replaced by `zlib.crc32`.
All 22 tests pass (V0 8, V1 machinery 5 + 4 policy, Günay port 5).

## 5. Fit quality of the constructed fine levels
Normalised RMS over the fit family (each trace normalised by its own peak current), best of 4
seeded multi-starts (`experiments/v1_channel/hierarchy/gunay2015_fine.json`):

| entry | form | RMS | worst protocols | parameters |
|---|---|---|---|---|
| Kf | coupled | 0.057 | act_+40 0.089; act_+20 0.080 | 23 |
| NaT | sigmoid | 0.040 | act_-30 0.155; act_-20 0.124 | 16 |
| Kf_B | coupledB | 0.029 | act_-20 0.057; act_-40 0.050 | 23 |
| NaT_B | B | 0.044 | act_-30 0.176; act_-20 0.133 | 15 |

Rejected forms (recorded in the JSON): Kf_eyring 0.158, Kf_sequential_uncoupled_B 0.117, NaT_eyring 0.040. The decisive structural ingredient for Kf was
**closed-state inactivation**: the published HH Kf has an independent inactivation gate with
h∞ midpoint −45 mV, i.e. substantial steady-state inactivation at voltages where m∞⁴ ≈ 0, which
a scheme that inactivates only from the open state cannot reproduce (16 % RMS, dominated by
the prepulse traces). Allosterically coupled inactivated chains (Kv4/Shal-type closed-state
inactivation; coupling degree fitted, reversibility enforced) brought the floor to 5.8 % (level
A, concerted-opening topology) and 2.9 % (level B, sequential two-step topology). Saturating
(sigmoid) rate forms were needed because the published τ tables have floors that Eyring rates
cannot represent. NaT's residual (4 %) sits in the steep part of activation (−30/−20 mV steps).
Several level-A parameters sit at their bounds (activation charges at z = 4; C-type on-rate at
its cap); the fine levels are what they are — constructed, documented, and the floor enters
the preregistration's tolerance reasoning (§14 iii).

The analytic voltage-clamp solvers (HH closed form; Markov eigendecomposition) agree with
the ODE integrator to 1e-10 relative and made each fit ~1–5 min.

## 6. Hierarchy validation, first pass: two fitting defects found and fixed (before any label was used)
The first validation run of the assembled hierarchy showed that the fine Kf level was
**97 % inactivated at steady state for every holding potential** (HH availability 0.999 at −90
mV) and the fine NaT had **no steady-state inactivation at rest** (availability 1.00 at −50 mV
vs HH 0.84), while both had passed the fit family with 3–6 % RMS. Causes:
1. **Objective dilution.** Residuals were normalised by the trace peak and averaged over all
   samples, so a 30-ms test pulse inside a 250-ms prepulse protocol contributed almost nothing:
   a 16 % peak error after a −50 mV prepulse showed up as 1.3 % RMS. Fixed: residuals are
   normalised by peak × √(number of active samples), i.e. the objective is the mean squared
   relative error over the samples where the target current is non-negligible.
2. **Unconstrained rest state.** Every fit protocol started from −90 mV, so a scheme could be
   inactivated at rest and *recover on depolarisation* to produce the transient — a degenerate
   solution the family could not exclude. Fixed: steady-state holds at −70, −60, −55, −50 mV
   with a test step were added to both families (the analytic solver starts from the exact
   steady state, so these pin the rest-state availability directly).
A third defect was in the analysis, not the fit: the spike detector's default threshold (0 mV)
missed the published model's spikes, which peak near −1 mV; the default is now −25 mV (the
reproduction report used −25 mV explicitly and is unaffected). No label, verdict or figure had
been produced from the defective hierarchy; the pilot was restarted after the refit.

## 7. (2026-09-15) Anchored rate forms, level assignment, reference integrator, AP-clamp constraint
- **Anchored forms.** Rates with an HH counterpart are now the published HH rates × a fitted
  multiplier × an exponential tilt; only structure without a counterpart has free rate
  functions. Floors (RMS over active samples): sequential two-step Kf 5.1 %, ZHA concerted Kf
  9.5 %, coupled NaT 5.9 %, open-state NaT 6.0 %. Level A = the smaller floor per channel
  (ADR-0007 amendment). Rejected forms and their floors are kept in the parameter file.
- **Reference integrator.** On the level-A fine model in current clamp (33 states, 530 ms,
  68 spikes): Radau rtol 1e-9 154 s; Radau 1e-7 71 s; LSODA 1e-9 20 s; working LSODA 1e-6
  12 s. All agree to ≤ 0.03 mV with identical spike times. The hidden truth is therefore
  LSODA 1e-9 / 1e-11 (7.5× cheaper than Radau at the same tolerance, no measurable difference).
- **A 50 % firing-rate discrepancy at baseline.** The assembled hierarchy fired 68 spikes per
  500 ms at 10 pA against the published model's 45: the step families from −90 mV, even with
  rest-state holds, do not constrain the currents along a physiological spike trajectory
  (fine-vs-medium current under the published model's own spike waveform: 9 % RMS, 36 % max
  for Kf; 9.5 % / 28 % for NaT). Fix: an **action-potential-clamp** trace (the published
  model's V(t) under the 10 pA step, 10–60 ms, 0.2-ms segments, weight 4) is added to both
  fit families — standard practice for constraining channel models in the physiological
  regime — and the four levels are refitted from their current solutions. The scientific
  point stands: the fine levels must reproduce the published behaviour at baseline (Level C
  fidelity of the medium is what we have), so that closure error appears where interventions
  and evaluation protocols engage the extra structure, not everywhere.
