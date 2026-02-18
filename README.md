# CortinasExpress Medidor v2.0

Sistema profesional de medición para proyectos de reformas textiles, optimizado para tablets y móviles (PWA).

## 🚀 Estructura del Proyecto

El proyecto utiliza una arquitectura de Monorepo para separar el frontend, el backend (Supabase) y el código compartido.

- **`frontend/`**: Aplicación React + Vite + Tailwind CSS.
  - `src/features/`: Lógica organizada por funcionalidades (wizard, projects, auth, images).
  - `src/components/ui/`: Componentes de interfaz reutilizables.
- **`backend/`**: Configuraciones de Supabase.
  - `supabase/migrations/`: Scripts SQL para la base de datos (PostgreSQL).
  - `config/`: Configuración de buckets de almacenamiento.
- **`shared/`**: Tipos y constantes compartidos entre frontend y backend.

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router 7.
- **Backend (BaaS)**: Supabase (Auth, PostgreSQL, Storage).
- **Utilidades**: jsPDF (Informes), Vitest (Testing), CompressorJS (Imágenes).

## 🔧 Configuración Inicial

1. **Instalar dependencias**:
   ```bash
   npm install:all
   ```

2. **Variables de Entorno**:
   Crea un archivo `frontend/.env.local` basado en `.env.example`:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

3. **Base de Datos**:
   Ejecuta los scripts de `backend/supabase/migrations/` en el SQL Editor de tu proyecto de Supabase.

## 💻 Desarrollo

Para levantar el servidor de desarrollo del frontend:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`. Está configurada para ser accesible en red local (host: true) para pruebas en dispositivos móviles.

## 🧪 Testing

Para ejecutar los tests:
```bash
cd frontend
npm test
```
