"""Analytic voltage-clamp solutions and Markov-to-HH fitting.

Under a piecewise-constant command voltage the HH gate ODE and the Markov master equation
are linear with constant coefficients on each segment, so both have closed-form solutions:
  gate    x(t) = x_inf + (x0 - x_inf) exp(-t / tau)
  chain   p(t) = p0 expm(Q t)          (propagated on the output grid with one expm per segment)
These are used (i) to fit constructed Markov schemes to the published HH description on a
declared *fitting protocol family*, and (ii) as an independent check of the ODE integrator.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

import numpy as np
from scipy.linalg import expm
from scipy.optimize import least_squares

from .channels import ChannelPopulation, MarkovScheme
from .membrane import Protocol


def hh_vclamp(ch: ChannelPopulation, protocol: Protocol, T_K: float = 298.15, scales: Optional[dict] = None,
              e_rev: float = -80.0, g_scale: float = 1.0, block: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Analytic HH-level current of one channel under a voltage-clamp protocol (level 1)."""
    t = np.arange(0.0, protocol.t_end + 1e-9, protocol.dt_out)
    V0 = protocol.segments[0][1]
    x = np.array([g.x_inf(V0, T_K, scales) for g in ch.hh_gates], float)
    X = np.zeros((len(t), len(x))); X[0] = x
    bps = protocol.breakpoints()
    for lo, hi in zip(bps[:-1], bps[1:]):
        V = protocol.command(lo + 1e-9)
        m = (t > lo + 1e-12) & (t <= hi + 1e-12)
        xi = np.array([g.x_inf(V, T_K, scales) for g in ch.hh_gates]); tau = np.array([g.tau(V, T_K, scales) for g in ch.hh_gates])
        dt = t[m] - lo
        X[m] = xi + (x - xi) * np.exp(-dt[:, None] / tau)
        x = xi + (x - xi) * np.exp(-(hi - lo) / tau)
    Vt = np.array([protocol.command(s + 1e-9) for s in t])
    po = np.array([ch.po_from_values(list(X[i])) for i in range(len(t))])
    I = ch.g_max * ch.g_scale_cheap * g_scale * (1.0 - block) * po * (Vt - e_rev)
    return t, I


def markov_vclamp(scheme: MarkovScheme, protocol: Protocol, T_K: float = 298.15, scales: Optional[dict] = None,
                  p0: Optional[np.ndarray] = None) -> tuple[np.ndarray, np.ndarray]:
    """Open probability of a Markov scheme under a voltage-clamp protocol, by segment-wise
    matrix exponentials on the output grid (exact up to floating point)."""
    t = np.arange(0.0, protocol.t_end + 1e-9, protocol.dt_out)
    V0 = protocol.segments[0][1]
    p = scheme.steady_state(V0, T_K, scales) if p0 is None else np.asarray(p0, float)
    PO = np.zeros(len(t)); PO[0] = p @ scheme.open
    bps = protocol.breakpoints()
    for lo, hi in zip(bps[:-1], bps[1:]):
        V = protocol.command(lo + 1e-9)
        Q = scheme.Q(V, T_K, scales)
        idx = np.where((t > lo + 1e-12) & (t <= hi + 1e-12))[0]
        dts = t[idx] - lo
        PO[idx], p = _propagate(Q, p, dts, scheme.open, protocol.dt_out, hi - lo)
    return t, PO


def _propagate(Q: np.ndarray, p0: np.ndarray, dts: np.ndarray, open_: np.ndarray, dt_out: float, t_end: float):
    """(p(t) . open for all t in dts, p(t_end)) via the eigendecomposition of Q (row-vector
    convention p(t) = p0 expm(Q t)); falls back to matrix exponentials when the eigenbasis is
    ill-conditioned."""
    try:
        lam, P = np.linalg.eig(Q.T)              # Q^T P = P diag(lam)  ->  p(t) = (c e^{lam t}) P^T
        cond = np.linalg.cond(P)
        if not np.isfinite(cond) or cond > 1e10:
            raise np.linalg.LinAlgError("ill-conditioned eigenbasis")
        c = np.linalg.solve(P, p0.astype(complex))   # coordinates of p0 in the eigenbasis
        w = P.T @ open_.astype(complex)              # projection of each eigenvector onto the open weights
        E = np.exp(np.outer(dts, lam))               # (T, n)
        po = np.clip((E * (c * w)[None, :]).sum(axis=1).real, 0.0, 1.0)
        p_end = ((c * np.exp(lam * t_end)) @ P.T).real
        p_end = np.clip(p_end, 0.0, None); p_end /= p_end.sum()
        return po, p_end
    except np.linalg.LinAlgError:
        M = expm(Q * dt_out)
        out = np.zeros(len(dts)); pk = p0
        for i in range(len(dts)):
            pk = pk @ M
            out[i] = pk @ open_
        return out, p0 @ expm(Q * t_end)


def markov_current(ch: ChannelPopulation, protocol: Protocol, T_K: float = 298.15, scales: Optional[dict] = None,
                   e_rev: float = -80.0, g_scale: float = 1.0) -> tuple[np.ndarray, np.ndarray]:
    t, po = markov_vclamp(ch.markov, protocol, T_K, scales)
    Vt = np.array([protocol.command(s + 1e-9) for s in t])
    return t, ch.g_max * g_scale * po * (Vt - e_rev)


@dataclass
class FitFamily:
    """The declared fitting protocol family (what the constructed fine level is matched on)."""
    protocols: list[Protocol]
    names: list[str]
    weights: list[float]


def fit_markov_to_hh(build: Callable[[np.ndarray], ChannelPopulation], theta0: np.ndarray, lo: np.ndarray, hi: np.ndarray,
                     target_ch: ChannelPopulation, family: FitFamily, e_rev: float, T_K: float = 298.15,
                     n_starts: int = 3, rng: Optional[np.random.Generator] = None, verbose: bool = False,
                     max_nfev: int = 400) -> dict:
    """Least-squares fit of the fine (Markov) channel to the HH channel's currents on the fit
    family.  `build(theta)` returns a ChannelPopulation whose markov scheme and g_max are set
    from theta (log-parameterised where positive).  Residuals are normalised by the largest
    |I| of each protocol so every trace counts on a comparable scale."""
    rng = rng or np.random.default_rng(0)
    targets = []
    for p in family.protocols:
        t, I = hh_vclamp(target_ch, p, T_K, None, e_rev)
        targets.append((t, I, max(np.abs(I).max(), 1e-9)))

    def resid(theta):
        ch = build(theta)
        out = []
        for p, (t, I, s), w in zip(family.protocols, targets, family.weights):
            _, If = markov_current(ch, p, T_K, None, e_rev)
            out.append(np.sqrt(w) * (If - I) / s)
        return np.concatenate(out)

    best = None
    starts = [theta0] + [np.clip(theta0 + rng.normal(0, 0.3, size=len(theta0)) * (hi - lo) * 0.25, lo, hi) for _ in range(n_starts - 1)]
    history = []
    for k, th in enumerate(starts):
        sol = least_squares(resid, th, bounds=(lo, hi), max_nfev=max_nfev, xtol=1e-8, ftol=1e-8)
        rms = float(np.sqrt(np.mean(sol.fun ** 2)))
        history.append({"start": k, "rms": rms, "nfev": int(sol.nfev), "status": int(sol.status)})
        if verbose:
            print(f"  start {k}: normalised rms {rms:.4f} (nfev {sol.nfev})", flush=True)
        if best is None or rms < best["rms"]:
            best = {"theta": sol.x, "rms": rms, "sol": sol}
    # per-protocol diagnostics at the best parameters
    ch = build(best["theta"])
    per = {}
    for p, name, (t, I, s) in zip(family.protocols, family.names, targets):
        _, If = markov_current(ch, p, T_K, None, e_rev)
        per[name] = {"rel_rmse": float(np.sqrt(np.mean((If - I) ** 2)) / s), "rel_max": float(np.abs(If - I).max() / s)}
    return {"theta": best["theta"], "rms": best["rms"], "per_protocol": per, "history": history}
