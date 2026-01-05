import nodemailer from 'nodemailer';

// Configurazione email transporter
const createTransporter = () => {
  // Usa variabili d'ambiente o configurazione SMTP
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPassword = process.env.SMTP_PASSWORD || '';
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpUser || !smtpPassword) {
    console.warn('⚠️  SMTP non configurato. Le email non verranno inviate.');
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email non inviata: SMTP non configurato');
      return false;
    }

    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@listadellaspesa.local';

    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Rimuove HTML se non c'è testo
      html,
    });

    return true;
  } catch (error) {
    console.error('Errore nell\'invio email:', error);
    return false;
  }
}

export async function sendNotificationEmail(
  to: string,
  toName: string | null,
  senderName: string,
  title: string,
  message: string,
  listName?: string,
  listId?: number
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const listUrl = listId ? `${appUrl}/lists/${listId}` : `${appUrl}/notifications`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Lista della Spesa</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>Ciao ${toName || 'utente'},</p>
          <p>${message}</p>
          ${listName ? `<p><strong>Lista:</strong> ${listName}</p>` : ''}
          <a href="${listUrl}" class="button">Vai all'app</a>
        </div>
        <div class="footer">
          <p>Questa è una notifica automatica da Lista della Spesa</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, title, html);
}
