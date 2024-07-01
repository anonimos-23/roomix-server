-- CreateTable
CREATE TABLE "StoreFaqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreFaqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreFaqs_storeId_idx" ON "StoreFaqs"("storeId");
