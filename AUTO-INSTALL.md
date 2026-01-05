# 🤖 Installazione Automatica Pacchetti

Il template include un sistema di **installazione automatica** dei pacchetti all'avvio del container. Nessun comando manuale necessario!

## 📦 Come Funziona

All'avvio del container Docker, lo script `docker-entrypoint.sh` esegue automaticamente:

1. ✅ Installa pacchetti di sistema da `system-packages.txt`
2. ✅ Installa pacchetti npm da `packages.txt`
3. ✅ Aggiorna dipendenze se `package.json` è cambiato
4. ✅ Rigenera Prisma Client se `schema.prisma` è cambiato
5. ✅ Avvia l'applicazione

**Zero comandi manuali richiesti!**

## 🎯 Uso Base

### Aggiungere Pacchetti NPM

Modifica il file `packages.txt`:

```txt
# packages.txt
axios
lodash
date-fns
zod
react-hook-form@7.48.0
@tanstack/react-query
```

Poi riavvia:

```bash
docker-compose restart app
```

I pacchetti verranno installati automaticamente all'avvio! 🎉

### Aggiungere Pacchetti di Sistema

Modifica il file `system-packages.txt`:

```txt
# system-packages.txt
curl
git
imagemagick
ffmpeg
postgresql-client
```

Poi rebuilda (solo la prima volta):

```bash
docker-compose up --build
```

## 📝 Esempi Pratici

### Esempio 1: Progetto con Autenticazione

```txt
# packages.txt
next-auth
bcryptjs
jsonwebtoken
@types/bcryptjs
@types/jsonwebtoken
```

```bash
# Riavvia e i pacchetti vengono installati
docker-compose restart app
```

### Esempio 2: Progetto con Grafici

```txt
# packages.txt
recharts
chart.js
react-chartjs-2
```

### Esempio 3: Progetto con Upload Immagini

```txt
# system-packages.txt
imagemagick
```

```txt
# packages.txt
sharp
multer
@types/multer
```

### Esempio 4: Progetto E-commerce

```txt
# packages.txt
stripe
@stripe/stripe-js
nodemailer
@types/nodemailer
react-hot-toast
zustand
```

## 🔄 Workflow Completo

### Scenario: Aggiungi nuove librerie al progetto esistente

```bash
# 1. Modifica packages.txt
nano packages.txt
# Aggiungi: axios, react-hook-form, zod

# 2. Riavvia il container
docker-compose restart app

# 3. Verifica i logs
docker-compose logs -f app

# Output:
# 📦 Installazione pacchetti npm aggiuntivi: axios react-hook-form zod
# ✅ Pronto!

# 4. I pacchetti sono già disponibili!
```

### Scenario: Nuovo progetto da template

```bash
# 1. Clona da GitHub
git clone https://github.com/mccoy88f/nextjs-starter-template.git mio-progetto
cd mio-progetto

# 2. Personalizza packages.txt con le tue librerie
echo "axios" >> packages.txt
echo "react-query" >> packages.txt

# 3. Avvia (installa tutto automaticamente)
docker-compose up -d

# Fatto! I pacchetti sono già installati
```

## 🎛️ Opzioni Avanzate

### Versioni Specifiche

```txt
# packages.txt
axios@1.6.0
lodash@^4.17.21
next-auth@~4.24.0
```

### Pacchetti Dev

Per pacchetti dev-only, aggiungili direttamente a `package.json`:

```json
{
  "devDependencies": {
    "@types/node": "^22.0.0",
    "eslint": "^8.57.0"
  }
}
```

Verranno installati automaticamente al riavvio.

### Reinstallare Tutto

Se vuoi forzare la reinstallazione:

```bash
# Rimuovi i file di cache
docker-compose exec app rm -f .npm-installed .packages-installed

# Riavvia
docker-compose restart app
```

## 🔍 Verifica Installazione

### Controllare pacchetti installati

```bash
# Entra nel container
docker exec -it nextjs-app sh

# Verifica pacchetto npm
npm list axios

# Verifica pacchetto di sistema
which git
```

### Logs in tempo reale

```bash
# Vedi cosa viene installato
docker-compose logs -f app

# Output esempio:
# 📦 Installazione pacchetti npm aggiuntivi: axios lodash
# + axios@1.6.2
# + lodash@4.17.21
# ✅ Pronto!
```

## 🚫 Cosa NON va in packages.txt

❌ **Non aggiungere pacchetti già in package.json**
- Se è già in `package.json`, viene installato automaticamente

❌ **Non usare per pacchetti con build complessa**
- Esempio: `node-gyp`, `canvas`, `sqlite3` (meglio nel Dockerfile)

❌ **Non lasciare righe vuote tra pacchetti**
- Una riga = un pacchetto

## ✅ Best Practices

1. **Commenta i pacchetti**: Spiega perché li usi

```txt
# Gestione date
date-fns

# Validazione form
zod
react-hook-form
```

2. **Versionamento**: Specifica versioni per stabilità

```txt
axios@1.6.0
lodash@4.17.21
```

3. **Commit dei file**: Committa `packages.txt` nel repository

```bash
git add packages.txt system-packages.txt
git commit -m "Add required packages"
```

4. **Rebuild periodico**: Ogni tanto rebuilda da zero

```bash
docker-compose down
docker-compose up --build
```

## 🎁 Pacchetti Utili Pre-configurati

### API & HTTP

```txt
axios
```

### Validazione & Form

```txt
zod
react-hook-form
```

### State Management

```txt
zustand
@tanstack/react-query
```

### UI Utilities

```txt
clsx
class-variance-authority
```

### Date & Time

```txt
date-fns
```

### Utilities

```txt
lodash
```

## 🔧 Troubleshooting

### "Pacchetto non trovato dopo il riavvio"

```bash
# Verifica che packages.txt sia valido
cat packages.txt

# Forza reinstallazione
docker-compose exec app rm .packages-installed
docker-compose restart app
```

### "Build fallisce con errore di compilazione"

Alcuni pacchetti richiedono dipendenze di sistema:

```txt
# system-packages.txt
python3
make
g++
```

### "Voglio rimuovere un pacchetto"

```bash
# Rimuovi da packages.txt
nano packages.txt

# Rimuovi manualmente
docker exec -it nextjs-app npm uninstall nome-pacchetto

# O rebuilda
docker-compose up --build
```

## 📊 Performance

**Impatto sul tempo di avvio:**

| Pacchetti | Primo Avvio | Avvii Successivi |
|-----------|-------------|------------------|
| 0         | ~10s        | ~3s              |
| 1-5       | ~15s        | ~3s              |
| 5-10      | ~25s        | ~3s              |
| 10+       | ~40s        | ~3s              |

I pacchetti vengono installati **solo al primo avvio**, poi sono in cache!

---

**🎉 Ora puoi aggiungere librerie senza toccare la console!**
