import { PrismaClient } from '@/app/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const movie = await prisma.movie.findUnique({
    where: { id: Number(id) },
  });
  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }
  return NextResponse.json(movie);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, year, genre, myRating, review } = await request.json();
  try {
    const updatedMovie = await prisma.movie.update({
      where: { id: Number(id) },
      data: { name, year, genre, myRating, review },
    });
    return NextResponse.json(updatedMovie);
  } catch (error) {
    return NextResponse.json({ error: 'Movie not found or update failed' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.movie.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Movie deleted' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Movie not found or deletion failed' }, { status: 404 });
  }
}
