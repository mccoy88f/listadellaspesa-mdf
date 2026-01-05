# 🔐 Configurazione SSH per GitHub (Prima Volta)

Se non hai mai configurato SSH con GitHub, segui questa guida una volta sola.

## Perché SSH?

- ✅ Nessuna password da ricordare
- ✅ Più sicuro
- ✅ Push/pull automatici senza autenticazione
- ✅ Funziona con tutti i repository

## Setup Rapido (5 minuti)

### 1️⃣ Genera la chiave SSH

```bash
# Genera una nuova chiave SSH
ssh-keygen -t ed25519 -C "tua-email@example.com"

# Ti chiederà:
# "Enter file in which to save the key" → Premi ENTER (usa default)
# "Enter passphrase" → Premi ENTER (o inserisci una password, opzionale)
# "Enter same passphrase again" → Premi ENTER
```

### 2️⃣ Copia la chiave pubblica

```bash
# Su Linux/Mac
cat ~/.ssh/id_ed25519.pub

# Su Windows (PowerShell)
type $env:USERPROFILE\.ssh\id_ed25519.pub

# Copia TUTTO l'output (inizia con "ssh-ed25519 ...")
```

### 3️⃣ Aggiungi la chiave su GitHub

1. Vai su: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: "Il mio PC" (o come vuoi)
4. Key: **Incolla la chiave copiata** prima
5. Click **"Add SSH key"**
6. GitHub ti chiederà la password per confermare

### 4️⃣ Testa la connessione

```bash
ssh -T git@github.com

# Dovrebbe rispondere:
# "Hi TUO-USERNAME! You've successfully authenticated..."
```

✅ **Fatto!** Ora puoi usare Git senza password!

## 🚀 Uso con il Template

```bash
# Clona repository (HTTPS → SSH)
git clone git@github.com:mccoy88f/nextjs-starter-template.git

# Oppure cambia remote esistente
git remote set-url origin git@github.com:mccoy88f/nextjs-starter-template.git

# Push senza password
git push
```

## 🔧 Troubleshooting

### "Permission denied (publickey)"

```bash
# Verifica che la chiave sia caricata
ssh-add -l

# Se è vuoto, aggiungi la chiave
ssh-add ~/.ssh/id_ed25519
```

### "Could not open a connection to your authentication agent"

```bash
# Avvia ssh-agent
eval "$(ssh-agent -s)"

# Poi aggiungi la chiave
ssh-add ~/.ssh/id_ed25519
```

### Ho già una chiave SSH diversa (id_rsa)

Va bene! Puoi usare quella:

```bash
cat ~/.ssh/id_rsa.pub  # Copia questa invece
```

Oppure genera una nuova con nome diverso:

```bash
ssh-keygen -t ed25519 -C "email@example.com" -f ~/.ssh/github_ed25519
```

---

**Fatto una volta, SSH funziona per sempre!** 🎉
