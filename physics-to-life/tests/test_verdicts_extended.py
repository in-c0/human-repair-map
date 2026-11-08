"""Unit checks of the mechanical verdict helpers in experiments/v1_channel/verdicts_extended.py
(H5/H8/H9/H10 rules of the V1 preregistration): AUROC, paired bootstrap and the H10 rule on synthetic inputs."""
import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "experiments" / "v1_channel"))
import verdicts_extended as VE  # noqa: E402


def test_auroc_rank_based():
    assert VE.auroc(np.array([0.1, 0.4, 0.35, 0.8]), np.array([0, 0, 1, 1])) == 0.75
    assert VE.auroc(np.array([1.0, 2.0, 3.0]), np.array([0, 0, 1])) == 1.0
    assert np.isnan(VE.auroc(np.array([1.0, 2.0]), np.array([1, 1])))       # one class only
    assert VE.auroc(np.array([1.0, np.nan, 3.0, 2.0]), np.array([0, 1, 1, 0])) == 1.0   # non-finite scores dropped


def test_paired_bootstrap_sign_and_interval():
    rng = np.random.default_rng(0); b = rng.normal(0, 1, 400); a = b + 0.5
    mean, lo, hi = VE.paired_bootstrap(a, b, n_boot=500, seed=1)
    assert abs(mean - 0.5) < 1e-9 and lo > 0.3 and hi < 0.7
    assert all(np.isnan(v) for v in VE.paired_bootstrap(np.array([np.nan]), np.array([1.0])))


def _restoration_dir(tmp_path, n_func, routed_all3, routed_fineA, cost_ratio, claimed_fail):
    d = tmp_path / "restoration"; d.mkdir(parents=True)
    block = {"routed": {"restored_all_three": routed_all3, "restored_fineA": routed_fineA, "restored_fineB": 1.0, "restored_heldout": 1.0,
                        "claimed_restored": 1.0, "claimed_but_fails_fineA_rate": claimed_fail, "search_cost": 1.0}, "medium": {}, "fine": {"search_cost": 1.0},
             "routed_cost_over_fine": cost_ratio}
    summ = {"n_instances": 12, "n_skipped_silent_wt": 1, "n_functionally_damaged": n_func, "damaged_within_tol_rate": 0.3, "functionally_damaged": block,
            "damage": "nat_loss", "damage_status": "post-hoc", "voc_lambda": 1e-5, "voc_lambda_source": "test"}
    (d / "summary.json").write_text(json.dumps(summ)); (d / "instances.json").write_text("[]")
    return tmp_path


def test_h10_rule(tmp_path):
    assert "not testable" in VE.h10(_restoration_dir(tmp_path, 0, 1.0, 1.0, 0.2, 0.0), "restoration")["verdict"]
    r = VE.h10(_restoration_dir(tmp_path / "a", 8, 0.75, 0.875, 0.4, 0.1), "restoration"); assert r["verdict"] == "passes"
    r = VE.h10(_restoration_dir(tmp_path / "b", 8, 0.75, 0.875, 0.6, 0.1), "restoration"); assert r["verdict"] == "not passed"   # cost clause fails
    r = VE.h10(_restoration_dir(tmp_path / "c", 8, 0.25, 0.375, 0.4, 0.5), "restoration"); assert r["verdict"] == "falsified"
    assert VE.h10(tmp_path / "missing", "restoration") is None
