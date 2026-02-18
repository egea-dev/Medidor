CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  measurement_id UUID REFERENCES measurements(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  original_name TEXT,
  caption TEXT,
  mime_type TEXT DEFAULT 'image/jpeg',
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_project ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_measurement ON images(measurement_id);
