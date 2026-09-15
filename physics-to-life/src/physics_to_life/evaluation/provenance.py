"""Reproducibility record written next to every experiment output."""
from __future__ import annotations

import json
import os
import platform
import subprocess
import sys
import time
from importlib.metadata import version as pkg_version


def _git(cmd):
    try:
        return subprocess.check_output(["git"] + cmd, stderr=subprocess.DEVNULL, text=True).strip()
    except Exception:
        return None


def collect_provenance(config: dict, seed: int, extra: dict | None = None) -> dict:
    pkgs = {}
    for name in ["numpy", "scipy", "scikit-learn", "matplotlib", "pandas", "networkx", "pyyaml"]:
        try:
            pkgs[name] = pkg_version(name)
        except Exception:
            pkgs[name] = None
    prov = {
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "git_commit": _git(["rev-parse", "HEAD"]),
        "git_branch": _git(["rev-parse", "--abbrev-ref", "HEAD"]),
        "git_dirty": bool(_git(["status", "--porcelain"])) if _git(["rev-parse", "HEAD"]) else None,
        "python": sys.version,
        "packages": pkgs,
        "platform": platform.platform(),
        "machine": platform.machine(),
        "processor": platform.processor(),
        "cpu_count": os.cpu_count(),
        "hostname": platform.node(),
        "seed": seed,
        "config": config,
    }
    if extra:
        prov.update(extra)
    return prov


def write_json(path, obj):
    def default(o):
        try:
            import numpy as np
            if isinstance(o, (np.integer,)):
                return int(o)
            if isinstance(o, (np.floating,)):
                return float(o)
            if isinstance(o, np.ndarray):
                return o.tolist()
            if isinstance(o, (np.bool_,)):
                return bool(o)
        except Exception:
            pass
        return str(o)
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, default=default)
