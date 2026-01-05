import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  listId: z.number().int(),
  message: z.string().optional(),
});

// POST /api/notifications/send - Invia notifica "sto andando a fare la spesa"
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
    const { listId, message } = sendNotificationSchema.parse(body);

    // Verifica che l'utente abbia accesso alla lista
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [
          { ownerId: user.id },
          { sharedWith: { some: { userId: user.id } } },
        ],
      },
      include: {
        sharedWith: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista non trovata' },
        { status: 404 }
      );
    }

    // Raccogli tutti gli utenti con cui condividere (escluso il mittente)
    const recipients = [
      ...list.sharedWith.map(sl => sl.user),
      ...(list.ownerId !== user.id ? [list.owner] : []),
    ].filter(u => u.id !== user.id);

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'Nessun destinatario trovato' },
        { status: 400 }
      );
    }

    // Crea notifiche per tutti i destinatari
    const notifications = await Promise.all(
      recipients.map(recipient =>
        prisma.notification.create({
          data: {
            type: 'shopping_alert',
            title: 'Sto andando a fare la spesa!',
            message: message || `${user.name || user.email} sta andando a fare la spesa. Serve qualcosa dalla lista "${list.name}"?`,
            senderId: user.id,
            receiverId: recipient.id,
            listId,
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Notifiche inviate con successo',
      count: notifications.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Errore nell\'invio delle notifiche:', error);
    return NextResponse.json(
      { error: 'Errore nell\'invio delle notifiche' },
      { status: 500 }
    );
  }
}
