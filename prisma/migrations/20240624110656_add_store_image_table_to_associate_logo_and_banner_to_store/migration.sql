/*
  Warnings:

  - You are about to drop the column `fileId` on the `stores` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "stores_fileId_idx";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "fileId";

-- CreateTable
CREATE TABLE "Store_Image" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Store_Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Store_Image_storeId_idx" ON "Store_Image"("storeId");

-- CreateIndex
CREATE INDEX "Store_Image_fileId_idx" ON "Store_Image"("fileId");
