import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email('Email non valida'),
  code: z.string().length(6, 'Il codice deve essere di 6 cifre'),
});

// POST /api/auth/verify-email - Verifica email con codice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = verifyEmailSchema.parse(body);

    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email già verificata' },
        { status: 400 }
      );
    }

    // Verifica il codice
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Codice di verifica non valido' },
        { status: 400 }
      );
    }

    // Verifica scadenza
    if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
      return NextResponse.json(
        { error: 'Codice di verifica scaduto' },
        { status: 400 }
      );
    }

    // Verifica l'email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    // Crea la sessione
    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Email verificata con successo',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nella verifica email:', error);
    return NextResponse.json(
      { error: 'Errore durante la verifica email' },
      { status: 500 }
    );
  }
}
