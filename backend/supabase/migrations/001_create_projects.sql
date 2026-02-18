CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT NOT NULL,
  job_type TEXT,
  date DATE DEFAULT CURRENT_DATE,
  rail_type TEXT,
  observations TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- EGEA: Activar RLS para seguridad
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- EGEA: Políticas de acceso
CREATE POLICY "Los usuarios pueden ver sus propios proyectos"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios proyectos"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios proyectos"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden borrar sus propios proyectos"
ON projects FOR DELETE
USING (auth.uid() = user_id);
