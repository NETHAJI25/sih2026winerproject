# HoneyChain Architecture — Told Through Ravi's Story

## The Cast

| Component | What it is | Who uses it |
|---|---|---|
| Beekeeper App | Flutter mobile app (offline-first, Tamil/Hindi) | Ravi, the beekeeper |
| Blockchain Ledger | Hyperledger Fabric / Polygon — the unforgeable diary | Nobody "uses" it — it remembers everything |
| FPO Console (website) | React dashboard for collection centers | FPO agent, processor, packer |
| AI Engine | Python service watching the numbers | Works silently, alerts the FPO |
| Consumer Portal (website) | Public page behind the jar QR | The mother in the supermarket, exporters |
| API (Node.js) | The bridge connecting all of the above | All of the above |

## Scene by scene

**Scene 1 — The mustard field.** Ravi harvests 42 kg. No internet before noon.
→ *Beekeeper App:* Tamil icons, photo, GPS pin, "42", save. Batch sleeps in the phone (SQLite queue). No network? No problem.

**Scene 2 — Signal returns.** App → API → Blockchain.
→ Batch B-1042 becomes Transaction #1 — locked forever. App shows a green tick: "Recorded forever." Ravi doesn't know the word blockchain. He knows the tick.

**Scene 3 — Collection center.** FPO agent weighs: 42 kg, matches.
→ *FPO Console:* scans Ravi's QR, signs custody with his own key. Transaction #2. Two different signatures now on this honey — the agent can't deny it later.

**Scene 4 — The processor.** 42 in → 38 out, honest. Transaction #3.
→ *AI Engine, the villain-catcher:* last month somewhere else, 42 in, 55 out. Honey cannot grow. Weight gain between hops = syrup added → amber alert on the console in milliseconds. This is the answer to "blockchain proves immutability, not truth" — the AI checks physics at every door, and only labs can attach certificates.

**Scene 5 — The lab.** NMR certificate attaches to B-1042 signed by the lab's own key. Transaction #4. Nobody can forge a lab's signature.

**Scene 6 — Packing.** 500 jars minted, each QR a key to B-1042's life story. Transaction #5.

**Scene 7 — The supermarket.** Mother scans the jar.
→ *Consumer Portal:* apiary map, Ravi's photo, harvest date, NMR certificate, unbroken custody chain. She doesn't have to trust the label — she can check it. Pays ₹50 more. That ₹50 flows back to Ravi.

**Scene 8 — That night.** AI Engine reads the season: varroa warning on Ravi's app, yield forecast for the mustard bloom. The bees became data. The data became leverage.

## One-picture summary

```
Ravi's phone ──(offline queue)──> API ──> LEDGER (nobody can edit)
                                    │          ▲
FPO Console ──signs custody─────────┤          │ reads lineage
Processor  ──signs custody──────────┤          │
Lab        ──attaches certificate───┘          │
                                    │
AI Engine ──watches every weight────┘──> alerts

500 jars <──QR minted── Console
    └──> mother scans ──> Consumer Portal ──> TRUST
```

Six actors, one rule: every handover needs a *different* key. Nobody — not the trader, not the processor, not even the government or us — can rewrite Ravi's honey's history.

*Madhukranti registers India's bees. HoneyChain makes every jar honest.*
