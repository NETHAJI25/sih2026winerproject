CREATE TABLE IF NOT EXISTS hives (
  id serial PRIMARY KEY,
  hive_code text UNIQUE NOT NULL,
  apiary_id integer REFERENCES apiaries(id),
  owner_actor_id integer REFERENCES actors(id),
  bee_species text DEFAULT 'Apis mellifera',
  flora_source text,
  box_type text DEFAULT 'Langstroth',
  installed_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active','dormant','quarantined','archived')),
  lat numeric,
  lng numeric
);
CREATE TABLE IF NOT EXISTS hive_telemetry (
  id bigserial PRIMARY KEY,
  hive_id integer REFERENCES hives(id) ON DELETE CASCADE,
  hive_code text NOT NULL,
  ts timestamptz DEFAULT now(),
  temp_c numeric NOT NULL,
  humidity_pct numeric NOT NULL,
  weight_kg numeric NOT NULL,
  sound_db numeric,
  sound_freq_hz numeric,
  battery_pct numeric,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_telemetry_hive_ts ON hive_telemetry(hive_code, ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_ts ON hive_telemetry(ts DESC);
CREATE TABLE IF NOT EXISTS hive_inspections (
  id serial PRIMARY KEY,
  hive_id integer REFERENCES hives(id),
  hive_code text NOT NULL,
  inspected_by integer REFERENCES actors(id),
  brood_pattern_score integer CHECK (brood_pattern_score BETWEEN 1 AND 5),
  queen_seen boolean,
  varroa_count integer,
  disease_signs text,
  notes text,
  created_at timestamptz DEFAULT now()
);
