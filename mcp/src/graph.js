/* Graph access shared by the MCP tools and the REST API.
   Everything here reads the generated bundle (mcp/src/generated.js) and the
   same analysis module the build used, so a client sees exactly what was
   built — never a second, drifting computation. Pure functions; no I/O. */

import { GRAPH } from "./generated.js";
import { criticalPath, rankQuestions, requiredClosure, buildEnablesIndex, enabledClosure } from "../../scripts/lib/graph-analysis.mjs";

export const NODES = new Map(GRAPH.nodes.map((n) => [n.id, n]));
export const MANIFEST = GRAPH.manifest;
export const ONTOLOGY = GRAPH.ontology;
export const ANALYSIS = GRAPH.analysis;
const ENABLES = buildEnablesIndex(NODES);

export const TYPES = ["goal", "capability", "question", "claim", "experiment", "source", "cell", "route"];
export const PLURAL = { goal: "goals", capability: "capabilities", question: "questions", claim: "claims", experiment: "experiments", source: "sources", cell: "cells", route: "routes" };

export function normaliseId(raw, typeHint) {
  if (!raw) return null;
  let s = String(raw).trim();
  if (s.startsWith("https://humanrepairmap.com/graph/")) s = "hrm:" + s.slice("https://humanrepairmap.com/graph/".length);
  if (s.startsWith("hrm:")) return s;
  if (typeHint) return `hrm:${typeHint}/${s}`;
  for (const t of TYPES) if (NODES.has(`hrm:${t}/${s}`)) return `hrm:${t}/${s}`;
  return s;
}

export function getNode(raw, typeHint) {
  const id = normaliseId(raw, typeHint);
  return id ? NODES.get(id) || null : null;
}

/* The caveat every payload carries. It is part of the product. */
export function caveatFor(nodes) {
  const list = Array.isArray(nodes) ? nodes : [nodes];
  const states = {};
  for (const n of list) if (n && n.review) states[n.review.state] = (states[n.review.state] || 0) + 1;
  const reviewed = states.reviewed || 0;
  return {
    reviewStates: states,
    humanReviewed: `${reviewed}/${list.length}`,
    text:
      (reviewed === list.length && list.length
        ? "Every record in this result was reviewed by a named human."
        : "Records marked ai-proposed have NOT had their sources opened by a human. Do not present them as validated.") +
      " This maps research state, not clinical care: no diagnosis, treatment selection, prognosis or patient-specific guidance. " +
      `Graph v${MANIFEST.version} snapshot ${MANIFEST.snapshot} · ${MANIFEST.contentHash.slice(0, 12)} · https://humanrepairmap.com`
  };
}

export function listNodes(filter = {}) {
  const lim = Math.min(Math.max(parseInt(filter.limit || 50, 10) || 50, 1), 500);
  const q = filter.q ? String(filter.q).toLowerCase() : null;
  const out = [];
  for (const n of NODES.values()) {
    if (filter.type && n.type !== filter.type) continue;
    if (filter.projection && !(n.projections || []).includes(filter.projection)) continue;
    if (filter.class && n.class !== filter.class) continue;
    if (filter.rung && !((n.grade && n.grade.rung === filter.rung) || n.rung === filter.rung)) continue;
    if (filter.basis && !(n.grade && n.grade.basis === filter.basis)) continue;
    if (filter.blocked && !(n.grade && n.grade.blocked === filter.blocked)) continue;
    if (filter.state && !((n.state === filter.state) || (n.status === filter.state))) continue;
    if (filter.review && !(n.review && n.review.state === filter.review)) continue;
    if (filter.derived === "false" && n.derived) continue;
    if (filter.derived === "true" && !n.derived) continue;
    if (q) {
      const hay = JSON.stringify(n).toLowerCase();
      if (!hay.includes(q)) continue;
    }
    out.push(summarise(n));
    if (out.length >= lim) break;
  }
  return out;
}

export function summarise(n) {
  const s = { id: n.id, type: n.type, name: n.name || n.statement || n.question || n.citation, review: n.review && n.review.state };
  if (n.grade) s.grade = { basis: n.grade.basis, rung: n.grade.rung, blocked: n.grade.blocked };
  if (n.rung && !n.grade) s.rung = n.rung;
  if (n.class) s.class = n.class;
  if (n.state) s.state = n.state;
  if (n.status && n.type === "experiment") s.status = n.status;
  if (n.projections) s.projections = n.projections;
  return s;
}

export function dependencies(id) {
  const n = NODES.get(id);
  if (!n) return null;
  const d = n.derivedRelations || {};
  return {
    id,
    requires: (n.requires || []).map((g) => ({ ...(g.all ? { all: g.all } : { any: g.any }), ...(g.note ? { note: g.note } : {}) })),
    requiredTransitively: [...requiredClosure(NODES, id).entries()].map(([k, depth]) => ({ id: k, depth })),
    enables: d.enables || [],
    enablesTransitively: [...enabledClosure(NODES, id, ENABLES)],
    blockedBy: n.blockedBy || d.blockedBy || [],
    blocks: n.blocks || d.blocks || [],
    supportedBy: d.supportedBy || [],
    contradictedBy: d.contradictedBy || [],
    testedBy: d.testedBy || []
  };
}

export function evidenceFor(id) {
  const n = NODES.get(id);
  if (!n) return null;
  const d = n.derivedRelations || {};
  const claimIds = n.type === "claim" ? [n.id] : [...(d.supportedBy || []), ...(d.contradictedBy || [])];
  const claims = claimIds.map((cid) => NODES.get(cid)).filter(Boolean).map((c) => ({
    id: c.id,
    type: c.type,
    statement: c.statement || c.name,
    relation: (c.supports || []).includes(id) ? "supports" : (c.contradicts || []).includes(id) ? "contradicts" : c.type === "claim" ? "self" : "supports",
    rung: c.rung,
    grounding: c.grounding,
    measured: c.measurement && c.measurement.measured,
    context: c.context,
    replication: c.replication,
    drift: c.drift,
    review: c.review && c.review.state,
    evidence: (c.evidence || []).map((e) => {
      const s = NODES.get(e.source) || {};
      return {
        source: e.source, citation: s.citation, doi: s.doi, pmid: s.pmid, url: s.url, kind: s.kind,
        design: e.design, locator: e.locator, n: e.n, quote: e.quote, note: e.note,
        machineResolved: !!(s.resolution && s.resolution.resolved),
        resolvedVia: s.resolution && s.resolution.via,
        humanOpened: s.humanOpened || null
      };
    }),
    citations: c.citations
  }));
  return { id, name: n.name || n.statement, claims, caveat: caveatFor(claims.map((c) => NODES.get(c.id))) };
}

export function subgraph(rootId, depth = 2, relations) {
  const root = NODES.get(rootId);
  if (!root) return null;
  const REL = relations && relations.length ? relations : ["requires", "enables", "blockedBy", "blocks", "supportedBy", "contradictedBy", "testedBy", "parent", "children", "target"];
  const seen = new Map([[rootId, 0]]);
  const edges = [];
  const queue = [[rootId, 0]];
  const neighbours = (n) => {
    const out = [];
    const d = n.derivedRelations || {};
    if (REL.includes("requires")) for (const g of n.requires || []) for (const x of g.all || g.any || []) out.push(["requires", x, g.all ? "all" : "any"]);
    if (REL.includes("enables")) for (const x of d.enables || []) out.push(["enables", x]);
    if (REL.includes("blockedBy")) for (const x of n.blockedBy || d.blockedBy || []) out.push(["blockedBy", x]);
    if (REL.includes("blocks")) for (const x of n.blocks || d.blocks || []) out.push(["blocks", x]);
    if (REL.includes("supportedBy")) for (const x of d.supportedBy || []) out.push(["supportedBy", x]);
    if (REL.includes("contradictedBy")) for (const x of d.contradictedBy || []) out.push(["contradictedBy", x]);
    if (REL.includes("testedBy")) for (const x of d.testedBy || []) out.push(["testedBy", x]);
    if (REL.includes("parent") && n.parent) out.push(["parent", n.parent]);
    if (REL.includes("children")) for (const x of d.children || []) out.push(["children", x]);
    if (REL.includes("target") && n.target && n.target.node) out.push(["target", n.target.node]);
    return out;
  };
  while (queue.length) {
    const [id, dep] = queue.shift();
    if (dep >= depth) continue;
    const n = NODES.get(id);
    if (!n) continue;
    for (const [rel, to, group] of neighbours(n)) {
      if (!NODES.has(to)) continue;
      edges.push({ from: id, rel, to, ...(group ? { group } : {}) });
      if (!seen.has(to)) { seen.set(to, dep + 1); queue.push([to, dep + 1]); }
    }
  }
  const nodes = [...seen.keys()].map((id) => ({ ...summarise(NODES.get(id)), depth: seen.get(id) }));
  return { root: rootId, depth, relations: REL, nodes, edges, caveat: caveatFor(nodes.map((x) => NODES.get(x.id))) };
}

export function tracePath(goalId) {
  const g = NODES.get(goalId);
  if (!g || g.type !== "goal") return null;
  const cp = criticalPath(NODES, goalId);
  const openQuestions = [];
  for (const id of [goalId, ...cp.andRequirements.map((x) => x.id), ...cp.orGroups.flatMap((o) => o.members.map((m) => m.id)), ...cp.ungraded.map((x) => x.id)]) {
    const n = NODES.get(id);
    for (const q of (n && (n.blockedBy || (n.derivedRelations || {}).blockedBy)) || []) if (!openQuestions.includes(q)) openQuestions.push(q);
  }
  return { ...cp, name: g.name, openQuestions: openQuestions.map((q) => summarise(NODES.get(q))), caveat: caveatFor([g]) };
}

export function rankedQuestions(projection, limit = 20) {
  let rows = rankQuestions(NODES);
  if (projection) rows = rows.filter((r) => (r.projections || []).includes(projection));
  return rows.slice(0, Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200));
}

export function blockersOf(id) {
  const n = NODES.get(id);
  if (!n) return null;
  const direct = n.blockedBy || (n.derivedRelations || {}).blockedBy || [];
  const transitive = new Set(direct);
  if (n.type === "goal" || n.type === "capability") {
    for (const req of requiredClosure(NODES, id).keys()) {
      const r = NODES.get(req);
      for (const q of (r && (r.blockedBy || (r.derivedRelations || {}).blockedBy)) || []) transitive.add(q);
    }
  }
  const detail = (q) => { const x = NODES.get(q); return x ? { id: q, question: x.question, state: x.state, whatWouldResolve: x.whatWouldResolve, testedBy: (x.derivedRelations || {}).testedBy || [] } : { id: q }; };
  return { id, name: n.name, direct: direct.map(detail), transitive: [...transitive].filter((q) => !direct.includes(q)).map(detail), caveat: caveatFor([n]) };
}

export function contradictions(id) {
  const rows = ANALYSIS.contradictions.filter((c) => !id || c.claim === id || (c.contradicts || []).includes(id));
  return rows.map((c) => ({ ...c, targets: (c.contradicts || []).map((t) => summarise(NODES.get(t))).filter(Boolean) }));
}

export function search(query, limit = 20) {
  const q = String(query || "").toLowerCase().trim();
  if (!q) return [];
  const scored = [];
  for (const n of NODES.values()) {
    const name = (n.name || n.statement || n.question || n.citation || "").toLowerCase();
    const body = JSON.stringify(n).toLowerCase();
    let score = 0;
    if (name.includes(q)) score += 10;
    if (n.id.toLowerCase().includes(q)) score += 5;
    if (body.includes(q)) score += 1;
    if (score) scored.push([score, n]);
  }
  scored.sort((a, b) => b[0] - a[0] || (a[1].id < b[1].id ? -1 : 1));
  return scored.slice(0, limit).map(([score, n]) => ({ ...summarise(n), score }));
}

export function whatWouldMove(id) {
  const n = NODES.get(id);
  if (!n) return null;
  const out = { id, name: n.name || n.statement };
  if (n.type === "capability") {
    out.rung = n.grade.rung || null; out.basis = n.grade.basis; out.blocked = n.grade.blocked || null;
    out.wouldMove = n.wouldMove || null; out.note = n.grade.note; out.drift = n.grade.drift || null;
    out.blockedBy = blockersOf(id).direct;
  } else if (n.type === "claim") {
    out.rung = n.rung; out.wouldMove = n.wouldMove || null; out.drift = n.drift || null; out.replication = n.replication || null;
  } else if (n.type === "route") {
    out.rung = n.rung; out.wouldMove = n.wouldMove || null; out.drift = n.drift || null;
  } else if (n.type === "question") {
    out.state = n.state; out.whatWouldResolve = n.whatWouldResolve || null; out.testedBy = (n.derivedRelations || {}).testedBy || [];
  }
  out.caveat = caveatFor([n]);
  return out;
}
