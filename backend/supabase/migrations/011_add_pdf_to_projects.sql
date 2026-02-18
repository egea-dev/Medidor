-- Migración para soportar el guardado de reportes PDF y campo depth (ya existía en measurements, pero verificamos bucket)

-- 1. Añadir columna para guardar la URL del último reporte generado
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS last_report_url TEXT;

-- 2. Crear bucket para documentos (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de seguridad para el bucket de documentos
-- SELECT: Público (para descargar fácil) o Auth
DROP POLICY IF EXISTS "docs_select" ON storage.objects;
CREATE POLICY "docs_select" ON storage.objects FOR SELECT
USING ( bucket_id = 'project-documents' );

-- INSERT: Usuarios autenticados
DROP POLICY IF EXISTS "docs_insert" ON storage.objects;
CREATE POLICY "docs_insert" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'project-documents' AND auth.role() = 'authenticated' );

-- DELETE/UPDATE: Owner o Admin
DROP POLICY IF EXISTS "docs_delete" ON storage.objects;
CREATE POLICY "docs_delete" ON storage.objects FOR DELETE
USING ( bucket_id = 'project-documents' AND (auth.uid() = owner OR public.is_admin()) );
