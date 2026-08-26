# SIH26021 — Official Problem Statement Breakdown

## Raw PS facts

| Field | Value |
|---|---|
| PS ID | **SIH26021** |
| Title | Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management |
| Organization | **Ministry of Micro, Small & Medium Enterprises (MSME)** |
| Theme | Smart Automation |
| Category | **Software** |
| Innovation Scope (CodeHunters scoring) | Moderate |
| Invention Effort (CodeHunters scoring) | **Low Effort** |
| Deadline | 20 Sep 2026 |

## What the ministry actually wants (decode)

Read the title as TWO deliverables fused into one platform:

1. **"Honey traceability"** — an immutable, verifiable chain-of-custody from beekeeper → collection center → processor → packer → exporter/retail shelf. Consumer scans a QR and sees the jar's entire journey.
2. **"Smart beekeeping management"** — a management layer for beekeepers/FPOs: hive records, colony health, apiary locations, harvest logs, disease alerts, yield analytics.

The evaluator for Ministry of MSME will look for: village-level usability, income impact for small beekeepers, alignment with existing government infrastructure (Madhukranti/NBHM/KVIC), and a working end-to-end demo.

## Critical strategic fact: Madhukranti portal already exists

The government already runs **Madhukranti** (madhukranti.in) — NBB's registration + traceability portal with ~16,788 beekeepers and 24.9 lakh colonies registered. NBHM's stated objective (d) is literally *"To develop blockchain/traceability system for source of honey."*

**Do NOT position your solution as "India has no honey traceability" — evaluators know Madhukranti exists and that kills credibility instantly.**

**Correct positioning:** "Madhukranti registers actors and issues IDs. It does not close the loop at the retail jar, does not give consumers verification, does not manage day-to-day apiary operations, and does not flag adulteration risk along the chain. HoneyChain is the execution layer ON TOP of Madhukranti — we consume their registry via API/integration design and extend trust to the last mile."

This "we extend, not replace" framing is the single most important line in your pitch.

## Constraints & gotchas

- Blockchain ≠ cryptocurrency. Judges hate token talk. Use "permissioned distributed ledger / tamper-proof digital audit trail."
- Rural connectivity is patchy → offline-first mobile app is a must-have feature, not nice-to-have.
- Beekeepers are often low-literacy users → voice/local-language UI, icon-driven flows.
- Don't promise IoT hardware deployment; make hive sensors an optional module with simulated data in demo.

## Deliverables expected at finale (standard SIH software bar)

Working web + mobile demo, live QR scan → provenance view, admin/FPO dashboards, ledger explorer showing immutability, local-language UI, pitch deck, demo video.

## Scoring angles to hit (SIH rubric)

1. Problem quantification (₹/$ numbers, adulteration stats) — see 02_RESEARCH_DOSSIER
2. Novelty vs existing solutions (Madhukranti gap table)
3. Feasibility (offline-first, low-cost stack, works on ₹6k Android phones)
4. Impact (income uplift per beekeeper, export quality compliance, women empowerment — NBHM objective h)
5. Scalability (state → national via FPO network; 97 FPOs already formed under NBHM)
