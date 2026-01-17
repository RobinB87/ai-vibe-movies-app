import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/app/api/auth/core/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search");
  const showWatchlist = searchParams.get("watchlist");

  const session = await getUserFromSession();
  const userId = session?.id ? +session.id : null;

  if (!userId) {
    return NextResponse.json([]);
  }

  const whereClause: any = {
    createdByUserId: userId,
  };

  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { genre: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (showWatchlist === "true") {
    whereClause.userMoviePreferences = {
      some: {
        userId,
        isOnWatchlist: true,
      },
    };
  }

  const movies = await prisma.movie.findMany({
    where: whereClause,
    include: {
      userMoviePreferences: {
        where: { userId },
        select: { rating: true, review: true, isOnWatchlist: true },
      },
    },
  });

  // Flatten the response: merge user's preferences into movie object
  const moviesWithPreferences = movies.map((movie) => {
    const { userMoviePreferences, ...movieData } = movie as any;
    const preference = userMoviePreferences?.[0];
    return {
      ...movieData,
      rating: preference?.rating ?? null,
      review: preference?.review ?? null,
      isOnWatchlist: preference?.isOnWatchlist ?? false,
    };
  });

  return NextResponse.json(moviesWithPreferences);
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
