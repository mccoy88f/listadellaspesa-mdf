# 🐳 Deploy su Portainer - Lista della Spesa MDF

Guida completa per deployare l'applicazione Lista della Spesa tramite Portainer.

## 📋 Prerequisiti

- Portainer installato e funzionante
- Accesso alla repository GitHub: `https://github.com/mccoy88f/listadellaspesa-mdf`
- Porte disponibili: 3000 (app), 5555 (Prisma Studio), 5432 (PostgreSQL - opzionale)

## 🚀 Metodo 1: Docker Compose Stack (Consigliato)

### Passo 1: Clona la Repository sul Server

Prima di creare lo stack, clona la repository sul server dove gira Portainer:

```bash
# SSH sul server
ssh user@tuo-server

# Clona la repository
cd /opt  # o un'altra directory a tua scelta
git clone https://github.com/mccoy88f/listadellaspesa-mdf.git
cd listadellaspesa-mdf
```

### Passo 2: Crea un nuovo Stack in Portainer

1. Accedi a Portainer
2. Vai su **Stacks** (menu laterale)
3. Clicca **Add stack**
4. Nome stack: `listadellaspesa-mdf`

### Passo 3: Configura lo Stack

**Opzione A: Path Locale (Consigliato)**

1. Seleziona **Repository**
2. Repository URL: `https://github.com/mccoy88f/listadellaspesa-mdf.git`
3. Repository reference: `main`
4. Compose path: `docker-compose.yml`
5. **Build method**: Local filesystem
6. **Compose file path**: `/opt/listadellaspesa-mdf/docker-compose.yml` (o il path dove hai clonato)
7. Auto-update: ✅ Attiva (opzionale)

**Opzione B: Web Editor**

1. Seleziona **Web editor**
2. Vai su GitHub e copia il contenuto di `docker-compose.yml`:
   - URL: `https://raw.githubusercontent.com/mccoy88f/listadellaspesa-mdf/main/docker-compose.yml`
3. Incolla nell'editor di Portainer
4. **Nota**: Con Web Editor, devi configurare i volumi manualmente o clonare la repo

### Passo 3: Configura le Variabili d'Ambiente (Opzionale)

Se vuoi personalizzare le credenziali del database, aggiungi queste variabili:

```
POSTGRES_USER=appuser
POSTGRES_PASSWORD=apppassword
POSTGRES_DB=appdb
DATABASE_URL=postgresql://appuser:apppassword@db:5432/appdb
NODE_ENV=production
```

### Passo 4: Deploy lo Stack

1. Clicca **Deploy the stack**
2. Attendi che i container vengano creati e avviati
3. Verifica lo stato nella dashboard

### Passo 5: Verifica l'Applicazione

✅ **Il database viene inizializzato automaticamente!**

Il servizio `init` nel docker-compose esegue automaticamente:
- `npm run prisma:push` - Crea le tabelle
- `npm run prisma:seed` - Crea l'utente admin

Non devi eseguire manualmente questi comandi! Il container `nextjs-init` li esegue automaticamente al primo avvio e poi termina.

- **App**: `http://TUO-IP:3000` o `http://TUO-DOMINIO:3000`
- **Prisma Studio**: `http://TUO-IP:5555` o `http://TUO-DOMINIO:5555`

**Credenziali Admin di default:**
- Email: `admin@mdf.local`
- Password: `admin123`

---

## 🔧 Metodo 2: Container Individuali

Se preferisci creare i container manualmente:

### 1. Crea la Network

1. Vai su **Networks**
2. Clicca **Add network**
3. Nome: `app-network`
4. Driver: `bridge`
5. Clicca **Create the network**

### 2. Crea il Volume per PostgreSQL

1. Vai su **Volumes**
2. Clicca **Add volume**
3. Nome: `postgres_data`
4. Clicca **Create the volume**

### 3. Crea il Container PostgreSQL

1. Vai su **Containers** → **Add container**
2. Nome: `nextjs-postgres`
3. Image: `postgres:16-alpine`
4. **Network**: Seleziona `app-network`
5. **Volumes**: 
   - `/var/lib/postgresql/data` → `postgres_data`
6. **Port mapping**:
   - `5432:5432` (opzionale, solo se vuoi accesso esterno)
7. **Environment variables**:
   ```
   POSTGRES_USER=appuser
   POSTGRES_PASSWORD=apppassword
   POSTGRES_DB=appdb
   ```
8. **Restart policy**: `Unless stopped`
9. Clicca **Deploy the container**

### 4. Crea il Container App

1. Vai su **Containers** → **Add container**
2. Nome: `nextjs-app`
3. **Build method**: Repository
   - Repository: `https://github.com/mccoy88f/listadellaspesa-mdf.git`
   - Reference: `main`
   - Dockerfile path: `Dockerfile`
4. **Network**: `app-network`
5. **Port mapping**: `3000:3000`
6. **Environment variables**:
   ```
   DATABASE_URL=postgresql://appuser:apppassword@nextjs-postgres:5432/appdb
   NODE_ENV=development
   ```
7. **Volumes**:
   - Mount type: `bind`
   - Container: `/app`
   - Host: `/path/to/repo` (dove hai clonato la repo)
8. **Restart policy**: `Unless stopped`
9. **Command**: `npm run dev`
10. Clicca **Deploy the container**

### 5. Crea il Container Prisma Studio

1. Vai su **Containers** → **Add container**
2. Nome: `prisma-studio`
3. **Build method**: Repository (stesso del container app)
4. **Network**: `app-network`
5. **Port mapping**: `5555:5555`
6. **Environment variables**:
   ```
   DATABASE_URL=postgresql://appuser:apppassword@nextjs-postgres:5432/appdb
   ```
7. **Command**: `npx prisma studio --port 5555 --hostname 0.0.0.0`
8. Clicca **Deploy the container**

---

## 🔄 Aggiornamenti

### Aggiornare lo Stack

1. Vai su **Stacks** → `listadellaspesa-mdf`
2. Clicca **Editor**
3. Se hai usato Repository Git, clicca **Pull and redeploy**
4. Se hai usato Web Editor, aggiorna il contenuto e clicca **Update the stack**

### Rebuild dopo modifiche al codice

1. Vai su **Containers** → `nextjs-app`
2. Clicca **Recreate**
3. Seleziona **Pull latest image** (se usi immagini)
4. Oppure **Rebuild** (se usi build da repository)

---

## 🛠️ Comandi Utili in Portainer

### Eseguire comandi nel container

1. **Containers** → Seleziona container → **Console**
2. Oppure **Exec** per comando rapido

### Logs

1. **Containers** → Seleziona container → **Logs**
2. Oppure **Dashboard** → Vedi logs in tempo reale

### Restart container

1. **Containers** → Seleziona container → **Restart**

### Stop/Start stack

1. **Stacks** → Seleziona stack → **Stop** / **Start**

---

## 🔐 Configurazione Production

Per production, modifica queste variabili:

```
NODE_ENV=production
DATABASE_URL=postgresql://appuser:apppassword@db:5432/appdb
```

E cambia il comando del container app da:
```
npm run dev
```
a:
```
npm run build && npm start
```

---

## 🐛 Troubleshooting

### Container non si avvia

1. Controlla **Logs** del container
2. Verifica che il database sia avviato prima dell'app
3. Controlla le **Environment variables**

### Database non si connette

1. Verifica che i container siano sulla stessa network (`app-network`)
2. Controlla che `DATABASE_URL` usi il nome del container (`db` o `nextjs-postgres`)
3. Verifica i logs del container database

### Porte già in uso

1. Modifica le porte in **Port mapping**
2. Esempio: `3001:3000` invece di `3000:3000`

### Build fallisce

1. Verifica che la repository sia accessibile
2. Controlla che il Dockerfile sia presente
3. Vedi i logs del build in **Images** → **Build logs**

---

## 📝 Note Importanti

- **Volume mounting**: Se usi bind mount, assicurati che il percorso esista sul server
- **Network**: Tutti i container devono essere sulla stessa network per comunicare
- **Database**: Il database deve essere avviato prima dell'app
- **Prisma**: Esegui sempre `prisma:push` dopo il primo deploy

---

## ✅ Checklist Deploy

- [ ] Stack creato in Portainer
- [ ] Container database avviato
- [ ] Container init completato (inizializza automaticamente il database)
- [ ] Container app avviato
- [ ] Container Prisma Studio avviato (opzionale)
- [ ] App accessibile su porta 3000
- [ ] Prisma Studio accessibile su porta 5555

**Nota**: Il database viene inizializzato automaticamente dal container `init`. Non serve eseguire manualmente `prisma:push` e `prisma:seed`.

---

**Il tuo progetto è ora deployato su Portainer! 🎉**
