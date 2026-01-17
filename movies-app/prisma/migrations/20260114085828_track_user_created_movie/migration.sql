/*
  Warnings:

  - Made the column `isOnWatchlist` on table `UserMoviePreference` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserMoviePreference" DROP CONSTRAINT "UserMoviePreference_movieId_fkey";

-- DropForeignKey
ALTER TABLE "UserMoviePreference" DROP CONSTRAINT "UserMoviePreference_userId_fkey";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "createdByUserId" INTEGER;

-- AlterTable
ALTER TABLE "UserMoviePreference" ALTER COLUMN "isOnWatchlist" SET NOT NULL,
ALTER COLUMN "isOnWatchlist" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMoviePreference" ADD CONSTRAINT "UserMoviePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMoviePreference" ADD CONSTRAINT "UserMoviePreference_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
