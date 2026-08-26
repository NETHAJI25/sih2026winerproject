# SIH26017 — Official Problem Statement Breakdown

## Raw PS facts

| Field | Value |
|---|---|
| PS ID | **SIH26017** |
| Title | Predictive Analytics System for Early Detection of Land Acquisition Delays |
| Organization | **Ministry of Rural Development** (Dept. of Land Resources domain) |
| Theme | Agriculture, FoodTech & Rural Development |
| Category | **Software** |
| Innovation Scope | Breakthrough |
| Invention Effort | Medium |
| Deadline | 20 Sep 2026 |

## What the ministry actually wants (decode)

India's land acquisition under the **RFCTLARR Act, 2013** is a staged pipeline: Social Impact Assessment (SIA) → Sec.11 preliminary notification → Sec.19 declaration → Sec.30 award → compensation disbursement → possession handover. Each stage has statutory clocks and each one slips — and when it slips, entire infrastructure projects stall.

The ministry wants a system that **predicts which acquisitions/projects will slip BEFORE they do**, using data signals, so officers can intervene early. Deliverables implied:

1. Risk scoring of land acquisition cases/projects at parcel & project level
2. Early-warning alerts with lead time (which case will breach its statutory deadline)
3. Root-cause attribution (WHY: title disputes? compensation pending? litigation? consent shortfall?)
4. Decision-support dashboard for District Collectors / State level committees

## Strategic read

- Ministry of Rural Development issued **14 PS in 2026 (SIH26010–26023 cluster)** — a brand-new block. No team has battle-tested picks here; competition likely spreads thin across 14 topics instead of piling onto one.
- This PS is pure **data + prediction + dashboards** — exactly your DealMind AI / CRM-analytics muscle. Zero hardware, zero blockchain complexity.
- The trap: data access. You cannot get real government pipeline data. Solution = build on a **synthetic-but-realistic dataset modeled from public sources** (Bhoomi Rashi portal patterns, published LARR timelines, court judgments) and say so honestly with methodology.

## Key legal/process facts you MUST know cold (judges test this)

- RFCTLARR Act 2013 replaced the 1894 Act; consent + SIA + R&R are mandatory
- Statutory clocks: award within 12 months of Sec.11 notification (extendable); possession lapse rule **Sec.24(2)** — acquisition lapses if compensation unpaid or possession untaken for 5 years → massive litigation
- Land records digitization: DILRMP programme, ULPIN (Unique Land Parcel ID), Bhu-Naksha
- MoRTH already runs **Bhoomi Rashi portal** tracking NH-project acquisition progress — precedent that govt wants exactly this; Rural Dev wants the predictive layer they don't have

## Positioning line
*"Every month of acquisition delay costs projects ~₹500M and pushes farmers into years of uncertainty. We predict the delay before it happens — parcel by parcel."*
