/*
  Warnings:

  - A unique constraint covering the columns `[name,year]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Movie_name_key";

-- CreateTable
CREATE TABLE "UserMoviePreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION,
    "review" TEXT,
    "isOnWatchlist" BOOLEAN,

    CONSTRAINT "UserMoviePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMoviePreference_userId_movieId_key" ON "UserMoviePreference"("userId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_name_year_key" ON "Movie"("name", "year");

-- AddForeignKey
ALTER TABLE "UserMoviePreference" ADD CONSTRAINT "UserMoviePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMoviePreference" ADD CONSTRAINT "UserMoviePreference_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
