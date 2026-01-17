import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search");
  const showWatchlist = searchParams.get("watchlist");

  const whereClause: any = {};

  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { genre: { contains: searchTerm, mode: "insensitive" } },
      { review: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (showWatchlist === "true") {
    whereClause.isOnWatchlist = true;
  }

  const movies = await prisma.movie.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
  });

  return NextResponse.json(movies);
}

export async function POST(request: Request) {
  const { name, year, genre, rating, review, isOnWatchlist, createdByUserId } = await request.json();
  if (!createdByUserId) return NextResponse.json({ error: "Created By User ID is required" }, { status: 400 });

  const userId = +createdByUserId;
  const hasPreferenceData = rating !== undefined || review !== undefined || isOnWatchlist !== undefined;

  const result = await prisma.$transaction(async (tx) => {
    const newMovie = await tx.movie.create({
      data: {
        name,
        year,
        genre,
        rating,
        review,
        isOnWatchlist,
        createdByUserId: userId,
      },
    });

    if (hasPreferenceData) {
      await tx.userMoviePreference.create({
        data: {
          userId,
          movieId: newMovie.id,
          rating: rating ?? null,
          review: review ?? null,
          isOnWatchlist: isOnWatchlist ?? false,
        },
      });
    }

    return newMovie;
  });

  return NextResponse.json(result, { status: 201 });
}
