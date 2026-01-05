#!/bin/bash

# Script per fare push su GitHub della repository listadellaspesa-mdf
# Usage: ./push-to-github.sh TUO-USERNAME-GITHUB

set -e

GITHUB_USERNAME=${1}

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Errore: Devi fornire il tuo username GitHub"
    echo ""
    echo "Usage: ./push-to-github.sh TUO-USERNAME-GITHUB"
    echo ""
    echo "Esempio:"
    echo "  ./push-to-github.sh mario-rossi"
    exit 1
fi

echo "🚀 Preparazione push su GitHub..."
echo "   Repository: $GITHUB_USERNAME/listadellaspesa-mdf"
echo ""

# Verifica configurazione Git
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    echo "⚠️  Git non è configurato"
    echo ""
    echo "Configura Git con:"
    echo "  git config --global user.name \"Il Tuo Nome\""
    echo "  git config --global user.email \"tua-email@esempio.com\""
    echo ""
    read -p "Vuoi configurare Git ora? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Inserisci il tuo nome: " GIT_NAME
        read -p "Inserisci la tua email: " GIT_EMAIL
        git config --global user.name "$GIT_NAME"
        git config --global user.email "$GIT_EMAIL"
        echo "✅ Git configurato"
    else
        echo "❌ Configura Git prima di continuare"
        exit 1
    fi
fi

# Aggiungi tutti i file
echo "📦 Aggiunta file al commit..."
git add -A

# Verifica se ci sono cambiamenti da committare
if git diff --staged --quiet; then
    echo "ℹ️  Nessun cambiamento da committare"
else
    echo "💾 Creazione commit..."
    git commit -m "feat: App Lista della Spesa completa con localizzazione

- Sistema completo di autenticazione (registrazione/login obbligatorio)
- Gestione liste della spesa con CRUD completo
- Sistema di condivisione liste tra utenti
- Notifiche in tempo reale per coordinare la spesa
- Storico intelligente degli oggetti aggiunti
- Localizzazione con next-intl (Italiano/Inglese)
- Design moderno e responsive con Shadcn/UI
- Integrazione Docker completa"
    echo "✅ Commit creato"
fi

# Rimuovi remote esistente se presente
echo "🔗 Configurazione remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/listadellaspesa-mdf.git"
echo "✅ Remote configurato"

# Aggiorna setup.sh con il vero username
echo "📝 Aggiornamento setup.sh..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed -i '' "s/TUO-USERNAME/$GITHUB_USERNAME/g" setup.sh
else
    # Linux
    sed -i "s/TUO-USERNAME/$GITHUB_USERNAME/g" setup.sh
fi

# Aggiorna README.md
if [ "$(uname)" == "Darwin" ]; then
    sed -i '' "s/TUO-USERNAME/$GITHUB_USERNAME/g" README.md
else
    sed -i "s/TUO-USERNAME/$GITHUB_USERNAME/g" README.md
fi

git add setup.sh README.md
git commit -m "chore: Aggiorna URL repository con username GitHub" 2>/dev/null || echo "ℹ️  Nessun cambiamento in setup.sh/README.md"

# Assicurati di essere sul branch main
git branch -M main 2>/dev/null || true

echo ""
echo "📤 Push su GitHub..."
echo "   Assicurati di aver creato la repository su GitHub:"
echo "   https://github.com/new"
echo "   Nome: listadellaspesa-mdf"
echo "   Visibilità: Pubblica o Privata"
echo ""
read -p "Hai già creato la repository su GitHub? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "⏸️  Crea prima la repository su GitHub, poi riprova:"
    echo "   1. Vai su https://github.com/new"
    echo "   2. Nome: listadellaspesa-mdf"
    echo "   3. NON inizializzare con README, .gitignore o licenza"
    echo "   4. Clicca 'Create repository'"
    echo "   5. Esegui di nuovo: ./push-to-github.sh $GITHUB_USERNAME"
    exit 0
fi

# Fai push
echo ""
echo "🚀 Esecuzione push..."
git push -u origin main

echo ""
echo "✅ Push completato con successo!"
echo ""
echo "📍 Repository: https://github.com/$GITHUB_USERNAME/listadellaspesa-mdf"
echo ""
echo "🧪 Testa il setup automatico:"
echo "   curl -sSL https://raw.githubusercontent.com/$GITHUB_USERNAME/listadellaspesa-mdf/main/setup.sh | bash -s -- test-progetto"
echo ""
