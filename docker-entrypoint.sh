#!/bin/sh
set -e

echo "🚀 Avvio Next.js Application..."

# Funzione per installare pacchetti di sistema da system-packages.txt
install_system_packages() {
  if [ -f /app/system-packages.txt ]; then
    # Leggi pacchetti (ignora commenti e righe vuote)
    PACKAGES=$(grep -v '^#' /app/system-packages.txt | grep -v '^[[:space:]]*$' | tr '\n' ' ')
    
    if [ -n "$PACKAGES" ]; then
      echo "📦 Installazione pacchetti di sistema: $PACKAGES"
      apk add --no-cache $PACKAGES
    fi
  fi
}

# Funzione per installare pacchetti npm da packages.txt
install_npm_packages() {
  if [ -f /app/packages.txt ]; then
    # Leggi pacchetti (ignora commenti e righe vuote)
    PACKAGES=$(grep -v '^#' /app/packages.txt | grep -v '^[[:space:]]*$' | tr '\n' ' ')
    
    if [ -n "$PACKAGES" ]; then
      echo "📦 Installazione pacchetti npm aggiuntivi: $PACKAGES"
      npm install $PACKAGES
      
      # Aggiorna package.json se non sono già presenti
      for pkg in $PACKAGES; do
        pkg_name=$(echo $pkg | cut -d'@' -f1)
        if ! grep -q "\"$pkg_name\"" /app/package.json; then
          echo "  ➕ Aggiunto $pkg a package.json"
        fi
      done
    fi
  fi
}

# Funzione per verificare se package.json è cambiato
check_and_install() {
  if [ ! -f /app/.npm-installed ] || [ /app/package.json -nt /app/.npm-installed ]; then
    echo "📦 Rilevate modifiche in package.json, installazione dipendenze..."
    npm install
    touch /app/.npm-installed
  else
    echo "✅ Dipendenze già aggiornate"
  fi
}

# 1. Installa pacchetti di sistema (solo al primo avvio o se system-packages.txt cambia)
if [ -f /app/system-packages.txt ] && [ ! -f /app/.system-packages-installed ]; then
  install_system_packages
  touch /app/.system-packages-installed
fi

# 2. Installa pacchetti npm da packages.txt (solo se non già installati)
if [ -f /app/packages.txt ] && [ ! -f /app/.packages-installed ]; then
  install_npm_packages
  touch /app/.packages-installed
fi

# 3. Installa/aggiorna dipendenze standard
check_and_install

# 4. Genera Prisma Client se necessario
if [ ! -d /app/node_modules/.prisma ] || [ /app/prisma/schema.prisma -nt /app/node_modules/.prisma ]; then
  echo "🗄️  Generazione Prisma Client..."
  npx prisma generate
fi

# Esegui il comando passato (npm run dev, npm run start, etc.)
echo "✅ Pronto! Esecuzione: $@"
exec "$@"
