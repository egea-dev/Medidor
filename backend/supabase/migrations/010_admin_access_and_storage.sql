-- Script de emergencia: Restaura las políticas RLS básicas
-- Ejecutar si los proyectos no se ven después de un error en 010

-- PROJECTS
DROP POLICY IF EXISTS "users_own_projects" ON public.projects;
DROP POLICY IF EXISTS "access_projects" ON public.projects;
CREATE POLICY "access_projects" ON public.projects
FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- MEASUREMENTS
DROP POLICY IF EXISTS "users_own_measurements" ON public.measurements;
DROP POLICY IF EXISTS "access_measurements" ON public.measurements;
CREATE POLICY "access_measurements" ON public.measurements
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = measurements.project_id AND (user_id = auth.uid() OR public.is_admin()))
);

-- IMAGES
DROP POLICY IF EXISTS "users_own_images" ON public.images;
DROP POLICY IF EXISTS "access_images" ON public.images;
CREATE POLICY "access_images" ON public.images
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = images.project_id AND (user_id = auth.uid() OR public.is_admin()))
);
