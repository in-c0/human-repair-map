"""Episode profile of the Günay 2015 system: intervention families with their mechanistic
reading, protocol/target groups, and the declared exclusions (fit family, negative-control
channels).  Frozen by the V1 preregistration; changes after the freeze are post-hoc."""
from __future__ import annotations

import numpy as np

from ..membrane import Intervention, Protocol
from ..episodes import TargetGroup
from . import gunay2015 as G
from .gunay2015_fine import KF_BLOCK_KON, KF_BLOCK_KOFF

CHANNELS = ["Ks", "Kf", "NaT", "NaP"]
NEGATIVE_CONTROL = ["Ks", "NaP"]     # fine == medium exactly: refining them can never help
ID_FAMILIES = ["none", "density", "kf_loss", "kf_inactivation", "kf_recovery", "nat_inactivation", "temperature", "k_out"]
OOD_FAMILIES = ["block", "opening_step", "combo", "activation_rate"]

FAMILY_MEANING = {
    "none": "wild type, no perturbation",
    "density": "channel density change of one population (expression level / gene dosage), x0.3-x2",
    "kf_loss": "loss of function of the A-type (Kf; Shaker/Shal composite in this cell type) conductance, x0-x0.5",
    "kf_inactivation": "N-type inactivation rate of Kf (ball-and-chain / N-terminal mutants), x0.2-x3 (off-rate of h1; O->I_N)",
    "kf_recovery": "recovery from N-type inactivation of Kf, x0.3-x3 (on-rate of h1; I_N->O)",
    "nat_inactivation": "fast inactivation rate of NaT (para inactivation-gate mutants), x0.3-x3",
    "temperature": "bath temperature 15-30 C with Q10 = 3 on every rate (constructed extension; inert at 25 C)",
    "k_out": "extracellular K+ 2-15 mM (E_K shifted by the Nernst term from the published -80 mV at 5 mM)",
    "block": "state-dependent open-channel block of Kf (fine: explicit blocked state; cheap: equilibrium block fraction)",
    "opening_step": "concerted opening step of Kf (ILT-like S4 mutants), x0.3-x3 (fine: gamma/delta; cheap: tau_m scaled)",
    "combo": "two perturbations at once",
    "activation_rate": "Kf activation kinetics, x0.5-x2 (all subunit steps)",
}


def sample_intervention(rng: np.random.Generator, family: str) -> Intervention:
    if family == "none":
        return Intervention("none", family=family)
    if family == "density":
        ch = str(rng.choice(CHANNELS)); f = float(np.exp(rng.uniform(np.log(0.3), np.log(2.0))))
        return Intervention(f"density:{ch}x{f:.2f}", g_scales={ch: f}, family=family)
    if family == "kf_loss":
        f = float(rng.uniform(0.0, 0.5))
        return Intervention(f"kf_loss:{f:.2f}", g_scales={"Kf": f}, family=family)
    if family == "kf_inactivation":
        f = float(np.exp(rng.uniform(np.log(0.2), np.log(3.0))))
        return Intervention(f"kf_inact:x{f:.2f}", rate_scales={"kf_inactivation": f}, family=family)
    if family == "kf_recovery":
        f = float(np.exp(rng.uniform(np.log(0.3), np.log(3.0))))
        return Intervention(f"kf_recovery:x{f:.2f}", rate_scales={"kf_recovery": f}, family=family)
    if family == "nat_inactivation":
        f = float(np.exp(rng.uniform(np.log(0.3), np.log(3.0))))
        return Intervention(f"nat_inact:x{f:.2f}", rate_scales={"nat_inactivation": f}, family=family)
    if family == "temperature":
        T = float(rng.uniform(288.15, 303.15))
        return Intervention(f"T={T-273.15:.1f}C", T_K=T, family=family)
    if family == "k_out":
        K = float(np.exp(rng.uniform(np.log(2.0), np.log(15.0))))
        return Intervention(f"Kout={K:.1f}mM", K_out=K, family=family)
    if family == "block":
        conc = float(np.exp(rng.uniform(np.log(0.2), np.log(3.0))))
        frac = conc * KF_BLOCK_KON / (conc * KF_BLOCK_KON + KF_BLOCK_KOFF)   # equilibrium fraction seen by the cheap levels
        return Intervention(f"block:{conc:.2f}", block_conc={"Kf": conc}, block_frac={"Kf": frac}, family=family)
    if family == "opening_step":
        f = float(np.exp(rng.uniform(np.log(0.3), np.log(3.0))))
        return Intervention(f"opening:x{f:.2f}", rate_scales={"kf_opening": f}, family=family)
    if family == "activation_rate":
        f = float(np.exp(rng.uniform(np.log(0.5), np.log(2.0))))
        return Intervention(f"kf_act:x{f:.2f}", rate_scales={"kf_activation": f}, family=family)
    if family == "combo":
        a = sample_intervention(rng, str(rng.choice(["density", "kf_inactivation", "temperature", "k_out", "nat_inactivation"])))
        b = sample_intervention(rng, str(rng.choice(["kf_loss", "kf_recovery", "block", "opening_step"])))
        return Intervention(f"combo[{a.name}+{b.name}]", rate_scales={**a.rate_scales, **b.rate_scales},
                            g_scales={**a.g_scales, **b.g_scales}, T_K=a.T_K or b.T_K, K_out=a.K_out or b.K_out,
                            block_frac={**a.block_frac, **b.block_frac}, block_conc={**a.block_conc, **b.block_conc}, family=family)
    raise ValueError(family)


# evaluation protocols are chosen off the fit family (fit: activation steps -40..+40 by 20 from -90;
# prepulses; recovery gaps 5/20/50/150 ms).  Evaluation steps, gaps and pulse currents differ.
def groups(rng: np.random.Generator) -> list[TargetGroup]:
    step_kf = float(rng.choice([-30.0, -10.0, 10.0, 30.0]))
    gap = float(rng.choice([10.0, 30.0, 100.0]))
    step_na = float(rng.choice([-30.0, -20.0, 0.0]))
    i_pulse = float(rng.choice([-1.0, 0.0, 5.0, 10.0, 20.0, 40.0]))
    g = []
    p = Protocol("vclamp", [(0.0, -90.0), (20.0, step_kf), (80.0, -90.0)], 100.0, 0.05)
    g.append(TargetGroup("vclamp_Kf", p, (20.0, 80.0), ["peak_current", "time_to_peak", "charge"], channel="Kf"))
    p = Protocol("vclamp", [(0.0, -90.0), (20.0, 20.0), (60.0, -90.0), (60.0 + gap, 20.0), (100.0 + gap, -90.0)], 120.0 + gap, 0.05)
    g.append(TargetGroup("recovery_Kf", p, (20.0, 60.0), ["recovery_fraction"], channel="Kf",
                         windows2=((20.0, 60.0), (60.0 + gap, 100.0 + gap))))
    p = Protocol("vclamp", [(0.0, -90.0), (10.0, step_na), (40.0, -90.0)], 50.0, 0.02)
    g.append(TargetGroup("vclamp_NaT", p, (10.0, 40.0), ["peak_current", "time_to_peak", "charge"], channel="NaT"))
    g.append(TargetGroup("cclamp", G.gunay_cclamp(i_pulse), (10.0, 510.0), ["spike_latency", "spike_count", "min_isi", "mean_v", "v_rmse"]))
    return g
