"""Fidelity hierarchy and simulators for the V0 slow-fast network.

Per-node fidelity levels:
    0  coarse : y_k frozen at its baseline value y0_k (fast subsystem invisible)
    1  medium : quasi-static lower-branch closure y_k = y_low(x_k) (no switching)
    2  fine   : fast ODE integrated with n_sub RK4 sub-steps per slow step

simulate_mixed integrates a system where each node has its own fidelity. It returns
the trajectory, a nominal compute cost (node-steps weighted by fidelity), the number
of fine node-steps and the wall-clock time.

simulate_reference integrates the full fine model with scipy's stiff Radau solver at
tight tolerance. It is an *independent implementation* (different integrator, adaptive
step) and defines the hidden ground truth. The gap |Y_fine - Y_ref| is the numerical
uncertainty of the fine simulator and is reported, not hidden.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, asdict

import numpy as np
from scipy.integrate import solve_ivp

from ..state.system import SystemSpec, Intervention, fast_rhs, y_lower_branch

# nominal cost units per node per slow step (relative to a coarse node-step)
COST_PER_NODE_STEP = {0: 1.0, 1: 3.0, 2: None}  # fine cost = n_sub (set by config)


@dataclass
class SimConfig:
    horizon: float = 8.0
    dt: float = 0.02          # slow step
    n_sub: int = 20           # fast sub-steps per slow step (fast step = dt / n_sub)
    ref_rtol: float = 1e-8
    ref_atol: float = 1e-10
    ref_method: str = "Radau"
    target: str = "auc"       # "auc": (1/T) int x_r dt ; "final": x_r(T)

    def to_dict(self):
        return asdict(self)

    @property
    def n_steps(self) -> int:
        return int(round(self.horizon / self.dt))


def _slow_rhs(x, y_dev, W, a, c, u):
    return -a * x + W @ np.tanh(x) + 0.5 * c * y_dev + u


def _rk4(f, y, h):
    k1 = f(y)
    k2 = f(y + 0.5 * h * k1)
    k3 = f(y + 0.5 * h * k2)
    k4 = f(y + h * k3)
    return y + (h / 6.0) * (k1 + 2 * k2 + 2 * k3 + k4)


def simulate_mixed(spec: SystemSpec, interv: Intervention, fidelity: np.ndarray, cfg: SimConfig,
                   rng: np.random.Generator | None = None) -> dict:
    """Integrate the mixed-fidelity system. fidelity: (K,) ints in {0,1,2}."""
    t0 = time.perf_counter()
    K, W, a, c, beta, eps = spec.K, spec.W, spec.a, spec.c, spec.beta, spec.eps
    fidelity = np.asarray(fidelity, dtype=int)
    fine = fidelity == 2
    medium = fidelity == 1
    y0 = spec.y0
    n_steps = cfg.n_steps
    h = cfg.dt
    hs = h / cfg.n_sub
    ts = np.linspace(0.0, cfg.horizon, n_steps + 1)
    x = np.zeros(K)
    y = y0.copy()
    X = np.zeros((n_steps + 1, K))
    Y = np.zeros((n_steps + 1, K))
    Y[0] = y
    noise = spec.noise if (spec.noise > 0 and rng is not None) else 0.0
    theta_f, y0_f = spec.theta[fine], y0[fine]
    n_fine = int(fine.sum())
    y_med = y0[medium].copy()
    for n in range(n_steps):
        t = ts[n]
        u = interv.u(t, K)
        # closure for the current step
        y_eff = y0.copy()
        if medium.any():
            y_med = y_lower_branch(x[medium], spec.theta[medium], beta, spec.fast_model, y_init=y_med)
            y_eff[medium] = y_med
        if n_fine:
            y_eff[fine] = y[fine]
        y_dev = y_eff - y0
        x_new = _rk4(lambda xx: _slow_rhs(xx, y_dev, W, a, c, u), x, h)
        if n_fine:
            # sub-cycle the fast variables with x linearly interpolated over the slow step
            yf = y[fine]
            xa, xb = x[fine], x_new[fine]
            for s in range(cfg.n_sub):
                frac = (s + 0.5) / cfg.n_sub
                xs = xa + frac * (xb - xa)
                yf = _rk4(lambda yy: fast_rhs(yy, xs, theta_f, beta, spec.fast_model) / eps, yf, hs)
                if noise:
                    yf = yf + noise * np.sqrt(hs) * rng.normal(size=yf.shape)
            y[fine] = yf
        x = x_new
        X[n + 1] = x
        Y[n + 1] = y_eff if not n_fine else np.where(fine, y, y_eff)
    wall = time.perf_counter() - t0
    cost_per_node = np.where(fidelity == 2, float(cfg.n_sub), np.where(fidelity == 1, 3.0, 1.0))
    cost = float(cost_per_node.sum() * n_steps)
    return {"t": ts, "x": X, "y": Y, "cost": cost, "fine_node_steps": n_fine * n_steps,
            "n_fine": n_fine, "wall": wall, "fidelity": fidelity.copy(),
            "target": target_from_traj(ts, X, spec.readout, cfg)}


def simulate_reference(spec: SystemSpec, interv: Intervention, cfg: SimConfig) -> dict:
    """Hidden ground truth: full fine model with an adaptive stiff solver, piecewise across
    the intervention discontinuities."""
    t0 = time.perf_counter()
    K, W, a, c, beta, eps = spec.K, spec.W, spec.a, spec.c, spec.beta, spec.eps
    y0 = spec.y0
    ts = np.linspace(0.0, cfg.horizon, cfg.n_steps + 1)

    def rhs(t, z, u):
        x, y = z[:K], z[K:]
        dx = _slow_rhs(x, y - y0, W, a, c, u)
        dy = fast_rhs(y, x, spec.theta, beta, spec.fast_model) / eps
        return np.concatenate([dx, dy])

    breaks = sorted({0.0, cfg.horizon, interv.t_on, min(cfg.horizon, interv.t_on + interv.duration)})
    z = np.concatenate([np.zeros(K), y0])
    X = np.zeros((len(ts), K)); Y = np.zeros((len(ts), K))
    X[0], Y[0] = z[:K], z[K:]
    for lo, hi in zip(breaks[:-1], breaks[1:]):
        if hi <= lo:
            continue
        u = interv.u(0.5 * (lo + hi), K)
        mask = (ts > lo) & (ts <= hi)
        t_eval = list(ts[mask])
        if not t_eval or abs(t_eval[-1] - hi) > 1e-12:
            t_eval.append(hi)
        sol = solve_ivp(rhs, (lo, hi), z, args=(u,), method=cfg.ref_method,
                        rtol=cfg.ref_rtol, atol=cfg.ref_atol, t_eval=t_eval)
        if not sol.success:
            raise RuntimeError(f"reference solver failed: {sol.message}")
        n_eval = int(mask.sum())
        if n_eval:
            X[mask] = sol.y[:K, :n_eval].T
            Y[mask] = sol.y[K:, :n_eval].T
        z = sol.y[:, -1]
    wall = time.perf_counter() - t0
    return {"t": ts, "x": X, "y": Y, "wall": wall,
            "target": target_from_traj(ts, X, spec.readout, cfg)}


def target_from_traj(ts: np.ndarray, X: np.ndarray, readout: int, cfg: SimConfig) -> float:
    if cfg.target == "auc":
        return float(np.trapezoid(X[:, readout], ts) / (ts[-1] - ts[0]))
    if cfg.target == "final":
        return float(X[-1, readout])
    raise ValueError(cfg.target)


def flips_from_traj(Y: np.ndarray) -> np.ndarray:
    """A node 'flips' if its fast variable ever crosses zero (upper branch reached)."""
    return (Y.max(axis=0) > 0.0)
