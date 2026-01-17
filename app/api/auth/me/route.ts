import prisma from '@/lib/prisma';
import { getUserFromSession } from '../core/session';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json(user);

  const fullUser = prisma.user.findUnique({ where: { id: +user.id } });
  return NextResponse.json(fullUser);
}
