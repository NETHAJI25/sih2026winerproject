# HoneyChain Seed Data Generator

Plain Node.js 20+, zero dependencies (built-ins only).

## Generate

```bash
cd seed
mkdir -p data
node generate.js > data/demo.json
```

Prints a single JSON document with the shape:

```json
{ "generatedAt": "...", "actors": [], "apiaries": [], "batches": [], "transfers": [], "qualityRecords": [], "packages": [], "alerts": [] }
```

## What's inside

- **actors (11)** — 6 beekeepers: Ravi Kumar and Meena P (Tamil Nadu), Ajay Verma and Sunita Devi (Uttar Pradesh), Subrata Ghosh (West Bengal), Harpreet Singh (Punjab); plus 1 FPO agent (Tiruvallur Honey FPO), 1 processor (Kaveri Honey Works), 1 lab (Apex Honey Testing Lab), 1 packer (PureJars Foods), 1 admin. Every actor carries an id, role, name, `+91-` phone, org and a `0x` + 40-hex wallet.
- **apiaries (12)** — clustered around Tiruvallur (~13.2, 80.0), Aligarh/Hathras (~27.5, 78.5), North 24 Parganas (~22.9, 88.4) and Ludhiana (~30.9, 75.8), each with 4–12 boxes and a flora profile.
- **batches (30) + transfers** — full custody chains with `0x` + 64-hex txHashes and July 2026 timestamps.
  - **Hero `B-1042`**: Ravi Kumar, mustard, 42 kg → FPO receives 42 → processed to 38 → packaged as 500 jars. Four clean transfers and a passing NMR quality certificate with cert hash.
  - **Villain `B-2001`**: Ajay Verma (UP), lychee, 42 kg in → 55 kg out at processing — an impossible 30.9% gain, so status is `flagged`.
  - The other 28 (`B-1001`…`B-1028`) are fully deterministic via mulberry32 seeded with 42: mixed flora, weights, statuses and ~45% carrying lab quality records.
- **packages** — one row for the hero batch (`B-1042`, 500 jars, QR `hc.in/b/B-1042`) plus a few packaged random batches.
- **alerts** — an open HIGH dilution alert on `B-2001` (payload `{inKg:42, outKg:55, stage:"processing"}`), an open MEDIUM varroa-season disease advisory, and one old LOW drift alert already acknowledged by the FPO agent.

Re-running reproduces byte-identical data except `generatedAt`.
