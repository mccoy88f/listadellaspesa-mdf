import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const shareListSchema = z.object({
  email: z.string().email('Email non valida'),
  canEdit: z.boolean().default(true),
});

// POST /api/lists/[id]/share - Condividi una lista con un utente
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
    
    // Verifica che l'utente sia il proprietario
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

    const body = await request.json();
    const { email, canEdit } = shareListSchema.parse(body);

    // Trova l'utente con cui condividere
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Non puoi condividere la lista con te stesso' },
        { status: 400 }
      );
    }

    // Verifica se già condivisa
    const existingShare = await prisma.sharedList.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: targetUser.id,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json(
        { error: 'Lista già condivisa con questo utente' },
        { status: 400 }
      );
    }

    // Condividi la lista
    const sharedList = await prisma.sharedList.create({
      data: {
        listId,
        userId: targetUser.id,
        canEdit: canEdit ?? true,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    // Crea notifica per l'utente con cui è stata condivisa (browser + email)
    await prisma.notification.create({
      data: {
        type: 'list_shared',
        title: 'Lista condivisa',
        message: `${user.name || user.email} ha condiviso la lista "${list.name}" con te`,
        senderId: user.id,
        receiverId: targetUser.id,
        listId,
      },
    });

    // Invia anche email
    try {
      const { sendNotificationEmail } = await import('@/lib/email');
      await sendNotificationEmail(
        targetUser.email,
        targetUser.name,
        user.name || user.email,
        'Lista condivisa',
        `${user.name || user.email} ha condiviso la lista "${list.name}" con te`,
        list.name,
        listId
      );
    } catch (error) {
      console.error(`Errore invio email a ${targetUser.email}:`, error);
    }

    return NextResponse.json(sharedList, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nella condivisione della lista:', error);
    return NextResponse.json(
      { error: 'Errore nella condivisione della lista' },
      { status: 500 }
    );
  }
}
