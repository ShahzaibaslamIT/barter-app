/*
  Warnings:

  - You are about to drop the column `listing_fee` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Listing" DROP COLUMN "listing_fee",
ADD COLUMN     "listing_fee_usd" DECIMAL(10,2);
