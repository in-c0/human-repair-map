"""Numerical anchors for the published Günay 2015 isopotential aCC motoneuron port."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import numpy as np

from physics_to_life.v1.systems.gunay2015 import (gunay2015_membrane, gunay_cclamp, xpp_euler, steady_state_at_current,
                                                  XPP_SETTLED_STATE, I_HOLD)
from physics_to_life.v1.membrane import simulate, Intervention, SimSettings
from physics_to_life.v1.targets import spikes


def _stats(t, V, lo=10.0, hi=510.0):
    sp = spikes(t, V, thresh=-25.0); sp = sp[(sp >= lo) & (sp <= hi)]; isi = np.diff(sp)
    return len(sp), (1000.0 / isi.mean() if len(isi) else 0.0), (isi.std() / isi.mean() if len(isi) else np.nan), (sp[0] - lo if len(sp) else np.nan)


def test_settled_state_matches_xpp_export():
    """The XPP file quotes the settled state at I = -12 pA to 17 digits; the ported equations
    reproduce every gate value and the voltage."""
    ss = steady_state_at_current(I_HOLD)
    for k, v in XPP_SETTLED_STATE.items():
        assert abs(ss[k] - v) < 1e-7, (k, ss[k], v)
    spec = gunay2015_membrane()
    r = simulate(spec, gunay_cclamp(0.0, t_end=1.0), {c.name: 1 for c in spec.channels})
    assert abs(r["V0"] - XPP_SETTLED_STATE["V"]) < 1e-6


def test_fine_equals_medium_for_exact_channels_in_current_clamp():
    """With every channel at its HH-equivalent chain, fine and medium must agree to solver
    tolerance (the tensor-product chains for Kf and NaT are exact)."""
    spec = gunay2015_membrane(); names = [c.name for c in spec.channels]
    st = SimSettings(rtol=1e-8, atol=1e-10)
    fine = simulate(spec, gunay_cclamp(10.0, t_end=120.0), {n: 2 for n in names}, settings=st)
    med = simulate(spec, gunay_cclamp(10.0, t_end=120.0), {n: 1 for n in names}, settings=st)
    assert np.max(np.abs(fine["V"] - med["V"])) < 0.05
    assert fine["state_dim"] == 5 + 20 + 8 + 2 and med["state_dim"] == 1 + 3 + 2 + 1


def test_port_agrees_with_authors_euler_integrator():
    """Spike times of the LSODA port and of a forward-Euler (dt = 0.001 ms) integration of the
    XPP equations agree to the output resolution over the first spikes."""
    spec = gunay2015_membrane(); names = [c.name for c in spec.channels]
    r = simulate(spec, gunay_cclamp(10.0, t_end=120.0), {n: 1 for n in names})
    te, Ve = xpp_euler(10.0, t_end=120.0, nout=50)
    assert np.allclose(te, r["t"])
    s1 = spikes(r["t"], r["V"], -25.0); s2 = spikes(te, Ve, -25.0)
    assert len(s1) == len(s2) and np.max(np.abs(s1 - s2)) <= 0.1
    assert np.max(np.abs(r["V"] - Ve)) < 1.0


def test_published_firing_features():
    """Reported: CV of the ISI ~0.002 at ~50 Hz; large delays to first spike for small currents;
    rheobase (500 ms pulse) between -1.9 and -1.8 pA absolute."""
    spec = gunay2015_membrane(); names = [c.name for c in spec.channels]
    fid = {n: 1 for n in names}
    n0, f0, cv0, d0 = _stats(*[simulate(spec, gunay_cclamp(0.0), fid)[k] for k in ("t", "V")])
    assert 45.0 < f0 < 55.0 and cv0 < 0.01
    n, f, cv, d = _stats(*[simulate(spec, gunay_cclamp(-1.8), fid)[k] for k in ("t", "V")])
    assert n > 0 and d > 250.0
    n, f, cv, d = _stats(*[simulate(spec, gunay_cclamp(-1.9), fid)[k] for k in ("t", "V")])
    assert n == 0


def test_interventions_leave_reference_conditions_unchanged():
    """Q10 and Nernst-shift hooks are inert at the reference temperature and [K+]o."""
    spec = gunay2015_membrane(q10=3.0); names = [c.name for c in spec.channels]
    fid = {n: 1 for n in names}
    base = simulate(spec, gunay_cclamp(10.0, t_end=60.0), fid)
    same = simulate(spec, gunay_cclamp(10.0, t_end=60.0), fid, Intervention(T_K=298.15, K_out=5.0))
    assert np.max(np.abs(base["V"] - same["V"])) < 1e-9
    warm = simulate(spec, gunay_cclamp(10.0, t_end=60.0), fid, Intervention(T_K=308.15))
    assert np.max(np.abs(base["V"] - warm["V"])) > 0.5
    hiK = simulate(spec, gunay_cclamp(10.0, t_end=60.0), fid, Intervention(K_out=10.0))
    assert hiK["V0"] > base["V0"]  # depolarised rest with raised [K+]o
