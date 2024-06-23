/*
  Warnings:

  - You are about to drop the column `image` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Made the column `discount` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "FileTypes" AS ENUM ('avatar', 'storeLogo', 'storeBanner', 'storeProduct');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "image",
ALTER COLUMN "stock" SET DEFAULT 0,
ALTER COLUMN "discount" SET NOT NULL,
ALTER COLUMN "discount" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Product_Image" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Product_Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "type" "FileTypes" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_Image_productId_idx" ON "Product_Image"("productId");

-- CreateIndex
CREATE INDEX "Product_Image_fileId_idx" ON "Product_Image"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
