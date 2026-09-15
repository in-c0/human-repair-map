import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import numpy as np

from physics_to_life.models.simulators import SimConfig
from physics_to_life.experiments.v0_toy import make_episode, build_training_set, run_conditions
from physics_to_life.inference.ensemble import EnsembleClassifier
from physics_to_life.routing.features import FEATURE_NAMES
from physics_to_life.uncertainty.calibration import expected_calibration_error, reliability_curve


def _episodes(n=6):
    cfg = SimConfig(horizon=4.0)
    return [make_episode(s, "id", cfg, with_gains=False) for s in range(n)], cfg


def test_episode_labels_are_consistent():
    eps, cfg = _episodes(4)
    for ep in eps:
        K = ep["spec"].K
        assert ep["features_base"].shape == (K, len(FEATURE_NAMES))
        assert ep["necessary"].sum() <= len(ep["candidates"])
        # every necessary node is a true switcher upstream of the readout
        assert all(ep["flips_true"][k] for k in np.where(ep["necessary"])[0])
        # the minimal set's error is within tolerance when reachable
        S = tuple(sorted(np.where(ep["necessary"])[0]))
        errs = {tuple(sorted(s)): e for s, e, c in ep["subset_table"]}
        if ep["tol_reachable"]:
            assert errs[S] <= 0.01 + 1e-12


def test_conditions_cost_and_oracle_bounds():
    eps, cfg = _episodes(5)
    X, y, g = build_training_set(eps)
    model = EnsembleClassifier(kind="gbm", n_members=2).fit(X, np.where(np.arange(len(y)) % 7 == 0, 1, y))
    rows = run_conditions(eps[0], {"main": model}, cfg, taus=[0.1, 0.5], tols=[0.01])
    pol = {r["policy"] for r in rows}
    for expected in ("uniform_coarse", "uniform_medium", "uniform_fine", "random", "spatial", "physics",
                     "physics_seq", "adjoint", "oracle", "oracle_flips", "learned", "learned_seq"):
        assert expected in pol
    by = {(r["policy"], r["param"]): r for r in rows}
    fine = by[("uniform_fine", 2.0)]; med = by[("uniform_medium", 1.0)]; coarse = by[("uniform_coarse", 0.0)]
    assert fine["cost"] > med["cost"] > coarse["cost"]
    # adaptive policies pay for their base simulation: never cheaper than one medium run
    for r in rows:
        if r["policy"] in ("learned", "learned_seq", "physics", "physics_seq", "adjoint"):
            assert r["cost"] >= med["cost"]
    # oracle at the labelling tolerance is within tolerance if reachable
    if eps[0]["tol_reachable"]:
        assert by[("oracle", 0.01)]["abs_err"] <= 0.01 + 1e-9


def test_calibration_metrics():
    p = np.array([0.1, 0.9, 0.8, 0.2]); y = np.array([0, 1, 1, 0])
    conf, acc, cnt = reliability_curve(p, y, n_bins=5)
    assert cnt.sum() == 4
    assert 0 <= expected_calibration_error(p, y, 5) <= 1


def test_sequential_cost_bookkeeping():
    """A sequential policy's cost must equal base + every intermediate simulation it ran."""
    eps, cfg = _episodes(2)
    from physics_to_life.routing.policies import SimCache, run_physics_heuristic
    ep = eps[0]; K = ep["spec"].K
    sim = SimCache(ep["spec"], ep["interv"], cfg)
    res = run_physics_heuristic(sim, [0.02, 0.5], base=1, sequential=True)
    for r in res:
        n_ref = int((r.fidelity == 2).sum())
        base = cfg.n_steps * 3 * K
        expected = base + sum(cfg.n_steps * (3 * K + (cfg.n_sub - 3) * i) for i in range(1, n_ref + 1))
        assert abs(r.cost - expected) < 1e-6
        assert r.n_iter == n_ref
