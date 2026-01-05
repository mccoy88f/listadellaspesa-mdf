# 🔧 Troubleshooting MDF

Soluzioni ai problemi più comuni.

## ⚠️ Errori Critici

### 1. Permission Denied con Docker ⭐ PIÙ COMUNE

**Errore:**
```
PermissionError: [Errno 13] Permission denied
docker.errors.DockerException: Error while fetching server API version
```

**Soluzione RAPIDA:**

```bash
# 1. Aggiungi utente al gruppo docker
sudo usermod -aG docker $USER

# 2. Applica permessi (scegli uno)
newgrp docker           # Opzione A: Immediato (nuova shell)
# OPPURE fai logout/login  # Opzione B: Più stabile

# 3. Verifica
docker ps

# 4. Avvia
docker-compose up -d
```

**Alternativa temporanea:**
```bash
sudo docker-compose up -d
sudo docker-compose logs -f
```

---

### 2. Porta già in uso

**Errore:** `address already in use` su porta 3000, 5432, o 5555

**Soluzione:**

```bash
# Trova il processo
sudo lsof -i :3000

# Termina il processo
sudo kill -9 PID

# O cambia porta in docker-compose.yml
# ports: - "3001:3000"
```

---

### 3. Database non si connette

**Sintomo:** Prisma Studio non funziona, app non parte

```bash
# 1. Verifica container
docker-compose ps

# 2. Logs database
docker-compose logs db

# 3. Crea tabelle
docker exec -it nextjs-app npm run prisma:push

# 4. Riavvia
docker-compose restart
```

---

## 🐛 Errori Sviluppo

### Module not found

```bash
# Aggiungi a packages.txt
echo "axios" >> packages.txt
docker-compose restart app
```

### Hot reload non funziona

```bash
# Windows/WSL
echo "WATCHPACK_POLLING=true" >> .env
docker-compose restart app
```

### Build fallisce

```bash
# Reset completo
docker-compose down -v
docker-compose up --build
```

---

## 🔄 Reset Completo

Quando tutto fallisce:

```bash
# Stop e cleanup
docker-compose down -v
docker system prune -a

# Riavvia
docker-compose up --build
```

---

## 📚 Guida Completa

Vedi tutti i problemi e soluzioni dettagliate nei file:
- **DATABASE.md** - Problemi database
- **AUTO-INSTALL.md** - Problemi pacchetti
- **PERFORMANCE.md** - Problemi performance

---

## 🆘 Supporto

Issue: https://github.com/mccoy88f/mdf/issues
