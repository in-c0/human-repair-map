# Stage 1 — critique round, ChatGPT reply (2026-09-11, project thread)

Verdict: all four pushbacks hold. Direction locked: **Dependency Survey** (D3 base, D1 label
discipline, D2 shared L0–L5 ruler), with one substantive amendment: the body is a structural
navigation layer, not imagery.

## 1. The body
- Body Grid = the one canonical anatomical plate (31 targets by system × 5 questions) plus a
  restrained line-drawn anatomical index with leader lines.
- The body propagates as COORDINATES: every record opens with `BODY / SKIN / DERMIS / ECM
  ORGANISATION`; system-level nodes use `SYSTEM / DELIVERY / CELL-SPECIFIC TARGETING`; a
  third root `CROSS-BODY / …`. Coordinates appear above record titles, in breadcrumbs, in search.

## 2. Entrance, 1600×1000 rest state
- No sidebar, no topbar, no cards. One sheet. Margins 72 L/R, 52 top, 44 bottom. Hairline at y=112.
- Top-left y=56: `HUMAN REPAIR MAP` Work Sans 13/16 600 uppercase ls .08em; y=78 `graph v0.3 · snapshot …` Fragment Mono 10/14.
- Top-right, same baseline: label `HUMAN-REVIEWED` Fragment Mono 9.5 uppercase; count `0 / 326` STIX Two Text 23 in amber, no box; below it `Machine-checked sources do not count as human review.` Work Sans 11.5/16.
- y=154: `What would it take to repair a human body?` STIX Two Text 46/50 w500, width ~720.
- y≈220: `Choose a map. Both are views of the same evidence graph.` Work Sans 17/26; then one sentence ≤700px at 15/23: `Each map shows what has been demonstrated, what is still required, and which open questions currently block the most downstream progress.` Nothing else above the maps.
- Survey field from y=340: origin label `HUMAN / REPAIR` Work Sans 11 uppercase at x=112; a 1.25px stem runs right to x≈290 and splits to two traversals.
- Traversal 1, baseline y≈420, x=360: `Universal Repair` STIX 34/38; +44px: `Trauma · infection · cancer · organ failure · neurological damage` Work Sans 14/20; then `10 goals · N binding constraints · N open questions` Fragment Mono 10; at x≈1040 `HIGHEST-RANKED OPEN QUESTION` (9px mono) + the real question ≤2 lines (Work Sans 14/20), a leader back to the traversal.
- Traversal 2 same structure at y≈620: `Rejuvenation`; scope `Biological aging · regenerative capacity · youthful function`; counts; top question.
- Full graph at x≈360 y≈755 where the traversals share their origin: `VIEW THE FULL RESEARCH GRAPH` 12px Work Sans + `326 records · both projections · all dependencies` 10px mono; a thin line back to the trunk. An alternate survey path, not a third card.
- y≈932 full-width hairline; below it, left: the non-clinical sentence, Work Sans 11.5/16; right: `API · MCP · GRAPH.JSON · OPENAPI` Fragment Mono 10.
- Hover: path 1.25→1.75px accent, title ink→accent, that route's immediate dependency ticks appear, the other traversal drops to ~55% emphasis; 180–220ms. No background rectangle, no scale, no lift, no shadow.
- Focus: as hover plus a 2px underline offset 5px; the whole traversal is one focusable entry; Tab order Universal, Rejuvenation, Full graph; Enter selects.
- Selection: the title stays in place; its path extends into the map while the other withdraws; shared capabilities keep position (the signature "one graph, two projections" transition).
- Three-second test: `What would it take to repair a human body?` / `Choose a map.` / `Universal Repair / Rejuvenation` / `0 / 326 human-reviewed`.

## 3. Glyph vocabulary (at 1×)
- Line weights: construction/dependency 1px; selected path 1.5px; goal stem 1.5px; ruler baseline 1px; leader 1px; focus/active 2px max. Nothing in the data system exceeds 2px. Elbow radius 6px; orthogonal routing with rounded corners; never Bézier spaghetti.
- AND junction: the stem terminates in a 12px crossbar perpendicular to flow; required branches originate from the bar; micro-label `AND` Fragment Mono 8.5 uppercase.
- OR junction: an open 9px bracketed gate with `OR` (same 8.5 mono); alternatives emerge below. Different geometry and a different word from AND.
- Blocking-question discontinuity: `────┤ ? ├────`; gap 16px; endcaps 4px, 1px; `?` Fragment Mono 9 in the question/unreviewed accent, never warning red (the break is missing knowledge, not failure). On focus/open the gap grows to fit the question label and `Q-0017 · blocks 6 capabilities`; no floating card. This is the signature glyph.
- L0–L5 ruler: tick spacing fixed within a context; grade is always position; review is always the mark.
  - ai-proposed / unreviewed: ○ 8px, 1.5px amber stroke, transparent centre.
  - submitted: hollow circle + one 2px notch at 12 o'clock.
  - in review: half-filled circle.
  - reviewed: ● 8px solid, reviewed green.
  - disputed: hollow 8px + a diagonal slash extending 2px beyond the ring, disputed red; rung position unchanged.
  - superseded: muted grey × 8×8 at the original rung; optional thin continuation to the replacement.
  - ungraded: no circle; a 10px horizontal dash centred before L0. Never silently at zero.
- Review furniture on every record, below the coordinate and before title metadata: `—— AI-PROPOSED · HUMAN REVIEW: NONE`, Fragment Mono 10/14, uppercase, ls .055em, amber text, no fill, no radius, no icon, one 1px amber rule 18px long before the text. Reviewed: `—— HUMAN-REVIEWED · J. SMITH · 2026-10-04` in reviewed green.
- Leader lines: 1px; no arrows by default; terminate 4px short of text; minimum 12px horizontal run before a turn; labels on a 4px baseline grid; crossings avoided by layout, never bridged; if direction must be shown, a 5px terminal chevron at the far endpoint only.
- Density rule: the map is a progressive dependency drawing. Default shows goals → immediate required capability groups → binding constraints → top-ranked blocking questions. The 155 grid-derived `target--question` capabilities collapse into semantic bands (`BODY TARGET CAPABILITIES · 31 targets × 5 repair questions`), expandable by target or by question, never both unless explicitly asked. Limits: default projection 20–35 visible semantic nodes; one expanded goal <60; one expanded band <80; never auto-expand siblings; opening a branch collapses distant detail; search reveals the target plus ancestry and immediate dependencies. Full Graph starts from the same collapsed hierarchy. Dependency map for causality; matrix (Body Grid) for exhaustive coverage.

## 4. Buildability
- HTML text + CSS + small inline SVG only. No framework, canvas, D3, graph library, WebGL. HTML owns semantics, titles, record text, focusable items, disclosure state, grid, provenance text, ruler labels. CSS owns typography, layout, rules, state colour, print, light/dark, reduced motion, selected/focus. SVG only for junction gates, connectors, gaps, ruler marks where needed, the anatomical index, provenance traces — all `aria-hidden="true"`; dependency semantics live in HTML.
- Keyboard inside the map: ↑/↓ previous/next visible sibling; → expand, or first child; ← collapse, or parent; Enter opens the record; Home/End first/last in group. Hierarchy as a real nested list/tree; ARIA only where native semantics fall short.
- Print: force light; remove motion and affordances; black/grey rules with review symbols keeping shape semantics; only the selected branch expanded; show IDs, rungs, review state, source count, snapshot; never orphan a question from the capability it blocks; page-break goals cleanly; URLs only in a provenance appendix; snapshot hash in the running footer. Body Grid prints as a landscape plate; a record prints as a 1–3 page evidence sheet.
- Hard part: deterministic layout under variable content density (readable paths when a goal has many requirements; routing without crossings as branches expand; stable positions across the Universal↔Rejuvenation switch; keyboard order matching visual order; long scientific labels; 1200px down to tablet/mobile; lazy 530KB load without a "dashboard loading" feel). Solution: refuse arbitrary graph layout; use a column model — goal → requirement group → capability → blocker/question — each depth owns a column, rows from content height, expanded branches push following rows down, connectors are orthogonal paths between known anchors; on small screens the same tree becomes a vertical outline with simpler connectors and identical order.

## The four DESIGN.md principles
1. The body is navigation, not decoration.
2. Rung is position. Review is material state.
3. Unknowns occupy space.
4. The complete graph is addressable; only the relevant structure is visible.
