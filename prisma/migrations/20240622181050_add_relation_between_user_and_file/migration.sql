/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - Added the required column `fileId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
ADD COLUMN     "fileId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "users_fileId_idx" ON "users"("fileId");
