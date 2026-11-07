"""Physical/state constraints monitored on every simulation.

The V0 system has no conserved quantity, but it has hard bounds: the fast variable lives
on the branches of a cubic (|y| <= ~1.7 for the bias ranges used) and the slow variable is
bounded by the saturating coupling.  Any violation flags a numerical failure that must be
reported rather than silently averaged into a metric.
"""
from __future__ import annotations
import numpy as np
from ..state.system import SystemSpec, Intervention


def check_trajectory(spec: SystemSpec, interv: Intervention, X: np.ndarray, Y: np.ndarray) -> dict:
    finite = bool(np.isfinite(X).all() and np.isfinite(Y).all())
    y_bound = 2.0
    amax = float(sum(abs(a) for a in interv.amplitudes))
    x_bound = (np.abs(spec.W).sum(axis=1).max() + spec.c * 1.5 + amax) / spec.a + 1.0
    y_viol = int((np.abs(Y) > y_bound).sum()) if finite else -1
    x_viol = int((np.abs(X) > x_bound).sum()) if finite else -1
    return {"finite": finite, "y_bound_violations": y_viol, "x_bound_violations": x_viol,
            "ok": finite and y_viol == 0 and x_viol == 0}
