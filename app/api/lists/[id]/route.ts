import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// GET /api/lists/[id] - Recupera una singola lista
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const listId = parseInt(params.id);
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [
          { ownerId: user.id },
          { sharedWith: { some: { userId: user.id } } },
        ],
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        owner: {
          select: { id: true, email: true, name: true },
        },
        sharedWith: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Errore nel recupero della lista:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della lista' },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[id] - Aggiorna una lista
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const listId = parseInt(params.id);
    
    // Verifica permessi
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [
          { ownerId: user.id },
          { 
            sharedWith: { 
              some: { 
                userId: user.id,
                canEdit: true,
              },
            },
          },
        ],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista non trovata o permessi insufficienti' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateListSchema.parse(body);

    const updatedList = await prisma.shoppingList.update({
      where: { id: listId },
      data,
      include: {
        items: true,
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nell\'aggiornamento della lista:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della lista' },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id] - Elimina una lista
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const listId = parseInt(params.id);
    
    // Solo il proprietario può eliminare
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        ownerId: user.id,
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista non trovata o permessi insufficienti' },
        { status: 404 }
      );
    }

    await prisma.shoppingList.delete({
      where: { id: listId },
    });

    return NextResponse.json({ message: 'Lista eliminata con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione della lista:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della lista' },
      { status: 500 }
    );
  }
}
