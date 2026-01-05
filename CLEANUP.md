# 🗑️ Cleanup - Rimozione Progetti MDF

Script per rimuovere completamente progetti MDF dal sistema.

## 📋 Script Disponibili

### 1. `cleanup.sh` - Rimuove un singolo progetto
### 2. `cleanup-all.sh` - Rimuove TUTTI i progetti MDF

---

## 🎯 cleanup.sh - Singolo Progetto

Rimuove completamente un progetto specifico: container, volumi, immagini, network e directory.

### Uso Base

```bash
# Sintassi
./cleanup.sh nome-progetto

# Esempi
./cleanup.sh mio-progetto
./cleanup.sh mdf-1
./cleanup.sh gestionale-clienti
```

### Cosa Rimuove

✅ **Container Docker**
- `nome-progetto-app`
- `nome-progetto-db`
- `nome-progetto-prisma-studio`

✅ **Volumi Docker**
- `nome-progetto_postgres_data`
- Tutti i volumi associati

✅ **Immagini Docker**
- Tutte le immagini taggate con il nome del progetto

✅ **Network Docker**
- `nome-progetto_app-network`

✅ **Directory del Progetto**
- L'intera cartella del progetto

### Sicurezza

Lo script richiede conferma esplicita:
- Devi digitare `DELETE` per confermare
- NON è reversibile
- Backup prima se necessario

### Esempi Pratici

```bash
# Esempio 1: Progetto nella directory corrente
cd ~/Progetti
./cleanup.sh mdf-ecommerce
# Rimuove tutto e la directory ~/Progetti/mdf-ecommerce

# Esempio 2: Pulisci solo Docker (senza directory)
cd ~/Progetti
./cleanup.sh mdf-vecchio
# Se la directory non esiste, pulisce solo Docker

# Esempio 3: Con sudo
sudo ./cleanup.sh mio-progetto
# Se hai problemi di permessi
```

### Output Esempio

```
🗑️  Cleanup MDF Project: mdf-1

⚠️  ATTENZIONE: Questa operazione eliminerà:
   📦 Container Docker
   💾 Volumi (database e dati)
   🖼️  Immagini Docker
   📁 Directory del progetto

Sei sicuro? Questa azione NON è reversibile! (scrivi 'DELETE' per confermare): DELETE

🧹 Avvio cleanup...
📂 Entrato in directory: mdf-1
🛑 Fermando container...
✅ Container fermati e volumi rimossi
🔍 Ricerca container con nome 'mdf-1'...
✅ Nessun container trovato
💾 Rimozione volumi MDF...
✅ Volumi rimossi
🖼️  Rimozione immagini MDF...
✅ Immagini rimosse
🌐 Rimozione network MDF...
✅ Network rimosse
📁 Rimozione directory del progetto...
✅ Directory rimossa

✅ Cleanup completato!
🎉 Il progetto 'mdf-1' è stato completamente rimosso!
```

---

## 🧹 cleanup-all.sh - Tutti i Progetti

Rimuove **TUTTI** i progetti MDF dal sistema Docker.

### Uso

```bash
./cleanup-all.sh
```

### ⚠️ ATTENZIONE

Questo script è **MOLTO PERICOLOSO**:
- Rimuove TUTTI i container MDF
- Rimuove TUTTI i database
- Rimuove TUTTE le immagini MDF
- NON chiede quale progetto

### Cosa Rimuove

✅ Tutti i container con nome:
- `mdf*`
- `nextjs*`
- `prisma*`

✅ Tutti i volumi con nome:
- `mdf*`
- `nextjs*`
- `postgres_data*`

✅ Tutte le immagini con tag:
- `*mdf*`
- `*nextjs*starter*`

✅ Tutte le network MDF

❌ **NON rimuove** le directory dei progetti
- Le directory vanno rimosse manualmente
- Oppure usa `cleanup.sh` per ogni progetto

### Sicurezza Tripla

Richiede conferma molto esplicita:
```
Sei ASSOLUTAMENTE sicuro? (scrivi 'DELETE ALL' per confermare):
```

Devi digitare esattamente: `DELETE ALL`

### Quando Usarlo

✅ **USA quando:**
- Vuoi ricominciare da zero
- Hai troppi progetti di test
- Stai per disinstallare MDF
- Vuoi liberare spazio disco

❌ **NON usare quando:**
- Hai progetti in produzione
- Hai dati importanti non backuppati
- Non sei sicuro

### Esempio Pratico

```bash
# Scenario: Hai creato 10 progetti di test e vuoi pulire tutto
cd ~/Progetti

# Lista progetti attuali
ls -d mdf*
# Output: mdf-1 mdf-2 mdf-test mdf-ecommerce ...

# Pulisci TUTTO da Docker
./cleanup-all.sh
# Digita: DELETE ALL

# I container/volumi/immagini sono spariti
# Le directory esistono ancora

# Rimuovi anche le directory
rm -rf mdf-*

# Tutto pulito!
```

---

## 🔧 Opzioni Avanzate

### Cleanup con Sudo

Se hai problemi di permessi:

```bash
sudo ./cleanup.sh mio-progetto
sudo ./cleanup-all.sh
```

### Cleanup Silenzioso (no interazione)

**NON RACCOMANDATO** - Usa con cautela:

```bash
# Modifica lo script per saltare la conferma
# (a tuo rischio e pericolo!)
echo "DELETE" | ./cleanup.sh mio-progetto
```

### Backup Prima del Cleanup

```bash
# Backup database
docker exec nome-progetto-db pg_dump -U appuser appdb > backup.sql

# Backup file
tar -czf backup-progetto.tar.gz nome-progetto/

# Poi cleanup
./cleanup.sh nome-progetto
```

### Cleanup Parziale

Se vuoi rimuovere solo alcune cose:

```bash
# Solo container (mantieni volumi e immagini)
docker-compose down

# Solo container e volumi (mantieni immagini)
docker-compose down -v

# Solo ferma (non rimuove nulla)
docker-compose stop
```

---

## 📊 Verifica Stato

Prima e dopo il cleanup:

```bash
# Verifica container
docker ps -a | grep mdf

# Verifica volumi
docker volume ls | grep mdf

# Verifica immagini
docker images | grep mdf

# Verifica network
docker network ls | grep mdf

# Spazio utilizzato
docker system df
```

---

## 🆘 Troubleshooting

### "Permission denied"

```bash
# Usa sudo
sudo ./cleanup.sh mio-progetto
```

### "No such container"

```bash
# Normale se il progetto è già stato rimosso
# Lo script gestisce questa situazione
```

### "Directory not empty"

```bash
# Forza rimozione
sudo rm -rf nome-progetto/
```

### "Device or resource busy"

```bash
# Ferma tutti i container prima
docker stop $(docker ps -aq)

# Poi riprova
./cleanup.sh mio-progetto
```

---

## 🔍 Comandi Utili

```bash
# Lista tutti i progetti MDF
ls -d mdf* */mdf*

# Conta progetti MDF
ls -d mdf* | wc -l

# Spazio usato da Docker
docker system df

# Pulisci tutto Docker (PERICOLOSO!)
docker system prune -af --volumes

# Trova container in esecuzione
docker ps | grep mdf

# Trova volumi orfani
docker volume ls -f dangling=true
```

---

## ⚙️ Personalizzazione Script

### Modifica Pattern di Ricerca

Modifica gli script per cercare pattern diversi:

```bash
# In cleanup.sh, cambia le ricerche:
CONTAINERS=$($USE_SUDO docker ps -a --filter "name=mio-pattern" -q)
VOLUMES=$($USE_SUDO docker volume ls --filter "name=mio-pattern" -q)
```

### Aggiungi Logging

```bash
# Aggiungi all'inizio dello script:
LOG_FILE="cleanup-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1
```

---

## 📝 Checklist Prima del Cleanup

Prima di eseguire il cleanup:

- [ ] Backup del database effettuato?
- [ ] File importanti copiati?
- [ ] Ambiente di sviluppo salvato?
- [ ] Configurazioni personalizzate salvate?
- [ ] .env con secrets backuppato?
- [ ] Sei sicuro del nome progetto?
- [ ] Hai letto l'output previsto?

---

## 🎯 Best Practices

1. **Backup sempre** prima di cleanup progetti di produzione
2. **Testa su progetti di test** prima di usare su produzione
3. **Usa cleanup.sh** per singoli progetti (più sicuro)
4. **Usa cleanup-all.sh** solo quando necessario
5. **Verifica sempre** con `docker ps` dopo il cleanup
6. **Documenta** quali progetti hai rimosso

---

## 📞 Supporto

Se hai problemi:
- Issue: https://github.com/mccoy88f/mdf/issues
- Includi output completo dello script
- Specifica quale script stai usando

---

**🎉 Con questi script mantieni il sistema pulito e organizzato!**
