import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/app/api/auth/core/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });

  const session = await getUserFromSession();
  const userId = session?.id ? +session.id : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only return the movie if the user has a preference for it
  const movie = await prisma.movie.findFirst({
    where: {
      id: movieId,
      userMoviePreferences: {
        some: { userId },
      },
    },
    include: {
      userMoviePreferences: {
        where: { userId },
        select: { rating: true, review: true, isOnWatchlist: true },
      },
    },
  });
  if (!movie) return NextResponse.json({ error: "Movie not found" }, { status: 404 });

  // Flatten the response: merge user's preferences into movie object
  const { userMoviePreferences, ...movieData } = movie as any;
  const preference = userMoviePreferences?.[0];
  const movieWithPreferences = {
    ...movieData,
    rating: preference?.rating ?? null,
    review: preference?.review ?? null,
    isOnWatchlist: preference?.isOnWatchlist ?? false,
  };

  return NextResponse.json(movieWithPreferences);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const session = await getUserFromSession();
  const userId = session?.id ? +session.id : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow updating preferences, not movie metadata
  const hasPreferenceData = "rating" in body || "review" in body || "isOnWatchlist" in body;

  if (!hasPreferenceData) {
    return NextResponse.json({ error: "No preference data provided" }, { status: 400 });
  }

  try {
    // Verify the user has a preference for this movie
    const existingPreference = await prisma.userMoviePreference.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });

    if (!existingPreference) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const preferenceData: { rating?: number | null; review?: string | null; isOnWatchlist?: boolean } = {};
    if ("rating" in body) preferenceData.rating = body.rating;
    if ("review" in body) preferenceData.review = body.review;
    if ("isOnWatchlist" in body) preferenceData.isOnWatchlist = body.isOnWatchlist;

    await prisma.userMoviePreference.update({
      where: { userId_movieId: { userId, movieId } },
      data: preferenceData,
    });

    // Fetch and return the movie with updated preferences
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        userMoviePreferences: {
          where: { userId },
          select: { rating: true, review: true, isOnWatchlist: true },
        },
      },
    });

    const { userMoviePreferences, ...movieData } = movie as any;
    const preference = userMoviePreferences?.[0];

    return NextResponse.json({
      ...movieData,
      rating: preference?.rating ?? null,
      review: preference?.review ?? null,
      isOnWatchlist: preference?.isOnWatchlist ?? false,
    });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const session = await getUserFromSession();
  const userId = session?.id ? +session.id : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Only delete the user's preference, not the movie itself
    await prisma.userMoviePreference.delete({
      where: { userId_movieId: { userId, movieId } },
    });

    return NextResponse.json({ message: "Movie removed from collection" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Movie not found in your collection" }, { status: 404 });
  }
}
