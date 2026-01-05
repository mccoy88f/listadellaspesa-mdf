# Istruzioni per Push su GitHub

## 1. Configura Git (se non già fatto)

```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua-email@esempio.com"
```

## 2. Crea la Repository su GitHub

1. Vai su GitHub e crea una nuova repository chiamata `listadellaspesa-mdf`
2. **NON** inizializzarla con README, .gitignore o licenza (è già tutto nel progetto)

## 3. Aggiungi il Remote e Fai Push

```bash
cd /home/antonello/Sviluppo/mdf

# Rimuovi il remote esistente se presente
git remote remove origin 2>/dev/null || true

# Aggiungi il nuovo remote (sostituisci TUO-USERNAME con il tuo username GitHub)
git remote add origin https://github.com/TUO-USERNAME/listadellaspesa-mdf.git

# Fai commit di tutti i cambiamenti
git add -A
git commit -m "feat: App Lista della Spesa completa con localizzazione

- Sistema completo di autenticazione (registrazione/login obbligatorio)
- Gestione liste della spesa con CRUD completo
- Sistema di condivisione liste tra utenti
- Notifiche in tempo reale per coordinare la spesa
- Storico intelligente degli oggetti aggiunti
- Localizzazione con next-intl (Italiano/Inglese)
- Design moderno e responsive con Shadcn/UI
- Integrazione Docker completa"

# Fai push sul branch main
git branch -M main
git push -u origin main
```

## 4. Aggiorna setup.sh con il tuo Username

Dopo aver fatto il push, aggiorna `setup.sh` sostituendo `TUO-USERNAME` con il tuo username GitHub:

```bash
sed -i 's/TUO-USERNAME/IL-TUO-USERNAME/g' setup.sh
git add setup.sh
git commit -m "chore: Aggiorna URL repository in setup.sh"
git push
```

## 5. Testa il Setup

Dopo aver aggiornato setup.sh, puoi testare il setup automatico:

```bash
curl -sSL https://raw.githubusercontent.com/TUO-USERNAME/listadellaspesa-mdf/main/setup.sh | bash -s -- test-progetto
```

## Note Importanti

- Tutti i comandi Docker devono essere eseguiti tramite `docker-compose` o `docker exec`
- Il setup.sh gestisce automaticamente l'inizializzazione del database
- L'app supporta localizzazione Italiano/Inglese
- Le credenziali admin di default sono: `admin@mdf.local` / `admin123`
