/* Human Repair Map — record store for the MCP server.
   CAPABILITIES and ROUTES are re-exported from generated.js, which is built from
   records/. This file holds only the prose that is not part of a record. Every record carries its review state and
   grounding class, because the API must not present a record as more settled
   than it is. */

export const META = {
  name: "Human Repair Map",
  site: "https://humanrepairmap.com",
  domain: "cns-delivery",
  lastChecked: "2026-07-27",
  rubricVersion: "0.1",
  verification:
    "Every delivery record is AI-PROPOSED and UNREVIEWED: sourced by search agents and not yet hand-checked by a human. No record here may be treated as validated.",
  notMedicalAdvice:
    "This maps research state, not clinical care. It does not diagnose, recommend treatments, select therapies, predict individual outcomes, determine trial eligibility, or give patient-specific medical advice."
};

export const LADDER = [
  { id: "L0", label: "proposed", blurb: "an idea or mechanism on paper; nothing built" },
  { id: "L1", label: "in a dish", blurb: "works in cultured cells or an organoid" },
  { id: "L2", label: "in a rodent", blurb: "works in a living mouse or rat" },
  { id: "L3", label: "in a large animal", blurb: "works in a non-human primate or comparable model" },
  { id: "L4", label: "in humans, once", blurb: "shown in people by a single group, usually the originator" },
  { id: "L5", label: "in humans, independently", blurb: "reproduced in people by a group with no stake in the claim" }
];

export const GROUNDING = [
  { id: "G0", label: "assertion", blurb: "someone said it; no source attached", review: "cannot enter the map" },
  { id: "G1", label: "cited text", blurb: "a paper or report says it", review: "full verification packet + human" },
  { id: "G2", label: "structured record", blurb: "registry entry, regulatory filing, trial record", review: "automated cross-check; human spot-audit" },
  { id: "G3", label: "primary data", blurb: "deposited dataset that can be re-analysed", review: "automated re-analysis; human reviews method" },
  { id: "G4", label: "instrument-signed", blurb: "signed at capture, provenance chain intact", review: "none for the fact; human only for the inference" }
];

export const MEASURED = {
  function: "changed a person's life (motor milestones, survival, tumour response)",
  biomarker: "moved a surrogate number without proven clinical benefit",
  opening: "demonstrated the barrier opens, not that a delivered drug helped",
  none: "no clinical or surrogate benefit demonstrated"
};


export { CAPABILITIES, ROUTES, CELLS } from "./generated.js";

export const HEADLINE = {
  finding: "Nothing on this map is both broad and proven in humans.",
  detail:
    "Only two capabilities reach the top rung, and both are narrow: focused ultrasound reaches L5 for OPENING the barrier (not for any delivery outcome), and locoregional CAR-T reaches L5 for the ROUTE (one tumour at a time, injected into the ventricle or cavity). Every approved 'brain drug' beneath them rests on one of three narrowings: it treats the spinal cord rather than the brain, it moved a biomarker rather than a life, or it reaches one anatomical spot rather than the organ.",
  contrast:
    "The sharpest line: opening the blood-brain barrier is solved (L5, six independent groups); delivering a drug through it and changing an outcome is proven nowhere. Same physical event, split at the exact rung where proof begins."
};
