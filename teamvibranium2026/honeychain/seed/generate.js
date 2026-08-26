function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const HEX = "0123456789abcdef";
const NUMS = "0123456789";
const FLORA_PER_BOX = { Mustard: 6.5, Eucalyptus: 5.0, Lychee: 7.0, Sunflower: 5.5, Wild: 4.0 };

const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));
const round1 = (n) => Math.round(n * 10) / 10;

function hexStr(n) {
  let s = "";
  for (let i = 0; i < n; i++) s += HEX[Math.floor(rand() * 16)];
  return s;
}

const wallet = () => "0x" + hexStr(40);
const txHash = () => "0x" + hexStr(64);

function phone() {
  let rest = "";
  for (let i = 0; i < 9; i++) rest += NUMS[Math.floor(rand() * 10)];
  return `+91-${randInt(6, 9)}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

function julyIso(day, hour = 10, minute = 0) {
  const d = Math.min(Math.max(day, 1), 31);
  return new Date(Date.UTC(2026, 6, d, hour, minute)).toISOString();
}

const ACTOR_DEFS = [
  { id: "bk-ravi", role: "beekeeper", name: "Ravi Kumar", org: "Ravi Bee Farm, Tiruvallur (Tamil Nadu)" },
  { id: "bk-meena", role: "beekeeper", name: "Meena P", org: "Meena Honey Collective, Thiruttani (Tamil Nadu)" },
  { id: "bk-ajay", role: "beekeeper", name: "Ajay Verma", org: "Verma Apiaries, Aligarh (Uttar Pradesh)" },
  { id: "bk-sunita", role: "beekeeper", name: "Sunita Devi", org: "Devi Bee Keeping, Hathras (Uttar Pradesh)" },
  { id: "bk-subrata", role: "beekeeper", name: "Subrata Ghosh", org: "Ghosh Honey Garden, North 24 Parganas (West Bengal)" },
  { id: "bk-harpreet", role: "beekeeper", name: "Harpreet Singh", org: "Punjab Gold Apiaries, Ludhiana (Punjab)" },
  { id: "ag-fpo", role: "fpo_agent", name: "Karthik Rangan", org: "Tiruvallur Honey FPO" },
  { id: "pr-kaveri", role: "processor", name: "Lakshmi Narayanan", org: "Kaveri Honey Works" },
  { id: "lb-apex", role: "lab", name: "Dr. Ananya Iyer", org: "Apex Honey Testing Lab" },
  { id: "pk-purejars", role: "packer", name: "Vikram Malhotra", org: "PureJars Foods" },
  { id: "ad-core", role: "admin", name: "Divya Sharma", org: "HoneyChain Platform Ops" },
];

const actors = ACTOR_DEFS.map((a) => ({ ...a, phone: phone(), wallet: wallet() }));
const KEEPERS = actors.filter((a) => a.role === "beekeeper").map((a) => a.id);

const APIARY_DEFS = [
  {
    owner: "bk-ravi",
    names: ["Periyapalayam Mustard Grove", "Uthukottai Ridge", "Arani River Bank"],
    lat: 13.22,
    lng: 80.02,
    region: "Tiruvallur, Tamil Nadu",
    floras: ["Mustard", "Eucalyptus", "Wild"],
  },
  {
    owner: "bk-meena",
    names: ["Thiruttani Sunflower Patch", "Nagalapuram Border"],
    lat: 13.17,
    lng: 79.66,
    region: "Thiruttani, Tamil Nadu",
    floras: ["Mustard", "Sunflower"],
  },
  {
    owner: "bk-ajay",
    names: ["Aligarh Mango Belt", "Khair Forest Line"],
    lat: 27.53,
    lng: 78.51,
    region: "Aligarh, Uttar Pradesh",
    floras: ["Lychee", "Wild"],
  },
  {
    owner: "bk-sunita",
    names: ["Hathras Mustard Belt", "Sadabad Fields"],
    lat: 27.6,
    lng: 78.06,
    region: "Hathras, Uttar Pradesh",
    floras: ["Mustard", "Eucalyptus"],
  },
  {
    owner: "bk-subrata",
    names: ["Hooghly Flats"],
    lat: 22.99,
    lng: 88.44,
    region: "North 24 Parganas, West Bengal",
    floras: ["Mustard", "Wild"],
  },
  {
    owner: "bk-harpreet",
    names: ["Ludhiana Sunflower Belt", "Sidhwan Canal Line"],
    lat: 30.91,
    lng: 75.83,
    region: "Ludhiana, Punjab",
    floras: ["Sunflower", "Eucalyptus"],
  },
];

const apiaries = [];
const ownerApiaries = {};
let apSeq = 0;
for (const def of APIARY_DEFS) {
  ownerApiaries[def.owner] = [];
  for (const name of def.names) {
    apSeq += 1;
    const apiary = {
      id: `ap-${String(apSeq).padStart(3, "0")}`,
      beekeeperId: def.owner,
      name,
      region: def.region,
      lat: Number((def.lat + (rand() - 0.5) * 0.12).toFixed(4)),
      lng: Number((def.lng + (rand() - 0.5) * 0.12).toFixed(4)),
      boxCount: randInt(4, 12),
      floraProfile: def.floras[Math.floor(rand() * def.floras.length)],
    };
    apiaries.push(apiary);
    ownerApiaries[def.owner].push(apiary);
  }
}

const HERO_TRANSFERS = [
  { id: "tx-1042-1", batchId: "B-1042", seq: 1, stage: "created", fromActor: "bk-ravi", toActor: "ag-fpo", weightKg: 42, txHash: txHash(), timestamp: julyIso(4, 9, 15) },
  { id: "tx-1042-2", batchId: "B-1042", seq: 2, stage: "fpo_received", fromActor: "ag-fpo", toActor: "pr-kaveri", weightKg: 42, txHash: txHash(), timestamp: julyIso(9, 11, 30) },
  { id: "tx-1042-3", batchId: "B-1042", seq: 3, stage: "processed", fromActor: "pr-kaveri", toActor: "pk-purejars", weightKg: 38, txHash: txHash(), timestamp: julyIso(14, 15, 45) },
  { id: "tx-1042-4", batchId: "B-1042", seq: 4, stage: "packaged", fromActor: "pk-purejars", toActor: "ag-fpo", weightKg: 38, jarCount: 500, txHash: txHash(), timestamp: julyIso(19, 10, 0) },
];

const HERO_BATCH = {
  id: "B-1042",
  beekeeperId: "bk-ravi",
  apiaryId: ownerApiaries["bk-ravi"][0].id,
  flora: "Mustard",
  boxCount: 7,
  harvestWeightKg: 42,
  currentWeightKg: 38,
  jarCount: 500,
  status: "packaged",
  createdAt: julyIso(3, 8, 0),
  updatedAt: julyIso(19, 10, 0),
};

const HERO_QUALITY = {
  id: "qr-B-1042",
  batchId: "B-1042",
  labId: "lb-apex",
  testType: "NMR",
  result: "passed",
  certHash: txHash(),
  testedAt: julyIso(17, 12, 0),
  metrics: { adulterationPct: 0, moisturePct: 18.2, c4SugarPct: 0.4 },
};

const HERO_PACKAGE = {
  id: "pkg-B-1042",
  batchId: "B-1042",
  jarCount: 500,
  qrCode: "hc.in/b/B-1042",
  packedBy: "pk-purejars",
  packedAt: julyIso(19, 10, 0),
};

const VILLAIN_TRANSFERS = [
  { id: "tx-2001-1", batchId: "B-2001", seq: 1, stage: "created", fromActor: "bk-ajay", toActor: "ag-fpo", weightKg: 42, txHash: txHash(), timestamp: julyIso(6, 8, 20) },
  { id: "tx-2001-2", batchId: "B-2001", seq: 2, stage: "fpo_received", fromActor: "ag-fpo", toActor: "pr-kaveri", weightKg: 42, txHash: txHash(), timestamp: julyIso(11, 10, 5) },
  { id: "tx-2001-3", batchId: "B-2001", seq: 3, stage: "processed", fromActor: "pr-kaveri", toActor: "pk-purejars", weightKg: 55, txHash: txHash(), timestamp: julyIso(16, 14, 40) },
  { id: "tx-2001-4", batchId: "B-2001", seq: 4, stage: "packaged", fromActor: "pk-purejars", toActor: "ag-fpo", weightKg: 50, txHash: txHash(), timestamp: julyIso(20, 16, 20) },
];

const VILLAIN_BATCH = {
  id: "B-2001",
  beekeeperId: "bk-ajay",
  apiaryId: ownerApiaries["bk-ajay"][0].id,
  flora: "Lychee",
  boxCount: 6,
  harvestWeightKg: 42,
  currentWeightKg: 50,
  status: "flagged",
  createdAt: julyIso(6, 7, 45),
  updatedAt: julyIso(20, 16, 20),
};

const STATUS_MIX = [["created", 3], ["in_transit", 6], ["processed", 8], ["packaged", 9], ["flagged", 2]];
const DEPTH = { created: 1, in_transit: 2, processed: 3, packaged: 4, flagged: 3 };
const STAGES = ["created", "fpo_received", "processed", "packaged"];

function weightedStatus() {
  const total = STATUS_MIX.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [status, weight] of STATUS_MIX) {
    roll -= weight;
    if (roll < 0) return status;
  }
  return "processed";
}

function randomBatch(idNum) {
  const keeper = pick(KEEPERS);
  const apiary = pick(ownerApiaries[keeper]);
  const flora = apiary.floraProfile;
  const boxes = apiary.boxCount;
  const harvestKg = round1(boxes * FLORA_PER_BOX[flora] * (0.75 + rand() * 0.5));
  const status = weightedStatus();
  const depth = DEPTH[status];
  const startDay = randInt(2, 24);
  const chain = [keeper, "ag-fpo", "pr-kaveri", "pk-purejars"];
  let day = startDay;
  let kg = harvestKg;
  const transfers = [];
  for (let step = 0; step < depth; step++) {
    if (step > 0) day += randInt(1, 4);
    if (step === 1) kg = round1(kg * (0.96 + rand() * 0.04));
    if (step === 2) {
      kg = status === "flagged" ? round1(kg * (1.06 + rand() * 0.24)) : round1(kg * (0.82 + rand() * 0.14));
    }
    if (step === 3) kg = round1(kg * (0.93 + rand() * 0.06));
    transfers.push({
      id: `tx-${idNum}-${step + 1}`,
      batchId: `B-${idNum}`,
      seq: step + 1,
      stage: STAGES[step],
      fromActor: chain[step],
      toActor: step === 3 ? "ag-fpo" : chain[step + 1],
      weightKg: kg,
      txHash: txHash(),
      timestamp: julyIso(day, randInt(6, 18), randInt(0, 59)),
    });
  }
  const batch = {
    id: `B-${idNum}`,
    beekeeperId: keeper,
    apiaryId: apiary.id,
    flora,
    boxCount: boxes,
    harvestWeightKg: harvestKg,
    currentWeightKg: kg,
    status,
    createdAt: julyIso(startDay, randInt(6, 9), randInt(0, 59)),
    updatedAt: transfers[transfers.length - 1].timestamp,
  };
  let quality = null;
  if (rand() < 0.45) {
    quality = {
      id: `qr-B-${idNum}`,
      batchId: `B-${idNum}`,
      labId: "lb-apex",
      testType: pick(["NMR", "Moisture", "Diastase", "HMF"]),
      result: rand() < 0.88 ? "passed" : "failed",
      certHash: txHash(),
      testedAt: julyIso(Math.min(startDay + 5, 31), 12, randInt(0, 59)),
    };
  }
  return { batch, transfers, quality };
}

const batches = [HERO_BATCH, VILLAIN_BATCH];
const transfers = [...HERO_TRANSFERS, ...VILLAIN_TRANSFERS];
const qualityRecords = [HERO_QUALITY];
const packages = [HERO_PACKAGE];

for (let num = 1001; num <= 1028; num++) {
  const built = randomBatch(num);
  batches.push(built.batch);
  transfers.push(...built.transfers);
  if (built.quality) qualityRecords.push(built.quality);
  if (built.batch.status === "packaged" && packages.length < 5) {
    packages.push({
      id: `pkg-${built.batch.id}`,
      batchId: built.batch.id,
      jarCount: Math.max(40, Math.round(built.batch.currentWeightKg * 10)),
      qrCode: `hc.in/b/${built.batch.id}`,
      packedBy: "pk-purejars",
      packedAt: built.batch.updatedAt,
    });
  }
}

const alerts = [
  {
    id: "al-1001",
    batchId: "B-2001",
    type: "dilution",
    severity: "high",
    status: "open",
    message: "42 kg in, 55 kg out at processing — impossible 30.9% gain",
    payload: { inKg: 42, outKg: 55, stage: "processing" },
    createdAt: julyIso(16, 15, 46),
  },
  {
    id: "al-1002",
    batchId: null,
    type: "disease_risk",
    severity: "medium",
    status: "open",
    message: "Varroa risk elevated across north Indian apiaries — October-February peak window, schedule mite counts before winter build-up",
    payload: { riskType: "varroa", region: "north-india", month: 10, score: 62 },
    createdAt: "2026-01-09T08:30:00.000Z",
  },
  {
    id: "al-1003",
    batchId: "B-1013",
    type: "dilution",
    severity: "low",
    status: "acknowledged",
    message: "3.1% drift at fpo_received on B-1013 reviewed — within seasonal evaporation norm, cleared by FPO agent",
    payload: { inKg: 36, outKg: 34.9, stage: "fpo_received" },
    createdAt: julyIso(8, 12, 0),
    acknowledgedBy: "ag-fpo",
    acknowledgedAt: julyIso(9, 9, 30),
  },
];

const dataset = {
  generatedAt: new Date().toISOString(),
  actors,
  apiaries,
  batches,
  transfers,
  qualityRecords,
  packages,
  alerts,
};

console.log(JSON.stringify(dataset, null, 2));
