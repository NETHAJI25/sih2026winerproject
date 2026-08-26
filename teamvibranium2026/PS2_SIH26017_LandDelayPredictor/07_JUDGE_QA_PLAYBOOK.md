# SIH26017 — Judge Q&A Playbook

**Q1: "Where did you get government data?"**
A: "We didn't have access, and we won't pretend we did. We built a synthetic-data engine anchored on published distributions — Bhoomi Rashi progress patterns, LARR statutory timelines, NJDG aggregates, and peer-reviewed delay studies. The model adapters swap to real feeds without re-architecture. Methodology is documented on the methodology page."

**Q2: "How accurate is the model on fake data?"**
A: "We report precision/recall with calibration curves and treat it as a baseline proving the signal exists in the features. The contribution is the pipeline + features + workflow; accuracy claims only become meaningful on real data."

**Q3: "Officers already know which cases are delayed."**
A: "They know which ARE delayed. We flag which WILL be — with lead time and the reason. That converts firefighting into triage: top-20 at-risk parcels every Monday, before clocks breach."

**Q4: "Why not just a dashboard?"**
A: "Dashboards describe the past. Three things a dashboard can't do: probability of future breach, ranked causal drivers per case (SHAP), and intervention simulation showing P(breach) drop if you assign a surveyor or fast-track payment."

**Q5: "Privacy of land records?"**
A: "Role-based access mirroring existing revenue-hierarchy permissions; farmer-facing view exposes status only, never ownership documents. DPDP-aligned."

**Q6: "What about states with poor digitization?"**
A: "The system degrades gracefully: fewer digitized fields → model leans on stage-clock ages and manual-entry flags, still outperforming spreadsheets. And that gap is exactly what DILRMP/ULPIN are closing — we're ready for it."

**Q7: "Cost?"**
A: "Standard cloud stack, ₹5–10k/month for a district pilot. No special hardware."

## Rubric mapping
Novelty → predictive vs descriptive | Feasibility → working demo + honest data strategy | Impact → 454-day stat + idle capital | Scalability → ULPIN/DILRMP alignment | Sustainability → SaaS-per-district pricing
