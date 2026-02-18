-- Mejorar el trigger handle_new_user para mayor robustez y manejo de nulos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Intentar obtener el nombre completo de los metadatos, o usar el email como fallback
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (NEW.id, v_full_name, NEW.email);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, loguear y continuar (NO bloquear la creación del usuario)
    RAISE WARNING 'Error al crear perfil de usuario: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Asegurar que el trigger usa la nueva función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
