"""Synthetic metadata tests: no real participant identifiers committed."""
import tempfile
import unittest
from pathlib import Path
from participant_overlap_audit import audit


class OverlapAuditTests(unittest.TestCase):
    def test_pairwise_overlap_and_id_renumbering(self):
        with tempfile.TemporaryDirectory() as d:
            a, b = Path(d) / 'a', Path(d) / 'b'
            a.mkdir()
            b.mkdir()
            head = 'participant_id\tOriginal_ID\tURSI\tGroup\n'
            (a / 'participants.tsv').write_text(head + 'sub-1\tA\tX\t0\nsub-2\tB\tY\t1\n')
            (b / 'participants.tsv').write_text(head + 'sub-9\tA\tX\t0\nsub-10\tC\tZ\t1\n')
            r = audit([a / 'participants.tsv', b / 'participants.tsv'])
            self.assertEqual(r['total_unique_URSI'], 3)
            self.assertEqual(r['pairwise'][0]['URSI_overlap'], 1)
            self.assertEqual(r['pairwise'][0]['different_local_participant_id'], 1)
            self.assertEqual(r['pairwise'][0]['group_mismatch'], 0)


if __name__ == '__main__':
    unittest.main()
