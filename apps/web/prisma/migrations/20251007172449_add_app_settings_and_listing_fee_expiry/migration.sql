-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "expires_at" TIMESTAMP(6),
ADD COLUMN     "listing_fee" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."AppSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "listing_fee_usd" DECIMAL(10,2) NOT NULL DEFAULT 0.99,
    "listing_expiry_days" INTEGER NOT NULL DEFAULT 30,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_expires_at_idx" ON "public"."Listing"("expires_at");
