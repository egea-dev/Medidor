# Guía de Migración a PostgreSQL Nativo

Este documento detalla cómo la arquitectura actual está preparada para la migración de Supabase a un PostgreSQL propio y qué cambios serán necesarios.

## 1. Capa de Servicios (Frontend)
Hemos implementado una capa de servicios en `frontend/src/services/` y `frontend/src/features/wizard/services/`.
- **Estado actual**: Usan `@supabase/supabase-js`.
- **Tras la migración**: Solo habrá que actualizar estos archivos para usar `fetch()` o `axios` apuntando a tu nueva API (Node.js, Python, Pascal, etc.). El resto del código del frontend (componentes y hooks) no necesitará cambios.

## 2. Base de Datos (SQL)
Las migraciones actuales en `backend/supabase/migrations/` son PostgreSQL estándar con algunas extensiones de Supabase.

### Cambios Requeridos en SQL:
- **UUIDs**: Actualmente se usa el tipo `UUID`. Asegúrate de habilitar la extensión `pgcrypto` o `uuid-ossp` en tu nueva base de datos para generar IDs si no los generas desde el backend.
- **Autenticación (RLS)**: Las políticas actuales usan `auth.uid()`. En un PostgreSQL propio:
    - Si usas una API intermedia, el filtrado por `user_id` se hará normalmente en las consultas SQL de la API (`SELECT * FROM projects WHERE user_id = ?`).
    - Si planeas usar RLS nativo, deberás configurar roles de base de datos y usar `SET local jwt.claims.sub = '...'` o similar.

## 3. Almacenamiento de Imágenes
Actualmente se asume el uso de Supabase Storage.
- **Tras la migración**: Deberás decidir si guardas las imágenes en el sistema de archivos del servidor, en un S3 propio, o como BLOBs (no recomendado para muchas imágenes). La tabla `images` deberá actualizar la columna `url` para apuntar al nuevo origen.

## 4. Autenticación
El `AuthProvider.tsx` actualmente tiene un modo demo y está preparado para integrarse con cualquier sistema de tokens JWT.

---
**Arquitectura desacoplada**: Gracias a la extracción de lógica que hemos realizado hoy, el "corazón" de la aplicación (el medidor) es totalmente independiente de dónde se guarden los datos.
