-- Migración para añadir avatar_url y phone a user_profiles
ALTER TABLE user_profiles ADD COLUMN avatar_url VARCHAR(500) NULL AFTER role;
ALTER TABLE user_profiles ADD COLUMN phone VARCHAR(50) NULL AFTER full_name;
