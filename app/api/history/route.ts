import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/history - Recupera lo storico degli oggetti dell'utente
export async function GET() {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const history = await prisma.itemHistory.findMany({
      where: { userId: user.id },
      orderBy: [
        { lastAddedAt: 'desc' },
        { timesAdded: 'desc' },
      ],
      take: 100, // Limita a 100 oggetti più recenti/frequenti
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Errore nel recupero dello storico:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dello storico' },
      { status: 500 }
    );
  }
}
