# Chain Option — Polygon Amoy (Current) vs Hyperledger Fabric for KVIC

**Date:** 2026-09-04 | **Contract:** `chain/contracts/HoneyChain.sol:57-62` (STATUS_CREATED→FLAGGED lifecycle) + `TECHNICAL.md:7` (Polygon public verifiability + role gating Fabric-like)

## Context
HoneyChain today runs on Polygon Amoy (Solidity 0.8.20, `chain/contracts/HoneyChain.sol` 275 lines, 7 roles beekeeper/fpo/transporter/processor/lab/packer/admin; `TECHNICAL.md:7` notes role-gated functions give Fabric-like permissioning and mock→live `CHAIN_CONTRACT_ADDRESS` swap). KVIC requirement: scalable deployment across rural beekeeping clusters with consumer trust + offline tolerance.

## Comparison

| Dimension | Polygon Amoy (Current) | Hyperledger Fabric (Option) | Notes for KVIC |
|---|---|---|---|
| **Public verifiability** | High — any consumer scans QR `hc.in/b/B-*` → polygonscan verifies `BatchCreated`/`CustodyTransferred`/`JarsMinted` | Low — private channel ledger, needs explorer/API for consumers; trust via KVIC endorsement | Polygon wins on SIH “consumer trust via public scan” |
| **Gas cost** | ~0.001–0.01 MATIC per tx (Amoy testnet free; mainnet < $0.01). KVIC scale 30→10k batches/yr = <$100/yr | No gas; infra cost: 3–5 peers + orderer CA (≈ $200–500/mo managed) | Polygon cheaper at KVIC pilot; Fabric infra dominates small scale |
| **Permissioning** | Role gating in contract (`onlyRegistered`, `_hasRole` beekeeper/lab/packer/admin, `TECHNICAL.md:7` “role gating gives Fabric-like permissioning”) + `revokeActor` | Native MSP/CA, channel policies per org (KVIC/FPO/Lab/Packer), endorsement policy per tx | Fabric stronger for enterprise PKI; HoneyChain contract already emulates 80% of it |
| **Offline** | App offline SQLite queue + POST `/batches` on reconnect; chain write deferred via `chain.js` mock fallback (no tx loss) | Same offline queue; Fabric peer can be off-line, sync via gossip on reconnect; needs local peer or gateway | Tie — both depend on `app/` SQLite + API queue, not chain type |
| **KVIC scale** | Public chain scales horizontally; `k8s/` (api 3 repl, ai 2, postgres StatefulSet) + sharding by `geo_lat/lng` per district; one RPC per cluster | Fabric scales via channels per district/zone (`hives/{district}` prefix in RTDB mirrors channel concept); needs per-cluster peers | Polygon simpler for 100-district rollout; Fabric justified at 1000+ orgs or data-privacy regulation |
| **Ops / Interoperability** | Hardhat deploy `--network amoy`, ABI in `api/chain.js` toUnits milli-kg, `CHAIN_RPC_URL` swap without API change | Chaincode (Go) replaces Solidity; `api/chain.js` adapter swaps ABI→Fabric SDK; DB/events unchanged (`STATUS_*` 0-5 preserved `HoneyChain.sol:57-62`) | `TECHNICAL.md:7` “can swap to Fabric without API change” proven by same status/lifecycle model |

## Recommendation

**Keep Polygon Amoy for SIH/finals and consumer launch; gate as Fabric-like via contract roles; keep Fabric as swap-in option.**

- **Polygon for consumer trust + cost:** Public polygonscan verification is the SIH differentiator (required by PS blockchain-verifiable traceability); role gating (`createBatch` beekeeper-only, `attachQuality` lab-only, `mintJars` packer-only, `flagBatch` admin-only) already delivers Fabric-like permissioning without Fabric ops cost — as documented `TECHNICAL.md:7`.
- **Fabric when (not now):** If KVIC mandates private data (lab certs, farmer PII on-ledger) or endorsement by multiple govt orgs, deploy Fabric channel per zone and swap `api/chain.js` to `fabric-network` SDK. Batch lifecycle constants `HoneyChain.sol:57-62` map 1:1 to chaincode states, so no API/DB migration.
- **Hybrid path:** Polygon for public proof (batchId, jar QR); Fabric/IPFS for private docs (NMR PDFs). `proof/06_scalable_deploy_proof.md` + `k8s/` already supports per-cluster env (`api/.env` → ConfigMap) for either chain via `CHAIN_RPC_URL` / `FABRIC_*`.

## Verify
```bash
grep -n STATUS_ chain/contracts/HoneyChain.sol | head # 57-62
grep -n "Polygon.*Fabric" TECHNICAL.md # :7
ls k8s/ # api-deployment.yaml ai-deployment.yaml postgres-stateful.yaml ingress.yaml
cat proof/chain_fabric_option.md
```
