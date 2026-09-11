/* Structural analysis of the Human Repair Graph.

   Everything here is computed from the graph's structure — which node requires
   which, what blocks what, what rung each capability sits at. Nothing here is a
   probability, a cost estimate or a forecast: those would be invented numbers,
   and the map refuses to print invented numbers. What it CAN say honestly:

   - for a goal: the capabilities it transitively requires, and which of them
     are the binding constraints (lowest rung inside an AND group, no OR escape);
   - for a question: how many capabilities and goals sit downstream of what it
     blocks — the structural leverage of answering it;
   - the ranked list of open questions by that leverage, so "what should be
     asked next" is an inspectable computation rather than an opinion.

   The same functions run inside the MCP/API worker, so a client sees exactly
   what the bundle was built with. Keep this file dependency-free and pure. */

const RUNG_N = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4, L5: 5 };

export function rungOf(n) {
  return n && n.grade && n.grade.rung !== undefined ? RUNG_N[n.grade.rung] : null;
}

/* Everything id transitively requires, with the path length. */
export function requiredClosure(nodes, id) {
  const seen = new Map();
  const walk = (cur, depth) => {
    const n = nodes.get(cur);
    if (!n) return;
    for (const g of n.requires || []) {
      for (const d of g.all || g.any || []) {
        if (!seen.has(d) || seen.get(d) > depth + 1) { seen.set(d, depth + 1); walk(d, depth + 1); }
      }
    }
  };
  walk(id, 0);
  return seen; // Map<id, depth>
}

/* Everything that transitively depends on id (via requires), i.e. what it enables. */
export function enabledClosure(nodes, id, enablesIndex) {
  const seen = new Set();
  const walk = (cur) => {
    for (const up of enablesIndex.get(cur) || []) if (!seen.has(up)) { seen.add(up); walk(up); }
  };
  walk(id);
  return seen;
}

export function buildEnablesIndex(nodes) {
  const idx = new Map();
  for (const n of nodes.values()) {
    for (const g of n.requires || []) for (const d of g.all || g.any || []) {
      if (!idx.has(d)) idx.set(d, []);
      idx.get(d).push(n.id);
    }
  }
  return idx;
}

/* The binding constraints of a goal: required capabilities that sit in an AND
   group (no alternative), ordered by rung ascending. An OR group's members are
   reported separately with the group's best rung, because clearing ONE of them
   suffices. Ungraded capabilities are listed as unknown, never as zero. */
export function criticalPath(nodes, goalId) {
  const closure = requiredClosure(nodes, goalId);
  const and = [], or = [], unknown = [];
  const seenOr = new Set();
  const visit = (id) => {
    const n = nodes.get(id);
    if (!n) return;
    for (const g of n.requires || []) {
      if (g.all) {
        for (const d of g.all) {
          const dn = nodes.get(d);
          if (!dn) continue;
          if (dn.type === "capability") {
            const r = rungOf(dn);
            (r === null ? unknown : and).push({ id: d, name: dn.name, rung: dn.grade.rung || null, blocked: dn.grade.blocked || null, basis: dn.grade.basis, via: id });
          }
          visit(d);
        }
      } else if (g.any) {
        const key = g.any.join("|");
        if (!seenOr.has(key)) {
          seenOr.add(key);
          const members = g.any.map((d) => nodes.get(d)).filter(Boolean);
          const best = members.reduce((m, dn) => { const r = rungOf(dn); return r !== null && (m === null || r > m) ? r : m; }, null);
          or.push({ via: id, note: g.note, bestRung: best === null ? null : "L" + best, members: members.map((dn) => ({ id: dn.id, name: dn.name, rung: dn.grade && dn.grade.rung || null, basis: dn.grade && dn.grade.basis })) });
        }
        for (const d of g.any) visit(d);
      }
    }
  };
  visit(goalId);
  const dedupe = (arr) => { const m = new Map(); for (const x of arr) if (!m.has(x.id)) m.set(x.id, x); return [...m.values()]; };
  const andSorted = dedupe(and).sort((a, b) => (RUNG_N[a.rung] ?? 99) - (RUNG_N[b.rung] ?? 99));
  const lowest = andSorted.length ? andSorted[0].rung : null;
  return {
    goal: goalId,
    requiredCapabilities: closure.size,
    bindingConstraints: andSorted.filter((x) => x.rung === lowest),
    andRequirements: andSorted,
    orGroups: or,
    ungraded: dedupe(unknown),
    reading: "bindingConstraints are the AND-required capabilities at the lowest rung: the goal cannot be closer than they are. orGroups list alternatives where clearing one member suffices. Nothing here is a probability."
  };
}

/* Leverage of a question: the set of goals and capabilities downstream of what it blocks. */
export function questionLeverage(nodes, q, enablesIndex) {
  const direct = new Set(q.blocks || []);
  const downstream = new Set();
  for (const id of direct) { downstream.add(id); for (const x of enabledClosure(nodes, id, enablesIndex)) downstream.add(x); }
  let goals = 0, capabilities = 0;
  const lowestBlocked = [];
  for (const id of downstream) {
    const n = nodes.get(id);
    if (!n) continue;
    if (n.type === "goal") goals++;
    if (n.type === "capability") { capabilities++; }
  }
  for (const id of direct) {
    const n = nodes.get(id);
    if (n && n.type === "capability") lowestBlocked.push({ id, rung: (n.grade && n.grade.rung) || null });
  }
  return {
    id: q.id,
    question: q.question,
    state: q.state,
    blocksDirectly: [...direct],
    downstreamGoals: goals,
    downstreamCapabilities: capabilities,
    downstreamTotal: downstream.size,
    directlyBlockedRungs: lowestBlocked,
    testedBy: (q.derivedRelations && q.derivedRelations.testedBy) || [],
    projections: q.projections || []
  };
}

/* Ranked open questions. Ties broken by how low the directly blocked capabilities sit
   (a question gating an L0 capability outranks one gating an L4), then by id. */
export function rankQuestions(nodes) {
  const enablesIndex = buildEnablesIndex(nodes);
  const rows = [];
  for (const n of nodes.values()) if (n.type === "question" && n.state === "open") rows.push(questionLeverage(nodes, n, enablesIndex));
  const minRung = (r) => Math.min(...r.directlyBlockedRungs.map((x) => (x.rung ? RUNG_N[x.rung] : 99)), 99);
  rows.sort((a, b) => b.downstreamTotal - a.downstreamTotal || minRung(a) - minRung(b) || (a.id < b.id ? -1 : 1));
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}

/* Column and projection summaries of the capability grades. */
export function gradeSummary(nodes) {
  const byClass = {};
  const byBasis = {};
  const byBlocked = {};
  for (const n of nodes.values()) {
    if (n.type !== "capability") continue;
    const cls = n.class;
    if (!byClass[cls]) byClass[cls] = { n: 0, graded: 0, sumRung: 0, rungs: {} };
    byClass[cls].n++;
    const r = rungOf(n);
    if (r !== null) { byClass[cls].graded++; byClass[cls].sumRung += r; byClass[cls].rungs[n.grade.rung] = (byClass[cls].rungs[n.grade.rung] || 0) + 1; }
    byBasis[n.grade.basis] = (byBasis[n.grade.basis] || 0) + 1;
    if (n.grade.blocked) byBlocked[n.grade.blocked] = (byBlocked[n.grade.blocked] || 0) + 1;
  }
  for (const k of Object.keys(byClass)) byClass[k].meanRung = byClass[k].graded ? +(byClass[k].sumRung / byClass[k].graded).toFixed(2) : null;
  return { byClass, byBasis, byBlocked };
}

export function analyse(nodes) {
  const goals = [...nodes.values()].filter((n) => n.type === "goal").map((g) => criticalPath(nodes, g.id));
  const contradictions = [...nodes.values()]
    .filter((n) => n.type === "claim" && (n.contradicts || []).length)
    .map((n) => ({ claim: n.id, contradicts: n.contradicts, statement: n.statement }));
  return {
    method: "structural only — see scripts/lib/graph-analysis.mjs; no probabilities, costs or forecasts are computed",
    rankedQuestions: rankQuestions(nodes),
    criticalPaths: goals,
    contradictions,
    grades: gradeSummary(nodes)
  };
}
