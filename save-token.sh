#!/bin/bash

# Script per salvare il token GitHub nel credential helper
# Usage: ./save-token.sh

echo "Inserisci il tuo Personal Access Token GitHub:"
read -s GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token non inserito"
    exit 1
fi

# Salva le credenziali usando git credential approve
echo "https://mccoy88f:${GITHUB_TOKEN}@github.com" | git credential approve

echo "✅ Token salvato con successo!"
echo ""
echo "Ora posso fare il push. Eseguo il push..."
echo ""

git push -u origin main
