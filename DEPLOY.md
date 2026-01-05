# 🚀 Deploy su GitHub e Uso Remoto

## Pubblicare il Template su GitHub

### 1. Crea un nuovo repository su GitHub

Vai su https://github.com/new e crea un repository chiamato `mdf`

### 2. Pubblica il codice

Scegli il metodo che preferisci:

#### **Metodo A: GitHub CLI (consigliato)**

```bash
cd nextjs-starter-template

# Autentica (solo prima volta)
gh auth login

# Inizializza e pubblica
git init
git add .
git commit -m "Initial commit: MDF (My Development Framework)"
gh repo create mdf --public --source=. --push
```

#### **Metodo B: SSH**

```bash
cd nextjs-starter-template

# Prima volta: configura SSH
ssh-keygen -t ed25519 -C "tua-email@example.com"
cat ~/.ssh/id_ed25519.pub  # Aggiungi su https://github.com/settings/keys

# Inizializza Git
git init
git add .
git commit -m "Initial commit: MDF (My Development Framework)"

# Collega al repository remoto (sostituisci TUO-USERNAME)
git remote add origin git@github.com:mccoy88f/mdf.git

# Push
git branch -M main
git push -u origin main
```

#### **Metodo C: HTTPS con Token**

```bash
cd nextjs-starter-template

# Crea token su: https://github.com/settings/tokens (scope: repo)

# Inizializza Git
git init
git add .
git commit -m "Initial commit: MDF (My Development Framework)"

# Collega al repository remoto (sostituisci TUO-USERNAME)
git remote add origin https://github.com/mccoy88f/mdf.git

# Push (username + TOKEN come password)
git branch -M main
git push -u origin main
```

## 🎯 Usare il Template da Remoto

### Metodo 1: Setup Automatico con Script (Consigliato)

```bash
# Un solo comando per creare un nuovo progetto
curl -sSL https://raw.githubusercontent.com/TUO-USERNAME/nextjs-starter-template/main/setup.sh | bash -s -- nome-mio-progetto

# Esempio concreto
curl -sSL https://raw.githubusercontent.com/TUO-USERNAME/nextjs-starter-template/main/setup.sh | bash -s -- gestionale-clienti
```

Lo script farà automaticamente:
- ✅ Clona il repository
- ✅ Personalizza il nome progetto
- ✅ Avvia Docker Compose
- ✅ Inizializza il database
- ✅ Ti dice dove trovare l'app

### Metodo 2: Uso Diretto con Docker Compose Remoto

Puoi avviare il progetto direttamente da GitHub senza clonare:

```bash
# Crea solo docker-compose.yml nella tua directory
mkdir mio-progetto && cd mio-progetto

# Scarica il docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/TUO-USERNAME/nextjs-starter-template/main/docker-compose.yml

# Avvia
docker-compose up -d
```

**Nota**: Questo metodo scarica comunque il codice nel primo build.

### Metodo 3: Clone Manuale Standard

```bash
# Clona il repository
git clone https://github.com/TUO-USERNAME/nextjs-starter-template.git mio-progetto
cd mio-progetto

# Rimuovi la connessione al template
rm -rf .git
git init

# Avvia
docker-compose up -d
docker exec -it nextjs-app npm run prisma:push
```

## 🔧 Configurazione Post-Clone

### 1. Personalizza il progetto

```bash
# Modifica package.json
{
  "name": "il-tuo-nome-progetto",
  ...
}

# Modifica prisma/schema.prisma con le tue tabelle
model TuoModello {
  id    Int    @id @default(autoincrement())
  ...
}
```

### 2. Applica le modifiche al database

```bash
docker exec -it nextjs-app npm run prisma:push
```

### 3. Crea il tuo repository

```bash
# Se hai usato SSH
git remote remove origin  # Rimuovi link al template
git remote add origin git@github.com:TUO-USERNAME/il-tuo-progetto.git
git add .
git commit -m "Initial commit from template"
git push -u origin main

# Se hai usato HTTPS con token
git remote remove origin
git remote add origin https://github.com/TUO-USERNAME/il-tuo-progetto.git
git add .
git commit -m "Initial commit from template"
git push -u origin main  # Username + TOKEN come password

# Se hai usato GitHub CLI
gh repo create il-tuo-progetto --public --source=. --push
```

## 🌐 Uso come Template GitHub

### Rendi il repository un Template ufficiale

1. Vai su GitHub nel tuo repository
2. Settings → Template repository → ✅ Spunta "Template repository"

Ora chiunque può usarlo cliccando "Use this template" su GitHub!

### Creare progetti dal Template GitHub

```bash
# Su GitHub: Click "Use this template" → "Create a new repository"
# Poi clona il nuovo repository
git clone https://github.com/TUO-USERNAME/nuovo-progetto.git
cd nuovo-progetto

# Avvia
docker-compose up -d
docker exec -it nextjs-app npm run prisma:push
```

## 📦 Deploy su Server Remoto

### Deploy su VPS/Server con Docker

```bash
# Sul server
git clone https://github.com/TUO-USERNAME/nextjs-starter-template.git app
cd app

# Crea .env per production
cp .env.example .env
nano .env  # Modifica con dati production

# Avvia in production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Con Docker Swarm/Kubernetes

Il template è già compatibile con orchestratori. Basta adattare il `docker-compose.yml`.

## 🔄 Aggiornare il Template

### Per aggiornare tutti i tuoi progetti quando modifichi il template:

```bash
# Nel repository del template
git add .
git commit -m "feat: nuove funzionalità"
git push  # Usa il metodo che hai configurato (SSH/HTTPS/gh)

# Rebuilda i container nei progetti che usano il template
docker-compose up --build -d
```

## 🎁 Bonus: GitHub Actions per CI/CD

Aggiungi `.github/workflows/ci.yml` per test automatici:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: docker-compose build
      - name: Test
        run: docker-compose up -d && sleep 10 && curl http://localhost:3000
```

## 📝 Checklist Post-Deploy

- [ ] Repository pubblicato su GitHub
- [ ] Script setup.sh funzionante
- [ ] README.md aggiornato con il tuo username
- [ ] Repository impostato come Template
- [ ] .env.example aggiornato con variabili necessarie
- [ ] Testato il comando curl remoto

---

**Il tuo template è ora riutilizzabile da qualsiasi macchina con un solo comando!** 🎉
