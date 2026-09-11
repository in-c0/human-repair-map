/* MCP tool definitions and dispatch for the Human Repair Graph.
   Each tool returns { structured, text }: structured is the JSON a model
   should reason over (also exposed as structuredContent), text is a short
   human rendering. The v0.1/v0.2 tools keep their names and behaviour so
   existing clients do not break; v0.3 adds the graph operations. */

import { LADDER, GROUNDING, MEASURED, CAPABILITIES, ROUTES, CELLS, HEADLINE, META } from "./data.js";
import * as G from "./graph.js";

const ID = { type: "string", description: "A node id: 'hrm:capability/cutaneous-sensory-reinnervation', a bare slug, or the resolvable URL form." };
const PROJ = { type: "string", enum: ["universal-repair", "rejuvenation"], description: "optional: restrict to one public map" };
const obj = (properties, required) => ({ type: "object", properties, ...(required ? { required } : {}), additionalProperties: false });

export const TOOLS = [
  // ---- orientation
  { name: "graph_manifest", title: "What this graph is, right now",
    description: "Version, snapshot date, content hash, node counts by type and review state, bulk-export URLs and the caveat. Call first; quote the hash when you cite the graph.",
    inputSchema: obj({}) },
  { name: "how_to_read", title: "How to read the grading",
    description: "The evidence ladder (L0–L5), the grounding ladder (G0–G4), what 'measured' means, the capability classes, repair primitives, grade bases and review states. Read before interpreting any record.",
    inputSchema: obj({}) },
  // ---- retrieval
  { name: "get_node", title: "Get any node",
    description: "Full record for any node by id (goal, capability, question, claim, experiment, source, cell, route) with its derived inverse relations.",
    inputSchema: obj({ id: ID }, ["id"]) },
  { name: "list_nodes", title: "List / filter nodes",
    description: "Filter nodes by type, projection, capability class, rung, grade basis, blocked kind, state, review state, or free text. Returns summaries; use get_node for detail.",
    inputSchema: obj({
      type: { type: "string", enum: G.TYPES }, projection: PROJ,
      class: { type: "string", enum: ["see", "model", "reach", "edit", "verify", "control"] },
      rung: { type: "string", enum: ["L0", "L1", "L2", "L3", "L4", "L5"] },
      basis: { type: "string", enum: ["claims", "standard-of-care", "no-evidence-located", "ungraded"] },
      blocked: { type: "string", enum: ["science", "framework", "none"] },
      state: { type: "string", description: "question state (open|resolved) or experiment status" },
      review: { type: "string", enum: ["ai-proposed", "submitted", "in-review", "reviewed", "disputed", "superseded"] },
      derived: { type: "string", enum: ["true", "false"], description: "grid capabilities derived from the v0.2 cell records are derived=true" },
      q: { type: "string", description: "free text" },
      limit: { type: "integer", minimum: 1, maximum: 500 }
    }) },
  { name: "search", title: "Search the graph",
    description: "Free-text search across every node type (and the v0.1 routes and capabilities).",
    inputSchema: obj({ query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 100 } }, ["query"]) },
  { name: "get_subgraph", title: "Neighbourhood of a node",
    description: "Breadth-first neighbourhood of a node over chosen relations (requires, enables, blockedBy, blocks, supportedBy, contradictedBy, testedBy, parent, children, target) to a given depth. Edges carry the AND/OR group of a requirement.",
    inputSchema: obj({ root: ID, depth: { type: "integer", minimum: 1, maximum: 4 }, relations: { type: "array", items: { type: "string" } } }, ["root"]) },
  // ---- reasoning
  { name: "trace_dependency", title: "Critical path of a goal",
    description: "For a goal: every capability it transitively requires, the binding constraints (AND-required capabilities at the lowest rung), the OR groups where one alternative suffices, the ungraded ones, and the open questions along the path. Structural, not probabilistic.",
    inputSchema: obj({ goal: ID }, ["goal"]) },
  { name: "find_blockers", title: "What blocks this",
    description: "The open questions that gate a goal or capability, directly and through everything it requires.",
    inputSchema: obj({ id: ID }, ["id"]) },
  { name: "rank_research_questions", title: "Ranked open questions",
    description: "Open questions ranked by structural leverage: how many goals and capabilities sit downstream of what each one blocks, tie-broken by how low the blocked capability sits. This is the map's answer to 'what should be asked next' and the computation is inspectable.",
    inputSchema: obj({ projection: PROJ, limit: { type: "integer", minimum: 1, maximum: 200 } }) },
  { name: "get_primary_evidence", title: "Evidence behind a claim or capability",
    description: "The claims supporting or contradicting a capability (or the claim itself), each with its sources: DOI/PMID/URL, study design, locator, whether a machine resolved the source and whether a human has opened it.",
    inputSchema: obj({ id: ID }, ["id"]) },
  { name: "find_contradictions", title: "Contradictions",
    description: "Claims that contradict a capability or another claim — including null results. Optionally filtered to one node.",
    inputSchema: obj({ id: ID }) },
  { name: "what_would_move_this", title: "What evidence would move this",
    description: "For a capability, claim, route or question: the specific missing demonstration that would raise its rung or resolve it, with the drift between demonstrated and claimed.",
    inputSchema: obj({ id: ID }, ["id"]) },
  // ---- action
  { name: "register_prediction", title: "Register a locked prediction",
    description: "Lock a forecast about a question, claim or capability BEFORE the outcome is known. Stored in the public hash-chained event log with the graph snapshot you saw; cannot be edited afterwards; resolved later by a steward against reality. This is how a model earns calibrated weight here. Vague resolution criteria make a prediction void, not right.",
    inputSchema: obj({
      subject: ID,
      statement: { type: "string", minLength: 15, maxLength: 600 },
      probability: { type: "number", minimum: 0, maximum: 1 },
      resolutionCriteria: { type: "string", minLength: 15 },
      horizon: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "date by which it should be resolvable" },
      predictor: obj({ type: { type: "string", enum: ["human", "ai"] }, name: { type: "string" }, model: { type: "string" }, version: { type: "string" }, orcid: { type: "string" } }, ["type", "name"]),
      evidenceAccessed: { type: "array", items: { type: "string" } },
      reasoning: { type: "string", maxLength: 4000 }
    }, ["subject", "statement", "probability", "resolutionCriteria", "horizon", "predictor"]) },
  { name: "list_predictions", title: "Locked predictions",
    description: "Predictions registered against a node (or all), with their state.",
    inputSchema: obj({ subject: ID, limit: { type: "integer", minimum: 1, maximum: 200 } }) },
  { name: "propose_change", title: "Propose a change to the map",
    description: "File a correction, rung challenge, new evidence, new node, new dependency or question against any record. Enters the public hash-chained event log as 'submitted'; it changes nothing until a steward reviews it, and the map shows it as unreviewed until then. Give a source URL whenever the proposal rests on evidence.",
    inputSchema: obj({
      record_id: ID,
      kind: { type: "string", enum: ["correction", "rung-challenge", "new-evidence", "new-node", "new-dependency", "question"] },
      summary: { type: "string", maxLength: 300, description: "one line: what is wrong or missing" },
      rationale: { type: "string", maxLength: 4000 },
      source_url: { type: "string" },
      proposer: { type: "string", maxLength: 120 },
      affil: { type: "string", maxLength: 200 },
      proposed_record: { type: "object", description: "optional: a full record in the schema of its type (see /graph/schema/), for new-node or new-dependency proposals" }
    }, ["record_id", "kind", "summary", "rationale"]) },
  // ---- v0.1 / v0.2 tools, unchanged
  { name: "evidence_state", title: "Evidence state of CNS delivery (v0.1)",
    description: "The headline state of getting a drug into the human brain: routes by evidence rung, what is proven in humans, the central contrast.",
    inputSchema: obj({}) },
  { name: "repair_grid", title: "The repairability grid (v0.2)",
    description: "Every human cell type plus the six non-cellular things, graded on see/model/reach/edit/verify. Returns the whole grid with column averages.",
    inputSchema: obj({ system: { type: "string" }, blocked: { type: "string", enum: ["science", "framework", "none"] } }) },
  { name: "get_cell", title: "Get one grid node (v0.2)", description: "Full record for one cell type or non-cellular node.", inputSchema: obj({ id: { type: "string" } }, ["id"]) },
  { name: "list_routes", title: "List CNS delivery routes (v0.1)", description: "The 16 graded routes into the human brain, filterable.",
    inputSchema: obj({ rung: { type: "string", enum: ["L0", "L1", "L2", "L3", "L4", "L5"] }, measured: { type: "string", enum: ["function", "biomarker", "opening", "none"] }, family: { type: "string", enum: ["through barrier", "around barrier"] }, status: { type: "string" } }) },
  { name: "get_route", title: "Get one delivery route (v0.1)", description: "Full route record.", inputSchema: obj({ id: { type: "string" } }, ["id"]) },
  { name: "list_capabilities", title: "The five capabilities (v0.1)", description: "The five enabling capabilities with maturity scores.", inputSchema: obj({}) },
  { name: "get_capability", title: "Get one v0.1 capability", description: "Full v0.1 capability record.", inputSchema: obj({ id: { type: "string" } }, ["id"]) }
];
