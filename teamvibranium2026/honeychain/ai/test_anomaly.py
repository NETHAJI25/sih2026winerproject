import json
import sys
import urllib.request

BASE_URL = "http://127.0.0.1:8000"


def call_anomaly(body):
    request = urllib.request.Request(
        BASE_URL + "/anomaly",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def hop(stage, weight_kg, actor):
    return {"stage": stage, "weightKg": weight_kg, "actor": actor}


CLEAN = {
    "batchId": "T-CLEAN",
    "hops": [
        hop("harvest", 42, "Ravi Kumar"),
        hop("fpo_received", 41.5, "Tiruvallur Honey FPO"),
        hop("processed", 38, "Kaveri Honey Works"),
    ],
}

VILLAIN = {
    "batchId": "T-VILLAIN",
    "hops": [
        hop("harvest", 42, "Ajay Verma"),
        hop("processed", 55, "Kaveri Honey Works"),
    ],
}

OVER_LOSS = {
    "batchId": "T-OVERLOSS",
    "hops": [
        hop("harvest", 40, "Subrata Ghosh"),
        hop("packaged", 25, "PureJars Foods"),
    ],
}


def run_case(name, body, expect_flag, extra=None):
    try:
        result = call_anomaly(body)
    except Exception as exc:
        print(f"FAIL {name}: request error {exc}")
        return False
    checks = [result.get("flag") is expect_flag]
    if expect_flag:
        checks.append(result.get("score", 0) > 0)
    else:
        checks.append(result.get("score", 1) == 0)
    if extra is not None:
        checks.append(extra(result))
    ok = all(checks)
    state = "PASS" if ok else "FAIL"
    print(f"{state} {name}: flag={result.get('flag')} score={result.get('score')} reason={result.get('reason')}")
    return ok


def main():
    try:
        with urllib.request.urlopen(BASE_URL + "/health", timeout=5) as response:
            print("health:", response.read().decode("utf-8").strip())
    except Exception:
        print("FAIL server-unreachable: start the API first with uvicorn main:app --port 8000")
        sys.exit(2)

    results = [
        run_case("clean-42-to-38", CLEAN, False),
        run_case("villain-42-to-55", VILLAIN, True, lambda r: "30.9% gain" in r.get("reason", "")),
        run_case("over-loss-40-to-25", OVER_LOSS, True),
    ]
    if all(results):
        print("ALL 3 CASES PASS")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
