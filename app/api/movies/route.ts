import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search');
  const showWatchlist = searchParams.get('watchlist');

  const whereClause: any = {};

  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { genre: { contains: searchTerm, mode: 'insensitive' } },
      { review: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (showWatchlist === 'true') {
    whereClause.isOnWatchlist = true;
  }

  const movies = await prisma.movie.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
  });

  return NextResponse.json(movies);
}

export async function POST(request: Request) {
  const { name, year, genre, myRating, review, isOnWatchlist } = await request.json();
  const newMovie = await prisma.movie.create({
    data: {
      name,
      year,
      genre,
      myRating,
      review,
      isOnWatchlist,
    },
  });
  return NextResponse.json(newMovie, { status: 201 });
}
