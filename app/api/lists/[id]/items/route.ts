import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  quantity: z.string().optional(),
});

// POST /api/lists/[id]/items - Aggiunge un oggetto alla lista
export async function POST(
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
    const { name, quantity } = createItemSchema.parse(body);

    // Normalizza il nome per lo storico (lowercase, trim)
    const normalizedName = name.toLowerCase().trim();

    // Crea l'oggetto
    const item = await prisma.shoppingListItem.create({
      data: {
        name,
        quantity: quantity || null,
        listId,
      },
    });

    // Aggiorna o crea lo storico
    await prisma.itemHistory.upsert({
      where: {
        userId_itemName: {
          userId: user.id,
          itemName: normalizedName,
        },
      },
      update: {
        lastAddedAt: new Date(),
        timesAdded: { increment: 1 },
      },
      create: {
        userId: user.id,
        itemName: normalizedName,
        lastAddedAt: new Date(),
        timesAdded: 1,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nell\'aggiunta dell\'oggetto:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiunta dell\'oggetto' },
      { status: 500 }
    );
  }
}
