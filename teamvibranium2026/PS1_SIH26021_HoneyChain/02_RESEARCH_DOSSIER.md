# SIH26021 — Research Dossier (R&D fuel for the PPT & pitch)

> Every number below is citable. Use them in the deck — quantified problems win.

## 1. The honey economy (headline numbers)

| Stat | Value | Source |
|---|---|---|
| India's honey production | **~1.4 lakh MT in 2024** (up from 80,530 MT in 2014-15 → 1,51,690 MT est. 2025-26) | MoA&FW / PIB Nov 2025 |
| Global rank in honey export | **#2 in the world** (was #9 in 2020), after China | APEDA-CRISIL dashboard, Jul 2025 |
| Exports FY2024-25 | **1,00,773 MT worth $206.47M** | DGCIIS via APEDA |
| Major buyers | USA, UAE, Saudi Arabia, Portugal, Libya | DGCIIS |
| Top producing states | UP 17%, WB 16%, Punjab 14%, Bihar 12%, Rajasthan 9% | MoA&FW |
| NBHM budget | ₹500 crore Central Sector Scheme (2020-21 → 2025-26) via National Bee Board | PIB |
| Madhukranti registrations | 16,788 beekeepers · 24,94,101 colonies · 269 societies · 150 firms · 206 companies (Oct 2025) | Lok Sabha Q&A AU3784, 2026 |
| Beekeeper FPOs formed | 97 of 100 allotted (TRIFED 14, NAFED 60, NDDB 26) | NBB |
| Export floor price | MEP $1,400/MT extended till **31 Dec 2026** | DGFT notification Apr 2026 |
| Infra built under NBHM | 7 world-class testing labs, 66 mini adulteration labs, 83 processing units, 90 collection-branding-packaging units | Lok Sabha Q&A |

## 2. The trust crisis (why traceability matters)

- **CSE study (Dec 2020):** most major Indian honey brands failed the NMR (Nuclear Magnetic Resonance) test for adulteration — sold "honey" that was sugar-syrup spiked. Exports to EU were previously rejected over ethylene oxide contamination.
- Adulteration with rice/corn syrup is invisible to traditional tests but detectable by NMR/TLC — labs exist now (NBHM built them), but the **chain-of-custody proving where honey came from does not reach the consumer**.
- US/EU importers demand batch-level provenance after repeated alerts; a single contaminated-lot scandal hits thousands of small beekeepers who did nothing wrong.
- Result: honest beekeepers get commodity prices; fraudsters capture the margin. Traceability = income justice.

## 3. Stakeholder map

| Actor | Pain | What HoneyChain gives them |
|---|---|---|
| Small beekeeper (~65% operate <10 boxes) | No price premium for pure honey, paper registers, disease losses | Digital hive logbook, harvest certificates, QR-linked premium price proof |
| FPO/society (97 under NBHM) | Manual aggregation, no batch visibility, quality disputes at collection center | Batch aggregation app, member ledger, payout transparency |
| MSME processor/packer | Compliance paperwork, recall risk, brand trust deficit | Immutable processing records, one-click compliance reports, branded QR |
| Exporter/APEDA | Rejection risk abroad, provenance audits | Verifiable export dossiers per lot |
| Consumer | Cannot verify "pure" claim | Scan jar QR → farm-to-jar journey + lab results |
| Government/NBB | Madhukranti has registration but weak last-mile verification | Extension layer with analytics + consumer trust loop |

## 4. Competitive/existing solutions gap table (put this EXACT table in the PPT)

| Capability | Madhukranti portal | Private ERP tools | **HoneyChain (ours)** |
|---|---|---|---|
| Actor registration & IDs | Yes | Partial | Integrates/imports |
| Tamper-proof chain of custody | Registration-level only | DB-only (editable) | Permissioned blockchain ledger |
| Consumer-facing QR verification | No | Rare | Yes — scan-to-story |
| Smart beekeeping management (hive health, harvest, disease alerts) | No | Generic farm apps only | Purpose-built module |
| Offline-first for rural areas | No | No | Yes |
| AI adulteration-risk flags along the chain | No | No | Yes |
| Local-language voice UI | No | No | Yes |

## 5. Technology landscape notes (for R&D girls)

- **Ledger choice:** Hyperledger Fabric (permissioned, no crypto hype, industry standard for supply chains — used by Walmart/IBM Food Trust) vs Polygon (public, easier demo). Recommendation: Fabric for pitch credibility, or Polygon PoA testnet if team velocity favors it. Decide by end of W2.
- **QR standard:** GS1 Digital Link format on jars → scans resolve to provenance page.
- **IoT (optional module):** hive weight/temp/humidity sensors exist commercially (~₹3–5k/node); we demo with simulated telemetry feeding anomaly alerts (swarming prediction from weight-drop patterns).
- **AI angle:** yield prediction per apiary (flora calendar + weather), disease risk score (varroa/american foulbrood seasonality models), adulteration-risk flag when batch dilution ratios look anomalous between collection and packing weights.
- **Standards:** FSSAI honey labeling norms; APEDA export documentation; BIS for honey (IS 4941).

## 6. Impact math (memorize these)

- If QR-verified honey earns even ₹50/kg premium on 1.4 lakh MT national production → ₹700 crore/year value shift toward honest producers.
- A 10-box beekeeper produces ~40–60 kg/year; ₹50/kg premium ≈ ₹2,000–3,000 extra annual income per household (+15–25%).
- Women empowerment: NBHM explicitly targets women through beekeeping — highlight SHG/FPO women-led demos.
