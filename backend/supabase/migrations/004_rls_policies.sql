-- Activar RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario solo accede a sus datos
CREATE POLICY "users_own_projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_measurements" ON measurements
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "users_own_images" ON images
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
