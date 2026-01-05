import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/purchases - Recupera storico acquisti completati
export async function GET(request: Request) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    // Recupera tutte le liste a cui l'utente ha accesso
    const userLists = await prisma.shoppingList.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { sharedWith: { some: { userId: user.id } } },
        ],
        ...(listId ? { id: parseInt(listId) } : {}),
      },
      select: { id: true },
    });

    const listIds = userLists.map(l => l.id);

    // Recupera tutti gli item completati
    const completedItems = await prisma.shoppingListItem.findMany({
      where: {
        listId: { in: listIds },
        completed: true,
        completedAt: { not: null },
      },
      include: {
        list: {
          select: {
            id: true,
            name: true,
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
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Recupera informazioni utenti che hanno completato gli item
    const completedByUserIds = [...new Set(completedItems.map(item => item.completedBy).filter(Boolean))];
    const completedByUsers = await prisma.user.findMany({
      where: { id: { in: completedByUserIds as number[] } },
      select: { id: true, email: true, name: true },
    });
    const completedByUserMap = new Map(completedByUsers.map(u => [u.id, u]));

    // Raggruppa per data
    const groupedByDate: Record<string, typeof completedItems> = {};
    
    completedItems.forEach(item => {
      if (!item.completedAt) return;
      const date = new Date(item.completedAt).toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(item);
    });

    // Determina chi ha completato l'item
    const itemsWithUser = completedItems.map(item => {
      const completedByUser = item.completedBy ? completedByUserMap.get(item.completedBy) : null;

      return {
        ...item,
        completedBy: completedByUser || item.list.owner,
      };
    });

    return NextResponse.json({
      items: itemsWithUser,
      groupedByDate,
      total: completedItems.length,
    });
  } catch (error) {
    console.error('Errore nel recupero degli acquisti:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli acquisti' },
      { status: 500 }
    );
  }
}
