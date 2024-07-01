/*
  Warnings:

  - You are about to drop the `Payments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Payments";

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
