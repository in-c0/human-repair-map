import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import numpy as np
import pytest

from physics_to_life.state.system import (make_system, make_intervention, y_lower_branch, FOLD, fast_rhs,
                                          ancestors_of, influence_to)
from physics_to_life.models.simulators import SimConfig, simulate_mixed, simulate_reference, flips_from_traj
from physics_to_life.constraints.invariants import check_trajectory


def test_lower_branch_is_a_root_on_the_lower_branch():
    b = np.linspace(-4, FOLD - 1e-6, 50)
    y = y_lower_branch(b, np.zeros_like(b), 1.0)
    assert np.all(np.abs(y - y**3 + b) < 1e-8)
    assert np.all(y <= -1 / np.sqrt(3) + 1e-12)


def test_lower_branch_warm_start_matches_cold_start():
    rng = np.random.default_rng(0)
    x = rng.uniform(-2, 1.5, 40); th = rng.uniform(0.8, 2.2, 40)
    cold = y_lower_branch(x, th, 1.0)
    warm = y_lower_branch(x, th, 1.0, y_init=cold + 0.05)
    assert np.allclose(cold, warm, atol=1e-8)


def test_baseline_is_fixed_point_of_every_fidelity():
    rng = np.random.default_rng(1)
    spec = make_system(rng)
    from physics_to_life.state.system import Intervention
    null = Intervention("pulse", (0,), (0.0,), 0.5, 1.0)
    cfg = SimConfig(horizon=2.0)
    for level in (0, 1, 2):
        r = simulate_mixed(spec, null, np.full(spec.K, level), cfg)
        assert np.abs(r["x"]).max() < 1e-9
        assert np.abs(r["y"] - spec.y0).max() < 1e-9


def test_fine_matches_reference_and_coarse_is_worse():
    rng = np.random.default_rng(2)
    cfg = SimConfig()
    errs_f, errs_c = [], []
    for ep in range(4):
        spec = make_system(rng)
        interv = make_intervention(rng, spec)
        ref = simulate_reference(spec, interv, cfg)
        fine = simulate_mixed(spec, interv, np.full(spec.K, 2), cfg)
        coarse = simulate_mixed(spec, interv, np.zeros(spec.K, int), cfg)
        assert check_trajectory(spec, interv, fine["x"], fine["y"])["ok"]
        errs_f.append(abs(fine["target"] - ref["target"]))
        errs_c.append(abs(coarse["target"] - ref["target"]))
    assert max(errs_f) < 0.01
    assert np.mean(errs_c) > np.mean(errs_f)


def test_cost_accounting():
    rng = np.random.default_rng(3)
    spec = make_system(rng)
    interv = make_intervention(rng, spec)
    cfg = SimConfig(horizon=1.0)
    fid = np.array([2, 1, 0] + [1] * (spec.K - 3))
    r = simulate_mixed(spec, interv, fid, cfg)
    expected = cfg.n_steps * (cfg.n_sub + 3.0 + 1.0 + 3.0 * (spec.K - 3))
    assert r["cost"] == pytest.approx(expected)
    assert r["fine_node_steps"] == cfg.n_steps


def test_switch_happens_only_above_fold():
    rng = np.random.default_rng(4)
    spec = make_system(rng, K=3)
    spec.W[:] = 0.0
    from physics_to_life.state.system import Intervention
    cfg = SimConfig(horizon=6.0)
    thr = spec.theta[0] + FOLD
    for A, should_flip in ((thr - 0.3, False), (thr + 0.4, True)):
        interv = Intervention("step", (0,), (A,), 0.5, 5.5)
        r = simulate_mixed(spec, interv, np.full(3, 2), cfg)
        assert bool(flips_from_traj(r["y"])[0]) == should_flip


def test_graph_utils():
    W = np.zeros((4, 4)); W[1, 0] = 1; W[2, 1] = 1; W[3, 2] = 1
    assert ancestors_of(W, 3) == {0, 1, 2}
    inf = influence_to(W, 3)
    assert inf[2] > inf[1] > inf[0] > 0 and inf[3] == 0
