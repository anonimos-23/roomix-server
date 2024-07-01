/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `ShoppingCart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "ShoppingCart_productId_idx" ON "ShoppingCart"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingCart_userId_productId_key" ON "ShoppingCart"("userId", "productId");
