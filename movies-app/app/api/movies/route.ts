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

  // Only return movies where the current user has a preference
  const whereClause: any = {
    userMoviePreferences: {
      some: { userId },
    },
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
  const { name, year, genre, rating, review, isOnWatchlist } = await request.json();

  const session = await getUserFromSession();
  const userId = session?.id ? +session.id : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const result = await prisma.$transaction(async (tx) => {
    // Find or create the movie (unique by name + year)
    const movie = await tx.movie.upsert({
      where: { name_year: { name, year } },
      update: {}, // Don't update existing movie data
      create: {
        name,
        year,
        genre,
        createdByUserId: userId,
      },
    });

    // Create or update the user's preference for this movie
    await tx.userMoviePreference.upsert({
      where: { userId_movieId: { userId, movieId: movie.id } },
      update: {
        rating: rating ?? null,
        review: review ?? null,
        isOnWatchlist: isOnWatchlist ?? false,
      },
      create: {
        userId,
        movieId: movie.id,
        rating: rating ?? null,
        review: review ?? null,
        isOnWatchlist: isOnWatchlist ?? false,
      },
    });

    return movie;
  });

  // Return the movie with the user's preferences
  return NextResponse.json({
    ...result,
    rating: rating ?? null,
    review: review ?? null,
    isOnWatchlist: isOnWatchlist ?? false,
  }, { status: 201 });
}
