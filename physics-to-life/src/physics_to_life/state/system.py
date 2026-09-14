"""V0 system family: a slow network with hidden bistable fast subsystems.

Fine model (per node k of K):
    dx_k/dt = -a x_k + sum_j W[k,j] tanh(x_j) + c * (y_k - y0_k)/2 + u_k(t)
    eps dy_k/dt = f(y_k, x_k; theta_k)               (fast, bistable, hysteretic)

with f = y - y^3 + beta (x - theta)  ("cubic")  or a sigmoidal switch with the same
fold thresholds ("sigmoid").  y0_k is the baseline lower-branch value at x = 0, so
(x, y) = (0, y0) is an exact fixed point of the fine model with u = 0.

Coarse closure  (fidelity 0): y_k ≡ y0_k         -> the fast subsystem contributes nothing.
Medium closure  (fidelity 1): y_k = y_low(x_k)    -> quasi-static lower branch, clamped at
                                                     the fold; captures sub-threshold
                                                     modulation but never the switch.
Fine            (fidelity 2): integrate the fast ODE (sub-cycled).

The coarse/medium closures fail exactly when an intervention pushes x_k past the fold
x_k > theta_k + 2/(3 sqrt(3))/beta, after which y_k jumps to the upper branch and may
latch (hysteresis).  Which nodes flip, and whether a flip matters for the readout,
depends on the intervention, on the (hidden) thresholds and on the network.  That is
the structure the routing controller must discover.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional

import numpy as np

FOLD = 2.0 / (3.0 * np.sqrt(3.0))  # bias at which the lower branch of y - y^3 + b = 0 disappears


@dataclass
class SystemSpec:
    K: int
    W: np.ndarray            # (K, K): W[k, j] is the weight from j -> k
    theta: np.ndarray        # (K,) true switching thresholds (hidden)
    theta_obs: np.ndarray    # (K,) noisy observation of theta available to the controller
    sigma_theta: float       # std of the observation noise (assumed known)
    readout: int             # index of the readout node r
    a: float = 1.0
    c: float = 1.0
    beta: float = 1.0
    eps: float = 0.01
    fast_model: str = "cubic"   # "cubic" | "sigmoid"
    noise: float = 0.0          # additive noise std on the fast variable (stochastic variant)
    seed: int = 0
    family: str = "id"

    @property
    def y0(self) -> np.ndarray:
        return y_lower_branch(np.zeros(self.K), self.theta, self.beta, self.fast_model)

    @property
    def flip_up(self) -> np.ndarray:
        """x above which the lower branch ceases to exist (switch-on threshold)."""
        return self.theta + FOLD / self.beta

    @property
    def flip_down(self) -> np.ndarray:
        return self.theta - FOLD / self.beta

    def to_dict(self) -> dict:
        d = asdict(self)
        d["W"] = self.W.tolist()
        d["theta"] = self.theta.tolist()
        d["theta_obs"] = self.theta_obs.tolist()
        return d


@dataclass
class Intervention:
    kind: str                   # "pulse" | "step" | "multi" | "negative"
    nodes: tuple                # intervened node indices
    amplitudes: tuple           # per-node amplitudes
    t_on: float
    duration: float

    def u(self, t: float, K: int) -> np.ndarray:
        out = np.zeros(K)
        if self.t_on <= t < self.t_on + self.duration:
            for n, A in zip(self.nodes, self.amplitudes):
                out[n] += A
        return out

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# fast subsystem
# ---------------------------------------------------------------------------

def fast_rhs(y: np.ndarray, x: np.ndarray, theta: np.ndarray, beta: float, model: str) -> np.ndarray:
    b = beta * (x - theta)
    if model == "cubic":
        return y - y**3 + b
    if model == "sigmoid":
        # positive-feedback switch with the same fold thresholds as the cubic:
        # branches exist while |b| < FOLD; the transient shape differs from the cubic.
        kappa = 12.0
        return 2.0 / (1.0 + np.exp(-kappa * (b + FOLD * y))) - 1.0 - y
    raise ValueError(model)


def y_lower_branch(x: np.ndarray, theta: np.ndarray, beta: float, model: str = "cubic",
                   y_init: np.ndarray | None = None) -> np.ndarray:
    """Quasi-static lower branch y_low(x): the stable root nearest -1 of f(y, x) = 0.

    Beyond the fold (b > FOLD) the branch does not exist; we clamp to the fold value.
    This is the 'medium' closure.  For the cubic, the lower root is bracketed in
    [-3, -1/sqrt(3)] whenever b < FOLD, so a short bisection followed by Newton polishing
    is guaranteed to land on the correct branch.  With a warm start (y_init from the
    previous step) two Newton steps suffice, which is what the nominal cost of 3 assumes.
    """
    b = beta * (x - theta)
    b = np.minimum(b, FOLD - 1e-9)
    if model == "cubic":
        ymax = -1.0 / np.sqrt(3.0)
        if y_init is None:
            lo = np.full_like(b, -3.0)
            hi = np.full_like(b, ymax)
            for _ in range(20):
                mid = 0.5 * (lo + hi)
                f = mid - mid**3 + b
                lo = np.where(f > 0, mid, lo)
                hi = np.where(f > 0, hi, mid)
            y = 0.5 * (lo + hi)
        else:
            y = np.minimum(np.asarray(y_init, dtype=float), ymax - 1e-6)
        for _ in range(12):
            f = y - y**3 + b
            fp = np.minimum(1.0 - 3.0 * y**2, -1e-6)
            step = f / fp
            y = np.minimum(y - step, ymax)
            if np.max(np.abs(step)) < 1e-13:
                break
        # near the fold Newton converges linearly; fall back to bisection where it did not converge
        bad = np.abs(y - y**3 + b) > 1e-9
        if bad.any():
            lo = np.full(int(bad.sum()), -3.0); hi = np.full(int(bad.sum()), ymax); bb = b[bad]
            for _ in range(60):
                mid = 0.5 * (lo + hi)
                f = mid - mid**3 + bb
                lo = np.where(f > 0, mid, lo); hi = np.where(f > 0, hi, mid)
            y[bad] = 0.5 * (lo + hi)
        return y
    if model == "sigmoid":
        y = np.full_like(b, -1.0) if y_init is None else np.asarray(y_init, dtype=float).copy()
        for _ in range(200):
            y_new = 2.0 / (1.0 + np.exp(-12.0 * (b + FOLD * y))) - 1.0
            if np.max(np.abs(y_new - y)) < 1e-12:
                y = y_new
                break
            y = 0.5 * y + 0.5 * y_new
        return y
    raise ValueError(model)


# ---------------------------------------------------------------------------
# generators
# ---------------------------------------------------------------------------

def make_system(rng: np.random.Generator, K: int = 12, in_degree: float = 2.0,
                sigma_theta: float = 0.3, theta_range=(0.8, 2.2), w_range=(0.4, 1.2),
                p_negative: float = 0.15, eps: float = 0.01, fast_model: str = "cubic",
                noise: float = 0.0, family: str = "id", seed: Optional[int] = None) -> SystemSpec:
    """Random sparse directed network. Readout is chosen among nodes with >= 2 ancestors."""
    W = np.zeros((K, K))
    for k in range(K):
        n_in = int(rng.poisson(in_degree))
        n_in = max(1, min(n_in, K - 1))
        srcs = rng.choice([j for j in range(K) if j != k], size=n_in, replace=False)
        for j in srcs:
            w = rng.uniform(*w_range)
            if rng.random() < p_negative:
                w = -w
            W[k, j] = w
    theta = rng.uniform(*theta_range, size=K)
    theta_obs = theta + rng.normal(0.0, sigma_theta, size=K)
    # readout: prefer nodes with a rich upstream so that causal routing is non-trivial
    candidates = [k for k in range(K) if len(ancestors_of(W, k)) >= 3]
    readout = int(rng.choice(candidates)) if candidates else int(rng.integers(K))
    return SystemSpec(K=K, W=W, theta=theta, theta_obs=theta_obs, sigma_theta=sigma_theta,
                      readout=readout, eps=eps, fast_model=fast_model, noise=noise,
                      seed=int(seed) if seed is not None else 0, family=family)


def make_intervention(rng: np.random.Generator, spec: SystemSpec, kind: str = "pulse",
                      amp_range=(0.5, 3.0), dur_range=(0.5, 2.0), t_on: float = 0.5,
                      horizon: float = 8.0, n_nodes: int = 1) -> Intervention:
    K = spec.K
    if kind == "pulse":
        nodes = tuple(int(n) for n in rng.choice(K, size=1, replace=False))
        amps = tuple(float(rng.uniform(*amp_range)) for _ in nodes)
        dur = float(rng.uniform(*dur_range))
    elif kind == "multi":
        nodes = tuple(int(n) for n in rng.choice(K, size=n_nodes, replace=False))
        amps = tuple(float(rng.uniform(*amp_range)) for _ in nodes)
        dur = float(rng.uniform(*dur_range))
    elif kind == "step":
        nodes = tuple(int(n) for n in rng.choice(K, size=1, replace=False))
        amps = tuple(float(rng.uniform(*amp_range)) for _ in nodes)
        dur = horizon - t_on
    elif kind == "negative":
        nodes = tuple(int(n) for n in rng.choice(K, size=1, replace=False))
        amps = tuple(-float(rng.uniform(*amp_range)) for _ in nodes)
        dur = float(rng.uniform(*dur_range))
    else:
        raise ValueError(kind)
    return Intervention(kind=kind, nodes=nodes, amplitudes=amps, t_on=t_on, duration=dur)


# ---------------------------------------------------------------------------
# graph utilities (the "structural scaffold" the controller is allowed to know)
# ---------------------------------------------------------------------------

def ancestors_of(W: np.ndarray, k: int) -> set:
    """All nodes with a directed path into k (excluding k unless on a cycle)."""
    K = W.shape[0]
    seen, stack = set(), [k]
    while stack:
        n = stack.pop()
        for j in range(K):
            if W[n, j] != 0.0 and j not in seen:
                seen.add(j)
                stack.append(j)
    return seen


def influence_to(W: np.ndarray, r: int, max_len: int = 6, damp: float = 0.6) -> np.ndarray:
    """Total damped path gain from every node into the readout r: sum_L damp^L (|W|^L)[r, :]."""
    K = W.shape[0]
    A = np.abs(W)
    acc = np.zeros(K)
    P = np.eye(K)
    for L in range(1, max_len + 1):
        P = P @ A
        acc += (damp ** L) * P[r, :]
    return acc


def graph_distance_to(W: np.ndarray, r: int) -> np.ndarray:
    """Shortest directed path length from each node to r (inf if none)."""
    K = W.shape[0]
    dist = np.full(K, np.inf)
    dist[r] = 0
    frontier = [r]
    while frontier:
        nxt = []
        for n in frontier:
            for j in range(K):
                if W[n, j] != 0.0 and dist[j] == np.inf:
                    dist[j] = dist[n] + 1
                    nxt.append(j)
        frontier = nxt
    return dist
