-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "rating_count" INTEGER;
