-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "location_text" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "created_at" DROP NOT NULL;
