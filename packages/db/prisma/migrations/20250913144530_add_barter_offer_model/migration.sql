-- CreateEnum
CREATE TYPE "public"."OfferStatus" AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');

-- CreateTable
CREATE TABLE "public"."BarterOffer" (
    "offer_id" SERIAL NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "offerer_id" INTEGER NOT NULL,
    "offered_listing_id" INTEGER,
    "message" TEXT,
    "status" "public"."OfferStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarterOffer_pkey" PRIMARY KEY ("offer_id")
);

-- CreateIndex
CREATE INDEX "BarterOffer_listing_id_idx" ON "public"."BarterOffer"("listing_id");

-- CreateIndex
CREATE INDEX "BarterOffer_offerer_id_idx" ON "public"."BarterOffer"("offerer_id");

-- CreateIndex
CREATE INDEX "BarterOffer_status_idx" ON "public"."BarterOffer"("status");

-- CreateIndex
CREATE INDEX "BarterOffer_created_at_idx" ON "public"."BarterOffer"("created_at");

-- AddForeignKey
ALTER TABLE "public"."BarterOffer" ADD CONSTRAINT "BarterOffer_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."Listing"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BarterOffer" ADD CONSTRAINT "BarterOffer_offered_listing_id_fkey" FOREIGN KEY ("offered_listing_id") REFERENCES "public"."Listing"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BarterOffer" ADD CONSTRAINT "BarterOffer_offerer_id_fkey" FOREIGN KEY ("offerer_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
