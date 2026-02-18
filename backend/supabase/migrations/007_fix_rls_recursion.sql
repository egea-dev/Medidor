-- Corrige el error de recursión infinita en las políticas RLS
-- Error original: infinite recursion detected in policy for relation "user_profiles"

-- 1. Función segura para verificar si es admin sin causar recursión
-- Al ser SECURITY DEFINER, esta función se ejecuta con privilegios elevados y evita el ciclo de RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Eliminar políticas antiguas y nuevas (para evitar conflictos al re-ejecutar)
DROP POLICY IF EXISTS "admins_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile_select" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile_update" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.user_profiles;

DROP POLICY IF EXISTS "view_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "update_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "delete_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "insert_profiles" ON public.user_profiles;

-- 3. Crear nuevas políticas seguras usando is_admin()

-- Ver perfiles: El usuario ve el suyo propio, o un admin ve todos
CREATE POLICY "view_profiles" ON public.user_profiles
  FOR SELECT USING (
    (auth.uid() = id) OR (public.is_admin())
  );

-- Actualizar perfiles: El usuario actualiza el suyo, o un admin actualiza cualquiera
CREATE POLICY "update_profiles" ON public.user_profiles
  FOR UPDATE USING (
    (auth.uid() = id) OR (public.is_admin())
  );

-- Eliminar perfiles: Solo un admin puede eliminar perfiles
CREATE POLICY "delete_profiles" ON public.user_profiles
  FOR DELETE USING (
    public.is_admin()
  );

-- Insertar perfiles: Admin o el propio usuario (necesario para el primer registro)
CREATE POLICY "insert_profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (
    (auth.uid() = id) OR (public.is_admin())
  );
