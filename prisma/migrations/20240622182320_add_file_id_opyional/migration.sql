/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_fileId_idx";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "fileId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_fileId_key" ON "users"("fileId");
