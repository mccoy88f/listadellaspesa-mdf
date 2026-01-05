import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  
  if (!sessionId) {
    return null;
  }

  // In un'app reale, potresti usare un sistema di sessioni più robusto
  // Per ora, decodifichiamo l'ID utente dal cookie
  try {
    const userId = parseInt(sessionId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function createSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set('session', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
