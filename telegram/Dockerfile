FROM node:18-alpine

WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar el cache de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Comando para iniciar el bot
CMD ["node", "bot-minimal.js"]
