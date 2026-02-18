-- Crea una clave foránea explícita entre projects y user_profiles.
-- Esto permite a Supabase (PostgREST) detectar la relación y permitir
-- joins automáticos como: .select('*, user_profiles(*)')
-- Error original: Could not find a relationship between 'projects' and 'user_profiles'

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_user_profiles_fkey') THEN
        ALTER TABLE public.projects
        ADD CONSTRAINT projects_user_profiles_fkey
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
    END IF;
END $$;
