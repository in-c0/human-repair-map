"""Channel kinetics: Markov schemes, HH gating and reduced currents.

Conventions: voltage in mV, time in ms, rates in 1/ms, conductance in nS, current in pA,
capacitance in pF, temperature in K.

Two rate parameterisations coexist:
  * `Rate`   Eyring/Boltzmann k(V) = k0 exp(z (V - v0) F/RT) Q10^((T - T_ref)/10)
  * `HHGate` steady-state/time-constant tables x_inf(V), tau(V) as published for HH models;
             the implied on/off rates are alpha = x_inf/tau, beta = (1 - x_inf)/tau.
Every rate or gate carries *scale keys* so that an intervention (or the intrinsic kinetic
variability of a cell instance) multiplies the same physical rate at every fidelity level:
an "inactivation x2" intervention scales the off-rate of the HH h gate and the O -> I
transition of the Markov scheme alike.  This keeps the levels descriptions of the *same*
cell; fidelity differences then come only from the kinetic structure, not from the bookkeeping.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

import numpy as np

F_RT_25C = 96485.33 / (8.314462 * 298.15) / 1000.0  # 1/mV at 25 C


def f_rt(T_K: float) -> float:
    """F/(RT) in 1/mV."""
    return 96485.33 / (8.314462 * T_K) / 1000.0


def _prod_scales(keys, scales: Optional[dict]) -> float:
    """Product of the multipliers of `keys`.  A missing key means 1 (no perturbation) except for
    drug-block keys ("block_on:<channel>"), whose absence means no drug (0)."""
    if not keys:
        return 1.0
    if isinstance(keys, str):
        keys = (keys,)
    scales = scales or {}
    s = 1.0
    for k in keys:
        if k:
            s *= scales.get(k, 0.0 if k.startswith("block_on") else 1.0)
    return s


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

    def scaled(self, factor: float) -> "Rate":
        return Rate(self.k0 * factor, self.z, self.v0, self.q10, self.t_ref)


@dataclass
class SigmoidRate:
    """Saturating voltage-dependent rate k(V) = k_max / (1 + exp(-z (V - v0) F/RT)) * Q10^((T - T_ref)/10).
    Unlike the Eyring form it has a finite limit at extreme voltages, which HH time-constant
    tables with a floor require (Destexhe-type rate functions)."""
    k_max: float
    z: float
    v0: float = 0.0
    q10: float = 3.0
    t_ref: float = 298.15

    def __call__(self, V, T_K: float = 298.15, scale: float = 1.0):
        x = np.clip(-self.z * (V - self.v0) * f_rt(T_K), -60.0, 60.0)
        return scale * self.k_max / (1.0 + np.exp(x)) * self.q10 ** ((T_K - self.t_ref) / 10.0)

    def scaled(self, factor: float) -> "SigmoidRate":
        return SigmoidRate(self.k_max * factor, self.z, self.v0, self.q10, self.t_ref)


@dataclass
class HHAnchoredRate:
    """A rate anchored to the on/off rate implied by a published HH gate's tables:
    k(V) = c * k_HH(V) * exp(z (V - v0) F/RT).  With c = 1, z = 0 the transition reproduces the
    HH kinetics exactly; the multiplier and tilt let a fit adjust for the extra structure of a
    Markov scheme (coupling, concerted steps) while the voltage dependence stays that of the
    published tables.  Temperature enters through the gate's own Q10."""
    gate: "HHGate"
    which: str          # "on" | "off"
    c: float = 1.0
    z: float = 0.0
    v0: float = -30.0
    factor: float = 1.0  # stoichiometric multiplier

    def __call__(self, V, T_K: float = 298.15, scale: float = 1.0):
        a, b = self.gate.rates(V, T_K, None)
        k = a if self.which == "on" else b
        return scale * self.factor * self.c * k * np.exp(self.z * (np.asarray(V, float) - self.v0) * f_rt(T_K))

    def scaled(self, factor: float) -> "HHAnchoredRate":
        return HHAnchoredRate(self.gate, self.which, self.c, self.z, self.v0, self.factor * factor)


@dataclass
class ScaledRate:
    """factor x another rate callable (keeps the base rate's voltage/temperature dependence)."""
    base: Callable
    factor: float

    def __call__(self, V, T_K: float = 298.15, scale: float = 1.0):
        return self.factor * self.base(V, T_K, scale)


@dataclass
class Transition:
    src: int
    dst: int
    rate: Callable
    scale_key: Optional[object] = None   # str or tuple of str: intervention/intrinsic multipliers applied to this rate

    def keys(self) -> tuple:
        if self.scale_key is None:
            return ()
        if isinstance(self.scale_key, str):
            return (self.scale_key,)
        return tuple(k for k in self.scale_key if k)


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
        for tr in self.transitions:
            Q[tr.src, tr.dst] += tr.rate(V, T_K, _prod_scales(tr.keys(), scales))
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

    def scale_keys(self) -> set:
        return {k for tr in self.transitions for k in tr.keys()}


def sequential_subunit_scheme(alpha: Rate, beta: Rate, n_sub: int = 4, name: str = "HH-equivalent",
                              scale_key: Optional[str] = None) -> MarkovScheme:
    """The Markov chain equivalent to an HH m^n gate: states = number of activated subunits
    (0..n); i -> i+1 at (n-i) alpha, i+1 -> i at (i+1) beta.  Open = all n activated.
    This is the numerical-validation anchor: the HH medium level must reproduce it exactly.
    """
    trans = []
    for i in range(n_sub):
        trans.append(Transition(i, i + 1, alpha.scaled(n_sub - i), scale_key))
        trans.append(Transition(i + 1, i, beta.scaled(i + 1), scale_key))
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
        trans.append(Transition(i, i + 1, alpha.scaled(n_sub - i), "activation"))
        trans.append(Transition(i + 1, i, beta.scaled(i + 1), "activation"))
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
class BellTau:
    """tau(V) = tau_min + tau_amp / (exp((V-v_c)/w) + exp(-(V-v_c)/w))  (picklable callable)."""
    tau_min: float
    tau_amp: float
    v_c: float
    width: float

    def __call__(self, V, T_K=298.15):
        V = np.asarray(V, float)
        return self.tau_min + self.tau_amp / (np.exp((V - self.v_c) / self.width) + np.exp(-(V - self.v_c) / self.width))


@dataclass
class SigmoidTau:
    """tau(V) = tau_min + tau_amp / (1 + exp((V - v_c)/w))  (picklable callable).
    This is the 'sigmoidOffsetTimeCourse' form of the Günay 2015 NeuroML port (offset, rate,
    midpoint, -scale)."""
    tau_min: float
    tau_amp: float
    v_c: float
    width: float

    def __call__(self, V, T_K=298.15):
        V = np.asarray(V, float)
        return self.tau_min + self.tau_amp / (1.0 + np.exp((V - self.v_c) / self.width))


@dataclass
class ConstTau:
    """tau(V) = tau (picklable callable)."""
    tau: float

    def __call__(self, V, T_K=298.15):
        return self.tau + 0.0 * np.asarray(V, float)


@dataclass
class HHGate:
    """A gate with x_inf(V), tau_x(V) either from alpha/beta `Rate`s or from a Boltzmann
    x_inf = 1/(1+exp(-(V-v_half)/slope)) and a tau(V) table (with an optional Q10 on tau).

    scale_key applies to both implied rates (i.e. tau / s at fixed x_inf); scale_key_on and
    scale_key_off apply to the on-rate alpha = x_inf/tau (x -> 1) and the off-rate
    beta = (1-x_inf)/tau (x -> 0) respectively, changing x_inf and tau consistently the way a
    rate-level perturbation does in a Markov scheme.
    """
    alpha: Optional[Rate] = None
    beta: Optional[Rate] = None
    power: int = 1
    v_half: Optional[float] = None
    slope: Optional[float] = None
    tau_fn: Optional[Callable] = None       # tau(V) in ms
    scale_key: Optional[str] = None
    scale_key_on: Optional[str] = None
    scale_key_off: Optional[str] = None
    q10: float = 1.0                        # temperature factor on tau for table-parameterised gates
    t_ref: float = 298.15

    def keys(self) -> set:
        return {k for k in (self.scale_key, self.scale_key_on, self.scale_key_off) if k}

    def rates(self, V, T_K=298.15, scales=None):
        """Implied on/off rates (alpha, beta) with all scale keys applied."""
        sc = _prod_scales(self.scale_key, scales)
        so = _prod_scales(self.scale_key_on, scales)
        sf = _prod_scales(self.scale_key_off, scales)
        if self.alpha is not None:
            return self.alpha(V, T_K, sc * so), self.beta(V, T_K, sc * sf)
        V = np.asarray(V, float)
        xi = 1.0 / (1.0 + np.exp(-(V - self.v_half) / self.slope))
        tau = self.tau_fn(V, T_K) / self.q10 ** ((T_K - self.t_ref) / 10.0)
        return xi / tau * sc * so, (1.0 - xi) / tau * sc * sf

    def x_inf(self, V, T_K=298.15, scales=None):
        a, b = self.rates(V, T_K, scales)
        return a / (a + b)

    def tau(self, V, T_K=298.15, scales=None):
        a, b = self.rates(V, T_K, scales)
        return 1.0 / (a + b)

    def dxdt(self, x, V, T_K=298.15, scales=None):
        a, b = self.rates(V, T_K, scales)
        return a * (1.0 - x) - b * x


@dataclass
class HHRate:
    """The on- or off-rate implied by an HH gate's tables, times a stoichiometric factor.
    Used to build the Markov chain that is exactly equivalent to an HH gate (scale keys are
    applied by the `Transition`, not here)."""
    gate: HHGate
    which: str          # "on" | "off"
    factor: float = 1.0

    def __call__(self, V, T_K=298.15, scale=1.0):
        a, b = self.gate.rates(V, T_K, None)
        return scale * self.factor * (a if self.which == "on" else b)


def sequential_scheme_from_gate(gate: HHGate, n_sub: int, name: str = "HH-equivalent") -> MarkovScheme:
    """Markov chain exactly equivalent to gate^n_sub (independent identical subunits), with the
    gate's scale keys carried onto the corresponding transitions."""
    trans = []
    for i in range(n_sub):
        trans.append(Transition(i, i + 1, HHRate(gate, "on", n_sub - i), (gate.scale_key, gate.scale_key_on)))
        trans.append(Transition(i + 1, i, HHRate(gate, "off", i + 1), (gate.scale_key, gate.scale_key_off)))
    open_ = np.zeros(n_sub + 1); open_[n_sub] = 1.0
    return MarkovScheme(name, n_sub + 1, trans, open_, initial_state=0)


@dataclass
class ChannelPopulation:
    """One channel type with its three fidelity descriptions and a conductance.

    hh_mix = (i, j, r): gates i and j are two components of one inactivation variable,
    h = r x_i + (1-r) x_j, raised to gate i's power (Günay 2015 Kf form).
    coarse_instant[k]: gate k is evaluated at x_inf(V) in the coarse level.
    coarse_drop[k]: gate k is dropped in the coarse level (its mix partner carries the whole weight).
    intrinsic_scales: per-cell kinetic multipliers (by scale key) shared by every level.
    """
    name: str
    g_max: float                       # nS
    e_rev: float                       # mV (fixed published value, or overridden by Nernst per MembraneSpec)
    markov: MarkovScheme               # fine
    hh_gates: list[HHGate]             # medium: product of gates (with optional mix)
    coarse_instant: list[bool]         # coarse: which gates are treated as instantaneous
    ion: str = "K"
    g_scale_cheap: float = 1.0         # effective conductance factor of the HH/coarse descriptions (fitted)
    hh_exact: bool = False             # True when the HH level is exactly equivalent to the Markov level (no fit needed)
    hh_mix: Optional[tuple] = None
    coarse_drop: Optional[list] = None
    intrinsic_scales: dict = field(default_factory=dict)

    def _drop(self) -> list[bool]:
        return list(self.coarse_drop) if self.coarse_drop is not None else [False] * len(self.hh_gates)

    def coarse_dynamic(self) -> list[int]:
        """Indices of the gates integrated in the coarse level."""
        return [k for k, (inst, drop) in enumerate(zip(self.coarse_instant, self._drop())) if not inst and not drop]

    def n_state(self, level: int) -> int:
        if level == 2:
            return self.markov.n_states
        if level == 1:
            return len(self.hh_gates)
        return len(self.coarse_dynamic())

    def gate_values(self, level: int, ys, V, T_K=298.15, scales=None) -> list:
        """Values of all HH gates at a cheap level (level 1: the state; level 0: dynamic gates from
        the state, instantaneous gates at x_inf(V), dropped gates copy their mix partner)."""
        if level == 1:
            return list(ys)
        vals = [None] * len(self.hh_gates)
        dyn = self.coarse_dynamic()
        for k, idx in enumerate(dyn):
            vals[idx] = ys[k]
        drop = self._drop()
        for k, g in enumerate(self.hh_gates):
            if vals[k] is None and not drop[k]:
                vals[k] = g.x_inf(V, T_K, scales)
        if self.hh_mix is not None:
            i, j, _ = self.hh_mix
            if vals[j] is None:
                vals[j] = vals[i]
            if vals[i] is None:
                vals[i] = vals[j]
        return vals

    def po_from_values(self, vals) -> float:
        """Open probability of the HH description from the gate values."""
        if self.hh_mix is None:
            po = 1.0
            for g, x in zip(self.hh_gates, vals):
                po *= x ** g.power
            return po
        i, j, r = self.hh_mix
        po = 1.0
        for k, (g, x) in enumerate(zip(self.hh_gates, vals)):
            if k in (i, j):
                continue
            po *= x ** g.power
        h = r * vals[i] + (1.0 - r) * vals[j]
        return po * h ** self.hh_gates[i].power

    def po_inf(self, V, T_K=298.15, scales=None) -> float:
        return self.po_from_values([g.x_inf(V, T_K, scales) for g in self.hh_gates])

    def scale_keys(self) -> set:
        keys = set(self.markov.scale_keys())
        for g in self.hh_gates:
            keys |= g.keys()
        return keys
