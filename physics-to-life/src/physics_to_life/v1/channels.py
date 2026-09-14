"""Channel kinetics: Markov schemes, HH gating and reduced currents.

Conventions: voltage in mV, time in ms, rates in 1/ms, conductance in nS, current in pA,
capacitance in pF, temperature in K.  Rate functions use the Eyring/Boltzmann form
    k(V) = k0 * exp(z * (V - V0) * F / (R T))
with charge z (e), and optionally a Q10 temperature factor relative to a reference
temperature.  All parameters live in dataclasses so that literature-derived values can be
substituted without touching the machinery.  Values marked PROVISIONAL in
`parameters.py` are placeholders awaiting verified published numbers.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

import numpy as np

F_RT_25C = 96485.33 / (8.314462 * 298.15) / 1000.0  # 1/mV at 25 C


def f_rt(T_K: float) -> float:
    """F/(RT) in 1/mV."""
    return 96485.33 / (8.314462 * T_K) / 1000.0


@dataclass
class Rate:
    """Voltage-dependent rate k(V) = k0 * exp(z * (V - v0) * F/RT) * Q10^((T - T_ref)/10)."""
    k0: float           # 1/ms at V = v0 and T = T_ref
    z: float            # effective charge (positive: rate increases with depolarisation)
    v0: float = 0.0     # mV
    q10: float = 3.0
    t_ref: float = 298.15

    def __call__(self, V, T_K: float = 298.15, scale: float = 1.0):
        return scale * self.k0 * np.exp(self.z * (V - self.v0) * f_rt(T_K)) * self.q10 ** ((T_K - self.t_ref) / 10.0)


@dataclass
class Transition:
    src: int
    dst: int
    rate: Rate
    scale_key: Optional[str] = None   # name of an intervention multiplier applied to this rate


@dataclass
class MarkovScheme:
    """A kinetic scheme with voltage-dependent transitions.

    open: conductance weight of each state (1 for open, 0 otherwise; fractional allowed)
    """
    name: str
    n_states: int
    transitions: list[Transition]
    open: np.ndarray
    initial_state: int = 0

    def Q(self, V: float, T_K: float = 298.15, scales: Optional[dict] = None) -> np.ndarray:
        """Generator matrix: Q[i, j] = rate i -> j (j != i); rows sum to zero."""
        Q = np.zeros((self.n_states, self.n_states))
        scales = scales or {}
        for tr in self.transitions:
            sc = scales.get(tr.scale_key, 1.0) if tr.scale_key else 1.0
            Q[tr.src, tr.dst] += tr.rate(V, T_K, sc)
        Q[np.arange(self.n_states), np.arange(self.n_states)] = -Q.sum(axis=1)
        return Q

    def steady_state(self, V: float, T_K: float = 298.15, scales: Optional[dict] = None) -> np.ndarray:
        Q = self.Q(V, T_K, scales)
        A = np.vstack([Q.T, np.ones(self.n_states)])
        b = np.zeros(self.n_states + 1); b[-1] = 1.0
        p, *_ = np.linalg.lstsq(A, b, rcond=None)
        return np.clip(p, 0.0, 1.0)

    def p_open(self, p: np.ndarray) -> float:
        return float(p @ self.open)


def sequential_subunit_scheme(alpha: Rate, beta: Rate, n_sub: int = 4, name: str = "HH-equivalent",
                              scale_key: Optional[str] = None) -> MarkovScheme:
    """The Markov chain equivalent to an HH m^n gate: states = number of activated subunits
    (0..n); i -> i+1 at (n-i) alpha, i+1 -> i at (i+1) beta.  Open = all n activated.
    This is the numerical-validation anchor: the HH medium level must reproduce it exactly.
    """
    trans = []
    for i in range(n_sub):
        trans.append(Transition(i, i + 1, Rate(alpha.k0 * (n_sub - i), alpha.z, alpha.v0, alpha.q10, alpha.t_ref), scale_key))
        trans.append(Transition(i + 1, i, Rate(beta.k0 * (i + 1), beta.z, beta.v0, beta.q10, beta.t_ref), scale_key))
    open_ = np.zeros(n_sub + 1); open_[n_sub] = 1.0
    return MarkovScheme(name, n_sub + 1, trans, open_, initial_state=0)


def shaker_like_scheme(alpha: Rate, beta: Rate, gamma: Rate, delta: Rate, kon: Rate, koff: Rate,
                       kc_on: Optional[Rate] = None, kc_off: Optional[Rate] = None, n_sub: int = 4,
                       name: str = "shaker-like") -> MarkovScheme:
    """Zagotta-Hoshi-Aldrich-type activation (n independent subunit steps alpha/beta, then one
    concerted opening step gamma/delta) followed by N-type inactivation from the open state
    (kon/koff, ball-and-chain) and optional C-type inactivation from the open state
    (kc_on/kc_off).  States: 0..n (subunit states), n+1 = O, n+2 = I_N, n+3 = I_C (optional).
    """
    trans = []
    for i in range(n_sub):
        trans.append(Transition(i, i + 1, Rate(alpha.k0 * (n_sub - i), alpha.z, alpha.v0, alpha.q10, alpha.t_ref), "activation"))
        trans.append(Transition(i + 1, i, Rate(beta.k0 * (i + 1), beta.z, beta.v0, beta.q10, beta.t_ref), "activation"))
    O = n_sub + 1; IN = n_sub + 2
    trans.append(Transition(n_sub, O, gamma, "opening"))
    trans.append(Transition(O, n_sub, delta, "opening"))
    trans.append(Transition(O, IN, kon, "inactivation"))
    trans.append(Transition(IN, O, koff, "recovery"))
    n = n_sub + 3
    if kc_on is not None and kc_off is not None:
        IC = n_sub + 3
        trans.append(Transition(O, IC, kc_on, "c_inactivation"))
        trans.append(Transition(IC, O, kc_off, "c_recovery"))
        n = n_sub + 4
    open_ = np.zeros(n); open_[O] = 1.0
    return MarkovScheme(name, n, trans, open_, initial_state=0)


# ---------------------------------------------------------------------------
# HH gating
# ---------------------------------------------------------------------------

@dataclass
class HHGate:
    """A gate with x_inf(V), tau_x(V) either from alpha/beta rates or from Boltzmann/tau tables."""
    alpha: Optional[Rate] = None
    beta: Optional[Rate] = None
    power: int = 1
    # alternative parameterisation
    v_half: Optional[float] = None
    slope: Optional[float] = None           # mV; x_inf = 1/(1+exp(-(V-v_half)/slope))
    tau_fn: Optional[Callable] = None       # tau(V) in ms
    scale_key: Optional[str] = None

    def x_inf(self, V, T_K=298.15, scales=None):
        if self.alpha is not None:
            sc = (scales or {}).get(self.scale_key, 1.0) if self.scale_key else 1.0
            a, b = self.alpha(V, T_K, sc), self.beta(V, T_K, sc)
            return a / (a + b)
        return 1.0 / (1.0 + np.exp(-(V - self.v_half) / self.slope))

    def tau(self, V, T_K=298.15, scales=None):
        if self.alpha is not None:
            sc = (scales or {}).get(self.scale_key, 1.0) if self.scale_key else 1.0
            a, b = self.alpha(V, T_K, sc), self.beta(V, T_K, sc)
            return 1.0 / (a + b)
        sc = (scales or {}).get(self.scale_key, 1.0) if self.scale_key else 1.0
        return self.tau_fn(V, T_K) / sc

    def dxdt(self, x, V, T_K=298.15, scales=None):
        return (self.x_inf(V, T_K, scales) - x) / self.tau(V, T_K, scales)


@dataclass
class ChannelPopulation:
    """One channel type with its three fidelity descriptions and a conductance."""
    name: str
    g_max: float                       # nS
    e_rev: float                       # mV (may be overridden by ionic conditions)
    markov: MarkovScheme               # fine
    hh_gates: list[HHGate]             # medium: product of gates
    coarse_instant: list[bool]         # coarse: which gates are treated as instantaneous
    ion: str = "K"

    def n_state(self, level: int) -> int:
        if level == 2:
            return self.markov.n_states
        if level == 1:
            return len(self.hh_gates)
        return int(sum(not inst for inst in self.coarse_instant))
