import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/notifications - Recupera tutte le notifiche dell'utente
export async function GET() {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { receiverId: user.id },
      include: {
        sender: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limita a 50 notifiche più recenti
    });

    const unreadCount = await prisma.notification.count({
      where: {
        receiverId: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle notifiche' },
      { status: 500 }
    );
  }
}
