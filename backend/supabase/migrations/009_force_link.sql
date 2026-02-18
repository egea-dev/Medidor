-- Script definitivo para vincular Projects y Profiles
-- 1. Borra la relación si existe (para limpiar errores)
-- 2. La vuelve a crear
-- 3. Fuerza a Supabase a reconocer el cambio

DO $$
BEGIN
    -- Eliminar constraint anterior si existe (limpieza)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_user_profiles_fkey') THEN
        ALTER TABLE public.projects DROP CONSTRAINT projects_user_profiles_fkey;
    END IF;

    -- Crear la FK explícita
    ALTER TABLE public.projects
    ADD CONSTRAINT projects_user_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
END $$;

-- Comando especial para recargar la caché de la API de Supabase
NOTIFY pgrst, 'reload schema';
