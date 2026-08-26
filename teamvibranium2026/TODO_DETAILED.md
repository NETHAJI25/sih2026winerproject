# TODO — Detailed (Image-Based, No Emoji, No Animation-Dependent)
> Status: homepage video header KEPT (your 10s bee→QR clip). All portal specs below are image/photography + Lucide/Phosphor SVGs.

## Phase 1 — Homepage (Concept: video hero + image sections) ✅ video restored
- [x] Hero 92vh full-bleed <video autoplay muted loop playsinline cover> + rgba(0,0,0,0.35→0.55) overlay, centered headline "Every Jar of Honey Has a Story", sub, CTAs Verify/HowItWorks, chevron
- [x] #how 5-step cards 01-05 (Harvest/Transport/Lab/Packaging/You Scan) flat illustration SVG + dot connector, 12-word desc
- [x] #roles 3-col image cards (Beekeepers/Labs/Consumers/Transport/Packaging/Gov) real photo placeholder + Learn more
- [x] Platform numbers band #FAF7F0 → 1,247kg/312/89/6 with "Pilot Data" label (no CountUp)
- [x] Why Blockchain 2-col: 5-box SVG checkmarks + plain paragraph, Open Explorer
- [x] Government alignment Madhukranti text
- [x] CTA honey-gold band + 4-col footer

## Phase 2 — Farmer Portal (/farmer) 🔄 scaffold → full visual grids
- [ ] Sidebar Home/PlusCircle/Package/FileText/Bell + photo+name+village always labeled
- [ ] Dashboard: greeting + 3 cards (Total kg + line trend, Verified count, Pending Sync amber) + Apiary scroll map thumbs + 3 Alerts amber/red/green + FAB "+" New Harvest
- [ ] New Harvest 5 steps: 1) Choose/Add Apiary (grid photo+map), 2) Bee Species 5 visual photo cards (cerana/mellifera/dorsata/florea/Trigona) single select, 3) Honey/Flora 8 cards with flower photo + honey swatch (Mustard/Eucalyptus/Litchi/Jamun/Moringa/Forest/Neem/Sunflower), 4) Batch Details weight stepper + camera thumb + video 10-20s + date, 5) Review & Submit → "Saved, auto-sync"
- [ ] My Batches list thumbnail+ID+date+weight+status badges (grey clock/green check/blue flask/red/amber box) + detail timeline
- [ ] Certificates PDF QR + download
- [ ] Alerts plain-language, filter Disease/Weather/Yield

## Phase 3 — Transport Portal (/transport)
- [ ] Sidebar Dashboard/Assigned/Active/History
- [ ] Dashboard Pickups Today/Week/Distance + Leaflet pins + current location
- [ ] Assigned nearest-first cards + Start Trip → Open in Maps
- [ ] Active Trip: Scan QR → show harvest weight, weight input with >3% pre-confirm warning + re-weigh, photo, GPS pin, Confirm Pickup → Delivery weight+seal → History

## Phase 4 — Lab Portal (/lab)
- [ ] Dashboard Pending/Completed/PassRate + 14d bar
- [ ] Queue oldest-first + Begin Test
- [ ] Test Form: Receiving weight (auto-compare), seal photo, params Moisture/HMF/Diastase/Sucrose/C3/C4 with grey range hints, auto Pass/Fail IS 4941 banner + fail reasons, PDF+officer photo+signature-pad → lock on Fail
- [ ] Completed + Rejected filtered views

## Phase 5 — Packaging Portal (/packaging)
- [ ] Dashboard Incoming/Bottles/Ready
- [ ] Incoming only Pass batches, Begin Packaging
- [ ] Form confirm weight (compare), bottle size visual cards 100/250/500/1kg, count auto, expiry auto harvest+shelf, Generate QR+Barcode, Label preview locked, Download PDF, Mark Dispatched

## Phase 6 — Customer Verify (/verify/:batchId) + Admin (/admin)
- [ ] Verify: Trust score, hero honey image, farmer profile, timeline Flower→Bee→Hive→Farmer→Pickup→Testing→Processing→Packaging→Store→You expandable Photo/Map/Cert/Hash/Trust, feedback/report
- [ ] Admin: Dashboard cards+activity log, Fraud Alerts with 42→55 31% text + red left border, Heatmap Leaflet production/alert toggle, Cluster Onboarding form+FPO CSV bulk invite, Users table

## Cross-cutting
- [x] Status badges grey/green/amber/red system-wide
- [x] Icon+text labels on farmer/transport, no icon-only
- [x] Map tiles single style OSM, illustration style single set
- [x] AI flags with plain sentence, never bare number
- [ ] Replace [Photo: ...] placeholders with licensed real photos/illustrations
- [ ] Build checks npm run build, verify 5173/5174/8080 200

## Execution — multimodel parallel
- Model A (web UI): homepage + farmer + transport
- Model B (web UI): lab + packaging + admin + customer
- Model C (api/db): hive_telemetry table, marketplace stub, taxonomy enums
- Sync: git push + Drive mirror each session; resume via START.ps1 ("start")

Progress: homepage video header restored ✅, farmer/transport/lab/packaging/admin scaffolds live on 5173/5174 (/farmer etc), deep detail now in progress per this todo.
