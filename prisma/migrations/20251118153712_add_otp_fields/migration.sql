-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expires" TIMESTAMP(3);
