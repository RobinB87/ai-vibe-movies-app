import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string | Promise<string> } }) {
  const resolvedParams = typeof params === 'string' ? { id: params } : await Promise.resolve(params);
  const { id } = resolvedParams;

  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
  
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });

  return NextResponse.json(movie);
}

export async function PUT(request: Request, { params }: { params: { id: string | Promise<string> } }) {
  const resolvedParams = typeof params === 'string' ? { id: params } : await Promise.resolve(params);
  const { id } = resolvedParams;
  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
  }

  const { name, year, genre, myRating, review, isOnWatchlist } = await request.json();
  try {
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: { name, year, genre, myRating, review, isOnWatchlist },
    });

    return NextResponse.json(updatedMovie);
  } catch (error) {
    return NextResponse.json({ error: 'Movie not found or update failed' }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string | Promise<string> } }) {
  const resolvedParams = typeof params === 'string' ? { id: params } : await Promise.resolve(params);
  const { id } = resolvedParams;
  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
  }

  try {
    await prisma.movie.delete({
      where: { id: movieId },
    });

    return NextResponse.json({ message: 'Movie deleted' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Movie not found or deletion failed' }, { status: 404 });
  }
}
