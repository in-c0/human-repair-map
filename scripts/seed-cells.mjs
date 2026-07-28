/* Seed the v0.2 repairability grid: one file per node in records/cells/.
   Run once to author; thereafter edit the JSON files directly.

   Grades are L0-L5 on the existing evidence ladder. `blocked` says what stands
   between this capability and the next rung: "science" (we don't know how),
   "framework" (we do, and it isn't reaching people), or "none" (it works).
   Every grade enters ai-proposed. Terse by design: a short claim with a named
   anchor beats a paragraph nobody can check. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "records", "cells");
fs.mkdirSync(out, { recursive: true });

// [grade, blocked, note]
const C = (g, b, n) => ({ grade: g, blocked: b, note: n });

const NODES = [
  {
    id: "hepatocyte", name: "Hepatocyte", system: "Liver", kind: "cell", renewal: "regenerative",
    failures: "Steatosis, fibrosis to cirrhosis, metabolic enzyme deficiency, drug injury. The liver regrows mass readily but scars irreversibly.",
    see: C("L5", "none", "Biopsy, elastography and serum enzymes are routine clinical practice."),
    model: C("L4", "science", "Regeneration is well characterised; the healthy set-point for a diseased liver is less clear."),
    reach: C("L5", "none", "The solved delivery problem. Lipid nanoparticles land in liver by default — patisiran approved 2018."),
    edit: C("L5", "none", "In vivo CRISPR: NTLA-2001 for ATTR amyloidosis; base editing for PCSK9 in trials."),
    verify: C("L5", "none", "Circulating protein levels give a direct, repeatable readout."),
    anchors: ["Patisiran (Onpattro), FDA 2018", "NTLA-2001 in vivo CRISPR, NEJM 2021"]
  },
  {
    id: "keratinocyte", name: "Keratinocyte", system: "Skin", kind: "cell", renewal: "self-renewing",
    failures: "Blistering from structural gene defects, impaired wound healing, malignant transformation.",
    see: C("L5", "none", "Directly visible and biopsy is trivial."),
    model: C("L5", "none", "Healthy epidermis is unambiguous and continuously renewed."),
    reach: C("L5", "none", "Topical. Vyjuvek is a gel applied to the wound."),
    edit: C("L5", "none", "Vyjuvek, topical HSV-1 vector for dystrophic epidermolysis bullosa, FDA 2023."),
    verify: C("L5", "none", "Wound closure is observed by eye."),
    anchors: ["Vyjuvek (beremagene geperpavec), FDA 2023"]
  },
  {
    id: "hsc", name: "Haematopoietic stem cell", system: "Blood / marrow", kind: "cell", renewal: "self-renewing",
    failures: "Inherited haemoglobin and immune defects, clonal expansion to leukaemia, age-related clonal haematopoiesis.",
    see: C("L5", "none", "Marrow aspirate and flow cytometry are standard."),
    model: C("L5", "none", "Lineage output is well defined and measurable."),
    reach: C("L4", "science", "Ex vivo only: harvest, edit outside the body, reinfuse. In vivo HSC targeting is unsolved."),
    edit: C("L5", "none", "Casgevy, ex vivo CRISPR for sickle cell disease, FDA 2023."),
    verify: C("L5", "none", "Chimerism and haemoglobin fractions are directly measurable."),
    anchors: ["Casgevy (exagamglogene autotemcel), FDA 2023", "Lyfgenia, FDA 2023"]
  },
  {
    id: "t-lymphocyte", name: "T lymphocyte", system: "Immune", kind: "cell", renewal: "self-renewing",
    failures: "Exhaustion, autoreactivity, immunodeficiency, malignancy, age-related repertoire narrowing.",
    see: C("L5", "none", "Flow cytometry and repertoire sequencing from a blood draw."),
    model: C("L4", "science", "A healthy repertoire is describable statistically, not specified precisely."),
    reach: C("L4", "science", "Ex vivo engineering is routine; in vivo CAR generation is early-stage."),
    edit: C("L5", "none", "Six approved CAR-T products since 2017."),
    verify: C("L5", "none", "Persistence and expansion tracked directly in blood."),
    anchors: ["Kymriah, FDA 2017", "In vivo CAR-T programmes, preclinical to Phase 1"]
  },
  {
    id: "corneal-epithelium", name: "Corneal epithelium / limbal stem cell", system: "Eye", kind: "cell", renewal: "self-renewing",
    failures: "Limbal stem cell deficiency after chemical burns, scarring, dystrophies.",
    see: C("L5", "none", "Slit lamp and OCT image it directly and non-invasively."),
    model: C("L5", "none", "A clear cornea is an unambiguous target state."),
    reach: C("L5", "none", "Surgically accessible; grafts placed directly."),
    edit: C("L5", "none", "Holoclar, autologous limbal stem cells, EU 2015 — genuine tissue restoration."),
    verify: C("L5", "none", "Corneal clarity and visual acuity."),
    anchors: ["Holoclar, EMA 2015"]
  },
  {
    id: "photoreceptor-rpe", name: "Photoreceptor / retinal pigment epithelium", system: "Eye", kind: "cell", renewal: "post-mitotic",
    failures: "Inherited retinal dystrophy, macular degeneration, photoreceptor death. No human regeneration.",
    see: C("L5", "none", "Adaptive-optics imaging resolves individual cones in a living eye."),
    model: C("L4", "science", "Structure is well mapped; restoring degenerated architecture is not solved."),
    reach: C("L5", "none", "Subretinal injection into a small, immune-privileged, enclosed compartment."),
    edit: C("L4", "science", "Luxturna corrects RPE65 in one genotype; broader photoreceptor rescue remains unproven."),
    verify: C("L5", "none", "Visual function and OCT structure both measurable."),
    anchors: ["Luxturna (voretigene neparvovec), FDA 2017"]
  },
  {
    id: "cochlear-hair-cell", name: "Cochlear hair cell", system: "Ear", kind: "cell", renewal: "post-mitotic",
    failures: "Noise, ototoxic and age-related loss. Birds regenerate these; mammals do not.",
    see: C("L3", "science", "Audiometry measures function, not cells. No way to image hair cells in a living human."),
    model: C("L4", "science", "Avian regeneration shows the target state exists biologically."),
    reach: C("L4", "science", "Intracochlear injection works but the cochlea is small, fluid-filled and easily damaged."),
    edit: C("L4", "science", "OTOF gene therapy restored hearing in congenitally deaf children, 2024 trials. One genotype."),
    verify: C("L5", "none", "Audiometry is precise and repeatable."),
    anchors: ["OTOF gene therapy trials, 2024", "Avian hair-cell regeneration literature"]
  },
  {
    id: "skeletal-muscle", name: "Skeletal muscle fibre / satellite cell", system: "Musculoskeletal", kind: "cell", renewal: "regenerative",
    failures: "Dystrophies, sarcopenia with age, denervation atrophy, cachexia.",
    see: C("L4", "science", "Biopsy and MRI work; whole-body fibre-level state does not exist."),
    model: C("L4", "science", "Healthy muscle is well characterised; the ageing set-point is contested."),
    reach: C("L4", "science", "Systemic AAV reaches muscle but total body mass makes dose the binding limit."),
    edit: C("L4", "science", "Elevidys for Duchenne, FDA 2023 — accelerated, and the benefit remains debated."),
    verify: C("L4", "science", "Function tests and dystrophin expression; long-term durability unproven."),
    anchors: ["Elevidys (delandistrogene moxeparvovec), FDA 2023"]
  },
  {
    id: "cardiomyocyte", name: "Cardiomyocyte", system: "Heart", kind: "cell", renewal: "post-mitotic",
    failures: "Ischaemic death replaced by scar, hypertrophy, inherited cardiomyopathy. Essentially no human renewal.",
    see: C("L4", "science", "Echo and MRI measure function; troponin reports death. Cell state is invisible in vivo."),
    model: C("L3", "science", "Zebrafish and neonatal mice regenerate heart muscle, so a target state exists — not in adult humans."),
    reach: C("L4", "science", "AAV9 has useful cardiac tropism; trials in Danon disease and cardiomyopathy are running."),
    edit: C("L3", "science", "No approved cardiomyocyte-directed therapy. Scar replaces muscle faster than regeneration."),
    verify: C("L4", "science", "Ejection fraction and imaging; no cell-level confirmation."),
    anchors: ["RP-A501 for Danon disease, Phase 1", "Zebrafish cardiac regeneration literature"]
  },
  {
    id: "beta-cell", name: "Pancreatic islet β-cell", system: "Endocrine / pancreas", kind: "cell", renewal: "minimal",
    failures: "Autoimmune destruction in type 1, exhaustion in type 2. Silent until most mass is already gone.",
    see: C("L2", "science", "THE binding gap: there is no clinical way to measure β-cell mass in a living person."),
    model: C("L4", "none", "Glucose control gives a clear functional target."),
    reach: C("L3", "science", "Pancreas is deep, diffuse and enzymatically hostile; islets are a tiny fraction of tissue."),
    edit: C("L4", "science", "Stem-cell-derived islets produced insulin independence in early trials, but require immunosuppression."),
    verify: C("L4", "none", "C-peptide and continuous glucose monitoring are good functional readouts."),
    anchors: ["VX-880 stem-cell-derived islets, Phase 1/2", "Autoimmunity persists as the chronic driver"]
  },
  {
    id: "cns-neuron", name: "Central neuron", system: "Brain / spinal cord", kind: "cell", renewal: "post-mitotic",
    failures: "Neurodegeneration, stroke infarction, trauma. Glial scar blocks regrowth; no meaningful replacement.",
    see: C("L4", "science", "Imaging and CSF markers are indirect. No single-cell state in a living brain."),
    model: C("L2", "science", "The substrate is identity — a healthy target state cannot be specified without specifying the person."),
    reach: C("L4", "science", "Intrathecal delivery reaches spinal cord; nothing reaches brain broadly. See the CNS delivery module."),
    edit: C("L4", "science", "Nusinersen treats a spinal motor-neuron disease. No neuron has been replaced in a human."),
    verify: C("L4", "science", "Clinical scores and biomarkers; no direct confirmation of cell-level change."),
    anchors: ["Nusinersen (Spinraza), FDA 2016", "CNS delivery module, this map"]
  },
  {
    id: "peripheral-neuron", name: "Peripheral neuron", system: "Peripheral nervous system", kind: "cell", renewal: "regenerative axon",
    failures: "Transection, diabetic and chemotherapy neuropathy, compression. Axons regrow, slowly and imperfectly.",
    see: C("L4", "none", "Nerve conduction studies and EMG are routine."),
    model: C("L4", "none", "Reinnervation of a known target is a clear goal."),
    reach: C("L4", "science", "Surgically accessible at specific sites; diffuse neuropathy is not addressable."),
    edit: C("L3", "science", "Surgical repair and conduits assist regrowth; no cell-level therapy."),
    verify: C("L5", "none", "Conduction and function are directly measurable."),
    anchors: ["Peripheral nerve regeneration is a genuine biological capability humans retain"]
  },
  {
    id: "glia", name: "Glia (astrocyte, oligodendrocyte, microglia)", system: "Brain / spinal cord", kind: "cell", renewal: "limited",
    failures: "Reactive gliosis forming the scar that blocks CNS repair, demyelination, chronic neuroinflammation.",
    see: C("L3", "science", "PET ligands report microglial activation coarsely; astrocyte state is inaccessible."),
    model: C("L2", "science", "Reactive gliosis is protective and obstructive at once. No agreed healthy target."),
    reach: C("L2", "science", "Same barrier problem as neurons, with less cell-type specificity."),
    edit: C("L2", "science", "Remyelination remains unachieved in humans despite decades of trials."),
    verify: C("L3", "science", "Imaging proxies only."),
    anchors: ["Zebrafish Müller glia regenerate retina; human glia do not"]
  },
  {
    id: "nephron-epithelium", name: "Nephron epithelium", system: "Kidney", kind: "cell", renewal: "minimal",
    failures: "Progressive fibrosis, tubular injury, glomerular loss. Nephrons are never rebuilt after birth.",
    see: C("L3", "science", "eGFR reports whole-organ function; biopsy is invasive and focal."),
    model: C("L3", "science", "Nephron architecture is a 3-D pattern cells do not re-derive."),
    reach: C("L2", "science", "Filtration means most agents pass through rather than into tubular cells."),
    edit: C("L1", "science", "No approved therapy repairs or replaces nephron cells. Dialysis substitutes function."),
    verify: C("L4", "none", "eGFR and proteinuria are reliable functional measures."),
    anchors: ["Nephron endowment is fixed at birth in humans"]
  },
  {
    id: "alveolar-epithelium", name: "Alveolar epithelium", system: "Lung", kind: "cell", renewal: "limited",
    failures: "Fibrosis, emphysematous destruction, cystic fibrosis channel defects, acute injury.",
    see: C("L3", "science", "CT shows architecture; bronchoscopy samples focally. No cell-state map."),
    model: C("L3", "science", "Alveolar architecture, once destroyed, is not re-formed."),
    reach: C("L4", "science", "Inhalation delivers to airway surface; alveolar and basal cell targeting is inefficient."),
    edit: C("L2", "science", "Inhaled mRNA and gene editing for CF are in early trials. Modulators treat protein, not cells."),
    verify: C("L4", "none", "Spirometry is a good functional readout."),
    anchors: ["Inhaled CF gene-editing programmes, early Phase"]
  },
  {
    id: "gut-epithelium", name: "Intestinal epithelium", system: "Gut", kind: "cell", renewal: "self-renewing",
    failures: "Barrier failure, inflammatory destruction, malignant transformation. Renews every few days.",
    see: C("L4", "none", "Endoscopy and biopsy are routine and direct."),
    model: C("L4", "none", "Continuous renewal from a defined stem compartment."),
    reach: C("L3", "science", "Oral delivery reaches the lumen; targeting epithelial cells specifically is unsolved."),
    edit: C("L2", "science", "No approved cell-directed therapy; immunosuppression treats the driver instead."),
    verify: C("L4", "none", "Endoscopic healing is a validated endpoint."),
    anchors: ["Crypt stem cell renewal is among the fastest in the body"]
  },
  {
    id: "chondrocyte", name: "Chondrocyte (articular cartilage)", system: "Musculoskeletal", kind: "cell", renewal: "none",
    failures: "Focal defects and diffuse osteoarthritic loss. Avascular, so no repair signal reaches it.",
    see: C("L4", "none", "MRI images cartilage thickness and defects well."),
    model: C("L4", "science", "Hyaline cartilage is a clear target that repair never produces."),
    reach: C("L3", "science", "Avascular: no blood supply to deliver through. Intra-articular injection is the only route."),
    edit: C("L3", "science", "MACI is approved but yields mechanically inferior fibrocartilage, not hyaline."),
    verify: C("L4", "none", "MRI and function scores."),
    anchors: ["MACI, FDA 2016", "Avascularity is the mechanistic blocker"]
  },
  {
    id: "bone-cell", name: "Osteoblast / osteoclast", system: "Musculoskeletal", kind: "cell", renewal: "self-renewing",
    failures: "Osteoporotic imbalance, non-union fracture, osteogenesis imperfecta.",
    see: C("L4", "science", "DEXA measures density, not cell activity; turnover markers are indirect."),
    model: C("L4", "none", "Bone remodelling balance is well understood."),
    reach: C("L4", "none", "Bisphosphonates and denosumab reach and modulate these cells effectively."),
    edit: C("L2", "science", "Pharmacological modulation, not cell repair or replacement."),
    verify: C("L5", "none", "DEXA and fracture incidence are solid endpoints."),
    anchors: ["Denosumab, FDA 2010", "Bone is one of few tissues that truly self-repairs"]
  },
  {
    id: "endothelium", name: "Vascular endothelium", system: "Vascular", kind: "cell", renewal: "limited",
    failures: "Dysfunction preceding atherosclerosis, barrier breakdown, capillary rarefaction with age.",
    see: C("L3", "science", "Function assessed indirectly by flow-mediated dilation; cell state inaccessible."),
    model: C("L3", "science", "Healthy endothelial phenotype is defined by behaviour, not a measurable set-point."),
    reach: C("L4", "none", "The first cells anything intravenous touches."),
    edit: C("L2", "science", "No endothelium-directed cell therapy. Risk factors are managed instead."),
    verify: C("L3", "science", "Functional proxies only."),
    anchors: ["Endothelial dysfunction precedes visible atherosclerosis by decades"]
  },
  {
    id: "fibroblast", name: "Fibroblast", system: "Connective tissue", kind: "cell", renewal: "self-renewing",
    failures: "Fibrosis — the scar response that outcompetes regeneration across heart, lung, liver, kidney and CNS.",
    see: C("L3", "science", "Activated states identifiable in biopsy; no in vivo readout."),
    model: C("L2", "science", "The gap: nobody can specify a healthy fibroblast set-point, only pathological activation."),
    reach: C("L3", "science", "Ubiquitous and non-specific, which makes selective targeting hard."),
    edit: C("L2", "science", "Two antifibrotics slow lung fibrosis. No therapy reverses established scar in any organ."),
    verify: C("L2", "science", "Fibrosis regression is barely measurable in vivo."),
    anchors: ["Nintedanib and pirfenidone slow, never reverse, pulmonary fibrosis"]
  },
  {
    id: "adipocyte", name: "Adipocyte", system: "Metabolic", kind: "cell", renewal: "limited",
    failures: "Hypertrophic dysfunction, ectopic deposition, lipodystrophy, inflammatory secretion.",
    see: C("L5", "none", "MRI and DEXA quantify fat depots precisely and non-invasively."),
    model: C("L3", "science", "Healthy adiposity varies enormously between individuals."),
    reach: C("L3", "science", "Accessible by volume but not specifically targetable."),
    edit: C("L2", "science", "Incretin drugs change mass by changing behaviour and metabolism, not by editing cells."),
    verify: C("L5", "none", "Mass and distribution are easy to measure."),
    anchors: ["GLP-1 agonists act systemically, not on the adipocyte directly"]
  },
  {
    id: "endocrine-cell", name: "Thyroid / adrenal endocrine cell", system: "Endocrine", kind: "cell", renewal: "minimal",
    failures: "Autoimmune destruction, nodular disease, adrenal insufficiency.",
    see: C("L5", "none", "Circulating hormone levels are near-ideal functional proxies."),
    model: C("L5", "none", "Target hormone ranges are well established."),
    reach: C("L2", "science", "Small, deep, diffuse. Not specifically reachable."),
    edit: C("L1", "science", "Nobody repairs these cells. Hormone replacement substitutes the output — permanently."),
    verify: C("L5", "none", "Hormone assays are precise and cheap."),
    anchors: ["Levothyroxine substitutes function without touching the gland"]
  },
  {
    id: "germline", name: "Germline (oocyte / spermatogonium)", system: "Reproductive", kind: "cell", renewal: "sperm only",
    failures: "Age-related oocyte aneuploidy, heritable mutation, infertility.",
    see: C("L4", "none", "Accessible and assessable through assisted reproduction."),
    model: C("L3", "science", "Euploidy is a clear target; the oocyte ageing mechanism is not solved."),
    reach: C("L4", "none", "Ex vivo access is routine in IVF."),
    edit: C("L1", "framework", "Technically demonstrated. Heritable human editing is prohibited nearly everywhere — the clearest framework-blocked row on this map."),
    verify: C("L2", "framework", "Verification would require following a person across a lifetime, which the prohibition forecloses."),
    anchors: ["Heritable genome editing prohibited across most jurisdictions since 2015 consensus"]
  },
  {
    id: "melanocyte", name: "Melanocyte", system: "Skin", kind: "cell", renewal: "limited",
    failures: "Autoimmune loss in vitiligo, malignant transformation to melanoma.",
    see: C("L5", "none", "Directly visible; dermoscopy and biopsy are routine."),
    model: C("L4", "none", "Repigmentation is an unambiguous target."),
    reach: C("L4", "none", "Topical and intralesional access is straightforward."),
    edit: C("L2", "science", "JAK inhibitors modulate the autoimmune driver; melanocytes are not repaired or replaced."),
    verify: C("L5", "none", "Repigmentation is visible and photographable."),
    anchors: ["Ruxolitinib cream for vitiligo, FDA 2022 — treats the driver, not the cell"]
  },
  {
    id: "smooth-muscle", name: "Smooth muscle cell", system: "Vascular / visceral", kind: "cell", renewal: "limited",
    failures: "Phenotype switching in atherosclerosis, airway remodelling, aneurysm wall failure.",
    see: C("L3", "science", "Imaging shows vessel structure, not cell phenotype."),
    model: C("L3", "science", "Contractile versus synthetic phenotype is a spectrum with no clear set-point."),
    reach: C("L3", "science", "Reachable in vessel walls but not selectively."),
    edit: C("L2", "science", "No cell-directed therapy; stents and drugs address consequences."),
    verify: C("L3", "science", "Structural imaging only."),
    anchors: ["Smooth muscle phenotype switching drives plaque instability"]
  },

  /* ---- the six non-cellular nodes ---- */
  {
    id: "extracellular-matrix", name: "Extracellular matrix", system: "Cross-cutting", kind: "non-cell", renewal: "slow turnover",
    failures: "Collagen crosslinking with age, basement membrane failure, scar deposition, elastin loss that never regenerates.",
    see: C("L3", "science", "Histology on biopsy; almost nothing in a living person."),
    model: C("L2", "science", "No specification exists for healthy matrix composition by tissue and age."),
    reach: C("L2", "science", "Acellular and secreted — there is no cell to target for most of it."),
    edit: C("L1", "science", "Crosslink breakers have repeatedly failed. Elastin is not replaced after development."),
    verify: C("L2", "science", "Barely measurable in vivo."),
    anchors: ["Elastin synthesis largely ceases after adolescence"]
  },
  {
    id: "tissue-architecture", name: "Tissue architecture", system: "Cross-cutting", kind: "non-cell", renewal: "none",
    failures: "Alveolar destruction, nephron loss, cortical disorganisation. A 3-D pattern that cells do not re-derive alone.",
    see: C("L4", "none", "Imaging shows architecture well — this is what CT and MRI are for."),
    model: C("L2", "science", "Positional information is the thing an axolotl has and we lack."),
    reach: C("L1", "science", "You cannot deliver to a pattern."),
    edit: C("L1", "science", "Organoids self-organise in vitro at millimetre scale. Nothing rebuilds architecture in a human."),
    verify: C("L3", "science", "Imaging can confirm structure if it were ever restored."),
    anchors: ["Organoid self-organisation, in vitro only", "Axolotl positional memory literature"]
  },
  {
    id: "neural-connectivity", name: "Neural connectivity", system: "Brain", kind: "non-cell", renewal: "plasticity only",
    failures: "Disconnection from stroke and trauma, synaptic loss in dementia, maladaptive rewiring in chronic pain.",
    see: C("L3", "science", "Full connectomes exist only post-mortem. Living imaging is orders of magnitude too coarse."),
    model: C("L1", "science", "The hardest cell on this grid: a healthy connectome is the person, so the target state is the identity."),
    reach: C("L2", "science", "Deep brain stimulation modulates activity; it does not rewire."),
    edit: C("L1", "science", "No human wiring has been deliberately restored. Rehabilitation exploits existing plasticity."),
    verify: C("L2", "science", "Behaviour is the only readout, and it is confounded."),
    anchors: ["Deep brain stimulation modulates circuits without rewiring them"]
  },
  {
    id: "immune-memory", name: "Immune memory", system: "Immune", kind: "non-cell", renewal: "dynamic",
    failures: "Autoimmune memory that will not forget, allergic sensitisation, immunosenescence, vaccine non-response with age.",
    see: C("L4", "none", "Repertoire sequencing reads the whole memory from a blood draw — unusually good visibility."),
    model: C("L2", "science", "No specification of a healthy repertoire beyond statistical description."),
    reach: C("L3", "science", "Distributed across the body with no single location to target."),
    edit: C("L3", "science", "Allergen immunotherapy retrains it slowly. Autoimmune tolerance induction remains unreliable."),
    verify: C("L3", "science", "Repertoire shifts measurable; clinical meaning uncertain."),
    anchors: ["Oral immunotherapy for peanut allergy, FDA 2020 — partial, slow, reversible"]
  },
  {
    id: "mineralised-structure", name: "Mineralised structure", system: "Musculoskeletal / dental", kind: "non-cell", renewal: "bone only",
    failures: "Osteoporotic loss, enamel erosion that never regenerates, non-union fractures.",
    see: C("L5", "none", "DEXA and CT quantify mineral directly."),
    model: C("L4", "none", "Density and microarchitecture targets are established."),
    reach: C("L4", "none", "Bone-seeking agents localise well."),
    edit: C("L2", "science", "Bone remodels and can be pharmacologically shifted. Enamel is never regenerated once lost."),
    verify: C("L5", "none", "DEXA and fracture rates."),
    anchors: ["Enamel is acellular and has no regenerative capacity in humans"]
  },
  {
    id: "microbiome", name: "Microbiome", system: "Cross-cutting", kind: "non-cell", renewal: "self-renewing",
    failures: "Dysbiosis after antibiotics, loss of diversity, C. difficile overgrowth. Not human cells at all.",
    see: C("L5", "none", "Metagenomic sequencing of stool is cheap and comprehensive."),
    model: C("L2", "science", "Nobody can specify a healthy microbiome; it varies enormously between healthy people."),
    reach: C("L5", "none", "Oral and rectal routes reach it directly."),
    edit: C("L4", "none", "Faecal transplant products approved 2022–23 for recurrent C. difficile. Crude but effective."),
    verify: C("L4", "none", "Engraftment measurable by sequencing; clinical endpoints clear for C. diff."),
    anchors: ["Rebyota, FDA 2022", "Vowst, FDA 2023"]
  }
];

const CAPS = ["see", "model", "reach", "edit", "verify"];

let n = 0;
for (const d of NODES) {
  const rec = {
    id: d.id,
    name: d.name,
    system: d.system,
    kind: d.kind,
    renewal: d.renewal,
    failures: d.failures,
    capabilities: Object.fromEntries(CAPS.map((k) => [k, d[k]])),
    anchors: d.anchors,
    review: "ai-proposed",
    lastChecked: "2026-07-28"
  };
  fs.writeFileSync(path.join(out, d.id + ".json"), JSON.stringify(rec, null, 2) + "\n");
  n++;
}
console.log(`  seeded ${n} nodes into records/cells/`);
