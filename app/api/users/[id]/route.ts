import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Recupera un singolo utente
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'utente' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Aggiorna un utente
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { email, name } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'utente' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Elimina un utente
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Utente eliminato con successo' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'utente' },
      { status: 500 }
    );
  }
}
