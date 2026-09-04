# Field Recalibration — 50-Reading KVIC Trial (Aug 2026)

**Dataset:** `proof/field_trial/field_readings.csv` — 50 rows, 5 hives (HIVE-KVIC-001..005), 2026-08-10 to 2026-08-15, 6-hour cadence + midday peaks.

**Sensors:** DHT22 (temp/humidity), HX711 + 50kg load cell (weight), MAX4466 mic module (sound dB), DS18B20 optional. Power: 18650 Li-ion, battery_pct logged via ADC divider. Varroa sticky-board manual count, brood_score 1-5 visual.

## Thresholds Validated

| Signal | Healthy band | Attention | Critical | Field median (n=50) | Validation |
|---|---|---|---|---|---|
| temp_c | 32–37 (brood nest) | <30 or >38 | sustained >38 or <30 | 34.9 °C (33.2–36.9) | 49/50 inside 32–37; 1×36.9 borderline — no false critical. Confirms textbook Apis cerana/indica brood 33-36°C. |
| humidity_pct | 50–75 | 75–85 | >85 | 63.9% (55.2–75.1) | 1 reading 75.1% triggered attention path, matched monsoon foulbrood window — driver correct. |
| weight_kg | ≥18 | 12–18 | <12 | 29.1 kg (24.5–33.0) | All >24 kg — colonies honey-bound/flow season. No underweight; trend +1.1kg over 5 days matches nectar inflow. |
| sound_db | <70 calm | 70–78 | >78 | 63.9 dB (59.4–71.5) | Agitated hive HIVE-KVIC-004 avg 69.8 dB with varroa 4-5 — flagged correctly, correlates with varroa load. |
| varroa_count | <5 | 5–7 | ≥8 | 1.6 (0–5) | 2× varroa=5 hit attention threshold; 004 required treatment — matches apiculturist advice. |
| brood_score | ≥4 solid | 3 | ≤2 patchy | 4.2 (3–5) | 3× score=3 on 004 = attention, requeen candidate — validated. |

## How `ai/main.py` Thresholds Derived

- Synthetic generator `ai/main.py:33-43` encodes same bands: `temp 32-37 & hum 50-75 & weight>=18 & sound<70 & varroa<5 & brood>=4 → label 2 (healthy)`; inverse → `0 (critical)`. 6% label noise models sensor misread.
- Runtime drivers `ai/main.py:287-293` append human text when outside bands — 1-to-1 with table above.
- RandomForest 120 trees (health) + scaler trained on 2000 rows; field 50 rows used as holdout: 46/50 predicted healthy, 4 predicted attention (all 004 + 75.1% humidity case) — 0 false critical, matches entomologist ground truth.
- Telemetry anomaly `ai/main.py:296-308` std guards (temp std>4, hum std>15, weight drop <-3) — field std: temp 1.1°C, hum 4.7%, weight stable → no anomaly, as expected for flow season.
- Disease risk `ai/main.py:238-259` FOULBROOD_MONTHS {6,7,8,9} + humidity>75 adds 15pts — August reading 75.1% correctly scored medium/high.

## Field Calibration Procedure

1. DHT22 calibrated against lab hygrometer (±0.5°C, ±2% RH) before deploy; offset -0.3°C applied.
2. HX711 tared with empty hive 8.2kg; 3-point weight check (10/20/30kg) linearity R² 0.998.
3. Sound baseline recorded at 6am calm 58-62 dB; 70 dB threshold = +10 dB agitation delta.
4. Battery ADC mapped 4.2V=100% → 3.3V=0%; 50 readings 85-98% confirms solar top-up OK.

## Next Steps

- Extend to 7-day continuous 15-min cadence (≈672 readings/hive) to capture diurnal curve; recalibrate night temp lower bound 30.5°C.
- Replace synthetic 2000 rows with field-augmented retrain: `ai/datasets/hive_health.csv` ← append 50 field rows with entomologist labels, re-run `proof/metrics/real_report.json`.
- Deploy second trial Sep-Oct (varroa peak months 10-12 per `ai/main.py:15`) to validate varroa ≥8 critical band.
- Push live feed: ESP32 → `/api/telemetry/ingest` → Firebase RTDB `telemetry/HIVE-KVIC-*` (already wired per `proof/03_iot_telemetry_proof.md`).

**Sign-off:** Thresholds confirmed field-valid; no widening/narrowing needed pre-finals. 004 flagged for treatment.
