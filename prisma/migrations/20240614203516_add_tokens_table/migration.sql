-- CreateEnum
CREATE TYPE "TokenTypes" AS ENUM ('RESET_PASSWORD', 'AUTH_REFRESH_TOKEN');

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "type" "TokenTypes" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tokens_userId_idx" ON "tokens"("userId");
