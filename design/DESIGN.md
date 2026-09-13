# DESIGN.md — Human Repair Map · direction: Dependency Survey

Stage 2 output, 2026-09-11. Derived from the Stage 1 spec (design/reviews/stage1-critique-reply.md)
and the three Stage 2 concept renders:

- `design/concepts/01-entrance-16x10.png` — the entrance at 1600×1000, light, upper traversal in hover state
- `design/concepts/02-glyph-sheet.png` — evidence ruler with all seven review marks, junctions, linework, the blocking-question gap at rest and open, record furniture, Body Grid fragment
- `design/concepts/03-motion-storyboard.png` — 8 panels: the map switch (480 ms) and opening a blocking question (360 ms)

Every visual value in the build traces to a token here. Nothing from the July design system
(`content/app.css` v0.1 tokens) survives except where re-declared below.

## Four principles
1. **The body is navigation, not decoration.** The Body Grid is the one anatomical plate; everywhere else the body appears as a coordinate (`BODY / SKIN / DERMIS / ECM ORGANISATION`).
2. **Rung is position. Review is material state.** L0–L5 is always where a mark sits on one shared ruler; whether a human has reviewed it is always the mark's shape and fill. The two never collapse into one "confidence" visual.
3. **Unknowns occupy space.** A blocking question is drawn as a gap in the dependency it blocks. Missing knowledge has visual mass.
4. **The complete graph is addressable; only the relevant structure is visible.** Progressive disclosure by dependency, never a 326-node dump.

## Colour

| token | light | dark | use |
|---|---|---|---|
| `--paper` | `#F4F2EA` | `#111716` | page ground (dark = a plate on a dim light table, not a control room) |
| `--ink` | `#18201F` | `#E6E5DC` | primary text, primary lines |
| `--ink-2` | `#59615D` | `#9FA7A1` | secondary text, captions, de-emphasised nodes (≈55% emphasis is `--ink-2`, never opacity on `--ink`) |
| `--line` | `#CACCC4` | `#39413D` | construction lines, rules, ruler baselines, inactive dependency paths |
| `--blue` | `#36596B` | `#7FA6B8` | the selected / hovered / active dependency path and its title |
| `--moss` | `#526B58` | `#8AA18D` | secondary structural accent (e.g. OR-gate alternatives, experiment marks) |
| `--amber` | `#A06B20` | `#D1A25D` | unreviewed / ai-proposed marks, the `0 / 326` count, the `?` in a gap, review furniture text |
| `--red` | `#9C4339` | `#D27C70` | disputed marks and text only |
| `--green` | `#426451` | `#82AD8D` | reviewed (solid) marks and reviewed furniture only |
| `--grey-x` | `#9AA39E` | `#6B756F` | superseded × mark |

Rules: no gradients; no shadows; no fills except the marks and the hatch; no rounded containers
(radius exists only on line elbows). Amber is never used as a "warning" colour and never gets a
box. Dark mode is a re-tokening of the same drawing, not a different composition.

## Typography

Loaded from Google Fonts with `font-display: swap` and real fallback stacks; the final state is never a system font.

| role | face | sizes (px / line) | notes |
|---|---|---|---|
| Display & statements | **STIX Two Text** 400/500 | 46/50 (entrance question) · 34/38 (traversal titles) · 28/34 (record titles) · 23/28 (the reviewed count) · 17/26 (record statements) | Scientific authority; AND/OR and symbols feel native. Weight 500 for the entrance question only. |
| Labels, sentences, nav | **Work Sans** 400/500/600 | 17/26 (orientation line) · 15/23 (body) · 14/20 (scope lines, questions in leaders) · 13/16 600 uppercase ls .08em (site label) · 12/16 (full-graph entry) · 11.5/16 (authority line) · 11/14 uppercase (origin label) | Never the design by itself; carries meaning, not mood. |
| Metadata & machine identity | **Fragment Mono** 400 | 10/14 (snapshot line, counts, review furniture, coordinates) · 9.5 uppercase (`HUMAN-REVIEWED`) · 9 (ruler ticks, `?`, provenance trace labels, `HIGHEST-RANKED OPEN QUESTION`) · 8.5 uppercase (`AND`/`OR` micro-labels) | Reserved for ids, hashes, routes, ticks, and review furniture. It must not become the site's personality. |

Fallbacks: `'STIX Two Text', 'Source Serif 4', Georgia, serif` · `'Work Sans', 'Helvetica Neue', Arial, sans-serif` · `'Fragment Mono', 'IBM Plex Mono', ui-monospace, monospace`.
Letter-spacing: only on the two uppercase mono/sans labels noted. No tracking-tight anywhere.

## Spacing and page

- Entrance page margins: 72 px left/right, 52 top, 44 bottom at ≥1440 px; scale to 40/32/28 below 1024 px.
- Baseline grid 4 px. Labels align to it.
- Content columns: prose max 72ch; the dependency drawing owns the full width between margins.
- Hairlines (page rules): 1 px `--line`, full width.
- No sidebar. No topbar. Navigation is the trunk on the entrance and the coordinate line + a one-row plate index on inner pages.

## Linework (at 1×)

| element | weight | notes |
|---|---|---|
| construction / dependency line | 1 px `--line` | inactive paths |
| selected / active path | 1.5 px `--blue` | hover raises the entrance traversal stem from 1.25 to 1.75 px |
| goal stem | 1.5 px `--ink` | |
| ruler baseline | 1 px `--line` | ticks 1 px, 6 px tall |
| leader line | 1 px `--line` | stops 4 px short of text; ≥12 px horizontal run before a turn; no arrowheads; a 5 px terminal chevron only when direction must be shown, far end only |
| focus / active emphasis | 2 px max | |
| elbow radius | 6 px | orthogonal routing only; never Bézier |

Nothing in the data system exceeds 2 px. Crossings are avoided by layout, never bridged.

## Glyphs (see 02-glyph-sheet.png)

- **AND junction**: stem terminates in a 12 px crossbar perpendicular to flow; branches originate from the bar; micro-label `AND`.
- **OR junction**: an open 9 px bracketed gate; alternatives emerge below; micro-label `OR`. Different geometry and a different word from AND.
- **Blocking-question gap (the signature glyph)**: the dependency line breaks with a 16 px gap and 4 px × 1 px endcaps; a `?` in `--amber` Fragment Mono 9 at the centre. Open state: the gap grows to fit the question text (≤2 lines) and a mono line `Q-0017 · blocks 6 capabilities`; downstream nodes drop to `--ink-2`. Never a floating card.
- **Evidence ruler L0–L5**: fixed tick spacing within a context (entrance/map rows: 14 px per rung; record header: 40 px; grid cells: 8 px). Grade is always position.
- **Review marks** (8 px, on the ruler at the rung):
  - ai-proposed / unreviewed — hollow circle, 1.5 px `--amber` stroke, transparent centre
  - submitted — hollow + 2 px notch at 12 o'clock
  - in review — half-filled circle
  - reviewed — solid `--green`
  - disputed — hollow + a diagonal `--red` slash extending 2 px beyond the ring; rung unchanged
  - superseded — `--grey-x` × 8×8 at the original rung; optional thin continuation to the replacement
  - ungraded — no circle; a 10 px dash before L0. Never silently at zero.
- **Blocked by framework** (grid cells): a 45° hatch of 1 px `--line` at 4 px pitch behind the ruler. Blocked by science is the default and unmarked.

## Record furniture

Order, top to bottom, on every record page:
1. Coordinate line, Fragment Mono 10: `BODY / SKIN / DERMIS / ECM ORGANISATION` (roots: `BODY`, `SYSTEM`, `CROSS-BODY`).
2. Review furniture: an 18 px × 1 px rule then the text, Fragment Mono 10/14 uppercase ls .055em, no fill/radius/icon. `—— AI-PROPOSED · HUMAN REVIEW: NONE` in `--amber`; `—— HUMAN-REVIEWED · J. SMITH · 2026-10-04` in `--green`; disputed variants in `--red`.
3. Title, STIX Two Text 28/34.
4. Evidence ruler at 40 px/rung with the record's mark, and beneath it `measured` and `blocked by` as mono labels.
5. Prose (Work Sans 15/23), with a **vertical provenance trace** in the right margin: `grade │ claim │ experiment │ source │ snapshot hash` — five 9 px mono labels on a 1 px vertical line with 3 px nodes. Not an infobox.
6. A slim dependency trace in the left margin (parent goal → this record → what it blocks), so the record never becomes a disconnected article.

Never again: the amber pill, the sticky white infobox, the article-plus-sidebar.

## Layout signatures

**Entrance (01-entrance-16x10.png)** — exact composition in design/reviews/stage1-critique-reply.md §2. Summary: site label + snapshot top-left; `HUMAN-REVIEWED 0 / 326` top-right in amber with the sentence *Machine-checked sources do not count as human review*; hairline at 112; the 46 px question; *Choose a map. Both are views of the same evidence graph.*; one 15 px orientation sentence; then the survey field: origin `HUMAN / REPAIR`, a 1.25 px stem, two traversals (title 34 px, scope line, mono counts), each with a leader to its real highest-ranked open question; `VIEW THE FULL RESEARCH GRAPH` on a line back to the trunk; bottom hairline with the non-clinical sentence left and `API · MCP · GRAPH.JSON · OPENAPI` right. Hover/focus/selection behaviour as specified there.

**Map view** — a progressive dependency drawing in a deterministic column model: goal → requirement group (AND/OR junction) → capability (text node + short ruler) → blocker (gap). Each depth owns a column; rows come from content height; expanded branches push following rows down; connectors are orthogonal paths between known anchors. Ranked open questions appear as gaps in the drawing and as a numbered margin list. The 155 grid-derived capabilities collapse into one band per goal (`BODY TARGET CAPABILITIES · 31 targets × 5 repair questions`), expandable by target or by question, never both. Visible-node limits: default 20–35; one expanded goal <60; one expanded band <80; never auto-expand siblings.

**Record page** — as "Record furniture" above.

**Body Grid** — the anatomical plate: rows grouped by system with a small line-drawn anatomical index at the left using leader lines to the system groups; five stable columns (Sense · Model · Reach · Edit · Verify); every cell a tiny ruler glyph (rung = position, review = mark, framework = hatch). Selecting a cell opens its dependency trace in place, not a modal. Prints landscape.

**Small screens** (<900 px) — the same tree becomes a vertical dependency outline; connectors simplify to left-rail lines; order is identical; the entrance stacks the two traversals with the trunk on the left.

## Motion (see 03-motion-storyboard.png)

Movement follows dependency, never decoration. No fade-in-on-scroll, no lifts, no scale, no shadows, no spinners.

| moment | easing | duration | choreography |
|---|---|---|---|
| hover / focus on a traversal or node | `cubic-bezier(.22,.68,.26,1)` | 180–220 ms | path weight 1.25→1.75, title `--ink`→`--blue`, sibling to `--ink-2` |
| **map switch** Universal ↔ Rejuvenation (signature 1) | `cubic-bezier(.20,.76,.24,1)` | 480 ms | 0–120: projection-specific labels withdraw to `--ink-2` then out; 120–300: shared nodes **do not move**; 300–480: incoming labels enter along their connectors; underline moves last |
| **open a blocking question** (signature 2) | `cubic-bezier(.22,.68,.26,1)` | 360 ms | 0–80: gap widens, `?` fades; 80–220: question text appears inside the gap, downstream drops to `--ink-2`; 220–360: three annotation lines (what is unknown / what it blocks / what would close it) settle with leaders. Close reverses in 240 ms |
| expand / collapse a branch | `cubic-bezier(.22,.68,.26,1)` | 220–360 ms (480 for a whole goal) | following rows push down; connectors draw from anchor to anchor |
| provenance trace on a record | `cubic-bezier(.16,1,.30,1)` | 320 ms | the vertical trace draws top-to-bottom; nothing else animates |
| loading the graph | — | — | the drawing appears with its structure first (goal stems and junctions) and labels second; no spinner, no skeleton boxes |

`prefers-reduced-motion`: every sequence becomes an instant state change; shared items retain position; the gap opens without widening animation.

## Do / don't

**Do** let blank paper carry hierarchy · put every number next to the evidence it summarises · spell out UNREVIEWED · use the coordinate line as the breadcrumb · keep the machine face (`API · MCP · GRAPH.JSON · OPENAPI`) on the first screen · make the printed page work.

**Don't** draw a force-directed graph, circles, or physics · use cards, tiles, KPI rows, progress bars, pills, badges, icons, emoji · add paper texture, engravings, or a body silhouette · put a box around a caveat · use `--amber` to mean danger · exceed 2 px on any data line · vary terminology (rung · measured · blocked by · review state, and nothing else).

## Accessibility

Contrast: `--ink` on `--paper` 14.6:1 light / 13.9:1 dark; `--ink-2` 6.1:1 / 6.9:1; `--amber` text 4.6:1 light (10 px mono uppercase is used only with the rule and never alone for meaning; the word UNREVIEWED carries it); `--blue` 7.4:1. Focus: 2 px underline offset 5 px on titles, 2 px outline on marks. Keyboard in the map: ↑/↓ siblings, → expand/first child, ← collapse/parent, Enter open, Home/End. Tree semantics live in HTML (nested lists, `aria-expanded`); all SVG is `aria-hidden`.
