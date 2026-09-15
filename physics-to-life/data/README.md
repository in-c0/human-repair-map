# data/

No external data is used by V0: every system, intervention and ground truth is generated
procedurally from a seed (see `experiments/v0_toy/config.yaml`).  Generated episode caches
are written to `experiments/*/results/cache/` and are git-ignored; they are fully
reproducible from the committed configuration, seed and git commit recorded in each run's
`provenance.json`.

Later rungs of the validation ladder (V2 ion channels, V5 Drosophila) will pull external
data.  Every external dataset must be recorded here with: source URL, version/date of
access, licence, checksum, and the exact preprocessing script.  Nothing enters the model
without provenance.
