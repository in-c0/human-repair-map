# proposals/

One file per proposal that reached the repository's review queue. Most arrive from the public
API (`POST /api/proposals`, also the MCP tool `propose_change`) through
`.github/workflows/bridge-proposals.yml`, which opens a draft pull request on branch
`proposal/<id>` for each one. A proposal made directly as a GitHub pull request should add a
file here too, with the same shape, so both doors leave the same trail.

Each file carries the proposal, the record it targets, who filed it and how, the event hash in
the public hash-chained log, and a `resolution` block that the steward fills in: accepted,
disputed, or declined, with the record edits made. The file is not the change; the record is.
Merging a proposal file with `resolution.state: "declined"` and a reason is how a decision is
kept on the record.

Nothing in this folder changes a grade by itself. Only a named human merges, and only after
opening the cited sources.
