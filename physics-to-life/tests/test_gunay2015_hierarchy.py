"""Numerical validation of the constructed fine levels of the Günay 2015 hierarchy."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import numpy as np
import pytest

from physics_to_life.v1.systems import gunay2015 as G
from physics_to_life.v1.systems import gunay2015_fine as F
from physics_to_life.v1.membrane import simulate, Intervention, SimSettings, Protocol
from physics_to_life.v1.markov_fit import hh_vclamp, markov_current

PARAMS = pathlib.Path(__file__).resolve().parents[1] / "experiments" / "v1_channel" / "hierarchy" / "gunay2015_fine.json"
pytestmark = pytest.mark.skipif(not PARAMS.exists(), reason="hierarchy parameters not built")


@pytest.fixture(scope="module")
def specs():
    p = F.load_params(PARAMS)
    return {"A": F.gunay2015_hierarchy(p, q10=3.0, level="A"), "B": F.gunay2015_hierarchy(p, q10=3.0, level="B")}


def test_fine_levels_match_reference_and_differ_from_medium(specs):
    """Fine at working tolerance tracks the tight-tolerance reference; the constructed Kf/NaT fine
    levels differ from the published medium level (that is the point), while Ks/NaP do not."""
    spec = specs["A"]; names = [c.name for c in spec.channels]
    prot = G.gunay_cclamp(10.0, t_end=120.0)
    ref = simulate(spec, prot, {n: 2 for n in names}, reference=True)
    fine = simulate(spec, prot, {n: 2 for n in names})
    assert np.max(np.abs(fine["V"] - ref["V"])) < 0.5
    med = simulate(spec, prot, {n: 1 for n in names})
    assert np.max(np.abs(med["V"] - ref["V"])) > 0.5
    for neg in ("Ks", "NaP"):
        r = simulate(spec, prot, {n: (2 if n == neg else 1) for n in names})
        assert np.max(np.abs(r["V"] - med["V"])) < 0.05, neg


def test_fit_floor_on_fit_family(specs):
    """The constructed levels reproduce the published HH currents on the fit family to the floor
    recorded in the parameter file (consistency of the shipped parameters with their diagnostics)."""
    params = F.load_params(PARAMS)
    for lvl in ("A", "B"):
        for ch_name, fam, e_rev in (("Kf", F.kf_fit_family(), G.E_K), ("NaT", F.nat_fit_family(), G.E_NA)):
            entry = params[ch_name if lvl == "A" else ch_name + "_B"]
            ch = specs[lvl].channel(ch_name); tgt = G.channel_kf() if ch_name == "Kf" else G.channel_nat()
            for name, p in zip(fam.names, fam.protocols):
                _, Im = hh_vclamp(tgt, p, e_rev=e_rev); _, If = markov_current(ch, p, e_rev=e_rev)
                rel = float(np.sqrt(np.mean((Im - If) ** 2)) / max(np.abs(Im).max(), 1e-12))
                assert abs(rel - entry["per_protocol"][name]["rel_rmse"]) < 2e-3, (lvl, ch_name, name, rel)
                assert rel < 0.25


def test_block_and_opening_keys(specs):
    """No drug: the block state is never entered (fine == fine without block); with drug the fine
    current is reduced.  The concerted-step key acts on the fine level and, as a best-faith
    surrogate, on the medium level's activation time constant."""
    spec = specs["A"]; names = [c.name for c in spec.channels]
    prot = Protocol("vclamp", [(0.0, -90.0), (20.0, 20.0), (80.0, -90.0)], 100.0, 0.05)
    fid = {n: (2 if n == "Kf" else 1) for n in names}
    base = simulate(spec, prot, fid)
    p = F.load_params(PARAMS); spec_nb = F.gunay2015_hierarchy(p, q10=3.0, with_block=False)
    nob = simulate(spec_nb, prot, fid)
    assert np.max(np.abs(base["I_ch"]["Kf"] - nob["I_ch"]["Kf"])) < 1e-6 * np.abs(base["I_ch"]["Kf"]).max()
    blk = simulate(spec, prot, fid, Intervention(block_conc={"Kf": 1.0}, block_frac={"Kf": 0.8}))
    assert np.abs(blk["I_ch"]["Kf"]).max() < 0.9 * np.abs(base["I_ch"]["Kf"]).max()
    slow = simulate(spec, prot, fid, Intervention(rate_scales={"kf_opening": 0.3}))
    assert base["t"][np.argmax(np.abs(base["I_ch"]["Kf"]))] < slow["t"][np.argmax(np.abs(slow["I_ch"]["Kf"]))]
    med = simulate(spec, prot, {n: 1 for n in names}); med_slow = simulate(spec, prot, {n: 1 for n in names}, Intervention(rate_scales={"kf_opening": 0.3}))
    assert med["t"][np.argmax(np.abs(med["I_ch"]["Kf"]))] < med_slow["t"][np.argmax(np.abs(med_slow["I_ch"]["Kf"]))]


def test_level_B_is_a_different_formulation(specs):
    """Level B agrees with level A on the fit family to within the two fit floors but is not identical."""
    prot = Protocol("vclamp", [(0.0, -90.0), (20.0, 0.0), (120.0, -90.0)], 150.0, 0.1)
    _, Ia = markov_current(specs["A"].channel("Kf"), prot, e_rev=G.E_K); _, Ib = markov_current(specs["B"].channel("Kf"), prot, e_rev=G.E_K)
    d = np.abs(Ia - Ib).max() / np.abs(Ia).max()
    assert 1e-3 < d < 0.3
