from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="HoneyChain AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

YIELD_PER_BOX = {"Mustard": 6.5, "Eucalyptus": 5.0, "Lychee": 7.0, "Sunflower": 5.5, "Wild": 4.0}
SEASON_FACTORS = {"flow": 1.0, "shoulder": 0.85, "off": 0.7}
FOULBROOD_MONTHS = {6, 7, 8, 9}
VARROA_MONTHS = {1, 2, 10, 11, 12}
MAX_WEIGHT_GAIN_PCT = 2.0
MAX_TOTAL_LOSS_PCT = 25.0


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


def fmt_kg(value: float) -> str:
    return f"{value:g}"


def truncate1(value: float) -> float:
    return int(value * 10) / 10


@app.post("/anomaly", response_model=AnomalyResponse)
def detect_anomaly(payload: AnomalyRequest) -> AnomalyResponse:
    hops = payload.hops
    if len(hops) < 2:
        return AnomalyResponse(
            batchId=payload.batchId,
            flag=False,
            score=0.0,
            reason="Need at least two custody hops to evaluate",
            checkedHops=len(hops),
        )

    findings: list[tuple[float, str]] = []
    for prev, cur in zip(hops, hops[1:]):
        if prev.weightKg <= 0:
            continue
        change_pct = (cur.weightKg - prev.weightKg) / prev.weightKg * 100
        if change_pct > MAX_WEIGHT_GAIN_PCT:
            score = min(100.0, (change_pct - MAX_WEIGHT_GAIN_PCT) * 20)
            findings.append(
                (
                    score,
                    f"{fmt_kg(prev.weightKg)} kg in, {fmt_kg(cur.weightKg)} kg out at {cur.stage}"
                    f" — impossible {truncate1(change_pct):.1f}% gain",
                )
            )

    total_loss_pct = 0.0
    if hops[0].weightKg > 0:
        total_loss_pct = (hops[0].weightKg - hops[-1].weightKg) / hops[0].weightKg * 100
    if total_loss_pct > MAX_TOTAL_LOSS_PCT:
        score = min(100.0, (total_loss_pct - MAX_TOTAL_LOSS_PCT) * 6)
        findings.append(
            (
                score,
                f"{fmt_kg(hops[0].weightKg)} kg harvested, {fmt_kg(hops[-1].weightKg)} kg final"
                f" — {truncate1(total_loss_pct):.1f}% total loss crosses the 25% evaporation ceiling",
            )
        )

    if not findings:
        return AnomalyResponse(
            batchId=payload.batchId,
            flag=False,
            score=0.0,
            reason="All custody hops stay within the 2% gain and 25% loss tolerances",
            checkedHops=len(hops),
        )

    findings.sort(key=lambda item: item[0], reverse=True)
    return AnomalyResponse(
        batchId=payload.batchId,
        flag=True,
        score=round(findings[0][0], 1),
        reason="; ".join(text for _, text in findings),
        checkedHops=len(hops),
    )


@app.get("/disease")
def disease_risk(
    month: int = Query(..., ge=1, le=12),
    temp_c: float = Query(..., ge=-10.0, le=60.0),
    humidity_pct: float = Query(..., ge=0.0, le=100.0),
) -> dict:
    drivers: list[str] = []
    score = 10.0
    if month in FOULBROOD_MONTHS:
        score += 40
        drivers.append("monsoon foulbrood window Jun-Sep")
    elif month in VARROA_MONTHS:
        score += 45
        drivers.append("varroa peak season Oct-Feb")
    else:
        drivers.append("off-peak month")
    if humidity_pct > 75:
        score += 15
        drivers.append("humidity above 75% favours pathogens")
    if 25 <= temp_c <= 32:
        score += 15
        drivers.append("25-32 C brood-rearing sweet spot")
    score = min(100.0, score)
    if score < 35:
        risk = "low"
        advice = "Routine hygiene is enough: scorch bottom boards monthly and avoid feeding old store honey."
    elif score < 70:
        risk = "medium"
        advice = "Run sticky-board varroa counts weekly, inspect sealed brood for sunken caps, and keep apiaries dry and ventilated."
    else:
        risk = "high"
        advice = "High pressure: apply oxalic-acid trickle for varroa, sniff larvae for foulbrood, and report suspect colonies to the FPO vet within 48 hours."
    return {
        "month": month,
        "risk": risk,
        "score": round(score, 1),
        "drivers": "; ".join(drivers),
        "advice": advice,
    }


@app.get("/yield")
def yield_estimate(
    flora: str = Query(..., min_length=2),
    boxes: int = Query(..., ge=1, le=500),
    season: str = Query("flow", pattern="^(flow|shoulder|off)$"),
) -> dict:
    per_box = YIELD_PER_BOX.get(flora)
    if per_box is None:
        raise HTTPException(status_code=400, detail=f"unknown flora '{flora}', known: {', '.join(YIELD_PER_BOX)}")
    factor = SEASON_FACTORS[season]
    return {
        "flora": flora,
        "boxes": boxes,
        "seasonFactor": factor,
        "estimateKg": round(per_box * boxes * factor, 1),
        "perBox": per_box,
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "honeychain-ai"}
