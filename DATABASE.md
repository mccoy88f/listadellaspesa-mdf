# 🗄️ Gestione Database

## Primo Avvio - Database Vuoto

Quando avvii il progetto per la prima volta, **Prisma Studio sarà vuoto** perché:
1. ✅ PostgreSQL è stato avviato
2. ✅ Il database `appdb` esiste
3. ❌ Le tabelle NON sono ancora state create

## 🚀 Inizializzare il Database

### Step 1: Creare le Tabelle

```bash
# Entra nel container
docker exec -it nextjs-app sh

# Crea le tabelle da schema.prisma
npm run prisma:push

# Esci
exit
```

Ora Prisma Studio mostra le tabelle `users` e `posts` (vuote).

### Step 2: Utente Admin (Automatico)

Lo script `setup.sh` crea automaticamente un utente admin:
- Email: `admin@example.com`
- Nome: `Admin`

**Per crearlo manualmente:**
```bash
docker exec -it nextjs-app npm run prisma:seed
```

### Step 3: Dati di Esempio (Opzionale)

Se vuoi popolare con 3 utenti e 3 post di esempio:

```bash
docker exec -it nextjs-app npm run prisma:seed-example
```

**Risultato:** Prisma Studio ora mostra:
- 4 Users (Admin + 3 utenti esempio)
- 3 Posts (2 pubblicati, 1 bozza)

## 📊 Verificare i Dati

### Via Prisma Studio (GUI)

1. Apri: http://localhost:5555
2. Click su "User" → vedi gli utenti
3. Click su "Post" → vedi i post

### Via API

```bash
# Ottieni tutti gli utenti
curl http://localhost:3000/api/users

# Ottieni un singolo utente
curl http://localhost:3000/api/users/1
```

## ✏️ Aggiungere Dati Manualmente

### Da Prisma Studio

1. Apri http://localhost:5555
2. Click su "User" → "Add record"
3. Compila i campi
4. Click "Save"

### Da API (POST)

```bash
# Crea un nuovo utente
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

### Da Console Node

```bash
docker exec -it nextjs-app sh

# Avvia console Node con Prisma
node
> const { PrismaClient } = require('@prisma/client')
> const prisma = new PrismaClient()
> await prisma.user.create({ data: { email: 'nuovo@example.com', name: 'Nuovo Utente' } })
> .exit
```

## 🔄 Reset Database

### Elimina tutti i dati (mantieni tabelle)

```bash
docker exec -it nextjs-app sh

# Cancella tutti i record
npx prisma db push --force-reset

# Ripopola con seed
npm run prisma:seed
```

### Elimina e ricrea tutto

```bash
# Ferma i container
docker-compose down

# Elimina il volume del database
docker volume rm nextjs-starter-template_postgres_data

# Riavvia
docker-compose up -d

# Ricrea tabelle
docker exec -it nextjs-app npm run prisma:push

# Popola
docker exec -it nextjs-app npm run prisma:seed
```

## 📝 Modificare lo Schema

### 1. Modifica `prisma/schema.prisma`

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  // 👇 Aggiungi un nuovo campo
  age       Int?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Applica le modifiche

```bash
# Aggiorna il database
docker exec -it nextjs-app npm run prisma:push

# Rigenera il client Prisma
docker exec -it nextjs-app npm run prisma:generate

# Riavvia app (per rilevare i nuovi tipi)
docker-compose restart app
```

## 🎯 Comandi Utili

```bash
# Apri Prisma Studio
docker exec -it nextjs-app npm run prisma:studio

# Visualizza lo stato del database
docker exec -it nextjs-app npx prisma db status

# Genera SQL delle migrazioni
docker exec -it nextjs-app npx prisma migrate dev --name nome-migrazione

# Formatta schema.prisma
docker exec -it nextjs-app npx prisma format

# Valida schema.prisma
docker exec -it nextjs-app npx prisma validate
```

## 🔍 Troubleshooting

### "Prisma Studio mostra errore connessione"

```bash
# Verifica che PostgreSQL sia in esecuzione
docker-compose ps

# Verifica i logs del database
docker-compose logs db

# Riavvia tutto
docker-compose restart
```

### "Tabelle non visibili in Prisma Studio"

```bash
# Verifica che le tabelle esistano
docker exec -it nextjs-postgres psql -U appuser -d appdb -c "\dt"

# Se vuote, crea le tabelle
docker exec -it nextjs-app npm run prisma:push
```

### "Errore: Schema non sincronizzato"

```bash
# Rigenera Prisma Client
docker exec -it nextjs-app npm run prisma:generate

# Applica schema al DB
docker exec -it nextjs-app npm run prisma:push
```

## 📊 Seed Personalizzato

Modifica `prisma/seed.ts` per i tuoi dati:

```typescript
async function main() {
  // I tuoi dati personalizzati
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tuodominio.com',
      name: 'Admin',
      posts: {
        create: [
          {
            title: 'Benvenuto',
            content: 'Questo è il sito ufficiale...',
            published: true,
          },
        ],
      },
    },
  })
  
  console.log('✅ Seeded:', admin.name)
}
```

Poi esegui:
```bash
docker exec -it nextjs-app npm run prisma:seed
```

## 🎁 Backup e Restore

### Backup

```bash
# Backup del database
docker exec nextjs-postgres pg_dump -U appuser appdb > backup.sql

# Backup solo dati
docker exec nextjs-postgres pg_dump -U appuser --data-only appdb > backup-data.sql
```

### Restore

```bash
# Restore completo
cat backup.sql | docker exec -i nextjs-postgres psql -U appuser appdb

# Restore solo dati
cat backup-data.sql | docker exec -i nextjs-postgres psql -U appuser appdb
```

---

**💡 Tip:** Usa sempre Prisma Studio per visualizzare e modificare i dati durante lo sviluppo!
