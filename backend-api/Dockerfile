# Usamos una imagen de Node.js optimizada
FROM node:20-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalamos todas las dependencias (incluyendo dev)
RUN npm install

# Copiamos el código fuente
COPY src/ ./src/

# Compilamos TypeScript a JavaScript
RUN npm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM node:20-alpine

WORKDIR /app

# Copiamos solo lo necesario para ejecutar
COPY package*.json ./
RUN npm ci --only=production

# Copiamos el código compilado desde la etapa builder
COPY --from=builder /app/dist ./dist

# Exponemos el puerto de la API
EXPOSE 4000

# Comando para arrancar
CMD ["node", "dist/index.js"]
