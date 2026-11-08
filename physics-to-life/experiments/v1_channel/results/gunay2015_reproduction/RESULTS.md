# Günay 2015 isopotential aCC motoneuron: reproduction with the V1 port

Model: published HH description (medium level of the V1 hierarchy), ported verbatim from the authors' XPP file. 
Every anchor below is either quoted in a readable artefact (XPP file, JATS full text, NeuroML port, independent GitHub reproduction) or computed here. 
'Reproduced' means the port matches the artefact; it says nothing about biological fidelity (the paper itself reports which recorded features the isopotential model misses).

| anchor | source | published / independent value | this port | verdict |
|---|---|---|---|---|
| A1 settled state at I = −12 pA (V and 7 gates) | XPP file `init` line | V = −54.56137733 mV, … | max abs. difference 6.6e-08 | reproduced (to solver precision) |
| A2 regular firing, CV(ISI) = 0.002 at ~50 Hz | paper text ("10 pA") | 50 Hz, CV 0.002 | I_pulse = 0 pA abs (= +12 pA from hold): 49.5 Hz, CV 0.0010; I_pulse = +10 pA abs: 91.5 Hz, CV 0.0023 | CV reproduced; the ~50 Hz rate is reproduced for a +12 pA step from the holding current — the paper's stimulus convention (absolute vs relative to the −12 pA hold) is not stated in the readable text: **unresolved ambiguity, recorded** |
| A3 large delay to first spike for small currents | paper Fig 2C (qualitative) | delays of hundreds of ms near rheobase | −1.8 pA: 326 ms; −1.5: 147; −1: 89; 0: 54; +10: 13 ms | reproduced qualitatively (values not readable) |
| A4 rheobase hysteresis (independent XPP runs, same protocol) | jrieke README | silence→tonic between −1.91 and −1.90 pA; tonic→silence between −2.72 and −2.73 pA | onset at -1.9 pA; spikes per 5 s step {'-12.0': 0, '-1.95': 0, '-1.94': 0, '-1.93': 0, '-1.92': 0, '-1.91': 0, '-1.9': 81}; down {'-12.0': 0, '-1.8': 151, '-2.7': 54, '-2.71': 49, '-2.72': 40, '-2.73': 1, '-2.74': 0} | reproduced exactly (0.01 pA resolution) |
| A5 authors' integrator vs port | XPP `meth=euler, dt=.001` | — | first 5 spike times agree to 0.05 ms; max ΔV(t) LSODA − Euler(1e-3) = 2.15 mV over 530 ms (Euler(1e-3) − Euler(2e-4) = 1.67 mV; Radau(1e-9) − Euler(2e-4) = 0.42 mV) | same equations; residual differences are the published integrator's own error |
| A6 −10 mV prepulse inactivates Kf | paper Methods | "a holding level of −10 mV inactivates the fast (Kf) component" | Kf test-pulse peak after −10 mV prepulse / after −90 mV = 0.0559 (h1∞(−10) = 2.9e-03) | reproduced |

## Published biological features the isopotential model does *not* reproduce (paper text, verified)
- recorded aCC: CV(ISI) 0.076 at ~35 Hz for a 10 pA stimulus (16.11 pF cell); the model's CV is 0.002 ("non-zero value arises from spike-frequency adaptation").
- recorded spike amplitude (~10 mV) and the depolarised inter-spike voltage offset are not reproduced by the isopotential model; the paper adds a distal spike-initiating compartment for those. These are the *biological-fidelity* limits of the medium level, kept separate from *simulation fidelity* (fine vs medium) in V1.

## Level comparison at I_pulse = +10 pA (exact-chain fine level; reduced coarse level)

| level | state dim | spikes | rate (Hz) | delay (ms) | nominal cost | wall (s) |
|---|---|---|---|---|---|---|
| fine (HH-equivalent chains) | 35 | 45 | 91.5 | 13.20 | 549745 | 7.55 |
| medium (published HH) | 7 | 45 | 91.5 | 13.20 | 94220 | 0.84 |
| coarse (instantaneous activation, single Kf inactivation) | 2 | 69 | 138.2 | 3.75 | 48312 | 1.55 |

Figures: `figures/fi_delay_cv.png`, `figures/traces.png`, `figures/integrator_check.png`, `figures/hysteresis_staircase.png`. Tables: `tables/*.csv`, `tables/summary.json`.

Total wall time 72 s. Provenance in `provenance.json`.
