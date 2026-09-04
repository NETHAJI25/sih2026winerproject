# HoneyChain AI Datasets

Generated synthetic-realistic 2000 rows (Kaggle schema) ready for 12k real swap via `proof/datasets/download.sh`.

- `hive_health.csv` 2000 rows — features: temp_c,humidity_pct,weight_kg,sound_db,varroa_count,brood_score + label health_label (0=critical,1=attention,2=healthy), 6% label noise, seed42
- `yield.csv` 2000 rows — features: boxes,flora_factor,season_f,health_f + target yield_kg

Real Kaggle (~12k rows) to swap:
1. bee-hive-health ~4k rows (health-env)
2. varroa-mite-detection ~5k images
3. honey-yield ~3k rows
Run `bash proof/datasets/download.sh` (needs kaggle.json) → replaces these CSVs → `ai/main.py` auto-loads real on next start.
Training: RandomForest 120 trees depth10 (health) + 100 trees depth10 (yield), StandardScaler, 80/20 split metrics in `proof/metrics/real_report.json`.
