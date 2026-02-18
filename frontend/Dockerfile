# --- ETAPA DE CONSTRUCCIÓN ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Argumento para la URL de la API (se pasa en tiempo de construcción)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construimos la aplicación
RUN npm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM nginx:alpine

# Copiamos los archivos estáticos desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos una configuración de Nginx básica para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
