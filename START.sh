#!/bin/bash
echo "=== HoneyChain START ==="
cd "$(dirname "$0")"
git pull --rebase 2>/dev/null
echo "[1/4] postgres"; docker compose -f teamvibranium2026/honeychain/docker-compose.yml up -d postgres; sleep 2
echo "[2/4] ai"; (cd teamvibranium2026/honeychain/ai && nohup python -m uvicorn main:app --port 8001 > /tmp/hc-ai.log 2>&1 &)
echo "[3/4] api"; (cd teamvibranium2026/honeychain/api && nohup npm start > /tmp/hc-api.log 2>&1 &)
echo "[4/4] web"; (cd teamvibranium2026/honeychain/web && nohup npm run dev > /tmp/hc-web.log 2>&1 &)
sleep 3; echo "Home http://127.0.0.1:5173/  PPT http://127.0.0.1:8080/HoneyChain_SIH26021_PPT_6slides.html"
