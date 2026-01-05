# 🚀 Quick Start - 3 Comandi

## Avvio Rapido

```bash
# 1. Avvia tutto con Docker
docker-compose up -d

# 2. Inizializza database (prima volta)
docker exec -it nextjs-app npm run prisma:push

# 3. (Opzionale) Crea utente admin
docker exec -it nextjs-app npm run prisma:seed

# 4. Apri il browser
# App: http://localhost:3000
# Database GUI: http://localhost:5555
# Admin: admin@mdf.local
```

## Aggiungere Componenti UI

```bash
# Entra nel container
docker exec -it nextjs-app sh

# Aggiungi componenti Shadcn/UI
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
```

## Fermare tutto

```bash
docker-compose down
```

## Nuovo Progetto da questo Template

```bash
# Copia il template
cp -r nextjs-starter-template mio-nuovo-progetto
cd mio-nuovo-progetto

# Modifica package.json (nome progetto)
# Modifica prisma/schema.prisma (tabelle database)

# Avvia
docker-compose up -d
docker exec -it nextjs-app npm run prisma:push
```

---

✅ **Fatto!** Ora puoi sviluppare su http://localhost:3000

Per dettagli completi vedi [README.md](README.md)
