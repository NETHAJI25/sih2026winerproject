# 06 Scalable Deploy Proof — KVIC Clusters
**Current:**
- `docker-compose.yml` — db (postgres:16-alpine) + api:4000 + ai:8001
- Fallback: START.ps1 / START.sh → postgres → ai:8001 → api:4000 → web:5173 without Docker (works today, pg fallback)
- Vercel: `https://web-mocha-three-89.vercel.app` (Home video hero, 6 portals)
- APK: HoneyChain-app-release.apk 50MB offline-first SQLite + RTDB
- `TECHNICAL.md` + `PROGRESS.md` + `14_DETAILED_FLOW_V2.md`

**Scalable framework (for finals 100%):**
- K8s manifests `k8s/` (api 3 replicas port 4000 envFrom api/.env ConfigMap, ai 2 port 8001, postgres:16-alpine StatefulSet pgdata PVC 10Gi, ingress nginx honeychain.local) — see `k8s/README.md`
- KVIC cluster: per-district apiary sharding by `geo_lat/lng`, FPO admin per cluster
- Hyperledger Fabric option doc `proof/chain_fabric_option.md` (Polygon public vs Fabric private, cites `chain/contracts/HoneyChain.sol:57-62` + `TECHNICAL.md:7`, recommendation Polygon for consumer trust + role gating Fabric-like)

**Live checks:**
```bash
docker compose -f honeychain/docker-compose.yml ps
# db Up (or fallback RTDB log)
npm run build # web dist 3738 KiB
cat START.ps1 # 4 jobs
ls k8s/ # api-deployment.yaml ai-deployment.yaml postgres-stateful.yaml ingress.yaml README.md
kubectl apply -f k8s/postgres-stateful.yaml -f k8s/api-deployment.yaml -f k8s/ai-deployment.yaml -f k8s/ingress.yaml --dry-run=client --validate=true
cat proof/chain_fabric_option.md | head -n 30
```

**Significance:** PS asks scalable deployment across rural beekeeping clusters under KVIC; one env file per cluster, same RTDB project with `hives/{district}` prefix.
