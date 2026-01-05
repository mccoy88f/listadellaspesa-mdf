import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// POST /api/notifications/[id]/read - Segna una notifica come letta
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

    const notificationId = parseInt(params.id);

    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        receiverId: user.id,
      },
      data: {
        read: true,
      },
    });

    if (notification.count === 0) {
      return NextResponse.json(
        { error: 'Notifica non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Notifica segnata come letta' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della notifica:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della notifica' },
      { status: 500 }
    );
  }
}
