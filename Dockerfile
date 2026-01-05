FROM node:20-alpine

WORKDIR /app

# Installa dipendenze di sistema necessarie
RUN apk add --no-cache libc6-compat openssl

# Copia script di entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copia package files
COPY package*.json ./
COPY prisma ./prisma/

# Installa dipendenze (primo build)
RUN npm install

# Genera Prisma Client (primo build)
RUN npx prisma generate

# Copia il resto del codice
COPY . .

# Esponi porte
EXPOSE 3000 5555

# Usa entrypoint personalizzato
ENTRYPOINT ["docker-entrypoint.sh"]

# Default command
CMD ["npm", "run", "dev"]
