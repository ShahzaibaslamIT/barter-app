/*
  Warnings:

  - A unique constraint covering the columns `[barter_id]` on the table `MessageThread` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_barter_id_key" ON "public"."MessageThread"("barter_id");
