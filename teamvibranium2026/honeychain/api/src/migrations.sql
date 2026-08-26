CREATE TABLE IF NOT EXISTS actors (
  id serial PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('beekeeper', 'fpo', 'transporter', 'processor', 'lab', 'packer', 'admin')),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  org text,
  wallet_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS apiaries (
  id serial PRIMARY KEY,
  owner_actor_id integer REFERENCES actors(id),
  lat numeric,
  lng numeric,
  box_count integer,
  flora_profile text
);

CREATE TABLE IF NOT EXISTS batches (
  id text PRIMARY KEY,
  client_batch_id text UNIQUE,
  apiary_id integer,
  harvest_date date,
  weight_kg numeric,
  farmer_weight numeric,
  lab_received_weight numeric,
  lab_wastage numeric,
  lab_pure_weight numeric,
  packer_received_weight numeric,
  geo_lat numeric,
  geo_lng numeric,
  flora_type text,
  photo_hash text,
  status text DEFAULT 'created' CHECK (status IN ('created', 'pickup_assigned', 'in_transit', 'at_lab', 'tested', 'received', 'processed', 'packaged', 'flagged')),
  created_by integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
  id serial PRIMARY KEY,
  batch_id text REFERENCES batches(id),
  from_actor integer,
  to_actor integer,
  weight_kg numeric,
  geo text,
  tx_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quality_records (
  id serial PRIMARY KEY,
  batch_id text REFERENCES batches(id),
  lab_actor integer,
  test_type text,
  passed boolean,
  certificate_hash text,
  tester_photo_hash text,
  received_weight numeric,
  wastage numeric,
  pure_weight numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS packages (
  id serial PRIMARY KEY,
  batch_id text,
  jar_count integer,
  qr_code text UNIQUE,
  minted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id serial PRIMARY KEY,
  batch_id text,
  type text,
  severity text CHECK (severity IN ('low', 'medium', 'high')),
  message text,
  payload jsonb,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_transfers_batch_id ON transfers(batch_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
