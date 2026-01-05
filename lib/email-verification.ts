import { sendEmail } from './email';

// Genera un codice di verifica di 6 cifre
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Invia email di verifica
export async function sendVerificationEmail(
  email: string,
  name: string | null,
  code: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
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
        .code { font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: white; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Lista della Spesa</h1>
        </div>
        <div class="content">
          <h2>Verifica il tuo indirizzo email</h2>
          <p>Ciao ${name || 'utente'},</p>
          <p>Grazie per esserti registrato! Per completare la registrazione, inserisci il seguente codice di verifica:</p>
          <div class="code">${code}</div>
          <p>Il codice è valido per 24 ore.</p>
          <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
        </div>
        <div class="footer">
          <p>Questa è una email automatica da Lista della Spesa</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    email,
    'Verifica il tuo indirizzo email - Lista della Spesa',
    html
  );
}
