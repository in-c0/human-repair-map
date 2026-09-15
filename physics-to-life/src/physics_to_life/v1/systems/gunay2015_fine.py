"""Constructed fine (Markov) levels for the Günay 2015 channels, fitted to the published HH
description on a declared fitting protocol family.

Status of every number here: CONSTRUCTED.  The published model (gunay2015.py) is the
medium level; the schemes below add kinetic structure documented for the channel families
(Shaker-type: sequential subunit activation with a concerted opening step, N-type
inactivation from the open state, a slower C-type component, state-dependent open-channel
block; Na channels: inactivation coupled to activation with recovery through closed states)
and their rate constants are *fitted to reproduce the published HH currents* on the fit
family, not measured.  Fine-vs-medium differences therefore live where the extra structure
matters (outside the fit family, under interventions that engage it) — which is exactly what
the V1 routing question is about — and nothing about them is a biological claim.  See
ADR-0007 and docs/experiments/v1_preregistration.md.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import numpy as np

from ..channels import Rate, SigmoidRate, ScaledRate, HHAnchoredRate, Transition, MarkovScheme, ChannelPopulation, shaker_like_scheme, HHGate
from ..membrane import MembraneSpec, Protocol
from ..markov_fit import FitFamily
from . import gunay2015 as G

V0_REF = -30.0   # mV; reference voltage of the Eyring rates


# ---------------------------------------------------------------------------
# Kf: Shaker-like scheme  C0..C4 -(gamma/delta)- O -(kon/koff)- I_N ; O -(kc)- I_C ; O -(block)- B
# theta = [log10 k_a, z_a, log10 k_b, z_b, log10 k_g, z_g, log10 k_d, z_d, log10 k_on, z_on,
#          log10 k_off, z_off, log10 k_c_on, log10 k_c_off, log10 g_factor]
# ---------------------------------------------------------------------------
KF_THETA_NAMES = ["log10_k_alpha", "z_alpha", "log10_k_beta", "z_beta", "log10_k_gamma", "z_gamma", "log10_k_delta", "z_delta",
                  "log10_k_on", "z_on", "log10_k_off", "z_off", "log10_kc_on", "log10_kc_off", "log10_g_factor"]
KF_BLOCK_KON, KF_BLOCK_KOFF = 2.0, 0.5      # 1/ms per unit concentration, 1/ms (constructed: a fast open-channel blocker,
                                            # K_D = 0.25 concentration units; block family only)


def kf_fine_channel(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: Rate(10.0 ** th[i], th[i + 1], V0_REF, q10, G.T_REF_K)   # noqa: E731
    alpha, beta, gamma, delta, kon, koff = R(0), R(2), R(4), R(6), R(8), R(10)
    kc_on = Rate(10.0 ** th[12], 0.0, V0_REF, q10, G.T_REF_K); kc_off = Rate(10.0 ** th[13], 0.0, V0_REF, q10, G.T_REF_K)
    sch = shaker_like_scheme(alpha, beta, gamma, delta, kon, koff, kc_on, kc_off, n_sub=4, name="Kf_shaker_like")
    # rename the generic scale keys of shaker_like_scheme to Kf-specific ones shared with the HH gates
    ren = {"activation": "kf_activation", "opening": "kf_opening", "inactivation": "kf_inactivation", "recovery": "kf_recovery",
           "c_inactivation": "kf_c_inactivation", "c_recovery": "kf_c_recovery"}
    for tr in sch.transitions:
        tr.scale_key = ren[tr.scale_key]
    if with_block:
        O = 5; B = sch.n_states
        sch.transitions.append(Transition(O, B, Rate(KF_BLOCK_KON, 0.0, V0_REF, q10, G.T_REF_K), "block_on:Kf"))
        sch.transitions.append(Transition(B, O, Rate(KF_BLOCK_KOFF, 0.0, V0_REF, q10, G.T_REF_K), None))
        sch.n_states += 1; sch.open = np.append(sch.open, 0.0)
    gf = 10.0 ** th[14]
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    # the medium activation gate must also respond to the (fine-only) concerted-step key so that an
    # "opening step" intervention has a best-faith counterpart at the cheap levels (tau_m scaled)
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


# --- variant with saturating (sigmoid) rates: theta = [log10 k_max, z, v0] x 6 rates + [log10 kc_on, log10 kc_off, log10 g_factor]
KF_SIG_THETA_NAMES = [f"{n}_{q}" for n in ("alpha", "beta", "gamma", "delta", "on", "off") for q in ("log10_kmax", "z", "v0")] + \
                     ["log10_kc_on", "log10_kc_off", "log10_g_factor"]


def kf_fine_channel_sig(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: SigmoidRate(10.0 ** th[i], th[i + 1], th[i + 2], q10, G.T_REF_K)   # noqa: E731
    alpha, beta, gamma, delta, kon, koff = R(0), R(3), R(6), R(9), R(12), R(15)
    kc_on = Rate(10.0 ** th[18], 0.0, V0_REF, q10, G.T_REF_K); kc_off = Rate(10.0 ** th[19], 0.0, V0_REF, q10, G.T_REF_K)
    sch = shaker_like_scheme(alpha, beta, gamma, delta, kon, koff, kc_on, kc_off, n_sub=4, name="Kf_shaker_like_sig")
    ren = {"activation": "kf_activation", "opening": "kf_opening", "inactivation": "kf_inactivation", "recovery": "kf_recovery",
           "c_inactivation": "kf_c_inactivation", "c_recovery": "kf_c_recovery"}
    for tr in sch.transitions:
        tr.scale_key = ren[tr.scale_key]
    if with_block:
        O = 5; B = sch.n_states
        sch.transitions.append(Transition(O, B, Rate(KF_BLOCK_KON, 0.0, V0_REF, q10, G.T_REF_K), "block_on:Kf"))
        sch.transitions.append(Transition(B, O, Rate(KF_BLOCK_KOFF, 0.0, V0_REF, q10, G.T_REF_K), None))
        sch.n_states += 1; sch.open = np.append(sch.open, 0.0)
    gf = 10.0 ** th[20]
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


def kf_sig_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Initial guess: activation on/off rates saturating at the HH tau floor; concerted step fast;
    inactivation from the h1 table's implied rates."""
    m, h1, h2 = G.kf_gates()
    # HH implied rates at the extremes give the saturation levels
    a_hi = float(m.rates(40.0)[0]); b_lo = float(m.rates(-90.0)[1])
    on_hi = float(h1.rates(20.0)[1]); off_lo = float(h1.rates(-90.0)[0])
    th0 = np.array([np.log10(a_hi), 1.2, -25.0,  np.log10(b_lo), -1.2, -35.0,
                    np.log10(8.0), 0.3, -30.0,  np.log10(0.8), -0.3, -30.0,
                    np.log10(on_hi), 0.3, -40.0, np.log10(off_lo), -0.3, -60.0,
                    np.log10(5e-4), np.log10(8e-3), np.log10(1.1)])
    lo = np.array([-3, 0.0, -90, -3, -4.0, -90, -2, -1.0, -90, -3, -3.0, -90, -3, -1.0, -90, -4, -3.0, -120, -6, -5, -0.3])
    hi = np.array([2, 4.0, 40, 2, 0.0, 40, 2, 2.0, 40, 2, 1.0, 40, 1, 2.0, 40, 1, 1.0, 20, -1, -1, 0.7])
    return np.clip(th0, lo, hi), lo, hi


def kf_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Initial guess from the HH tables' implied rates; bounds."""
    m, h1, h2 = G.kf_gates()
    V = np.linspace(-60.0, 40.0, 21)
    a, b = m.rates(V)
    ka, za = _eyring_fit(V, a); kb, zb = _eyring_fit(V, b)
    Vd = np.linspace(-10.0, 40.0, 6); Vh = np.linspace(-100.0, -60.0, 5)
    kon_d, _ = _eyring_fit(Vd, h1.rates(Vd)[1]); koff_h, _ = _eyring_fit(Vh, h1.rates(Vh)[0])
    th0 = np.array([np.log10(ka), za, np.log10(kb), zb, np.log10(5.0), 0.1, np.log10(0.5), -0.2,
                    np.log10(kon_d), 0.0, np.log10(koff_h), -0.1, np.log10(5e-4), np.log10(8e-3), np.log10(1.1)])
    lo = np.array([-3, 0.0, -3, -3.0, -2, -1.0, -3, -2.0, -3, -1.0, -4, -2.0, -6, -5, -0.3])
    hi = np.array([2, 3.0, 2, 0.0, 2, 1.0, 2, 1.0, 1, 1.0, 1, 1.0, -1, -1, 0.7])
    return np.clip(th0, lo, hi), lo, hi


def _eyring_fit(V, k):
    """log k = log k0 + z (V - V0) F/RT  by least squares."""
    from ..channels import f_rt
    x = (V - V0_REF) * f_rt(G.T_REF_K)
    A = np.vstack([np.ones_like(x), x]).T
    c, *_ = np.linalg.lstsq(A, np.log(np.clip(k, 1e-12, None)), rcond=None)
    return float(np.exp(c[0])), float(c[1])


AP_CLAMP_WEIGHT = 4.0   # the AP-clamp trace counts as four step protocols in the objective


def kf_fit_family(dt_out: float = 0.1, ap_clamp: bool = True) -> FitFamily:
    P, N, W = [], [], []
    # -30 mV is the most negative step with a resolvable Kf current (peak at -40 mV is < 0.01 pA and would only amplify noise)
    for v in (-30.0, -20.0, 0.0, 20.0, 40.0):
        P.append(Protocol("vclamp", [(0.0, -90.0), (20.0, v), (120.0, -90.0)], 150.0, dt_out)); N.append(f"act_{v:+.0f}"); W.append(1.0)
    for vp in (-80.0, -60.0, -50.0, -40.0, -30.0, -10.0):
        P.append(Protocol("vclamp", [(0.0, -90.0), (20.0, vp), (220.0, 20.0), (280.0, -90.0)], 300.0, dt_out)); N.append(f"inact_{vp:+.0f}"); W.append(1.0)
    for gap in (5.0, 20.0, 50.0, 150.0):
        P.append(Protocol("vclamp", [(0.0, -90.0), (20.0, 20.0), (70.0, -90.0), (70.0 + gap, 20.0), (120.0 + gap, -90.0)], 150.0 + gap, dt_out)); N.append(f"rec_{gap:.0f}"); W.append(1.0)
    # steady-state availability from rest-like holding potentials (the initial condition is the exact steady state)
    for vh in (-70.0, -60.0, -55.0, -50.0):
        P.append(Protocol("vclamp", [(0.0, vh), (20.0, 20.0), (80.0, vh)], 100.0, dt_out)); N.append(f"hold_{vh:+.0f}"); W.append(1.0)
    if ap_clamp:
        P.append(ap_clamp_protocol(dt_seg=0.2, dt_out=0.2, t_to=60.0)); N.append("ap_clamp_10pA"); W.append(AP_CLAMP_WEIGHT)
    return FitFamily(P, N, W)


# ---------------------------------------------------------------------------
# NaT: coupled inactivation  C0 - C1 - C2 - O ; O -(kon/koff)- I ; I -(krec)- C2 ; C2 -(kci)- I (cycle-consistent)
# theta = [log10 k_a, z_a, log10 k_b, z_b, log10 k_on, z_on, log10 k_off, z_off, log10 k_rec, z_rec, log10 g_factor]
# ---------------------------------------------------------------------------
NAT_THETA_NAMES = ["log10_k_alpha", "z_alpha", "log10_k_beta", "z_beta", "log10_k_on", "z_on", "log10_k_off", "z_off",
                   "log10_k_rec", "z_rec", "log10_g_factor"]


@dataclass
class CycleRate:
    """C2 -> I rate fixed by microscopic reversibility of the cycle C2-O-I:
    kci = krec * kon * alpha_{C2->O} / (koff * beta_{O->C2})."""
    krec: Rate
    kon: Rate
    koff: Rate
    alpha: Rate
    beta: Rate

    def __call__(self, V, T_K=298.15, scale=1.0):
        return scale * self.krec(V, T_K) * self.kon(V, T_K) * self.alpha(V, T_K) / (self.koff(V, T_K) * 3.0 * self.beta(V, T_K))


def nat_fine_channel(theta, q10: float = 1.0) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: Rate(10.0 ** th[i], th[i + 1], V0_REF, q10, G.T_REF_K)   # noqa: E731
    alpha, beta, kon, koff, krec = R(0), R(2), R(4), R(6), R(8)
    trans = []
    for i in range(3):
        trans.append(Transition(i, i + 1, alpha.scaled(3 - i), "nat_activation"))
        trans.append(Transition(i + 1, i, beta.scaled(i + 1), "nat_activation"))
    O, I = 3, 4
    trans.append(Transition(O, I, kon, "nat_inactivation"))
    trans.append(Transition(I, O, koff, "nat_recovery"))
    trans.append(Transition(I, 2, krec, "nat_recovery"))
    trans.append(Transition(2, I, CycleRate(krec, kon, koff, alpha, beta), ("nat_recovery", "nat_inactivation")))
    open_ = np.zeros(5); open_[O] = 1.0
    sch = MarkovScheme("NaT_coupled", 5, trans, open_, initial_state=0)
    gf = 10.0 ** th[10]
    m, h = G.nat_gates(q10)
    return ChannelPopulation("NaT", G.G_NAT * gf, G.E_NA, sch, [m, h], coarse_instant=[True, False], ion="Na",
                             g_scale_cheap=1.0 / gf, hh_exact=False)


def nat_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    m, h = G.nat_gates()
    V = np.linspace(-60.0, 20.0, 17)
    a, b = m.rates(V)
    ka, za = _eyring_fit(V, a); kb, zb = _eyring_fit(V, b)
    Vd = np.linspace(-20.0, 20.0, 5); Vh = np.linspace(-100.0, -70.0, 4)
    kon_d, zon = _eyring_fit(Vd, h.rates(Vd)[1]); koff_h, zoff = _eyring_fit(Vh, h.rates(Vh)[0])
    th0 = np.array([np.log10(ka), za, np.log10(kb), zb, np.log10(kon_d), 0.0, np.log10(max(koff_h, 1e-3)), -0.3,
                    np.log10(0.05), -0.5, np.log10(1.1)])
    lo = np.array([-3, 0.0, -3, -3.0, -3, -1.0, -4, -2.0, -4, -2.0, -0.3])
    hi = np.array([2, 3.0, 2, 0.0, 1.5, 1.0, 1, 1.0, 1, 1.0, 0.7])
    return np.clip(th0, lo, hi), lo, hi


def nat_fit_family(dt_out: float = 0.05, ap_clamp: bool = True) -> FitFamily:
    P, N, W = [], [], []
    for v in (-40.0, -30.0, -20.0, -10.0, 0.0, 20.0):
        P.append(Protocol("vclamp", [(0.0, -90.0), (10.0, v), (40.0, -90.0)], 50.0, dt_out)); N.append(f"act_{v:+.0f}"); W.append(1.0)
    for vp in (-90.0, -70.0, -60.0, -50.0, -40.0, -30.0):
        P.append(Protocol("vclamp", [(0.0, -90.0), (10.0, vp), (210.0, -10.0), (240.0, -90.0)], 250.0, dt_out)); N.append(f"inact_{vp:+.0f}"); W.append(1.0)
    for gap in (1.0, 3.0, 10.0, 30.0):
        P.append(Protocol("vclamp", [(0.0, -90.0), (10.0, -10.0), (30.0, -90.0), (30.0 + gap, -10.0), (50.0 + gap, -90.0)], 60.0 + gap, dt_out)); N.append(f"rec_{gap:.0f}"); W.append(1.0)
    for vh in (-70.0, -60.0, -55.0, -50.0):
        P.append(Protocol("vclamp", [(0.0, vh), (10.0, -10.0), (40.0, vh)], 50.0, dt_out)); N.append(f"hold_{vh:+.0f}"); W.append(1.0)
    if ap_clamp:
        P.append(ap_clamp_protocol(dt_seg=0.2, dt_out=0.2, t_to=60.0)); N.append("ap_clamp_10pA"); W.append(AP_CLAMP_WEIGHT)
    return FitFamily(P, N, W)


# --- NaT variant with saturating rates: theta = [log10 k_max, z, v0] x 5 + [log10 g_factor]
NAT_SIG_THETA_NAMES = [f"{n}_{q}" for n in ("alpha", "beta", "on", "off", "rec") for q in ("log10_kmax", "z", "v0")] + ["log10_g_factor"]


def nat_fine_channel_sig(theta, q10: float = 1.0) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: SigmoidRate(10.0 ** th[i], th[i + 1], th[i + 2], q10, G.T_REF_K)   # noqa: E731
    alpha, beta, kon, koff, krec = R(0), R(3), R(6), R(9), R(12)
    trans = []
    for i in range(3):
        trans.append(Transition(i, i + 1, alpha.scaled(3 - i), "nat_activation"))
        trans.append(Transition(i + 1, i, beta.scaled(i + 1), "nat_activation"))
    O, I = 3, 4
    trans.append(Transition(O, I, kon, "nat_inactivation"))
    trans.append(Transition(I, O, koff, "nat_recovery"))
    trans.append(Transition(I, 2, krec, "nat_recovery"))
    trans.append(Transition(2, I, CycleRate(krec, kon, koff, alpha, beta), ("nat_recovery", "nat_inactivation")))
    open_ = np.zeros(5); open_[O] = 1.0
    sch = MarkovScheme("NaT_coupled_sig", 5, trans, open_, initial_state=0)
    gf = 10.0 ** th[15]
    m, h = G.nat_gates(q10)
    return ChannelPopulation("NaT", G.G_NAT * gf, G.E_NA, sch, [m, h], coarse_instant=[True, False], ion="Na",
                             g_scale_cheap=1.0 / gf, hh_exact=False)


def nat_sig_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    m, h = G.nat_gates()
    a_hi = float(m.rates(20.0)[0]); b_lo = float(m.rates(-90.0)[1])
    on_hi = float(h.rates(20.0)[1]); off_lo = float(h.rates(-90.0)[0])
    th0 = np.array([np.log10(a_hi), 1.5, -30.0, np.log10(b_lo), -1.5, -45.0, np.log10(on_hi), 0.5, -40.0,
                    np.log10(off_lo), -0.5, -60.0, np.log10(0.1), -0.5, -60.0, np.log10(1.1)])
    lo = np.array([-3, 0.0, -90, -3, -4.0, -90, -3, -1.0, -90, -4, -3.0, -120, -4, -3.0, -120, -0.3])
    hi = np.array([2, 4.0, 40, 2, 0.0, 40, 1.5, 2.0, 40, 1, 1.0, 20, 1, 1.0, 20, 0.7])
    return np.clip(th0, lo, hi), lo, hi


# ---------------------------------------------------------------------------
# Level B: independently formulated fine levels (alternate topologies), fitted to the same family
#   Kf-B : sequential 8-step activation chain with two distinct step types (Bezanilla-type sequential
#          scheme, no concerted step), N-type inactivation from O and from the last closed state,
#          C-type inactivation *after* N-type (I_N -> I_C), open-channel block from O.
#   NaT-B: activation chain with inactivation from the open state only (no closed-state path) and a
#          second, slow inactivated state reached from I (I -> I2).
# ---------------------------------------------------------------------------
KFB_THETA_NAMES = [f"{n}_{q}" for n in ("a1", "b1", "a2", "b2", "on", "off") for q in ("log10_kmax", "z", "v0")] + \
                  ["log10_kon_closed_factor", "log10_kc_on", "log10_kc_off", "log10_g_factor"]


def kf_fineB_channel(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: SigmoidRate(10.0 ** th[i], th[i + 1], th[i + 2], q10, G.T_REF_K)   # noqa: E731
    a1, b1, a2, b2, kon, koff = R(0), R(3), R(6), R(9), R(12), R(15)
    fc = 10.0 ** th[18]
    trans = []
    # C0..C4: first-type steps (4 subunits), C4..C8 (=O): second-type steps
    for i in range(4):
        trans.append(Transition(i, i + 1, a1.scaled(4 - i), "kf_activation")); trans.append(Transition(i + 1, i, b1.scaled(i + 1), "kf_activation"))
    for i in range(4):
        trans.append(Transition(4 + i, 5 + i, a2.scaled(4 - i), "kf_activation")); trans.append(Transition(5 + i, 4 + i, b2.scaled(i + 1), "kf_activation"))
    O, IN, IC = 8, 9, 10
    trans.append(Transition(O, IN, kon, "kf_inactivation")); trans.append(Transition(IN, O, koff, "kf_recovery"))
    trans.append(Transition(7, IN, kon.scaled(fc), "kf_inactivation")); trans.append(Transition(IN, 7, koff.scaled(fc), "kf_recovery"))
    trans.append(Transition(IN, IC, Rate(10.0 ** th[19], 0.0, V0_REF, q10, G.T_REF_K), "kf_c_inactivation"))
    trans.append(Transition(IC, IN, Rate(10.0 ** th[20], 0.0, V0_REF, q10, G.T_REF_K), "kf_c_recovery"))
    n = 11
    if with_block:
        B = n; trans.append(Transition(O, B, Rate(KF_BLOCK_KON, 0.0, V0_REF, q10, G.T_REF_K), "block_on:Kf"))
        trans.append(Transition(B, O, Rate(KF_BLOCK_KOFF, 0.0, V0_REF, q10, G.T_REF_K), None)); n += 1
    open_ = np.zeros(n); open_[O] = 1.0
    sch = MarkovScheme("Kf_sequential_B", n, trans, open_, initial_state=0)
    gf = 10.0 ** th[21]
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    # no concerted step in this topology: the "opening step" key acts on the second-type steps in the fine
    # level (below) and on tau_m at the cheap levels, the same best-faith mapping as level A
    for tr in trans:
        if tr.src in (4, 5, 6, 7) and tr.dst in (5, 6, 7, 8) or tr.src in (5, 6, 7, 8) and tr.dst in (4, 5, 6, 7):
            tr.scale_key = ("kf_activation", "kf_opening")
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


def kfB_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    m, h1, h2 = G.kf_gates()
    a_hi = float(m.rates(40.0)[0]); b_lo = float(m.rates(-90.0)[1])
    on_hi = float(h1.rates(20.0)[1]); off_lo = float(h1.rates(-90.0)[0])
    th0 = np.array([np.log10(2 * a_hi), 1.0, -30.0, np.log10(2 * b_lo), -1.0, -40.0, np.log10(2 * a_hi), 0.8, -20.0, np.log10(2 * b_lo), -0.8, -30.0,
                    np.log10(on_hi), 0.3, -40.0, np.log10(off_lo), -0.3, -60.0, np.log10(0.3), np.log10(5e-4), np.log10(8e-3), np.log10(1.1)])
    lo = np.array([-3, 0.0, -90, -3, -4.0, -90, -3, 0.0, -90, -3, -4.0, -90, -3, -1.0, -90, -4, -3.0, -120, -3, -6, -5, -0.3])
    hi = np.array([2, 4.0, 40, 2, 0.0, 40, 2, 4.0, 40, 2, 0.0, 40, 1, 2.0, 40, 1, 1.0, 20, 0.5, -1, -1, 0.7])
    return np.clip(th0, lo, hi), lo, hi


NATB_THETA_NAMES = [f"{n}_{q}" for n in ("alpha", "beta", "on", "off") for q in ("log10_kmax", "z", "v0")] + \
                   ["log10_k_slow_on", "log10_k_slow_off", "log10_g_factor"]


def nat_fineB_channel(theta, q10: float = 1.0) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: SigmoidRate(10.0 ** th[i], th[i + 1], th[i + 2], q10, G.T_REF_K)   # noqa: E731
    alpha, beta, kon, koff = R(0), R(3), R(6), R(9)
    trans = []
    for i in range(3):
        trans.append(Transition(i, i + 1, alpha.scaled(3 - i), "nat_activation")); trans.append(Transition(i + 1, i, beta.scaled(i + 1), "nat_activation"))
    O, I, I2 = 3, 4, 5
    trans.append(Transition(O, I, kon, "nat_inactivation")); trans.append(Transition(I, O, koff, "nat_recovery"))
    trans.append(Transition(I, I2, Rate(10.0 ** th[12], 0.0, V0_REF, q10, G.T_REF_K), "nat_inactivation"))
    trans.append(Transition(I2, I, Rate(10.0 ** th[13], 0.0, V0_REF, q10, G.T_REF_K), "nat_recovery"))
    open_ = np.zeros(6); open_[O] = 1.0
    sch = MarkovScheme("NaT_open_state_B", 6, trans, open_, initial_state=0)
    gf = 10.0 ** th[14]
    m, h = G.nat_gates(q10)
    return ChannelPopulation("NaT", G.G_NAT * gf, G.E_NA, sch, [m, h], coarse_instant=[True, False], ion="Na",
                             g_scale_cheap=1.0 / gf, hh_exact=False)


def natB_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    m, h = G.nat_gates()
    a_hi = float(m.rates(20.0)[0]); b_lo = float(m.rates(-90.0)[1])
    on_hi = float(h.rates(20.0)[1]); off_lo = float(h.rates(-90.0)[0])
    th0 = np.array([np.log10(a_hi), 1.5, -30.0, np.log10(b_lo), -1.5, -45.0, np.log10(on_hi), 0.5, -40.0, np.log10(off_lo), -0.5, -60.0,
                    np.log10(1e-3), np.log10(1e-2), np.log10(1.1)])
    lo = np.array([-3, 0.0, -90, -3, -4.0, -90, -3, -1.0, -90, -4, -3.0, -120, -6, -5, -0.3])
    hi = np.array([2, 4.0, 40, 2, 0.0, 40, 1.5, 2.0, 40, 1, 1.0, 20, -1, -0.5, 0.7])
    return np.clip(th0, lo, hi), lo, hi


# ---------------------------------------------------------------------------
# Kf with inactivation coupled allosterically to activation (Kv4/Shal-type closed-state
# inactivation is documented for A-type currents with hyperpolarised h_inf; the coupling
# degree is fitted, not assumed).  Activation pathway: sequential subunit steps (+ concerted
# opening step for level A; two step types without a concerted step for level B).  Every
# activation state j has an inactivated partner reached at kon a^j and left at koff b^j; the
# inactivated chain repeats the activation transitions scaled by sqrt(a/b) so that every
# cycle obeys microscopic reversibility.  C-type inactivation follows N-type from the
# open-state partner (level A) or is a parallel slow state from O (level B); open-channel
# block from O in both.
# ---------------------------------------------------------------------------

def _coupled_scheme(act_fwd: list, act_bwd: list, act_keys: list, n_open: int, kon, koff, a: float, b: float,
                    kc_on, kc_off, ctype_from_open: bool, with_block: bool, name: str, prefix: str = "kf",
                    with_ctype: bool = True) -> MarkovScheme:
    """act_fwd[i], act_bwd[i]: rates of activation step i (state i -> i+1 and back), i < n_act-1;
    the last activation state (index n_open) is the open state.  Every activation state j has an
    inactivated partner (kon a^j / koff b^j); the inactivated chain repeats the activation steps
    scaled by sqrt(a/b) (microscopic reversibility).  a = b = 1 is exactly an independent HH-type
    inactivation gate; a, b != 1 couple inactivation to activation (Kuo-Bean type)."""
    n_act = n_open + 1
    s = np.sqrt(a / b)
    trans = []
    for i, (f, r, key) in enumerate(zip(act_fwd, act_bwd, act_keys)):
        trans += [Transition(i, i + 1, f, key), Transition(i + 1, i, r, key),
                  Transition(n_act + i, n_act + i + 1, ScaledRate(f, s), key), Transition(n_act + i + 1, n_act + i, ScaledRate(r, 1.0 / s), key)]
    for j in range(n_act):
        trans += [Transition(j, n_act + j, ScaledRate(kon, a ** j), f"{prefix}_inactivation"), Transition(n_act + j, j, ScaledRate(koff, b ** j), f"{prefix}_recovery")]
    n = 2 * n_act
    if with_ctype:
        IC = n; src = n_open if ctype_from_open else n_act + n_open
        trans += [Transition(src, IC, kc_on, f"{prefix}_c_inactivation"), Transition(IC, src, kc_off, f"{prefix}_c_recovery")]; n += 1
    if with_block:
        B = n; trans += [Transition(n_open, B, Rate(KF_BLOCK_KON, 0.0, V0_REF, 1.0, G.T_REF_K), f"block_on:{'Kf' if prefix == 'kf' else 'NaT'}"),
                         Transition(B, n_open, Rate(KF_BLOCK_KOFF, 0.0, V0_REF, 1.0, G.T_REF_K), None)]; n += 1
    open_ = np.zeros(n); open_[n_open] = 1.0
    return MarkovScheme(name, n, trans, open_, initial_state=0)


KFC_THETA_NAMES = [f"{n}_{q}" for n in ("alpha", "beta", "gamma", "delta", "on", "off") for q in ("log10_kmax", "z", "v0")] + \
                  ["log10_a", "log10_b", "log10_kc_on", "log10_kc_off", "log10_g_factor"]


def kf_fine_channel_coupled(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    th = np.asarray(theta, float)
    R = lambda i: SigmoidRate(10.0 ** th[i], th[i + 1], th[i + 2], q10, G.T_REF_K)   # noqa: E731
    alpha, beta, gamma, delta, kon, koff = R(0), R(3), R(6), R(9), R(12), R(15)
    a, b = 10.0 ** th[18], 10.0 ** th[19]
    kc_on = Rate(10.0 ** th[20], 0.0, V0_REF, q10, G.T_REF_K); kc_off = Rate(10.0 ** th[21], 0.0, V0_REF, q10, G.T_REF_K)
    fwd = [alpha.scaled(4 - i) for i in range(4)] + [gamma]
    bwd = [beta.scaled(i + 1) for i in range(4)] + [delta]
    keys = ["kf_activation"] * 4 + ["kf_opening"]
    sch = _coupled_scheme(fwd, bwd, keys, 5, kon, koff, a, b, kc_on, kc_off, ctype_from_open=False, with_block=with_block, name="Kf_coupled_A")
    gf = 10.0 ** th[22]
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


def kfc_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    m, h1, h2 = G.kf_gates()
    a_hi = float(m.rates(40.0)[0]); b_lo = float(m.rates(-90.0)[1])
    on_hi = float(h1.rates(20.0)[1]); off_lo = float(h1.rates(-90.0)[0])
    th0 = np.array([np.log10(a_hi), 1.2, -25.0, np.log10(b_lo), -1.2, -35.0, np.log10(8.0), 0.3, -30.0, np.log10(0.8), -0.3, -30.0,
                    np.log10(on_hi), 0.3, -40.0, np.log10(off_lo), -0.3, -60.0, 0.0, 0.0, np.log10(5e-4), np.log10(8e-3), np.log10(1.1)])
    lo = np.array([-3, 0.0, -90, -3, -4.0, -90, -2, -1.0, -90, -3, -3.0, -90, -3, -1.0, -90, -4, -3.0, -120, -1.0, -1.0, -6, -5, -0.3])
    hi = np.array([2, 4.0, 40, 2, 0.0, 40, 2, 2.0, 40, 2, 1.0, 40, 1, 2.0, 40, 1, 1.0, 20, 1.0, 1.0, -1, -1, 0.7])
    return np.clip(th0, lo, hi), lo, hi


KFCB_THETA_NAMES = [f"{n}_{q}" for n in ("a1", "b1", "a2", "b2", "on", "off") for q in ("log10_kmax", "z", "v0")] + \
                   ["log10_a", "log10_b", "log10_kc_on", "log10_kc_off", "log10_g_factor"]


def kf_fineB_channel_coupled(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    """Level B: sequential 8-step activation with two step types and no concerted step; coupled
    inactivated chain; C-type as a parallel slow state from O."""
    th = np.asarray(theta, float)
    R = lambda i: SigmoidRate(10.0 ** th[i], th[i + 1], th[i + 2], q10, G.T_REF_K)   # noqa: E731
    a1, b1, a2, b2, kon, koff = R(0), R(3), R(6), R(9), R(12), R(15)
    a, b = 10.0 ** th[18], 10.0 ** th[19]
    kc_on = Rate(10.0 ** th[20], 0.0, V0_REF, q10, G.T_REF_K); kc_off = Rate(10.0 ** th[21], 0.0, V0_REF, q10, G.T_REF_K)
    fwd = [a1.scaled(4 - i) for i in range(4)] + [a2.scaled(4 - i) for i in range(4)]
    bwd = [b1.scaled(i + 1) for i in range(4)] + [b2.scaled(i + 1) for i in range(4)]
    keys = ["kf_activation"] * 4 + [("kf_activation", "kf_opening")] * 4
    sch = _coupled_scheme(fwd, bwd, keys, 8, kon, koff, a, b, kc_on, kc_off, ctype_from_open=True, with_block=with_block, name="Kf_coupled_B")
    gf = 10.0 ** th[22]
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


def kfcB_theta0() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    m, h1, h2 = G.kf_gates()
    a_hi = float(m.rates(40.0)[0]); b_lo = float(m.rates(-90.0)[1])
    on_hi = float(h1.rates(20.0)[1]); off_lo = float(h1.rates(-90.0)[0])
    th0 = np.array([np.log10(2 * a_hi), 1.0, -30.0, np.log10(2 * b_lo), -1.0, -40.0, np.log10(2 * a_hi), 0.8, -20.0, np.log10(2 * b_lo), -0.8, -30.0,
                    np.log10(on_hi), 0.3, -40.0, np.log10(off_lo), -0.3, -60.0, 0.0, 0.0, np.log10(5e-4), np.log10(8e-3), np.log10(1.1)])
    lo = np.array([-3, 0.0, -90, -3, -4.0, -90, -3, 0.0, -90, -3, -4.0, -90, -3, -1.0, -90, -4, -3.0, -120, -1.0, -1.0, -6, -5, -0.3])
    hi = np.array([2, 4.0, 40, 2, 0.0, 40, 2, 4.0, 40, 2, 0.0, 40, 1, 2.0, 40, 1, 1.0, 20, 1.0, 1.0, -1, -1, 0.7])
    return np.clip(th0, lo, hi), lo, hi


# ---------------------------------------------------------------------------
# HH-anchored forms: every rate that has an HH counterpart is c * k_HH(V) * exp(z (V - v0) F/RT);
# only the structure without an HH counterpart (concerted step, coupling factors, C-type, slow
# state, closed-state recovery) has free rate functions.  theta0 = the HH kinetics exactly
# (c = 1, z = 0), so the fit starts from the published tables.
# ---------------------------------------------------------------------------
KFA_THETA_NAMES = ["alpha_log10_c", "alpha_z", "beta_log10_c", "beta_z", "gamma_log10_kmax", "gamma_z", "gamma_v0", "delta_log10_kmax", "delta_z", "delta_v0",
                   "on_log10_c", "on_z", "off_log10_c", "off_z", "log10_a", "log10_b", "log10_kc_on", "log10_kc_off", "log10_g_factor"]


def kf_fine_channel_anchored(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    th = np.asarray(theta, float)
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    alpha = HHAnchoredRate(m, "on", 10.0 ** th[0], th[1], V0_REF); beta = HHAnchoredRate(m, "off", 10.0 ** th[2], th[3], V0_REF)
    gamma = SigmoidRate(10.0 ** th[4], th[5], th[6], q10, G.T_REF_K); delta = SigmoidRate(10.0 ** th[7], th[8], th[9], q10, G.T_REF_K)
    kon = HHAnchoredRate(h1, "off", 10.0 ** th[10], th[11], V0_REF); koff = HHAnchoredRate(h1, "on", 10.0 ** th[12], th[13], V0_REF)
    a, b = 10.0 ** th[14], 10.0 ** th[15]
    kc_on = Rate(10.0 ** th[16], 0.0, V0_REF, q10, G.T_REF_K); kc_off = Rate(10.0 ** th[17], 0.0, V0_REF, q10, G.T_REF_K)
    fwd = [alpha.scaled(4 - i) for i in range(4)] + [gamma]; bwd = [beta.scaled(i + 1) for i in range(4)] + [delta]
    keys = ["kf_activation"] * 4 + ["kf_opening"]
    sch = _coupled_scheme(fwd, bwd, keys, 5, kon, koff, a, b, kc_on, kc_off, ctype_from_open=False, with_block=with_block, name="Kf_anchored_A")
    gf = 10.0 ** th[18]
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


def kfA_anchored_theta0():
    th0 = np.array([0.0, 0.0, 0.0, 0.0, np.log10(20.0), 0.2, -30.0, np.log10(0.5), -0.2, -30.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, np.log10(5e-4), np.log10(8e-3), np.log10(1.05)])
    lo = np.array([-1.5, -2.5, -1.5, -2.5, -1, -1.0, -90, -3, -2.0, -90, -1.5, -2.5, -1.5, -2.5, -1.0, -1.0, -6, -5, -0.7])
    hi = np.array([1.5, 2.5, 1.5, 2.5, 2.5, 2.0, 40, 2, 1.0, 40, 1.5, 2.5, 1.5, 2.5, 1.0, 1.0, 0, 0, 0.7])
    return np.clip(th0, lo, hi), lo, hi


KFB_ANCH_THETA_NAMES = ["a1_log10_c", "a1_z", "b1_log10_c", "b1_z", "a2_log10_kmax", "a2_z", "a2_v0", "b2_log10_kmax", "b2_z", "b2_v0",
                        "on_log10_c", "on_z", "off_log10_c", "off_z", "log10_a", "log10_b", "log10_kc_on", "log10_kc_off", "log10_g_factor"]


def kf_fineB_channel_anchored(theta, q10: float = 1.0, h2_as_written: bool = True, with_block: bool = True) -> ChannelPopulation:
    th = np.asarray(theta, float)
    m, h1, h2 = G.kf_gates(q10, h2_as_written)
    a1 = HHAnchoredRate(m, "on", 10.0 ** th[0], th[1], V0_REF); b1 = HHAnchoredRate(m, "off", 10.0 ** th[2], th[3], V0_REF)
    a2 = SigmoidRate(10.0 ** th[4], th[5], th[6], q10, G.T_REF_K); b2 = SigmoidRate(10.0 ** th[7], th[8], th[9], q10, G.T_REF_K)
    kon = HHAnchoredRate(h1, "off", 10.0 ** th[10], th[11], V0_REF); koff = HHAnchoredRate(h1, "on", 10.0 ** th[12], th[13], V0_REF)
    a, b = 10.0 ** th[14], 10.0 ** th[15]
    kc_on = Rate(10.0 ** th[16], 0.0, V0_REF, q10, G.T_REF_K); kc_off = Rate(10.0 ** th[17], 0.0, V0_REF, q10, G.T_REF_K)
    fwd = [a1.scaled(4 - i) for i in range(4)] + [a2.scaled(4 - i) for i in range(4)]
    bwd = [b1.scaled(i + 1) for i in range(4)] + [b2.scaled(i + 1) for i in range(4)]
    keys = ["kf_activation"] * 4 + [("kf_activation", "kf_opening")] * 4
    sch = _coupled_scheme(fwd, bwd, keys, 8, kon, koff, a, b, kc_on, kc_off, ctype_from_open=True, with_block=with_block, name="Kf_anchored_B")
    gf = 10.0 ** th[18]
    m.scale_key_on = "kf_opening"; m.scale_key_off = "kf_opening"
    return ChannelPopulation("Kf", G.G_KF * gf, G.E_K, sch, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             g_scale_cheap=1.0 / gf, hh_exact=False, hh_mix=(1, 2, G.FH), coarse_drop=[False, False, True])


def kfB_anchored_theta0():
    th0 = np.array([0.3, 0.0, 0.3, 0.0, np.log10(10.0), 0.5, -20.0, np.log10(1.0), -0.5, -30.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, np.log10(5e-4), np.log10(8e-3), np.log10(1.05)])
    lo = np.array([-1.5, -2.5, -1.5, -2.5, -1, -1.0, -90, -3, -3.0, -90, -1.5, -2.5, -1.5, -2.5, -1.0, -1.0, -6, -5, -0.7])
    hi = np.array([1.5, 2.5, 1.5, 2.5, 2.5, 3.0, 60, 2, 1.0, 40, 1.5, 2.5, 1.5, 2.5, 1.0, 1.0, 0, 0, 0.7])
    return np.clip(th0, lo, hi), lo, hi


NATA_ANCH_THETA_NAMES = ["alpha_log10_c", "alpha_z", "beta_log10_c", "beta_z", "on_log10_c", "on_z", "off_log10_c", "off_z",
                         "rec_log10_kmax", "rec_z", "rec_v0", "log10_g_factor"]


def nat_fine_channel_anchored(theta, q10: float = 1.0) -> ChannelPopulation:
    th = np.asarray(theta, float)
    m, h = G.nat_gates(q10)
    alpha = HHAnchoredRate(m, "on", 10.0 ** th[0], th[1], V0_REF); beta = HHAnchoredRate(m, "off", 10.0 ** th[2], th[3], V0_REF)
    kon = HHAnchoredRate(h, "off", 10.0 ** th[4], th[5], V0_REF); koff = HHAnchoredRate(h, "on", 10.0 ** th[6], th[7], V0_REF)
    krec = SigmoidRate(10.0 ** th[8], th[9], th[10], q10, G.T_REF_K)
    trans = []
    for i in range(3):
        trans.append(Transition(i, i + 1, alpha.scaled(3 - i), "nat_activation")); trans.append(Transition(i + 1, i, beta.scaled(i + 1), "nat_activation"))
    O, I = 3, 4
    trans.append(Transition(O, I, kon, "nat_inactivation")); trans.append(Transition(I, O, koff, "nat_recovery"))
    trans.append(Transition(I, 2, krec, "nat_recovery"))
    trans.append(Transition(2, I, CycleRate(krec, kon, koff, alpha, beta), ("nat_recovery", "nat_inactivation")))
    open_ = np.zeros(5); open_[O] = 1.0
    sch = MarkovScheme("NaT_anchored_A", 5, trans, open_, initial_state=0)
    gf = 10.0 ** th[11]
    return ChannelPopulation("NaT", G.G_NAT * gf, G.E_NA, sch, [m, h], coarse_instant=[True, False], ion="Na", g_scale_cheap=1.0 / gf, hh_exact=False)


def natA_anchored_theta0():
    th0 = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, np.log10(0.05), -0.5, -60.0, np.log10(1.02)])
    lo = np.array([-1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -4, -3.0, -120, -0.7])
    hi = np.array([1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1.0, 20, 0.7])
    return np.clip(th0, lo, hi), lo, hi


NATB_ANCH_THETA_NAMES = ["alpha_log10_c", "alpha_z", "beta_log10_c", "beta_z", "on_log10_c", "on_z", "off_log10_c", "off_z",
                         "log10_k_slow_on", "log10_k_slow_off", "log10_g_factor"]


def nat_fineB_channel_anchored(theta, q10: float = 1.0) -> ChannelPopulation:
    th = np.asarray(theta, float)
    m, h = G.nat_gates(q10)
    alpha = HHAnchoredRate(m, "on", 10.0 ** th[0], th[1], V0_REF); beta = HHAnchoredRate(m, "off", 10.0 ** th[2], th[3], V0_REF)
    kon = HHAnchoredRate(h, "off", 10.0 ** th[4], th[5], V0_REF); koff = HHAnchoredRate(h, "on", 10.0 ** th[6], th[7], V0_REF)
    trans = []
    for i in range(3):
        trans.append(Transition(i, i + 1, alpha.scaled(3 - i), "nat_activation")); trans.append(Transition(i + 1, i, beta.scaled(i + 1), "nat_activation"))
    O, I, I2 = 3, 4, 5
    trans.append(Transition(O, I, kon, "nat_inactivation")); trans.append(Transition(I, O, koff, "nat_recovery"))
    trans.append(Transition(I, I2, Rate(10.0 ** th[8], 0.0, V0_REF, q10, G.T_REF_K), "nat_inactivation"))
    trans.append(Transition(I2, I, Rate(10.0 ** th[9], 0.0, V0_REF, q10, G.T_REF_K), "nat_recovery"))
    open_ = np.zeros(6); open_[O] = 1.0
    sch = MarkovScheme("NaT_anchored_B", 6, trans, open_, initial_state=0)
    gf = 10.0 ** th[10]
    return ChannelPopulation("NaT", G.G_NAT * gf, G.E_NA, sch, [m, h], coarse_instant=[True, False], ion="Na", g_scale_cheap=1.0 / gf, hh_exact=False)


def natB_anchored_theta0():
    th0 = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, np.log10(1e-3), np.log10(1e-2), np.log10(1.02)])
    lo = np.array([-1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -6, -5, -0.7])
    hi = np.array([1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, -1, -0.5, 0.7])
    return np.clip(th0, lo, hi), lo, hi


# NaT with a coupled inactivated chain (Kuo-Bean-type closed-state inactivation; a = b = 1 is the HH
# independent gate exactly): theta = [alpha c,z; beta c,z; on c,z; off c,z; log10 a; log10 b; log10 g]
NATC_THETA_NAMES = ["alpha_log10_c", "alpha_z", "beta_log10_c", "beta_z", "on_log10_c", "on_z", "off_log10_c", "off_z", "log10_a", "log10_b", "log10_g_factor"]


def nat_fine_channel_coupled(theta, q10: float = 1.0) -> ChannelPopulation:
    th = np.asarray(theta, float)
    m, h = G.nat_gates(q10)
    alpha = HHAnchoredRate(m, "on", 10.0 ** th[0], th[1], V0_REF); beta = HHAnchoredRate(m, "off", 10.0 ** th[2], th[3], V0_REF)
    kon = HHAnchoredRate(h, "off", 10.0 ** th[4], th[5], V0_REF); koff = HHAnchoredRate(h, "on", 10.0 ** th[6], th[7], V0_REF)
    a, b = 10.0 ** th[8], 10.0 ** th[9]
    fwd = [alpha.scaled(3 - i) for i in range(3)]; bwd = [beta.scaled(i + 1) for i in range(3)]
    sch = _coupled_scheme(fwd, bwd, ["nat_activation"] * 3, 3, kon, koff, a, b, None, None, ctype_from_open=True, with_block=False,
                          name="NaT_coupled_chain_A", prefix="nat", with_ctype=False)
    gf = 10.0 ** th[10]
    return ChannelPopulation("NaT", G.G_NAT * gf, G.E_NA, sch, [m, h], coarse_instant=[True, False], ion="Na", g_scale_cheap=1.0 / gf, hh_exact=False)


def natC_theta0():
    th0 = np.zeros(11)
    lo = np.array([-1.5, -2.5, -1.5, -2.5, -1.5, -2.5, -1.5, -2.5, -1.0, -1.0, -0.7])
    hi = np.array([1.5, 2.5, 1.5, 2.5, 1.5, 2.5, 1.5, 2.5, 1.0, 1.0, 0.7])
    return th0, lo, hi


FORMS = {
    "Kf": {"eyring": (kf_theta0, kf_fine_channel, KF_THETA_NAMES), "sigmoid": (kf_sig_theta0, kf_fine_channel_sig, KF_SIG_THETA_NAMES),
           "B": (kfB_theta0, kf_fineB_channel, KFB_THETA_NAMES), "coupled": (kfc_theta0, kf_fine_channel_coupled, KFC_THETA_NAMES),
           "coupledB": (kfcB_theta0, kf_fineB_channel_coupled, KFCB_THETA_NAMES),
           "anchored": (kfA_anchored_theta0, kf_fine_channel_anchored, KFA_THETA_NAMES), "anchoredB": (kfB_anchored_theta0, kf_fineB_channel_anchored, KFB_ANCH_THETA_NAMES)},
    "NaT": {"eyring": (nat_theta0, nat_fine_channel, NAT_THETA_NAMES), "sigmoid": (nat_sig_theta0, nat_fine_channel_sig, NAT_SIG_THETA_NAMES),
            "B": (natB_theta0, nat_fineB_channel, NATB_THETA_NAMES),
            "anchored": (natA_anchored_theta0, nat_fine_channel_anchored, NATA_ANCH_THETA_NAMES), "anchoredB": (natB_anchored_theta0, nat_fineB_channel_anchored, NATB_ANCH_THETA_NAMES),
            "coupledchain": (natC_theta0, nat_fine_channel_coupled, NATC_THETA_NAMES)},
}


def build_channel(name: str, entry: dict, q10: float = 3.0, with_block: bool = True) -> ChannelPopulation:
    """Rebuild a fitted channel from its JSON entry (form + theta)."""
    _, builder, _ = FORMS[name][entry.get("form", "eyring")]
    if name == "Kf":
        return builder(entry["theta"], q10=q10, with_block=with_block)
    return builder(entry["theta"], q10=q10)


# ---------------------------------------------------------------------------
# assembled hierarchy
# ---------------------------------------------------------------------------

DEFAULT_PARAMS = Path(__file__).resolve().parents[4] / "experiments" / "v1_channel" / "hierarchy" / "gunay2015_fine.json"


def load_params(path: Optional[Path] = None) -> dict:
    return json.load(open(path or DEFAULT_PARAMS))


def gunay2015_hierarchy(params: Optional[dict] = None, q10: float = 3.0, with_block: bool = True, level: str = "A") -> MembraneSpec:
    """Published model as medium level; constructed fitted Markov fine levels for Kf and NaT;
    exact chains for Ks and NaP (fine == medium: negative-control channels); reduced coarse level.
    q10 applies to every rate at every level (inert at the reference temperature).
    level="A": the primary fine formulation (hidden truth); "B": the alternate formulation."""
    params = params or load_params()
    kf = build_channel("Kf", params["Kf" if level == "A" else "Kf_B"], q10=q10, with_block=with_block)
    nat = build_channel("NaT", params["NaT" if level == "A" else "NaT_B"], q10=q10)
    return MembraneSpec(C=G.C_M, g_leak=G.G_LEAK, e_leak=G.E_LEAK,
                        channels=[G.channel_ks(q10), kf, nat, G.channel_nap(q10)],
                        T_K=G.T_REF_K, K_out=G.K_OUT_REF, v_rest_guess=-55.0, e_rev_mode="fixed_shift", K_ref=G.K_OUT_REF)


# ---------------------------------------------------------------------------
# Action-potential clamp: the published (medium) model's own voltage trajectory under the
# Günay current step, applied as a piecewise-constant voltage command.  Constrains the
# constructed schemes in the physiological regime (rest → spike → afterhyperpolarisation),
# which step families from -90 mV do not cover.  Standard electrophysiology practice.
# ---------------------------------------------------------------------------

def ap_clamp_protocol(i_pulse: float = 10.0, t_from: float = 10.0, t_to: float = 70.0, dt_seg: float = 0.1, dt_out: float = 0.1) -> Protocol:
    from ..membrane import simulate
    spec = G.gunay2015_membrane()
    names = [c.name for c in spec.channels]
    r = simulate(spec, G.gunay_cclamp(i_pulse, t_end=t_to + 1.0, dt_out=dt_seg), {n: 1 for n in names})
    t = r["t"]; V = r["V"]
    m = (t >= t_from) & (t <= t_to)
    segs = [(0.0, float(V[m][0]))] + [(round(float(ti - t_from + 5.0), 6), float(vi)) for ti, vi in zip(t[m], V[m])]
    # 5 ms of holding at the resting voltage precedes the waveform (steady state is the initial condition anyway)
    return Protocol("vclamp", segs, float(t_to - t_from + 5.0), dt_out)


def with_ap_clamp(fam: FitFamily, weight: float = 4.0) -> FitFamily:
    """Append the AP-clamp trace (weight = the number of step protocols it counts as)."""
    return FitFamily(list(fam.protocols) + [ap_clamp_protocol()], list(fam.names) + ["ap_clamp_10pA"], list(fam.weights) + [weight])
