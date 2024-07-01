/*
  Warnings:

  - Added the required column `stripeAccountCreatedAt` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "stripeAccountCreatedAt" TIMESTAMP(3) NOT NULL;
