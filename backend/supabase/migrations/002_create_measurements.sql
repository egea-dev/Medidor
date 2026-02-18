CREATE TABLE IF NOT EXISTS measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  floor TEXT,
  room_number TEXT,
  room TEXT,
  product_type TEXT NOT NULL,
  product_label TEXT,
  width NUMERIC DEFAULT 0,
  height NUMERIC DEFAULT 0,
  depth NUMERIC,
  quantity INTEGER DEFAULT 1,
  observations TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_project ON measurements(project_id);
