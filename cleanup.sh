#!/bin/bash

# Script di cleanup per MDF (My Development Framework)
# Rimuove completamente un progetto: container, volumi, immagini, e directory
# Usage: ./cleanup.sh nome-progetto

set -e

PROJECT_NAME=${1}

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Errore: Specifica il nome del progetto"
    echo ""
    echo "Uso: ./cleanup.sh nome-progetto"
    echo ""
    echo "Esempi:"
    echo "  ./cleanup.sh mio-progetto"
    echo "  ./cleanup.sh mdf-1"
    exit 1
fi

echo "🗑️  Cleanup MDF Project: $PROJECT_NAME"
echo ""

# Verifica se la directory esiste
if [ ! -d "$PROJECT_NAME" ]; then
    echo "⚠️  Directory '$PROJECT_NAME' non trovata nella posizione corrente"
    read -p "Vuoi comunque pulire container/volumi con questo nome? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
        echo "❌ Annullato"
        exit 0
    fi
    SKIP_DIR=true
else
    SKIP_DIR=false
fi

# Chiedi conferma
echo "⚠️  ATTENZIONE: Questa operazione eliminerà:"
echo "   📦 Container Docker"
echo "   💾 Volumi (database e dati)"
echo "   🖼️  Immagini Docker"
if [ "$SKIP_DIR" = false ]; then
    echo "   📁 Directory del progetto"
fi
echo ""
read -p "Sei sicuro? Questa azione NON è reversibile! (scrivi 'DELETE' per confermare): " confirm

if [ "$confirm" != "DELETE" ]; then
    echo "❌ Annullato"
    exit 0
fi

echo ""
echo "🧹 Avvio cleanup..."

# Determina se usare sudo
USE_SUDO=""
if ! docker ps &> /dev/null 2>&1; then
    echo "⚠️  Richiesti permessi sudo per Docker"
    USE_SUDO="sudo"
fi

# 1. Entra nella directory se esiste
if [ "$SKIP_DIR" = false ]; then
    cd "$PROJECT_NAME"
    echo "📂 Entrato in directory: $PROJECT_NAME"
fi

# 2. Ferma e rimuovi container + volumi
echo "🛑 Fermando container..."
if [ -f "docker-compose.yml" ]; then
    $USE_SUDO docker-compose down -v 2>/dev/null || true
    echo "✅ Container fermati e volumi rimossi"
else
    echo "⚠️  docker-compose.yml non trovato, cerco container manualmente..."
fi

# 3. Rimuovi container orfani con nome del progetto
echo "🔍 Ricerca container con nome '$PROJECT_NAME'..."
CONTAINERS=$($USE_SUDO docker ps -a --filter "name=$PROJECT_NAME" -q 2>/dev/null || true)
if [ -n "$CONTAINERS" ]; then
    echo "🗑️  Rimozione container trovati..."
    echo "$CONTAINERS" | xargs $USE_SUDO docker rm -f 2>/dev/null || true
    echo "✅ Container rimossi"
else
    echo "✅ Nessun container trovato"
fi

# 4. Rimuovi volumi con nome del progetto
echo "🔍 Ricerca volumi con nome '$PROJECT_NAME'..."
VOLUMES=$($USE_SUDO docker volume ls --filter "name=$PROJECT_NAME" -q 2>/dev/null || true)
if [ -n "$VOLUMES" ]; then
    echo "🗑️  Rimozione volumi trovati..."
    echo "$VOLUMES" | xargs $USE_SUDO docker volume rm -f 2>/dev/null || true
    echo "✅ Volumi rimossi"
else
    echo "✅ Nessun volume trovato"
fi

# 5. Rimuovi immagini con tag del progetto
echo "🔍 Ricerca immagini con tag '$PROJECT_NAME'..."
IMAGES=$($USE_SUDO docker images --filter "reference=*$PROJECT_NAME*" -q 2>/dev/null || true)
if [ -n "$IMAGES" ]; then
    echo "🗑️  Rimozione immagini trovate..."
    echo "$IMAGES" | xargs $USE_SUDO docker rmi -f 2>/dev/null || true
    echo "✅ Immagini rimosse"
else
    echo "✅ Nessuna immagine trovata"
fi

# 6. Rimuovi network
echo "🔍 Ricerca network con nome '$PROJECT_NAME'..."
NETWORKS=$($USE_SUDO docker network ls --filter "name=$PROJECT_NAME" -q 2>/dev/null || true)
if [ -n "$NETWORKS" ]; then
    echo "🗑️  Rimozione network trovate..."
    echo "$NETWORKS" | xargs $USE_SUDO docker network rm 2>/dev/null || true
    echo "✅ Network rimosse"
else
    echo "✅ Nessuna network trovata"
fi

# 7. Rimuovi directory del progetto
if [ "$SKIP_DIR" = false ]; then
    cd ..
    echo "📁 Rimozione directory del progetto..."
    rm -rf "$PROJECT_NAME"
    echo "✅ Directory rimossa"
fi

# 8. Cleanup opzionale di risorse Docker non utilizzate
echo ""
read -p "🧹 Vuoi eseguire un cleanup generale di Docker? (rimuove immagini/volumi non usati) (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "🧹 Pulizia generale Docker..."
    $USE_SUDO docker system prune -f --volumes 2>/dev/null || true
    echo "✅ Cleanup generale completato"
fi

echo ""
echo "✅ Cleanup completato!"
echo ""
echo "📊 Statistiche Docker attuali:"
$USE_SUDO docker system df 2>/dev/null || true
echo ""
echo "🎉 Il progetto '$PROJECT_NAME' è stato completamente rimosso!"
