# Autenticazione GitHub per Push

GitHub non supporta più username/password dal 2021. Hai due opzioni:

## Opzione 1: Personal Access Token (PAT) - Consigliata

### 1. Crea un Personal Access Token su GitHub:

1. Vai su: https://github.com/settings/tokens
2. Clicca "Generate new token" → "Generate new token (classic)"
3. Dai un nome (es: "listadellaspesa-mdf")
4. Seleziona scadenza (consiglio 90 giorni o "No expiration")
5. Seleziona i permessi:
   - ✅ `repo` (tutto) - per push/pull
6. Clicca "Generate token"
7. **COPIA IL TOKEN** (lo vedrai solo una volta!)

### 2. Usa il token per il push:

Quando git chiede la password, usa il token invece della password:

```bash
git push -u origin main
# Username: mccoy88f
# Password: [incolla qui il token, NON la password]
```

### 3. Salva il token per evitare di reinserirlo ogni volta:

```bash
# Salva il token nel credential helper (Linux)
git config --global credential.helper store

# Oppure per una sessione temporanea
git config credential.helper 'cache --timeout=3600'
```

## Opzione 2: SSH Keys - Più Permanente

### 1. Genera una chiave SSH (se non ce l'hai):

```bash
ssh-keygen -t ed25519 -C "antonellomigliorelli@gmail.com"
# Premi Enter per accettare il percorso di default
# Scegli una passphrase (opzionale ma consigliata)
```

### 2. Aggiungi la chiave pubblica a GitHub:

```bash
# Mostra la chiave pubblica
cat ~/.ssh/id_ed25519.pub
```

1. Copia l'output completo
2. Vai su: https://github.com/settings/keys
3. Clicca "New SSH key"
4. Incolla la chiave
5. Clicca "Add SSH key"

### 3. Cambia il remote a SSH:

```bash
git remote set-url origin git@github.com:mccoy88f/listadellaspesa-mdf.git
```

### 4. Testa la connessione:

```bash
ssh -T git@github.com
# Dovresti vedere: "Hi mccoy88f! You've successfully authenticated..."
```

### 5. Fai push:

```bash
git push -u origin main
```

## Comando Rapido per Push con PAT

Se hai già il token, puoi usare:

```bash
git push -u origin main
# Quando chiede:
# Username: mccoy88f
# Password: [incolla il token]
```

## Troubleshooting

Se hai problemi:

```bash
# Verifica il remote
git remote -v

# Verifica la configurazione
git config --list | grep user

# Prova a fare fetch prima del push
git fetch origin
```
