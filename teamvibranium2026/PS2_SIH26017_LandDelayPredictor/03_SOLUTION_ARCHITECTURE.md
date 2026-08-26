# SIH26017 — Solution Architecture: "DelayPredictor"

## One-line pitch
*An ML-driven early-warning system that scores every land acquisition case on delay probability weeks ahead, tells the officer WHY, and simulates what fixes it.*

## Architecture

```
[Data Ingest Layer]        [Feature Store]         [ML Core]              [Delivery]
Bhoomi Rashi-style     →  40+ features per    →  XGBoost stage-wise   →  Officer dashboard
project pipeline          parcel/project:        delay classifiers +     (React, role-based)
State land records        stage age vs clock,    survival analysis       WhatsApp/SMS alerts
(mutation status)         docs completeness,     (time-to-breach)        Field-officer app
NJDG litigation feed      claimant count,        SHAP explainability     Weekly at-risk digest
Compensation ledger       payment lag, court                             What-if simulator
SIA/public-hearing        cases, objections,                    ← Model monitor + drift
records                   staff workload, monsoon                  retrain pipeline
```

## Prediction targets
1. **P(breach)** — probability the next statutory deadline is breached (per Sec.11→award→payment stage)
2. **Time-to-event** — expected weeks to completion via survival models
3. **Top-3 drivers** — SHAP values rendered as human sentences ("compensation pending 7 months + 2 active writs")

## Feature engineering starters
- Stage-age ratio (elapsed ÷ statutory limit) — strongest single signal
- Document completeness score of title chain
- # claimants, # disputes, mutation pending flag
- Compensation amount percentile for district (outliers attract litigation)
- Court-case count & type mix from NJDG-pattern data
- SIA objection density; hearing-to-notification gap
- District staff-per-pending-case load; monsoon seasonality

## Data strategy (be honest & rigorous)
- **Real anchors:** published LARR timelines, Bhoomi Rashi public progress patterns, NJDG aggregates, research-study distributions
- **Synthetic engine:** generate 5,000+ realistic acquisition cases with correlated features + realistic breach labels (documented methodology = a scoring plus, not minus)
- **Swap-in design:** clean adapters so govt can plug real feeds later without model changes

## Tech stack
| Layer | Choice |
|---|---|
| ML | Python, scikit-learn/XGBoost/lifelines (survival), SHAP |
| API | FastAPI |
| Frontend | React + Recharts dashboards, Tailwind |
| Alerts | WhatsApp Business API mock / SMS gateway stub + email |
| DB | PostgreSQL + Redis cache |
| App (field officers) | Flutter reuse from PS1 patterns |
| Deploy | Vercel + Render |

## Screens that win demos
1. **District War-Room map** — parcels colored by risk tier, click → case file
2. **Case 360°** — timeline vs statutory clocks (red zones), SHAP "why" panel
3. **What-if console** — toggle "assign surveyor" / "fast-track compensation" → P(breach) drops live
4. **Weekly digest preview** — auto-generated top-20 at-risk list with owner assignments
