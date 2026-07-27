/* Resolved citations.
   Every source below was located against PubMed / Crossref / the issuing agency
   on 2026-07-27 and its metadata checked against what the record claims.

   IMPORTANT DISTINCTION, and the reason this file exists separately:
   "resolved" means THE SOURCE EXISTS AND ITS METADATA MATCHES. It does NOT mean
   a human has read the paper and confirmed it supports the claim. Claim-level
   review state stays `ai-proposed` until a person opens the source. Conflating
   the two would be exactly the failure this map is built to avoid. */
window.HRM_CITATIONS = {
  resolvedOn: "2026-07-27",
  note: "Resolved = the source exists and its metadata matches. Not the same as a human having read it and confirmed it supports the claim.",

  map: {
    "Deverman et al., Nat Biotechnol, 2016": { t: "Cre-dependent selection yields AAV variants for widespread gene transfer to the adult brain", j: "Nat Biotechnol 34(2):204-209", doi: "10.1038/nbt.3440", pmid: "26829320" },
    "Chan et al., Nat Neurosci, 2017": { t: "Engineered AAVs for efficient noninvasive gene delivery to the central and peripheral nervous systems", j: "Nat Neurosci 20(8):1172-1179", doi: "10.1038/nn.4593", pmid: "28671695" },
    "Hordeaux et al., Mol Ther, 2018": { t: "The Neurotropic Properties of AAV-PHP.B Are Limited to C57BL/6J Mice", j: "Mol Ther 26(3):664-668", doi: "10.1016/j.ymthe.2018.01.018", pmid: "29428298" },
    "Hordeaux et al., Mol Ther, 2018/2019": { t: "Strain limitation (2018) and the LY6A mechanism (2019)", j: "Mol Ther 26(3):664-668 and 27(5):912-921", doi: "10.1016/j.ymthe.2019.02.013", pmid: "30819613" },
    "Hordeaux et al., Mol Ther, 2019": { t: "The GPI-Linked Protein LY6A Drives AAV-PHP.B Transport across the Blood-Brain Barrier", j: "Mol Ther 27(5):912-921", doi: "10.1016/j.ymthe.2019.02.013", pmid: "30819613" },
    "Liguore et al., Mol Ther, 2019": { t: "AAV-PHP.B Administration Results in a Differential Pattern of CNS Biodistribution in Non-human Primates Compared with Mice", j: "Mol Ther 27(11):2018-2037", doi: "10.1016/j.ymthe.2019.07.017", pmid: "31420242", n: "Rhesus macaque. CSF arms were intra-cisterna magna and intra-lateral ventricle; the abstract itself calls these intrathecal." },
    "Huang et al., Science, 2024": { t: "An AAV capsid reprogrammed to bind human transferrin receptor mediates brain-wide gene delivery", j: "Science 384(6701):1220-1227", doi: "10.1126/science.adm8386", pmid: "38753766" },
    "Thomsen et al., Nat Med, 2021": { t: "Biodistribution of onasemnogene abeparvovec DNA, mRNA and SMN protein in human tissue", j: "Nat Med 27(10):1701-1711", doi: "10.1038/s41591-021-01483-7", pmid: "34608334" },
    "Wang et al., Nat Mater, 2025": { t: "Blood-brain-barrier-crossing lipid nanoparticles for mRNA delivery to the central nervous system", j: "Nat Mater 24(10):1653-1663", doi: "10.1038/s41563-024-02114-5", pmid: "39962245", n: "DOI carries a 2024 stem: accepted 2024, published online Feb 2025. Not an error." },
    "Sayour et al., Cell, 2024": { t: "RNA aggregates harness the danger response for potent cancer immunotherapy", j: "Cell, 9 May 2024", doi: "10.1016/j.cell.2024.04.003", pmid: "38697107", corrected: "Mendez-Gomez et al. (Sayour lab), Cell, 2024", n: "First author is Mendez-Gomez; Sayour is senior author. Cited here under the senior author — corrected." },
    "Ramos et al., J Clin Invest, 2019": { t: "Age-dependent SMN expression in disease-relevant tissue and implications for SMA treatment", j: "J Clin Invest 129(11):4817-4831", doi: "10.1172/JCI124120", pmid: "31589162", n: "Distribution data are a component of the paper, not its titled subject." },
    "Lancet Neurol, 2023 (open-label extension)": { t: "Safety and efficacy of cerliponase alfa in children with CLN2 disease: an open-label extension study", j: "Lancet Neurol 23(1):60-70", doi: "10.1016/S1474-4422(23)00384-8", pmid: "38101904", corrected: "Schulz et al., Lancet Neurol, 2024 (online Dec 2023)", n: "Version of record is 2024; online-first Dec 2023." },
    "Front Neurol, 2025 (real-world)": { t: "Real-world clinical outcomes of patients with CLN2 disease treated with cerliponase alfa", j: "Front Neurol 16:1516026", doi: "10.3389/fneur.2025.1516026", pmid: "40162009", n: "Same senior group (Schulz, Hamburg) as the extension study — NOT an independent replication." },
    "Biogen/FDA, 2023": { t: "FDA approves treatment of ALS associated with a mutation in the SOD1 gene", j: "U.S. FDA, accelerated approval 25 Apr 2023", url: "https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-treatment-amyotrophic-lateral-sclerosis-associated-mutation-sod1-gene", n: "URL from domain-restricted search; fda.gov blocks automated fetch, so not confirmed by loading. Needs a manual click-check." },
    "Miller et al., NEJM, 2022 (VALOR)": { t: "Trial of Antisense Oligonucleotide Tofersen for SOD1 ALS", j: "N Engl J Med 387(12):1099-1110", doi: "10.1056/NEJMoa2204705", pmid: "36129998", n: "The Phase 3 that missed its primary endpoint (ALSFRS-R) while lowering CSF SOD1 and plasma NfL." },
    "Tai et al., Mol Ther, 2022": { t: "Long-term efficacy and safety of eladocagene exuparvovec in patients with AADC deficiency", j: "Mol Ther 30(2):509-518", doi: "10.1016/j.ymthe.2021.11.005", pmid: "34763085" },
    "Pearson/Bankiewicz et al., Nat Commun, 2021": { t: "Gene therapy for AADC deficiency by MR-guided direct delivery of AAV2-AADC to midbrain dopaminergic neurons", j: "Nat Commun 12(1):4251", doi: "10.1038/s41467-021-24524-8", pmid: "34253733", n: "Same indication (AADC deficiency, n=7 children), different anatomical target (SNc/VTA vs putamen) and different product, unaffiliated group." },
    "FDA approval, 2026": { t: "FDA Approves Drug to Treat Neurologic Manifestations of Hunter Syndrome", j: "U.S. FDA, accelerated approval 25 Mar 2026 (tividenofusp alfa)", url: "https://www.fda.gov/news-events/press-announcements/fda-approves-drug-treat-neurologic-manifestations-hunter-syndrome", n: "CSF heparan sulfate: 91% mean decrease at week 24, n=44. URL not confirmed by loading (fda.gov blocks automated fetch) — needs a manual click-check." },
    "Okuyama et al., Mol Ther, 2021": { t: "A Phase 2/3 Trial of Pabinafusp Alfa, IDS Fused with Anti-Human Transferrin Receptor Antibody, Targeting Neurodegeneration in MPS-II", j: "Mol Ther 29(2):671-679", doi: "10.1016/j.ymthe.2020.09.039", pmid: "33038326", n: "The Japanese phase 2/3 (n=28). A sibling Brazil phase 2 paper exists in the same journal and year." },
    "Klein et al., Alzheimers Dement, 2025": { t: "Interim biomarker results for trontinemab, a novel Brainshuttle antibody", j: "Alzheimers Dement 21(Suppl 5):e70859 — AAIC 2025 conference abstract", doi: "10.1002/alz70859_104288", n: "CONFERENCE ABSTRACT, not a peer-reviewed article. No PMID exists. The low-ARIA claim comes from companion abstracts, not this one." },
    "Grimm et al., mAbs, 2023": { t: "Delivery of the Brainshuttle amyloid-beta antibody fusion trontinemab to non-human primate brain and projected efficacious dose regimens in humans", j: "mAbs 15(1):2261509", doi: "10.1080/19420862.2023.2261509", pmid: "37823690" },
    "Craft et al. (SNIFF), JAMA Neurol, 2020": { t: "Safety, Efficacy, and Feasibility of Intranasal Insulin for the Treatment of Mild Cognitive Impairment and Alzheimer Disease Dementia", j: "JAMA Neurol 77(9):1099-1109", doi: "10.1001/jamaneurol.2020.1840", pmid: "32568367", n: "289 randomised; primary ITT was the 240-participant device-2 cohort." },
    "Winterdahl et al., EJNMMI Res, 2025": { t: "First-in-human intranasal [13N]oxytocin PET: evaluation of feasibility, biodistribution, and radiation dosimetry", j: "EJNMMI Res 15:137", doi: "10.1186/s13550-025-01329-0", pmid: "41251983" },
    "Alvarez-Erviti et al., Nat Biotechnol, 2011": { t: "Delivery of siRNA to the mouse brain by systemic injection of targeted exosomes", j: "Nat Biotechnol 29(4):341-345", doi: "10.1038/nbt.1807", pmid: "21423189" },
    "Driedonks et al., J Extracell Biol, 2022": { t: "Pharmacokinetics and biodistribution of extracellular vesicles administered intravenously and intranasally to Macaca nemestrina", j: "J Extracell Biol 1(10):e59", doi: "10.1002/jex2.59", pmid: "36591537", n: "EVs WERE detectable in CSF at 30-60 min post-IV; signal dominated by liver/spleen with minimal brain parenchymal accumulation. 'Negative brain uptake' is stronger than the paper's own wording. Erratum: 10.1002/jex2.67." },
    "Lipsman et al., Nat Commun, 2018": { t: "Blood-brain barrier opening in Alzheimer's disease using MR-guided focused ultrasound", j: "Nat Commun 9(1):2336", doi: "10.1038/s41467-018-04529-6", pmid: "30046032" },
    "Woodworth/Lipsman et al., Lancet Oncol, 2025": { t: "Microbubble-enhanced transcranial focused ultrasound with temozolomide for patients with high-grade glioma (BT008NA)", j: "Lancet Oncol 26(12):1651-1664", doi: "10.1016/S1470-2045(25)00492-9", pmid: "41308679" },
    "Monje et al., Nature, 2025": { t: "Intravenous and intracranial GD2-CAR T cells for H3K27M+ diffuse midline gliomas", j: "Nature 637(8046):708-715", doi: "10.1038/s41586-024-08171-9", pmid: "39537919", n: "Distinct from Majzner et al., Nature 2022." },
    "Brown et al., Nat Med, 2024": { t: "Locoregional delivery of IL-13Ra2-targeting CAR-T cells in recurrent high-grade glioma: a phase 1 trial", j: "Nat Med 30(4):1001-1012", doi: "10.1038/s41591-024-02875-1", pmid: "38454126" },
    "Vitanza et al., Nat Med, 2025": { t: "Intracerebroventricular B7-H3-targeting CAR T cells for diffuse intrinsic pontine glioma: a phase 1 trial", j: "Nat Med 31(3):861-868", doi: "10.1038/s41591-024-03451-3", pmid: "39775044" },
    "Kunwar et al. (PRECISE), Neuro-Oncology, 2010": { t: "Phase III randomized trial of CED of IL13-PE38QQR vs Gliadel wafers for recurrent glioblastoma", j: "Neuro Oncol 12(8):871-881", doi: "10.1093/neuonc/nop054", pmid: "20511192" },
    "Whone et al., Brain, 2019": { t: "Randomized trial of intermittent intraputamenal glial cell line-derived neurotrophic factor in Parkinson's disease", j: "Brain 142(3):512-525", doi: "10.1093/brain/awz023", pmid: "30808022" },
    "Sampson et al., J Neurosurg, 2010": { t: "Poor drug distribution as a possible explanation for the results of the PRECISE trial", j: "J Neurosurg 113(2):301-309", doi: "10.3171/2009.11.JNS091052", pmid: "20020841", n: "Only 49.8% of catheters met all positioning criteria; mean penumbra coverage 20.1%." },
    "Capsida community letter, 2026": { t: "Letter to the STXBP1 community on the SYNRGY trial closure", j: "Capsida Biotherapeutics, 11 May 2026", url: "https://capsida.com/stx-community-letter-5-9-2026/", n: "Primary sponsor communication. Trial NCT06983158, terminated; CT.gov reason 'stopping rule met'." },
    "Capsida 2026": { t: "Letter to the STXBP1 community on the SYNRGY trial closure", j: "Capsida Biotherapeutics, 11 May 2026", url: "https://capsida.com/stx-community-letter-5-9-2026/" },
    "FDA 2026": { t: "FDA Approves Drug to Treat Neurologic Manifestations of Hunter Syndrome", j: "U.S. FDA, 25 Mar 2026", url: "https://www.fda.gov/news-events/press-announcements/fda-approves-drug-treat-neurologic-manifestations-hunter-syndrome" },
    "NEJM 2026": { t: "Phase 1/2 study of tividenofusp alfa", j: "N Engl J Med, 2026", n: "Sponsor-run open-label study; peer review is not independent replication." },
    "Tofersen 2023": { t: "FDA accelerated approval, tofersen (Qalsody)", j: "U.S. FDA, 25 Apr 2023", url: "https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-treatment-amyotrophic-lateral-sclerosis-associated-mutation-sod1-gene" },
    "Brineura 2023": { t: "Cerliponase alfa open-label extension", j: "Lancet Neurol 23(1):60-70", doi: "10.1016/S1474-4422(23)00384-8", pmid: "38101904" },
    "Okuyama 2021": { t: "Phase 2/3 trial of pabinafusp alfa", j: "Mol Ther 29(2):671-679", doi: "10.1016/j.ymthe.2020.09.039", pmid: "33038326" },
    "Klein 2025": { t: "Interim biomarker results for trontinemab (AAIC conference abstract)", j: "Alzheimers Dement 21(Suppl 5):e70859", doi: "10.1002/alz70859_104288" },
    "Huang 2024": { t: "An AAV capsid reprogrammed to bind human transferrin receptor", j: "Science 384(6701):1220-1227", doi: "10.1126/science.adm8386", pmid: "38753766" },
    "Wang 2025": { t: "BBB-crossing lipid nanoparticles for mRNA delivery to the CNS", j: "Nat Mater 24(10):1653-1663", doi: "10.1038/s41563-024-02114-5", pmid: "39962245" },
    "Sayour 2024": { t: "RNA aggregates harness the danger response for potent cancer immunotherapy", j: "Cell, 2024", doi: "10.1016/j.cell.2024.04.003", pmid: "38697107", corrected: "Mendez-Gomez et al. (Sayour lab)" },
    "Thomsen 2021": { t: "Biodistribution of onasemnogene abeparvovec in human tissue", j: "Nat Med 27(10):1701-1711", doi: "10.1038/s41591-021-01483-7", pmid: "34608334" },
    "Ramos 2019": { t: "Age-dependent SMN expression in disease-relevant tissue", j: "J Clin Invest 129(11):4817-4831", doi: "10.1172/JCI124120", pmid: "31589162" },
    "Tai 2022": { t: "Long-term efficacy and safety of eladocagene exuparvovec", j: "Mol Ther 30(2):509-518", doi: "10.1016/j.ymthe.2021.11.005", pmid: "34763085" },
    "Lipsman 2018": { t: "BBB opening in Alzheimer's disease using MR-guided focused ultrasound", j: "Nat Commun 9(1):2336", doi: "10.1038/s41467-018-04529-6", pmid: "30046032" },
    "Monje 2025": { t: "Intravenous and intracranial GD2-CAR T cells for H3K27M+ DMG", j: "Nature 637(8046):708-715", doi: "10.1038/s41586-024-08171-9", pmid: "39537919" },
    "Brown 2024": { t: "Locoregional IL-13Ra2 CAR-T in recurrent high-grade glioma", j: "Nat Med 30(4):1001-1012", doi: "10.1038/s41591-024-02875-1", pmid: "38454126" },
    "Vitanza 2025": { t: "Intracerebroventricular B7-H3 CAR T cells for DIPG", j: "Nat Med 31(3):861-868", doi: "10.1038/s41591-024-03451-3", pmid: "39775044" },
    "Kunwar 2010": { t: "Phase III CED of IL13-PE38QQR vs Gliadel wafers", j: "Neuro Oncol 12(8):871-881", doi: "10.1093/neuonc/nop054", pmid: "20511192" },
    "Whone 2019": { t: "Randomized trial of intermittent intraputamenal GDNF", j: "Brain 142(3):512-525", doi: "10.1093/brain/awz023", pmid: "30808022" },
    "Craft 2020": { t: "Intranasal insulin for MCI and Alzheimer disease dementia (SNIFF)", j: "JAMA Neurol 77(9):1099-1109", doi: "10.1001/jamaneurol.2020.1840", pmid: "32568367" },
    "Driedonks 2022": { t: "PK and biodistribution of EVs in Macaca nemestrina", j: "J Extracell Biol 1(10):e59", doi: "10.1002/jex2.59", pmid: "36591537" },
    "Alvarez-Erviti 2011": { t: "Delivery of siRNA to the mouse brain by targeted exosomes", j: "Nat Biotechnol 29(4):341-345", doi: "10.1038/nbt.1807", pmid: "21423189" },
    "Deverman 2016": { t: "Cre-dependent selection yields AAV variants for widespread brain gene transfer", j: "Nat Biotechnol 34(2):204-209", doi: "10.1038/nbt.3440", pmid: "26829320" },
    "Hordeaux 2019": { t: "LY6A drives AAV-PHP.B transport across the blood-brain barrier", j: "Mol Ther 27(5):912-921", doi: "10.1016/j.ymthe.2019.02.013", pmid: "30819613" },
    "Liguore 2019": { t: "AAV-PHP.B differential CNS biodistribution in non-human primates vs mice", j: "Mol Ther 27(11):2018-2037", doi: "10.1016/j.ymthe.2019.07.017", pmid: "31420242" },
    "Biogen/FDA 2023": { t: "FDA accelerated approval, tofersen (Qalsody)", j: "U.S. FDA, 25 Apr 2023", url: "https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-treatment-amyotrophic-lateral-sclerosis-associated-mutation-sod1-gene" },
    "Woodworth/Lipsman 2025": { t: "Microbubble-enhanced transcranial FUS with temozolomide (BT008NA)", j: "Lancet Oncol 26(12):1651-1664", doi: "10.1016/S1470-2045(25)00492-9", pmid: "41308679" },
    "Sampson 2010": { t: "Poor drug distribution as an explanation for the PRECISE results", j: "J Neurosurg 113(2):301-309", doi: "10.3171/2009.11.JNS091052", pmid: "20020841" }
  },

  /* Corrections the resolution pass forced. This is the map's error log —
     published, not quietly patched. */
  corrections: [
    { d: "2026-07-27", sev: "material",
      what: "Brineura is no longer described as independently replicated.",
      why: "The open-label extension (Lancet Neurol) and the real-world cohort (Front Neurol) share a senior author and group (Schulz, Hamburg). Two papers from one group are not an independent replication, and the L5 rung rested on that word." },
    { d: "2026-07-27", sev: "material",
      what: "Trontinemab's supporting citation is a conference abstract, not a peer-reviewed article.",
      why: "Klein et al. 2025 is an AAIC supplement abstract with a DOI but no PMID. The low-ARIA claim comes from companion abstracts, not this source. The record's evidence is weaker than a journal citation implies." },
    { d: "2026-07-27", sev: "minor",
      what: "Exosome record softened from 'negative brain uptake' to 'minimal parenchymal accumulation'.",
      why: "Driedonks et al. did detect EVs in CSF at 30–60 minutes post-IV. The original wording was stronger than the paper's own." },
    { d: "2026-07-27", sev: "minor",
      what: "Author corrected: 'Sayour et al., Cell, 2024' → 'Mendez-Gomez et al. (Sayour lab)'.",
      why: "Sayour is senior author, not first. The first-author form is what a reader would search." },
    { d: "2026-07-27", sev: "minor",
      what: "Year corrected: cerliponase alfa extension study is Lancet Neurol 2024;23(1):60-70.",
      why: "Cited as 2023 from the online-first date. Version of record is 2024." },
    { d: "2026-07-27", sev: "open",
      what: "Two FDA URLs remain unconfirmed by loading.",
      why: "fda.gov blocks automated fetching, so both regulatory links come from domain-restricted search rather than a retrieved page. They need a manual click-check before this record can be called clean." }
  ]
};
