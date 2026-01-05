import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  quantity: z.string().optional(),
  characteristics: z.string().optional(),
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
    const { name, quantity, characteristics } = createItemSchema.parse(body);

    // Normalizza il nome per lo storico (lowercase, trim)
    const normalizedName = name.toLowerCase().trim();

    // Cerca prodotti simili nello storico (contiene o è contenuto)
    const allHistory = await prisma.itemHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        lastAddedAt: 'desc',
      },
    });

    // Trova il prodotto più simile (contiene o è contenuto nel nome)
    const similarItem = allHistory.find(h => {
      const historyName = h.itemName.toLowerCase();
      return historyName.includes(normalizedName) || normalizedName.includes(historyName);
    });

    // Crea l'oggetto
    const item = await prisma.shoppingListItem.create({
      data: {
        name,
        quantity: quantity || null,
        characteristics: characteristics || null,
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

    // Restituisci anche informazioni su prodotti simili trovati
    return NextResponse.json({
      item,
      similarItem: similarItem ? {
        name: similarItem.itemName,
        lastAddedAt: similarItem.lastAddedAt,
      } : null,
    }, { status: 201 });
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
