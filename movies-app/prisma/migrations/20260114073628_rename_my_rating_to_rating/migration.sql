/*
  Warnings:

  - You are about to drop the column `myRating` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "myRating",
ADD COLUMN     "rating" DOUBLE PRECISION;
