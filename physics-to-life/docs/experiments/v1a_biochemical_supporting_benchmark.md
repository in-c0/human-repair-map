# V1a outline — small synthetic biochemical system (SUPPORTING benchmark; not the main V1)

_Status change (owner review, 2026-09-14): another fully synthetic milestone would put too
much distance between the programme and its objective. This system is retained as an
integration test, a closure benchmark and an H5/H8 unit experiment. The main V1 is the
Drosophila ion-channel → membrane bridge (ADR-0006)._

Purpose: repeat the V0 questions in a system whose closure-failure condition is *not*
analytically crisp, and add the two hypotheses V0 cannot test (H5 physics compilation,
H8 neural closure).

## Candidate system
A compartmental enzymatic cascade (K compartments, each with substrate S_k, enzyme E_k,
complex C_k, product P_k) coupled by transport of products between compartments along a
sparse directed graph (the scaffold).

- Fine: full mass-action kinetics of E + S ⇌ C → E + P per compartment (fast complex
  dynamics), optionally stochastic (Gillespie / τ-leaping) for the low-copy compartments.
- Medium: quasi-steady-state (Michaelis–Menten) closure of C_k; valid when E_k ≪ S_k + K_M.
- Coarse: linear kinetics (first-order in S_k).
- Interventions: enzyme over-expression (violates QSSA in that compartment), competitive
  inhibitor pulses, substrate boluses, transport knock-downs ("mutations").
- Target: product flux into a readout compartment over a window.

Closure failure is now graded (the QSSA validity parameter varies continuously) rather
than a fold, and its location depends on the intervention through a validity condition
that is known only approximately (E_k and K_M observed with noise).

## New conditions
- H8: learned closure — a neural residual on the medium model trained on fine runs,
  evaluated on held-out intervention families.
- H5: compiled surrogate of the fast subsystem (per-compartment response model) with
  ensemble OOD detection; measure whether OOD flags fire on the interventions where the
  surrogate fails.
- Cross-simulator: deterministic ODE (Radau) vs stochastic SSA reference; different
  τ-leaping step; different QSSA variants (standard vs total QSSA).

## Pre-registration checklist before running
Falsification criteria for H5/H8 in `hypotheses.md`; label definition (minimal set at
tol); comparison conditions A–F + oracle; OOD families; ablations; seed plan.
