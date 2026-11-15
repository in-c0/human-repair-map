"""Audit pseudonymized participant overlap between BIDS participants.tsv files.

Prints ONLY aggregate counts, never individual IDs or patient records.
Uses Python standard library and does not infer clinical truth from metadata.
Usage: python participant_overlap_audit.py dataset_a/participants.tsv dataset_b/participants.tsv ...
"""
import argparse
import csv
import json
from collections import Counter
from itertools import combinations
from pathlib import Path

REQUIRED = {'participant_id', 'URSI', 'Original_ID', 'Group'}


def audit(paths):
    sets = []
    for path in paths:
        with Path(path).open(newline='', encoding='utf-8-sig') as handle:
            reader = csv.DictReader(handle, delimiter='\t')
            if not REQUIRED.issubset(reader.fieldnames or []):
                raise ValueError(f'{path}: missing required fields')
            rows = list(reader)
        if any(not r['URSI'] or not r['Original_ID'] for r in rows):
            raise ValueError(f'{path}: missing identifier value')
        by_ursi = {r['URSI']: r for r in rows}
        sets.append((str(path), rows, by_ursi))
    out = {'datasets': [], 'pairwise': [], 'total_unique_URSI': len(set().union(*(set(x[2]) for x in sets)))}
    for name, rows, by_ursi in sets:
        out['datasets'].append({
            'name': Path(name).parent.name,
            'rows': len(rows),
            'unique_URSI': len(by_ursi),
            'unique_Original_ID': len({r['Original_ID'] for r in rows}),
            'group_counts': dict(sorted(Counter(r['Group'] for r in rows).items())),
        })
    for (name_a, _, a), (name_b, _, b) in combinations(sets, 2):
        overlap = set(a) & set(b)
        out['pairwise'].append({
            'datasets': [Path(name_a).parent.name, Path(name_b).parent.name],
            'URSI_overlap': len(overlap),
            'group_mismatch': sum(a[k]['Group'] != b[k]['Group'] for k in overlap),
            'different_local_participant_id': sum(a[k]['participant_id'] != b[k]['participant_id'] for k in overlap),
        })
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('participants_tsv', nargs='+', type=Path)
    args = parser.parse_args()
    if len(args.participants_tsv) < 2:
        parser.error('Provide at least two participants.tsv files')
    print(json.dumps(audit(args.participants_tsv), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
