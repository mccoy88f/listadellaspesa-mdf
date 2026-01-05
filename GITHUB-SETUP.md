# 🚀 Pubblicazione Rapida su GitHub

## Step by Step

### 1️⃣ Crea il repository su GitHub

1. Vai su https://github.com/new
2. Nome repository: `mdf`
3. Descrizione: "My Development Framework - Template Next.js + PostgreSQL + Prisma + Shadcn/UI"
4. Pubblico o Privato (come preferisci)
5. ❌ NON aggiungere README/gitignore/license (li abbiamo già)
6. Click "Create repository"

### 2️⃣ Pubblica il codice

Scegli uno dei 3 metodi:

#### **Metodo 1: GitHub CLI (più semplice) ⭐ CONSIGLIATO**

```bash
# Estrai lo ZIP
unzip nextjs-starter-template.zip
cd nextjs-starter-template

# Installa GitHub CLI (se non ce l'hai)
# Ubuntu/Debian:
sudo apt install gh
# macOS:
brew install gh
# Windows: scarica da https://cli.github.com

# Autentica con GitHub (solo la prima volta)
gh auth login
# Seleziona: GitHub.com → HTTPS → Login with browser

# Inizializza Git
git init
git add .
git commit -m "Initial commit: MDF (My Development Framework)"

# Crea repository e fai push automaticamente
gh repo create mdf --public --source=. --push
```

#### **Metodo 2: SSH (sicuro, nessuna password)**

**Prima volta?** Segui la guida completa: [SSH-SETUP.md](SSH-SETUP.md)

```bash
# Prima volta: genera chiave SSH
ssh-keygen -t ed25519 -C "tua-email@example.com"
# Premi Enter per accettare il percorso predefinito
# (Opzionale) Inserisci una passphrase

# Copia la chiave pubblica
cat ~/.ssh/id_ed25519.pub
# Copia tutto l'output

# Aggiungi su GitHub:
# 1. Vai su: https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Incolla la chiave
# 4. Click "Add SSH key"

# Ora pubblica il codice
cd nextjs-starter-template
git init
git add .
git commit -m "Initial commit: Next.js starter template"

# Usa SSH invece di HTTPS
git remote add origin git@github.com:mccoy88f/mdf.git

# Push
git branch -M main
git push -u origin main
```

#### **Metodo 3: HTTPS con Personal Access Token**

```bash
# Crea un token su GitHub:
# 1. Vai su: https://github.com/settings/tokens
# 2. Click "Generate new token (classic)"
# 3. Nome: "Git Push Token"
# 4. Seleziona scope: ✅ repo (tutti)
# 5. Click "Generate token"
# 6. COPIA IL TOKEN (lo vedrai solo una volta!)

cd nextjs-starter-template
git init
git add .
git commit -m "Initial commit: Next.js starter template"

# Sostituisci TUO-USERNAME con il tuo username GitHub
git remote add origin https://github.com/mccoy88f/mdf.git

# Push (ti chiederà credenziali)
git branch -M main
git push -u origin main

# Quando richiesto:
# Username: mccoy88f
# Password: [INCOLLA IL TOKEN, NON la password di GitHub!]
```

**⚠️ IMPORTANTE**: GitHub non accetta più password normali dal 2021. Devi usare un Personal Access Token o SSH.

### 3️⃣ Configura come Template (Opzionale)

1. Su GitHub vai al tuo repository
2. Click **Settings** (in alto a destra)
3. Sezione **General**
4. Spunta ✅ **Template repository**
5. Save

### 4️⃣ Aggiorna lo script setup.sh

Nel file `setup.sh`, sostituisci `TUO-USERNAME` con il tuo username GitHub:

```bash
# Cerca questa riga:
git clone https://github.com/TUO-USERNAME/nextjs-starter-template.git "$PROJECT_NAME"

# Cambiala con:
git clone https://github.com/il-tuo-username/nextjs-starter-template.git "$PROJECT_NAME"
```

Poi:
```bash
git add setup.sh
git commit -m "Update GitHub username in setup script"
git push
```

### 5️⃣ Testa il setup remoto

```bash
# Da un'altra directory, prova:
curl -sSL https://raw.githubusercontent.com/mccoy88f/mdf/main/setup.sh | bash -s -- test-progetto

# Se funziona, sei pronto! 🎉
```

## 🎯 Ora puoi creare progetti con un solo comando!

```bash
# Crea un nuovo progetto da GitHub
curl -sSL https://raw.githubusercontent.com/mccoy88f/mdf/main/setup.sh | bash -s -- nome-progetto

# Oppure usa "Use this template" su GitHub
```

## 📝 Personalizzazioni Opzionali

### Badge per README

Aggiungi questi badge in cima al README.md:

```markdown
![GitHub](https://img.shields.io/github/license/mccoy88f/mdf)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
```

### GitHub Actions

Il file `.github/workflows/ci.yml` è già incluso! Ad ogni push verrà:
- ✅ Buildato il progetto
- ✅ Testata l'app
- ✅ Verificata la connessione al database

## 🔄 Aggiornamenti Futuri

Quando migliori il template:

```bash
git add .
git commit -m "feat: aggiunti nuovi componenti"
git push
```

Tutti i nuovi progetti useranno automaticamente la versione aggiornata!

---

**Domande?** Apri un issue su GitHub: https://github.com/mccoy88f/mdf/issues
