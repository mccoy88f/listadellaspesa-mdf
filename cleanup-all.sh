#!/bin/bash

# Script di cleanup TOTALE per MDF (My Development Framework)
# Rimuove TUTTI i container, volumi e immagini MDF
# Usage: ./cleanup-all.sh

set -e

echo "🗑️  Cleanup TOTALE MDF - Rimuove TUTTI i progetti"
echo ""

# Determina se usare sudo
USE_SUDO=""
if ! docker ps &> /dev/null 2>&1; then
    echo "⚠️  Richiesti permessi sudo per Docker"
    USE_SUDO="sudo"
fi

# Chiedi conferma tripla
echo "⚠️  ATTENZIONE MASSIMA!"
echo ""
echo "Questa operazione eliminerà TUTTI i progetti MDF:"
echo "   📦 Tutti i container Docker (mdf, nextjs-app, nextjs-postgres, prisma-studio)"
echo "   💾 Tutti i volumi e DATABASE"
echo "   🖼️  Tutte le immagini MDF"
echo "   🌐 Tutte le network MDF"
echo ""
echo "⚠️  I FILE nelle directory NON verranno eliminati"
echo ""
read -p "Sei ASSOLUTAMENTE sicuro? (scrivi 'DELETE ALL' per confermare): " confirm

if [ "$confirm" != "DELETE ALL" ]; then
    echo "❌ Annullato"
    exit 0
fi

echo ""
echo "🧹 Avvio cleanup totale..."
echo ""

# 1. Ferma tutti i container MDF
echo "🛑 Fermando tutti i container MDF..."
MDF_CONTAINERS=$($USE_SUDO docker ps -a --filter "name=mdf" --filter "name=nextjs" --filter "name=prisma" -q 2>/dev/null || true)
if [ -n "$MDF_CONTAINERS" ]; then
    echo "$MDF_CONTAINERS" | xargs $USE_SUDO docker stop 2>/dev/null || true
    echo "$MDF_CONTAINERS" | xargs $USE_SUDO docker rm -f 2>/dev/null || true
    echo "✅ Container fermati e rimossi"
else
    echo "✅ Nessun container MDF trovato"
fi

# 2. Rimuovi tutti i volumi
echo ""
echo "💾 Rimozione volumi MDF..."
MDF_VOLUMES=$($USE_SUDO docker volume ls --filter "name=mdf" --filter "name=nextjs" --filter "name=postgres_data" -q 2>/dev/null || true)
if [ -n "$MDF_VOLUMES" ]; then
    echo "$MDF_VOLUMES" | xargs $USE_SUDO docker volume rm -f 2>/dev/null || true
    echo "✅ Volumi rimossi"
else
    echo "✅ Nessun volume MDF trovato"
fi

# 3. Rimuovi tutte le immagini MDF
echo ""
echo "🖼️  Rimozione immagini MDF..."
MDF_IMAGES=$($USE_SUDO docker images --filter "reference=*mdf*" --filter "reference=*nextjs*starter*" -q 2>/dev/null || true)
if [ -n "$MDF_IMAGES" ]; then
    echo "$MDF_IMAGES" | xargs $USE_SUDO docker rmi -f 2>/dev/null || true
    echo "✅ Immagini rimosse"
else
    echo "✅ Nessuna immagine MDF trovata"
fi

# 4. Rimuovi tutte le network MDF
echo ""
echo "🌐 Rimozione network MDF..."
MDF_NETWORKS=$($USE_SUDO docker network ls --filter "name=mdf" --filter "name=nextjs" -q 2>/dev/null || true)
if [ -n "$MDF_NETWORKS" ]; then
    echo "$MDF_NETWORKS" | xargs $USE_SUDO docker network rm 2>/dev/null || true
    echo "✅ Network rimosse"
else
    echo "✅ Nessuna network MDF trovata"
fi

# 5. Lista directory MDF (informativo)
echo ""
echo "📁 Directory MDF trovate nella posizione corrente:"
ls -d mdf* 2>/dev/null || echo "   Nessuna directory mdf* trovata"
echo ""
echo "   ℹ️  Le directory NON sono state eliminate automaticamente"
echo "   ℹ️  Usa './cleanup.sh nome-progetto' per rimuovere directory specifiche"
echo "   ℹ️  Oppure rimuovile manualmente con: rm -rf mdf-*"

# 6. Cleanup generale opzionale
echo ""
read -p "🧹 Vuoi eseguire un cleanup generale di TUTTO Docker? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "🧹 Pulizia generale Docker (rimuove TUTTO ciò che non è in uso)..."
    $USE_SUDO docker system prune -af --volumes 2>/dev/null || true
    echo "✅ Cleanup generale completato"
fi

echo ""
echo "✅ Cleanup totale MDF completato!"
echo ""
echo "📊 Statistiche Docker finali:"
$USE_SUDO docker system df 2>/dev/null || true
echo ""
echo "🎉 Tutti i progetti MDF sono stati rimossi da Docker!"
