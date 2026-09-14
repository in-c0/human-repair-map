#!/usr/bin/env python
"""Build papers/paper0-perspective/source_map.md from the literature scan files.

Each literature entry is a '### key — Authors (Year). Title. Venue. DOI/URL' block followed by
bullet fields. The source map lists every entry with its cluster, novelty-threat call and
verification status so that unverified citations are visible at a glance.
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIT = ROOT / "docs" / "literature"
OUT = ROOT / "papers" / "paper0-perspective" / "source_map.md"

entry_re = re.compile(r"^### (.+)$")
field_re = re.compile(r"^- \*\*(.+?):\*\*\s*(.*)$")


def parse(path: Path):
    entries, cur = [], None
    for line in path.read_text().splitlines():
        m = entry_re.match(line)
        if m:
            cur = {"head": m.group(1).strip(), "fields": {}}
            entries.append(cur)
            continue
        if cur is None:
            continue
        f = field_re.match(line)
        if f:
            cur["fields"][f.group(1).strip().lower()] = f.group(2).strip()
    return entries


def main():
    rows = []
    for path in sorted(LIT.glob("*.md")):
        if path.name == "README.md":
            continue
        for e in parse(path):
            rows.append((path.stem, e["head"], e["fields"].get("novelty threat", ""), e["fields"].get("verified", "")))
    n_ver = sum(1 for r in rows if r[3].lower().startswith("yes"))
    lines = ["# Paper 0 source map", "",
             f"Auto-generated from `docs/literature/*.md` by `scripts/build_source_map.py`. {len(rows)} entries; "
             f"{n_ver} page-verified, {len(rows) - n_ver} citation-only or search-confirmed (see each file's scope note "
             "on the network restrictions that prevented opening publisher pages).", "",
             "| cluster | entry | novelty threat | verified |", "|---|---|---|---|"]
    for cl, head, nov, ver in rows:
        nov_s = nov.split("—")[0].split(" - ")[0].strip()[:40]
        ver_s = ver.split("(")[0].strip()[:40]
        lines.append(f"| {cl} | {head.replace('|', '/')} | {nov_s} | {ver_s} |")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"wrote {OUT} with {len(rows)} entries ({n_ver} verified)")


if __name__ == "__main__":
    main()
