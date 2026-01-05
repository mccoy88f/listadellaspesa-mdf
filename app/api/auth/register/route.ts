import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
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

    // Crea l'utente
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Crea la sessione
    await createSession(user.id);

    return NextResponse.json(
      { user, message: 'Registrazione completata con successo' },
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
