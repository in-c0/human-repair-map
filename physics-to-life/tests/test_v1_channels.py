import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import numpy as np
import pytest

from physics_to_life.v1.channels import Rate, HHGate, sequential_subunit_scheme, ChannelPopulation
from physics_to_life.v1.membrane import MembraneSpec, Protocol, Intervention, simulate, SimSettings
from physics_to_life.v1.parameters import provisional_membrane, provisional_shab, vclamp_activation, cclamp_step, vclamp_recovery


def test_markov_rows_sum_to_zero_and_steady_state_is_distribution():
    ch = provisional_shab()
    Q = ch.markov.Q(-20.0)
    assert np.allclose(Q.sum(axis=1), 0.0)
    p = ch.markov.steady_state(-20.0)
    assert abs(p.sum() - 1.0) < 1e-9 and (p >= 0).all()


def test_hh_gate_equals_equivalent_markov_chain():
    """The medium (HH n^4) level must reproduce the fine (sequential 5-state Markov) level exactly
    for an independent-subunit channel: this anchors the numerical validation of the hierarchy."""
    ch = provisional_shab()
    spec = MembraneSpec(C=20.0, g_leak=0.0, e_leak=-60.0, channels=[ch], T_K=295.15)
    prot = vclamp_activation(step_mV=10.0, t_step=80.0)
    fine = simulate(spec, prot, {"shab": 2}, settings=SimSettings(rtol=1e-8, atol=1e-10))
    med = simulate(spec, prot, {"shab": 1}, settings=SimSettings(rtol=1e-8, atol=1e-10))
    assert np.max(np.abs(fine["I"] - med["I"])) < 1e-3 * np.max(np.abs(fine["I"]))


def test_fine_matches_reference_and_levels_differ_when_physics_differs():
    spec = provisional_membrane()
    prot = vclamp_activation(step_mV=20.0)
    ref = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2}, reference=True)
    fine = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2})
    med = simulate(spec, prot, {"shaker": 1, "shab": 1, "na": 1})
    coarse = simulate(spec, prot, {"shaker": 0, "shab": 0, "na": 0})
    scale = np.max(np.abs(ref["I"]))
    assert np.max(np.abs(fine["I"] - ref["I"])) < 1e-3 * scale
    # shaker's concerted opening + inactivation coupling makes HH differ from Markov
    assert np.max(np.abs(med["I"] - ref["I"])) > 1e-3 * scale
    assert coarse["cost"] < med["cost"] < fine["cost"]


def test_current_clamp_spikes_and_cost_ordering():
    spec = provisional_membrane()
    prot = cclamp_step(i_pA=150.0)
    fine = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2})
    assert np.isfinite(fine["V"]).all()
    assert fine["V"].max() > 0.0  # at least one spike crosses 0 mV
    coarse = simulate(spec, prot, {"shaker": 0, "shab": 0, "na": 0})
    assert coarse["cost"] < fine["cost"]


def test_interventions_change_the_right_things():
    spec = provisional_membrane()
    prot = vclamp_activation(step_mV=20.0)
    base = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2})
    half = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2}, Intervention(g_scales={"shaker": 0.5}))
    assert np.max(np.abs(half["I_ch"]["shaker"])) < 0.6 * np.max(np.abs(base["I_ch"]["shaker"]))
    warm = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2}, Intervention(T_K=305.15))
    # warmer: faster activation -> earlier time to peak of the shaker current
    tp_base = base["t"][np.argmax(base["I_ch"]["shaker"])]; tp_warm = warm["t"][np.argmax(warm["I_ch"]["shaker"])]
    assert tp_warm < tp_base
    hiK = simulate(spec, prot, {"shaker": 2, "shab": 2, "na": 2}, Intervention(K_out=20.0))
    assert np.max(hiK["I_ch"]["shaker"]) < np.max(base["I_ch"]["shaker"])  # reduced driving force
