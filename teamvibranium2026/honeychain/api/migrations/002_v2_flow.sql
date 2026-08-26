ALTER TABLE actors DROP CONSTRAINT IF EXISTS actors_role_check;
ALTER TABLE actors ADD CONSTRAINT actors_role_check CHECK (role IN ('beekeeper','fpo','transporter','processor','lab','packer','admin'));

ALTER TABLE batches ADD COLUMN IF NOT EXISTS farmer_weight numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS lab_received_weight numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS lab_wastage numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS lab_pure_weight numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS packer_received_weight numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS geo_lat numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS geo_lng numeric;
ALTER TABLE batches DROP CONSTRAINT IF EXISTS batches_status_check;
ALTER TABLE batches ADD CONSTRAINT batches_status_check CHECK (status IN ('created','pickup_assigned','in_transit','at_lab','tested','received','processed','packaged','flagged'));

ALTER TABLE quality_records ADD COLUMN IF NOT EXISTS tester_photo_hash text;
ALTER TABLE quality_records ADD COLUMN IF NOT EXISTS received_weight numeric;
ALTER TABLE quality_records ADD COLUMN IF NOT EXISTS wastage numeric;
ALTER TABLE quality_records ADD COLUMN IF NOT EXISTS pure_weight numeric;

ALTER TABLE packages ADD COLUMN IF NOT EXISTS packer_received_weight numeric;
