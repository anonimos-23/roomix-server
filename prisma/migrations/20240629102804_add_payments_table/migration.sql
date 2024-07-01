/*
  Warnings:

  - You are about to drop the column `stripeAccountId` on the `stores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_account_id]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "stores_stripeAccountId_key";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "stripeAccountId",
ADD COLUMN     "stripe_account_id" TEXT;

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payments_storeId_idx" ON "Payments"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "stores_stripe_account_id_key" ON "stores"("stripe_account_id");
