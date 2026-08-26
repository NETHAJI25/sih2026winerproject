# SIH26017 — Research Dossier

## 1. The delay problem (citable numbers)

| Stat | Value | Source |
|---|---|---|
| #1 delay cause in Indian highway (HAM) projects | **Land acquisition — RII 0.68, ranked most severe of 35 factors** | IJRASET survey of 384 HAM experts |
| NHAI projects delayed partly due to LA issues | **210+ national highway projects** | MoRTH statement, Rajya Sabha |
| Land acquisition importance for road projects | RII 0.68 vs 0.42 for bridges (sector-critical) | J. Institution of Engineers (India), 2025 |
| Quantified cascade | 16-month LA delay → **454-day project extension**; ~2.3% contract cost overrun (~₹500M/month scale) | ETASR case study, 2025 |
| ML feature-importance rank | "Land Acquisition Time" = **#3 predictor** (16.7%) of infrastructure cost overruns | JIER 2025 ML study |
| Sec.24(2) litigation | Courts routinely declare acquisitions LAPSED when compensation/possession pending >5 yrs → projects restart from zero | IJIRL critical study of LARR Act |

## 2. Root causes of acquisition delays (from literature — becomes your feature list)

1. **Title & records defects** — outdated/disputed land records, missing survey numbers, tenancy claims (tenants/sharecroppers excluded from compensation → disputes)
2. **Compensation disbursement friction** — valuation disputes, bank/payment channel delays, multiple claimants
3. **SIA quality failures** — mechanical assessments, weak public hearings → objections & agitation later
4. **Litigation** — writ petitions, Sec.24(2) lapse cases, injunctions
5. **Consent shortfall** (for private/PPP projects: 80%/70% thresholds)
6. **Institutional capacity** — under-staffed District Land Acquisition Units
7. **Multi-agency coordination** — utility shifting, forest/environment clearances interleaved
8. **Political/social resistance** — displacement anxiety, inadequate R&R

## 3. Government data landscape (what exists to build on)

| System | What it gives |
|---|---|
| Bhoomi Rashi portal (MoRTH) | Live LA progress tracking for NH projects — proof govt wants this; your UI benchmark |
| DILRMP / state land records portals (Bhulekh etc.) | Digitized Record-of-Rights, mutation status |
| ULPIN / Bhu-Naksha | Parcel IDs + cadastral maps (2026 PS list itself has ULPIN PS — alignment!) |
| National Judicial Data Grid | Case pendency stats per court/district |
| PM Gati Shakti NMP | Project pipeline layers |
| LARR-mandated SIA reports | Public hearing outcomes, objections count |

## 4. Gap analysis table (PPT slide 3)

| Capability | Bhoomi Rashi / portals today | **DelayPredictor (ours)** |
|---|---|---|
| Track current status | Yes (descriptive) | Yes + **predictive** |
| Flag at-risk parcels BEFORE breach | No | ML risk scores with lead time |
| Root-cause attribution | No | Per-factor contribution breakdown |
| What-if simulation ("if we add 2 revenue staff…") | No | Scenario engine |
| Farmer-facing transparency | Limited | Status timeline + expected timeline |
| Escalation workflow | Manual | Auto-escalation rules by risk tier |

## 5. Impact math
- India's infrastructure pipeline loses thousands of crores/year to LA-driven overruns (210+ delayed NH projects alone)
- Farmers gain certainty: predicted timelines + faster compensation = less distress; supports SVAMITVA/DILRMP goals
- Officers gain triage power: top-20 at-risk parcels per district each Monday morning
