#!/usr/bin/env python
"""Print an interim accuracy/compute table from a run's cached row-level results (read-only;
safe to run while run.py is still evaluating OOD families)."""
import pickle, sys
from pathlib import Path
HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
import pandas as pd
from physics_to_life.evaluation import metrics as M
run_id = sys.argv[1] if len(sys.argv) > 1 else "v0_main"
rows = pickle.load(open(HERE / "experiments/v0_toy/results" / run_id / "cache/rows_test.pkl", "rb"))
df = M.rows_to_frame(rows)
tab = M.pareto_table(df, 0.01, n_boot=200)
pd.set_option("display.width", 200); pd.set_option("display.max_rows", 500)
cols = ["policy", "param", "n", "err_mean", "err_lo", "err_hi", "cost_mean", "n_fine_mean", "precision", "recall", "f1", "success_rate"]
print(tab[cols].to_string(index=False, float_format=lambda x: f"{x:.4g}"))
