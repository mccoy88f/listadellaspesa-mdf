# 🔄 Istruzioni Aggiornamento

Dopo le nuove funzionalità, segui questi passaggi:

## 1. Avvia i Container (se non già avviati)

```bash
docker-compose up -d
```

## 2. Installa le Nuove Dipendenze

Le nuove funzionalità richiedono `nodemailer`:

```bash
docker exec -it nextjs-app npm install
```

## 3. Aggiorna il Database

Lo schema Prisma è stato modificato (aggiunto campo `completedBy`):

```bash
docker exec -it nextjs-app npm run prisma:generate
docker exec -it nextjs-app npm run prisma:push
```

## 4. Riavvia l'App (per applicare le nuove dipendenze)

```bash
docker-compose restart app
```

Oppure ricostruisci se necessario:

```bash
docker-compose up --build -d
```

## ✅ Verifica

Dopo questi passaggi:
- ✅ Notifiche email funzionanti (se configurate SMTP)
- ✅ Cambio lingua funzionante
- ✅ Suggerimenti prodotti simili
- ✅ Storico acquisti generale
- ✅ Modifica articoli
- ✅ Prodotti completati divisi per giorno

## 📝 Note

- **Hot Reload**: Le modifiche al codice vengono applicate automaticamente (non serve riavviare)
- **Nuove Dipendenze**: Richiedono `npm install` e riavvio
- **Schema Database**: Richiede `prisma:push` per applicare le modifiche

## 🚀 Comando Rapido (Tutto in Uno)

```bash
docker-compose up -d && \
docker exec -it nextjs-app npm install && \
docker exec -it nextjs-app npm run prisma:generate && \
docker exec -it nextjs-app npm run prisma:push && \
docker-compose restart app
```
