/*
  Warnings:

  - You are about to drop the column `phone` on the `stores` table. All the data in the column will be lost.
  - Made the column `email` on table `stores` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'Canceled';

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "phone",
ALTER COLUMN "email" SET NOT NULL;
