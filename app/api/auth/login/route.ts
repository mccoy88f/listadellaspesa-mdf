import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password obbligatoria'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Email o password non valide' },
        { status: 401 }
      );
    }

    // Verifica la password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email o password non valide' },
        { status: 401 }
      );
    }

    // Verifica che l'email sia verificata
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Email non verificata. Controlla la tua email per il codice di verifica.',
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Crea la sessione
    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Login effettuato con successo',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante il login' },
      { status: 500 }
    );
  }
}
