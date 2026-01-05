# 🔐 Credenziali di Default

## Utente Admin

MDF crea automaticamente un utente admin al primo setup:

```
Email: admin@mdf.local
Password: nessuna (configura autenticazione nella tua app)
```

## Come Viene Creato

L'utente admin viene creato dallo script `prisma/seed.ts` quando esegui:

```bash
docker exec -it nextjs-app npm run prisma:seed
```

Oppure automaticamente se usi:
```bash
curl -sSL https://raw.githubusercontent.com/mccoy88f/mdf/main/setup.sh | bash -s -- mio-progetto
```

## Verifica Utente

Puoi verificare che l'utente esista:

### Via Prisma Studio
1. Apri http://localhost:5555
2. Click su "User"
3. Dovresti vedere: `admin@mdf.local`

### Via API
```bash
curl http://localhost:3000/api/users
```

### Via Database
```bash
docker exec -it nextjs-postgres psql -U appuser -d appdb -c "SELECT * FROM users;"
```

## Personalizzare l'Admin

Modifica `prisma/seed.ts` per cambiare le credenziali:

```typescript
const admin = await prisma.user.upsert({
  where: { email: 'tua-email@example.com' },
  update: {},
  create: {
    email: 'tua-email@example.com',
    name: 'Tuo Nome',
    // Aggiungi altri campi...
  },
})
```

Poi esegui:
```bash
docker exec -it nextjs-app npm run prisma:seed
```

## Aggiungere Autenticazione

L'utente admin di default **non ha password** perché MDF non include un sistema di autenticazione.

### Implementa Autenticazione

Puoi aggiungere autenticazione con:

#### Opzione 1: NextAuth.js (Consigliato)

```bash
# Aggiungi a packages.txt
echo "next-auth" >> packages.txt
echo "bcryptjs" >> packages.txt
echo "@types/bcryptjs" >> packages.txt

# Riavvia
docker-compose restart app
```

Poi segui: https://next-auth.js.org/getting-started/example

#### Opzione 2: Clerk

```bash
echo "@clerk/nextjs" >> packages.txt
docker-compose restart app
```

https://clerk.com/docs/quickstarts/nextjs

#### Opzione 3: Auth Manuale

Aggiungi campo password allo schema:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String?  // 👈 Campo password
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Aggiorna database:
```bash
docker exec -it nextjs-app npm run prisma:push
```

Implementa hashing password con bcrypt nel tuo codice.

## Reset Utente Admin

Per ricreare l'utente admin:

```bash
# Elimina utente esistente
docker exec -it nextjs-postgres psql -U appuser -d appdb -c "DELETE FROM users WHERE email='admin@mdf.local';"

# Ricrea
docker exec -it nextjs-app npm run prisma:seed
```

## Sicurezza

⚠️ **IMPORTANTE in Production:**

1. **Cambia l'email** admin da `admin@mdf.local` a una tua
2. **Aggiungi password** con sistema di autenticazione
3. **NON usare** credenziali di default in produzione
4. **Implementa** autenticazione robusta (NextAuth, Clerk, ecc.)

## Multiple Admin

Per creare più admin, modifica `seed.ts`:

```typescript
async function main() {
  // Admin 1
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin1@mdf.local' },
    update: {},
    create: {
      email: 'admin1@mdf.local',
      name: 'Admin 1',
    },
  })

  // Admin 2
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@mdf.local' },
    update: {},
    create: {
      email: 'admin2@mdf.local',
      name: 'Admin 2',
    },
  })

  console.log('✅ Created:', admin1.email, admin2.email)
}
```

## FAQs

### Perché non c'è password?

MDF è un template generico. L'autenticazione dipende dalle tue esigenze (social login, email/password, magic link, ecc.). Implementa il sistema che preferisci.

### Posso usare un altro email?

Sì! Modifica `prisma/seed.ts` e cambia `admin@mdf.local` con la tua email.

### Come aggiungo ruoli (admin, user, guest)?

Aggiungi un campo enum allo schema:

```prisma
enum Role {
  ADMIN
  USER
  GUEST
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  role  Role   @default(USER)
  // ...
}
```

Poi:
```bash
docker exec -it nextjs-app npm run prisma:push
```

---

**🔐 Implementa sempre autenticazione robusta prima di andare in produzione!**
