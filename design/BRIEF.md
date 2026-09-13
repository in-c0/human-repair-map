# Design brief — Human Repair Map (Stage 0, 2026-09-11)

## What it is
A public, machine-readable map of the capabilities needed to repair a human body: goals
→ the capabilities they require → each graded L0–L5 on demonstrated evidence → the open
questions blocking the next rung → the claims and sources behind every grade. One evidence
graph, two public projections: **Universal Repair** (trauma, infection, cancer, organ
failure) and **Rejuvenation** (aging). 326 records, 0 human-reviewed; every record carries
its review state on its face. The website is one reader of the graph; models and agents read
the same data over MCP and REST.

Live: https://humanrepairmap.com (hash-routed single page; `index.html` + `content/` +
`/graph/graph.json`). No framework, no build step.

## Who uses it, in what situation
1. A domain researcher (wound healing, regenerative medicine, aging biology) at a desk on a
   large screen, sceptical, five minutes to decide whether this is more useful than their own
   literature search. They open one capability or one open question and judge it.
2. An intelligent lay reader (the owner, her family, a journalist, a funder) who wants to see
   *where we actually are* on repairing the body, without hype and without a PDF.
3. A model or agent — no visual needs, but the site should make its machine face visible
   and unembarrassing to link.

Desktop first. Mobile must not break but is secondary. Attention: deliberate, not scroll-by.

## The one feeling
**Quiet authority.** A field instrument for people who keep score on the frontier. Calm,
precise, trustworthy; it does not persuade and it does not perform. It should feel made by
someone who has read the papers, not by a template.

## What the owner wants it to draw from (her words: "anatomical atlas + data visualization +
analytics + git tree + something")
- **Anatomical atlas** — the body as the subject. Plates, labels, leader lines, the
  seriousness and beauty of Netter / Gray's / Vesalius. The map is literally about the body.
- **Data visualization** — the evidence ladder (L0–L5), rungs, counts, what-moved-when. Marks
  that carry meaning, in the tradition of Tufte / Our World in Data, not dashboard widgets.
- **Analytics** — the frontier as something measured over time: what changed, what is
  blocked, which question unblocks the most.
- **Git tree / dependency tree** — goals decomposing into capabilities with AND/OR
  requirement groups; commits, branches, a history that is never overwritten. The graph is
  versioned by content hash; corrections are logged, not patched.
- **"+ something"** — the direction should find the fifth element itself: the signature only
  this product could have.

## What it must NOT look like (owner's hates)
- Biotech startup landing page (gradient hero, three feature cards, "seamlessly accelerate").
- Admin dashboard (sidebar + topbar + tables — this is what it looks like now, and she
  called it robotic).
- Dark-mode sci-fi HUD (neon lines on black, glowing nodes).
- Academic journal / Wikipedia (dense serif, no hierarchy, looks like a PDF).

## What exists now (captures in design/current/)
- `2026-09-11-start-live.png` — the entrance: sidebar nav, two map cards, stat tiles.
- `2026-09-11-map-universal-repair.png` — a map view: goal cards, ranked question rows.
- `2026-09-11-node-capability.png` — a record page: article + infobox.
Current tokens: Newsreader (display), Inter (body), IBM Plex Mono; off-white paper
`#FCFBF9`, ink `#15171B`, one teal accent `#0F4C5C`; 6 px radii; no motion at all. Verdict
from the owner: "the whole website still looks robotic." Treat the current look as a
baseline to leave, not to refine.

## Hard constraints
- Plain HTML/CSS/JS, no framework, no build step; must keep working from `index.html` +
  `content/` + `/graph/`. Fonts via Google Fonts or self-hosted.
- The data is the product: every grade, rung, review state, source and provenance field
  must stay visible and legible. Nothing may look more proven than it is. `ai-proposed`
  must read as unreviewed at a glance.
- The two-map choice (Universal Repair / Rejuvenation / full graph) stays the first
  decision on the page.
- Must render 326 records, ~20 ranked questions, goal trees with AND/OR groups, and a
  31×5 body grid without becoming a dashboard.
- Accessibility: keyboard path, contrast against the actual palette, `prefers-reduced-motion`.
- Performance: graph JSON is 530 KB, loaded lazily; no heavy 3D by default.
- Light and dark must both be designed (the page honours the viewer's scheme).
- Non-clinical caveat and "0 of 326 human-reviewed" must remain prominent; they are part
  of the authority, not a footer.

## References the concept designer should know
The ChatGPT thread "Map Cure Machine Progress" holds the product thinking (one canonical
graph, many projections; claims not papers; negative results first-class; prediction
registry; the graph as decision infrastructure). The design should look like that thinking.
