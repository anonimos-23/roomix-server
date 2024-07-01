-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "fileId" TEXT;

-- CreateIndex
CREATE INDEX "stores_fileId_idx" ON "stores"("fileId");
