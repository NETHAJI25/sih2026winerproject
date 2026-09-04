# HoneyChain K8s — KVIC Cluster Deploy

## Apply order
```bash
kubectl apply -f k8s/postgres-stateful.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/ai-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl get pods -l app=honeychain
kubectl get pvc -l app=honeychain
```

## Mapping from docker-compose.yml
- `db` (postgres:16-alpine + pgdata) → `postgres` StatefulSet + headless Service + `pgdata` PVC (10Gi, volumeClaimTemplates)
- `api:4000` (env_file ./api/.env) → Deployment 3 replicas port 4000 + Service ClusterIP + ConfigMap `api-env` + Secret `api-secrets` (envFrom)
- `ai:8001` (uvicorn) → Deployment 2 replicas port 8001 + Service ClusterIP

## Env handling
`api/.env` → `k8s/api-deployment.yaml` ConfigMap `api-env` (PORT, DATABASE_URL=postgres:5432, AI_SERVICE_URL=http://ai:8001, CHAIN_RPC_URL, FIREBASE_*) + Secret `api-secrets` (JWT_SECRET, CHAIN_CONTRACT_ADDRESS).
Per-KVIC cluster override: edit ConfigMap per district or use `kustomize` overlay with `geo_lat/lng` sharding.

## Ingress
`ingress.yaml` (nginx, host honeychain.local): `/api → api:4000`, `/ai → ai:8001`, `/ → api:4000` (add web:5173 Service if deploying web).

## Verify
```bash
kubectl rollout status deployment/api
kubectl rollout status deployment/ai
kubectl rollout status statefulset/postgres
curl http://honeychain.local/api/health
curl http://honeychain.local/ai/health
```
