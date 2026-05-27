/*
  Warnings:

  - You are about to drop the column `image_url` on the `Listing` table. All the data in the column will be lost.
  - The `user_type` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Listing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Listing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('service_provider', 'item_owner', 'both');

-- CreateEnum
CREATE TYPE "public"."ListingType" AS ENUM ('item', 'service');

-- DropForeignKey
ALTER TABLE "public"."Listing" DROP CONSTRAINT "Listing_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."Listing" DROP COLUMN "image_url",
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "barter_request" TEXT,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "type" "public"."ListingType" NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "user_type",
ADD COLUMN     "user_type" "public"."UserType" NOT NULL DEFAULT 'both',
ALTER COLUMN "created_at" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Listing_user_id_idx" ON "public"."Listing"("user_id");

-- CreateIndex
CREATE INDEX "Listing_category_idx" ON "public"."Listing"("category");

-- CreateIndex
CREATE INDEX "Listing_created_at_idx" ON "public"."Listing"("created_at");

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
