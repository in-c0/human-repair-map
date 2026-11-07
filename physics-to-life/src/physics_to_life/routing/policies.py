"""Refinement policies (the comparison conditions of the adaptive-fidelity experiment).

Every policy returns a list of PolicyResult, one per value of its sweep parameter, so
that accuracy/compute Pareto curves can be traced.  Costs are TOTAL nominal compute,
including the cheap base simulation a policy needs for its features and every
intermediate simulation a sequential policy runs.  Nothing is hidden.

    A  uniform coarse      run_uniform(level=0)
    B  uniform medium      run_uniform(level=1)
    C  uniform fine        run_uniform(level=2)
    D  random              run_random(m)              refine m random nodes
    E1 spatial heuristic   run_spatial_heuristic(m)   refine the m nodes nearest the intervention
    E2 physics heuristic   run_physics_heuristic(tau) P(switch | coarse margin) x causal relevance
    E3 adjoint heuristic   run_adjoint_heuristic(tau) P(switch) x goal sensitivity (DWR-like)
    F  learned             run_learned(tau)           ensemble p + kappa*std, one-shot or sequential
    O  oracle              run_oracle(tol)            minimal set given hidden ground truth
    O' oracle-flips        run_oracle_flips()         all true switchers upstream of the readout
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional, Sequence

import numpy as np
from scipy.stats import norm

from ..state.system import SystemSpec, Intervention, FOLD, ancestors_of, graph_distance_to
from ..models.simulators import SimConfig, simulate_mixed
from .features import node_features, FEATURE_NAMES


@dataclass
class PolicyResult:
    name: str
    param: float
    fidelity: np.ndarray
    target: float
    cost: float
    fine_node_steps: int
    wall: float
    n_sims: int
    n_iter: int
    scores: Optional[np.ndarray] = None
    prob: Optional[np.ndarray] = None
    std: Optional[np.ndarray] = None


class SimCache:
    """Memoises mixed simulations by fidelity vector within one episode."""

    def __init__(self, spec, interv, cfg, rng=None):
        self.spec, self.interv, self.cfg, self.rng = spec, interv, cfg, rng
        self.cache = {}
        self.n_calls = 0

    def run(self, fidelity: np.ndarray) -> dict:
        key = tuple(int(f) for f in fidelity)
        if key not in self.cache:
            self.cache[key] = simulate_mixed(self.spec, self.interv, np.asarray(key), self.cfg, self.rng)
            self.n_calls += 1
        return self.cache[key]


def _fid(K: int, base: int, S: Sequence[int]) -> np.ndarray:
    f = np.full(K, base, dtype=int)
    for k in S:
        f[k] = 2
    return f


def _relevance(spec: SystemSpec) -> np.ndarray:
    anc = ancestors_of(spec.W, spec.readout)
    return np.array([1.0 if (k in anc or k == spec.readout) else 0.0 for k in range(spec.K)])


# ---------------------------------------------------------------------------
# uniform, random, spatial
# ---------------------------------------------------------------------------

def run_uniform(sim: SimCache, level: int) -> list[PolicyResult]:
    K = sim.spec.K
    r = sim.run(np.full(K, level))
    return [PolicyResult(f"uniform_{['coarse','medium','fine'][level]}", level, r["fidelity"], r["target"],
                         r["cost"], r["fine_node_steps"], r["wall"], 1, 0)]


def run_random(sim: SimCache, rng: np.random.Generator, base: int = 1, ms: Sequence[int] = None,
               structured: bool = False) -> list[PolicyResult]:
    K = sim.spec.K
    ms = list(range(K + 1)) if ms is None else ms
    pool = np.arange(K)
    if structured:
        rel = _relevance(sim.spec)
        pool = np.where(rel > 0)[0]
    order = rng.permutation(pool)
    out = []
    for m in ms:
        S = order[:min(m, len(order))]
        r = sim.run(_fid(K, base, S))
        out.append(PolicyResult("random_structured" if structured else "random", m, r["fidelity"], r["target"],
                                r["cost"], r["fine_node_steps"], r["wall"], 1, 0))
    return out


def run_spatial_heuristic(sim: SimCache, base: int = 1, ms: Sequence[int] = None) -> list[PolicyResult]:
    """Refine the m nodes closest (graph distance, downstream direction) to the intervened nodes."""
    spec = sim.spec; K = spec.K
    ms = list(range(K + 1)) if ms is None else ms
    # distance from intervened nodes following edges forward: BFS on W (k <- j means j -> k)
    dist = np.full(K, np.inf)
    frontier = list(sim.interv.nodes)
    for n in frontier:
        dist[n] = 0
    while frontier:
        nxt = []
        for j in frontier:
            for k in range(K):
                if spec.W[k, j] != 0 and dist[k] == np.inf:
                    dist[k] = dist[j] + 1
                    nxt.append(k)
        frontier = nxt
    order = np.argsort(dist, kind="stable")
    out = []
    for m in ms:
        S = order[:m]
        r = sim.run(_fid(K, base, S))
        out.append(PolicyResult("spatial", m, r["fidelity"], r["target"], r["cost"], r["fine_node_steps"],
                                r["wall"], 1, 0))
    return out


# ---------------------------------------------------------------------------
# score-based policies: one-shot and sequential machinery
# ---------------------------------------------------------------------------

def _sweep_scores(sim: SimCache, name: str, base: int, taus: Sequence[float], scorer: Callable,
                  sequential: bool, extra_cost: float = 0.0, max_refine: Optional[int] = None) -> list[PolicyResult]:
    """Generic driver.  scorer(X, fidelity) -> (scores, prob, std) for all nodes.

    One-shot: S(tau) = {k: score_k >= tau} computed from the base trajectory.
    Sequential: greedily add argmax score, re-simulate, re-score; the path is common to all
    taus, tau only decides where to stop (stop when max score < tau).
    """
    spec = sim.spec; K = spec.K
    base_run = sim.run(np.full(K, base))
    base_cost = base_run["cost"] + extra_cost
    out = []
    if not sequential:
        scores, prob, std = scorer(base_run["x"], base_run["fidelity"])
        for tau in taus:
            S = np.where(scores >= tau)[0]
            if max_refine is not None:
                S = S[np.argsort(-scores[S])][:max_refine]
            r = sim.run(_fid(K, base, S))
            # if nothing refined, the base run is the prediction: no extra sim
            cost = base_cost + (0.0 if len(S) == 0 else r["cost"])
            wall = base_run["wall"] + (0.0 if len(S) == 0 else r["wall"])
            out.append(PolicyResult(name, tau, r["fidelity"], r["target"], cost, r["fine_node_steps"], wall,
                                    1 if len(S) == 0 else 2, 0, scores, prob, std))
        return out
    # sequential path
    fid = np.full(K, base)
    path = []  # (cum_cost, cum_wall, target, fidelity, max_score_before_step, scores, prob, std, n_sims)
    cum_cost, cum_wall, n_sims = base_cost, base_run["wall"], 1
    cur = base_run
    limit = K if max_refine is None else max_refine
    for it in range(limit + 1):
        scores, prob, std = scorer(cur["x"], fid)
        cand = np.where(fid < 2)[0]
        if len(cand) == 0:
            path.append((cum_cost, cum_wall, cur["target"], fid.copy(), -np.inf, scores, prob, std, n_sims))
            break
        best = cand[np.argmax(scores[cand])]
        path.append((cum_cost, cum_wall, cur["target"], fid.copy(), float(scores[best]), scores, prob, std, n_sims))
        if it == limit or float(scores[best]) < min(taus):
            break
        fid = fid.copy(); fid[best] = 2
        cur = sim.run(fid)
        cum_cost += cur["cost"]; cum_wall += cur["wall"]; n_sims += 1
    for tau in taus:
        # walk the path: stop at the first state whose best candidate scores below tau
        chosen = path[-1]; n_iter = len(path) - 1
        for i, st in enumerate(path):
            if st[4] < tau:
                chosen = st; n_iter = i
                break
        cum_cost_i, cum_wall_i, tgt, fid_i, _, scores_i, prob_i, std_i, n_sims_i = chosen
        out.append(PolicyResult(name, tau, fid_i, tgt, cum_cost_i, int((fid_i == 2).sum()) * sim.cfg.n_steps,
                                cum_wall_i, n_sims_i, n_iter, scores_i, prob_i, std_i))
    return out


def physics_scorer(spec: SystemSpec):
    rel = _relevance(spec)
    switch_on_obs = spec.theta_obs + FOLD / spec.beta
    sig = max(spec.sigma_theta, 1e-6)

    def scorer(X, fidelity):
        margin = X.max(axis=0) - switch_on_obs
        p = norm.cdf(margin / sig)
        s = p * rel
        return s, p, np.zeros_like(p)
    return scorer


def run_physics_heuristic(sim: SimCache, taus: Sequence[float], base: int = 1, sequential: bool = False,
                          max_refine: Optional[int] = 6):
    name = "physics_seq" if sequential else "physics"
    return _sweep_scores(sim, name, base, taus, physics_scorer(sim.spec), sequential,
                         max_refine=max_refine if sequential else None)


def adjoint_scorer(sim: SimCache, base: int, delta: float = 0.05):
    """Goal-oriented sensitivity: dY/d(closure of node k) by finite differences on the cheap
    model, charged as an adjoint solve (2 x base cost, see extra_cost in run_adjoint_heuristic).
    Score = P(switch_k) * |dY/d(y_k)| * (expected jump size 2)."""
    spec = sim.spec; K = spec.K
    switch_on_obs = spec.theta_obs + FOLD / spec.beta
    sig = max(spec.sigma_theta, 1e-6)
    base_run = sim.run(np.full(K, base))
    Y0 = base_run["target"]
    sens = np.zeros(K)
    for k in range(K):
        # perturb node k's closure by pushing its fast variable up by delta over the horizon
        spec_k = _perturbed_spec(spec, k, delta)
        r = simulate_mixed(spec_k, sim.interv, np.full(K, base), sim.cfg)
        sens[k] = (r["target"] - Y0) / delta

    def scorer(X, fidelity):
        margin = X.max(axis=0) - switch_on_obs
        p = norm.cdf(margin / sig)
        s = p * np.abs(sens) * 2.0
        return s, p, np.zeros_like(p)
    return scorer


def _perturbed_spec(spec: SystemSpec, k: int, delta: float) -> SystemSpec:
    """A copy of spec whose node-k baseline y0 is shifted by -delta, so that the closure
    contributes +delta/2 * c to dx_k/dt (a constant perturbation of node k's closure)."""
    shift = np.zeros(spec.K); shift[k] = delta
    return _ShiftedSpec(K=spec.K, W=spec.W, theta=spec.theta, theta_obs=spec.theta_obs,
                        sigma_theta=spec.sigma_theta, readout=spec.readout, a=spec.a, c=spec.c,
                        beta=spec.beta, eps=spec.eps, fast_model=spec.fast_model, noise=spec.noise,
                        seed=spec.seed, family=spec.family, y0_shift=shift)


@dataclass
class _ShiftedSpec(SystemSpec):
    """SystemSpec whose baseline y0 is shifted (used only for finite-difference sensitivities)."""
    y0_shift: np.ndarray = None

    @property
    def y0(self):
        return SystemSpec.y0.fget(self) - self.y0_shift


def run_adjoint_heuristic(sim: SimCache, taus: Sequence[float], base: int = 1, sequential: bool = False):
    K = sim.spec.K
    base_run = sim.run(np.full(K, base))
    name = "adjoint_seq" if sequential else "adjoint"
    return _sweep_scores(sim, name, base, taus, adjoint_scorer(sim, base), sequential,
                         extra_cost=2.0 * base_run["cost"])


def learned_scorer(model, spec: SystemSpec, interv: Intervention, kappa: float = 1.0, relevance_mask: bool = False):
    rel = _relevance(spec) if relevance_mask else None

    def scorer(X, fidelity):
        F = node_features(spec, interv, X, fidelity)
        p, s = model.predict(F)
        score = p + kappa * s
        if rel is not None:
            score = score * rel
        return score, p, s
    return scorer


def run_learned(sim: SimCache, model, taus: Sequence[float], base: int = 1, sequential: bool = False,
                kappa: float = 1.0, name: str = "learned", max_refine: Optional[int] = None):
    return _sweep_scores(sim, name + ("_seq" if sequential else ""), base, taus,
                         learned_scorer(model, sim.spec, sim.interv, kappa), sequential, max_refine=max_refine)


# ---------------------------------------------------------------------------
# oracles (use hidden ground truth; upper bounds, not competitors)
# ---------------------------------------------------------------------------

def run_oracle(sim: SimCache, subset_table: list, tols: Sequence[float], base: int = 1) -> list[PolicyResult]:
    """subset_table: list of (S tuple, abs error vs reference, nominal cost) for candidate subsets."""
    K = sim.spec.K
    out = []
    for tol in tols:
        ok = [row for row in subset_table if row[1] <= tol]
        if ok:
            S = min(ok, key=lambda row: (row[2], row[1]))[0]
        else:
            S = min(subset_table, key=lambda row: row[1])[0]
        r = sim.run(_fid(K, base, S))
        out.append(PolicyResult("oracle", tol, r["fidelity"], r["target"], r["cost"], r["fine_node_steps"],
                                r["wall"], 1, 0))
    return out


def run_oracle_flips(sim: SimCache, flips_true: np.ndarray, base: int = 1) -> list[PolicyResult]:
    K = sim.spec.K
    rel = _relevance(sim.spec)
    S = np.where(flips_true & (rel > 0))[0]
    r = sim.run(_fid(K, base, S))
    return [PolicyResult("oracle_flips", 0, r["fidelity"], r["target"], r["cost"], r["fine_node_steps"],
                         r["wall"], 1, 0)]
