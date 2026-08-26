# SIH26021 — Build Plan (4 weeks → submission 20 Sep)

## Phase 0 — NOW (Week 1)
| Day | Task | Owner |
|---|---|---|
| D1 | Repo scaffold: `honeychain/` monorepo (`app/ api/ web/ chain/ ai/`), CI, envs | Nethaji |
| D1–2 | Chain spike: Fabric testnet up OR Polygon PoA fallback; write chaincode skeleton | Nethaji |
| D2–3 | Data models final (Actor/Apiary/Batch/Transfer/QualityRecord/Package) | Nethaji |
| D2–4 | Flutter app shell: auth, role select, hive list, batch form, SQLite queue | Devraj |
| D2–5 | R&D girls: finalize dossier citations → PPT v1 slides 1–8 | Girls (lead: assign one as doc-owner) |

**Gate G1 (end W1):** a batch can be minted on ledger via API. Non-negotiable.

## Phase 1 — Core build (Week 2)
- API: custody transfer endpoints, role auth, event log
- App: offline sync engine, geo-tagged photos, local-language strings
- Web: FPO console skeleton + ledger explorer
- AI service: dilution-detector v0 (simple threshold on weight deltas — upgrade later)
- PS2 hedge: 30% effort on Land Delays proposal (separate track)

**Gate G2:** end-to-end happy path works on two devices (phone + laptop).

## Phase 2 — Depth & polish (Week 3)
- Consumer QR portal + trust badge
- Anomaly alert surfaced in console + app notifications
- Seed demo dataset (see 04 file); print physical QR jar props
- Record demo video take 1; PPT v2 with architecture diagrams
- Judge QA drills begin (07 file)

**Gate G3:** full story demo runs in under 7 minutes without touching keyboard hacks.

## Phase 3 — Submission sprint (to 20 Sep)
- Idea write-up on SIH portal (follow word limits exactly; lead with impact math + Madhukranti-gap table)
- Video: screen-recorded walkthrough + voiceover, ≤3 min, 720p+, upload early (portals crash on deadline day)
- Backups: GitHub push + Drive mirror + teammate laptop copy after EVERY session
- Freeze features 48h before deadline. Only bugfixes.

## Finale prep backlog (post-shortlist, keep ready)
36-hour build plan if we reach finale: H0–6 deploy infra + roles; H6–18 M1+M2 hardening; H18–30 M3+M5 integration; H30–34 demo rehearsal ×3; H34–36 buffer. (Same rhythm as your CODE FEST win.)

## Risk register
| Risk | Mitigation |
|---|---|
| Fabric setup eats days | Time-boxed 2-day spike; fall back to Polygon PoA |
| Deadline-day portal crash | Submit 3 days early |
| Team member unavailable | Doc-owner redundancy: every file has 2 knowers |
| Live internet fails at eval | Full local mode + video backup on device |
