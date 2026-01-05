import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.string().optional(),
  characteristics: z.string().optional(),
  completed: z.boolean().optional(),
});

// PUT /api/lists/[id]/items/[itemId] - Aggiorna un oggetto
export async function PUT(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = parseInt(params.itemId);
    
    // Verifica permessi sulla lista
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
    const data = updateItemSchema.parse(body);

    // Prepara i dati per l'update
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    
    // Gestisci completed e completedAt
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      updateData.completedAt = data.completed ? new Date() : null;
      updateData.completedBy = data.completed ? user.id : null;
    }

    const item = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nell\'aggiornamento dell\'oggetto:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'oggetto' },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id]/items/[itemId] - Elimina un oggetto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = parseInt(params.itemId);
    
    // Verifica permessi sulla lista
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

    await prisma.shoppingListItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Oggetto eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'oggetto:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'oggetto' },
      { status: 500 }
    );
  }
}
