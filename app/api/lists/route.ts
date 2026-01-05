import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const createListSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  description: z.string().optional(),
  store: z.string().optional(),
});

// GET /api/lists - Recupera tutte le liste dell'utente
export async function GET() {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Recupera liste possedute e condivise
    const ownedLists = await prisma.shoppingList.findMany({
      where: { ownerId: user.id },
      include: {
        items: true,
        sharedWith: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const sharedLists = await prisma.sharedList.findMany({
      where: { userId: user.id },
      include: {
        list: {
          include: {
            items: true,
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      owned: ownedLists,
      shared: sharedLists.map(sl => sl.list),
    });
  } catch (error) {
    console.error('Errore nel recupero delle liste:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle liste' },
      { status: 500 }
    );
  }
}

// POST /api/lists - Crea una nuova lista
export async function POST(request: Request) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, store } = createListSchema.parse(body);

    const list = await prisma.shoppingList.create({
      data: {
        name,
        description: description || null,
        store: store || null,
        ownerId: user.id,
      },
      include: {
        items: true,
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nella creazione della lista:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della lista' },
      { status: 500 }
    );
  }
}
