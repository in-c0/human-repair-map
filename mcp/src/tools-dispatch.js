/* Tool dispatch. Pure for the graph tools; the two action tools take a
   `store` (D1-backed, see api.js) and return whatever it returns. */

import { LADDER, GROUNDING, MEASURED, CAPABILITIES, ROUTES, CELLS, HEADLINE, META } from "./data.js";
import * as G from "./graph.js";

const notFound = (id) => ({ structured: { error: "not found", id }, text: `No node "${id}". Try search or list_nodes.`, isError: true });

const md = (o) => "```json\n" + JSON.stringify(o, null, 1).slice(0, 6000) + "\n```";

export async function dispatch(name, args, store) {
  args = args || {};
  switch (name) {
    case "graph_manifest": {
      const s = { ...G.MANIFEST, analysisMethod: G.ANALYSIS.method, tools: "graph_manifest, how_to_read, get_node, list_nodes, search, get_subgraph, trace_dependency, find_blockers, rank_research_questions, get_primary_evidence, find_contradictions, what_would_move_this, register_prediction, list_predictions, propose_change" };
      return { structured: s, text: `# Human Repair Graph v${s.version} · snapshot ${s.snapshot} · ${s.contentHash.slice(0, 12)}\n${Object.entries(s.counts).map(([k, v]) => `${v} ${k}`).join(", ")}. Human-reviewed: ${s.humanReviewed}/${G.NODES.size}.\nBulk: ${s.formats.json} · ${s.formats.jsonl} · ${s.formats.jsonld} · schemas ${s.formats.schemas}\n\n${s.caveat}` };
    }
    case "how_to_read": {
      const s = { ladder: LADDER, grounding: GROUNDING, measured: MEASURED, classes: G.ONTOLOGY.primitives.classes, primitives: G.ONTOLOGY.primitives.primitives, gradeBases: G.ONTOLOGY.primitives.blockedKinds && { blockedKinds: G.ONTOLOGY.primitives.blockedKinds }, reviewStates: G.ONTOLOGY.reviewStates.states, humanGated: G.ONTOLOGY.reviewStates.humanGated, relations: G.ONTOLOGY.relationships.relations.map((r) => ({ name: r.name, storedOn: r.storedOn, semantics: r.semantics })), boundary: G.ONTOLOGY.primitives.boundary };
      return { structured: s, text: [
        "# How to read this map",
        "## Evidence ladder", ...LADDER.map((l) => `- **${l.id} ${l.label}** — ${l.blurb}`),
        "The two load-bearing jumps: L2→L3 (the mouse result that does not survive a primate) and L4→L5 (the originator's study versus someone with nothing to gain seeing the same thing).",
        "## Grounding", ...GROUNDING.map((g) => `- **${g.id} ${g.label}** — ${g.blurb} · human review: ${g.review}`),
        "## What was measured", ...Object.keys(MEASURED).map((k) => `- **${k}** — ${MEASURED[k]}`),
        "## Capability classes", ...G.ONTOLOGY.primitives.classes.map((c) => `- **${c.id}** — ${c.question}`),
        "## Grade basis", "- **claims** traceable to claims · **standard-of-care** routine practice · **no-evidence-located** searched, nothing found (L0) · **ungraded** node exists, nobody has graded it (no rung)",
        "## Review states", ...G.ONTOLOGY.reviewStates.states.map((s) => `- **${s.id}** — ${s.meaning}`),
        `## The boundary\n${G.ONTOLOGY.primitives.boundary.statement}`
      ].join("\n") };
    }
    case "get_node": {
      const n = G.getNode(args.id);
      if (!n) return notFound(args.id);
      return { structured: { node: n, caveat: G.caveatFor([n]) }, text: `# ${n.name || n.statement || n.question || n.citation}\n${md(n)}` };
    }
    case "list_nodes": {
      const rows = G.listNodes(args);
      return { structured: { count: rows.length, filter: args, nodes: rows }, text: `# ${rows.length} node(s)\n` + rows.map((r) => `- ${r.id} — ${r.name}${r.grade ? ` [${r.grade.rung || r.grade.basis}${r.grade.blocked && r.grade.blocked !== "none" ? "·" + r.grade.blocked : ""}]` : ""} (${r.review})`).join("\n") };
    }
    case "search": {
      const rows = G.search(args.query, Math.min(args.limit || 20, 100));
      const v1 = CAPABILITIES.filter((c) => (c.title + c.summary).toLowerCase().includes(String(args.query).toLowerCase())).map((c) => ({ id: "v0.1:" + c.id, type: "capability-v0.1", name: c.title, score: 1 }));
      return { structured: { query: args.query, count: rows.length + v1.length, results: [...rows, ...v1] }, text: `# "${args.query}" — ${rows.length + v1.length} match(es)\n` + [...rows, ...v1].map((r) => `- ${r.id} — ${r.name}`).join("\n") };
    }
    case "get_subgraph": {
      const id = G.normaliseId(args.root);
      const s = G.subgraph(id, Math.min(args.depth || 2, 4), args.relations);
      if (!s) return notFound(args.root);
      return { structured: s, text: `# Subgraph of ${id} (depth ${s.depth}): ${s.nodes.length} nodes, ${s.edges.length} edges\n` + s.edges.slice(0, 80).map((e) => `- ${e.from} —${e.rel}${e.group ? "(" + e.group + ")" : ""}→ ${e.to}`).join("\n") };
    }
    case "trace_dependency": {
      const id = G.normaliseId(args.goal, "goal");
      const t = G.tracePath(id);
      if (!t) return notFound(args.goal);
      return { structured: t, text: [
        `# Critical path: ${t.name}`,
        `Requires ${t.requiredCapabilities} capabilities transitively.`,
        `**Binding constraints** (AND-required, lowest rung): ${t.bindingConstraints.map((b) => `${b.id} [${b.rung}${b.blocked && b.blocked !== "none" ? "·" + b.blocked : ""}]`).join(", ") || "none"}`,
        `**All AND requirements by rung:** ${t.andRequirements.map((a) => `${a.rung}:${a.id.replace("hrm:capability/", "")}`).join(" · ")}`,
        `**OR groups:** ${t.orGroups.map((o) => `[best ${o.bestRung}] ` + o.members.map((m) => `${m.rung || "?"}:${m.id.replace("hrm:capability/", "")}`).join(" / ")).join("; ") || "none"}`,
        `**Ungraded:** ${t.ungraded.map((u) => u.id).join(", ") || "none"}`,
        `**Open questions on the path:** ${t.openQuestions.map((q) => q.id).join(", ") || "none"}`,
        t.reading
      ].join("\n") };
    }
    case "find_blockers": {
      const id = G.normaliseId(args.id);
      const b = G.blockersOf(id);
      if (!b) return notFound(args.id);
      return { structured: b, text: `# Blockers of ${b.name}\n## Direct\n${b.direct.map((q) => `- ${q.id} — ${q.question}`).join("\n") || "none"}\n## Through requirements\n${b.transitive.map((q) => `- ${q.id} — ${q.question}`).join("\n") || "none"}` };
    }
    case "rank_research_questions": {
      const rows = G.rankedQuestions(args.projection, args.limit || 20);
      return { structured: { method: G.ANALYSIS.method, projection: args.projection || "all", questions: rows }, text: `# Open questions by structural leverage${args.projection ? ` (${args.projection})` : ""}\n` + rows.map((r) => `${r.rank}. [${r.downstreamTotal} downstream: ${r.downstreamGoals} goals, ${r.downstreamCapabilities} capabilities${r.testedBy.length ? `; ${r.testedBy.length} experiment(s) proposed` : ""}] ${r.question} (${r.id})`).join("\n") + `\n\n${G.ANALYSIS.method}` };
    }
    case "get_primary_evidence": {
      const id = G.normaliseId(args.id);
      const e = G.evidenceFor(id);
      if (!e) return notFound(args.id);
      return { structured: e, text: `# Evidence: ${e.name}\n` + e.claims.map((c) => `## ${c.relation.toUpperCase()} · ${c.rung} ${c.grounding} · ${c.review}\n${c.statement}\n` + c.evidence.map((s) => `- ${s.citation} — ${s.design}${s.n ? ", n=" + s.n : ""}${s.doi ? " · doi:" + s.doi : s.url ? " · " + s.url : ""} · machine-resolved: ${s.machineResolved} · human-opened: ${s.humanOpened ? "yes" : "no"}`).join("\n") + (c.replication ? `\nReplication: ${c.replication.note || c.replication.independentGroups + " independent group(s)"}` : "") + (c.drift ? `\nDrift: ${c.drift}` : "")).join("\n\n") };
    }
    case "find_contradictions": {
      const id = args.id ? G.normaliseId(args.id) : null;
      const rows = G.contradictions(id);
      return { structured: { count: rows.length, contradictions: rows }, text: `# ${rows.length} contradiction(s)\n` + rows.map((c) => `- ${c.claim} contradicts ${c.contradicts.join(", ")}: ${c.statement}`).join("\n") };
    }
    case "what_would_move_this": {
      const id = G.normaliseId(args.id);
      let w = G.whatWouldMove(id);
      if (!w) {
        const r = ROUTES.find((x) => x.id === args.id); const c = CAPABILITIES.find((x) => x.id === args.id);
        if (r) w = { id: r.id, name: r.subject, rung: r.rung, wouldMove: r.wouldMove || null, drift: r.drift };
        else if (c) w = { id: c.id, name: c.title, score: c.score, gatedBy: c.depends, unblocks: c.blocks, note: "A maturity score is a human judgment; it changes only when a reviewer accepts new evidence under the published rubric." };
        else return notFound(args.id);
      }
      return { structured: w, text: `# What would move: ${w.name}\n` + (w.rung ? `Currently ${w.rung}${w.basis ? ` (basis ${w.basis})` : ""}${w.blocked ? `, blocked by ${w.blocked}` : ""}.\n` : "") + (w.wouldMove ? `## The missing demonstration\n${w.wouldMove}\n` : w.whatWouldResolve ? `## What would resolve it\n${w.whatWouldResolve}\n` : "## Not yet specified for this record.\n") + (w.drift ? `## Drift\n${w.drift}` : "") };
    }
    case "register_prediction": {
      if (!store) return { structured: { error: "store unavailable" }, text: "Prediction registry unavailable.", isError: true };
      const subject = G.normaliseId(args.subject);
      if (!G.NODES.has(subject)) return notFound(args.subject);
      const r = await store.registerPrediction({ ...args, subject });
      if (r.error) return { structured: r, text: `Rejected: ${r.error}`, isError: true };
      return { structured: r, text: `Registered prediction ${r.id} on ${subject} at graph ${r.graphSnapshot}. Event ${r.event.hash.slice(0, 12)}… It cannot be edited. Resolution by a steward against ${args.resolutionCriteria}.` };
    }
    case "list_predictions": {
      if (!store) return { structured: { error: "store unavailable" }, text: "Prediction registry unavailable.", isError: true };
      const subject = args.subject ? G.normaliseId(args.subject) : null;
      const r = await store.listPredictions(subject, args.limit || 50);
      return { structured: r, text: `# ${r.count} prediction(s)${subject ? ` on ${subject}` : ""}\n` + r.predictions.map((p) => `- ${p.id} [${p.state}] p=${p.probability} by ${p.predictor_name} (${p.predictor_type}) horizon ${p.horizon}: ${p.statement}`).join("\n") };
    }
    case "propose_change": {
      if (!store) return { structured: { error: "store unavailable" }, text: "Contribution pipeline unavailable.", isError: true };
      const record_id = G.normaliseId(args.record_id);
      const r = await store.submitProposal({ ...args, record_id, actorPrefix: "agent" });
      if (r.error) return { structured: r, text: `Rejected: ${r.error}`, isError: true };
      return { structured: r, text: `Filed proposal ${r.id} (${args.kind}) against ${record_id}: ${r.note}` };
    }
    // ---- v0.1 / v0.2
    case "evidence_state": {
      const byRung = {}; ROUTES.forEach((r) => { byRung[r.rung] = (byRung[r.rung] || 0) + 1; });
      return { structured: { headline: HEADLINE, routesByRung: byRung, routes: ROUTES.length }, text: `# Evidence state — getting a drug into the human brain\n\n**${HEADLINE.finding}**\n\n${HEADLINE.detail}\n\n## The central contrast\n${HEADLINE.contrast}\n\n## Routes by evidence rung (${ROUTES.length} total)\n` + Object.keys(byRung).sort().reverse().map((k) => `- **${k}** — ${byRung[k]} route(s)`).join("\n") };
    }
    case "repair_grid": {
      const GC = ["see", "model", "reach", "edit", "verify"];
      let rows = CELLS.slice();
      if (args.system) rows = rows.filter((c) => c.system.toLowerCase() === String(args.system).toLowerCase());
      if (!rows.length) return { structured: { error: "no match", systems: [...new Set(CELLS.map((c) => c.system))] }, text: `No nodes match. Systems: ${[...new Set(CELLS.map((c) => c.system))].join(", ")}`, isError: true };
      const mean = (k) => (rows.reduce((t, c) => t + parseInt(c.capabilities[k].grade.slice(1), 10), 0) / rows.length).toFixed(2);
      const lines = rows.map((c) => `${(c.name + (c.kind === "non-cell" ? " (not a cell)" : "")).padEnd(46).slice(0, 46)} ` + GC.map((k) => { const v = c.capabilities[k]; if (args.blocked && v.blocked !== args.blocked) return "  ·"; return v.grade + (v.blocked === "framework" ? "*" : ""); }).join(" "));
      return { structured: { nodes: rows.map((c) => ({ id: `hrm:cell/${c.id}`, name: c.name, system: c.system, kind: c.kind, grades: Object.fromEntries(GC.map((k) => [k, c.capabilities[k]])) })), columnMeans: Object.fromEntries(GC.map((k) => [k, +mean(k)])) }, text: `# The repairability grid — ${rows.length} node(s)\n\n**We can watch the body fail in high resolution, and do almost nothing about it.**\n\n\`\`\`\n${"node".padEnd(46)} see model reach edit verify\n${lines.join("\n")}\n\`\`\`\n* = blocked by framework rather than science\n\nColumn averages on the L0–L5 ladder: ` + GC.map((k) => `${k} ${mean(k)}`).join(" · ") };
    }
    case "get_cell": {
      const c = CELLS.find((x) => x.id === args.id || `hrm:cell/${x.id}` === args.id);
      if (!c) return { structured: { error: "not found", available: CELLS.map((x) => x.id) }, text: `No node with id "${args.id}". Available: ${CELLS.map((x) => x.id).join(", ")}`, isError: true };
      const GC = ["see", "model", "reach", "edit", "verify"];
      return { structured: { node: G.NODES.get(`hrm:cell/${c.id}`), cell: c }, text: [`# ${c.name}`, ``, `- **System:** ${c.system}`, `- **Kind:** ${c.kind === "non-cell" ? "not a cell" : "cell type"}`, `- **Renewal:** ${c.renewal}`, `- **Review state:** ${c.review}`, ``, `## How it fails`, c.failures, ``, `## The five capabilities`, ...GC.map((k) => { const v = c.capabilities[k]; return `- **${k}** — ${v.grade}${v.blocked === "none" ? "" : ` (blocked by ${v.blocked})`}: ${v.note}`; }), ``, `## Anchors`, ...c.anchors.map((a) => `- ${a}`)].join("\n") };
    }
    case "list_routes": {
      let rs = ROUTES.slice();
      if (args.rung) rs = rs.filter((r) => r.rung === args.rung);
      if (args.measured) rs = rs.filter((r) => r.measured === args.measured);
      if (args.family) rs = rs.filter((r) => r.family === args.family);
      if (args.status) rs = rs.filter((r) => r.status.toLowerCase().includes(String(args.status).toLowerCase()));
      return { structured: { count: rs.length, routes: rs.map((r) => ({ id: `hrm:route/${r.id}`, subject: r.subject, rung: r.rung, grounding: r.grounding, measured: r.measured, status: r.status, review: r.review })) }, text: `# Delivery routes (${rs.length} of ${ROUTES.length})\n` + rs.map((r) => `- **${r.subject}** — ${r.rung} · ${r.grounding} · measures: ${r.measured} · ${r.status} · review: ${r.review} (id: \`${r.id}\`)`).join("\n") };
    }
    case "get_route": {
      const r = ROUTES.find((x) => x.id === args.id || `hrm:route/${x.id}` === args.id);
      if (!r) return { structured: { error: "not found" }, text: `No route with id "${args.id}". Available: ${ROUTES.map((x) => x.id).join(", ")}`, isError: true };
      const lines = [`# ${r.subject}`, ``, `- **Evidence rung:** ${r.rung} — ${(LADDER.find((l) => l.id === r.rung) || {}).blurb || ""}`, `- **Grounding:** ${r.grounding}`, `- **What it measured:** ${r.measured} — ${MEASURED[r.measured] || ""}`, `- **Replication:** ${r.replication}`, `- **Status:** ${r.status}`, `- **Review state:** ${r.review}`, `- **Route family:** ${r.family}`, ``, `## Evidence`, r.note, ``, `## Drift — demonstrated vs claimed`, r.drift];
      if (r.precision) lines.push(``, `## Precision note`, r.precision);
      lines.push(``, `## Citations`, ...r.citations.map((c) => `- ${c}`));
      if (r.wouldMove) lines.push(``, `## What would move this rung`, r.wouldMove);
      return { structured: { route: G.NODES.get(`hrm:route/${r.id}`) }, text: lines.join("\n") };
    }
    case "list_capabilities":
      return { structured: { capabilities: CAPABILITIES }, text: `# The five enabling capabilities (v0.1)\n` + CAPABILITIES.map((c) => `- **${c.title}** (${c.code}) — maturity ${c.score}/100 [${c.interval[0]}–${c.interval[1]}] · review: ${c.review} (id: \`${c.id}\`)\n  ${c.summary}`).join("\n") };
    case "get_capability": {
      const c = CAPABILITIES.find((x) => x.id === args.id);
      if (!c) return { structured: { error: "not found" }, text: `No v0.1 capability "${args.id}". Available: ${CAPABILITIES.map((x) => x.id).join(", ")}. For graph capabilities use get_node.`, isError: true };
      return { structured: { capability: c }, text: `# ${c.title} (${c.code})\n\n${c.summary}\n\n- **Maturity:** ${c.score}/100 (interval ${c.interval[0]}–${c.interval[1]}, rubric v${META.rubricVersion})\n- **Review state:** ${c.review}\n- **Depends on:** ${c.depends.length ? c.depends.join(", ") : "none — foundational"}\n- **Blocks:** ${c.blocks.join(", ")}` };
    }
    default:
      return null;
  }
}
