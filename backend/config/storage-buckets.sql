-- Ejecutar en Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  false,
  5242880,  -- 5MB máximo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Política: usuarios pueden leer/escribir sus propias imágenes
CREATE POLICY "users_upload_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_read_images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_delete_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);
