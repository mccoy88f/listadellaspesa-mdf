import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - Recupera tutti gli utenti
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    );
  }
}

// POST /api/users - Crea un nuovo utente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email è obbligatoria' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'utente' },
      { status: 500 }
    );
  }
}
