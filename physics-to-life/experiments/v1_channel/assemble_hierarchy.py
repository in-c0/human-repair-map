#!/usr/bin/env python
"""Assemble hierarchy/gunay2015_fine.json from individual build_hierarchy.py outputs.
Usage: assemble_hierarchy.py --kf FILE --nat FILE --kf-b FILE --nat-b FILE [--rejected NAME=FILE:KEY ...]"""
from __future__ import annotations
import argparse, json
from pathlib import Path
HERE = Path(__file__).resolve().parent

NOTE = ("Level A: Kf = ZHA-type activation (4 subunit steps + concerted opening) with an allosterically coupled inactivated chain "
        "(closed-state inactivation), C-type after N-type, open-channel block; NaT = 3-step activation with open-state inactivation "
        "and cycle-consistent recovery through a closed state. Level B: Kf = sequential 8-step activation with two step types (no "
        "concerted step), coupled inactivated chain, parallel C-type; NaT = open-state-only inactivation with a slow inactivated state. "
        "Rates with an HH counterpart are the published HH rates x fitted multiplier x exponential tilt ('anchored' forms); free rate "
        "functions only for structure without an HH counterpart. All rate constants are CONSTRUCTED (fitted to the published HH currents "
        "on the declared fit family), never measured.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kf", required=True); ap.add_argument("--nat", required=True); ap.add_argument("--kf-b", required=True); ap.add_argument("--nat-b", required=True)
    ap.add_argument("--rejected", nargs="*", default=[])
    ap.add_argument("--out", default=str(HERE / "hierarchy" / "gunay2015_fine.json"))
    a = ap.parse_args()
    out = {"provenance": {}, "note": NOTE}
    for entry, path in (("Kf", a.kf), ("NaT", a.nat), ("Kf_B", a.kf_b), ("NaT_B", a.nat_b)):
        d = json.load(open(path)); out[entry] = d[entry]
        prov = d.get("provenance", {}); out["provenance"][entry] = prov.get(entry, prov)
    out["rejected_forms"] = {}
    for spec in a.rejected:
        name, rest = spec.split("="); path, key = rest.rsplit(":", 1)
        try:
            d = json.load(open(path))[key]
            out["rejected_forms"][name] = {"rms": d["rms"], "form": d.get("form"), "family": d.get("family"), "theta": d["theta"], "names": d.get("names")}
        except Exception as e:  # noqa: BLE001
            out["rejected_forms"][name] = {"error": str(e)}
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    json.dump(out, open(a.out, "w"), indent=1)
    for k in ("Kf", "NaT", "Kf_B", "NaT_B"):
        print(k, out[k]["form"], "rms", round(out[k]["rms"], 4), "protocols", len(out[k]["family"]))
    print("rejected:", {k: (round(v["rms"], 4) if "rms" in v else v) for k, v in out["rejected_forms"].items()})


if __name__ == "__main__":
    main()
