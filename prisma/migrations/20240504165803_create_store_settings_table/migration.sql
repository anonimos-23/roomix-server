/*
  Warnings:

  - You are about to drop the column `banner` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `need_customer_email` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `need_customer_name` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `need_customer_phone` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - Added the required column `country` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "canSellWithoutStock" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "banner",
DROP COLUMN "need_customer_email",
DROP COLUMN "need_customer_name",
DROP COLUMN "need_customer_phone",
ADD COLUMN     "country" TEXT NOT NULL,
ALTER COLUMN "slogan" DROP NOT NULL,
ALTER COLUMN "shipping_address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "storeId" TEXT NOT NULL,
    "needCustomerName" BOOLEAN NOT NULL DEFAULT false,
    "needCustomerPhone" BOOLEAN NOT NULL DEFAULT false,
    "needCustomerEmail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("storeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");
