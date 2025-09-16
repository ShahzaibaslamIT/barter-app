-- AlterEnum
ALTER TYPE "public"."OfferStatus" ADD VALUE 'completed';

-- CreateTable
CREATE TABLE "public"."Rating" (
    "rating_id" SERIAL NOT NULL,
    "barter_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "rated_user_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("rating_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_barter_id_rater_id_key" ON "public"."Rating"("barter_id", "rater_id");

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_barter_id_fkey" FOREIGN KEY ("barter_id") REFERENCES "public"."BarterOffer"("offer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_rated_user_id_fkey" FOREIGN KEY ("rated_user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
