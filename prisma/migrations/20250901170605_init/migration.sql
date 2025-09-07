/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Listing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Listing" DROP CONSTRAINT "Listing_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "content",
ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "public"."Listing";
