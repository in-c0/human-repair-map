"""Target observables for V1: a single intervention should need fine physics for some targets
and not for others, so every episode is scored on several of them."""
from __future__ import annotations
import numpy as np

TARGET_NAMES = ["peak_current", "time_to_peak", "charge", "recovery_fraction", "v_rmse", "spike_latency",
                "spike_count", "min_isi", "mean_v"]


SPIKE_THRESH = -25.0   # mV; the Günay 2015 isopotential model's spikes peak near -1 mV, so 0 mV would miss them


def spikes(t: np.ndarray, V: np.ndarray, thresh: float = SPIKE_THRESH) -> np.ndarray:
    """Upward threshold-crossing times."""
    above = V > thresh
    idx = np.where(~above[:-1] & above[1:])[0]
    return t[idx + 1]


def vclamp_targets(res: dict, t_on: float, t_off: float, channel: str | None = None) -> dict:
    t = res["t"]; I = res["I_ch"][channel] if channel else res["I"]
    m = (t >= t_on) & (t <= t_off)
    Iw = I[m]; tw = t[m]
    k = int(np.argmax(np.abs(Iw)))
    return {"peak_current": float(Iw[k]), "time_to_peak": float(tw[k] - t_on),
            "charge": float(np.trapezoid(Iw, tw))}


def recovery_targets(res1: dict, res2_windows: tuple, channel: str | None = None) -> dict:
    """Twin-pulse recovery: peak of pulse 2 relative to pulse 1."""
    (t1_on, t1_off), (t2_on, t2_off) = res2_windows
    p1 = vclamp_targets(res1, t1_on, t1_off, channel)["peak_current"]
    p2 = vclamp_targets(res1, t2_on, t2_off, channel)["peak_current"]
    return {"recovery_fraction": float(p2 / p1) if abs(p1) > 1e-12 else np.nan}


def cclamp_targets(res: dict, t_on: float, t_off: float, ref_V: np.ndarray | None = None) -> dict:
    t, V = res["t"], res["V"]
    m = (t >= t_on) & (t <= t_off)
    sp = spikes(t[m], V[m])
    out = {"spike_count": float(len(sp)),
           "spike_latency": float(sp[0] - t_on) if len(sp) else float(t_off - t_on),
           "min_isi": float(np.min(np.diff(sp))) if len(sp) > 1 else float(t_off - t_on),
           "mean_v": float(V[m].mean())}
    if ref_V is not None:
        out["v_rmse"] = float(np.sqrt(np.mean((V[m] - ref_V[m]) ** 2)))
    return out
