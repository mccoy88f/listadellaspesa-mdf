import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email-verification';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      );
    }

    // Hash della password
    const hashedPassword = await hashPassword(password);

    // Genera codice di verifica
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 24); // Valido per 24 ore

    // Crea l'utente (non verificato)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        emailVerified: false,
        verificationCode,
        verificationCodeExpires,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Invia email di verifica
    const emailSent = await sendVerificationEmail(email, name || null, verificationCode);
    
    if (!emailSent) {
      console.error('Errore nell\'invio email di verifica');
      // Non fallisce la registrazione, ma avvisa l'utente
    }

    return NextResponse.json(
      { 
        user, 
        message: 'Registrazione completata. Controlla la tua email per il codice di verifica.',
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    );
  }
}
