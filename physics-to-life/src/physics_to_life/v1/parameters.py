"""Channel and membrane parameters for V1.

STATUS: every value below is PROVISIONAL — placeholders with plausible orders of magnitude
used only to exercise and validate the machinery. They are to be replaced by verified,
published Drosophila values (see docs/literature/drosophila_channel_electrophysiology.md)
before the preregistration is frozen. Do not cite these numbers.
"""
from __future__ import annotations

import numpy as np

from .channels import Rate, HHGate, ChannelPopulation, shaker_like_scheme, sequential_subunit_scheme, Transition, MarkovScheme, SigmoidTau
from .membrane import MembraneSpec


def provisional_shaker(g_max: float = 30.0, with_ctype: bool = True, with_block: bool = True) -> ChannelPopulation:
    """Shaker-like fast transient K+ current (I_A): ZHA-type activation, N-type inactivation,
    optional C-type inactivation and state-dependent open-channel block (fine level only)."""
    alpha = Rate(k0=0.9, z=0.45, v0=-25.0, q10=3.0)      # subunit activation
    beta = Rate(k0=0.15, z=-0.65, v0=-25.0, q10=3.0)
    gamma = Rate(k0=6.0, z=0.05, v0=-40.0, q10=3.0)      # concerted opening
    delta = Rate(k0=0.6, z=-0.15, v0=-40.0, q10=3.0)
    kon = Rate(k0=0.35, z=0.0, q10=2.5)                  # N-type inactivation (weakly voltage dependent)
    koff = Rate(k0=0.03, z=-0.05, q10=2.5)               # recovery
    kc_on = Rate(k0=0.004, z=0.0, q10=2.5) if with_ctype else None   # slow C-type inactivation
    kc_off = Rate(k0=0.002, z=0.0, q10=2.5) if with_ctype else None
    scheme = shaker_like_scheme(alpha, beta, gamma, delta, kon, koff, kc_on, kc_off, name="shaker_provisional")
    if with_block:
        # open-channel block state (fine level only): O -> B at k_bon * conc ; B -> O at k_boff
        O = 5; B = scheme.n_states
        scheme.transitions.append(Transition(O, B, Rate(k0=0.2, z=0.0), "block_on:shaker"))
        scheme.transitions.append(Transition(B, O, Rate(k0=0.05, z=0.0), None))
        scheme.n_states += 1
        scheme.open = np.append(scheme.open, 0.0)
    # HH medium: m^4 from the subunit rates (ignores the concerted step), h from an independent gate
    m = HHGate(alpha=alpha, beta=beta, power=4, scale_key="activation")
    h = HHGate(v_half=-55.0, slope=-6.0, tau_fn=SigmoidTau(3.0, 25.0, -40.0, 8.0), power=1, scale_key="inactivation")
    return ChannelPopulation("shaker", g_max, -85.0, scheme, [m, h], coarse_instant=[True, False], ion="K")


def provisional_shab(g_max: float = 12.0) -> ChannelPopulation:
    """Delayed-rectifier K+ current (I_K, Shab-like): independent-subunit activation only, so its
    fine (Markov) and medium (HH) levels are exactly equivalent by construction."""
    alpha = Rate(k0=0.05, z=0.25, v0=-30.0, q10=3.0)
    beta = Rate(k0=0.06, z=-0.35, v0=-30.0, q10=3.0)
    scheme = sequential_subunit_scheme(alpha, beta, n_sub=4, name="shab_provisional", scale_key="k_activation")
    n = HHGate(alpha=alpha, beta=beta, power=4, scale_key="k_activation")
    return ChannelPopulation("shab", g_max, -85.0, scheme, [n], coarse_instant=[True], ion="K", hh_exact=True)


def provisional_na(g_max: float = 60.0) -> ChannelPopulation:
    """Transient Na+ current (para-like): HH m^3 h with an equivalent Markov activation chain
    coupled to an inactivated state from the open state."""
    am = Rate(k0=1.2, z=1.2, v0=-25.0, q10=3.0)
    bm = Rate(k0=0.25, z=-1.2, v0=-25.0, q10=3.0)
    scheme = sequential_subunit_scheme(am, bm, n_sub=3, name="na_provisional", scale_key="na_activation")
    # add inactivation from the open state (state 3) and recovery
    I = scheme.n_states
    scheme.transitions.append(Transition(3, I, Rate(k0=0.8, z=0.05, v0=-25.0, q10=2.5), "na_inactivation"))
    scheme.transitions.append(Transition(I, 3, Rate(k0=0.05, z=-0.5, v0=-25.0, q10=2.5), "na_recovery"))
    scheme.n_states += 1
    scheme.open = np.append(scheme.open, 0.0)
    m = HHGate(alpha=am, beta=bm, power=3, scale_key="na_activation")
    h = HHGate(v_half=-62.0, slope=-7.0, tau_fn=SigmoidTau(0.5, 6.0, -45.0, 7.0), power=1, scale_key="na_inactivation")
    return ChannelPopulation("na", g_max, 50.0, scheme, [m, h], coarse_instant=[True, False], ion="Na")


def provisional_membrane() -> MembraneSpec:
    return MembraneSpec(C=20.0, g_leak=1.0, e_leak=-60.0,
                        channels=[provisional_shaker(), provisional_shab(), provisional_na()],
                        T_K=295.15, K_out=5.0, K_in=140.0, Na_out=120.0, Na_in=15.0, v_rest_guess=-62.0)


# ---------------------------------------------------------------------------
# standard protocols
# ---------------------------------------------------------------------------

def vclamp_activation(step_mV: float, hold: float = -80.0, t_pre: float = 20.0, t_step: float = 60.0,
                      t_post: float = 20.0, dt_out: float = 0.05):
    from .membrane import Protocol
    return Protocol("vclamp", [(0.0, hold), (t_pre, step_mV), (t_pre + t_step, hold)], t_pre + t_step + t_post, dt_out)


def vclamp_recovery(interval_ms: float, step_mV: float = 20.0, hold: float = -80.0, t_pre: float = 20.0,
                    t_p1: float = 40.0, t_p2: float = 40.0, dt_out: float = 0.05):
    from .membrane import Protocol
    t1 = t_pre; t2 = t1 + t_p1; t3 = t2 + interval_ms; t4 = t3 + t_p2
    return Protocol("vclamp", [(0.0, hold), (t1, step_mV), (t2, hold), (t3, step_mV), (t4, hold)], t4 + 20.0, dt_out)


def cclamp_step(i_pA: float, t_pre: float = 30.0, t_step: float = 150.0, t_post: float = 40.0, dt_out: float = 0.05):
    from .membrane import Protocol
    return Protocol("cclamp", [(0.0, 0.0), (t_pre, i_pA), (t_pre + t_step, 0.0)], t_pre + t_step + t_post, dt_out)


def vclamp_inactivation(v_pre: float, hold: float = -100.0, t_hold: float = 20.0, t_pre: float = 200.0,
                        test_mV: float = 20.0, t_test: float = 60.0, dt_out: float = 0.05):
    """Steady-state inactivation: hold -> long prepulse at v_pre -> test step; peak at test vs v_pre = h_inf."""
    from .membrane import Protocol
    t1 = t_hold; t2 = t1 + t_pre; t3 = t2 + t_test
    return Protocol("vclamp", [(0.0, hold), (t1, v_pre), (t2, test_mV), (t3, hold)], t3 + 20.0, dt_out)
