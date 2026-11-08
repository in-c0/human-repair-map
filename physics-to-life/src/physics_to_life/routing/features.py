"""Per-node features available to a controller BEFORE ground truth is known.

The controller may use: the network W (structural scaffold), noisy thresholds theta_obs
with known noise level sigma_theta, the intervention specification, and the trajectory
of the cheapest simulation it has already paid for (medium closure, or the current
mixed-fidelity run in the sequential setting).  It never sees the true theta, the true
fast variables or the reference trajectory.
"""
from __future__ import annotations

import numpy as np
from scipy.stats import norm

from ..state.system import SystemSpec, Intervention, FOLD, ancestors_of, influence_to, graph_distance_to

FEATURE_NAMES = [
    # trajectory-derived (from the current cheap simulation)
    "x_max", "x_min", "x_final", "x_mean", "margin", "p_gauss", "upstream_pressure", "x_max_over_theta",
    # intervention-derived
    "is_intervened", "amp_on_node", "amp_total", "duration", "in_weight_from_intervened",
    # graph / causal-relevance (structural scaffold)
    "influence", "inv_dist", "is_readout", "is_ancestor", "in_degree_abs", "out_degree_abs",
    # knowledge / state
    "theta_obs", "sigma_theta", "n_refined_upstream", "frac_refined", "K",
]

GROUPS = {
    "trajectory": ["x_max", "x_min", "x_final", "x_mean", "margin", "p_gauss", "upstream_pressure", "x_max_over_theta"],
    "intervention": ["is_intervened", "amp_on_node", "amp_total", "duration", "in_weight_from_intervened"],
    "graph": ["influence", "inv_dist", "is_readout", "is_ancestor", "in_degree_abs", "out_degree_abs"],
    "state": ["theta_obs", "sigma_theta", "n_refined_upstream", "frac_refined", "K"],
}


def feature_groups() -> dict:
    return {g: [FEATURE_NAMES.index(n) for n in names] for g, names in GROUPS.items()}


def node_features(spec: SystemSpec, interv: Intervention, X: np.ndarray, fidelity: np.ndarray) -> np.ndarray:
    """Return an (K, n_features) array."""
    K, W, r = spec.K, spec.W, spec.readout
    x_max = X.max(axis=0)
    x_min = X.min(axis=0)
    x_final = X[-1]
    x_mean = X.mean(axis=0)
    switch_on_obs = spec.theta_obs + FOLD / spec.beta
    margin = x_max - switch_on_obs
    sig = max(spec.sigma_theta, 1e-6)
    p_gauss = norm.cdf(margin / sig)
    # cascade anticipation: how much switching pressure arrives from parents that may flip
    upstream_pressure = np.abs(W) @ p_gauss
    x_max_over_theta = x_max / np.maximum(np.abs(spec.theta_obs), 0.3)

    is_int = np.zeros(K); amp_on = np.zeros(K)
    for n, A in zip(interv.nodes, interv.amplitudes):
        is_int[n] = 1.0
        amp_on[n] += A
    amp_total = np.full(K, float(sum(abs(a) for a in interv.amplitudes)))
    duration = np.full(K, float(interv.duration))
    in_from_int = np.abs(W[:, list(interv.nodes)]).sum(axis=1)

    infl = influence_to(W, r)
    dist = graph_distance_to(W, r)
    inv_dist = 1.0 / (1.0 + dist)
    is_readout = np.zeros(K); is_readout[r] = 1.0
    anc = ancestors_of(W, r)
    is_anc = np.array([1.0 if k in anc or k == r else 0.0 for k in range(K)])
    in_deg = np.abs(W).sum(axis=1)
    out_deg = np.abs(W).sum(axis=0)

    refined = (fidelity == 2).astype(float)
    n_ref_up = (np.abs(W) > 0).astype(float) @ refined
    frac_ref = np.full(K, refined.mean())
    Kf = np.full(K, float(K))

    F = np.stack([x_max, x_min, x_final, x_mean, margin, p_gauss, upstream_pressure, x_max_over_theta,
                  is_int, amp_on, amp_total, duration, in_from_int,
                  infl, inv_dist, is_readout, is_anc, in_deg, out_deg,
                  spec.theta_obs, np.full(K, spec.sigma_theta), n_ref_up, frac_ref, Kf], axis=1)
    assert F.shape[1] == len(FEATURE_NAMES)
    return F
