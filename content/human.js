/* Human-layer copy. Written by ChatGPT rules-first under in-c0/writing-skill (project thread, 2026-09-13),
   grounded in the graph snapshot 2026-09-11. The research layer keeps the exact vocabulary; this file says
   what a person needs to understand first. Stage states are per journey; "stop" is where the data says the path ends. */
window.HRM_HUMAN = {
 "entrance": {
  "question": "A map of how close we are to repairing the human body.",
  "choose": "Choose where to begin",
  "both": "Both are views of the same evidence graph. Follow any path until current science stops.",
  "journeys": {
   "repair": {
    "title": "Repair damage",
    "scope": "Trauma, cancer, organ failure, neurological injury",
    "lead": "Start with something going wrong in the body and follow how far current repair methods can take it."
   },
   "aging": {
    "title": "Reverse biological aging",
    "scope": "Regenerative capacity, tissue age, cellular state",
    "lead": "Start with the changes that come with age and follow how far current repair methods can take them."
   }
  },
  "reviewed": "0 of 326 records have been checked by a human researcher. The sources were found automatically and still need human review.",
  "footnote": "Research state only. Not a clinical tool.",
  "intro": "Injuries, infections, cancers, failing organs, and the changes that come with age each need a set of things medicine has to be able to do. This map shows which of those things exist today, how well each has been shown to work, and where the science stops. Every claim links to its evidence and says whether a human has checked it.",
  "aim": "The long-term aim is repair for any damage, for anyone. This map is how far the science has got, and what is still missing, laid out so that researchers and AI models can work on it."
 },
 "stages": [
  {
   "id": "see",
   "title": "Understand what changed",
   "ask": "What exactly has been damaged?"
  },
  {
   "id": "model",
   "title": "Know what healthy should look like",
   "ask": "What should healthy tissue look like?"
  },
  {
   "id": "reach",
   "title": "Reach the right place",
   "ask": "Can we reach the right cells?"
  },
  {
   "id": "edit",
   "title": "Repair or replace it",
   "ask": "Can we restore what was lost?"
  },
  {
   "id": "verify",
   "title": "Verify the result",
   "ask": "Did the repair actually work?"
  },
  {
   "id": "control",
   "title": "Keep it stable",
   "ask": "Will it stay safe and stable?"
  }
 ],
 "journeys": {
  "repair": {
   "opening": "Start with something going wrong in the body: a deep wound, an infection, a tumour, a damaged organ, a spinal injury. The question is how much of that damage we can understand, reach and repair today.",
   "frame": "The first worked example is adult skin after injury because it lets us compare things medicine already does well with the parts of scarless regeneration that are still missing.",
   "states": {
    "see": "Doctors can already assess wound depth, blood flow and infection in a living patient, with independently replicated human evidence. We do not yet have a graded capability for measuring fibroblast state directly inside a living human wound.",
    "model": "Early-gestation human skin can heal without a scar, so scarless human skin repair exists biologically. Adult spiny mice can regenerate skin with much less scarring, but that evidence is still at the rodent rung.",
    "reach": "Some targeted delivery already works in people, including topical gene delivery to keratinocytes. Delivering a payload to one chosen cell type throughout an entire tissue has human evidence from one group and is still blocked by science.",
    "edit": "We can replace lost epidermis and close some difficult wounds in people, and gene-corrected stem-cell epidermis has been rebuilt in humans. Restoring dermis, hair follicles, native matrix, blood vessels, fat and sensation without scar is still mostly at dish or rodent level, with some parts only at the idea stage.",
    "verify": "We can check skin repair with histology and validated scar scales in people. That part of the path has independently replicated human evidence.",
    "control": "We already know how to stop bleeding, restore a temporary barrier, and prevent or treat acute wound infection in people. Synthetic injectable haemostasis is at the rodent rung here, and clearing an established biofilm from a chronic wound is still ungraded."
   },
   "stop": "edit",
   "blocked": {
    "headline": "This is currently blocked.",
    "explain": "Adult skin can already be closed, covered and partly reconstructed in people. The missing step is restoring the full tissue, including dermis, appendages, vessels, fat, matrix and sensation, without leaving a scar. Most of those regenerative capabilities are still at the rodent or dish rung, and remodelling an established scar into native dermis is only at the idea rung in this graph.",
    "change": "What would change this?"
   },
   "headline": "To repair damage, six things have to work together."
  },
  "aging": {
   "opening": "Aging changes many parts of a tissue at once. To reverse it safely, we need to know what has changed, decide what a younger healthy state should be, reach the right cells, change them, and then check that the result lasts.",
   "frame": "The worked example stays with skin because the same tissue lets us compare known human repair with the much earlier evidence for rejuvenation and regeneration.",
   "states": {
    "see": "We still do not have a graded capability for reading fibroblast state directly inside a living human wound. That leaves an important part of the local aging state poorly measured in this example.",
    "model": "Rodent studies show that cells can be pushed toward a younger state while keeping their identity in some settings. Human fetal skin and the regenerative skin of spiny mice also show that very different repair states are biologically possible, but they do not tell us how to recreate them safely in an adult person.",
    "reach": "There is human evidence that payloads can reach chosen cells in some settings, but broad selective delivery throughout a tissue is still blocked by science. For rejuvenation, reaching tissues beyond relatively tractable organs such as the eye and liver remains an open problem.",
    "edit": "In animals, some interventions can reset measures of epigenetic age in living tissue. The wider job of rebuilding aged skin with native dermis, appendages, vessels, matrix, fat and nerves is still mostly between the idea and rodent rungs.",
    "verify": "We can verify tissue structure with histology in people. We do not yet have a graded capability showing that a rejuvenated state can be maintained or safely repeated over time.",
    "control": "The cancer risk of rejuvenating tissue is still ungraded in this map. It remains an open safety question for repeated or widespread use."
   },
   "stop": "edit",
   "blocked": {
    "headline": "This is currently blocked.",
    "explain": "We can change some age-related cell states in animals, but we cannot yet restore an aged human tissue to a younger state with its structure and function intact. Most of the regeneration capabilities needed for that are still at the idea, dish or rodent rungs, and resetting epigenetic age in living tissue is still rodent evidence.",
    "change": "What would change this?"
   },
   "alsoOpen": "Keeping a rejuvenated state stable and safe is still open too. The cancer-risk capability has not been graded yet.",
   "headline": "To reverse biological aging, the same six things have to work together."
  }
 },
 "research": {
  "ranking": "Some unanswered questions hold up several kinds of repair at once. Those are the ones we show first.",
  "unreviewed": "No researcher has checked this record yet. The sources were found automatically. A human still needs to open them and check that we represented the evidence correctly.",
  "enterResearch": "View this in the research layer",
  "backHuman": "Back to the plain explanation"
 }
};
