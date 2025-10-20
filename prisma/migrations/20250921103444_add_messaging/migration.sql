-- DropIndex
DROP INDEX "public"."BarterOffer_status_idx";

-- CreateTable
CREATE TABLE "public"."MessageThread" (
    "thread_id" SERIAL NOT NULL,
    "listing_id" INTEGER,
    "barter_id" INTEGER,
    "user1_id" INTEGER NOT NULL,
    "user2_id" INTEGER NOT NULL,
    "last_message" TEXT,
    "last_message_sender_id" INTEGER,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("thread_id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "message_id" SERIAL NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE INDEX "MessageThread_listing_id_idx" ON "public"."MessageThread"("listing_id");

-- CreateIndex
CREATE INDEX "MessageThread_barter_id_idx" ON "public"."MessageThread"("barter_id");

-- CreateIndex
CREATE INDEX "MessageThread_user1_id_user2_id_idx" ON "public"."MessageThread"("user1_id", "user2_id");

-- CreateIndex
CREATE INDEX "MessageThread_last_message_at_idx" ON "public"."MessageThread"("last_message_at");

-- CreateIndex
CREATE INDEX "Message_thread_id_created_at_idx" ON "public"."Message"("thread_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."Listing"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_barter_id_fkey" FOREIGN KEY ("barter_id") REFERENCES "public"."BarterOffer"("offer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_last_message_sender_id_fkey" FOREIGN KEY ("last_message_sender_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."MessageThread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
