# 01 Blockchain Proof — Polygon Amoy
**Contract:** `chain/contracts/HoneyChain.sol:1-275` — 7 roles (beekeeper/fpo/transporter/processor/lab/packer/admin), 6 events, mock `0xMOCK` → live via `CHAIN_RPC_URL`.

**Key Functions:**
- `registerActor` role-gated `isValidRole`
- `createBatch` beekeeper only `NotBeekeeper`
- `transferCustody` holder only
- `attachQuality` lab only
- `mintJars` packer only `qr hc.in/b/B-*`
- `flagBatch` admin

**Live Checks:**
```bash
curl http://localhost:4000/api/chain/status
# {"connected":false,"mode":"mock-mode"} → demo safe; set CHAIN_CONTRACT_ADDRESS + RPC for live blockNumber
cat chain/contracts/HoneyChain.sol | wc -l # 275
cat api/src/chain.js # mockResult + ethers 6.13
```

**Significance:** Public verifiability (polygonscan) + role gating = Fabric permissioning without Fabric overhead; swap to Fabric without API change (TECHNICAL.md:7).

**Judge Q:** Why Polygon not Hyperledger? → Public consumer verification + low gas, permissioned via roles; KVIC villages need public trust, not private consortium.
