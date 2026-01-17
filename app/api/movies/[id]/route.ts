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

  const movie = await prisma.movie.findUnique({
    where: { id: movieId, createdByUserId: userId },
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

  const body = await request.json();
  const dataToUpdate: { [key: string]: any } = {};

  // TODO: fix, this can be less ugly
  if ("name" in body) {
    dataToUpdate.name = body.name;
  }
  if ("year" in body) {
    dataToUpdate.year = body.year;
  }
  if ("genre" in body) {
    dataToUpdate.genre = body.genre;
  }
  if ("isOnWatchlist" in body) {
    dataToUpdate.isOnWatchlist = body.isOnWatchlist;
  }
  if ("rating" in body) {
    dataToUpdate.rating = body.rating;
  }
  if ("review" in body) {
    dataToUpdate.review = body.review;
  }

  const hasPreferenceData = "rating" in body || "review" in body || "isOnWatchlist" in body;
  const userId = body.createdByUserId ? +body.createdByUserId : null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedMovie = await tx.movie.update({
        where: { id: movieId },
        data: dataToUpdate,
      });

      if (hasPreferenceData && userId) {
        const preferenceData: { rating?: number | null; review?: string | null; isOnWatchlist?: boolean } = {};
        if ("rating" in body) preferenceData.rating = body.rating;
        if ("review" in body) preferenceData.review = body.review;
        if ("isOnWatchlist" in body) preferenceData.isOnWatchlist = body.isOnWatchlist;

        await tx.userMoviePreference.upsert({
          where: {
            userId_movieId: { userId, movieId },
          },
          update: preferenceData,
          create: {
            userId,
            movieId,
            rating: body.rating ?? null,
            review: body.review ?? null,
            isOnWatchlist: body.isOnWatchlist ?? false,
          },
        });
      }

      return updatedMovie;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Movie not found or update failed" }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = parseInt(String(id), 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    await prisma.movie.delete({
      where: { id: movieId },
    });

    return NextResponse.json({ message: "Movie deleted" }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Movie not found or deletion failed" }, { status: 404 });
  }
}
