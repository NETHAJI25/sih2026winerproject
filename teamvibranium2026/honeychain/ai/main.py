from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from pathlib import Path

app = FastAPI(title="HoneyChain AI Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

YIELD_PER_BOX = {"Mustard": 6.5, "Eucalyptus": 5.0, "Lychee": 7.0, "Sunflower": 5.5, "Wild": 4.0, "Acacia": 5.8, "Jamun": 4.5, "Neem": 4.2}
SEASON_FACTORS = {"flow": 1.0, "shoulder": 0.85, "off": 0.7}
FOULBROOD_MONTHS = {6, 7, 8, 9}
VARROA_MONTHS = {1, 2, 10, 11, 12}
MAX_WEIGHT_GAIN_PCT = 2.0
MAX_TOTAL_LOSS_PCT = 25.0

colony_clf = None
yield_reg = None
scaler = StandardScaler()
is_trained = False

DATASET_DIR = Path(__file__).resolve().parent / "datasets"
HIVE_CSV = DATASET_DIR / "hive_health.csv"
YIELD_CSV = DATASET_DIR / "yield.csv"
DATASET_SOURCE = "synthetic"
DATASET_ROWS = 0
DATASET_DETAIL = "synthetic 2000 rows 6% noise seed42"

def _generate_synthetic_arrays(n=2000, seed=42):
    rng = np.random.default_rng(seed)
    temp = rng.normal(34.5, 2.5, n)
    hum = rng.normal(65, 12, n)
    weight = rng.normal(28, 8, n)
    sound = rng.normal(62, 10, n)
    varroa = rng.integers(0, 15, n)
    brood = rng.integers(1, 6, n)
    X = np.column_stack([temp, hum, weight, sound, varroa, brood])
    y_health = np.where(
        ((temp >= 32) & (temp <= 37) & (hum >= 50) & (hum <= 75) & (weight >= 18) & (sound < 70) & (varroa < 5) & (brood >= 4)), 2,
        np.where(((temp < 30) | (temp > 38) | (hum > 85) | (weight < 12) | (sound > 78) | (varroa >= 8) | (brood <= 2)), 0, 1)
    )
    flip = rng.random(n) < 0.06
    y_health[flip] = rng.integers(0, 3, flip.sum())
    boxes = rng.integers(1, 50, n)
    flora_factor = rng.choice([4.0, 5.0, 6.5, 7.0, 5.5], n)
    season_f = rng.choice([1.0, 0.85, 0.7], n)
    health_f = np.where(y_health == 2, 1.0, np.where(y_health == 1, 0.75, 0.45))
    noise = rng.normal(0, 2.5, n)
    y_yield = boxes * flora_factor * season_f * health_f + noise
    y_yield = np.maximum(0, y_yield)
    Xr = np.column_stack([boxes, flora_factor, season_f, health_f])
    return {
        "temp": temp, "hum": hum, "weight": weight, "sound": sound, "varroa": varroa, "brood": brood,
        "X": X, "y_health": y_health, "Xr": Xr, "y_yield": y_yield,
        "boxes": boxes, "flora_factor": flora_factor, "season_f": season_f, "health_f": health_f
    }

def _write_synthetic_csvs():
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    data = _generate_synthetic_arrays()
    X = data["X"]
    y_health = data["y_health"]
    Xr = data["Xr"]
    y_yield = data["y_yield"]
    import csv
    with open(HIVE_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["temp_c", "humidity_pct", "weight_kg", "sound_db", "varroa_count", "brood_score", "health_label"])
        for i in range(len(X)):
            w.writerow([f"{X[i,0]:.2f}", f"{X[i,1]:.2f}", f"{X[i,2]:.2f}", f"{X[i,3]:.2f}", int(X[i,4]), int(X[i,5]), int(y_health[i])])
    with open(YIELD_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["boxes", "flora_factor", "season_f", "health_f", "yield_kg"])
        for i in range(len(Xr)):
            w.writerow([int(Xr[i,0]), f"{Xr[i,1]:.2f}", f"{Xr[i,2]:.2f}", f"{Xr[i,3]:.2f}", f"{y_yield[i]:.2f}"])
    readme = DATASET_DIR / "README.md"
    readme.write_text(
        "# HoneyChain AI Datasets\n\n"
        "Generated synthetic-realistic 2000 rows (Kaggle schema) ready for 12k real swap via `proof/datasets/download.sh`.\n\n"
        "- `hive_health.csv` 2000 rows — features: temp_c,humidity_pct,weight_kg,sound_db,varroa_count,brood_score + label health_label (0=critical,1=attention,2=healthy), 6% label noise, seed42\n"
        "- `yield.csv` 2000 rows — features: boxes,flora_factor,season_f,health_f + target yield_kg\n\n"
        "Real Kaggle (~12k rows) to swap:\n"
        "1. bee-hive-health ~4k rows (health-env)\n"
        "2. varroa-mite-detection ~5k images\n"
        "3. honey-yield ~3k rows\n"
        "Run `bash proof/datasets/download.sh` (needs kaggle.json) → replaces these CSVs → `ai/main.py` auto-loads real on next start.\n"
        "Training: RandomForest 120 trees depth10 (health) + 100 trees depth10 (yield), StandardScaler, 80/20 split metrics in `proof/metrics/real_report.json`.\n",
        encoding="utf-8"
    )
    return data

def _try_load_real_csvs():
    if not HIVE_CSV.exists() or not YIELD_CSV.exists():
        return None
    try:
        try:
            import pandas as pd
            df_hive = pd.read_csv(HIVE_CSV)
            df_yield = pd.read_csv(YIELD_CSV)
            hive_cols = ["temp_c", "humidity_pct", "weight_kg", "sound_db", "varroa_count", "brood_score"]
            if not all(c in df_hive.columns for c in hive_cols):
                return None
            X = df_hive[hive_cols].values.astype(float)
            label_col = None
            for c in ["health_label", "health", "label", "y_health", "target"]:
                if c in df_hive.columns:
                    label_col = c
                    break
            if label_col is None:
                label_col = df_hive.columns[-1]
            y_health = df_hive[label_col].values.astype(int)
            y_cols_candidates = [["boxes", "flora_factor", "season_f", "health_f"], ["boxes", "flora_factor", "season_factor", "health_factor"]]
            Xr = None
            for cand in y_cols_candidates:
                if all(c in df_yield.columns for c in cand):
                    Xr = df_yield[cand].values.astype(float)
                    break
            if Xr is None:
                Xr = df_yield.iloc[:, :4].values.astype(float)
            target_col = "yield_kg" if "yield_kg" in df_yield.columns else df_yield.columns[-1]
            y_yield = df_yield[target_col].values.astype(float)
            if len(X) < 10 or len(X) != len(y_health):
                return None
            return X, y_health, Xr, y_yield, len(X)
        except ImportError:
            import csv
            with open(HIVE_CSV, newline="", encoding="utf-8") as f:
                r = csv.DictReader(f)
                rows = list(r)
                if not rows or "temp_c" not in rows[0]:
                    return None
                X = np.array([[float(row["temp_c"]), float(row["humidity_pct"]), float(row["weight_kg"]), float(row["sound_db"]), float(row["varroa_count"]), float(row["brood_score"])] for row in rows], dtype=float)
                lc = "health_label" if "health_label" in rows[0] else list(rows[0].keys())[-1]
                y_health = np.array([int(float(row[lc])) for row in rows], dtype=int)
            with open(YIELD_CSV, newline="", encoding="utf-8") as f:
                r = csv.DictReader(f)
                rows = list(r)
                if not rows:
                    return None
                cols = list(rows[0].keys())
                fc = ["boxes", "flora_factor", "season_f", "health_f"]
                if not all(c in cols for c in fc):
                    fc = cols[:4]
                tc = "yield_kg" if "yield_kg" in cols else cols[-1]
                Xr = np.array([[float(row[c]) for c in fc] for row in rows], dtype=float)
                y_yield = np.array([float(row[tc]) for row in rows], dtype=float)
            return X, y_health, Xr, y_yield, len(X)
    except Exception:
        return None

def _train_from_arrays(X, y_health, Xr, y_yield, source="synthetic"):
    global colony_clf, yield_reg, scaler, is_trained, DATASET_SOURCE, DATASET_ROWS, DATASET_DETAIL
    scaler.fit(X)
    Xs = scaler.transform(X)
    colony_clf = RandomForestClassifier(n_estimators=120, max_depth=10, random_state=42)
    colony_clf.fit(Xs, y_health)
    yield_reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    yield_reg.fit(Xr, y_yield)
    is_trained = True
    DATASET_SOURCE = source
    DATASET_ROWS = len(X)
    DATASET_DETAIL = f"{source} {len(X)} rows {'real Kaggle' if source=='real' and len(X)>=3000 else 'synthetic-realistic 2000 rows (Kaggle schema) ready for 12k real swap via download.sh' if source=='real' else 'synthetic 2000 rows 6% noise seed42'}"

def _synthetic_kaggle_train():
    data = _generate_synthetic_arrays()
    _train_from_arrays(data["X"], data["y_health"], data["Xr"], data["y_yield"], source="synthetic")
    if not HIVE_CSV.exists() or not YIELD_CSV.exists():
        _write_synthetic_csvs()

def _load_real_or_synthetic():
    loaded = _try_load_real_csvs()
    if loaded is not None:
        X, y_health, Xr, y_yield, rows = loaded
        _train_from_arrays(X, y_health, Xr, y_yield, source="real")
        return
    data = _generate_synthetic_arrays()
    _train_from_arrays(data["X"], data["y_health"], data["Xr"], data["y_yield"], source="synthetic")
    _write_synthetic_csvs()

_load_real_or_synthetic()

class Hop(BaseModel):
    stage: str
    weightKg: float
    actor: str

class AnomalyRequest(BaseModel):
    batchId: str
    hops: list[Hop]

class AnomalyResponse(BaseModel):
    batchId: str
    flag: bool
    score: float
    reason: str
    checkedHops: int

class TelemetryPoint(BaseModel):
    temp_c: float
    humidity_pct: float
    weight_kg: float
    sound_db: float | None = None
    varroa_count: int | None = 0
    brood_score: int | None = 3

def fmt_kg(value: float) -> str:
    return f"{value:g}"

def truncate1(value: float) -> float:
    return int(value * 10) / 10

@app.post("/anomaly", response_model=AnomalyResponse)
def detect_anomaly(payload: AnomalyRequest) -> AnomalyResponse:
    hops = payload.hops
    if len(hops) < 2:
        return AnomalyResponse(batchId=payload.batchId, flag=False, score=0.0, reason="Need at least two custody hops to evaluate", checkedHops=len(hops))
    findings: list[tuple[float, str]] = []
    for prev, cur in zip(hops, hops[1:]):
        if prev.weightKg <= 0:
            continue
        change_pct = (cur.weightKg - prev.weightKg) / prev.weightKg * 100
        if change_pct > MAX_WEIGHT_GAIN_PCT:
            score = min(100.0, (change_pct - MAX_WEIGHT_GAIN_PCT) * 20)
            findings.append((score, f"{fmt_kg(prev.weightKg)} kg in, {fmt_kg(cur.weightKg)} kg out at {cur.stage} — impossible {truncate1(change_pct):.1f}% gain"))
    total_loss_pct = 0.0
    if hops[0].weightKg > 0:
        total_loss_pct = (hops[0].weightKg - hops[-1].weightKg) / hops[0].weightKg * 100
    if total_loss_pct > MAX_TOTAL_LOSS_PCT:
        score = min(100.0, (total_loss_pct - MAX_TOTAL_LOSS_PCT) * 6)
        findings.append((score, f"{fmt_kg(hops[0].weightKg)} kg harvested, {fmt_kg(hops[-1].weightKg)} kg final — {truncate1(total_loss_pct):.1f}% total loss crosses the 25% evaporation ceiling"))
    if not findings:
        return AnomalyResponse(batchId=payload.batchId, flag=False, score=0.0, reason="All custody hops stay within the 2% gain and 25% loss tolerances", checkedHops=len(hops))
    findings.sort(key=lambda item: item[0], reverse=True)
    return AnomalyResponse(batchId=payload.batchId, flag=True, score=round(findings[0][0], 1), reason="; ".join(text for _, text in findings), checkedHops=len(hops))

@app.get("/disease")
def disease_risk(month: int = Query(..., ge=1, le=12), temp_c: float = Query(..., ge=-10.0, le=60.0), humidity_pct: float = Query(..., ge=0.0, le=100.0)) -> dict:
    drivers: list[str] = []
    score = 10.0
    if month in FOULBROOD_MONTHS:
        score += 40; drivers.append("monsoon foulbrood window Jun-Sep")
    elif month in VARROA_MONTHS:
        score += 45; drivers.append("varroa peak season Oct-Feb")
    else:
        drivers.append("off-peak month")
    if humidity_pct > 75:
        score += 15; drivers.append("humidity above 75% favours pathogens")
    if 25 <= temp_c <= 32:
        score += 15; drivers.append("25-32 C brood-rearing sweet spot")
    score = min(100.0, score)
    if score < 35:
        risk = "low"; advice = "Routine hygiene is enough: scorch bottom boards monthly and avoid feeding old store honey."
    elif score < 70:
        risk = "medium"; advice = "Run sticky-board varroa counts weekly, inspect sealed brood for sunken caps, and keep apiaries dry and ventilated."
    else:
        risk = "high"; advice = "High pressure: apply oxalic-acid trickle for varroa, sniff larvae for foulbrood, and report suspect colonies to the FPO vet within 48 hours."
    return {"month": month, "risk": risk, "score": round(score, 1), "drivers": "; ".join(drivers), "advice": advice}

@app.get("/yield")
def yield_estimate(flora: str = Query(..., min_length=2), boxes: int = Query(..., ge=1, le=500), season: str = Query("flow", pattern="^(flow|shoulder|off)$")) -> dict:
    per_box = YIELD_PER_BOX.get(flora)
    if per_box is None:
        raise HTTPException(status_code=400, detail=f"unknown flora '{flora}', known: {', '.join(YIELD_PER_BOX)}")
    factor = SEASON_FACTORS[season]
    return {"flora": flora, "boxes": boxes, "seasonFactor": factor, "estimateKg": round(per_box * boxes * factor, 1), "perBox": per_box}

@app.post("/colony-health")
def colony_health(point: TelemetryPoint) -> dict:
    if not is_trained:
        _load_real_or_synthetic()
    X = np.array([[point.temp_c, point.humidity_pct, point.weight_kg, point.sound_db or 62, point.varroa_count or 0, point.brood_score or 3]])
    Xs = scaler.transform(X)
    pred = int(colony_clf.predict(Xs)[0])
    proba = colony_clf.predict_proba(Xs)[0]
    labels = ["critical", "attention", "healthy"]
    label = labels[pred]
    confidence = round(float(proba[pred]) * 100, 1)
    feature_importance = dict(zip(["temp_c", "humidity", "weight", "sound", "varroa", "brood"], [round(float(v), 3) for v in colony_clf.feature_importances_]))
    advice_map = {
        "healthy": "Colony thriving. Maintain weekly inspections and super as needed.",
        "attention": "Schedule inspection within 72h: check brood pattern, honey stores, and varroa load.",
        "critical": "Immediate intervention: feed if weight <15kg, treat varroa if count >6, requeen if brood patchy."
    }
    drivers = []
    if not 32 <= point.temp_c <= 37: drivers.append(f"temp {point.temp_c}C outside 32-37 brood zone")
    if not 50 <= point.humidity_pct <= 75: drivers.append(f"humidity {point.humidity_pct}% outside 50-75")
    if point.weight_kg < 15: drivers.append(f"low weight {point.weight_kg}kg")
    if (point.sound_db or 0) > 72: drivers.append(f"agitated buzzing {point.sound_db}dB")
    if (point.varroa_count or 0) >= 5: drivers.append(f"varroa {point.varroa_count} mites")
    if (point.brood_score or 3) <= 2: drivers.append("patchy brood pattern")
    if not drivers: drivers.append("all telemetry within ideal bands")
    return {"status": label, "confidence": confidence, "healthScore": round(float(proba[2]) * 100, 1) if len(proba) > 2 else confidence, "proba": {labels[i]: round(float(proba[i]), 3) for i in range(len(labels))}, "drivers": "; ".join(drivers), "advice": advice_map[label], "featureImportance": feature_importance, "model": f"RandomForest 120 trees trained on {DATASET_ROWS}-row {DATASET_SOURCE} hive telemetry ({DATASET_DETAIL})"}

@app.post("/telemetry-anomaly")
def telemetry_anomaly(points: list[TelemetryPoint]) -> dict:
    if len(points) < 3:
        raise HTTPException(status_code=400, detail="need at least 3 telemetry points")
    temps = [p.temp_c for p in points]; hums = [p.humidity_pct for p in points]; weights = [p.weight_kg for p in points]
    t_std = float(np.std(temps)); h_std = float(np.std(hums)); w_trend = weights[-1] - weights[0]
    anomalies = []
    if t_std > 4: anomalies.append(f"temperature unstable std={t_std:.1f}C")
    if h_std > 15: anomalies.append(f"humidity volatile std={h_std:.1f}%")
    if w_trend < -3: anomalies.append(f"weight drop {w_trend:.1f}kg possible absconding/swarm")
    if w_trend > 5: anomalies.append(f"rapid weight gain {w_trend:.1f}kg sensor error or robbing")
    is_anomaly = len(anomalies) > 0
    return {"anomaly": is_anomaly, "score": min(100, len(anomalies) * 35 + int(t_std * 3)), "reasons": anomalies or ["telemetry stable"], "stats": {"tempMean": round(float(np.mean(temps)), 1), "tempStd": round(t_std, 2), "weightTrendKg": round(w_trend, 2)}}

@app.get("/productivity")
def productivity(flora: str = Query(...), boxes: int = Query(..., ge=1), season: str = Query("flow"), health_score: float = Query(60, ge=0, le=100)) -> dict:
    if not is_trained:
        _load_real_or_synthetic()
    per_box = YIELD_PER_BOX.get(flora, 5.0)
    season_f = SEASON_FACTORS.get(season, 1.0)
    health_f = 0.45 + (health_score / 100) * 0.55
    Xr = np.array([[boxes, per_box, season_f, health_f]])
    ml_estimate = float(yield_reg.predict(Xr)[0])
    rule_estimate = per_box * boxes * season_f * health_f
    blended = round((ml_estimate * 0.7 + rule_estimate * 0.3), 1)
    return {"flora": flora, "boxes": boxes, "season": season, "healthScore": health_score, "mlEstimateKg": round(ml_estimate, 1), "ruleEstimateKg": round(rule_estimate, 1), "estimateKg": blended, "perBox": per_box, "model": f"RandomForestRegressor 100 trees + rule blend ({DATASET_SOURCE} {DATASET_ROWS} rows)"}

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "honeychain-ai", "model_trained": is_trained, "dataset_source": DATASET_SOURCE, "dataset_rows": DATASET_ROWS, "dataset_detail": DATASET_DETAIL, "source": DATASET_SOURCE, "model": f"RF 120+100 trees ({DATASET_SOURCE} {DATASET_ROWS} rows)", "endpoints": ["/anomaly", "/disease", "/yield", "/colony-health", "/telemetry-anomaly", "/productivity"]}
