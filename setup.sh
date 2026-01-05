#!/bin/bash

# Script di setup automatico per Lista della Spesa MDF
# Usage: curl -sSL https://raw.githubusercontent.com/mccoy88f/listadellaspesa-mdf/main/setup.sh | bash -s -- nome-progetto

set -e

PROJECT_NAME=${1:-my-mdf-app}

echo "🚀 Setup Lista della Spesa MDF: $PROJECT_NAME"
echo ""

# Verifica Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non trovato. Installalo da: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose non trovato. Installalo da: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker trovato"

# Verifica permessi Docker
if ! docker ps &> /dev/null; then
    echo ""
    echo "⚠️  PERMESSI DOCKER MANCANTI"
    echo ""
    echo "Devi aggiungere il tuo utente al gruppo docker:"
    echo ""
    echo "  sudo usermod -aG docker \$USER"
    echo "  newgrp docker"
    echo ""
    echo "Oppure esegui con sudo:"
    echo "  sudo -E bash -c 'curl -sSL https://raw.githubusercontent.com/mccoy88f/listadellaspesa-mdf/main/setup.sh | bash -s -- $PROJECT_NAME'"
    echo ""
    
    # Chiedi se usare sudo
    read -p "Vuoi continuare con sudo? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Setup annullato. Configura i permessi Docker e riprova."
        exit 1
    fi
    
    # Se l'utente vuole sudo, usa sudo per docker-compose
    DOCKER_CMD="sudo docker-compose"
    DOCKER_EXEC="sudo docker exec"
else
    # Permessi OK, usa comandi normali
    DOCKER_CMD="docker-compose"
    DOCKER_EXEC="docker exec"
fi

echo ""

# Clona il repository
echo "📥 Clonazione repository Lista della Spesa MDF..."
git clone https://github.com/mccoy88f/listadellaspesa-mdf.git "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Rimuovi .git per iniziare un nuovo repository
rm -rf .git
git init

echo "✅ Repository clonato"
echo ""

# Personalizza package.json
echo "📝 Personalizzazione package.json..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed -i '' "s/\"name\": \"nextjs-starter-template\"/\"name\": \"$PROJECT_NAME\"/" package.json
else
    # Linux
    sed -i "s/\"name\": \"nextjs-starter-template\"/\"name\": \"$PROJECT_NAME\"/" package.json
fi

echo "✅ Progetto personalizzato"
echo ""

# Avvia Docker Compose
echo "🐳 Avvio container Docker..."
$DOCKER_CMD up -d

echo "⏳ Attendo che i container siano pronti..."
sleep 15

# Inizializza database AUTOMATICAMENTE
echo "🗄️  Inizializzazione database..."
echo "   Creazione tabelle..."
$DOCKER_EXEC nextjs-app npm run prisma:push > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Tabelle create"
    
    # Crea utente admin di default
    echo "   Creazione utente admin..."
    $DOCKER_EXEC nextjs-app npm run prisma:seed > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Utente admin creato"
        echo ""
        echo "   👤 Credenziali Admin:"
        echo "      Email: admin@mdf.local"
        echo "      (nessuna password configurata)"
        echo ""
    else
        echo "   ⚠️  Utente admin non creato (puoi crearlo dopo con: docker exec nextjs-app npm run prisma:seed)"
    fi
else
    echo "   ⚠️  Errore inizializzazione database"
    echo "   Esegui manualmente:"
    echo "      docker exec nextjs-app npm run prisma:push"
    echo "      docker exec nextjs-app npm run prisma:seed"
fi

echo ""
echo "✅ Setup completato!"
echo ""
echo "📍 Il tuo progetto è pronto:"
echo "   📁 Directory: ./$PROJECT_NAME"
echo "   🌐 App: http://localhost:3000"
echo "   💾 Database GUI: http://localhost:5555"
echo ""
echo "🛠️  Comandi utili:"
echo "   docker-compose logs -f          # Vedi i logs"
echo "   docker-compose down             # Ferma tutto"
echo "   docker-compose restart          # Riavvia"
echo ""
echo "📚 Documentazione completa: README.md"
echo ""
