import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const movies = await prisma.movie.findMany();
  return NextResponse.json(movies);
}

export async function POST(request: Request) {
  const { name, year, genre, myRating, review } = await request.json();
  const newMovie = await prisma.movie.create({
    data: {
      name,
      year,
      genre,
      myRating,
      review,
    },
  });
  return NextResponse.json(newMovie, { status: 201 });
}
