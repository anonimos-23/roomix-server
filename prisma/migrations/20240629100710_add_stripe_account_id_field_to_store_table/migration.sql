/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `stores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeAccountId` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "stripeAccountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stores_stripeAccountId_key" ON "stores"("stripeAccountId");
