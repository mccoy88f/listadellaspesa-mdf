# 📧 Configurazione Email per Notifiche

L'applicazione supporta l'invio di notifiche via email oltre alle notifiche browser.

## 🔧 Configurazione

### 1. Variabili d'Ambiente

Aggiungi queste variabili al tuo file `.env`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@listadellaspesa.local

# App URL (per link nelle email)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configurazione Gmail

Per usare Gmail:

1. **Abilita l'autenticazione a due fattori** sul tuo account Google
2. **Crea una "App Password"**:
   - Vai su: https://myaccount.google.com/apppasswords
   - Seleziona "App" → "Mail" e "Device" → "Other"
   - Inserisci un nome (es: "Lista della Spesa")
   - Copia la password generata (16 caratteri)
3. **Usa la App Password** nella variabile `SMTP_PASSWORD` (NON la password normale!)

### 3. Altri Provider SMTP

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

### 4. Test Email

Dopo la configurazione, le email verranno inviate automaticamente quando:
- Una lista viene condivisa
- Qualcuno clicca "Sto andando a fare la spesa!"

## 🐳 Configurazione con Docker

Aggiungi le variabili al `docker-compose.yml`:

```yaml
app:
  environment:
    DATABASE_URL: postgresql://appuser:apppassword@db:5432/appdb
    NODE_ENV: development
    SMTP_HOST: smtp.gmail.com
    SMTP_PORT: 587
    SMTP_USER: your-email@gmail.com
    SMTP_PASSWORD: your-app-password
    SMTP_FROM: noreply@listadellaspesa.local
    NEXT_PUBLIC_APP_URL: http://localhost:3000
```

## ⚠️ Note Importanti

- **Gmail**: Usa sempre una "App Password", non la password normale
- **Sicurezza**: Non committare mai le password nel repository
- **Fallback**: Se SMTP non è configurato, le notifiche browser funzionano comunque
- **Logs**: Gli errori di invio email vengono loggati ma non bloccano l'applicazione

## 🔍 Troubleshooting

### Email non vengono inviate

1. Verifica le variabili d'ambiente:
   ```bash
   docker exec nextjs-app env | grep SMTP
   ```

2. Controlla i logs:
   ```bash
   docker-compose logs app | grep -i email
   ```

3. Testa la connessione SMTP manualmente (se necessario)

### Errore "Invalid login"

- Gmail: Assicurati di usare una App Password, non la password normale
- Verifica che l'autenticazione a due fattori sia abilitata (Gmail)

### Email finiscono in spam

- Configura SPF/DKIM per il tuo dominio (per production)
- Usa un servizio email professionale (SendGrid, Mailgun) per production
