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
(to be appended)
